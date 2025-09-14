import { ethers } from 'ethers';
import { VyraConfig, SessionKey, GasEstimate, VyraResponse } from './types';

export class VyraPaymaster {
  private provider: ethers.Provider;
  private config: VyraConfig;
  private signer?: ethers.Wallet;

  constructor(provider: ethers.Provider, config: VyraConfig) {
    this.provider = provider;
    this.config = config;
  }

  /**
   * Connect paymaster wallet
   */
  connect(privateKey: string): void {
    this.signer = new ethers.Wallet(privateKey, this.provider);
  }

  /**
   * Create session key for gasless transactions
   */
  async createSessionKey(expiry: number): Promise<VyraResponse<SessionKey>> {
    try {
      if (!this.signer) {
        throw new Error('Paymaster wallet not connected');
      }

      const paymasterContract = new ethers.Contract(
        this.config.paymasterAddress,
        [
          'function createSessionKey(address sessionKey, uint256 expiry)',
        ],
        this.signer
      );

      // Generate session key
      const sessionWallet = ethers.Wallet.createRandom();
      const sessionKey = sessionWallet.address;

      const tx = await paymasterContract.createSessionKey(sessionKey, expiry);

      return {
        success: true,
        data: {
          address: sessionKey,
          nonce: 0,
          expiry,
          active: true,
        },
        txHash: tx.hash,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'SESSION_KEY_CREATE_FAILED',
          message: (error as Error).message,
        },
      };
    }
  }

  /**
   * Revoke session key
   */
  async revokeSessionKey(): Promise<VyraResponse<boolean>> {
    try {
      if (!this.signer) {
        throw new Error('Paymaster wallet not connected');
      }

      const paymasterContract = new ethers.Contract(
        this.config.paymasterAddress,
        [
          'function revokeSessionKey()',
        ],
        this.signer
      );

      const tx = await paymasterContract.revokeSessionKey();

      return {
        success: true,
        data: true,
        txHash: tx.hash,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'SESSION_KEY_REVOKE_FAILED',
          message: (error as Error).message,
        },
      };
    }
  }

  /**
   * Add sponsor balance for gas sponsorship
   */
  async addSponsorBalance(user: string, amount: string): Promise<VyraResponse<string>> {
    try {
      if (!this.signer) {
        throw new Error('Paymaster wallet not connected');
      }

      const paymasterContract = new ethers.Contract(
        this.config.paymasterAddress,
        [
          'function addSponsorBalance(address user, uint256 amount)',
        ],
        this.signer
      );

      const amountWei = ethers.parseEther(amount);
      const tx = await paymasterContract.addSponsorBalance(user, amountWei);

      return {
        success: true,
        data: tx.hash,
        txHash: tx.hash,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'SPONSOR_BALANCE_ADD_FAILED',
          message: (error as Error).message,
        },
      };
    }
  }

  /**
   * Check if user has sufficient sponsor balance
   */
  async hasSponsorBalance(user: string, gasEstimate: string): Promise<VyraResponse<boolean>> {
    try {
      const paymasterContract = new ethers.Contract(
        this.config.paymasterAddress,
        [
          'function hasSponsorBalance(address user, uint256 gasEstimate) view returns (bool)',
        ],
        this.provider
      );

      const hasBalance = await paymasterContract.hasSponsorBalance(user, gasEstimate);

      return {
        success: true,
        data: hasBalance,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'SPONSOR_BALANCE_CHECK_FAILED',
          message: (error as Error).message,
        },
      };
    }
  }

  /**
   * Get required VYR amount for gas sponsorship
   */
  async getRequiredVyrAmount(gasEstimate: string): Promise<VyraResponse<string>> {
    try {
      const paymasterContract = new ethers.Contract(
        this.config.paymasterAddress,
        [
          'function getRequiredVyrAmount(uint256 gasEstimate) view returns (uint256)',
        ],
        this.provider
      );

      const vyrAmount = await paymasterContract.getRequiredVyrAmount(gasEstimate);

      return {
        success: true,
        data: ethers.formatEther(vyrAmount),
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'VYR_AMOUNT_CALCULATE_FAILED',
          message: (error as Error).message,
        },
      };
    }
  }

  /**
   * Estimate gas for sponsored transaction
   */
  async estimateGasForSponsoredTx(to: string, data: string, value: string = '0'): Promise<VyraResponse<GasEstimate>> {
    try {
      const gasEstimate = await this.provider.estimateGas({
        to,
        data,
        value: ethers.parseEther(value),
      });

      const feeData = await this.provider.getFeeData();
      const gasPrice = feeData.gasPrice || BigInt(0);

      // Calculate VYR cost
      const gasCost = gasEstimate * gasPrice;
      const vyrCost = await this.getRequiredVyrAmount(gasEstimate.toString());

      return {
        success: true,
        data: {
          gasLimit: gasEstimate.toString(),
          gasPrice: gasPrice.toString(),
          maxFeePerGas: feeData.maxFeePerGas?.toString(),
          maxPriorityFeePerGas: feeData.maxPriorityFeePerGas?.toString(),
          vyrCost: vyrCost.data || '0',
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'GAS_ESTIMATE_FAILED',
          message: (error as Error).message,
        },
      };
    }
  }

  /**
   * Validate session key
   */
  async validateSessionKey(
    user: string,
    sessionKey: string,
    nonce: number,
    signature: string
  ): Promise<VyraResponse<boolean>> {
    try {
      const paymasterContract = new ethers.Contract(
        this.config.paymasterAddress,
        [
          'function validateSessionKey(address user, address sessionKey, uint256 nonce, bytes calldata signature) view returns (bool)',
        ],
        this.provider
      );

      const isValid = await paymasterContract.validateSessionKey(user, sessionKey, nonce, signature);

      return {
        success: true,
        data: isValid,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'SESSION_KEY_VALIDATE_FAILED',
          message: (error as Error).message,
        },
      };
    }
  }

  /**
   * Get paymaster statistics
   */
  async getPaymasterStats(): Promise<VyraResponse<any>> {
    try {
      const paymasterContract = new ethers.Contract(
        this.config.paymasterAddress,
        [
          'function totalSponsoredGas() view returns (uint256)',
          'function totalVyrSpent() view returns (uint256)',
          'function totalSponsorships() view returns (uint256)',
        ],
        this.provider
      );

      const [totalSponsoredGas, totalVyrSpent, totalSponsorships] = await Promise.all([
        paymasterContract.totalSponsoredGas(),
        paymasterContract.totalVyrSpent(),
        paymasterContract.totalSponsorships(),
      ]);

      return {
        success: true,
        data: {
          totalSponsoredGas: totalSponsoredGas.toString(),
          totalVyrSpent: ethers.formatEther(totalVyrSpent),
          totalSponsorships: totalSponsorships.toString(),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'PAYMASTER_STATS_FETCH_FAILED',
          message: (error as Error).message,
        },
      };
    }
  }
}
