'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useData, type Project } from '@/context/DataContext'
import { useFeatureFlags } from '@/context/FeatureFlagContext'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { LineChart, Line, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import BlockchainWallet from '@/components/BlockchainWallet'
import CarbonDisclaimer from '@/components/CarbonDisclaimer'
import EarthEngineSatelliteViewer from '@/components/EarthEngineSatelliteViewer'
import { getGoogleMapsStaticUrl } from '@/lib/config'
import { runBlueCarbonEstimation } from '@/lib/estimation'
import { parseAreaInput } from '@/lib/area'

export default function LandownerDashboard() {
  const { projects, isLoaded, addProject, updateProject, getProjectsByOwner, dbError } = useData()
  const { canSeeAdvancedFeatures: showAdvanced } = useFeatureFlags()
  const [activeTab, setActiveTab] = useState('overview')
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const [showEarthEngine, setShowEarthEngine] = useState(false)
  const [selectedProjectForAnalysis, setSelectedProjectForAnalysis] = useState<any>(null)
  const [selectedProject, setSelectedProject] = useState<any>(null)
  
  // Registration form
  const [projectName, setProjectName] = useState('')
  const [area, setArea] = useState('')
  const [location, setLocation] = useState('')
  const [coordinates, setCoordinates] = useState<{lat: number, lng: number} | null>(null)
  const [autoDetecting, setAutoDetecting] = useState(false)
  const [uploadMethod, setUploadMethod] = useState<'photos' | 'details'>('details')
  const [photos, setPhotos] = useState<string[]>([])
  const [description, setDescription] = useState('')
  const [mapLoading, setMapLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  useEffect(() => {
    if (showRegisterModal) {
      document.body.classList.add('modal-open')
      return () => document.body.classList.remove('modal-open')
    }
  }, [showRegisterModal])

  const myProjects = getProjectsByOwner('Demo Landowner')
  
  const stats = [
    { 
      label: 'Total Area', 
      value: `${myProjects.reduce((acc, p) => acc + (parseFloat(String(p.area)) || 0), 0).toFixed(0)} ha`, 
      icon: '🌴',
      color: 'from-green-500 to-emerald-600'
    },
    { 
      label: 'Estimated Carbon Potential', 
      value: myProjects.reduce((acc, p) => acc + (p.creditsAvailable ?? 0), 0).toLocaleString(), 
      icon: '📊',
      color: 'from-yellow-500 to-orange-600'
    },
    { 
      label: 'Active Projects', 
      value: myProjects.length.toString(), 
      icon: '📊',
      color: 'from-blue-500 to-cyan-600'
    },
    { 
      label: 'Pending Approval', 
      value: myProjects.filter(p => !p.verified).length.toString(), 
      icon: '⏳',
      color: 'from-purple-500 to-pink-600'
    }
  ]

  // Chart data
  const projectStatusData = [
    { name: 'Verified', value: myProjects.filter(p => p.verified).length, color: '#10b981' },
    { name: 'Pending', value: myProjects.filter(p => !p.verified).length, color: '#f59e0b' }
  ]

  const creditsOverTime = myProjects.map((p) => ({
    name: (p.name || 'Project').substring(0, 15) + (p.name && p.name.length > 15 ? '...' : ''),
    credits: p.creditsAvailable ?? 0,
    area: parseFloat(String(p.area)) || 0
  }))

  const healthScoreData = myProjects
    .filter(p => p.mlAnalysis)
    .map(p => ({
      name: (p.name || 'Project').substring(0, 20),
      health: p.mlAnalysis?.healthScore ?? 0,
      confidence: p.mlAnalysis?.confidence ?? 0
    }))

  // Auto-detect location
  const detectLocation = () => {
    setAutoDetecting(true)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude
          const lng = position.coords.longitude
          setCoordinates({ lat, lng })
          setMapLoading(true) // Reset loading state for new coordinates
          
          // Reverse geocode to get address
          fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
            .then(res => res.json())
            .then(data => {
              setLocation(data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`)
              toast.success('Location detected successfully!')
              setAutoDetecting(false)
            })
            .catch(() => {
              setLocation(`${lat.toFixed(4)}, ${lng.toFixed(4)}`)
              toast.success('Location detected!')
              setAutoDetecting(false)
            })
        },
        (error) => {
          toast.error('Could not detect location. Please enter manually.')
          setAutoDetecting(false)
        }
      )
    } else {
      toast.error('Geolocation not supported by your browser')
      setAutoDetecting(false)
    }
  }

  // Handle photo upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const newPhotos: string[] = []
      Array.from(files).forEach(file => {
        const reader = new FileReader()
        reader.onloadend = () => {
          newPhotos.push(reader.result as string)
          if (newPhotos.length === files.length) {
            setPhotos(prev => [...prev, ...newPhotos])
            toast.success(`${files.length} photo(s) uploaded`)
          }
        }
        reader.readAsDataURL(file)
      })
    }
  }

  // Submit registration
  const handleSubmit = async () => {
    if (!projectName || !area.trim() || !location) {
      toast.error('Please fill all required fields')
      return
    }

    const areaParsed = parseAreaInput(area)
    if (!areaParsed.valid) {
      toast.error(areaParsed.error ?? 'Please enter a valid area in hectares (e.g. 20 or 20 hectares).')
      return
    }
    const areaNum = areaParsed.value

    // Upload verification photos first if any
    let uploadedImageUrls: string[] = []
    if (photos.length > 0) {
      try {
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ images: photos.slice(0, 10) }),
        })
        const uploadData = await uploadRes.json().catch(() => ({}))
        if (uploadRes.ok && Array.isArray(uploadData.urls)) {
          uploadedImageUrls = uploadData.urls
        } else if (!uploadRes.ok) {
          toast.error(uploadData.error || 'Photo upload failed. Submitting without photos.')
        }
      } catch (e) {
        console.warn('Photo upload failed:', e)
        toast.error('Photo upload failed. Submitting without photos.')
      }
    }

    // Deterministic preliminary estimation
    const treeCount = Math.floor(areaNum * 50)
    const coords = coordinates || { lat: 20.5937, lng: 78.9629 }
    const estimation = runBlueCarbonEstimation({
      area_hectares: areaNum,
      ecosystem_type: 'mangrove',
      location,
      coordinates: coords,
      timestamp: new Date().toISOString(),
    })
    const carbonCredits = estimation.estimated_co2_tonnes_per_year

    const newProject: Omit<Project, 'id' | 'submittedDate'> = {
      name: projectName,
      owner: 'Demo Landowner',
      location: location,
      coordinates: coords,
      area: `${areaNum} hectares`,
      creditsAvailable: carbonCredits,
      pricePerCredit: 25,
      verified: false,
      status: 'Pending Review' as const,
      impact: `${carbonCredits} tons CO₂/year`,
      image: '🌿',
      description: description || 'Mangrove restoration project',
      images: uploadedImageUrls.length > 0 ? uploadedImageUrls : ['📷', '📷'],
      satelliteImages: coordinates ? [
        `https://maps.googleapis.com/maps/api/staticmap?center=${coordinates.lat},${coordinates.lng}&zoom=16&size=800x600&maptype=satellite&key=`
      ] : [],
      fieldData: {
        trees: treeCount,
        species: 'Mixed Mangrove Species',
        soilType: 'Coastal Sediment',
        waterSalinity: '25 ppt'
      },
      mlAnalysis: {
        treeCount: treeCount,
        mangroveArea: areaNum,
        healthScore: estimation.health_score,
        speciesDetected: ['Rhizophora mucronata', 'Avicennia marina'],
        carbonCredits: carbonCredits,
        confidence: 90
      },
      documents: ['Land Deed', 'Survey Report']
    }

    setIsSubmitting(true)
    try {
      const created = await addProject(newProject)
      // Attach uploaded photo URLs to the project (DB insert is minimal; images are set via PATCH)
      if (uploadedImageUrls.length > 0 && created?.id != null) {
        try {
          await updateProject(created.id, { images: uploadedImageUrls })
        } catch (patchErr) {
          console.warn('Could not save verification photos to project:', patchErr)
        }
      }
      setProjectName('')
      setArea('')
      setLocation('')
      setCoordinates(null)
      setPhotos([])
      setDescription('')
      setShowRegisterModal(false)
      setActiveTab('myprojects')
      toast.success('Project registered successfully. It now appears in My Projects.', { duration: 4000 })
    } catch (error: any) {
      console.error('Error adding project:', error)
      toast.error(`Failed to register project: ${error.message || 'Unknown error'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />
          <p className="text-gray-300">Loading your projects...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white">🌊 Oceara - Project Owner</h1>
            <div className="flex gap-3 items-center">
              {showAdvanced && <BlockchainWallet />}
              <Link href="/" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold transition-all">
                Home
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {dbError && (
          <div className="mb-4 py-2 px-4 bg-amber-500/20 border border-amber-500/40 rounded-lg text-amber-200 text-sm">
            {dbError}
          </div>
        )}
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-gradient-to-br ${stat.color} p-1 rounded-2xl`}
            >
              <div className="bg-slate-900/90 backdrop-blur-lg rounded-2xl p-6 h-full">
                <div className="text-4xl mb-2">{stat.icon}</div>
                <div className="text-3xl font-bold text-white">{stat.value}</div>
                <div className="text-gray-300">{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-4 border-b border-white/20 mb-6">
          {['overview', 'myprojects', 'register'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-semibold transition-all ${
                activeTab === tab
                  ? 'text-white border-b-2 border-blue-500'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab === 'overview' && '📊 Overview'}
              {tab === 'myprojects' && `🌴 My Projects (${myProjects.length})`}
              {tab === 'register' && '➕ Register New'}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <h3 className="text-xl font-bold text-white mb-4">🚀 Quick Actions</h3>
                <button
                  onClick={() => setActiveTab('register')}
                  className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-xl text-white font-semibold text-lg transition-all mb-3"
                >
                  ➕ Register New Project
                </button>
                <button
                  onClick={() => setActiveTab('myprojects')}
                  className="w-full py-4 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 rounded-xl text-white font-semibold text-lg transition-all"
                >
                  📊 View My Projects ({myProjects.length})
                </button>
              </div>

              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <h3 className="text-xl font-bold text-white mb-4">📌 Recent Activity</h3>
                {myProjects.slice(0, 3).map((project) => (
                  <div key={project.id} className="mb-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-all cursor-pointer">
                    <p className="text-white font-semibold">{project.name}</p>
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-gray-400 text-sm">{project.status}</p>
                      <p className="text-green-400 text-sm font-semibold">{project.creditsAvailable} credits</p>
                    </div>
                  </div>
                ))}
                {myProjects.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-400 mb-2">No projects yet</p>
                    <button
                      onClick={() => setActiveTab('register')}
                      className="text-blue-400 hover:text-blue-300 font-semibold"
                    >
                      Register your first project →
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Analytics Charts */}
            {myProjects.length > 0 && (
              <div className="grid md:grid-cols-2 gap-6">
                {/* Project Status Pie Chart */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                  <h3 className="text-xl font-bold text-white mb-4">📊 Project Status</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={projectStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {projectStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Estimated Carbon Potential Bar Chart */}
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                  <h3 className="text-xl font-bold text-white mb-4">📊 Estimated Carbon Potential by Project</h3>
                  <CarbonDisclaimer className="mb-3" />
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={creditsOverTime}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="name" stroke="#94a3b8" style={{ fontSize: '12px' }} />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                      <Bar dataKey="credits" fill="#10b981" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Health Score Line Chart */}
                {healthScoreData.length > 0 && (
                  <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 md:col-span-2">
                    <h3 className="text-xl font-bold text-white mb-4">🌿 Ecosystem Health & ML Confidence</h3>
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={healthScoreData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="name" stroke="#94a3b8" style={{ fontSize: '12px' }} />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                        <Legend />
                        <Line type="monotone" dataKey="health" stroke="#10b981" strokeWidth={2} name="Health Score %" />
                        <Line type="monotone" dataKey="confidence" stroke="#3b82f6" strokeWidth={2} name="Preliminary confidence %" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* My Projects Tab */}
        {activeTab === 'myprojects' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myProjects.map((project) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:border-blue-500 transition-all cursor-pointer"
                onClick={() => setSelectedProject(project)}
              >
                <div className="text-4xl mb-3">{project.image}</div>
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <h4 className="text-white font-bold text-lg">{project.name}</h4>
                  {project.isDemo && (
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-amber-500/30 text-amber-200 border border-amber-500/50">
                      Demo / Sample
                    </span>
                  )}
                </div>
                <p className="text-gray-400 text-sm mb-3">{project.location}</p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Area:</span>
                    <span className="text-white font-semibold">{project.area}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Credits:</span>
                    <span className="text-green-400 font-semibold">{project.creditsAvailable}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Status:</span>
                    <span className={`font-semibold ${project.verified ? 'text-green-400' : 'text-yellow-400'}`}>
                      {project.status}
                    </span>
                  </div>
                </div>
                <button className="w-full mt-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold transition-all">
                  View Details
                </button>
              </motion.div>
            ))}
            {myProjects.length === 0 && (
              <div className="col-span-full text-center py-12 bg-white/5 rounded-xl border border-white/10 px-4">
                <p className="text-gray-300 text-lg mb-2">No projects under your account yet</p>
                <p className="text-gray-400 text-sm mb-4">Register a project to see it here. Demo projects appear in the Project Registry for all users.</p>
                <button
                  onClick={() => setActiveTab('register')}
                  className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg text-white font-semibold transition-all"
                >
                  Register Your First Project
                </button>
              </div>
            )}
          </div>
        )}

        {/* Register Tab */}
        {activeTab === 'register' && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
              <h3 className="text-2xl font-bold text-white mb-6">Register New Mangrove Project</h3>
              
              {/* Location Detection */}
              <div className="mb-6">
                <label className="block text-white font-semibold mb-2">📍 Project Location</label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Enter location or use auto-detect"
                    className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
                  />
                  <button
                    onClick={detectLocation}
                    disabled={autoDetecting}
                    className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded-lg text-white font-semibold transition-all"
                  >
                    {autoDetecting ? '🔄 Detecting...' : '📍 Auto-Detect'}
                  </button>
                </div>
                {coordinates && (
                  <div className="mt-3">
                    <p className="text-green-400 text-sm mb-2">
                      ✅ Coordinates: {coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)}
                    </p>
                    <div className="bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-lg p-4 border-2 border-green-500/50">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="text-3xl">📍</div>
                        <div>
                          <p className="text-white font-semibold">Location Detected Successfully!</p>
                          <p className="text-gray-300 text-sm">
                            Lat: {coordinates.lat.toFixed(6)}, Lng: {coordinates.lng.toFixed(6)}
                          </p>
                        </div>
                      </div>
                      
                      {/* Interactive Map Preview */}
                      <div className="w-full h-48 bg-slate-900 rounded-lg overflow-hidden mb-3">
                        <iframe
                          src={`https://www.openstreetmap.org/export/embed.html?bbox=${coordinates.lng-0.01},${coordinates.lat-0.01},${coordinates.lng+0.01},${coordinates.lat+0.01}&layer=mapnik&marker=${coordinates.lat},${coordinates.lng}`}
                          className="w-full h-full border-0"
                          title="Location Map"
                          loading="lazy"
                        />
                      </div>
                      
                      {/* Map Links */}
                      <div className="grid grid-cols-2 gap-2">
                        <a
                          href={`https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm font-semibold text-center transition-all"
                        >
                          🌍 Open in Google Maps
                        </a>
                        <a
                          href={`https://www.openstreetmap.org/?mlat=${coordinates.lat}&mlon=${coordinates.lng}#map=15/${coordinates.lat}/${coordinates.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white text-sm font-semibold text-center transition-all"
                        >
                          🗺️ Open in OpenStreetMap
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Project Name */}
              <div className="mb-6">
                <label className="block text-white font-semibold mb-2">🏷️ Project Name *</label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="e.g., My Mangrove Farm"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
                />
              </div>

              {/* Area */}
              <div className="mb-6">
                <label className="block text-white font-semibold mb-2">📏 Area (hectares) *</label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="e.g. 20, 20 ha, or 20 hectares"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
                />
              </div>

              {/* Description */}
              <div className="mb-6">
                <label className="block text-white font-semibold mb-2">📝 Description (Optional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your mangrove project..."
                  rows={3}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
                />
              </div>

              {/* Upload Method Choice */}
              <div className="mb-6">
                <label className="block text-white font-semibold mb-3">📸 How would you like to submit?</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setUploadMethod('details')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      uploadMethod === 'details'
                        ? 'border-green-500 bg-green-500/20'
                        : 'border-white/20 bg-white/5 hover:border-white/40'
                    }`}
                  >
                    <div className="text-3xl mb-2">📋</div>
                    <p className="text-white font-semibold">Just Details</p>
                    <p className="text-gray-400 text-sm">Map preview: OpenStreetMap. Satellite/aerial imagery used for MRV where available.</p>
                  </button>
                  
                  <button
                    onClick={() => setUploadMethod('photos')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      uploadMethod === 'photos'
                        ? 'border-blue-500 bg-blue-500/20'
                        : 'border-white/20 bg-white/5 hover:border-white/40'
                    }`}
                  >
                    <div className="text-3xl mb-2">📷</div>
                    <p className="text-white font-semibold">Upload Photos</p>
                    <p className="text-gray-400 text-sm">Add your own images</p>
                  </button>
                </div>
              </div>

              {/* Photo Upload (if selected) */}
              {uploadMethod === 'photos' && (
                <div className="mb-6">
                  <label className="block text-white font-semibold mb-2">📷 Upload Photos (Optional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    capture="environment"
                    onChange={handlePhotoUpload}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white file:cursor-pointer"
                  />
                  {photos.length > 0 && (
                    <div className="mt-3 grid grid-cols-3 gap-3">
                      {photos.map((photo, index) => (
                        <div key={index} className="relative">
                          <img src={photo} alt={`Upload ${index + 1}`} className="w-full h-24 object-cover rounded-lg" />
                          <button
                            onClick={() => setPhotos(photos.filter((_, i) => i !== index))}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={!projectName || !area || !location || isSubmitting}
                className="w-full py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed rounded-xl text-white font-bold text-lg transition-all"
              >
                {isSubmitting ? 'Creating project…' : '🚀 Submit for Verification'}
              </button>

              <p className="text-gray-400 text-sm text-center mt-4">
                * Your project will be verified by our AI system and administrators before approval
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Project Details Modal */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4" onClick={() => setSelectedProject(null)}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-slate-900 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-blue-500"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-2xl font-bold text-white">{selectedProject.name}</h3>
              <button
                onClick={() => setSelectedProject(null)}
                className="text-gray-400 hover:text-white text-3xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-blue-300 text-sm">Location:</p>
                <p className="text-white">{selectedProject.location}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-blue-300 text-sm">Area:</p>
                  <p className="text-white font-semibold">{selectedProject.area}</p>
                </div>
                <div>
                  <p className="text-blue-300 text-sm">Estimated Carbon Potential:</p>
                  <p className="text-green-400 font-semibold">{selectedProject.creditsAvailable}</p>
                  <CarbonDisclaimer className="mt-1" />
                </div>
                <div>
                  <p className="text-blue-300 text-sm">Status:</p>
                  <p className={`font-semibold ${selectedProject.verified ? 'text-green-400' : 'text-yellow-400'}`}>
                    {selectedProject.status}
                  </p>
                </div>
                <div>
                  <p className="text-blue-300 text-sm">Impact:</p>
                  <p className="text-white font-semibold">{selectedProject.impact}</p>
                </div>
              </div>

              {selectedProject.mlAnalysis && (
                <div>
                  <h4 className="text-lg font-bold text-white mb-2">Preliminary analysis</h4>
                  <div className="bg-white/5 rounded-lg p-4 space-y-2">
                    <p className="text-gray-300">Tree Count: {selectedProject.mlAnalysis.treeCount?.toLocaleString()}</p>
                    <p className="text-gray-300">Health Score: {selectedProject.mlAnalysis.healthScore}%</p>
                    <p className="text-gray-300">Confidence: {selectedProject.mlAnalysis.confidence}%</p>
                  </div>
                </div>
              )}

              {selectedProject.coordinates && (
                <button
                  onClick={() => {
                    setSelectedProjectForAnalysis(selectedProject)
                    setSelectedProject(null)
                    setShowEarthEngine(true)
                  }}
                  className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-lg text-white font-semibold transition-all flex items-center justify-center gap-2"
                >
                  <span>🛰️</span>
                  <span>View Satellite Analysis</span>
                </button>
              )}

              <button
                onClick={() => setSelectedProject(null)}
                className="w-full py-3 bg-slate-700 hover:bg-slate-600 rounded-lg text-white font-semibold transition-all"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Earth Engine Satellite Viewer */}
      {showEarthEngine && selectedProjectForAnalysis?.coordinates && (
        <EarthEngineSatelliteViewer
          coordinates={selectedProjectForAnalysis.coordinates}
          projectName={selectedProjectForAnalysis.name || 'Project'}
          area={parseFloat(String(selectedProjectForAnalysis.area).replace(/[^0-9.]/g, '')) || 10}
          onClose={() => {
            setShowEarthEngine(false)
            setSelectedProjectForAnalysis(null)
          }}
        />
      )}
    </div>
  )
}
