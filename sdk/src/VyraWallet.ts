import { ethers } from 'ethers';
import { VyraConfig, PaymentRequest, WalletInfo, GasEstimate, TransactionOptions, VyraResponse, SessionKey, VyraError } from './types';

export class VyraWallet {
  private provider: ethers.Provider;
  private config: VyraConfig;
  private signer?: ethers.Wallet | ethers.HDNodeWallet;

  constructor(provider: ethers.Provider, config: VyraConfig) {
    this.provider = provider;
    this.config = config;
  }

  /**
   * Connect wallet with private key
   */
  connect(privateKey: string): void {
    this.signer = new ethers.Wallet(privateKey, this.provider);
  }

  /**
   * Connect wallet with mnemonic
   */
  connectWithMnemonic(mnemonic: string, index: number = 0): void {
    const wallet = ethers.Wallet.fromPhrase(mnemonic);
    this.signer = wallet.connect(this.provider);
  }

  /**
   * Get wallet address
   */
  getAddress(): string | null {
    return this.signer?.address || null;
  }

  /**
   * Get wallet info
   */
  async getWalletInfo(): Promise<VyraResponse<WalletInfo>> {
    try {
      if (!this.signer) {
        throw new Error('Wallet not connected');
      }

      const address = this.signer.address;
      const balance = await this.provider.getBalance(address);
      const vyraBalance = await this.getVyraBalance();

      return {
        success: true,
        data: {
          address,
          balance: ethers.formatEther(balance),
          vyraBalance: ethers.formatEther(vyraBalance),
          isSponsored: false, // TODO: Check with paymaster
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          name: 'VyraError',
          code: 'WALLET_INFO_FETCH_FAILED',
          message: (error as Error).message,
        } as VyraError,
      };
    }
  }

  /**
   * Get VYR token balance
   */
  async getVyraBalance(): Promise<bigint> {
    if (!this.signer) {
      throw new Error('Wallet not connected');
    }

    const vyraToken = new ethers.Contract(
      this.config.vyraTokenAddress,
      [
        'function balanceOf(address owner) view returns (uint256)',
      ],
      this.provider
    );

    return await vyraToken.balanceOf(this.signer.address);
  }

  /**
   * Send VYR tokens
   */
  async sendPayment(request: PaymentRequest, options?: TransactionOptions): Promise<VyraResponse<string>> {
    try {
      if (!this.signer) {
        throw new Error('Wallet not connected');
      }

      const vyraToken = new ethers.Contract(
        this.config.vyraTokenAddress,
        [
          'function transfer(address to, uint256 amount) returns (bool)',
          'function balanceOf(address owner) view returns (uint256)',
        ],
        this.signer
      );

      const amount = ethers.parseEther(request.amount);
      const balance = await vyraToken.balanceOf(this.signer.address);

      if (balance < amount) {
        throw new Error('Insufficient VYR balance');
      }

      const tx = await vyraToken.transfer(request.to, amount, {
        gasLimit: options?.gasLimit,
        gasPrice: options?.gasPrice,
        maxFeePerGas: options?.maxFeePerGas,
        maxPriorityFeePerGas: options?.maxPriorityFeePerGas,
        nonce: options?.nonce,
      });

      return {
        success: true,
        data: tx.hash,
        txHash: tx.hash,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          name: 'VyraError',
          code: 'PAYMENT_SEND_FAILED',
          message: (error as Error).message,
        } as VyraError,
      };
    }
  }

  /**
   * Estimate gas for payment
   */
  async estimateGasForPayment(request: PaymentRequest): Promise<VyraResponse<GasEstimate>> {
    try {
      if (!this.signer) {
        throw new Error('Wallet not connected');
      }

      const vyraToken = new ethers.Contract(
        this.config.vyraTokenAddress,
        [
          'function transfer(address to, uint256 amount) returns (bool)',
        ],
        this.signer
      );

      const amount = ethers.parseEther(request.amount);
      const gasLimit = await vyraToken.transfer.estimateGas(request.to, amount);
      const feeData = await this.provider.getFeeData();
      const gasPrice = feeData.gasPrice || BigInt(0);

      // Calculate VYR cost (simplified)
      const gasCost = gasLimit * gasPrice;
      const vyrCost = gasCost; // 1:1 for simplicity

      return {
        success: true,
        data: {
          gasLimit: gasLimit.toString(),
          gasPrice: gasPrice.toString(),
          maxFeePerGas: feeData.maxFeePerGas?.toString(),
          maxPriorityFeePerGas: feeData.maxPriorityFeePerGas?.toString(),
          vyrCost: ethers.formatEther(vyrCost),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          name: 'VyraError',
          code: 'GAS_ESTIMATE_FAILED',
          message: (error as Error).message,
        } as VyraError,
      };
    }
  }

  /**
   * Create session key for gasless transactions
   */
  async createSessionKey(expiry: number): Promise<VyraResponse<SessionKey>> {
    try {
      if (!this.signer) {
        throw new Error('Wallet not connected');
      }

      // Generate session key
      const sessionWallet = ethers.Wallet.createRandom();
      const sessionKey = sessionWallet.address;

      // TODO: Call paymaster contract to create session key
      // This would involve signing a message and calling the paymaster

      return {
        success: true,
        data: {
          address: sessionKey,
          nonce: 0,
          expiry,
          active: true,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          name: 'VyraError',
          code: 'SESSION_KEY_CREATE_FAILED',
          message: (error as Error).message,
        } as VyraError,
      };
    }
  }

  /**
   * Revoke session key
   */
  async revokeSessionKey(): Promise<VyraResponse<boolean>> {
    try {
      if (!this.signer) {
        throw new Error('Wallet not connected');
      }

      // TODO: Call paymaster contract to revoke session key

      return {
        success: true,
        data: true,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          name: 'VyraError',
          code: 'SESSION_KEY_REVOKE_FAILED',
          message: (error as Error).message,
        } as VyraError,
      };
    }
  }

  /**
   * Sign message for authentication
   */
  async signMessage(message: string): Promise<VyraResponse<string>> {
    try {
      if (!this.signer) {
        throw new Error('Wallet not connected');
      }

      const signature = await this.signer.signMessage(message);
      return {
        success: true,
        data: signature,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          name: 'VyraError',
          code: 'MESSAGE_SIGN_FAILED',
          message: (error as Error).message,
        } as VyraError,
      };
    }
  }

  /**
   * Verify message signature
   */
  async verifyMessage(message: string, signature: string): Promise<VyraResponse<string>> {
    try {
      const recoveredAddress = ethers.verifyMessage(message, signature);
      return {
        success: true,
        data: recoveredAddress,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          name: 'VyraError',
          code: 'MESSAGE_VERIFY_FAILED',
          message: (error as Error).message,
        } as VyraError,
      };
    }
  }

  /**
   * Get transaction history
   */
  async getTransactionHistory(limit: number = 10): Promise<VyraResponse<any[]>> {
    try {
      if (!this.signer) {
        throw new Error('Wallet not connected');
      }

      // TODO: Implement transaction history fetching
      // This would typically involve querying an indexer or subgraph

      return {
        success: true,
        data: [],
      };
    } catch (error) {
      return {
        success: false,
        error: {
          name: 'VyraError',
          code: 'TRANSACTION_HISTORY_FETCH_FAILED',
          message: (error as Error).message,
        } as VyraError,
      };
    }
  }

  /**
   * Disconnect wallet
   */
  disconnect(): void {
    this.signer = undefined;
  }
}
