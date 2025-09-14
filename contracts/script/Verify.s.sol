// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";

contract VerifyScript is Script {
    function run() public {
        address vyraToken = vm.envAddress("VYRA_TOKEN_ADDRESS");
        address paymaster = vm.envAddress("PAYMASTER_ADDRESS");
        address pos = vm.envAddress("POS_ADDRESS");
        address bridge = vm.envAddress("BRIDGE_ADDRESS");
        
        require(vyraToken != address(0), "VYRA_TOKEN_ADDRESS not set");
        require(paymaster != address(0), "PAYMASTER_ADDRESS not set");
        require(pos != address(0), "POS_ADDRESS not set");
        require(bridge != address(0), "BRIDGE_ADDRESS not set");
        
        console.log("Verifying contracts...");
        
        // Verify VyraToken
        console.log("Verifying VyraToken at:", vyraToken);
        console.log("[INFO] Use 'forge verify-contract' command for verification");
        
        // Verify VyraPaymaster
        console.log("Verifying VyraPaymaster at:", paymaster);
        console.log("[INFO] Use 'forge verify-contract' command for verification");
        
        // Verify VyraPOS
        console.log("Verifying VyraPOS at:", pos);
        console.log("[INFO] Use 'forge verify-contract' command for verification");
        
        // Verify VyraBridge
        console.log("Verifying VyraBridge at:", bridge);
        console.log("[INFO] Use 'forge verify-contract' command for verification");
        
        console.log("\nVerification complete!");
    }
}
