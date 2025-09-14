export interface VyraConfig {
  rpcUrl: string;
  chainId: number;
  vyraTokenAddress: string;
  paymasterAddress: string;
  posAddress: string;
  bridgeAddress: string;
  entryPointAddress: string;
}

export interface PaymentRequest {
  to: string;
  amount: string;
  description?: string;
  metadata?: Record<string, any>;
}

export interface InvoiceRequest {
  amount: string;
  description: string;
  expiry?: number;
  metadata?: Record<string, any>;
}

export interface SplitPaymentRequest {
  recipients: string[];
  percentages: number[];
  totalAmount: string;
  description?: string;
}

export interface SessionKey {
  address: string;
  nonce: number;
  expiry: number;
  active: boolean;
}

export interface BridgeDeposit {
  amount: string;
  txHash: string;
  blockNumber: number;
  timestamp: number;
}

export interface BridgeWithdrawal {
  amount: string;
  l2TxHash: string;
  signatures: string[];
  timestamp: number;
}

export interface MerchantStats {
  totalEarnings: string;
  totalTransactions: number;
  totalVolume: string;
  averageTransactionSize: string;
}

export interface PaymentReceipt {
  paymentId: string;
  invoiceId: string;
  from: string;
  to: string;
  amount: string;
  fee: string;
  timestamp: number;
  txHash: string;
  status: 'pending' | 'confirmed' | 'failed';
}

export interface GasEstimate {
  gasLimit: string;
  gasPrice: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
  vyrCost: string;
}

export interface WalletInfo {
  address: string;
  balance: string;
  vyraBalance: string;
  sessionKey?: SessionKey;
  isSponsored: boolean;
}

export interface TransactionOptions {
  gasLimit?: string;
  gasPrice?: string;
  maxFeePerGas?: string;
  maxPriorityFeePerGas?: string;
  nonce?: number;
}

export interface QRCodeData {
  type: 'payment' | 'invoice';
  data: {
    address?: string;
    amount?: string;
    invoiceId?: string;
    description?: string;
  };
  signature: string;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
  webhook?: string;
}

export interface ComplianceSettings {
  kycRequired: boolean;
  amlRequired: boolean;
  jurisdiction: string;
  maxTransactionAmount: string;
  dailyLimit: string;
}

export interface FeeStructure {
  transferFee: number; // in basis points
  merchantFee: number; // in basis points
  platformFee: number; // in basis points
  bridgeFee: number; // in basis points
}

export interface NetworkInfo {
  name: string;
  chainId: number;
  rpcUrl: string;
  blockExplorer: string;
  vyraTokenAddress: string;
  paymasterAddress: string;
  posAddress: string;
  bridgeAddress: string;
  entryPointAddress: string;
}

export interface ErrorInfo {
  code: string;
  message: string;
  details?: any;
  txHash?: string;
}

export type VyraError = Error & {
  code: string;
  details?: any;
  txHash?: string;
};

export interface VyraResponse<T = any> {
  success: boolean;
  data?: T;
  error?: VyraError;
  txHash?: string;
}

export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
