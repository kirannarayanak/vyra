// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/VyraToken.sol";
import "../src/paymasters/VyraPaymaster.sol";
import "../src/merchants/VyraPOS.sol";
import "../src/bridge/VyraBridge.sol";

contract DeployScript is Script {
    // Contract addresses
    address public vyraToken;
    address public paymaster;
    address public pos;
    address public bridge;
    
    // Configuration
    address public admin;
    address public treasury;
    address public entryPoint;
    
    function setUp() public {
        admin = vm.envAddress("ADMIN_ADDRESS");
        treasury = vm.envAddress("TREASURY_ADDRESS");
        entryPoint = vm.envAddress("ENTRY_POINT_ADDRESS");
        
        require(admin != address(0), "ADMIN_ADDRESS not set");
        require(treasury != address(0), "TREASURY_ADDRESS not set");
        require(entryPoint != address(0), "ENTRY_POINT_ADDRESS not set");
    }
    
    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);
        
        console.log("Deploying Vyra contracts...");
        console.log("Admin:", admin);
        console.log("Treasury:", treasury);
        console.log("Entry Point:", entryPoint);
        
        // Deploy VyraToken
        console.log("Deploying VyraToken...");
        VyraToken token = new VyraToken(treasury, admin);
        vyraToken = address(token);
        console.log("VyraToken deployed at:", vyraToken);
        
        // Deploy VyraPaymaster
        console.log("Deploying VyraPaymaster...");
        VyraPaymaster paymasterContract = new VyraPaymaster(
            vyraToken,
            entryPoint,
            admin
        );
        paymaster = address(paymasterContract);
        console.log("VyraPaymaster deployed at:", paymaster);
        
        // Deploy VyraPOS
        console.log("Deploying VyraPOS...");
        VyraPOS posContract = new VyraPOS(
            vyraToken,
            treasury,
            admin
        );
        pos = address(posContract);
        console.log("VyraPOS deployed at:", pos);
        
        // Deploy VyraBridge
        console.log("Deploying VyraBridge...");
        VyraBridge bridgeContract = new VyraBridge(
            vyraToken,
            address(0), // L2 bridge address (placeholder)
            treasury,
            admin
        );
        bridge = address(bridgeContract);
        console.log("VyraBridge deployed at:", bridge);
        
        vm.stopBroadcast();
        
        // Log deployment summary
        console.log("\n=== DEPLOYMENT SUMMARY ===");
        console.log("VyraToken:", vyraToken);
        console.log("VyraPaymaster:", paymaster);
        console.log("VyraPOS:", pos);
        console.log("VyraBridge:", bridge);
        console.log("Admin:", admin);
        console.log("Treasury:", treasury);
        console.log("Entry Point:", entryPoint);
        
        // Save addresses to file
        string memory addresses = string(abi.encodePacked(
            "VYRA_TOKEN_ADDRESS=", vm.toString(vyraToken), "\n",
            "PAYMASTER_ADDRESS=", vm.toString(paymaster), "\n",
            "POS_ADDRESS=", vm.toString(pos), "\n",
            "BRIDGE_ADDRESS=", vm.toString(bridge), "\n"
        ));
        
        vm.writeFile("deployed-addresses.env", addresses);
        console.log("\nAddresses saved to deployed-addresses.env");
    }
}
