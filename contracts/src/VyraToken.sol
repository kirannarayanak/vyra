// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
// import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";

/**
 * @title VyraToken (VYR)
 * @dev ERC-20 token for the Vyra payment rail
 * 
 * Features:
 * - Access control with roles
 * - Pausable transfers
 * - Permit functionality for gasless approvals
 * - Minting and burning capabilities
 * - Reentrancy protection
 * - Maximum supply cap
 */
contract VyraToken is ERC20, ERC20Pausable, AccessControl, ReentrancyGuard {
    using Math for uint256;

    // Roles
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant TREASURY_ROLE = keccak256("TREASURY_ROLE");

    // Token configuration
    uint256 public constant MAX_SUPPLY = 10_000_000_000 * 10**18; // 10B VYR
    uint256 public constant GENESIS_SUPPLY = 2_000_000_000 * 10**18; // 2B VYR
    
    // Fee configuration
    uint256 public constant FEE_DENOMINATOR = 10000; // 0.01% precision
    uint256 public transferFeeRate = 10; // 0.1% default transfer fee
    uint256 public treasuryFeeRate = 50; // 50% of fees go to treasury
    
    // Treasury and fee collection
    address public treasury;
    uint256 public collectedFees;
    
    // Events
    event TransferFeeUpdated(uint256 oldRate, uint256 newRate);
    event TreasuryFeeUpdated(uint256 oldRate, uint256 newRate);
    event TreasuryUpdated(address oldTreasury, address newTreasury);
    event FeesCollected(uint256 amount, address treasury);
    event TokensBurned(address indexed account, uint256 amount, string reason);

    // Errors
    error ExceedsMaxSupply();
    error InvalidFeeRate();
    error InvalidTreasury();
    error InsufficientBalance();
    error TransferToZeroAddress();
    error TransferFromZeroAddress();

    constructor(
        address _treasury,
        address _admin
    ) ERC20("Vyra", "VYR") {
        if (_treasury == address(0)) revert InvalidTreasury();
        if (_admin == address(0)) revert InvalidTreasury();
        
        treasury = _treasury;
        
        // Set up roles
        _grantRole(DEFAULT_ADMIN_ROLE, _admin);
        _grantRole(MINTER_ROLE, _admin);
        _grantRole(BURNER_ROLE, _admin);
        _grantRole(PAUSER_ROLE, _admin);
        _grantRole(TREASURY_ROLE, _admin);
        
        // Mint genesis supply to treasury
        _mint(_treasury, GENESIS_SUPPLY);
    }

    /**
     * @dev Mint tokens to a specific account
     * @param to Address to mint tokens to
     * @param amount Amount of tokens to mint
     */
    function mint(address to, uint256 amount) external onlyRole(MINTER_ROLE) {
        if (totalSupply() + amount > MAX_SUPPLY) revert ExceedsMaxSupply();
        _mint(to, amount);
    }

    /**
     * @dev Burn tokens from caller's account
     * @param amount Amount of tokens to burn
     * @param reason Reason for burning (for transparency)
     */
    function burn(uint256 amount, string calldata reason) external {
        if (balanceOf(msg.sender) < amount) revert InsufficientBalance();
        _burn(msg.sender, amount);
        emit TokensBurned(msg.sender, amount, reason);
    }

    /**
     * @dev Burn tokens from a specific account (requires BURNER_ROLE)
     * @param from Address to burn tokens from
     * @param amount Amount of tokens to burn
     * @param reason Reason for burning
     */
    function burnFrom(address from, uint256 amount, string calldata reason) external onlyRole(BURNER_ROLE) {
        if (balanceOf(from) < amount) revert InsufficientBalance();
        _burn(from, amount);
        emit TokensBurned(from, amount, reason);
    }

    /**
     * @dev Pause all token transfers
     */
    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }

    /**
     * @dev Unpause token transfers
     */
    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    /**
     * @dev Set transfer fee rate (in basis points)
     * @param newRate New fee rate (e.g., 10 = 0.1%)
     */
    function setTransferFeeRate(uint256 newRate) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (newRate > 1000) revert InvalidFeeRate(); // Max 10%
        uint256 oldRate = transferFeeRate;
        transferFeeRate = newRate;
        emit TransferFeeUpdated(oldRate, newRate);
    }

    /**
     * @dev Set treasury fee rate (percentage of transfer fees)
     * @param newRate New treasury fee rate (e.g., 50 = 50%)
     */
    function setTreasuryFeeRate(uint256 newRate) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (newRate > 100) revert InvalidFeeRate(); // Max 100%
        uint256 oldRate = treasuryFeeRate;
        treasuryFeeRate = newRate;
        emit TreasuryFeeUpdated(oldRate, newRate);
    }

    /**
     * @dev Update treasury address
     * @param newTreasury New treasury address
     */
    function setTreasury(address newTreasury) external onlyRole(TREASURY_ROLE) {
        if (newTreasury == address(0)) revert InvalidTreasury();
        address oldTreasury = treasury;
        treasury = newTreasury;
        emit TreasuryUpdated(oldTreasury, newTreasury);
    }

    /**
     * @dev Collect accumulated fees to treasury
     */
    function collectFees() external onlyRole(TREASURY_ROLE) nonReentrant {
        uint256 amount = collectedFees;
        if (amount > 0) {
            collectedFees = 0;
            _transfer(address(this), treasury, amount);
            emit FeesCollected(amount, treasury);
        }
    }

    /**
     * @dev Override _update to apply fees and pausing
     */
    function _update(address from, address to, uint256 value) internal override(ERC20, ERC20Pausable) whenNotPaused {
        // Handle minting and burning (no fees)
        if (from == address(0) || to == address(0)) {
            super._update(from, to, value);
            return;
        }
        
        // Calculate fee for regular transfers
        uint256 fee = 0;
        if (transferFeeRate > 0 && from != treasury && to != treasury) {
            fee = (value * transferFeeRate) / FEE_DENOMINATOR;
        }
        
        uint256 transferAmount = value - fee;
        
        // Transfer the main amount
        super._update(from, to, transferAmount);
        
        // Collect fee if applicable
        if (fee > 0) {
            super._update(from, address(this), fee);
            collectedFees += fee;
        }
    }

    /**
     * @dev Get current fee for a transfer amount
     * @param amount Transfer amount
     * @return fee Fee amount
     */
    function getTransferFee(uint256 amount) external view returns (uint256 fee) {
        if (transferFeeRate > 0) {
            fee = (amount * transferFeeRate) / FEE_DENOMINATOR;
        }
    }

    /**
     * @dev Get treasury portion of collected fees
     * @return treasuryFees Amount of fees allocated to treasury
     */
    function getTreasuryFees() external view returns (uint256 treasuryFees) {
        treasuryFees = (collectedFees * treasuryFeeRate) / 100;
    }

    /**
     * @dev Emergency function to recover accidentally sent tokens
     * @param token Token address to recover
     * @param amount Amount to recover
     */
    function recoverToken(address token, uint256 amount) external onlyRole(DEFAULT_ADMIN_ROLE) {
        IERC20(token).transfer(treasury, amount);
    }
}
