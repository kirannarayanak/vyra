const { ethers } = require('ethers');

async function createWallet() {
    // Create a new random wallet
    const wallet = ethers.Wallet.createRandom();
    
    console.log('🔑 New Wallet Created!');
    console.log('====================');
    console.log('Address:', wallet.address);
    console.log('Private Key:', wallet.privateKey);
    console.log('Mnemonic:', wallet.mnemonic.phrase);
    console.log('');
    console.log('⚠️  IMPORTANT: Save these details securely!');
    console.log('⚠️  Never share your private key or mnemonic!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Copy the address above');
    console.log('2. Go to a Sepolia faucet');
    console.log('3. Request testnet ETH for this address');
}

createWallet().catch(console.error);
