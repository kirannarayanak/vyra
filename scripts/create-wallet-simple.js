const crypto = require('crypto');

// Generate a random private key
const privateKey = crypto.randomBytes(32).toString('hex');

// Generate address from private key (simplified)
const address = '0x' + crypto.createHash('sha256').update(privateKey).digest('hex').slice(0, 40);

console.log('🔑 New Wallet Created!');
console.log('====================');
console.log('Address:', address);
console.log('Private Key:', privateKey);
console.log('');
console.log('⚠️  IMPORTANT: Save these details securely!');
console.log('⚠️  Never share your private key!');
console.log('');
console.log('Next steps:');
console.log('1. Copy the address above');
console.log('2. Go to a Sepolia faucet');
console.log('3. Request testnet ETH for this address');
console.log('');
console.log('Sepolia Faucets:');
console.log('- https://sepoliafaucet.com/');
console.log('- https://faucet.sepolia.dev/');
console.log('- https://sepolia-faucet.pk910.de/');
