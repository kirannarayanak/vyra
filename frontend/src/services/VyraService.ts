import { ethers } from 'ethers';
import { VyraConfig, VyraResponse, PaymentRequest, InvoiceRequest, Transaction } from '../types';

export class VyraService {
  private provider: ethers.Provider;
  private config: VyraConfig;
  private signer?: ethers.Wallet;

  constructor(config: VyraConfig) {
    this.config = config;
    this.provider = new ethers.JsonRpcProvider(config.rpcUrl);
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
   * Get wallet balance
   */
  async getBalance(): Promise<VyraResponse<string>> {
    try {
      if (!this.signer) {
        throw new Error('Wallet not connected');
      }

      const balance = await this.provider.getBalance(this.signer.address);
      return {
        success: true,
        data: ethers.formatEther(balance),
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'BALANCE_FETCH_FAILED',
          message: (error as Error).message,
        },
      };
    }
  }

  /**
   * Get VYR token balance
   */
  async getVyraBalance(): Promise<VyraResponse<string>> {
    try {
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

      const balance = await vyraToken.balanceOf(this.signer.address);
      return {
        success: true,
        data: ethers.formatEther(balance),
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'VYRA_BALANCE_FETCH_FAILED',
          message: (error as Error).message,
        },
      };
    }
  }

  /**
   * Send VYR tokens
   */
  async sendPayment(request: PaymentRequest): Promise<VyraResponse<string>> {
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

      const tx = await vyraToken.transfer(request.to, amount);
      
      return {
        success: true,
        data: tx.hash,
        txHash: tx.hash,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'PAYMENT_SEND_FAILED',
          message: (error as Error).message,
        },
      };
    }
  }

  /**
   * Create payment invoice
   */
  async createInvoice(request: InvoiceRequest): Promise<VyraResponse<string>> {
    try {
      if (!this.signer) {
        throw new Error('Wallet not connected');
      }

      const posContract = new ethers.Contract(
        this.config.posAddress,
        [
          'function createInvoice(uint256 amount, string calldata description, uint256 expiry, bytes calldata signature) returns (bytes32)',
        ],
        this.signer
      );

      const amount = ethers.parseEther(request.amount);
      const expiry = request.expiry || Math.floor(Date.now() / 1000) + 3600; // 1 hour default

      // Create signature
      const messageHash = ethers.keccak256(ethers.solidityPacked(
        ['address', 'uint256', 'bytes32', 'uint256', 'uint256', 'uint256'],
        [
          this.signer.address,
          amount,
          ethers.keccak256(ethers.toUtf8Bytes(request.description)),
          expiry,
          0, // nonce - would need to track this
          await this.provider.getNetwork().then(n => n.chainId)
        ]
      ));

      const signature = await this.signer.signMessage(ethers.getBytes(messageHash));

      const tx = await posContract.createInvoice(
        amount,
        request.description,
        expiry,
        signature
      );

      return {
        success: true,
        data: tx.hash,
        txHash: tx.hash,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'INVOICE_CREATE_FAILED',
          message: (error as Error).message,
        },
      };
    }
  }

  /**
   * Get transaction history
   */
  async getTransactionHistory(limit: number = 10): Promise<VyraResponse<Transaction[]>> {
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
          code: 'TRANSACTION_HISTORY_FETCH_FAILED',
          message: (error as Error).message,
        },
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
          code: 'MESSAGE_SIGN_FAILED',
          message: (error as Error).message,
        },
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
