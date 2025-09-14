export interface WalletState {
  address: string | null;
  balance: string;
  vyraBalance: string;
  isConnected: boolean;
  isUnlocked: boolean;
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

export interface Transaction {
  hash: string;
  from: string;
  to: string;
  amount: string;
  fee: string;
  timestamp: number;
  status: 'pending' | 'confirmed' | 'failed';
  type: 'send' | 'receive' | 'swap' | 'bridge';
}

export interface QRCodeData {
  type: 'payment' | 'invoice' | 'address';
  data: {
    address?: string;
    amount?: string;
    invoiceId?: string;
    description?: string;
  };
  signature?: string;
}

export interface BiometricAuth {
  isAvailable: boolean;
  isEnabled: boolean;
  type: 'fingerprint' | 'face' | 'iris' | null;
}

export interface SecuritySettings {
  biometricEnabled: boolean;
  pinEnabled: boolean;
  sessionTimeout: number;
  autoLock: boolean;
}

export interface NetworkConfig {
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

export interface VyraConfig {
  rpcUrl: string;
  chainId: number;
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

export interface VyraResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ErrorInfo;
  txHash?: string;
}
