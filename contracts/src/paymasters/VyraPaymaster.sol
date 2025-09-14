// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/MessageHashUtils.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "../VyraToken.sol";

/**
 * @title VyraPaymaster
 * @dev Paymaster contract for gas sponsorship using VYR tokens
 * 
 * Features:
 * - Gas sponsorship for first-time users
 * - Merchant fee sponsorship
 * - Session key management
 * - Rate limiting and anti-spam
 * - VYR token fee payment
 */
contract VyraPaymaster is AccessControl, ReentrancyGuard {
    using ECDSA for bytes32;
    using SafeERC20 for IERC20;

    // Roles
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant SPONSOR_ROLE = keccak256("SPONSOR_ROLE");
    bytes32 public constant RATE_LIMITER_ROLE = keccak256("RATE_LIMITER_ROLE");

    // Configuration
    VyraToken public immutable vyraToken;
    address public immutable entryPoint;
    
    // Fee configuration
    uint256 public gasPriceBuffer = 120; // 20% buffer (120/100)
    uint256 public vyraTokenPrice = 1e18; // 1 VYR = 1 USD (example)
    uint256 public minSponsorBalance = 1000 * 1e18; // 1000 VYR minimum
    
    // Session key management
    mapping(address => SessionKey) public sessionKeys;
    mapping(address => uint256) public userSponsorBalance;
    mapping(address => uint256) public lastSponsorTime;
    
    // Rate limiting
    mapping(address => uint256) public dailySponsorCount;
    mapping(address => uint256) public lastResetDay;
    uint256 public maxDailySponsors = 100;
    
    // Statistics
    uint256 public totalSponsoredGas;
    uint256 public totalVyrSpent;
    uint256 public totalSponsorships;

    struct SessionKey {
        address key;
        uint256 nonce;
        uint256 expiry;
        bool active;
    }

    // Events
    event SessionKeyCreated(address indexed user, address indexed key, uint256 expiry);
    event SessionKeyRevoked(address indexed user, address indexed key);
    event GasSponsored(address indexed user, uint256 gasUsed, uint256 vyrSpent);
    event SponsorBalanceUpdated(address indexed user, uint256 newBalance);
    event RateLimitUpdated(uint256 newLimit);
    event GasPriceBufferUpdated(uint256 newBuffer);

    // Errors
    error InvalidSessionKey();
    error SessionKeyExpired();
    error InsufficientSponsorBalance();
    error RateLimitExceeded();
    error InvalidSignature();
    error SessionKeyNotActive();
    error InvalidExpiry();

    constructor(
        address _vyraToken,
        address _entryPoint,
        address _admin
    ) {
        if (_vyraToken == address(0) || _entryPoint == address(0) || _admin == address(0)) {
            revert("Invalid address");
        }
        
        vyraToken = VyraToken(_vyraToken);
        entryPoint = _entryPoint;
        
        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(ADMIN_ROLE, _admin);
        _grantRole(SPONSOR_ROLE, _admin);
        _grantRole(RATE_LIMITER_ROLE, _admin);
    }

    /**
     * @dev Create a session key for gasless transactions
     * @param sessionKey Address of the session key
     * @param expiry Unix timestamp when the key expires
     */
    function createSessionKey(address sessionKey, uint256 expiry) external {
        if (sessionKey == address(0)) revert InvalidSessionKey();
        if (expiry <= block.timestamp) revert InvalidExpiry();
        
        sessionKeys[msg.sender] = SessionKey({
            key: sessionKey,
            nonce: 0,
            expiry: expiry,
            active: true
        });
        
        emit SessionKeyCreated(msg.sender, sessionKey, expiry);
    }

    /**
     * @dev Revoke current session key
     */
    function revokeSessionKey() external {
        address key = sessionKeys[msg.sender].key;
        sessionKeys[msg.sender].active = false;
        emit SessionKeyRevoked(msg.sender, key);
    }

    /**
     * @dev Sponsor gas for a user transaction
     * @param user User address to sponsor
     * @param gasUsed Gas used by the transaction
     * @param signature Signature from the user authorizing the sponsorship
     */
    function sponsorGas(
        address user,
        uint256 gasUsed,
        bytes calldata signature
    ) external onlyRole(SPONSOR_ROLE) nonReentrant {
        // Verify signature
        bytes32 messageHash = keccak256(abi.encodePacked(user, gasUsed, block.chainid));
        bytes32 ethSignedMessageHash = MessageHashUtils.toEthSignedMessageHash(messageHash);
        address signer = ECDSA.recover(ethSignedMessageHash, signature);
        
        if (signer != user) revert InvalidSignature();
        
        // Check rate limits
        _checkRateLimit(user);
        
        // Calculate VYR cost
        uint256 gasPrice = tx.gasprice;
        uint256 adjustedGasPrice = (gasPrice * gasPriceBuffer) / 100;
        uint256 gasCost = gasUsed * adjustedGasPrice;
        uint256 vyrCost = (gasCost * 1e18) / vyraTokenPrice;
        
        // Check sponsor balance
        if (userSponsorBalance[user] < vyrCost) revert InsufficientSponsorBalance();
        
        // Deduct from sponsor balance
        userSponsorBalance[user] -= vyrCost;
        
        // Transfer VYR to paymaster
        vyraToken.transferFrom(user, address(this), vyrCost);
        
        // Update statistics
        totalSponsoredGas += gasUsed;
        totalVyrSpent += vyrCost;
        totalSponsorships++;
        
        emit GasSponsored(user, gasUsed, vyrCost);
    }

    /**
     * @dev Add sponsor balance for a user
     * @param user User address
     * @param amount VYR amount to add
     */
    function addSponsorBalance(address user, uint256 amount) external {
        if (amount < minSponsorBalance) revert InsufficientSponsorBalance();
        
        vyraToken.transferFrom(msg.sender, address(this), amount);
        userSponsorBalance[user] += amount;
        
        emit SponsorBalanceUpdated(user, userSponsorBalance[user]);
    }

    /**
     * @dev Validate a session key for a transaction
     * @param user User address
     * @param sessionKey Session key address
     * @param nonce Transaction nonce
     * @param signature Signature from session key
     */
    function validateSessionKey(
        address user,
        address sessionKey,
        uint256 nonce,
        bytes calldata signature
    ) external view returns (bool) {
        SessionKey memory key = sessionKeys[user];
        
        if (!key.active) revert SessionKeyNotActive();
        if (key.key != sessionKey) revert InvalidSessionKey();
        if (key.expiry <= block.timestamp) revert SessionKeyExpired();
        if (key.nonce >= nonce) revert InvalidSessionKey();
        
        // Verify signature
        bytes32 messageHash = keccak256(abi.encodePacked(user, nonce, block.chainid));
        bytes32 ethSignedMessageHash = MessageHashUtils.toEthSignedMessageHash(messageHash);
        address signer = ECDSA.recover(ethSignedMessageHash, signature);
        
        return signer == sessionKey;
    }

    /**
     * @dev Update session key nonce after successful transaction
     * @param user User address
     * @param newNonce New nonce value
     */
    function updateSessionKeyNonce(address user, uint256 newNonce) external {
        require(msg.sender == entryPoint, "Only entry point");
        sessionKeys[user].nonce = newNonce;
    }

    /**
     * @dev Check if user has sufficient sponsor balance
     * @param user User address
     * @param gasEstimate Estimated gas for transaction
     * @return hasBalance True if user has sufficient balance
     */
    function hasSponsorBalance(address user, uint256 gasEstimate) external view returns (bool hasBalance) {
        uint256 gasPrice = tx.gasprice;
        uint256 adjustedGasPrice = (gasPrice * gasPriceBuffer) / 100;
        uint256 gasCost = gasEstimate * adjustedGasPrice;
        uint256 vyrCost = (gasCost * 1e18) / vyraTokenPrice;
        
        hasBalance = userSponsorBalance[user] >= vyrCost;
    }

    /**
     * @dev Get required VYR amount for gas sponsorship
     * @param gasEstimate Estimated gas for transaction
     * @return vyrAmount Required VYR amount
     */
    function getRequiredVyrAmount(uint256 gasEstimate) external view returns (uint256 vyrAmount) {
        uint256 gasPrice = tx.gasprice;
        uint256 adjustedGasPrice = (gasPrice * gasPriceBuffer) / 100;
        uint256 gasCost = gasEstimate * adjustedGasPrice;
        vyrAmount = (gasCost * 1e18) / vyraTokenPrice;
    }

    /**
     * @dev Set rate limit for daily sponsorships
     * @param newLimit New daily limit
     */
    function setMaxDailySponsors(uint256 newLimit) external onlyRole(RATE_LIMITER_ROLE) {
        maxDailySponsors = newLimit;
        emit RateLimitUpdated(newLimit);
    }

    /**
     * @dev Set gas price buffer
     * @param newBuffer New buffer percentage (e.g., 120 = 20% buffer)
     */
    function setGasPriceBuffer(uint256 newBuffer) external onlyRole(ADMIN_ROLE) {
        if (newBuffer < 100) revert("Buffer too low");
        gasPriceBuffer = newBuffer;
        emit GasPriceBufferUpdated(newBuffer);
    }

    /**
     * @dev Set VYR token price
     * @param newPrice New price in USD (scaled by 1e18)
     */
    function setVyrTokenPrice(uint256 newPrice) external onlyRole(ADMIN_ROLE) {
        vyraTokenPrice = newPrice;
    }

    /**
     * @dev Internal function to check rate limits
     * @param user User address to check
     */
    function _checkRateLimit(address user) internal {
        uint256 currentDay = block.timestamp / 1 days;
        
        if (lastResetDay[user] != currentDay) {
            dailySponsorCount[user] = 0;
            lastResetDay[user] = currentDay;
        }
        
        if (dailySponsorCount[user] >= maxDailySponsors) {
            revert RateLimitExceeded();
        }
        
        dailySponsorCount[user]++;
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
