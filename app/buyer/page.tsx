'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import { useData } from '@/context/DataContext'
import { useFeatureFlags } from '@/context/FeatureFlagContext'
import PurchaseModal from '@/components/PurchaseModal'
import BlockchainWallet from '@/components/BlockchainWallet'
import EarthEngineSatelliteViewer from '@/components/EarthEngineSatelliteViewer'

const EarthWithProjects = dynamic(() => import('@/components/EarthWithProjects'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-96">Loading Earth...</div>
})

export default function BuyerDashboard() {
  const { projects, isLoaded, updateProject, getVerifiedProjects, dbError } = useData()
  const { canSeeAdvancedFeatures: showAdvanced } = useFeatureFlags()
  const [activeTab, setActiveTab] = useState('registry')
  const [selectedProject, setSelectedProject] = useState<any | null>(null)
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  const [showEarthEngine, setShowEarthEngine] = useState(false)
  const [myPurchases, setMyPurchases] = useState<any[]>([])
  const [totalCreditsOwned, setTotalCreditsOwned] = useState(80)
  const [totalSpent, setTotalSpent] = useState(1910)

  const verifiedProjects = getVerifiedProjects()

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4" />
          <p className="text-gray-300">Loading registry...</p>
        </div>
      </div>
    )
  }

  const handlePurchase = (projectId: number, credits: number, totalCost: number) => {
    // Find the project
    const project = projects.find(p => p.id === projectId)
    if (project) {
      // Update project credits available
      updateProject(projectId, {
        creditsAvailable: project.creditsAvailable - credits
      })

      // Add to my purchases
      const newPurchase = {
        project: project.name,
        credits,
        value: totalCost,
        date: new Date().toISOString().split('T')[0]
      }
      setMyPurchases(prev => [...prev, newPurchase])
      
      // Update totals
      setTotalCreditsOwned(prev => prev + credits)
      setTotalSpent(prev => prev + totalCost)
      
      // Close modal
      setShowPurchaseModal(false)
      setSelectedProject(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20 sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white">
              <span className="hidden sm:inline">🌊 Oceara - {showAdvanced ? 'Carbon Credit Buyer' : 'Institution / Program'}</span>
              <span className="sm:hidden">🌊 Institution</span>
            </h1>
                    <div className="flex items-center gap-2 sm:gap-4">
                      {showAdvanced && (
                        <>
                          <div className="text-right hidden sm:block">
                            <div className="text-gray-300 text-xs sm:text-sm">My Credits</div>
                            <div className="text-white font-bold text-sm sm:text-base">{totalCreditsOwned}</div>
                          </div>
                          <BlockchainWallet />
                        </>
                      )}
                    </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {dbError && (
          <div className="mb-4 py-2 px-4 bg-amber-500/20 border border-amber-500/40 rounded-lg text-amber-200 text-sm">
            {dbError}
          </div>
        )}
        {/* Tabs - hide portfolio for non-advanced (MRV-only view) */}
        <div className="flex gap-2 sm:gap-4 mb-4 sm:mb-6 overflow-x-auto pb-2 scrollbar-hide">
          {(showAdvanced ? ['marketplace', 'globe', 'portfolio'] : ['marketplace', 'globe']).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 sm:px-6 py-2 sm:py-3 rounded-full font-semibold transition-all whitespace-nowrap text-sm sm:text-base ${
                activeTab === tab
                  ? 'bg-purple-500 text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              {tab === 'marketplace' ? 'Project Registry' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Project Registry. Advanced carbon market gated by role + marketplace_access. */}
        {activeTab === 'marketplace' && (
          <div className="space-y-6">
            {!showAdvanced && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 text-amber-200 text-sm">
                You are viewing the <strong>Project Registry</strong>. Issued credits and advanced carbon market features are available to approved institutions and administrators.
              </div>
            )}
            {/* Filters */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-white mb-2 text-sm">Location</label>
                  <select className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white">
                    <option>All India</option>
                    <option>West Bengal</option>
                    <option>Kerala</option>
                    <option>Gujarat</option>
                  </select>
                </div>
                {showAdvanced && (
                  <div>
                    <label className="block text-white mb-2 text-sm">Price Range</label>
                    <select className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white">
                      <option>All Prices</option>
                      <option>$20-25</option>
                      <option>$25-30</option>
                    </select>
                  </div>
                )}
                <div>
                  <label className="block text-white mb-2 text-sm">Verification</label>
                  <select className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white">
                    <option>Verified Only</option>
                    <option>All Projects</option>
                  </select>
                </div>
                <div>
                  <label className="block text-white mb-2 text-sm">Sort By</label>
                  <select className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white">
                    {showAdvanced ? (
                      <>
                        <option>Price: Low to High</option>
                        <option>Price: High to Low</option>
                        <option>Impact: High to Low</option>
                      </>
                    ) : (
                      <>
                        <option>Impact: High to Low</option>
                        <option>Area: High to Low</option>
                        <option>Location A–Z</option>
                      </>
                    )}
                  </select>
                </div>
              </div>
            </div>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {verifiedProjects.map((project) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/10 backdrop-blur-lg rounded-2xl overflow-hidden border border-white/20 hover:border-purple-500 transition-all"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="text-4xl">{project.image}</div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-xl font-bold text-white">{project.name}</h3>
                            {project.isDemo && (
                              <span className="px-2 py-0.5 rounded text-xs font-medium bg-amber-500/30 text-amber-200 border border-amber-500/50">
                                Demo / Sample
                              </span>
                            )}
                          </div>
                          <p className="text-gray-300 text-sm">📍 {project.location}</p>
                        </div>
                      </div>
                      {project.verified && (
                        <span className="px-3 py-1 bg-green-500 rounded-full text-sm text-white">
                          ✓ Verified
                        </span>
                      )}
                    </div>

                    <p className="text-gray-300 text-sm mb-4">{project.description}</p>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-white/5 rounded-lg p-3">
                        <div className="text-gray-400 text-xs">Area</div>
                        <div className="text-white font-semibold">{project.area}</div>
                      </div>
                      <div className="bg-white/5 rounded-lg p-3">
                        <div className="text-gray-400 text-xs">CO₂ Impact</div>
                        <div className="text-white font-semibold">{project.impact}</div>
                      </div>
                      <div className="bg-white/5 rounded-lg p-3">
                        <div className="text-gray-400 text-xs">Estimated Carbon Potential</div>
                        <div className="text-white font-semibold">{project.creditsAvailable}</div>
                      </div>
                      {showAdvanced && (
                        <div className="bg-white/5 rounded-lg p-3">
                          <div className="text-gray-400 text-xs">Price per Credit</div>
                          <div className="text-white font-semibold">${project.pricePerCredit}</div>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3">
                      {showAdvanced ? (
                        <button
                          onClick={() => {
                            setSelectedProject(project)
                            setShowPurchaseModal(true)
                          }}
                          className="flex-1 py-3 bg-purple-500 rounded-full text-white font-semibold hover:bg-purple-600 transition-all"
                        >
                          💳 Request issued credits
                        </button>
                      ) : (
                        <button
                          className="flex-1 py-3 bg-green-600 rounded-full text-white font-semibold hover:bg-green-700 transition-all"
                          title="Request MRV / Fund Project"
                        >
                          📄 Request MRV / Fund Project
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setSelectedProject(project)
                          setShowEarthEngine(true)
                        }}
                        className="px-6 py-3 bg-green-600 rounded-full text-white hover:bg-green-700 transition-all"
                        title="Satellite Analysis"
                      >
                        🛰️
                      </button>
                      <button
                        onClick={() => {
                          const coords = project?.coordinates
                          if (coords && typeof coords.lat === 'number' && typeof coords.lng === 'number') {
                            window.open(`https://www.google.com/maps?q=${coords.lat},${coords.lng}&z=15&t=k`, '_blank')
                          }
                        }}
                        className="px-6 py-3 bg-white/10 rounded-full text-white hover:bg-white/20 transition-all"
                      >
                        🗺️
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Globe Tab - Interactive Earth */}
        {activeTab === 'globe' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-4">🌍 Global Mangrove Projects</h2>
              <p className="text-gray-300 mb-4">
                Explore verified mangrove conservation projects across India. Click on markers to view details.
              </p>
              <div className="h-[500px] bg-slate-900 rounded-xl overflow-hidden">
                <EarthWithProjects projects={verifiedProjects} showAdvanced={showAdvanced} />
              </div>
            </div>

            {/* Project List Below Globe */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {verifiedProjects.length === 0 ? (
                <div className="col-span-full bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 text-center text-gray-300">
                  No verified projects to display on the globe.
                </div>
              ) : verifiedProjects.map((project) => (
                <motion.div
                  key={project.id}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 hover:border-purple-500 transition-all"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="text-3xl">{project.image}</div>
                    {project.isDemo && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-500/30 text-amber-200 border border-amber-500/50">
                        Demo
                      </span>
                    )}
                  </div>
                  <h4 className="text-white font-semibold mb-1 text-sm">{project.name}</h4>
                  <p className="text-gray-400 text-xs mb-2">{project.location}</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Estimated Potential:</span>
                      <span className="text-purple-400 font-semibold">{project.creditsAvailable}</span>
                    </div>
                    {showAdvanced && (
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Price:</span>
                        <span className="text-white font-semibold">${project.pricePerCredit}/credit</span>
                      </div>
                    )}
                    <div className="flex gap-2 mt-3">
                      {showAdvanced ? (
                        <button
                          onClick={() => {
                            setSelectedProject(project)
                            setShowPurchaseModal(true)
                          }}
                          className="flex-1 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg text-white text-xs font-semibold transition-all"
                        >
                          💳 Buy
                        </button>
                      ) : (
                        <span className="flex-1 py-2 bg-green-600/80 rounded-lg text-white text-xs font-semibold text-center">Request MRV</span>
                      )}
                      <button
                        onClick={() => {
                          setSelectedProject(project)
                          setShowEarthEngine(true)
                        }}
                        className="px-3 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white text-xs transition-all"
                        title="View Satellite Analysis"
                      >
                        🛰️
                      </button>
                      <button
                        onClick={() => {
                          const coords = project?.coordinates
                          if (coords && typeof coords.lat === 'number' && typeof coords.lng === 'number') {
                            window.open(`https://www.google.com/maps?q=${coords.lat},${coords.lng}&z=15&t=k`, '_blank')
                          }
                        }}
                        className="px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-xs transition-all"
                      >
                        🗺️
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Portfolio Tab */}
        {activeTab === 'portfolio' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <div className="text-4xl mb-2">💰</div>
                <div className="text-3xl font-bold text-white">{totalCreditsOwned}</div>
                <div className="text-gray-300">Total Credits Owned</div>
              </div>
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <div className="text-4xl mb-2">🌍</div>
                <div className="text-3xl font-bold text-white">${totalSpent.toLocaleString()}</div>
                <div className="text-gray-300">Total Invested</div>
              </div>
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <div className="text-4xl mb-2">📊</div>
                <div className="text-3xl font-bold text-white">{(totalCreditsOwned * 2.5).toFixed(0)}t</div>
                <div className="text-gray-300">CO₂ Offset</div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-4">My Credit Holdings</h2>
              {myPurchases.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📊</div>
                  <p className="text-gray-400">No purchases yet</p>
                  <p className="text-gray-500 text-sm">Start buying carbon credits to see your portfolio</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {myPurchases.map((credit, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-4 bg-white/5 rounded-lg"
                  >
                    <div>
                      <div className="text-white font-semibold">{credit.project}</div>
                      <div className="text-gray-400 text-sm">Purchased: {credit.date}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-bold">{credit.credits} Credits</div>
                      <div className="text-purple-400">${credit.value}</div>
                    </div>
                  </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* Purchase Modal - only for full-access users */}
      {showAdvanced && showPurchaseModal && selectedProject && (
        <PurchaseModal
          project={selectedProject}
          onClose={() => {
            setShowPurchaseModal(false)
            setSelectedProject(null)
          }}
          onPurchase={handlePurchase}
        />
      )}

      {/* Earth Engine Satellite Viewer */}
      {showEarthEngine && selectedProject?.coordinates && (
        <EarthEngineSatelliteViewer
          coordinates={selectedProject.coordinates}
          projectName={selectedProject.name || 'Project'}
          area={parseFloat(String(selectedProject.area).replace(/[^0-9.]/g, '')) || 10}
          onClose={() => {
            setShowEarthEngine(false)
            setSelectedProject(null)
          }}
        />
      )}
    </div>
  )
}

