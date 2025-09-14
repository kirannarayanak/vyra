// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import "../VyraToken.sol";

/**
 * @title VyraBridge
 * @dev L1↔L2 bridge contract for VYR token transfers
 * 
 * Features:
 * - Secure token bridging between L1 and L2
 * - Multi-signature validation
 * - Emergency pause functionality
 * - Fee management
 * - Deposit and withdrawal tracking
 */
contract VyraBridge is AccessControl, ReentrancyGuard, Pausable {
    using ECDSA for bytes32;
    using SafeERC20 for IERC20;

    // Roles
    bytes32 public constant RELAYER_ROLE = keccak256("RELAYER_ROLE");
    bytes32 public constant VALIDATOR_ROLE = keccak256("VALIDATOR_ROLE");
    bytes32 public constant EMERGENCY_ROLE = keccak256("EMERGENCY_ROLE");

    // Configuration
    VyraToken public immutable vyraToken;
    address public immutable l2Bridge;
    uint256 public constant MIN_SIGNATURES = 2; // Minimum signatures required
    uint256 public constant FEE_DENOMINATOR = 10000;
    
    // Bridge state
    mapping(bytes32 => bool) public processedDeposits;
    mapping(bytes32 => bool) public processedWithdrawals;
    mapping(address => uint256) public pendingWithdrawals;
    
    // Fee configuration
    uint256 public bridgeFeeRate = 10; // 0.1% bridge fee
    address public feeTreasury;
    
    // Validators
    address[] public validators;
    mapping(address => bool) public isValidator;
    
    // Statistics
    uint256 public totalDeposits;
    uint256 public totalWithdrawals;
    uint256 public totalFees;

    // Events
    event DepositInitiated(address indexed user, uint256 amount, bytes32 indexed depositId);
    event WithdrawalInitiated(address indexed user, uint256 amount, bytes32 indexed withdrawalId);
    event DepositProcessed(bytes32 indexed depositId, address indexed user, uint256 amount);
    event WithdrawalProcessed(bytes32 indexed withdrawalId, address indexed user, uint256 amount);
    event ValidatorAdded(address indexed validator);
    event ValidatorRemoved(address indexed validator);
    event BridgeFeeUpdated(uint256 oldRate, uint256 newRate);
    event FeeTreasuryUpdated(address oldTreasury, address newTreasury);

    // Errors
    error InvalidValidator();
    error InvalidSignature();
    error DepositAlreadyProcessed();
    error WithdrawalAlreadyProcessed();
    error InsufficientBalance();
    error InvalidAmount();
    error InvalidDepositId();
    error InvalidWithdrawalId();
    error InsufficientSignatures();
    error DuplicateSignature();

    struct DepositData {
        address user;
        uint256 amount;
        uint256 timestamp;
        bool processed;
    }

    struct WithdrawalData {
        address user;
        uint256 amount;
        uint256 timestamp;
        bool processed;
    }

    constructor(
        address _vyraToken,
        address _l2Bridge,
        address _feeTreasury,
        address _admin
    ) {
        if (_vyraToken == address(0) || _l2Bridge == address(0) || _feeTreasury == address(0) || _admin == address(0)) {
            revert("Invalid address");
        }
        
        vyraToken = VyraToken(_vyraToken);
        l2Bridge = _l2Bridge;
        feeTreasury = _feeTreasury;
        
        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(RELAYER_ROLE, _admin);
        _grantRole(VALIDATOR_ROLE, _admin);
        _grantRole(EMERGENCY_ROLE, _admin);
        
        // Add admin as initial validator
        validators.push(_admin);
        isValidator[_admin] = true;
    }

    /**
     * @dev Initiate a deposit to L2
     * @param amount Amount of VYR to deposit
     * @return depositId Unique deposit identifier
     */
    function deposit(uint256 amount) external nonReentrant whenNotPaused returns (bytes32 depositId) {
        if (amount == 0) revert InvalidAmount();
        if (vyraToken.balanceOf(msg.sender) < amount) revert InsufficientBalance();
        
        // Calculate bridge fee
        uint256 fee = (amount * bridgeFeeRate) / FEE_DENOMINATOR;
        
        // Create deposit ID
        depositId = keccak256(abi.encodePacked(
            msg.sender,
            amount,
            block.timestamp,
            block.number
        ));
        
        // Check if deposit already exists
        if (processedDeposits[depositId]) revert DepositAlreadyProcessed();
        
        // Transfer tokens to bridge
        vyraToken.transferFrom(msg.sender, address(this), amount);
        
        // Transfer fee to treasury
        if (fee > 0) {
            vyraToken.transfer(feeTreasury, fee);
            totalFees += fee;
        }
        
        // Update statistics
        totalDeposits += amount;
        
        emit DepositInitiated(msg.sender, amount, depositId);
    }

    /**
     * @dev Process a deposit (called by relayers)
     * @param depositId Deposit identifier
     * @param signatures Array of validator signatures
     */
    function processDeposit(
        bytes32 depositId,
        bytes[] calldata signatures
    ) external onlyRole(RELAYER_ROLE) {
        if (processedDeposits[depositId]) revert DepositAlreadyProcessed();
        if (signatures.length < MIN_SIGNATURES) revert InsufficientSignatures();
        
        // Verify signatures
        _verifySignatures(depositId, signatures);
        
        // Mark as processed
        processedDeposits[depositId] = true;
        
        emit DepositProcessed(depositId, msg.sender, 0); // Amount would be stored in mapping
    }

    /**
     * @dev Initiate a withdrawal from L2
     * @param amount Amount of VYR to withdraw
     * @param l2TxHash L2 transaction hash
     * @param signatures Array of validator signatures
     * @return withdrawalId Unique withdrawal identifier
     */
    function initiateWithdrawal(
        uint256 amount,
        bytes32 l2TxHash,
        bytes[] calldata signatures
    ) external onlyRole(RELAYER_ROLE) nonReentrant returns (bytes32 withdrawalId) {
        if (amount == 0) revert InvalidAmount();
        if (vyraToken.balanceOf(address(this)) < amount) revert InsufficientBalance();
        
        // Create withdrawal ID
        withdrawalId = keccak256(abi.encodePacked(
            msg.sender,
            amount,
            l2TxHash,
            block.timestamp
        ));
        
        // Check if withdrawal already exists
        if (processedWithdrawals[withdrawalId]) revert WithdrawalAlreadyProcessed();
        
        // Verify signatures
        _verifySignatures(withdrawalId, signatures);
        
        // Mark as processed
        processedWithdrawals[withdrawalId] = true;
        
        // Transfer tokens to user
        vyraToken.transfer(msg.sender, amount);
        
        // Update statistics
        totalWithdrawals += amount;
        
        emit WithdrawalProcessed(withdrawalId, msg.sender, amount);
    }

    /**
     * @dev Add a new validator
     * @param validator Validator address
     */
    function addValidator(address validator) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (validator == address(0)) revert InvalidValidator();
        if (isValidator[validator]) revert InvalidValidator();
        
        validators.push(validator);
        isValidator[validator] = true;
        
        emit ValidatorAdded(validator);
    }

    /**
     * @dev Remove a validator
     * @param validator Validator address
     */
    function removeValidator(address validator) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (!isValidator[validator]) revert InvalidValidator();
        
        isValidator[validator] = false;
        
        // Remove from validators array
        for (uint256 i = 0; i < validators.length; i++) {
            if (validators[i] == validator) {
                validators[i] = validators[validators.length - 1];
                validators.pop();
                break;
            }
        }
        
        emit ValidatorRemoved(validator);
    }

    /**
     * @dev Set bridge fee rate
     * @param newRate New fee rate in basis points
     */
    function setBridgeFeeRate(uint256 newRate) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (newRate > 1000) revert("Fee too high"); // Max 10%
        uint256 oldRate = bridgeFeeRate;
        bridgeFeeRate = newRate;
        emit BridgeFeeUpdated(oldRate, newRate);
    }

    /**
     * @dev Set fee treasury address
     * @param newTreasury New treasury address
     */
    function setFeeTreasury(address newTreasury) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (newTreasury == address(0)) revert("Invalid treasury");
        address oldTreasury = feeTreasury;
        feeTreasury = newTreasury;
        emit FeeTreasuryUpdated(oldTreasury, newTreasury);
    }

    /**
     * @dev Pause bridge operations
     */
    function pause() external onlyRole(EMERGENCY_ROLE) {
        _pause();
    }

    /**
     * @dev Unpause bridge operations
     */
    function unpause() external onlyRole(EMERGENCY_ROLE) {
        _unpause();
    }

    /**
     * @dev Verify validator signatures
     * @param dataHash Hash of data being signed
     * @param signatures Array of signatures
     */
    function _verifySignatures(bytes32 dataHash, bytes[] calldata signatures) internal view {
        bytes32 ethSignedMessageHash = MessageHashUtils.toEthSignedMessageHash(dataHash);
        address[] memory signers = new address[](signatures.length);
        
        for (uint256 i = 0; i < signatures.length; i++) {
            address signer = ECDSA.recover(ethSignedMessageHash, signatures[i]);
            
            if (!isValidator[signer]) revert InvalidSignature();
            
            // Check for duplicate signatures
            for (uint256 j = 0; j < i; j++) {
                if (signers[j] == signer) revert DuplicateSignature();
            }
            
            signers[i] = signer;
        }
    }

    /**
     * @dev Get bridge statistics
     * @return _totalDeposits Total deposit volume
     * @return _totalWithdrawals Total withdrawal volume
     * @return _totalFees Total fees collected
     * @return _validatorCount Number of validators
     */
    function getBridgeStats() external view returns (
        uint256 _totalDeposits,
        uint256 _totalWithdrawals,
        uint256 _totalFees,
        uint256 _validatorCount
    ) {
        _totalDeposits = totalDeposits;
        _totalWithdrawals = totalWithdrawals;
        _totalFees = totalFees;
        _validatorCount = validators.length;
    }

    /**
     * @dev Get validator list
     * @return List of validator addresses
     */
    function getValidators() external view returns (address[] memory) {
        return validators;
    }

    /**
     * @dev Emergency function to recover tokens
     * @param token Token address
     * @param amount Amount to recover
     */
    function recoverToken(address token, uint256 amount) external onlyRole(EMERGENCY_ROLE) {
        IERC20(token).transfer(msg.sender, amount);
    }
}
