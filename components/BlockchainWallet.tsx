'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { blockchainService, WalletInfo } from '@/services/blockchain'

interface BlockchainWalletProps {
  onTransactionComplete?: (tx?: any) => void
}

export default function BlockchainWallet({ onTransactionComplete }: BlockchainWalletProps) {
  const router = useRouter()
  const [wallet, setWallet] = useState<WalletInfo | null>(null)

  useEffect(() => {
    const savedWallet = localStorage.getItem('connectedWallet')
    if (savedWallet) {
      setWallet(JSON.parse(savedWallet))
    }
  }, [])

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const handleWalletClick = () => {
    router.push('/wallet')
  }

  if (!wallet) {
    return (
      <button
        onClick={handleWalletClick}
        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 px-6 py-3 rounded-xl text-white font-semibold transition-all shadow-lg hover:shadow-purple-500/50 flex items-center gap-2"
        title="Registry balance (issued credits)"
      >
        <span className="text-xl">📋</span>
        <span>Registry balance</span>
      </button>
    )
  }

  return (
    <button
      onClick={handleWalletClick}
      className="bg-slate-800 hover:bg-slate-700 border-2 border-purple-500 hover:border-purple-400 rounded-xl px-5 py-3 flex items-center gap-4 transition-all shadow-lg hover:shadow-purple-500/50"
      title="Registry balance"
    >
      <div className="relative flex items-center justify-center">
        <div className="w-3 h-3 bg-green-400 rounded-full" />
        <div className="absolute w-5 h-5 bg-green-400/30 rounded-full animate-ping" />
      </div>

      <div className="text-left">
        <div className="text-white text-sm font-mono font-bold flex items-center gap-2">
          <span>📋</span>
          <span>{formatAddress(wallet.address)}</span>
        </div>
        <div className="text-purple-300 text-sm font-bold flex items-center gap-2 mt-1">
          <span className="text-yellow-400">💰</span>
          <span>{wallet.balance.toLocaleString()} issued credits (OCC)</span>
        </div>
      </div>

      {/* Arrow */}
      <svg 
        className="w-5 h-5 text-purple-300"
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </button>
  )
}
