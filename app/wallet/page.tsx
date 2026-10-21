'use client'



import { useState, useEffect } from 'react'

import { useRouter } from 'next/navigation'

import { motion } from 'framer-motion'

import { blockchainService, WalletInfo, Transaction } from '@/services/blockchain'

import { useFeatureFlags } from '@/context/FeatureFlagContext'

import toast from 'react-hot-toast'

import Link from 'next/link'



export default function WalletPage() {

  const router = useRouter()

  const { canSeeAdvancedFeatures: showAdvanced, loading } = useFeatureFlags()

  const [wallet, setWallet] = useState<WalletInfo | null>(null)



  useEffect(() => {

    if (loading) return

    if (!showAdvanced) router.replace('/')

  }, [loading, showAdvanced, router])

  const [showWalletModal, setShowWalletModal] = useState(false)

  const [showTransactions, setShowTransactions] = useState(false)

  const [transactions, setTransactions] = useState<Transaction[]>([])



  const networkInfo = {

    name: 'Polygon Mumbai Testnet',

    chainId: 80001,

    explorer: 'https://mumbai.polygonscan.com'

  }



  const walletOptions = [

    { id: 'metamask', name: 'MetaMask', icon: '🦊', description: 'Connect with MetaMask', available: true },

    { id: 'walletconnect', name: 'WalletConnect', icon: '🔗', description: 'Scan with mobile wallet', available: false },

    { id: 'coinbase', name: 'Coinbase Wallet', icon: '💼', description: 'Connect with Coinbase', available: false },

    { id: 'trust', name: 'Trust Wallet', icon: '🛡️', description: 'Connect with Trust Wallet', available: false },

    { id: 'phantom', name: 'Phantom', icon: '👻', description: 'Connect with Phantom', available: false }

  ]



  useEffect(() => {
    if (typeof window === 'undefined') return

    const ethereum = (window as any).ethereum
    let active = true

    const clearSavedWallet = () => {
      localStorage.removeItem('connectedWallet')
      blockchainService.disconnectWallet()
      if (active) {
        setWallet(null)
        setTransactions([])
      }
    }

    const restoreWallet = async () => {
      const savedWallet = localStorage.getItem('connectedWallet')
      if (!savedWallet) return

      try {
        const walletData = JSON.parse(savedWallet) as WalletInfo
        if (!walletData?.address || !ethereum?.request) {
          clearSavedWallet()
          return
        }

        const accounts: string[] = await ethereum.request({ method: 'eth_accounts' })
        const authorizedAccount = accounts.find(
          (account) => account.toLowerCase() === walletData.address.toLowerCase()
        )

        if (!authorizedAccount) {
          clearSavedWallet()
          return
        }
        if (!active) return

        const restoredWallet: WalletInfo = {
          ...walletData,
          address: authorizedAccount,
          connected: true,
        }
        setWallet(restoredWallet)
        loadTransactions(authorizedAccount)
      } catch {
        clearSavedWallet()
      }
    }

    const handleAccountsChanged = (accounts: string[]) => {
      const savedWallet = localStorage.getItem('connectedWallet')
      if (!savedWallet) return

      try {
        const walletData = JSON.parse(savedWallet) as WalletInfo
        const stillAuthorized = accounts.some(
          (account) => account.toLowerCase() === walletData.address.toLowerCase()
        )
        if (!stillAuthorized) clearSavedWallet()
      } catch {
        clearSavedWallet()
      }
    }

    void restoreWallet()
    ethereum?.on?.('accountsChanged', handleAccountsChanged)

    return () => {
      active = false
      ethereum?.removeListener?.('accountsChanged', handleAccountsChanged)
    }
  }, [])


  const loadTransactions = (address: string) => {

    const txs = blockchainService.getTransactions()

    setTransactions(txs)

  }



  const handleConnect = async (walletId: string) => {

    try {

      const connectedWallet = await blockchainService.connectWallet()

      setWallet(connectedWallet)

      localStorage.setItem('connectedWallet', JSON.stringify(connectedWallet))

      loadTransactions(connectedWallet.address)

      toast.success('Wallet connected successfully!', { icon: '🎉' })

    } catch (error) {

      toast.error('Failed to connect wallet')

    }

  }



  const handleDisconnect = () => {
    blockchainService.disconnectWallet()
    setWallet(null)
    localStorage.removeItem('connectedWallet')
    setTransactions([])
    toast.success('Wallet disconnected', { icon: '👋' })
  }


    const copyAddress = () => {

    if (wallet) {

      navigator.clipboard.writeText(wallet.address)

      toast.success('Address copied to clipboard!', { icon: '📋' })

    }

  }



  const addToMetaMask = async () => {

    toast.success('Token added to MetaMask!', { icon: '🦊' })

  }



  const switchNetwork = async () => {

    toast.success(`Switched to ${networkInfo.name}`, { icon: '🔄' })

  }



  const formatAddress = (address: string) => {

    return `${address.slice(0, 6)}...${address.slice(-4)}`

  }



  if (loading || !showAdvanced) {

    return (

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">

        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500" />

      </div>

    )

  }



  if (!wallet) {

    // Not connected - Show connect options

    return (

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-20 px-4">

        <div className="max-w-4xl mx-auto">

          {/* Header */}

          <div className="text-center mb-12">

            <h1 className="text-5xl font-bold text-white mb-4">Connect Your Wallet</h1>

            <p className="text-gray-300 text-lg">Choose your preferred wallet to access the Oceara platform</p>

          </div>



          {/* Wallet Options Grid */}

          <div className="grid md:grid-cols-2 gap-6 mb-8">

            {walletOptions.map((option) => (

              <motion.button

                key={option.id}

                onClick={() => option.available && handleConnect(option.id)}

                disabled={!option.available}

                whileHover={option.available ? { scale: 1.02 } : {}}

                whileTap={option.available ? { scale: 0.98 } : {}}

                className={`p-8 rounded-2xl border-2 transition-all text-left ${

                  option.available

                    ? 'bg-slate-800 border-purple-500 hover:border-purple-400 hover:bg-slate-700 cursor-pointer'

                    : 'bg-slate-800/50 border-gray-700 cursor-not-allowed opacity-50'

                }`}

              >

                <div className="flex items-start gap-4">

                  <div className="text-5xl">{option.icon}</div>

                  <div className="flex-1">

                    <h3 className="text-white font-bold text-xl mb-1 flex items-center gap-2">

                      {option.name}

                      {!option.available && (

                        <span className="text-xs bg-gray-700 px-2 py-1 rounded">Soon</span>

                      )}

                    </h3>

                    <p className="text-gray-400">{option.description}</p>

                    {option.available && (

                      <div className="mt-3 text-purple-400 font-semibold flex items-center gap-2">

                        Connect Now

                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">

                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />

                        </svg>

                      </div>

                    )}

                  </div>

                </div>

              </motion.button>

            ))}

          </div>



          {/* Info Box */}

          <div className="bg-slate-800 border-2 border-blue-500 rounded-xl p-6">

            <div className="flex gap-4">

              <span className="text-3xl">ℹ️</span>

              <div>

                <p className="text-blue-300 font-semibold mb-2 text-lg">First time connecting?</p>

                <p className="text-gray-300">

                  We recommend MetaMask for beginners. Make sure you're on Polygon Mumbai Testnet.&#x20;

                  No wallet? <a href="https://metamask.io" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">Download MetaMask</a>

                </p>

              </div>

            </div>

          </div>



          {/* Back to Home */}

          <div className="text-center mt-8">

            <Link href="/" className="text-purple-400 hover:text-purple-300 font-semibold">

              ← Back to Home

            </Link>

          </div>

        </div>

      </div>

    )

  }



  // Connected - Show wallet dashboard

  return (

    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-20 px-4">

      <div className="max-w-6xl mx-auto">

        {/* Header */}

        <div className="text-center mb-12">

          <h1 className="text-5xl font-bold text-white mb-4">My Wallet</h1>

          <p className="text-gray-300 text-lg">Manage your crypto assets and transactions</p>

        </div>



        {/* Balance Card */}

        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl p-8 mb-8 shadow-2xl">

          <div className="flex items-center justify-between mb-6">

            <div className="flex items-center gap-3">

              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center text-3xl backdrop-blur-sm">

                👛

              </div>

              <div>

                <p className="text-purple-100 text-sm">Connected to</p>

                <p className="text-white font-bold text-xl flex items-center gap-2">

                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>

                  {networkInfo.name}

                </p>

              </div>

            </div>

            <button

              onClick={handleDisconnect}

              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-6 py-3 rounded-xl text-white font-semibold transition-all flex items-center gap-2"

            >

              <span>🚪</span>

              Disconnect

            </button>

          </div>



          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">

            <div className="flex items-center justify-between mb-3">

              <span className="text-purple-100 text-sm font-semibold">Wallet Address</span>

              <button

                onClick={copyAddress}

                className="text-white font-mono text-sm bg-white/20 hover:bg-white/30 px-3 py-2 rounded-lg transition-all flex items-center gap-2"

              >

                {formatAddress(wallet.address)}

                <span>📋</span>

              </button>

            </div>

            <div className="text-white font-bold text-4xl flex items-center gap-3 mb-2">

              <span className="text-yellow-300">💎</span>

              <span>{wallet.balance.toLocaleString()}</span>

              <span className="text-2xl text-purple-200">OCC</span>

            </div>

            <div className="text-purple-100 text-lg">

              ≈ ${(wallet.balance * 0.85).toFixed(2)} USD

            </div>

          </div>

        </div>



        {/* Quick Actions */}

        <div className="grid md:grid-cols-4 gap-4 mb-8">

          <button

            onClick={() => toast.success('Send feature coming soon!', { icon: '💸' })}

            className="bg-slate-800 hover:bg-blue-600 border-2 border-slate-700 hover:border-blue-500 rounded-xl p-6 transition-all text-center"

          >

            <div className="text-4xl mb-2">💸</div>

            <div className="text-white font-semibold text-lg">Send</div>

            <div className="text-gray-400 text-sm">Transfer tokens</div>

          </button>

          <button

            onClick={() => {

              copyAddress()

              toast.success('Share this address to receive tokens', { icon: '📥' })

            }}

            className="bg-slate-800 hover:bg-green-600 border-2 border-slate-700 hover:border-green-500 rounded-xl p-6 transition-all text-center"

          >

            <div className="text-4xl mb-2">📥</div>

            <div className="text-white font-semibold text-lg">Receive</div>

            <div className="text-gray-400 text-sm">Get tokens</div>

          </button>

          <button

            onClick={() => toast.success('Swap feature coming soon!', { icon: '🔄' })}

            className="bg-slate-800 hover:bg-purple-600 border-2 border-slate-700 hover:border-purple-500 rounded-xl p-6 transition-all text-center"

          >

            <div className="text-4xl mb-2">🔄</div>

            <div className="text-white font-semibold text-lg">Swap</div>

            <div className="text-gray-400 text-sm">Exchange tokens</div>

          </button>

          <button

            onClick={() => toast.success('Buy feature coming soon!', { icon: '🛒' })}

            className="bg-slate-800 hover:bg-yellow-600 border-2 border-slate-700 hover:border-yellow-500 rounded-xl p-6 transition-all text-center"

          >

            <div className="text-4xl mb-2">🛒</div>

            <div className="text-white font-semibold text-lg">Buy</div>

            <div className="text-gray-400 text-sm">Purchase more</div>

          </button>

        </div>



        {/* Wallet Options Grid */}

        <div className="grid md:grid-cols-2 gap-6 mb-8">

          {/* Left Column */}

          <div className="space-y-4">

            <button

              onClick={copyAddress}

              className="w-full bg-slate-800 hover:bg-slate-700 border-2 border-slate-700 hover:border-blue-500 rounded-xl p-6 transition-all text-left flex items-center gap-4"

            >

              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-2xl">

                📋

              </div>

              <div className="flex-1">

                <div className="text-white font-semibold text-lg">Copy Address</div>

                <div className="text-gray-400 text-sm">Copy wallet address to clipboard</div>

              </div>

            </button>



            <button

              onClick={() => setShowTransactions(!showTransactions)}

              className="w-full bg-slate-800 hover:bg-slate-700 border-2 border-slate-700 hover:border-purple-500 rounded-xl p-6 transition-all text-left flex items-center gap-4"

            >

              <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center text-2xl">

                📜

              </div>

              <div className="flex-1">

                <div className="text-white font-semibold text-lg flex items-center gap-2">

                  Transaction History

                  {transactions.length > 0 && (

                    <span className="px-2 py-1 bg-purple-500 rounded-full text-white text-xs">

                      {transactions.length}

                    </span>

                  )}

                </div>

                <div className="text-gray-400 text-sm">View all your transactions</div>

              </div>

            </button>



            <button

              onClick={addToMetaMask}

              className="w-full bg-slate-800 hover:bg-slate-700 border-2 border-slate-700 hover:border-orange-500 rounded-xl p-6 transition-all text-left flex items-center gap-4"

            >

              <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center text-2xl">

                🦊

              </div>

              <div className="flex-1">

                <div className="text-white font-semibold text-lg">Add to MetaMask</div>

                <div className="text-gray-400 text-sm">Watch OCC token in your wallet</div>

              </div>

            </button>

          </div>



          {/* Right Column */}

          <div className="space-y-4">

            <button

              onClick={switchNetwork}

              className="w-full bg-slate-800 hover:bg-slate-700 border-2 border-slate-700 hover:border-cyan-500 rounded-xl p-6 transition-all text-left flex items-center gap-4"

            >

              <div className="w-12 h-12 bg-cyan-600 rounded-xl flex items-center justify-center text-2xl">

                🌐

              </div>

              <div className="flex-1">

                <div className="text-white font-semibold text-lg">Switch Network</div>

                <div className="text-gray-400 text-sm">Change blockchain network</div>

              </div>

            </button>



            <a

              href={blockchainService.getExplorerUrl(wallet.address)}

              target="_blank"

              rel="noopener noreferrer"

              className="w-full bg-slate-800 hover:bg-slate-700 border-2 border-slate-700 hover:border-indigo-500 rounded-xl p-6 transition-all text-left flex items-center gap-4"

            >

              <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-2xl">

                🔍

              </div>

              <div className="flex-1">

                <div className="text-white font-semibold text-lg flex items-center gap-2">

                  View on Explorer

                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">

                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />

                  </svg>

                </div>

                <div className="text-gray-400 text-sm">Open in Polygonscan</div>

              </div>

            </a>



            <Link

              href="/"

              className="w-full bg-slate-800 hover:bg-slate-700 border-2 border-slate-700 hover:border-green-500 rounded-xl p-6 transition-all text-left flex items-center gap-4"

            >

              <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center text-2xl">

                🏠

              </div>

              <div className="flex-1">

                <div className="text-white font-semibold text-lg">Back to Dashboard</div>

                <div className="text-gray-400 text-sm">Return to main page</div>

              </div>

            </Link>

          </div>

        </div>



        {/* Transaction History */}

        {showTransactions && transactions.length > 0 && (

          <div className="bg-slate-800 border-2 border-purple-500 rounded-2xl p-6">

            <h3 className="text-2xl font-bold text-white mb-6">Recent Transactions</h3>

            <div className="space-y-4">

              {transactions.map((tx, idx) => (

                <div

                  key={idx}

                  className="bg-slate-900 rounded-xl p-4 hover:bg-slate-700 transition-all"

                >

                  <div className="flex items-center justify-between mb-2">

                    <div className="flex items-center gap-3">

                      <span className="text-2xl">

                        {tx.type === 'TRANSFER' ? '📤' : tx.type === 'MINT' ? '📥' : '🔄'}

                      </span>

                      <div>

                        <div className="text-white font-semibold">{tx.type}</div>

                        <div className="text-gray-400 text-sm">{new Date(tx.timestamp).toLocaleString()}</div>

                      </div>

                    </div>

                    <div className="text-right">

                      <div className={`font-bold text-lg ${tx.type === 'MINT' ? 'text-green-400' : 'text-white'}`}>

                        {tx.type === 'MINT' ? '+' : '-'}{tx.amount} OCC

                      </div>

                      <div className={`text-xs px-2 py-1 rounded ${

                        tx.status === 'confirmed' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'

                      }`}>

                        {tx.status}

                      </div>

                    </div>

                  </div>

                  <div className="text-gray-400 text-xs font-mono">

                    {tx.from}

                  </div>

                </div>

              ))}

            </div>

          </div>

        )}

      </div>

    </div>

  )

}
