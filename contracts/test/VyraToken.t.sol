// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "forge-std/console.sol";
import "../src/VyraToken.sol";

contract VyraTokenTest is Test {
    VyraToken public vyraToken;
    address public admin = address(0x1);
    address public treasury = address(0x2);
    address public user1 = address(0x3);
    address public user2 = address(0x4);
    address public minter = address(0x5);
    address public burner = address(0x6);

    event TransferFeeUpdated(uint256 oldRate, uint256 newRate);
    event TreasuryFeeUpdated(uint256 oldRate, uint256 newRate);
    event TreasuryUpdated(address oldTreasury, address newTreasury);
    event FeesCollected(uint256 amount, address treasury);
    event TokensBurned(address indexed account, uint256 amount, string reason);

    function setUp() public {
        vm.startPrank(admin);
        vyraToken = new VyraToken(treasury, admin);
        
        // Grant roles
        vyraToken.grantRole(vyraToken.MINTER_ROLE(), minter);
        vyraToken.grantRole(vyraToken.BURNER_ROLE(), burner);
        
        vm.stopPrank();
    }

    function testInitialState() public view {
        assertEq(vyraToken.name(), "Vyra");
        assertEq(vyraToken.symbol(), "VYR");
        assertEq(vyraToken.decimals(), 18);
        assertEq(vyraToken.totalSupply(), 2_000_000_000 * 10**18);
        assertEq(vyraToken.balanceOf(treasury), 2_000_000_000 * 10**18);
        assertEq(vyraToken.treasury(), treasury);
    }

    function testMint() public {
        uint256 mintAmount = 1000 * 10**18;
        
        vm.prank(minter);
        vyraToken.mint(user1, mintAmount);
        
        assertEq(vyraToken.balanceOf(user1), mintAmount);
        assertEq(vyraToken.totalSupply(), 2_000_000_000 * 10**18 + mintAmount);
    }

    function testMintExceedsMaxSupply() public {
        uint256 mintAmount = 8_000_000_001 * 10**18; // Exceeds max supply
        
        vm.prank(minter);
        vm.expectRevert(VyraToken.ExceedsMaxSupply.selector);
        vyraToken.mint(user1, mintAmount);
    }

    function testMintUnauthorized() public {
        uint256 mintAmount = 1000 * 10**18;
        
        vm.prank(user1);
        vm.expectRevert();
        vyraToken.mint(user2, mintAmount);
    }

    function testBurn() public {
        uint256 burnAmount = 100 * 10**18;
        
        // First mint some tokens to user1
        vm.prank(minter);
        vyraToken.mint(user1, burnAmount);
        
        // User burns their own tokens
        vm.prank(user1);
        vyraToken.burn(burnAmount, "Test burn");
        
        assertEq(vyraToken.balanceOf(user1), 0);
        assertEq(vyraToken.totalSupply(), 2_000_000_000 * 10**18);
    }

    function testBurnFrom() public {
        uint256 burnAmount = 100 * 10**18;
        
        // First mint some tokens to user1
        vm.prank(minter);
        vyraToken.mint(user1, burnAmount);
        
        // Burner burns tokens from user1
        vm.prank(burner);
        vyraToken.burnFrom(user1, burnAmount, "Admin burn");
        
        assertEq(vyraToken.balanceOf(user1), 0);
        assertEq(vyraToken.totalSupply(), 2_000_000_000 * 10**18);
    }

    function testTransferWithFee() public {
        uint256 transferAmount = 1000 * 10**18;
        uint256 expectedFee = (transferAmount * 10) / 10000; // 0.1% fee
        uint256 expectedTransfer = transferAmount - expectedFee;
        
        // Mint tokens to user1
        vm.prank(minter);
        vyraToken.mint(user1, transferAmount);
        
        // Transfer from user1 to user2
        vm.prank(user1);
        vyraToken.transfer(user2, transferAmount);
        
        assertEq(vyraToken.balanceOf(user1), 0);
        assertEq(vyraToken.balanceOf(user2), expectedTransfer);
        assertEq(vyraToken.balanceOf(address(vyraToken)), expectedFee);
        assertEq(vyraToken.collectedFees(), expectedFee);
    }

    function testTransferNoFeeToTreasury() public {
        uint256 transferAmount = 1000 * 10**18;
        
        // Mint tokens to user1
        vm.prank(minter);
        vyraToken.mint(user1, transferAmount);
        
        // Transfer from user1 to treasury (no fee)
        vm.prank(user1);
        vyraToken.transfer(treasury, transferAmount);
        
        assertEq(vyraToken.balanceOf(user1), 0);
        assertEq(vyraToken.balanceOf(treasury), 2_000_000_000 * 10**18 + transferAmount);
        assertEq(vyraToken.collectedFees(), 0);
    }

    function testPause() public {
        vm.prank(admin);
        vyraToken.pause();
        
        assertTrue(vyraToken.paused());
        
        // Transfer should fail when paused
        vm.prank(treasury);
        vm.expectRevert();
        vyraToken.transfer(user1, 1000 * 10**18);
    }

    function testUnpause() public {
        vm.prank(admin);
        vyraToken.pause();
        
        vm.prank(admin);
        vyraToken.unpause();
        
        assertFalse(vyraToken.paused());
    }

    function testSetTransferFeeRate() public {
        uint256 newRate = 50; // 0.5%
        
        vm.prank(admin);
        vm.expectEmit(true, true, true, true);
        emit TransferFeeUpdated(10, newRate);
        vyraToken.setTransferFeeRate(newRate);
        
        assertEq(vyraToken.transferFeeRate(), newRate);
    }

    function testSetTransferFeeRateTooHigh() public {
        uint256 newRate = 1001; // 10.01%
        
        vm.prank(admin);
        vm.expectRevert(VyraToken.InvalidFeeRate.selector);
        vyraToken.setTransferFeeRate(newRate);
    }

    function testSetTreasuryFeeRate() public {
        uint256 newRate = 75; // 75%
        
        vm.prank(admin);
        vm.expectEmit(true, true, true, true);
        emit TreasuryFeeUpdated(50, newRate);
        vyraToken.setTreasuryFeeRate(newRate);
        
        assertEq(vyraToken.treasuryFeeRate(), newRate);
    }

    function testSetTreasury() public {
        address newTreasury = address(0x7);
        
        vm.prank(admin);
        vm.expectEmit(true, true, true, true);
        emit TreasuryUpdated(treasury, newTreasury);
        vyraToken.setTreasury(newTreasury);
        
        assertEq(vyraToken.treasury(), newTreasury);
    }

    function testCollectFees() public {
        uint256 transferAmount = 1000 * 10**18;
        uint256 expectedFee = (transferAmount * 10) / 10000;
        
        // Create some fees
        vm.prank(minter);
        vyraToken.mint(user1, transferAmount);
        
        vm.prank(user1);
        vyraToken.transfer(user2, transferAmount);
        
        // Collect fees
        vm.prank(admin);
        vm.expectEmit(true, true, true, true);
        emit FeesCollected(expectedFee, treasury);
        vyraToken.collectFees();
        
        assertEq(vyraToken.collectedFees(), 0);
        assertEq(vyraToken.balanceOf(treasury), 2_000_000_000 * 10**18 + expectedFee);
    }

    function testGetTransferFee() public view {
        uint256 amount = 1000 * 10**18;
        uint256 expectedFee = (amount * 10) / 10000; // 0.1%
        
        uint256 actualFee = vyraToken.getTransferFee(amount);
        assertEq(actualFee, expectedFee);
    }

    function testGetTreasuryFees() public {
        uint256 transferAmount = 1000 * 10**18;
        uint256 expectedFee = (transferAmount * 10) / 10000;
        uint256 expectedTreasuryFee = (expectedFee * 50) / 100; // 50% of fees
        
        // Create some fees
        vm.prank(minter);
        vyraToken.mint(user1, transferAmount);
        
        vm.prank(user1);
        vyraToken.transfer(user2, transferAmount);
        
        uint256 treasuryFees = vyraToken.getTreasuryFees();
        assertEq(treasuryFees, expectedTreasuryFee);
    }

    function testRecoverToken() public {
        // Create a mock ERC20 token
        MockERC20 mockToken = new MockERC20();
        uint256 amount = 1000 * 10**18;
        
        // Transfer some tokens to the contract
        mockToken.mint(address(vyraToken), amount);
        
        // Recover tokens
        vm.prank(admin);
        vyraToken.recoverToken(address(mockToken), amount);
        
        assertEq(mockToken.balanceOf(treasury), amount);
    }

    // Permit test removed - ERC20Permit not included in this version
}

contract MockERC20 {
    mapping(address => uint256) public balanceOf;
    
    function mint(address to, uint256 amount) external {
        balanceOf[to] += amount;
    }
    
    function transfer(address to, uint256 amount) external returns (bool) {
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        return true;
    }
}
