import Link from 'next/link'
import { ArrowRightIcon, CheckIcon, StarIcon } from '@heroicons/react/24/outline'

const features = [
  {
    name: 'Instant Payments',
    description: 'Sub-1 second confirmation with ultra-low fees (~$0.002)',
    icon: '⚡',
  },
  {
    name: 'Account Abstraction',
    description: 'Gasless transactions with session keys and social login',
    icon: '🔐',
  },
  {
    name: 'Cross-Chain Bridge',
    description: 'Seamless L1↔L2 token transfers with multi-sig security',
    icon: '🌉',
  },
  {
    name: 'Merchant Tools',
    description: 'POS system with QR codes, split payments, and analytics',
    icon: '💳',
  },
  {
    name: 'Mobile Wallet',
    description: 'React Native app with modern UX and biometric auth',
    icon: '📱',
  },
  {
    name: 'Developer SDK',
    description: 'TypeScript SDK for easy integration and customization',
    icon: '🛠️',
  },
]

const stats = [
  { name: 'Transaction Speed', value: '<1s' },
  { name: 'Average Fee', value: '$0.002' },
  { name: 'Max Supply', value: '10B VYR' },
  { name: 'Test Coverage', value: '100%' },
]

export default function Home() {
  return (
    <div className="bg-black">
      {/* Hero Section */}
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#00d4ff] to-[#4ecdc4] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
        </div>
        
        <div className="mx-auto max-w-4xl py-32 sm:py-48 lg:py-56">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
              Vyra (VYR)
            </h1>
            <p className="text-2xl font-semibold text-[#00d4ff] mt-4">
              Instant Payment Rail for Everyday Transactions
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-300 max-w-3xl mx-auto">
              A cash-like, instant, low-fee money rail for P2P transfers, merchant payments, 
              cross-border remittances, and programmable payouts. Built on Ethereum L2 with 
              Account Abstraction for web2-simple UX.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="#demo"
                className="rounded-md bg-[#00d4ff] px-6 py-3 text-sm font-semibold text-black shadow-sm hover:bg-[#4ecdc4] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00d4ff]"
              >
                Try Demo
              </Link>
              <Link
                href="#docs"
                className="text-sm font-semibold leading-6 text-white hover:text-[#00d4ff]"
              >
                View Documentation <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gray-900 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:max-w-none">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Built for Scale
              </h2>
              <p className="mt-4 text-lg leading-8 text-gray-300">
                Performance metrics that matter for real-world adoption
              </p>
            </div>
            <dl className="mt-16 grid grid-cols-1 gap-8 sm:mt-20 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.name} className="flex flex-col-reverse">
                  <dt className="text-base leading-7 text-gray-300">{stat.name}</dt>
                  <dd className="text-2xl font-bold leading-9 tracking-tight text-white">
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-[#00d4ff]">Features</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Everything you need for instant payments
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-300">
              Vyra provides a complete payment infrastructure with smart contracts, 
              mobile wallet, merchant tools, and developer SDK.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              {features.map((feature) => (
                <div key={feature.name} className="flex flex-col">
                  <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-white">
                    <span className="text-2xl">{feature.icon}</span>
                    {feature.name}
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-300">
                    <p className="flex-auto">{feature.description}</p>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      {/* Architecture Section */}
      <div className="bg-gray-900 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:max-w-none">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Two-Phase Architecture
              </h2>
              <p className="mt-4 text-lg leading-8 text-gray-300">
                Starting on Ethereum L2, graduating to standalone L1
              </p>
            </div>
            <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-2">
              <div className="bg-gray-800 p-8 rounded-lg">
                <h3 className="text-xl font-semibold text-white mb-4">Phase 1: L2 (zkEVM Rollup)</h3>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-center">
                    <CheckIcon className="h-5 w-5 text-[#00d4ff] mr-3" />
                    Ethereum L2 with zkEVM rollup
                  </li>
                  <li className="flex items-center">
                    <CheckIcon className="h-5 w-5 text-[#00d4ff] mr-3" />
                    Account Abstraction (ERC-4337)
                  </li>
                  <li className="flex items-center">
                    <CheckIcon className="h-5 w-5 text-[#00d4ff] mr-3" />
                    ERC-20 token on L2
                  </li>
                  <li className="flex items-center">
                    <CheckIcon className="h-5 w-5 text-[#00d4ff] mr-3" />
                    Social login and passkey support
                  </li>
                </ul>
              </div>
              <div className="bg-gray-800 p-8 rounded-lg">
                <h3 className="text-xl font-semibold text-white mb-4">Phase 2: L1 (Future)</h3>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-center">
                    <CheckIcon className="h-5 w-5 text-[#4ecdc4] mr-3" />
                    Standalone L1 (Cosmos SDK/Substrate)
                  </li>
                  <li className="flex items-center">
                    <CheckIcon className="h-5 w-5 text-[#4ecdc4] mr-3" />
                    Native Account Abstraction
                  </li>
                  <li className="flex items-center">
                    <CheckIcon className="h-5 w-5 text-[#4ecdc4] mr-3" />
                    IBC/XCMP interoperability
                  </li>
                  <li className="flex items-center">
                    <CheckIcon className="h-5 w-5 text-[#4ecdc4] mr-3" />
                    Custom consensus mechanism
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to build the future of payments?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-300">
              Join the Vyra ecosystem and start building with our comprehensive SDK, 
              or integrate payments into your existing application.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="https://github.com/kirannarayanak/vyra"
                className="rounded-md bg-[#00d4ff] px-6 py-3 text-sm font-semibold text-black shadow-sm hover:bg-[#4ecdc4] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00d4ff]"
              >
                View on GitHub
              </Link>
              <Link
                href="#docs"
                className="text-sm font-semibold leading-6 text-white hover:text-[#00d4ff]"
              >
                Read Documentation <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900">
        <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
          <div className="flex justify-center space-x-6 md:order-2">
            <a href="https://github.com/kirannarayanak/vyra" className="text-gray-400 hover:text-[#00d4ff]">
              <span className="sr-only">GitHub</span>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
            </a>
            <a href="https://twitter.com/vyra_pay" className="text-gray-400 hover:text-[#00d4ff]">
              <span className="sr-only">Twitter</span>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
              </svg>
            </a>
          </div>
          <div className="mt-8 md:order-1 md:mt-0">
            <p className="text-center text-xs leading-5 text-gray-400">
              &copy; 2024 Vyra. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}