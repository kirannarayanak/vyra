import { NetworkInfo } from './types';

export const NETWORKS: Record<number, NetworkInfo> = {
  1: {
    name: 'Ethereum Mainnet',
    chainId: 1,
    rpcUrl: 'https://eth.llamarpc.com',
    blockExplorer: 'https://etherscan.io',
    vyraTokenAddress: '0x0000000000000000000000000000000000000000', // TODO: Deploy
    paymasterAddress: '0x0000000000000000000000000000000000000000', // TODO: Deploy
    posAddress: '0x0000000000000000000000000000000000000000', // TODO: Deploy
    bridgeAddress: '0x0000000000000000000000000000000000000000', // TODO: Deploy
    entryPointAddress: '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789',
  },
  11155111: {
    name: 'Sepolia Testnet',
    chainId: 11155111,
    rpcUrl: 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY',
    blockExplorer: 'https://sepolia.etherscan.io',
    vyraTokenAddress: '0x0000000000000000000000000000000000000000', // TODO: Deploy
    paymasterAddress: '0x0000000000000000000000000000000000000000', // TODO: Deploy
    posAddress: '0x0000000000000000000000000000000000000000', // TODO: Deploy
    bridgeAddress: '0x0000000000000000000000000000000000000000', // TODO: Deploy
    entryPointAddress: '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789',
  },
  31337: {
    name: 'Local Development',
    chainId: 31337,
    rpcUrl: 'http://localhost:8545',
    blockExplorer: '',
    vyraTokenAddress: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    paymasterAddress: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
    posAddress: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
    bridgeAddress: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',
    entryPointAddress: '0x0165878A594ca255338adfa4d48449f69242Eb8F',
  },
};

export const VYRA_DECIMALS = 18;
export const VYRA_SYMBOL = 'VYR';
export const VYRA_NAME = 'Vyra';

export const FEE_DENOMINATOR = 10000; // 0.01% precision
export const DEFAULT_TRANSFER_FEE = 10; // 0.1%
export const DEFAULT_MERCHANT_FEE = 25; // 0.25%
export const DEFAULT_PLATFORM_FEE = 5; // 0.05%
export const DEFAULT_BRIDGE_FEE = 10; // 0.1%

export const MAX_SUPPLY = '10000000000000000000000000000'; // 10B VYR
export const GENESIS_SUPPLY = '2000000000000000000000000000'; // 2B VYR

export const SESSION_KEY_EXPIRY = 24 * 60 * 60; // 24 hours
export const MAX_DAILY_SPONSORS = 100;
export const MIN_SPONSOR_BALANCE = '1000000000000000000000'; // 1000 VYR

export const SUPPORTED_CURRENCIES = ['VYR', 'ETH', 'USDC', 'USDT'] as const;
export const SUPPORTED_NETWORKS = [1, 11155111, 31337] as const;

export const API_ENDPOINTS = {
  MAINNET: 'https://api.vyra.com',
  TESTNET: 'https://api-testnet.vyra.com',
  LOCAL: 'http://localhost:3000',
} as const;

export const ERROR_CODES = {
  WALLET_NOT_CONNECTED: 'WALLET_NOT_CONNECTED',
  INSUFFICIENT_BALANCE: 'INSUFFICIENT_BALANCE',
  INVALID_ADDRESS: 'INVALID_ADDRESS',
  INVALID_AMOUNT: 'INVALID_AMOUNT',
  TRANSACTION_FAILED: 'TRANSACTION_FAILED',
  NETWORK_ERROR: 'NETWORK_ERROR',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  UNAUTHORIZED: 'UNAUTHORIZED',
  NOT_FOUND: 'NOT_FOUND',
} as const;
