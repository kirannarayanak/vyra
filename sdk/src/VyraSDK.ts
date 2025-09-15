import { ethers } from 'ethers';
import { VyraConfig, VyraResponse, NetworkInfo, ErrorInfo, VyraError } from './types';
import { VyraWallet } from './VyraWallet';
import { VyraMerchant } from './VyraMerchant';
import { VyraPaymaster } from './VyraPaymaster';
import { VyraBridge } from './VyraBridge';
import { NETWORKS } from './constants';

export class VyraSDK {
  private provider: ethers.Provider;
  private config: VyraConfig;
  private wallet: VyraWallet;
  private merchant: VyraMerchant;
  private paymaster: VyraPaymaster;
  private bridge: VyraBridge;

  constructor(config: VyraConfig) {
    this.config = config;
    this.provider = new ethers.JsonRpcProvider(config.rpcUrl);
    
    // Initialize modules
    this.wallet = new VyraWallet(this.provider, config);
    this.merchant = new VyraMerchant(this.provider, config);
    this.paymaster = new VyraPaymaster(this.provider, config);
    this.bridge = new VyraBridge(this.provider, config);
  }

  /**
   * Get wallet instance
   */
  getWallet(): VyraWallet {
    return this.wallet;
  }

  /**
   * Get merchant instance
   */
  getMerchant(): VyraMerchant {
    return this.merchant;
  }

  /**
   * Get paymaster instance
   */
  getPaymaster(): VyraPaymaster {
    return this.paymaster;
  }

  /**
   * Get bridge instance
   */
  getBridge(): VyraBridge {
    return this.bridge;
  }

  /**
   * Get current network configuration
   */
  getNetwork(): NetworkInfo {
    return NETWORKS[this.config.chainId] || {
      name: 'Unknown',
      chainId: this.config.chainId,
      rpcUrl: this.config.rpcUrl,
      blockExplorer: '',
      vyraTokenAddress: this.config.vyraTokenAddress,
      paymasterAddress: this.config.paymasterAddress,
      posAddress: this.config.posAddress,
      bridgeAddress: this.config.bridgeAddress,
      entryPointAddress: this.config.entryPointAddress,
    };
  }

  /**
   * Switch to a different network
   */
  async switchNetwork(chainId: number): Promise<VyraResponse<NetworkInfo>> {
    try {
      const network = NETWORKS[chainId];
      if (!network) {
        throw new Error(`Unsupported network: ${chainId}`);
      }

      // Update configuration
      this.config = {
        rpcUrl: network.rpcUrl,
        chainId: network.chainId,
        vyraTokenAddress: network.vyraTokenAddress,
        paymasterAddress: network.paymasterAddress,
        posAddress: network.posAddress,
        bridgeAddress: network.bridgeAddress,
        entryPointAddress: network.entryPointAddress,
      };

      // Update provider
      this.provider = new ethers.JsonRpcProvider(network.rpcUrl);

      // Reinitialize modules
      this.wallet = new VyraWallet(this.provider, this.config);
      this.merchant = new VyraMerchant(this.provider, this.config);
      this.paymaster = new VyraPaymaster(this.provider, this.config);
      this.bridge = new VyraBridge(this.provider, this.config);

      return {
        success: true,
        data: network,
      };
    } catch (error) {
      return {
        success: false,
        error: this.createError(error as Error, 'NETWORK_SWITCH_FAILED'),
      };
    }
  }

  /**
   * Get SDK version
   */
  getVersion(): string {
    return '0.1.0';
  }

  /**
   * Check if SDK is properly initialized
   */
  async isInitialized(): Promise<boolean> {
    try {
      const network = await this.provider.getNetwork();
      return network.chainId === BigInt(this.config.chainId);
    } catch {
      return false;
    }
  }

  /**
   * Get current gas price
   */
  async getGasPrice(): Promise<VyraResponse<string>> {
    try {
      const feeData = await this.provider.getFeeData();
      const gasPrice = feeData.gasPrice || BigInt(0);
      return {
        success: true,
        data: gasPrice.toString(),
      };
    } catch (error) {
      return {
        success: false,
        error: this.createError(error as Error, 'GAS_PRICE_FETCH_FAILED'),
      };
    }
  }

  /**
   * Get current block number
   */
  async getBlockNumber(): Promise<VyraResponse<number>> {
    try {
      const blockNumber = await this.provider.getBlockNumber();
      return {
        success: true,
        data: blockNumber,
      };
    } catch (error) {
      return {
        success: false,
        error: this.createError(error as Error, 'BLOCK_NUMBER_FETCH_FAILED'),
      };
    }
  }

  /**
   * Wait for transaction confirmation
   */
  async waitForTransaction(txHash: string, confirmations: number = 1): Promise<VyraResponse<ethers.TransactionReceipt>> {
    try {
      const receipt = await this.provider.waitForTransaction(txHash, confirmations);
      if (!receipt) {
        throw new Error('Transaction not found');
      }
      return {
        success: true,
        data: receipt,
        txHash,
      };
    } catch (error) {
      return {
        success: false,
        error: this.createError(error as Error, 'TRANSACTION_WAIT_FAILED', { txHash }),
      };
    }
  }

  /**
   * Create a standardized error
   */
  private createError(error: Error, code: string, details?: any): VyraError {
    return {
      name: 'VyraError',
      code,
      message: error.message,
      details,
    } as VyraError;
  }

  /**
   * Static method to create SDK instance for mainnet
   */
  static forMainnet(rpcUrl?: string): VyraSDK {
    const network = NETWORKS[1];
    return new VyraSDK({
      rpcUrl: rpcUrl || network.rpcUrl,
      chainId: network.chainId,
      vyraTokenAddress: network.vyraTokenAddress,
      paymasterAddress: network.paymasterAddress,
      posAddress: network.posAddress,
      bridgeAddress: network.bridgeAddress,
      entryPointAddress: network.entryPointAddress,
    });
  }

  /**
   * Static method to create SDK instance for testnet
   */
  static forTestnet(rpcUrl?: string): VyraSDK {
    const network = NETWORKS[11155111]; // Sepolia
    return new VyraSDK({
      rpcUrl: rpcUrl || network.rpcUrl,
      chainId: network.chainId,
      vyraTokenAddress: network.vyraTokenAddress,
      paymasterAddress: network.paymasterAddress,
      posAddress: network.posAddress,
      bridgeAddress: network.bridgeAddress,
      entryPointAddress: network.entryPointAddress,
    });
  }

  /**
   * Static method to create SDK instance for local development
   */
  static forLocal(rpcUrl: string = 'http://localhost:8545'): VyraSDK {
    return new VyraSDK({
      rpcUrl,
      chainId: 31337,
      vyraTokenAddress: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
      paymasterAddress: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
      posAddress: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
      bridgeAddress: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',
      entryPointAddress: '0x0165878A594ca255338adfa4d48449f69242Eb8F',
    });
  }
}
