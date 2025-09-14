// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "../VyraToken.sol";

/**
 * @title VyraPOS
 * @dev Point of Sale contract for merchant payments and split payouts
 * 
 * Features:
 * - QR code payment processing
 * - Split payments to multiple recipients
 * - Invoice management
 * - Refund processing
 * - Fee management
 * - Payment verification
 */
contract VyraPOS is AccessControl, ReentrancyGuard, Pausable {
    using ECDSA for bytes32;
    using SafeERC20 for IERC20;

    // Roles
    bytes32 public constant MERCHANT_ROLE = keccak256("MERCHANT_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant REFUND_ROLE = keccak256("REFUND_ROLE");

    // Configuration
    VyraToken public immutable vyraToken;
    uint256 public constant FEE_DENOMINATOR = 10000; // 0.01% precision
    
    // Fee configuration
    uint256 public merchantFeeRate = 25; // 0.25% merchant fee
    uint256 public platformFeeRate = 5; // 0.05% platform fee
    address public platformTreasury;
    
    // Invoice management
    mapping(bytes32 => Invoice) public invoices;
    mapping(address => uint256) public merchantNonces;
    
    // Payment tracking
    mapping(bytes32 => Payment) public payments;
    mapping(address => uint256) public merchantEarnings;
    mapping(address => uint256) public platformEarnings;
    
    // Statistics
    uint256 public totalVolume;
    uint256 public totalTransactions;
    uint256 public totalFees;

    struct Invoice {
        address merchant;
        uint256 amount;
        string description;
        uint256 expiry;
        bool paid;
        bytes32 paymentId;
    }

    struct Payment {
        address customer;
        address merchant;
        uint256 amount;
        uint256 merchantFee;
        uint256 platformFee;
        uint256 timestamp;
        bool refunded;
        bytes32 invoiceId;
    }

    struct SplitRecipient {
        address recipient;
        uint256 percentage; // in basis points
    }

    // Events
    event InvoiceCreated(bytes32 indexed invoiceId, address indexed merchant, uint256 amount);
    event PaymentProcessed(bytes32 indexed paymentId, bytes32 indexed invoiceId, address indexed customer, uint256 amount);
    event PaymentRefunded(bytes32 indexed paymentId, uint256 refundAmount);
    event SplitPaymentProcessed(bytes32 indexed paymentId, address[] recipients, uint256[] amounts);
    event MerchantFeeUpdated(uint256 oldRate, uint256 newRate);
    event PlatformFeeUpdated(uint256 oldRate, uint256 newRate);
    event PlatformTreasuryUpdated(address oldTreasury, address newTreasury);

    // Errors
    error InvoiceNotFound();
    error InvoiceExpired();
    error InvoiceAlreadyPaid();
    error PaymentNotFound();
    error PaymentAlreadyRefunded();
    error InvalidAmount();
    error InvalidSignature();
    error InvalidRecipients();
    error InvalidPercentage();
    error UnauthorizedMerchant();
    error InsufficientBalance();

    constructor(
        address _vyraToken,
        address _platformTreasury,
        address _admin
    ) {
        if (_vyraToken == address(0) || _platformTreasury == address(0) || _admin == address(0)) {
            revert("Invalid address");
        }
        
        vyraToken = VyraToken(_vyraToken);
        platformTreasury = _platformTreasury;
        
        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(ADMIN_ROLE, _admin);
        _grantRole(REFUND_ROLE, _admin);
    }

    /**
     * @dev Create a payment invoice
     * @param amount Payment amount in VYR
     * @param description Payment description
     * @param expiry Unix timestamp when invoice expires
     * @param signature Merchant signature for verification
     * @return invoiceId Unique invoice identifier
     */
    function createInvoice(
        uint256 amount,
        string calldata description,
        uint256 expiry,
        bytes calldata signature
    ) external returns (bytes32 invoiceId) {
        if (amount == 0) revert InvalidAmount();
        if (expiry <= block.timestamp) revert("Invalid expiry");
        
        // Verify merchant signature
        bytes32 messageHash = keccak256(abi.encodePacked(
            msg.sender,
            amount,
            keccak256(bytes(description)),
            expiry,
            merchantNonces[msg.sender],
            block.chainid
        ));
        bytes32 ethSignedMessageHash = MessageHashUtils.toEthSignedMessageHash(messageHash);
        address signer = ECDSA.recover(ethSignedMessageHash, signature);
        
        if (signer != msg.sender) revert InvalidSignature();
        
        // Increment merchant nonce
        merchantNonces[msg.sender]++;
        
        // Create invoice
        invoiceId = keccak256(abi.encodePacked(
            msg.sender,
            amount,
            keccak256(bytes(description)),
            expiry,
            merchantNonces[msg.sender] - 1,
            block.timestamp
        ));
        
        invoices[invoiceId] = Invoice({
            merchant: msg.sender,
            amount: amount,
            description: description,
            expiry: expiry,
            paid: false,
            paymentId: bytes32(0)
        });
        
        emit InvoiceCreated(invoiceId, msg.sender, amount);
    }

    /**
     * @dev Process a payment for an invoice
     * @param invoiceId Invoice identifier
     * @param customer Customer address
     * @param signature Customer signature authorizing payment
     * @return paymentId Unique payment identifier
     */
    function processPayment(
        bytes32 invoiceId,
        address customer,
        bytes calldata signature
    ) external nonReentrant whenNotPaused returns (bytes32 paymentId) {
        Invoice storage invoice = invoices[invoiceId];
        if (invoice.merchant == address(0)) revert InvoiceNotFound();
        if (invoice.paid) revert InvoiceAlreadyPaid();
        if (invoice.expiry <= block.timestamp) revert InvoiceExpired();
        
        // Verify customer signature
        bytes32 messageHash = keccak256(abi.encodePacked(
            customer,
            invoiceId,
            invoice.amount,
            block.chainid
        ));
        bytes32 ethSignedMessageHash = MessageHashUtils.toEthSignedMessageHash(messageHash);
        address signer = ECDSA.recover(ethSignedMessageHash, signature);
        
        if (signer != customer) revert InvalidSignature();
        
        // Check customer balance
        if (vyraToken.balanceOf(customer) < invoice.amount) revert InsufficientBalance();
        
        // Calculate fees
        uint256 merchantFee = (invoice.amount * merchantFeeRate) / FEE_DENOMINATOR;
        uint256 platformFee = (invoice.amount * platformFeeRate) / FEE_DENOMINATOR;
        uint256 netAmount = invoice.amount - merchantFee - platformFee;
        
        // Create payment record
        paymentId = keccak256(abi.encodePacked(
            invoiceId,
            customer,
            invoice.amount,
            block.timestamp
        ));
        
        payments[paymentId] = Payment({
            customer: customer,
            merchant: invoice.merchant,
            amount: invoice.amount,
            merchantFee: merchantFee,
            platformFee: platformFee,
            timestamp: block.timestamp,
            refunded: false,
            invoiceId: invoiceId
        });
        
        // Mark invoice as paid
        invoice.paid = true;
        invoice.paymentId = paymentId;
        
        // Transfer tokens
        vyraToken.transferFrom(customer, invoice.merchant, netAmount);
        vyraToken.transferFrom(customer, address(this), merchantFee);
        vyraToken.transferFrom(customer, platformTreasury, platformFee);
        
        // Update earnings
        merchantEarnings[invoice.merchant] += netAmount;
        platformEarnings[platformTreasury] += platformFee;
        
        // Update statistics
        totalVolume += invoice.amount;
        totalTransactions++;
        totalFees += merchantFee + platformFee;
        
        emit PaymentProcessed(paymentId, invoiceId, customer, invoice.amount);
    }

    /**
     * @dev Process a split payment to multiple recipients
     * @param recipients Array of recipient addresses
     * @param percentages Array of percentage allocations (in basis points)
     * @param totalAmount Total payment amount
     * @param customer Customer address
     * @param signature Customer signature
     * @return paymentId Unique payment identifier
     */
    function processSplitPayment(
        address[] calldata recipients,
        uint256[] calldata percentages,
        uint256 totalAmount,
        address customer,
        bytes calldata signature
    ) external nonReentrant whenNotPaused returns (bytes32 paymentId) {
        if (recipients.length == 0 || recipients.length != percentages.length) {
            revert InvalidRecipients();
        }
        if (totalAmount == 0) revert InvalidAmount();
        
        // Verify percentages sum to 100%
        uint256 totalPercentage = 0;
        for (uint256 i = 0; i < percentages.length; i++) {
            totalPercentage += percentages[i];
        }
        if (totalPercentage != 10000) revert InvalidPercentage(); // 100% in basis points
        
        // Verify customer signature
        bytes32 messageHash = keccak256(abi.encodePacked(
            customer,
            recipients,
            percentages,
            totalAmount,
            block.chainid
        ));
        bytes32 ethSignedMessageHash = MessageHashUtils.toEthSignedMessageHash(messageHash);
        address signer = ECDSA.recover(ethSignedMessageHash, signature);
        
        if (signer != customer) revert InvalidSignature();
        
        // Check customer balance
        if (vyraToken.balanceOf(customer) < totalAmount) revert InsufficientBalance();
        
        // Create payment record
        paymentId = keccak256(abi.encodePacked(
            customer,
            recipients,
            totalAmount,
            block.timestamp
        ));
        
        // Calculate and distribute payments
        uint256[] memory amounts = new uint256[](recipients.length);
        for (uint256 i = 0; i < recipients.length; i++) {
            amounts[i] = (totalAmount * percentages[i]) / 10000;
            vyraToken.transferFrom(customer, recipients[i], amounts[i]);
        }
        
        // Update statistics
        totalVolume += totalAmount;
        totalTransactions++;
        
        emit SplitPaymentProcessed(paymentId, recipients, amounts);
    }

    /**
     * @dev Refund a payment
     * @param paymentId Payment identifier
     * @param refundAmount Amount to refund
     */
    function refundPayment(
        bytes32 paymentId,
        uint256 refundAmount
    ) external onlyRole(REFUND_ROLE) nonReentrant {
        Payment storage payment = payments[paymentId];
        if (payment.customer == address(0)) revert PaymentNotFound();
        if (payment.refunded) revert PaymentAlreadyRefunded();
        if (refundAmount > payment.amount) revert InvalidAmount();
        
        // Mark as refunded
        payment.refunded = true;
        
        // Transfer refund
        vyraToken.transfer(payment.customer, refundAmount);
        
        emit PaymentRefunded(paymentId, refundAmount);
    }

    /**
     * @dev Set merchant fee rate
     * @param newRate New fee rate in basis points
     */
    function setMerchantFeeRate(uint256 newRate) external onlyRole(ADMIN_ROLE) {
        if (newRate > 1000) revert("Fee too high"); // Max 10%
        uint256 oldRate = merchantFeeRate;
        merchantFeeRate = newRate;
        emit MerchantFeeUpdated(oldRate, newRate);
    }

    /**
     * @dev Set platform fee rate
     * @param newRate New fee rate in basis points
     */
    function setPlatformFeeRate(uint256 newRate) external onlyRole(ADMIN_ROLE) {
        if (newRate > 1000) revert("Fee too high"); // Max 10%
        uint256 oldRate = platformFeeRate;
        platformFeeRate = newRate;
        emit PlatformFeeUpdated(oldRate, newRate);
    }

    /**
     * @dev Set platform treasury address
     * @param newTreasury New treasury address
     */
    function setPlatformTreasury(address newTreasury) external onlyRole(ADMIN_ROLE) {
        if (newTreasury == address(0)) revert("Invalid treasury");
        address oldTreasury = platformTreasury;
        platformTreasury = newTreasury;
        emit PlatformTreasuryUpdated(oldTreasury, newTreasury);
    }

    /**
     * @dev Pause contract
     */
    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }

    /**
     * @dev Unpause contract
     */
    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }

    /**
     * @dev Get merchant statistics
     * @param merchant Merchant address
     * @return earnings Total earnings
     * @return transactionCount Number of transactions
     */
    function getMerchantStats(address merchant) external view returns (uint256 earnings, uint256 transactionCount) {
        earnings = merchantEarnings[merchant];
        // Note: transactionCount would require additional tracking
        transactionCount = 0; // Placeholder
    }

    /**
     * @dev Emergency function to recover tokens
     * @param token Token address
     * @param amount Amount to recover
     */
    function recoverToken(address token, uint256 amount) external onlyRole(DEFAULT_ADMIN_ROLE) {
        IERC20(token).transfer(msg.sender, amount);
    }
}
