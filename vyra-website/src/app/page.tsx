'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { ArrowRightIcon, CheckIcon, StarIcon, BoltIcon, ShieldCheckIcon, GlobeAltIcon, CreditCardIcon, DevicePhoneMobileIcon, CodeBracketIcon } from '@heroicons/react/24/outline'

const features = [
  {
    name: 'Lightning Fast',
    description: 'Sub-1 second confirmation with ultra-low fees (~$0.002)',
    icon: BoltIcon,
    gradient: 'from-yellow-400 to-orange-500',
  },
  {
    name: 'Account Abstraction',
    description: 'Gasless transactions with session keys and social login',
    icon: ShieldCheckIcon,
    gradient: 'from-blue-400 to-cyan-500',
  },
  {
    name: 'Cross-Chain Bridge',
    description: 'Seamless L1↔L2 token transfers with multi-sig security',
    icon: GlobeAltIcon,
    gradient: 'from-purple-400 to-pink-500',
  },
  {
    name: 'Merchant Tools',
    description: 'POS system with QR codes, split payments, and analytics',
    icon: CreditCardIcon,
    gradient: 'from-green-400 to-emerald-500',
  },
  {
    name: 'Mobile Wallet',
    description: 'React Native app with modern UX and biometric auth',
    icon: DevicePhoneMobileIcon,
    gradient: 'from-indigo-400 to-blue-500',
  },
  {
    name: 'Developer SDK',
    description: 'TypeScript SDK for easy integration and customization',
    icon: CodeBracketIcon,
    gradient: 'from-red-400 to-rose-500',
  },
]

const stats = [
  { name: 'Transaction Speed', value: '<1s', icon: '⚡' },
  { name: 'Average Fee', value: '$0.002', icon: '💰' },
  { name: 'Max Supply', value: '10B VYR', icon: '🔢' },
  { name: 'Test Coverage', value: '100%', icon: '✅' },
]

const FloatingParticles = () => {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([])

  useEffect(() => {
    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 20,
    }))
    setParticles(newParticles)
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute w-1 h-1 bg-cyan-400 rounded-full opacity-30 animate-pulse"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${3 + Math.random() * 4}s`,
          }}
        />
      ))}
    </div>
  )
}

const AnimatedText = ({ text, className = "" }: { text: string; className?: string }) => {
  const [displayText, setDisplayText] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex])
        setCurrentIndex(prev => prev + 1)
      }, 50)
      return () => clearTimeout(timeout)
    }
  }, [currentIndex, text])

  return <span className={className}>{displayText}</span>
}

