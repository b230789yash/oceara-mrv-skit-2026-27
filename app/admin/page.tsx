'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useData } from '@/context/DataContext'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'
import { BarChart, Bar, PieChart, Pie, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'
import toast from 'react-hot-toast'
import CarbonDisclaimer from '@/components/CarbonDisclaimer'
import { writeAuditLog } from '@/lib/audit'
import { generateMrvReportPdf, type ProjectForReport } from '@/lib/mrvReportPdf'

export default function AdminDashboard() {
  const { projects, isLoaded, updateProject, getPendingProjects, getVerifiedProjects } = useData()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedProject, setSelectedProject] = useState<any>(null)
  const [showModal, setShowModal] = useState(false)
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'verified'>('all')
  const [auditLogs, setAuditLogs] = useState<Array<{ id: string; action: string; resource_type: string; resource_id: string | null; user_email: string | null; details: unknown; created_at: string }>>([])
  const [profiles, setProfiles] = useState<Array<{ id: string; email: string | null; full_name: string | null; role: string; marketplace_access: boolean }>>([])
  const [auditLoading, setAuditLoading] = useState(false)
  const [profilesLoading, setProfilesLoading] = useState(false)
  const [profileEdit, setProfileEdit] = useState<{ id: string; role: string; marketplace_access: boolean } | null>(null)
  const searchParams = useSearchParams()

  useEffect(() => {
    if (activeTab === 'audit') {
      setAuditLoading(true)
      fetch('/api/audit-logs').then(r => r.json()).then(data => { setAuditLogs(Array.isArray(data) ? data : []); setAuditLoading(false) }).catch(() => setAuditLoading(false))
    }
  }, [activeTab])
  useEffect(() => {
    if (activeTab === 'users') {
      setProfilesLoading(true)
      fetch('/api/profiles').then(r => r.json()).then(data => { setProfiles(Array.isArray(data) ? data : []); setProfilesLoading(false) }).catch(() => setProfilesLoading(false))
    }
  }, [activeTab])

  // Handle Google OAuth success
  useEffect(() => {
    const googleAuth = searchParams.get('google_auth')
    const userEmail = searchParams.get('user_email')
    const userName = searchParams.get('user_name')
    
    if (googleAuth === 'success' && userEmail) {
      toast.success(`Welcome ${userName || userEmail}!`, { icon: '🎉', duration: 3500 })
      
      // Store user info in localStorage
      localStorage.setItem('google_user', JSON.stringify({
        email: userEmail,
        name: userName,
        authenticated: true
      }))
      
      // Clean up URL parameters
      window.history.replaceState({}, '', '/admin')
    }
  }, [searchParams])

  const pendingProjects = getPendingProjects()
  const verifiedProjects = getVerifiedProjects()
  
  const stats = [
    { 
      label: 'Pending Approvals', 
      value: pendingProjects.length.toString(), 
      icon: '⏳', 
      color: 'from-yellow-500 to-orange-500'
    },
    { 
      label: 'Verified Projects', 
      value: verifiedProjects.length.toString(), 
      icon: '✅', 
      color: 'from-green-500 to-emerald-500'
    },
    { 
      label: 'Estimated Carbon Potential', 
      value: `${(verifiedProjects.reduce((acc, p) => acc + (p.mlAnalysis?.carbonCredits || 0), 0) / 1000).toFixed(1)}K`, 
      icon: '📊', 
      color: 'from-blue-500 to-cyan-500'
    },
    { 
      label: 'Total Area', 
      value: `${verifiedProjects.reduce((acc, p) => acc + parseFloat(p.area), 0).toFixed(0)} ha`, 
      icon: '🌍', 
      color: 'from-purple-500 to-pink-500'
    }
  ]

  const handleApprove = async (projectId: number | string) => {
    try {
      await updateProject(projectId, {
        status: 'Active',
        verified: true
      })
      await writeAuditLog({
        action: 'project_approve',
        resource_type: 'project',
        resource_id: String(projectId),
        details: { status: 'Active', verified: true },
        user_id: user?.id,
        user_email: user?.email ?? undefined,
      })
      toast.success('✅ Project approved successfully!')
      setShowModal(false)
      setSelectedProject(null)
    } catch (error: any) {
      console.error('Error approving project:', error)
      toast.error(`Failed to approve project: ${error.message || 'Unknown error'}`)
    }
  }

  const handleReject = async (projectId: number | string) => {
    try {
      await updateProject(projectId, {
        status: 'Rejected',
        verified: false
      })
      await writeAuditLog({
        action: 'project_reject',
        resource_type: 'project',
        resource_id: String(projectId),
        details: { status: 'Rejected', verified: false },
        user_id: user?.id,
        user_email: user?.email ?? undefined,
      })
      toast.success('❌ Project rejected')
      setShowModal(false)
      setSelectedProject(null)
    } catch (error: any) {
      console.error('Error rejecting project:', error)
      toast.error(`Failed to reject project: ${error.message || 'Unknown error'}`)
    }
  }

  const getFilteredProjects = () => {
    if (filterStatus === 'pending') {
      return pendingProjects
    }
    if (filterStatus === 'verified') {
      return verifiedProjects
    }
    return [...pendingProjects, ...verifiedProjects]
  }

  const filteredProjects = getFilteredProjects()

  useEffect(() => {
    if (showModal && selectedProject) {
      document.body.classList.add('modal-open')
      return () => document.body.classList.remove('modal-open')
    }
  }, [showModal, selectedProject])

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4" />
          <p className="text-gray-300">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-md border-b border-white/20 sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white">
                🌊 Oceara - MRV Administrator
              </h1>
              <p className="text-gray-300 text-xs sm:text-sm">Project Verification & MRV Reports</p>
            </div>
            <Link
              href="/"
              className="px-3 sm:px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm transition-all"
            >
              🏠 Home
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/10 backdrop-blur-lg rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/20"
            >
              <div className={`text-2xl sm:text-4xl mb-2 sm:mb-3 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                {stat.icon}
              </div>
              <div className="text-2xl sm:text-3xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-gray-400 text-xs sm:text-sm">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {['overview', 'approval', 'blockchain', 'reports', 'audit', 'users'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              {tab === 'overview' && '📊 Overview'}
              {tab === 'approval' && '✅ Approval'}
              {tab === 'blockchain' && '⛓️ Blockchain'}
              {tab === 'reports' && '📄 Reports'}
              {tab === 'audit' && '🔒 Audit Log'}
              {tab === 'users' && '👥 Users'}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Charts Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Project Status Distribution */}
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <h3 className="text-xl font-bold text-white mb-4">📊 Project Status Distribution</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Verified', value: verifiedProjects.length, color: '#10b981' },
                        { name: 'Pending', value: pendingProjects.length, color: '#f59e0b' },
                        { name: 'Total', value: projects.length - verifiedProjects.length - pendingProjects.length || 1, color: '#6b7280' }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }: any) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {[
                        { name: 'Verified', value: verifiedProjects.length, color: '#10b981' },
                        { name: 'Pending', value: pendingProjects.length, color: '#f59e0b' },
                        { name: 'Total', value: projects.length - verifiedProjects.length - pendingProjects.length || 1, color: '#6b7280' }
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Estimated Carbon Potential by Region */}
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <h3 className="text-xl font-bold text-white mb-4">📊 Estimated Carbon Potential by Region</h3>
                <CarbonDisclaimer className="mb-3" />
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={[
                    { region: 'West Bengal', credits: verifiedProjects.filter(p => p.location.includes('West Bengal')).reduce((acc, p) => acc + (p.creditsAvailable || 0), 0) },
                    { region: 'Odisha', credits: verifiedProjects.filter(p => p.location.includes('Odisha')).reduce((acc, p) => acc + (p.creditsAvailable || 0), 0) },
                    { region: 'Tamil Nadu', credits: verifiedProjects.filter(p => p.location.includes('Tamil Nadu')).reduce((acc, p) => acc + (p.creditsAvailable || 0), 0) },
                    { region: 'Kerala', credits: verifiedProjects.filter(p => p.location.includes('Kerala')).reduce((acc, p) => acc + (p.creditsAvailable || 0), 0) },
                    { region: 'Others', credits: verifiedProjects.filter(p => !p.location.includes('West Bengal') && !p.location.includes('Odisha') && !p.location.includes('Tamil Nadu') && !p.location.includes('Kerala')).reduce((acc, p) => acc + (p.creditsAvailable || 0), 0) }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="region" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
                    <Bar dataKey="credits" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Estimation confidence */}
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <h3 className="text-xl font-bold text-white mb-4">📊 Preliminary confidence distribution</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={[
                    { range: '80-85%', count: projects.filter(p => p.mlAnalysis && p.mlAnalysis.confidence >= 80 && p.mlAnalysis.confidence < 85).length },
                    { range: '85-90%', count: projects.filter(p => p.mlAnalysis && p.mlAnalysis.confidence >= 85 && p.mlAnalysis.confidence < 90).length },
                    { range: '90-95%', count: projects.filter(p => p.mlAnalysis && p.mlAnalysis.confidence >= 90 && p.mlAnalysis.confidence < 95).length },
                    { range: '95-100%', count: projects.filter(p => p.mlAnalysis && p.mlAnalysis.confidence >= 95).length }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="range" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
                    <Bar dataKey="count" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Health Score Distribution */}
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <h3 className="text-xl font-bold text-white mb-4">🌱 Ecosystem Health Scores</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={projects.filter(p => p.mlAnalysis).slice(0, 10).map((p, i) => ({
                    name: `Project ${i + 1}`,
                    health: p.mlAnalysis?.healthScore || 0
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" domain={[0, 100]} />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
                    <Line type="monotone" dataKey="health" stroke="#10b981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Detailed Statistics */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <h3 className="text-lg font-bold text-white mb-4">📈 Recent Activity</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                    <span className="text-gray-300">Projects Verified</span>
                    <span className="text-green-400 font-bold">{verifiedProjects.length}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                    <span className="text-gray-300">Awaiting Review</span>
                    <span className="text-yellow-400 font-bold">{pendingProjects.length}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                    <span className="text-gray-300">Total Estimated Potential</span>
                    <span className="text-blue-400 font-bold">{verifiedProjects.reduce((acc, p) => acc + (p.creditsAvailable || 0), 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                    <span className="text-gray-300">Total Area</span>
                    <span className="text-purple-400 font-bold">{verifiedProjects.reduce((acc, p) => acc + parseFloat(p.area), 0).toFixed(0)} ha</span>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <h3 className="text-lg font-bold text-white mb-4">🔬 Preliminary analysis summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                    <span className="text-gray-300">Avg Confidence</span>
                    <span className="text-blue-400 font-bold">
                      {(projects.reduce((acc, p) => acc + (p.mlAnalysis?.confidence || 0), 0) / projects.length).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                    <span className="text-gray-300">Avg Health Score</span>
                    <span className="text-green-400 font-bold">
                      {(projects.reduce((acc, p) => acc + (p.mlAnalysis?.healthScore || 0), 0) / projects.length).toFixed(1)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                    <span className="text-gray-300">Total Trees</span>
                    <span className="text-emerald-400 font-bold">
                      {projects.reduce((acc, p) => acc + (p.mlAnalysis?.treeCount || 0), 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                    <span className="text-gray-300">Species Detected</span>
                    <span className="text-teal-400 font-bold">
                      {Array.from(new Set(projects.flatMap(p => p.mlAnalysis?.speciesDetected || []))).length}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <h3 className="text-lg font-bold text-white mb-4">⚙️ System Status</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                    <span className="text-gray-300">Blockchain</span>
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      <span className="text-green-400 font-semibold">Online</span>
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                    <span className="text-gray-300">ML Analysis</span>
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      <span className="text-green-400 font-semibold">Ready</span>
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                    <span className="text-gray-300">Database</span>
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      <span className="text-green-400 font-semibold">Connected</span>
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                    <span className="text-gray-300">API</span>
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500"></span>
                      <span className="text-green-400 font-semibold">Active</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Approval Tab */}
        {activeTab === 'approval' && (
          <div className="space-y-6">
            {/* Filter */}
            <div className="flex gap-2">
              {['all', 'pending', 'verified'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status as any)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                    filterStatus === status
                      ? 'bg-blue-500 text-white'
                      : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)} ({
                    status === 'all' ? projects.length :
                    status === 'pending' ? pendingProjects.length :
                    verifiedProjects.length
                  })
                </button>
              ))}
            </div>

            {/* Projects Grid - Admin sees all projects including demo/sample */}
            {filteredProjects.length === 0 ? (
              <div className="rounded-xl p-8 bg-white/5 border border-white/10 text-center text-gray-400">
                <p className="text-lg mb-2">No projects match the current filter</p>
                <p className="text-sm">Switch to &quot;all&quot; to see every project, including demo samples.</p>
              </div>
            ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProjects.map((project) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 hover:border-purple-500 transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="text-3xl">{project.image}</div>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      project.verified 
                        ? 'bg-green-500/20 text-green-300' 
                        : 'bg-yellow-500/20 text-yellow-300'
                    }`}>
                      {project.status}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="text-lg font-bold text-white">{project.name}</h3>
                    {project.isDemo && (
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-amber-500/30 text-amber-200 border border-amber-500/50">
                        Demo / Sample
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm mb-3">{project.location}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Area:</span>
                      <span className="text-white font-semibold">{project.area}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Credits:</span>
                      <span className="text-purple-400 font-semibold">{project.creditsAvailable}</span>
                    </div>
                    {project.mlAnalysis && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Preliminary confidence:</span>
                        <span className="text-blue-400 font-semibold">{project.mlAnalysis.confidence}%</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedProject(project)
                        setShowModal(true)
                      }}
                      className="flex-1 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white text-sm font-semibold transition-all"
                    >
                      📋 View Details
                    </button>
                    {!project.verified && (
                      <button
                        onClick={() => handleApprove(project.id)}
                        className="px-3 py-2 bg-green-500 hover:bg-green-600 rounded-lg text-white text-sm transition-all"
                      >
                        ✅
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
            )}
          </div>
        )}

        {/* Blockchain Tab */}
        {activeTab === 'blockchain' && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-4">⛓️ Blockchain Registry</h2>
            <div className="space-y-4">
              {verifiedProjects.slice(0, 5).map((project) => (
                <div key={project.id} className="bg-white/5 rounded-xl p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-white font-semibold">{project.name}</h3>
                      <p className="text-gray-400 text-sm">Credits: {project.creditsAvailable}</p>
                    </div>
                    <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-xs">
                      On-Chain
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-4">📄 Export Reports</h2>
              <p className="text-gray-300 mb-6">Download comprehensive reports for compliance and analysis</p>
              
              <div className="grid md:grid-cols-2 gap-4">
                {/* Project Report */}
                <button 
                  onClick={() => {
                    const data = projects.map(p => ({
                      ID: p.id,
                      Name: p.name,
                      Owner: p.owner,
                      Location: p.location,
                      Area: p.area,
                      Status: p.status,
                      Verified: p.verified ? 'Yes' : 'No',
                      Credits: p.creditsAvailable,
                      'Submitted Date': p.submittedDate,
                      'Health Score': p.mlAnalysis?.healthScore || 'N/A',
                      'Preliminary confidence': p.mlAnalysis?.confidence ? `${p.mlAnalysis.confidence}%` : 'N/A'
                    }))
                    const csv = [
                      Object.keys(data[0]).join(','),
                      ...data.map(row => Object.values(row).join(','))
                    ].join('\n')
                    const blob = new Blob([csv], { type: 'text/csv' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = `oceara-projects-report-${new Date().toISOString().split('T')[0]}.csv`
                    a.click()
                    toast.success('Project report downloaded!')
                  }}
                  className="p-4 bg-gradient-to-br from-blue-500/20 to-purple-500/20 hover:from-blue-500/30 hover:to-purple-500/30 rounded-xl text-left transition-all border border-blue-500/30"
                >
                  <div className="text-3xl mb-2">📊</div>
                  <h3 className="text-white font-semibold mb-1">Project Report</h3>
                  <p className="text-gray-300 text-sm mb-3">Export all project data (CSV)</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400">{projects.length} projects</span>
                    <span className="text-blue-400 text-sm">⬇ Download</span>
                  </div>
                </button>

                {/* MRV PDF Report (per project) */}
                <div className="p-4 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl border border-cyan-500/30">
                  <div className="text-3xl mb-2">📄</div>
                  <h3 className="text-white font-semibold mb-1">MRV PDF Report</h3>
                  <p className="text-gray-300 text-sm mb-3">Download standardized PDF for one project (carbon, health, confidence, ref ID)</p>
                  <select
                    className="w-full mb-2 px-3 py-2 rounded-lg bg-white/10 text-white border border-white/20 text-sm"
                    defaultValue=""
                    onChange={(e) => {
                      const id = e.target.value
                      if (!id) return
                      const p = projects.find(pr => String(pr.id) === id)
                      if (!p) return
                      const forReport: ProjectForReport = {
                        id: p.id,
                        name: p.name,
                        location: p.location,
                        area: p.area,
                        coordinates: p.coordinates,
                        status: p.status,
                        verified: p.verified,
                        impact: p.impact,
                        creditsAvailable: p.creditsAvailable,
                        submittedDate: p.submittedDate,
                        mlAnalysis: p.mlAnalysis ? { healthScore: p.mlAnalysis.healthScore, confidence: p.mlAnalysis.confidence, carbonCredits: p.mlAnalysis.carbonCredits, speciesDetected: p.mlAnalysis.speciesDetected } : undefined,
                      }
                      generateMrvReportPdf(forReport)
                      toast.success('MRV PDF downloaded')
                      e.target.value = ''
                    }}
                  >
                    <option value="">Select project...</option>
                    {projects.map((p) => (
                      <option key={p.id} value={String(p.id)}>{p.name}</option>
                    ))}
                  </select>
                  <div className="text-xs text-gray-400">{projects.length} projects</div>
                </div>

                {/* Carbon Estimation Report (Pre-Certification) */}
                <button 
                  onClick={() => {
                    const verifiedOnly = verifiedProjects
                    const data = verifiedOnly.map(p => ({
                      Project: p.name,
                      Location: p.location,
                      'Estimated Carbon Potential': p.creditsAvailable,
                      Impact: p.impact,
                      Status: p.status,
                      'Preliminary confidence': p.mlAnalysis?.confidence ? `${p.mlAnalysis.confidence}%` : 'N/A'
                    }))
                    const csv = [
                      Object.keys(data[0]).join(','),
                      ...data.map(row => Object.values(row).join(','))
                    ].join('\n')
                    const disclaimer = '\n\nDisclaimer: Carbon values are AI-based estimates and require institutional or regulatory verification before certification.'
                    const blob = new Blob([csv + disclaimer], { type: 'text/csv' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = `oceara-carbon-estimation-report-${new Date().toISOString().split('T')[0]}.csv`
                    a.click()
                    toast.success('Carbon Estimation Report downloaded!')
                  }}
                  className="p-4 bg-gradient-to-br from-green-500/20 to-emerald-500/20 hover:from-green-500/30 hover:to-emerald-500/30 rounded-xl text-left transition-all border border-green-500/30"
                >
                  <div className="text-3xl mb-2">📊</div>
                  <h3 className="text-white font-semibold mb-1">Carbon Estimation Report (Pre-Certification)</h3>
                  <p className="text-gray-300 text-sm mb-3">Export estimated carbon potential & methodology (CSV)</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400">{verifiedProjects.length} projects</span>
                    <span className="text-green-400 text-sm">⬇ Download</span>
                  </div>
                </button>

                {/* Analytics Report */}
                <button 
                  onClick={() => {
                    const stats = {
                      'Report Generated': new Date().toLocaleString(),
                      'Total Projects': projects.length,
                      'Verified Projects': verifiedProjects.length,
                      'Pending Projects': pendingProjects.length,
                      'Total Estimated Carbon Potential': verifiedProjects.reduce((acc, p) => acc + p.creditsAvailable, 0),
                      'Total Area (hectares)': verifiedProjects.reduce((acc, p) => acc + parseFloat(p.area), 0).toFixed(2),
                      'Average estimation confidence': `${projects.length ? (projects.reduce((acc, p) => acc + (p.mlAnalysis?.confidence || 0), 0) / projects.length).toFixed(1) : 0}%`,
                      'Average Health Score': projects.length ? (projects.reduce((acc, p) => acc + (p.mlAnalysis?.healthScore || 0), 0) / projects.length).toFixed(1) : '0',
                      'Total Trees': projects.reduce((acc, p) => acc + (p.mlAnalysis?.treeCount || 0), 0),
                      'Unique Species': Array.from(new Set(projects.flatMap(p => p.mlAnalysis?.speciesDetected || []))).length,
                      'Total Impact (CO₂/year)': verifiedProjects.reduce((acc, p) => {
                      if (!p.impact || typeof p.impact !== 'string') return acc
                      const num = parseFloat(p.impact.split(' ')[0].replace(/,/g, ''))
                      return acc + (Number.isFinite(num) ? num : 0)
                    }, 0).toFixed(0) + ' tons'
                    }
                    const csv = Object.entries(stats).map(([key, value]) => `${key},${value}`).join('\n')
                    const blob = new Blob([csv], { type: 'text/csv' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = `oceara-analytics-${new Date().toISOString().split('T')[0]}.csv`
                    a.click()
                    toast.success('Analytics report downloaded!')
                  }}
                  className="p-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 rounded-xl text-left transition-all border border-purple-500/30"
                >
                  <div className="text-3xl mb-2">📈</div>
                  <h3 className="text-white font-semibold mb-1">Analytics Report</h3>
                  <p className="text-gray-300 text-sm mb-3">Export platform analytics (CSV)</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400">11 key metrics</span>
                    <span className="text-purple-400 text-sm">⬇ Download</span>
                  </div>
                </button>

                {/* Audit Log */}
                <button 
                  onClick={() => {
                    const auditData = projects.map(p => ({
                      'Project ID': p.id,
                      'Project Name': p.name,
                      Action: p.verified ? 'Approved' : 'Pending Review',
                      'Submitted Date': p.submittedDate,
                      Status: p.status,
                      'Verification Status': p.verified ? 'Verified' : 'Unverified',
                      Documents: p.documents?.length || 0,
                      'Preliminary analysis': p.mlAnalysis ? 'Completed' : 'Pending'
                    }))
                    const csv = [
                      Object.keys(auditData[0]).join(','),
                      ...auditData.map(row => Object.values(row).join(','))
                    ].join('\n')
                    const blob = new Blob([csv], { type: 'text/csv' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = `oceara-audit-log-${new Date().toISOString().split('T')[0]}.csv`
                    a.click()
                    toast.success('Audit log downloaded!')
                  }}
                  className="p-4 bg-gradient-to-br from-orange-500/20 to-red-500/20 hover:from-orange-500/30 hover:to-red-500/30 rounded-xl text-left transition-all border border-orange-500/30"
                >
                  <div className="text-3xl mb-2">🔒</div>
                  <h3 className="text-white font-semibold mb-1">Audit Log</h3>
                  <p className="text-gray-300 text-sm mb-3">Export audit trail (CSV)</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400">{projects.length} entries</span>
                    <span className="text-orange-400 text-sm">⬇ Download</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Report Preview */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-4">📋 Recent Activity</h3>
              <div className="space-y-3">
                {projects.slice(0, 5).map((project) => (
                  <div key={project.id} className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{project.image}</span>
                      <div>
                        <p className="text-white font-semibold">{project.name}</p>
                        <p className="text-gray-400 text-sm">{project.submittedDate}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      project.verified 
                        ? 'bg-green-500/20 text-green-300' 
                        : 'bg-yellow-500/20 text-yellow-300'
                    }`}>
                      {project.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Audit Log Tab */}
        {activeTab === 'audit' && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-4">🔒 Audit Log</h2>
            {auditLoading ? (
              <p className="text-gray-400">Loading...</p>
            ) : auditLogs.length === 0 ? (
              <p className="text-gray-400">No audit entries yet. Approve/reject projects to see entries here.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="text-gray-400 border-b border-white/20">
                      <th className="py-2 pr-4">Time</th>
                      <th className="py-2 pr-4">Action</th>
                      <th className="py-2 pr-4">Resource</th>
                      <th className="py-2 pr-4">User</th>
                      <th className="py-2">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.map((log) => (
                      <tr key={log.id} className="border-b border-white/10">
                        <td className="py-2 pr-4 text-gray-300">{new Date(log.created_at).toLocaleString()}</td>
                        <td className="py-2 pr-4 text-white font-medium">{log.action}</td>
                        <td className="py-2 pr-4 text-gray-300">{log.resource_type}{log.resource_id ? ` #${log.resource_id}` : ''}</td>
                        <td className="py-2 pr-4 text-gray-300">{log.user_email || '—'}</td>
                        <td className="py-2 text-gray-400">{log.details ? JSON.stringify(log.details) : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-4">👥 User Management</h2>
            <p className="text-gray-400 text-sm mb-4">Update role and Advanced Carbon Market access. Changes require Supabase profiles.</p>
            {profilesLoading ? (
              <p className="text-gray-400">Loading...</p>
            ) : profiles.length === 0 ? (
              <p className="text-gray-400">No profiles in database. Users appear here after signing up and profile creation.</p>
            ) : (
              <div className="overflow-x-auto space-y-4">
                {profiles.map((profile) => (
                  <div key={profile.id} className="flex flex-wrap items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="min-w-0 flex-1">
                      <p className="text-white font-semibold truncate">{profile.email || profile.full_name || profile.id}</p>
                      <p className="text-gray-400 text-xs">{profile.id}</p>
                    </div>
                    {profileEdit?.id === profile.id ? (
                      <>
                        <select
                          value={profileEdit.role}
                          onChange={(e) => setProfileEdit(prev => prev ? { ...prev, role: e.target.value } : null)}
                          className="px-3 py-2 rounded-lg bg-white/10 text-white border border-white/20 text-sm"
                        >
                          {['LANDOWNER', 'BUYER', 'ENTERPRISE', 'GOVERNMENT', 'ADMIN'].map((r) => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                        <label className="flex items-center gap-2 text-gray-300 text-sm">
                          <input
                            type="checkbox"
                            checked={profileEdit.marketplace_access}
                            onChange={(e) => setProfileEdit(prev => prev ? { ...prev, marketplace_access: e.target.checked } : null)}
                          />
                          Marketplace access
                        </label>
                        <button
                          onClick={async () => {
                            if (!profileEdit) return
                            try {
                              const res = await fetch(`/api/profiles/${profile.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ role: profileEdit.role, marketplace_access: profileEdit.marketplace_access }) })
                              if (!res.ok) throw new Error(await res.text())
                              toast.success('Profile updated')
                              setProfileEdit(null)
                              setProfiles(prev => prev.map(p => p.id === profile.id ? { ...p, role: profileEdit.role, marketplace_access: profileEdit.marketplace_access } : p))
                            } catch (e: any) {
                              toast.error(e.message || 'Update failed')
                            }
                          }}
                          className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg text-white text-sm font-semibold"
                        >
                          Save
                        </button>
                        <button onClick={() => setProfileEdit(null)} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm">Cancel</button>
                      </>
                    ) : (
                      <>
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300">{profile.role}</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${profile.marketplace_access ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-400'}`}>
                          {profile.marketplace_access ? 'Marketplace' : 'Registry only'}
                        </span>
                        <button onClick={() => setProfileEdit({ id: profile.id, role: profile.role, marketplace_access: profile.marketplace_access })} className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white text-sm font-semibold">Edit</button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Project Detail Modal */}
      <AnimatePresence>
        {showModal && selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-slate-900 rounded-3xl max-w-6xl w-full max-h-[95vh] overflow-y-auto border-2 border-blue-500/30 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600/30 to-cyan-600/30 p-6 border-b border-white/10 sticky top-0 z-10 backdrop-blur-xl">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-2">{selectedProject.name}</h2>
                    <p className="text-blue-300">{selectedProject.location}</p>
                    <div className="flex gap-3 mt-3">
                      <span className={`px-4 py-1 rounded-full text-sm font-semibold ${
                        selectedProject.verified 
                          ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                          : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                      }`}>
                        {selectedProject.status}
                      </span>
                      <span className="px-4 py-1 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-full text-sm font-semibold">
                        {selectedProject.area}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-white transition-colors text-3xl"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Satellite Imagery Section */}
                {selectedProject.coordinates && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <span>🛰️</span>
                        <span>Satellite Imagery Analysis</span>
                      </h3>
                      <Link
                        href={`/satellite-analysis?name=${encodeURIComponent(selectedProject.name)}&lat=${selectedProject.coordinates.lat}&lng=${selectedProject.coordinates.lng}&area=${selectedProject.area}`}
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 px-4 py-2 rounded-lg text-white font-semibold transition-all flex items-center gap-2"
                      >
                        <span>🛰️</span>
                        <span>Satellite Analysis</span>
                      </Link>
                    </div>
                    {/* Satellite viewer is now handled by the modal */}
                  </div>
                )}

                {/* Project Details Grid */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Preliminary analysis */}
                  <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-2xl p-6 border border-blue-500/20">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <span>📊</span>
                      <span>Preliminary analysis</span>
                    </h3>
                    {selectedProject.mlAnalysis && (
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                          <span className="text-gray-300">Tree Count:</span>
                          <span className="text-white font-bold text-lg">{selectedProject.mlAnalysis.treeCount?.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                          <span className="text-gray-300">Mangrove Area:</span>
                          <span className="text-white font-bold text-lg">{selectedProject.mlAnalysis.mangroveArea} ha</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                          <span className="text-gray-300">Health Score:</span>
                          <span className={`font-bold text-lg ${
                            selectedProject.mlAnalysis.healthScore >= 80 ? 'text-green-400' : 'text-yellow-400'
                          }`}>
                            {selectedProject.mlAnalysis.healthScore}%
                          </span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                          <span className="text-gray-300">Preliminary confidence:</span>
                          <span className="text-blue-400 font-bold text-lg">{selectedProject.mlAnalysis.confidence}%</span>
                        </div>
                        <div className="p-3 bg-white/5 rounded-lg">
                          <p className="text-gray-300 text-sm mb-2">Species Detected:</p>
                          <div className="flex flex-wrap gap-2">
                            {selectedProject.mlAnalysis.speciesDetected?.map((species: string, i: number) => (
                              <span key={i} className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-xs font-semibold">
                                {species}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Field Data */}
                  <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-2xl p-6 border border-green-500/20">
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <span>🌱</span>
                      <span>Field Data</span>
                    </h3>
                    {selectedProject.fieldData && (
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                          <span className="text-gray-300">Trees Counted:</span>
                          <span className="text-white font-bold text-lg">{selectedProject.fieldData.trees?.toLocaleString()}</span>
                        </div>
                        <div className="p-3 bg-white/5 rounded-lg">
                          <p className="text-gray-300 text-sm mb-1">Dominant Species:</p>
                          <p className="text-white font-semibold">{selectedProject.fieldData.species}</p>
                        </div>
                        <div className="p-3 bg-white/5 rounded-lg">
                          <p className="text-gray-300 text-sm mb-1">Soil Type:</p>
                          <p className="text-white font-semibold">{selectedProject.fieldData.soilType}</p>
                        </div>
                        <div className="p-3 bg-white/5 rounded-lg">
                          <p className="text-gray-300 text-sm mb-1">Water Salinity:</p>
                          <p className="text-white font-semibold">{selectedProject.fieldData.waterSalinity}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Carbon Impact */}
                <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl p-6 border border-purple-500/20">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <span>📊</span>
                    <span>Estimated Carbon Potential & Impact</span>
                  </h3>
                  <CarbonDisclaimer className="mb-3" />
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-white/5 rounded-xl">
                      <p className="text-gray-400 text-sm mb-2">Credits Available</p>
                      <p className="text-white font-bold text-3xl">{selectedProject.creditsAvailable?.toLocaleString()}</p>
                      <p className="text-purple-300 text-xs mt-1">OCC Tokens</p>
                    </div>
                    <div className="text-center p-4 bg-white/5 rounded-xl">
                      <p className="text-gray-400 text-sm mb-2">Price Per Credit</p>
                      <p className="text-white font-bold text-3xl">${selectedProject.pricePerCredit}</p>
                      <p className="text-blue-300 text-xs mt-1">USD</p>
                    </div>
                    <div className="text-center p-4 bg-white/5 rounded-xl">
                      <p className="text-gray-400 text-sm mb-2">Annual Impact</p>
                      <p className="text-white font-bold text-2xl">{selectedProject.impact}</p>
                      <p className="text-green-300 text-xs mt-1">CO₂ Sequestered</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                {!selectedProject.verified && (
                  <div className="flex gap-4 pt-4">
                    <button
                      onClick={() => {
                        handleApprove(selectedProject.id)
                        setShowModal(false)
                      }}
                      className="flex-1 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-xl text-white font-bold text-lg transition-all shadow-lg hover:shadow-2xl"
                    >
                      ✅ Approve Project
                    </button>
                    <button
                      onClick={() => {
                        handleReject(selectedProject.id)
                        setShowModal(false)
                      }}
                      className="flex-1 py-4 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 rounded-xl text-white font-bold text-lg transition-all shadow-lg hover:shadow-2xl"
                    >
                      ❌ Reject Project
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}
