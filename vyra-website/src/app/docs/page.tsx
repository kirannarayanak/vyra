'use client'

import { ArrowLeftIcon, CodeBracketIcon, RocketLaunchIcon, BoltIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

export default function DocsPage() {
  const sections = [
    {
      title: 'Getting Started',
      items: [
        { name: 'Introduction', href: '#introduction' },
        { name: 'Quick Start', href: '#quickstart' },
        { name: 'Installation', href: '#installation' },
        { name: 'Configuration', href: '#configuration' }
      ]
    },
    {
      title: 'Core Features',
      items: [
        { name: 'Account Abstraction', href: '#account-abstraction' },
        { name: 'Instant Payments', href: '#instant-payments' },
        { name: 'Cross-Chain Bridge', href: '#bridge' },
        { name: 'Merchant Tools', href: '#merchant' }
      ]
    },
    {
      title: 'Developer Guide',
      items: [
        { name: 'SDK Reference', href: '#sdk' },
        { name: 'API Documentation', href: '#api' },
        { name: 'Smart Contracts', href: '#contracts' },
        { name: 'Examples', href: '#examples' }
      ]
    }
  ]

  const quickStartCode = `// Install Vyra SDK
npm install @vyra/sdk

// Initialize Vyra
import { VyraSDK } from '@vyra/sdk';

const vyra = new VyraSDK({
  rpcUrl: 'https://vyra-rpc.com',
  chainId: 11155111
});

// Connect wallet
const wallet = await vyra.wallet.connect();

// Send payment
const result = await wallet.sendPayment({
  to: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
  amount: '10.50',
  currency: 'VYR'
});`

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <nav className="px-6 py-4 border-b border-gray-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <span className="text-black font-bold text-xl">V</span>
            </div>
            <span className="text-2xl font-bold text-white">Vyra Docs</span>
          </Link>
          <Link href="/" className="text-gray-300 hover:text-white transition-colors flex items-center gap-2">
            <ArrowLeftIcon className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <h2 className="text-xl font-bold mb-6 text-white">Documentation</h2>
              <nav className="space-y-6">
                {sections.map((section) => (
                  <div key={section.title}>
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                      {section.title}
                    </h3>
                    <ul className="space-y-2">
                      {section.items.map((item) => (
                        <li key={item.name}>
                          <a
                            href={item.href}
                            className="block text-gray-300 hover:text-white transition-colors py-1"
                          >
                            {item.name}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="prose prose-invert max-w-none">
              {/* Introduction */}
              <section id="introduction" className="mb-16">
                <h1 className="text-4xl font-bold mb-6 text-white">Vyra Documentation</h1>
                <p className="text-xl text-gray-300 mb-8">
                  Vyra is a revolutionary payment rail that combines the speed of cash with the security of blockchain. 
                  Built on Ethereum L2 with Account Abstraction for a seamless web2 experience.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                  <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
                    <BoltIcon className="w-8 h-8 text-white mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">Lightning Fast</h3>
                    <p className="text-gray-400">Sub-1 second transaction confirmation</p>
                  </div>
                  <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
                    <CodeBracketIcon className="w-8 h-8 text-white mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">Developer Friendly</h3>
                    <p className="text-gray-400">Comprehensive SDK and documentation</p>
                  </div>
                  <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
                    <RocketLaunchIcon className="w-8 h-8 text-white mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">Easy Integration</h3>
                    <p className="text-gray-400">Simple APIs for any application</p>
                  </div>
                </div>
              </section>

              {/* Quick Start */}
              <section id="quickstart" className="mb-16">
                <h2 className="text-3xl font-bold mb-6 text-white">Quick Start</h2>
                <p className="text-gray-300 mb-6">
                  Get started with Vyra in just a few minutes. Here&apos;s how to send your first payment:
                </p>
                
                <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 mb-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Installation</h3>
                  <div className="bg-black rounded-lg p-4 overflow-x-auto">
                    <pre className="text-green-400 text-sm">
                      <code>{quickStartCode}</code>
                    </pre>
                  </div>
                </div>

                <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">What&apos;s Next?</h3>
                  <ul className="space-y-3 text-gray-300">
                    <li className="flex items-start gap-3">
                      <span className="w-6 h-6 bg-white rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-black text-xs font-bold">1</span>
                      </span>
                      <span>Set up your development environment</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-6 h-6 bg-white rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-black text-xs font-bold">2</span>
                      </span>
                      <span>Configure your RPC endpoint</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-6 h-6 bg-white rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-black text-xs font-bold">3</span>
                      </span>
                      <span>Connect your wallet or use social login</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-6 h-6 bg-white rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-black text-xs font-bold">4</span>
                      </span>
                      <span>Start sending instant payments!</span>
                    </li>
                  </ul>
                </div>
              </section>

              {/* Features */}
              <section id="features" className="mb-16">
                <h2 className="text-3xl font-bold mb-6 text-white">Core Features</h2>
                
                <div className="space-y-8">
                  <div className="bg-gray-900 border border-gray-700 rounded-lg p-8">
                    <h3 className="text-2xl font-bold mb-4 text-white">Account Abstraction</h3>
                    <p className="text-gray-300 mb-4">
                        Vyra uses Account Abstraction (ERC-4337) to provide a web2&apos;-like experience.
                      Users can pay with social login, passkeys, or session keys without managing private keys.
                    </p>
                    <ul className="space-y-2 text-gray-300">
                      <li>• Social login integration (Google, Apple, etc.)</li>
                      <li>• Biometric authentication</li>
                      <li>• Session keys for gasless transactions</li>
                      <li>• Recovery mechanisms</li>
                    </ul>
                  </div>

                  <div className="bg-gray-900 border border-gray-700 rounded-lg p-8">
                    <h3 className="text-2xl font-bold mb-4 text-white">Instant Payments</h3>
                    <p className="text-gray-300 mb-4">
                      Send payments in under 1 second with ultra-low fees. Perfect for everyday transactions, 
                      merchant payments, and cross-border remittances.
                    </p>
                    <ul className="space-y-2 text-gray-300">
                      <li>• Sub-1 second confirmation</li>
                      <li>• Average fee: $0.002</li>
                      <li>• High throughput: 1000+ TPS</li>
                      <li>• Real-time settlement</li>
                    </ul>
                  </div>

                  <div className="bg-gray-900 border border-gray-700 rounded-lg p-8">
                    <h3 className="text-2xl font-bold mb-4 text-white">Cross-Chain Bridge</h3>
                    <p className="text-gray-300 mb-4">
                      Seamlessly transfer tokens between Ethereum L1 and Vyra L2 with multi-sig security 
                      and validator consensus.
                    </p>
                    <ul className="space-y-2 text-gray-300">
                      <li>• L1 ↔ L2 token transfers</li>
                      <li>• Multi-sig security</li>
                      <li>• Validator consensus</li>
                      <li>• Emergency recovery mechanisms</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* API Reference */}
              <section id="api" className="mb-16">
                <h2 className="text-3xl font-bold mb-6 text-white">API Reference</h2>
                
                <div className="bg-gray-900 border border-gray-700 rounded-lg p-8">
                  <h3 className="text-xl font-bold mb-4 text-white">Wallet API</h3>
                  <div className="space-y-4">
                    <div className="bg-black rounded-lg p-4">
                      <div className="text-green-400 text-sm font-mono">
                        vyra.wallet.connect() → Promise&lt;WalletInfo&gt;
                      </div>
                      <div className="text-gray-400 text-sm mt-2">
                        Connect to a wallet or create a new one
                      </div>
                    </div>
                    <div className="bg-black rounded-lg p-4">
                      <div className="text-green-400 text-sm font-mono">
                        vyra.wallet.sendPayment(options) → Promise&lt;TransactionResult&gt;
                      </div>
                      <div className="text-gray-400 text-sm mt-2">
                        Send a payment to another address
                      </div>
                    </div>
                    <div className="bg-black rounded-lg p-4">
                      <div className="text-green-400 text-sm font-mono">
                        vyra.wallet.getBalance() → Promise&lt;string&gt;
                      </div>
                      <div className="text-gray-400 text-sm mt-2">
                        Get current VYR balance
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Examples */}
              <section id="examples" className="mb-16">
                <h2 className="text-3xl font-bold mb-6 text-white">Examples</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Basic Payment</h3>
                    <div className="bg-black rounded-lg p-4 text-sm">
                      <pre className="text-green-400">
{`const payment = await vyra.wallet.sendPayment({
  to: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
  amount: '10.50',
  currency: 'VYR'
});`}
                      </pre>
                    </div>
                  </div>
                  
                  <div className="bg-gray-900 border border-gray-700 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Merchant Integration</h3>
                    <div className="bg-black rounded-lg p-4 text-sm">
                      <pre className="text-green-400">
{`const invoice = await vyra.merchant.createInvoice({
  amount: '25.00',
  description: 'Coffee & Pastry',
  merchantId: 'coffee-shop-123'
});`}
                      </pre>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
