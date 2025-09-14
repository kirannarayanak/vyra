import { useState, useEffect, useCallback } from 'react';
import { VyraService } from '../services/VyraService';
import { WalletState, VyraConfig, PaymentRequest, InvoiceRequest } from '../types';

const DEFAULT_CONFIG: VyraConfig = {
  rpcUrl: 'http://localhost:8545',
  chainId: 31337,
  vyraTokenAddress: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
  paymasterAddress: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
  posAddress: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
  bridgeAddress: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',
  entryPointAddress: '0x0165878A594ca255338adfa4d48449f69242Eb8F',
};

export const useWallet = () => {
  const [walletState, setWalletState] = useState<WalletState>({
    address: null,
    balance: '0',
    vyraBalance: '0',
    isConnected: false,
    isUnlocked: false,
  });

  const [vyraService] = useState(() => new VyraService(DEFAULT_CONFIG));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Connect wallet with private key
   */
  const connectWithPrivateKey = useCallback(async (privateKey: string) => {
    try {
      setIsLoading(true);
      setError(null);

      vyraService.connect(privateKey);
      const address = vyraService.getAddress();

      if (!address) {
        throw new Error('Failed to connect wallet');
      }

      // Get balances
      const [balanceResult, vyraBalanceResult] = await Promise.all([
        vyraService.getBalance(),
        vyraService.getVyraBalance(),
      ]);

      setWalletState({
        address,
        balance: balanceResult.data || '0',
        vyraBalance: vyraBalanceResult.data || '0',
        isConnected: true,
        isUnlocked: true,
      });
    } catch (err) {
      setError((err as Error).message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [vyraService]);

  /**
   * Connect wallet with mnemonic
   */
  const connectWithMnemonic = useCallback(async (mnemonic: string, index: number = 0) => {
    try {
      setIsLoading(true);
      setError(null);

      vyraService.connectWithMnemonic(mnemonic, index);
      const address = vyraService.getAddress();

      if (!address) {
        throw new Error('Failed to connect wallet');
      }

      // Get balances
      const [balanceResult, vyraBalanceResult] = await Promise.all([
        vyraService.getBalance(),
        vyraService.getVyraBalance(),
      ]);

      setWalletState({
        address,
        balance: balanceResult.data || '0',
        vyraBalance: vyraBalanceResult.data || '0',
        isConnected: true,
        isUnlocked: true,
      });
    } catch (err) {
      setError((err as Error).message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [vyraService]);

  /**
   * Send payment
   */
  const sendPayment = useCallback(async (request: PaymentRequest) => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await vyraService.sendPayment(request);

      if (!result.success) {
        throw new Error(result.error?.message || 'Payment failed');
      }

      // Refresh balances after successful payment
      await refreshBalances();

      return result;
    } catch (err) {
      setError((err as Error).message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [vyraService]);

  /**
   * Create invoice
   */
  const createInvoice = useCallback(async (request: InvoiceRequest) => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await vyraService.createInvoice(request);

      if (!result.success) {
        throw new Error(result.error?.message || 'Invoice creation failed');
      }

      return result;
    } catch (err) {
      setError((err as Error).message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [vyraService]);

  /**
   * Refresh wallet balances
   */
  const refreshBalances = useCallback(async () => {
    if (!walletState.isConnected) return;

    try {
      const [balanceResult, vyraBalanceResult] = await Promise.all([
        vyraService.getBalance(),
        vyraService.getVyraBalance(),
      ]);

      setWalletState(prev => ({
        ...prev,
        balance: balanceResult.data || '0',
        vyraBalance: vyraBalanceResult.data || '0',
      }));
    } catch (err) {
      console.error('Failed to refresh balances:', err);
    }
  }, [vyraService, walletState.isConnected]);

  /**
   * Sign message
   */
  const signMessage = useCallback(async (message: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await vyraService.signMessage(message);

      if (!result.success) {
        throw new Error(result.error?.message || 'Message signing failed');
      }

      return result;
    } catch (err) {
      setError((err as Error).message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [vyraService]);

  /**
   * Disconnect wallet
   */
  const disconnect = useCallback(() => {
    vyraService.disconnect();
    setWalletState({
      address: null,
      balance: '0',
      vyraBalance: '0',
      isConnected: false,
      isUnlocked: false,
    });
    setError(null);
  }, [vyraService]);

  /**
   * Clear error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Auto-refresh balances when connected
  useEffect(() => {
    if (walletState.isConnected) {
      const interval = setInterval(refreshBalances, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [walletState.isConnected, refreshBalances]);

  return {
    walletState,
    isLoading,
    error,
    connectWithPrivateKey,
    connectWithMnemonic,
    sendPayment,
    createInvoice,
    refreshBalances,
    signMessage,
    disconnect,
    clearError,
  };
};
