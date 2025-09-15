import { ethers } from 'ethers';
import { VyraConfig, InvoiceRequest, SplitPaymentRequest, MerchantStats, PaymentReceipt, VyraResponse, VyraError } from './types';

export class VyraMerchant {
  private provider: ethers.Provider;
  private config: VyraConfig;
  private signer?: ethers.Wallet;

  constructor(provider: ethers.Provider, config: VyraConfig) {
    this.provider = provider;
    this.config = config;
  }

  /**
   * Connect merchant wallet
   */
  connect(privateKey: string): void {
    this.signer = new ethers.Wallet(privateKey, this.provider);
  }

  /**
   * Create payment invoice
   */
  async createInvoice(request: InvoiceRequest): Promise<VyraResponse<string>> {
    try {
      if (!this.signer) {
        throw new Error('Merchant wallet not connected');
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
          name: 'VyraError',
          code: 'INVOICE_CREATE_FAILED',
          message: (error as Error).message,
        } as VyraError,
      };
    }
  }

  /**
   * Process payment for invoice
   */
  async processPayment(invoiceId: string, customer: string): Promise<VyraResponse<string>> {
    try {
      if (!this.signer) {
        throw new Error('Merchant wallet not connected');
      }

      const posContract = new ethers.Contract(
        this.config.posAddress,
        [
          'function processPayment(bytes32 invoiceId, address customer, bytes calldata signature) returns (bytes32)',
        ],
        this.signer
      );

      // Create customer signature (this would typically be done by the customer)
      const messageHash = ethers.keccak256(ethers.solidityPacked(
        ['address', 'bytes32', 'uint256', 'uint256'],
        [
          customer,
          invoiceId,
          0, // amount - would need to get from invoice
          await this.provider.getNetwork().then(n => n.chainId)
        ]
      ));

      const signature = await this.signer.signMessage(ethers.getBytes(messageHash));

      const tx = await posContract.processPayment(invoiceId, customer, signature);

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
          code: 'PAYMENT_PROCESS_FAILED',
          message: (error as Error).message,
        } as VyraError,
      };
    }
  }

  /**
   * Process split payment
   */
  async processSplitPayment(request: SplitPaymentRequest, customer: string): Promise<VyraResponse<string>> {
    try {
      if (!this.signer) {
        throw new Error('Merchant wallet not connected');
      }

      const posContract = new ethers.Contract(
        this.config.posAddress,
        [
          'function processSplitPayment(address[] calldata recipients, uint256[] calldata percentages, uint256 totalAmount, address customer, bytes calldata signature) returns (bytes32)',
        ],
        this.signer
      );

      const totalAmount = ethers.parseEther(request.totalAmount);

      // Create signature
      const messageHash = ethers.keccak256(ethers.solidityPacked(
        ['address', 'address[]', 'uint256[]', 'uint256', 'uint256'],
        [
          customer,
          request.recipients,
          request.percentages,
          totalAmount,
          await this.provider.getNetwork().then(n => n.chainId)
        ]
      ));

      const signature = await this.signer.signMessage(ethers.getBytes(messageHash));

      const tx = await posContract.processSplitPayment(
        request.recipients,
        request.percentages,
        totalAmount,
        customer,
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
          name: 'VyraError',
          code: 'SPLIT_PAYMENT_FAILED',
          message: (error as Error).message,
        } as VyraError,
      };
    }
  }

  /**
   * Get merchant statistics
   */
  async getMerchantStats(): Promise<VyraResponse<MerchantStats>> {
    try {
      if (!this.signer) {
        throw new Error('Merchant wallet not connected');
      }

      const posContract = new ethers.Contract(
        this.config.posAddress,
        [
          'function getMerchantStats(address merchant) view returns (uint256 earnings, uint256 transactionCount)',
        ],
        this.provider
      );

      const [earnings, transactionCount] = await posContract.getMerchantStats(this.signer.address);

      return {
        success: true,
        data: {
          totalEarnings: ethers.formatEther(earnings),
          totalTransactions: Number(transactionCount),
          totalVolume: '0', // Would need additional tracking
          averageTransactionSize: '0', // Would need additional tracking
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          name: 'VyraError',
          code: 'MERCHANT_STATS_FETCH_FAILED',
          message: (error as Error).message,
        } as VyraError,
      };
    }
  }

  /**
   * Generate QR code data for payment
   */
  generateQRCodeData(invoiceId: string, amount: string, description?: string): VyraResponse<any> {
    try {
      const qrData = {
        type: 'invoice',
        data: {
          invoiceId,
          amount,
          description,
        },
        signature: '', // Would need to sign this
      };

      return {
        success: true,
        data: qrData,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          name: 'VyraError',
          code: 'QR_CODE_GENERATE_FAILED',
          message: (error as Error).message,
        } as VyraError,
      };
    }
  }

  /**
   * Validate payment receipt
   */
  async validatePaymentReceipt(paymentId: string): Promise<VyraResponse<PaymentReceipt>> {
    try {
      const posContract = new ethers.Contract(
        this.config.posAddress,
        [
          'function payments(bytes32) view returns (address customer, address merchant, uint256 amount, uint256 merchantFee, uint256 platformFee, uint256 timestamp, bool refunded, bytes32 invoiceId)',
        ],
        this.provider
      );

      const payment = await posContract.payments(paymentId);

      if (payment.customer === ethers.ZeroAddress) {
        throw new Error('Payment not found');
      }

      return {
        success: true,
        data: {
          paymentId,
          invoiceId: payment.invoiceId,
          from: payment.customer,
          to: payment.merchant,
          amount: ethers.formatEther(payment.amount),
          fee: ethers.formatEther(payment.merchantFee + payment.platformFee),
          timestamp: Number(payment.timestamp),
          txHash: '', // Would need to track this
          status: payment.refunded ? 'failed' : 'confirmed',
        },
      };
    } catch (error) {
      return {
        success: false,
        error: {
          name: 'VyraError',
          code: 'PAYMENT_RECEIPT_VALIDATE_FAILED',
          message: (error as Error).message,
        } as VyraError,
      };
    }
  }

  /**
   * Get payment history
   */
  async getPaymentHistory(limit: number = 10): Promise<VyraResponse<PaymentReceipt[]>> {
    try {
      // TODO: Implement payment history fetching
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
          code: 'PAYMENT_HISTORY_FETCH_FAILED',
          message: (error as Error).message,
        } as VyraError,
      };
    }
  }
}
