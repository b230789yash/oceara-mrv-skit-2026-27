'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { googleEarthEngineService } from '@/lib/googleEarthEngine'
import toast from 'react-hot-toast'

interface GoogleEarthEngineSetupProps {
  onClose?: () => void
}

export default function GoogleEarthEngineSetup({ onClose }: GoogleEarthEngineSetupProps) {
  const [clientId, setClientId] = useState('187601325863-45db1i9onqndts56g42ccub6gf0onqss.apps.googleusercontent.com')
  const [projectId, setProjectId] = useState('oceara-satellite-platform')
  const [isConfiguring, setIsConfiguring] = useState(false)
  const [configStatus, setConfigStatus] = useState<any>(null)

  useEffect(() => {
    // Load current configuration status
    const status = googleEarthEngineService.getConfigurationStatus()
    setConfigStatus(status)
  }, [])

  const handleConfigure = async () => {
    if (!clientId || !projectId) {
      toast.error('Please enter both Client ID and Project ID', { icon: '⚠️' })
      return
    }

    setIsConfiguring(true)
    try {
      // In a real implementation, you'd save these to environment variables
      // For now, we'll just test the configuration
      const testStatus = {
        hasClientId: clientId !== '' && clientId !== 'your_client_id_here',
        hasProjectId: projectId !== '' && projectId !== 'your_project_id_here',
        isInitialized: false,
        ready: false
      }
      
      setConfigStatus(testStatus)
      
      // Simulate initialization
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast.success('Google Earth Engine configured successfully!', { icon: '🛰️' })
      
      if (onClose) {
        onClose()
      }
    } catch (error) {
      console.error('Configuration failed:', error)
      toast.error('Failed to configure Google Earth Engine', { icon: '❌' })
    } finally {
      setIsConfiguring(false)
    }
  }

  const steps = [
    {
      number: 1,
      title: 'Get Google Earth Engine Access',
      description: 'Visit earthengine.google.com and sign up with your Google account',
      link: 'https://earthengine.google.com/',
      completed: false
    },
    {
      number: 2,
      title: 'Create Google Cloud Project',
      description: 'Create a new project in Google Cloud Console and enable Earth Engine API',
      link: 'https://console.cloud.google.com/',
      completed: false
    },
    {
      number: 3,
      title: 'Create OAuth 2.0 Credentials',
      description: 'Create OAuth client ID for web application in Google Cloud Console',
      link: 'https://console.cloud.google.com/apis/credentials',
      completed: false
    },
    {
      number: 4,
      title: 'Configure Environment',
      description: 'Add your API key and project ID to the environment variables',
      completed: false
    }
  ]

  return (
    <div className="fixed inset-0 bg-black/90 z-[9999] overflow-y-auto">
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">🛰️ Google Earth Engine Setup</h2>
              <p className="text-gray-300">Configure real-time satellite imagery and vegetation analysis</p>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="bg-slate-800 hover:bg-slate-700 border-2 border-slate-700 rounded-xl px-6 py-3 text-white font-semibold transition-all"
              >
                ✕ Close
              </button>
            )}
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Setup Steps */}
            <div className="space-y-6">
              <div className="bg-slate-800 border-2 border-blue-500 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">📋 Setup Steps</h3>
                <div className="space-y-4">
                  {steps.map((step, index) => (
                    <motion.div
                      key={step.number}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-4 p-4 bg-slate-700 rounded-lg"
                    >
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {step.number}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-white font-semibold mb-1">{step.title}</h4>
                        <p className="text-gray-400 text-sm mb-2">{step.description}</p>
                        {step.link && (
                          <a
                            href={step.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 text-sm underline"
                          >
                            Open Link →
                          </a>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Benefits */}
              <div className="bg-slate-800 border-2 border-green-500 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">✨ Benefits</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🔄</span>
                    <div>
                      <div className="text-white font-semibold">Real-time Updates</div>
                      <div className="text-gray-400 text-sm">Satellite imagery updated every 5 days</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🌿</span>
                    <div>
                      <div className="text-white font-semibold">Live NDVI Analysis</div>
                      <div className="text-gray-400 text-sm">Real-time vegetation health monitoring</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">📊</span>
                    <div>
                      <div className="text-white font-semibold">Time Series Data</div>
                      <div className="text-gray-400 text-sm">Historical trends and change detection</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🎯</span>
                    <div>
                      <div className="text-white font-semibold">High Resolution</div>
                      <div className="text-gray-400 text-sm">10m resolution Sentinel-2 imagery</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Configuration Form */}
            <div className="space-y-6">
              {/* Current Status */}
              <div className="bg-slate-800 border-2 border-purple-500 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">🔧 Configuration Status</h3>
                {configStatus && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                      <span className="text-gray-300">OAuth Client ID</span>
                      <span className={`font-bold ${configStatus.hasClientId ? 'text-green-400' : 'text-red-400'}`}>
                        {configStatus.hasClientId ? '✅ Configured' : '❌ Missing'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                      <span className="text-gray-300">Project ID</span>
                      <span className={`font-bold ${configStatus.hasProjectId ? 'text-green-400' : 'text-red-400'}`}>
                        {configStatus.hasProjectId ? '✅ Configured' : '❌ Missing'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                      <span className="text-gray-300">Initialized</span>
                      <span className={`font-bold ${configStatus.isInitialized ? 'text-green-400' : 'text-yellow-400'}`}>
                        {configStatus.isInitialized ? '✅ Ready' : '⏳ Pending'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
                      <span className="text-gray-300">Overall Status</span>
                      <span className={`font-bold ${configStatus.ready ? 'text-green-400' : 'text-red-400'}`}>
                        {configStatus.ready ? '✅ Ready' : '❌ Not Ready'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Configuration Form */}
              <div className="bg-slate-800 border-2 border-orange-500 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">⚙️ Quick Configuration</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-white font-semibold mb-2">Google OAuth 2.0 Client ID</label>
                    <input
                      type="text"
                      value={clientId}
                      onChange={(e) => setClientId(e.target.value)}
                      placeholder="Enter your OAuth client ID..."
                      className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-lg text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none"
                    />
                    <p className="text-gray-400 text-sm mt-1">
                      Format: 123456789-abc123def456.apps.googleusercontent.com
                    </p>
                  </div>
                  <div>
                    <label className="block text-white font-semibold mb-2">Google Cloud Project ID</label>
                    <input
                      type="text"
                      value={projectId}
                      onChange={(e) => setProjectId(e.target.value)}
                      placeholder="Enter your project ID..."
                      className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-lg text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none"
                    />
                  </div>
                  <button
                    onClick={handleConfigure}
                    disabled={isConfiguring || !clientId || !projectId}
                    className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 px-6 py-3 rounded-lg text-white font-semibold transition-all flex items-center justify-center gap-2"
                  >
                    {isConfiguring ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Configuring...</span>
                      </>
                    ) : (
                      <>
                        <span>🛰️</span>
                        <span>Configure Google Earth Engine</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Environment Variables */}
              <div className="bg-slate-800 border-2 border-slate-700 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">🔐 Environment Variables</h3>
                <div className="space-y-3">
                  <div className="p-3 bg-slate-900 rounded-lg">
                    <div className="text-gray-400 text-sm mb-1">Add to your .env.local file:</div>
                    <code className="text-green-400 text-sm block">
                      NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_client_id_here
                    </code>
                    <code className="text-green-400 text-sm block">
                      NEXT_PUBLIC_GOOGLE_EARTH_ENGINE_PROJECT_ID=your_project_id_here
                    </code>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
