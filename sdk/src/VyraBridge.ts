import { ethers } from 'ethers';
import { VyraConfig, BridgeDeposit, BridgeWithdrawal, VyraResponse, VyraError } from './types';

export class VyraBridge {
  private provider: ethers.Provider;
  private config: VyraConfig;
  private signer?: ethers.Wallet;

  constructor(provider: ethers.Provider, config: VyraConfig) {
    this.provider = provider;
    this.config = config;
  }

  /**
   * Connect bridge wallet
   */
  connect(privateKey: string): void {
    this.signer = new ethers.Wallet(privateKey, this.provider);
  }

  /**
   * Initiate deposit to L2
   */
  async deposit(amount: string): Promise<VyraResponse<string>> {
    try {
      if (!this.signer) {
        throw new Error('Bridge wallet not connected');
      }

      const bridgeContract = new ethers.Contract(
        this.config.bridgeAddress,
        [
          'function deposit(uint256 amount) returns (bytes32)',
        ],
        this.signer
      );

      const amountWei = ethers.parseEther(amount);
      const tx = await bridgeContract.deposit(amountWei);

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
          code: 'DEPOSIT_FAILED',
          message: (error as Error).message,
        } as VyraError,
      };
    }
  }

  /**
   * Process deposit (relayer function)
   */
  async processDeposit(depositId: string, signatures: string[]): Promise<VyraResponse<string>> {
    try {
      if (!this.signer) {
        throw new Error('Bridge wallet not connected');
      }

      const bridgeContract = new ethers.Contract(
        this.config.bridgeAddress,
        [
          'function processDeposit(bytes32 depositId, bytes[] calldata signatures)',
        ],
        this.signer
      );

      const tx = await bridgeContract.processDeposit(depositId, signatures);

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
          code: 'DEPOSIT_PROCESS_FAILED',
          message: (error as Error).message,
        } as VyraError,
      };
    }
  }

  /**
   * Initiate withdrawal from L2
   */
  async initiateWithdrawal(
    amount: string,
    l2TxHash: string,
    signatures: string[]
  ): Promise<VyraResponse<string>> {
    try {
      if (!this.signer) {
        throw new Error('Bridge wallet not connected');
      }

      const bridgeContract = new ethers.Contract(
        this.config.bridgeAddress,
        [
          'function initiateWithdrawal(uint256 amount, bytes32 l2TxHash, bytes[] calldata signatures) returns (bytes32)',
        ],
        this.signer
      );

      const amountWei = ethers.parseEther(amount);
      const tx = await bridgeContract.initiateWithdrawal(amountWei, l2TxHash, signatures);

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
          code: 'WITHDRAWAL_FAILED',
          message: (error as Error).message,
        } as VyraError,
      };
    }
  }

  /**
   * Get bridge statistics
   */
  async getBridgeStats(): Promise<VyraResponse<any>> {
    try {
      const bridgeContract = new ethers.Contract(
        this.config.bridgeAddress,
        [
          'function getBridgeStats() view returns (uint256 totalDeposits, uint256 totalWithdrawals, uint256 totalFees, uint256 validatorCount)',
        ],
        this.provider
      );

      const [totalDeposits, totalWithdrawals, totalFees, validatorCount] = await bridgeContract.getBridgeStats();

      return {
        success: true,
        data: {
          totalDeposits: ethers.formatEther(totalDeposits),
          totalWithdrawals: ethers.formatEther(totalWithdrawals),
          totalFees: ethers.formatEther(totalFees),
          validatorCount: validatorCount.toString(),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          name: 'VyraError',
          code: 'BRIDGE_STATS_FETCH_FAILED',
          message: (error as Error).message,
        } as VyraError,
      };
    }
  }

  /**
   * Get validators
   */
  async getValidators(): Promise<VyraResponse<string[]>> {
    try {
      const bridgeContract = new ethers.Contract(
        this.config.bridgeAddress,
        [
          'function getValidators() view returns (address[])',
        ],
        this.provider
      );

      const validators = await bridgeContract.getValidators();

      return {
        success: true,
        data: validators,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          name: 'VyraError',
          code: 'VALIDATORS_FETCH_FAILED',
          message: (error as Error).message,
        } as VyraError,
      };
    }
  }

  /**
   * Check if deposit is processed
   */
  async isDepositProcessed(depositId: string): Promise<VyraResponse<boolean>> {
    try {
      const bridgeContract = new ethers.Contract(
        this.config.bridgeAddress,
        [
          'function processedDeposits(bytes32) view returns (bool)',
        ],
        this.provider
      );

      const isProcessed = await bridgeContract.processedDeposits(depositId);

      return {
        success: true,
        data: isProcessed,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          name: 'VyraError',
          code: 'DEPOSIT_STATUS_CHECK_FAILED',
          message: (error as Error).message,
        } as VyraError,
      };
    }
  }

  /**
   * Check if withdrawal is processed
   */
  async isWithdrawalProcessed(withdrawalId: string): Promise<VyraResponse<boolean>> {
    try {
      const bridgeContract = new ethers.Contract(
        this.config.bridgeAddress,
        [
          'function processedWithdrawals(bytes32) view returns (bool)',
        ],
        this.provider
      );

      const isProcessed = await bridgeContract.processedWithdrawals(withdrawalId);

      return {
        success: true,
        data: isProcessed,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          name: 'VyraError',
          code: 'WITHDRAWAL_STATUS_CHECK_FAILED',
          message: (error as Error).message,
        } as VyraError,
      };
    }
  }

  /**
   * Get deposit history
   */
  async getDepositHistory(limit: number = 10): Promise<VyraResponse<BridgeDeposit[]>> {
    try {
      // TODO: Implement deposit history fetching
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
          code: 'DEPOSIT_HISTORY_FETCH_FAILED',
          message: (error as Error).message,
        } as VyraError,
      };
    }
  }

  /**
   * Get withdrawal history
   */
  async getWithdrawalHistory(limit: number = 10): Promise<VyraResponse<BridgeWithdrawal[]>> {
    try {
      // TODO: Implement withdrawal history fetching
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
          code: 'WITHDRAWAL_HISTORY_FETCH_FAILED',
          message: (error as Error).message,
        } as VyraError,
      };
    }
  }
}
