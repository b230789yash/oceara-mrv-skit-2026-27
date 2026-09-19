'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Project {
  id: number
  name: string
  location: string
  creditsAvailable: number
  pricePerCredit: number
  impact: string
  image: string
}

interface PurchaseModalProps {
  project: Project | null
  onClose: () => void
  onPurchase: (projectId: number, credits: number, totalCost: number) => void
}

export default function PurchaseModal({ project, onClose, onPurchase }: PurchaseModalProps) {
  const [credits, setCredits] = useState(10)
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'wallet'>('card')
  const [isPurchasing, setIsPurchasing] = useState(false)
  const [purchaseComplete, setPurchaseComplete] = useState(false)

  useEffect(() => {
    if (project) {
      document.body.classList.add('modal-open')
      return () => document.body.classList.remove('modal-open')
    }
  }, [project])

  if (!project) return null

  const totalCost = credits * (project.pricePerCredit ?? 0)
  const impactStr = (project.impact || '0').split(' ')[0]?.replace(/,/g, '') || '0'
  const impactNum = parseFloat(impactStr) || 0
  const creditsAvail = project.creditsAvailable ?? 1
  const co2Offset = (credits * impactNum / creditsAvail).toFixed(2)

  const handlePurchase = async () => {
    setIsPurchasing(true)
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Call the purchase callback
    onPurchase(project.id, credits, totalCost)
    
    setIsPurchasing(false)
    setPurchaseComplete(true)
    
    // Close modal after showing success
    setTimeout(() => {
      setPurchaseComplete(false)
      onClose()
    }, 2000)
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-gradient-to-br from-slate-900 to-purple-900 rounded-xl sm:rounded-2xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto border border-purple-500/30 my-4"
        >
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-white/10">
            <div className="flex justify-between items-start gap-3">
              <div className="flex items-center gap-2 sm:gap-4">
                <span className="text-3xl sm:text-5xl">{project.image}</span>
                <div>
                  <h2 className="text-lg sm:text-2xl font-bold text-white">{project.name}</h2>
                  <p className="text-gray-300 text-xs sm:text-sm">📍 {project.location}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-red-400 text-xl sm:text-2xl transition-colors flex-shrink-0"
              >
                ✕
              </button>
            </div>
          </div>

          {!purchaseComplete ? (
            <>
              {/* Purchase Form */}
              <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                {/* Credit Selection */}
                <div>
                  <label className="block text-white font-semibold mb-3 text-sm sm:text-base">
                    How many credits do you want to purchase?
                  </label>
                  <div className="grid grid-cols-4 gap-2 sm:gap-3 mb-4">
                    {[10, 25, 50, 100].map((amount) => (
                      <button
                        key={amount}
                        onClick={() => setCredits(amount)}
                        className={`py-2 sm:py-3 rounded-lg font-semibold transition-all text-sm sm:text-base ${
                          credits === amount
                            ? 'bg-purple-500 text-white'
                            : 'bg-white/10 text-gray-300 hover:bg-white/20'
                        }`}
                      >
                        {amount}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="1"
                      max={Math.min(project.creditsAvailable, 500)}
                      value={credits}
                      onChange={(e) => setCredits(parseInt(e.target.value))}
                      className="flex-1 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                    />
                    <input
                      type="number"
                      min="1"
                      max={project.creditsAvailable}
                      value={credits}
                      onChange={(e) => setCredits(parseInt(e.target.value) || 1)}
                      className="w-24 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-center"
                    />
                  </div>
                  <p className="text-gray-400 text-sm mt-2">
                    Available: {project.creditsAvailable} credits
                  </p>
                </div>

                {/* Impact Summary */}
                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                  <h3 className="text-white font-semibold mb-3">Your Environmental Impact</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-gray-400 text-sm">CO₂ Offset</div>
                      <div className="text-green-400 font-bold text-xl">{co2Offset} tons</div>
                    </div>
                    <div>
                      <div className="text-gray-400 text-sm">Equivalent To</div>
                      <div className="text-white font-semibold">
                        {(parseFloat(co2Offset) * 2.5).toFixed(0)} trees planted
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-white font-semibold mb-3">
                    Select Payment Method
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => setPaymentMethod('card')}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        paymentMethod === 'card'
                          ? 'border-purple-500 bg-purple-500/20'
                          : 'border-white/20 bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      <div className="text-2xl mb-1">💳</div>
                      <div className="text-white text-sm font-semibold">Card</div>
                    </button>
                    <button
                      onClick={() => setPaymentMethod('upi')}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        paymentMethod === 'upi'
                          ? 'border-purple-500 bg-purple-500/20'
                          : 'border-white/20 bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      <div className="text-2xl mb-1">📱</div>
                      <div className="text-white text-sm font-semibold">UPI</div>
                    </button>
                    <button
                      onClick={() => setPaymentMethod('wallet')}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        paymentMethod === 'wallet'
                          ? 'border-purple-500 bg-purple-500/20'
                          : 'border-white/20 bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      <div className="text-2xl mb-1">📋</div>
                      <div className="text-white text-sm font-semibold">Registry balance</div>
                    </button>
                  </div>
                </div>

                {/* Payment Details */}
                {paymentMethod === 'card' && (
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Card Number"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="MM/YY"
                        className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
                      />
                      <input
                        type="text"
                        placeholder="CVV"
                        className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
                      />
                    </div>
                  </div>
                )}

                {paymentMethod === 'upi' && (
                  <input
                    type="text"
                    placeholder="UPI ID (e.g., user@upi)"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
                  />
                )}

                {paymentMethod === 'wallet' && (
                  <div className="bg-white/5 border border-white/20 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-400">Registry balance (issued credits)</span>
                      <span className="text-white font-bold text-lg">$5,000</span>
                    </div>
                    <div className="text-green-400 text-sm">✓ Sufficient balance</div>
                  </div>
                )}

                {/* Price Summary */}
                <div className="bg-white/5 border border-white/20 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400">Credits</span>
                    <span className="text-white">{credits} × ${project.pricePerCredit}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400">Platform Fee</span>
                    <span className="text-white">${(totalCost * 0.02).toFixed(2)}</span>
                  </div>
                  <div className="border-t border-white/20 my-3"></div>
                  <div className="flex justify-between items-center">
                    <span className="text-white font-bold text-lg">Total</span>
                    <span className="text-purple-400 font-bold text-2xl">
                      ${(totalCost * 1.02).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-6 border-t border-white/10 flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 bg-white/10 hover:bg-white/20 rounded-lg text-white font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePurchase}
                  disabled={isPurchasing || credits > project.creditsAvailable}
                  className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                    isPurchasing
                      ? 'bg-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-purple-500 to-blue-500 hover:shadow-2xl'
                  } text-white`}
                >
                  {isPurchasing ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin">⚡</span>
                      Processing...
                    </span>
                  ) : (
                    `Purchase ${credits} Credits`
                  )}
                </button>
              </div>
            </>
          ) : (
            /* Success Message */
            <div className="p-12 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-8xl mb-4"
              >
                ✅
              </motion.div>
              <h3 className="text-3xl font-bold text-white mb-2">Purchase Successful!</h3>
              <p className="text-gray-300 mb-4">
                You've purchased {credits} carbon credits
              </p>
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 inline-block">
                <div className="text-green-400 font-bold text-xl">
                  {co2Offset} tons CO₂ offset
                </div>
                <div className="text-gray-400 text-sm">Making a real impact! 🌍</div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

