'use client'

import { useState } from 'react'
import { ArrowLeftIcon, BoltIcon, CreditCardIcon, DevicePhoneMobileIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

export default function DemoPage() {
  const [activeDemo, setActiveDemo] = useState('wallet')
  const [transactionStatus, setTransactionStatus] = useState('idle')
  const [amount, setAmount] = useState('10.50')

  const handleSendPayment = () => {
    setTransactionStatus('processing')
    setTimeout(() => {
      setTransactionStatus('success')
    }, 2000)
  }

  const demos = [
    {
      id: 'wallet',
      name: 'Mobile Wallet',
      icon: DevicePhoneMobileIcon,
      description: 'Send payments instantly with biometric authentication'
    },
    {
      id: 'merchant',
      name: 'Merchant POS',
      icon: CreditCardIcon,
      description: 'Accept payments with QR codes and analytics'
    },
    {
      id: 'bridge',
      name: 'Cross-Chain Bridge',
      icon: BoltIcon,
      description: 'Transfer tokens between L1 and L2 seamlessly'
    }
  ]

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <nav className="px-6 py-4 border-b border-gray-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <span className="text-black font-bold text-xl">V</span>
            </div>
            <span className="text-2xl font-bold text-white">Vyra Demo</span>
          </Link>
          <Link href="/" className="text-gray-300 hover:text-white transition-colors flex items-center gap-2">
            <ArrowLeftIcon className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-6xl font-bold mb-6 text-white">
            Try Vyra Live Demo
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Experience instant payments, account abstraction, and cross-chain transfers
          </p>
        </div>

        {/* Demo Tabs */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {demos.map((demo) => (
            <button
              key={demo.id}
              onClick={() => setActiveDemo(demo.id)}
              className={`flex items-center gap-3 px-6 py-3 rounded-lg border transition-all ${
                activeDemo === demo.id
                  ? 'bg-white text-black border-white'
                  : 'bg-gray-900 text-white border-gray-700 hover:border-white'
              }`}
            >
              <demo.icon className="w-5 h-5" />
              <span className="font-semibold">{demo.name}</span>
            </button>
          ))}
        </div>

        {/* Demo Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Demo Interface */}
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-8">
            <h3 className="text-2xl font-bold mb-6 text-white">
              {demos.find(d => d.id === activeDemo)?.name} Demo
            </h3>
            
            {activeDemo === 'wallet' && (
              <div className="space-y-6">
                <div className="bg-gray-800 rounded-lg p-6">
                  <h4 className="text-lg font-semibold mb-4 text-white">Send Payment</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Amount (VYR)</label>
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-white focus:outline-none"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">To Address</label>
                      <input
                        type="text"
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-white focus:outline-none"
                        placeholder="0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6"
                      />
                    </div>
                    <button
                      onClick={handleSendPayment}
                      disabled={transactionStatus === 'processing'}
                      className="w-full bg-white text-black py-3 rounded-lg font-semibold hover:bg-gray-200 transition-all disabled:opacity-50"
                    >
                      {transactionStatus === 'idle' && 'Send Payment'}
                      {transactionStatus === 'processing' && 'Processing...'}
                      {transactionStatus === 'success' && '✅ Payment Sent!'}
                    </button>
                  </div>
                </div>
                
                <div className="bg-gray-800 rounded-lg p-6">
                  <h4 className="text-lg font-semibold mb-4 text-white">Account Abstraction</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-gray-300">Social Login Enabled</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-gray-300">Biometric Authentication</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-gray-300">Session Keys Active</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeDemo === 'merchant' && (
              <div className="space-y-6">
                <div className="bg-gray-800 rounded-lg p-6">
                  <h4 className="text-lg font-semibold mb-4 text-white">Merchant Dashboard</h4>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">$2,847</div>
                      <div className="text-sm text-gray-400">Today&apos;s Revenue</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">127</div>
                      <div className="text-sm text-gray-400">Transactions</div>
                    </div>
                  </div>
                  <div className="bg-gray-700 rounded-lg p-4 text-center">
                    <div className="text-sm text-gray-400 mb-2">QR Code for Payment</div>
                    <div className="w-32 h-32 bg-white rounded-lg mx-auto flex items-center justify-center">
                      <div className="text-black text-xs">QR CODE</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeDemo === 'bridge' && (
              <div className="space-y-6">
                <div className="bg-gray-800 rounded-lg p-6">
                  <h4 className="text-lg font-semibold mb-4 text-white">Cross-Chain Bridge</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300">From: Ethereum L1</span>
                      <span className="text-white">→</span>
                      <span className="text-gray-300">To: Vyra L2</span>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Amount to Bridge</label>
                      <input
                        type="number"
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-white focus:outline-none"
                        placeholder="100.00 VYR"
                      />
                    </div>
                    <button className="w-full bg-white text-black py-3 rounded-lg font-semibold hover:bg-gray-200 transition-all">
                      Bridge Tokens
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Features List */}
          <div className="space-y-6">
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-8">
              <h3 className="text-2xl font-bold mb-6 text-white">Key Features</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-black text-xs font-bold">✓</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Sub-1 Second Transactions</h4>
                    <p className="text-gray-400 text-sm">Lightning fast payments with instant confirmation</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-black text-xs font-bold">✓</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Ultra-Low Fees</h4>
                    <p className="text-gray-400 text-sm">Average fee of $0.002 per transaction</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-black text-xs font-bold">✓</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Account Abstraction</h4>
                    <p className="text-gray-400 text-sm">Social login, passkeys, and session keys</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-black text-xs font-bold">✓</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">Cross-Chain Bridge</h4>
                    <p className="text-gray-400 text-sm">Seamless L1↔L2 token transfers</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-900 border border-gray-700 rounded-lg p-8">
              <h3 className="text-2xl font-bold mb-6 text-white">Get Started</h3>
              <div className="space-y-4">
                <Link
                  href="https://github.com/kirannarayanak/vyra"
                  className="block w-full bg-white text-black py-3 rounded-lg font-semibold text-center hover:bg-gray-200 transition-all"
                >
                  View Source Code
                </Link>
                <Link
                  href="/docs"
                  className="block w-full border border-white text-white py-3 rounded-lg font-semibold text-center hover:bg-white hover:text-black transition-all"
                >
                  Read Documentation
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
