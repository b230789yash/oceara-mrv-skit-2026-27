'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import WorkingSatelliteViewer from '@/components/WorkingSatelliteViewer'
import { googleEarthEngineService } from '@/lib/googleEarthEngineFixed'
import Link from 'next/link'

export default function SatelliteAnalysisPage() {
  const searchParams = useSearchParams()
  const [projectData, setProjectData] = useState({
    name: 'Project Analysis',
    coordinates: { lat: 22.351100, lng: 88.225000 },
    area: 185
  })
  const [earthEngineStatus, setEarthEngineStatus] = useState<any>(null)

  useEffect(() => {
    // Get project data from URL parameters or use defaults
    const name = searchParams.get('name') || 'Project Analysis'
    const lat = parseFloat(searchParams.get('lat') || '22.351100')
    const lng = parseFloat(searchParams.get('lng') || '88.225000')
    const area = parseInt(searchParams.get('area') || '185')

    setProjectData({
      name: decodeURIComponent(name),
      coordinates: { lat, lng },
      area
    })

    // Check Earth Engine status
    const status = googleEarthEngineService.getConfigurationStatus()
    setEarthEngineStatus(status)
  }, [searchParams])

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href="/admin"
              className="text-white hover:text-gray-300 transition-colors"
            >
              ← Back to Admin
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">🛰️ Satellite Analysis</h1>
              <p className="text-gray-300">{projectData.name}</p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-white font-semibold">
              {projectData.coordinates.lat.toFixed(6)}, {projectData.coordinates.lng.toFixed(6)}
            </div>
            <div className="text-gray-300 text-sm">
              {projectData.area} hectares
            </div>
            {earthEngineStatus && (
              <div className="text-xs mt-1">
                <span className={`px-2 py-1 rounded ${earthEngineStatus.ready ? 'bg-green-600' : 'bg-yellow-600'}`}>
                  {earthEngineStatus.ready ? '🛰️ Earth Engine Ready' : '⚠️ Earth Engine Setup Required'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Satellite Viewer */}
      <WorkingSatelliteViewer
        coordinates={projectData.coordinates}
        projectName={projectData.name}
        area={projectData.area}
      />
    </div>
  )
}
