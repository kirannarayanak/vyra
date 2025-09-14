import { ethers } from 'ethers';

/**
 * Format VYR amount for display
 */
export function formatVyrAmount(amount: string | bigint, decimals: number = 4): string {
  const formatted = ethers.formatEther(amount);
  const num = parseFloat(formatted);
  return num.toFixed(decimals);
}

/**
 * Parse VYR amount to wei
 */
export function parseVyrAmount(amount: string): bigint {
  return ethers.parseEther(amount);
}

/**
 * Validate Ethereum address
 */
export function isValidAddress(address: string): boolean {
  try {
    return ethers.isAddress(address);
  } catch {
    return false;
  }
}

/**
 * Validate VYR amount
 */
export function isValidAmount(amount: string): boolean {
  try {
    const parsed = parseFloat(amount);
    return !isNaN(parsed) && parsed > 0 && parsed <= 1000000000; // Max 1B VYR
  } catch {
    return false;
  }
}

/**
 * Generate random session key
 */
export function generateSessionKey(): string {
  const wallet = ethers.Wallet.createRandom();
  return wallet.address;
}

/**
 * Generate invoice ID
 */
export function generateInvoiceId(merchant: string, amount: string, description: string): string {
  const data = ethers.solidityPacked(
    ['address', 'uint256', 'bytes32', 'uint256'],
    [
      merchant,
      ethers.parseEther(amount),
      ethers.keccak256(ethers.toUtf8Bytes(description)),
      Math.floor(Date.now() / 1000)
    ]
  );
  return ethers.keccak256(data);
}

/**
 * Generate payment ID
 */
export function generatePaymentId(invoiceId: string, customer: string, amount: string): string {
  const data = ethers.solidityPacked(
    ['bytes32', 'address', 'uint256', 'uint256'],
    [
      invoiceId,
      customer,
      ethers.parseEther(amount),
      Math.floor(Date.now() / 1000)
    ]
  );
  return ethers.keccak256(data);
}

/**
 * Calculate transfer fee
 */
export function calculateTransferFee(amount: string, feeRate: number = 10): string {
  const amountWei = parseVyrAmount(amount);
  const fee = (amountWei * BigInt(feeRate)) / BigInt(10000);
  return ethers.formatEther(fee);
}

/**
 * Calculate net amount after fee
 */
export function calculateNetAmount(amount: string, feeRate: number = 10): string {
  const amountWei = parseVyrAmount(amount);
  const fee = (amountWei * BigInt(feeRate)) / BigInt(10000);
  const netAmount = amountWei - fee;
  return ethers.formatEther(netAmount);
}

/**
 * Format timestamp to human readable
 */
export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleString();
}

/**
 * Generate QR code data
 */
export function generateQRData(type: 'payment' | 'invoice', data: any): string {
  const qrData = {
    type,
    data,
    timestamp: Math.floor(Date.now() / 1000),
  };
  return JSON.stringify(qrData);
}

/**
 * Parse QR code data
 */
export function parseQRData(qrData: string): any {
  try {
    return JSON.parse(qrData);
  } catch {
    throw new Error('Invalid QR code data');
  }
}

/**
 * Calculate split amounts
 */
export function calculateSplitAmounts(totalAmount: string, percentages: number[]): string[] {
  const totalWei = parseVyrAmount(totalAmount);
  const amounts: string[] = [];
  
  for (const percentage of percentages) {
    const amount = (totalWei * BigInt(percentage)) / BigInt(10000);
    amounts.push(ethers.formatEther(amount));
  }
  
  return amounts;
}

/**
 * Validate split percentages
 */
export function validateSplitPercentages(percentages: number[]): boolean {
  const total = percentages.reduce((sum, p) => sum + p, 0);
  return total === 10000; // 100% in basis points
}

/**
 * Generate signature for message
 */
export async function signMessage(wallet: ethers.Wallet, message: string): Promise<string> {
  return await wallet.signMessage(message);
}

/**
 * Verify message signature
 */
export function verifyMessage(message: string, signature: string): string {
  return ethers.verifyMessage(message, signature);
}

/**
 * Generate hash for signing
 */
export function generateMessageHash(data: any[]): string {
  return ethers.keccak256(ethers.solidityPacked(['string'], [JSON.stringify(data)]));
}

/**
 * Sleep utility
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry utility
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let i = 0; i < maxAttempts; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (i < maxAttempts - 1) {
        await sleep(delay * Math.pow(2, i)); // Exponential backoff
      }
    }
  }
  
  throw lastError!;
}

/**
 * Format error message
 */
export function formatError(error: any): string {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error?.message) {
    return error.message;
  }
  
  if (error?.reason) {
    return error.reason;
  }
  
  return 'Unknown error occurred';
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: any): boolean {
  const retryableErrors = [
    'NETWORK_ERROR',
    'TIMEOUT',
    'RATE_LIMIT_EXCEEDED',
    'SERVICE_UNAVAILABLE',
  ];
  
  const errorMessage = formatError(error).toUpperCase();
  return retryableErrors.some(retryableError => 
    errorMessage.includes(retryableError)
  );
}