export default function Home() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden" style={{background: 'linear-gradient(135deg, #000000 0%, #1a1a2e 50%, #16213e 100%)'}}>
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black" />
        <div 
          className="absolute w-96 h-96 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 blur-3xl animate-pulse"
          style={{
            left: mousePosition.x - 200,
            top: mousePosition.y - 200,
            transition: 'all 0.3s ease-out',
          }}
        />
        <FloatingParticles />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10">
              <Image
                src="/logo-animated.svg"
                alt="Vyra Logo"
                width={40}
                height={40}
                className="w-full h-full"
              />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Vyra
            </span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <Link href="#features" className="hover:text-cyan-400 transition-colors">Features</Link>
            <Link href="#stats" className="hover:text-cyan-400 transition-colors">Stats</Link>
            <Link href="#architecture" className="hover:text-cyan-400 transition-colors">Architecture</Link>
            <Link href="https://github.com/kirannarayanak/vyra" className="bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-2 rounded-full hover:shadow-lg hover:shadow-cyan-500/25 transition-all">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 px-6 py-20 lg:py-32">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <div className="w-24 h-24 mx-auto mb-8 animate-float">
            <Image
                src="/logo-animated.svg"
                alt="Vyra Logo"
                width={96}
                height={96}
                className="w-full h-full"
              />
            </div>
            <h1 className="text-6xl lg:text-8xl font-bold mb-6">
              <AnimatedText text="VYRA" className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent" />
            </h1>
            <div className="text-2xl text-red-500 mb-4 font-bold animate-pulse">🚀 NEW FUTURISTIC DESIGN IS LIVE! 🚀</div>
            <div className="text-sm text-cyan-400 mb-4">Timestamp: {new Date().toLocaleTimeString()}</div>
            <p className="text-2xl lg:text-4xl font-light mb-4 text-gray-300">
              The Future of
            </p>
            <p className="text-3xl lg:text-5xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent mb-8">
              Instant Payments
            </p>
            <p className="text-lg lg:text-xl text-gray-400 max-w-4xl mx-auto leading-relaxed">
              A revolutionary payment rail that combines the speed of cash with the security of blockchain. 
              Built on Ethereum L2 with Account Abstraction for a seamless web2 experience.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16">
            <Link 
              href="https://github.com/kirannarayanak/vyra"
              className="group bg-gradient-to-r from-cyan-500 to-blue-500 px-8 py-4 rounded-2xl text-lg font-semibold hover:shadow-2xl hover:shadow-cyan-500/25 transition-all duration-300 transform hover:scale-105"
            >
              <span className="flex items-center gap-2">
                Launch App
                <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
            <Link 
              href="https://github.com/kirannarayanak/vyra"
              className="group border-2 border-cyan-400 px-8 py-4 rounded-2xl text-lg font-semibold hover:bg-cyan-400/10 transition-all duration-300"
            >
              <span className="flex items-center gap-2">
                View Documentation
                <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          </div>

          {/* Live Stats */}
          <div id="stats" className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div key={stat.name} className="group">
                <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 hover:border-cyan-400/50 transition-all duration-300 hover:transform hover:scale-105">
                  <div className="text-4xl mb-2">{stat.icon}</div>
                  <div className="text-3xl font-bold text-cyan-400 mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-400">{stat.name}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Revolutionary Features
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Everything you need for the next generation of payments
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={feature.name} className="group">
                <div className="bg-gray-900/30 backdrop-blur-sm border border-gray-700 rounded-3xl p-8 hover:border-cyan-400/50 transition-all duration-500 hover:transform hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/10">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-8 h-8 text-black" />
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-cyan-400 transition-colors">
                    {feature.name}
                  </h3>
                  <p className="text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture Section */}
      <section id="architecture" className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                Two-Phase Architecture
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Starting on Ethereum L2, graduating to standalone L1
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Phase 1 */}
            <div className="group">
              <div className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 backdrop-blur-sm border border-blue-500/30 rounded-3xl p-8 hover:border-blue-400/50 transition-all duration-500 hover:transform hover:scale-105">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-xl flex items-center justify-center mr-4">
                    <span className="text-black font-bold text-xl">1</span>
                  </div>
                  <h3 className="text-3xl font-bold text-white">Phase 1: L2 (zkEVM Rollup)</h3>
                </div>
                <ul className="space-y-4">
                  <li className="flex items-center text-gray-300">
                    <CheckIcon className="w-5 h-5 text-green-400 mr-3" />
                    Ethereum L2 with zkEVM rollup
                  </li>
                  <li className="flex items-center text-gray-300">
                    <CheckIcon className="w-5 h-5 text-green-400 mr-3" />
                    Account Abstraction (ERC-4337)
                  </li>
                  <li className="flex items-center text-gray-300">
                    <CheckIcon className="w-5 h-5 text-green-400 mr-3" />
                    ERC-20 token on L2
                  </li>
                  <li className="flex items-center text-gray-300">
                    <CheckIcon className="w-5 h-5 text-green-400 mr-3" />
                    Social login and passkey support
                  </li>
                </ul>
              </div>
            </div>

            {/* Phase 2 */}
            <div className="group">
              <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 backdrop-blur-sm border border-purple-500/30 rounded-3xl p-8 hover:border-purple-400/50 transition-all duration-500 hover:transform hover:scale-105">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-500 rounded-xl flex items-center justify-center mr-4">
                    <span className="text-black font-bold text-xl">2</span>
                  </div>
                  <h3 className="text-3xl font-bold text-white">Phase 2: L1 (Future)</h3>
                </div>
                <ul className="space-y-4">
                  <li className="flex items-center text-gray-300">
                    <StarIcon className="w-5 h-5 text-yellow-400 mr-3" />
                    Standalone L1 (Cosmos SDK/Substrate)
                  </li>
                  <li className="flex items-center text-gray-300">
                    <StarIcon className="w-5 h-5 text-yellow-400 mr-3" />
                    Native Account Abstraction
                  </li>
                  <li className="flex items-center text-gray-300">
                    <StarIcon className="w-5 h-5 text-yellow-400 mr-3" />
                    IBC/XCMP interoperability
                  </li>
                  <li className="flex items-center text-gray-300">
                    <StarIcon className="w-5 h-5 text-yellow-400 mr-3" />
                    Custom consensus mechanism
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-gray-900/50 to-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-3xl p-12">
            <h2 className="text-4xl lg:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Ready to Build the Future?
              </span>
            </h2>
            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
              Join the Vyra ecosystem and start building with our comprehensive SDK, 
              or integrate payments into your existing application.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link 
                href="https://github.com/kirannarayanak/vyra"
                className="group bg-gradient-to-r from-cyan-500 to-blue-500 px-8 py-4 rounded-2xl text-lg font-semibold hover:shadow-2xl hover:shadow-cyan-500/25 transition-all duration-300 transform hover:scale-105"
              >
                <span className="flex items-center gap-2">
                  View on GitHub
                  <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
              <Link 
                href="https://github.com/kirannarayanak/vyra"
                className="group border-2 border-cyan-400 px-8 py-4 rounded-2xl text-lg font-semibold hover:bg-cyan-400/10 transition-all duration-300"
              >
                <span className="flex items-center gap-2">
                  Read Documentation
                  <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8">
                <Image
                  src="/logo-animated.svg"
                  alt="Vyra Logo"
                  width={32}
                  height={32}
                  className="w-full h-full"
                />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Vyra
              </span>
            </div>
            <div className="flex items-center space-x-6">
              <Link href="https://github.com/kirannarayanak/vyra" className="text-gray-400 hover:text-cyan-400 transition-colors">
                GitHub
              </Link>
              <Link href="https://twitter.com" className="text-gray-400 hover:text-cyan-400 transition-colors">
                Twitter
              </Link>
              <Link href="https://discord.com" className="text-gray-400 hover:text-cyan-400 transition-colors">
                Discord
              </Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>&copy; 2024 Vyra. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}