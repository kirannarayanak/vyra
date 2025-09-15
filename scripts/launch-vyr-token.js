#!/usr/bin/env node

/**
 * VYR Token Launch Script
 * 
 * This script helps launch the VYR token with proper distribution
 * and initial setup for a successful token launch.
 */

const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  // Token Configuration
  name: "Vyra",
  symbol: "VYR",
  decimals: 18,
  totalSupply: ethers.parseEther("10000000000"), // 10B VYR
  
  // Distribution
  publicSale: ethers.parseEther("2000000000"), // 20%
  team: ethers.parseEther("1500000000"), // 15%
  treasury: ethers.parseEther("2000000000"), // 20%
  ecosystem: ethers.parseEther("1500000000"), // 15%
  liquidity: ethers.parseEther("1000000000"), // 10%
  marketing: ethers.parseEther("1000000000"), // 10%
  community: ethers.parseEther("1000000000"), // 10%
  
  // Pricing
  preSalePrice: "0.001", // $0.001 per VYR
  publicSalePrice: "0.002", // $0.002 per VYR
  listingPrice: "0.003", // $0.003 per VYR
  
  // Vesting
  teamVestingPeriod: 4 * 365 * 24 * 60 * 60, // 4 years in seconds
  treasuryVestingPeriod: 2 * 365 * 24 * 60 * 60, // 2 years in seconds
  ecosystemVestingPeriod: 3 * 365 * 24 * 60 * 60, // 3 years in seconds
  marketingVestingPeriod: 2 * 365 * 24 * 60 * 60, // 2 years in seconds
  communityVestingPeriod: 5 * 365 * 24 * 60 * 60, // 5 years in seconds
};

class VYRTokenLauncher {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.contracts = {};
  }

  async initialize() {
    console.log("🚀 Initializing VYR Token Launcher...");
    
    // Check for environment variables
    if (!process.env.PRIVATE_KEY || !process.env.RPC_URL) {
      console.error("❌ Missing required environment variables:");
      console.error("   PRIVATE_KEY - Your wallet private key");
      console.error("   RPC_URL - Ethereum RPC endpoint");
      process.exit(1);
    }

    // Initialize provider and signer
    this.provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    this.signer = new ethers.Wallet(process.env.PRIVATE_KEY, this.provider);
    
    console.log("✅ Connected to network:", await this.provider.getNetwork());
    console.log("✅ Wallet address:", this.signer.address);
  }

  async deployToken() {
    console.log("\n📦 Deploying VYR Token...");
    
    // Load VyraToken contract
    const contractPath = path.join(__dirname, '../contracts/out/VyraToken.sol/VyraToken.json');
    const contractArtifact = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
    
    const factory = new ethers.ContractFactory(
      contractArtifact.abi,
      contractArtifact.bytecode,
      this.signer
    );

    // Deploy with initial parameters
    const token = await factory.deploy(
      CONFIG.name,
      CONFIG.symbol,
      CONFIG.totalSupply,
      this.signer.address, // admin
      this.signer.address, // treasury
      ethers.parseEther("0.001"), // transfer fee (0.1%)
      ethers.parseEther("0.0005") // treasury fee (0.05%)
    );

    await token.waitForDeployment();
    this.contracts.token = token;
    
    console.log("✅ VYR Token deployed at:", await token.getAddress());
    return await token.getAddress();
  }

  async setupDistribution() {
    console.log("\n📊 Setting up token distribution...");
    
    const token = this.contracts.token;
    
    // Define distribution addresses (you'll need to set these)
    const distributionAddresses = {
      publicSale: process.env.PUBLIC_SALE_ADDRESS || this.signer.address,
      team: process.env.TEAM_ADDRESS || this.signer.address,
      treasury: process.env.TREASURY_ADDRESS || this.signer.address,
      ecosystem: process.env.ECOSYSTEM_ADDRESS || this.signer.address,
      liquidity: process.env.LIQUIDITY_ADDRESS || this.signer.address,
      marketing: process.env.MARKETING_ADDRESS || this.signer.address,
      community: process.env.COMMUNITY_ADDRESS || this.signer.address,
    };

    // Transfer tokens to distribution addresses
    for (const [category, address] of Object.entries(distributionAddresses)) {
      const amount = CONFIG[category];
      if (amount && address !== this.signer.address) {
        console.log(`📤 Transferring ${ethers.formatEther(amount)} VYR to ${category} address...`);
        await token.transfer(address, amount);
      }
    }

    console.log("✅ Token distribution completed");
  }

  async setupLiquidity() {
    console.log("\n💧 Setting up liquidity pools...");
    
    // This would integrate with Uniswap or other DEX
    console.log("📝 To set up liquidity pools:");
    console.log("   1. Go to Uniswap V3");
    console.log("   2. Create VYR/ETH pool");
    console.log("   3. Add initial liquidity");
    console.log("   4. Set price range and fees");
    
    console.log("✅ Liquidity setup instructions provided");
  }

  async generateLaunchReport() {
    console.log("\n📋 Generating launch report...");
    
    const tokenAddress = await this.contracts.token.getAddress();
    const totalSupply = await this.contracts.token.totalSupply();
    const decimals = await this.contracts.token.decimals();
    
    const report = {
      token: {
        address: tokenAddress,
        name: CONFIG.name,
        symbol: CONFIG.symbol,
        decimals: decimals.toString(),
        totalSupply: ethers.formatEther(totalSupply),
      },
      distribution: {
        publicSale: ethers.formatEther(CONFIG.publicSale),
        team: ethers.formatEther(CONFIG.team),
        treasury: ethers.formatEther(CONFIG.treasury),
        ecosystem: ethers.formatEther(CONFIG.ecosystem),
        liquidity: ethers.formatEther(CONFIG.liquidity),
        marketing: ethers.formatEther(CONFIG.marketing),
        community: ethers.formatEther(CONFIG.community),
      },
      pricing: {
        preSale: CONFIG.preSalePrice,
        publicSale: CONFIG.publicSalePrice,
        listing: CONFIG.listingPrice,
      },
      nextSteps: [
        "Verify contract on Etherscan",
        "Set up liquidity pools on Uniswap",
        "Launch marketing campaign",
        "Apply for exchange listings",
        "Set up staking rewards",
        "Launch community programs"
      ]
    };

    // Save report to file
    const reportPath = path.join(__dirname, '../VYR_LAUNCH_REPORT.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log("✅ Launch report saved to:", reportPath);
    console.log("\n🎉 VYR Token Launch Complete!");
    console.log("📊 Token Address:", tokenAddress);
    console.log("💰 Total Supply:", ethers.formatEther(totalSupply), "VYR");
    
    return report;
  }

  async launch() {
    try {
      await this.initialize();
      await this.deployToken();
      await this.setupDistribution();
      await this.setupLiquidity();
      await this.generateLaunchReport();
      
      console.log("\n🚀 VYR Token successfully launched!");
      console.log("📱 Next: Update your website with the new token address");
      console.log("🌐 Next: Launch marketing campaign");
      console.log("💎 Next: Apply for exchange listings");
      
    } catch (error) {
      console.error("❌ Launch failed:", error.message);
      process.exit(1);
    }
  }
}

// Run the launcher
if (require.main === module) {
  const launcher = new VYRTokenLauncher();
  launcher.launch();
}

module.exports = VYRTokenLauncher;
