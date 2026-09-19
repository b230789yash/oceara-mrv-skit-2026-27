'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GOOGLE_MAPS_API_KEY, MAPBOX_TOKEN, getGoogleMapsStaticUrl } from '@/lib/config'

interface SatelliteImageViewerProps {
  coordinates: { lat: number; lng: number }
  projectName: string
  area?: string
  onClose?: () => void
}

export default function SatelliteImageViewer({ 
  coordinates, 
  projectName, 
  area,
  onClose 
}: SatelliteImageViewerProps) {
  const [selectedZoom, setSelectedZoom] = useState(16)
  const [selectedMapType, setSelectedMapType] = useState<'satellite' | 'hybrid' | 'terrain'>('satellite')
  const [showComparison, setShowComparison] = useState(false)
  const [loading, setLoading] = useState(true)

  const zoomLevels = [
    { level: 14, label: 'Wide Area', description: 'Regional view' },
    { level: 16, label: 'Standard', description: 'Project overview' },
    { level: 18, label: 'Detailed', description: 'Tree-level detail' },
    { level: 20, label: 'Maximum', description: 'Ultra close-up' }
  ]

  const mapTypes = [
    { type: 'satellite' as const, label: 'Satellite', icon: '🛰️', description: 'Clear satellite view' },
    { type: 'hybrid' as const, label: 'Hybrid', icon: '🗺️', description: 'Satellite + labels' },
    { type: 'terrain' as const, label: 'Terrain', icon: '⛰️', description: 'Topographic view' }
  ]

  // Generate real satellite image URLs
  const getSatelliteUrl = (zoom: number, mapType: string = 'satellite') => {
    if (!GOOGLE_MAPS_API_KEY) {
      if (MAPBOX_TOKEN) {
        return `https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/${coordinates.lng},${coordinates.lat},${zoom},0/800x600@2x?access_token=${MAPBOX_TOKEN}`
      }
      const tx = Math.floor((coordinates.lng + 180) / 360 * Math.pow(2, zoom))
      const ty = Math.floor(
        ((1 - Math.log(Math.tan((coordinates.lat * Math.PI) / 180) + 1 / Math.cos((coordinates.lat * Math.PI) / 180)) / Math.PI) /
          2) *
          Math.pow(2, zoom)
      )
      return `https://tile.openstreetmap.org/${zoom}/${tx}/${ty}.png`
    }
    return `https://maps.googleapis.com/maps/api/staticmap?center=${coordinates.lat},${coordinates.lng}&zoom=${zoom}&size=1200x800&scale=2&maptype=${mapType}&markers=color:red%7C${coordinates.lat},${coordinates.lng}&key=${GOOGLE_MAPS_API_KEY}`
  }

  // For comparison: current vs historical (simulated)
  const getHistoricalUrl = () => {
    // In real implementation, use Google Earth Engine or similar for historical imagery
    return getSatelliteUrl(selectedZoom - 1, selectedMapType)
  }

  return (
    <div className="bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900 rounded-3xl border-2 border-blue-500/30 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600/30 to-cyan-600/30 p-6 border-b border-white/10">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
              <span>🛰️</span>
              <span>Satellite Imagery</span>
            </h3>
            <p className="text-blue-300 text-sm">{projectName}</p>
            {area && (
              <p className="text-gray-400 text-xs mt-1">Area: {area}</p>
            )}
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors text-2xl"
            >
              ✕
            </button>
          )}
        </div>

        {/* Coordinates Display */}
        <div className="mt-4 flex items-center gap-4 text-sm">
          <div className="bg-white/10 backdrop-blur px-4 py-2 rounded-lg">
            <span className="text-gray-400">Latitude: </span>
            <span className="text-white font-mono font-bold">{coordinates.lat.toFixed(6)}°</span>
          </div>
          <div className="bg-white/10 backdrop-blur px-4 py-2 rounded-lg">
            <span className="text-gray-400">Longitude: </span>
            <span className="text-white font-mono font-bold">{coordinates.lng.toFixed(6)}°</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="p-6 border-b border-white/10">
        {/* Map Type Selector */}
        <div className="mb-6">
          <label className="block text-white font-semibold mb-3 text-sm">Map Type</label>
          <div className="grid grid-cols-3 gap-3">
            {mapTypes.map((type) => (
              <button
                key={type.type}
                onClick={() => {
                  setSelectedMapType(type.type)
                  setLoading(true)
                }}
                className={`p-4 rounded-xl border-2 transition-all ${
                  selectedMapType === type.type
                    ? 'bg-blue-500/20 border-blue-500'
                    : 'bg-white/5 border-white/10 hover:border-white/30'
                }`}
              >
                <div className="text-3xl mb-2">{type.icon}</div>
                <p className="text-white font-semibold text-sm">{type.label}</p>
                <p className="text-gray-400 text-xs">{type.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Zoom Level Selector */}
        <div>
          <label className="block text-white font-semibold mb-3 text-sm">Zoom Level</label>
          <div className="grid grid-cols-4 gap-2">
            {zoomLevels.map((zoom) => (
              <button
                key={zoom.level}
                onClick={() => {
                  setSelectedZoom(zoom.level)
                  setLoading(true)
                }}
                className={`p-3 rounded-lg border transition-all ${
                  selectedZoom === zoom.level
                    ? 'bg-blue-500 border-blue-400 text-white'
                    : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                <p className="font-bold text-sm">{zoom.label}</p>
                <p className="text-xs opacity-75">{zoom.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Comparison Toggle */}
        <div className="mt-4 flex items-center justify-between bg-white/5 rounded-lg p-3">
          <div>
            <p className="text-white font-semibold text-sm">Compare Views</p>
            <p className="text-gray-400 text-xs">Side-by-side comparison</p>
          </div>
          <button
            onClick={() => setShowComparison(!showComparison)}
            className={`relative w-14 h-8 rounded-full transition-colors ${
              showComparison ? 'bg-blue-500' : 'bg-gray-600'
            }`}
          >
            <div
              className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform ${
                showComparison ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Image Display */}
      <div className="p-6">
        {!GOOGLE_MAPS_API_KEY && (
          <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-xl p-4 mb-4">
            <div className="flex gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <p className="text-yellow-300 font-semibold mb-1">Demo Mode - Limited Imagery</p>
                <p className="text-gray-300 text-sm">
                  Add your Google Maps API key to .env.local for real high-resolution satellite images.
                  <br />
                  <code className="text-xs bg-black/30 px-2 py-1 rounded mt-1 inline-block">
                    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here
                  </code>
                </p>
              </div>
            </div>
          </div>
        )}

        {showComparison ? (
          /* Comparison View */
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-white font-semibold text-sm">Current View</p>
              <div className="relative rounded-2xl overflow-hidden border-2 border-blue-500/30 bg-slate-800">
                {loading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-800/80 backdrop-blur z-10">
                    <div className="text-center">
                      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                      <p className="text-white text-sm">Loading imagery...</p>
                    </div>
                  </div>
                )}
                <img
                  src={getSatelliteUrl(selectedZoom, selectedMapType)}
                  alt="Current satellite view"
                  className="w-full h-auto"
                  onLoad={() => setLoading(false)}
                  onError={() => setLoading(false)}
                />
                <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur px-3 py-1 rounded-lg">
                  <p className="text-white text-xs font-semibold">Zoom: {selectedZoom}x</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-white font-semibold text-sm">Different Zoom</p>
              <div className="relative rounded-2xl overflow-hidden border-2 border-purple-500/30 bg-slate-800">
                <img
                  src={getHistoricalUrl()}
                  alt="Alternative view"
                  className="w-full h-auto"
                />
                <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur px-3 py-1 rounded-lg">
                  <p className="text-white text-xs font-semibold">Zoom: {selectedZoom - 1}x</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Single View */
          <div className="relative rounded-2xl overflow-hidden border-2 border-blue-500/30 bg-slate-800">
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-800/80 backdrop-blur z-10">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-white text-lg font-semibold">Loading satellite imagery...</p>
                  <p className="text-gray-400 text-sm mt-2">Fetching high-resolution data</p>
                </div>
              </div>
            )}
            <img
              src={getSatelliteUrl(selectedZoom, selectedMapType)}
              alt={`Satellite view of ${projectName}`}
              className="w-full h-auto"
              onLoad={() => setLoading(false)}
              onError={() => setLoading(false)}
            />
            
            {/* Overlay Info */}
            <div className="absolute top-3 left-3 bg-black/70 backdrop-blur px-4 py-2 rounded-lg">
              <p className="text-white text-sm font-semibold">{selectedMapType.charAt(0).toUpperCase() + selectedMapType.slice(1)} View</p>
            </div>
            
            <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur px-4 py-2 rounded-lg">
              <p className="text-white text-sm font-semibold">Zoom Level: {selectedZoom}x</p>
            </div>

            {/* Scale Indicator */}
            <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur px-4 py-2 rounded-lg">
              <p className="text-white text-xs">📍 Pinpoint Location</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-3 mt-6">
          <button 
            onClick={() => window.open(`https://www.google.com/maps/@${coordinates.lat},${coordinates.lng},${selectedZoom}z/data=!3m1!1e3`, '_blank')}
            className="flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl text-white font-semibold transition-all"
          >
            <span>🗺️</span>
            <span>Open in Maps</span>
          </button>
          
          <button 
            onClick={() => {
              const link = document.createElement('a')
              link.href = getSatelliteUrl(selectedZoom, selectedMapType)
              link.download = `${projectName.replace(/\s+/g, '_')}_satellite.jpg`
              link.click()
            }}
            className="flex items-center justify-center gap-2 py-3 bg-green-600 hover:bg-green-700 rounded-xl text-white font-semibold transition-all"
          >
            <span>💾</span>
            <span>Download</span>
          </button>

          <button 
            onClick={() => window.open(`https://earthengine.google.com/timelapse#v=${coordinates.lat},${coordinates.lng},${selectedZoom},latLng&t=3.55&ps=50&bt=19840101&et=20201231`, '_blank')}
            className="flex items-center justify-center gap-2 py-3 bg-purple-600 hover:bg-purple-700 rounded-xl text-white font-semibold transition-all"
          >
            <span>🕐</span>
            <span>Timelapse</span>
          </button>
        </div>
      </div>

      {/* Footer Info */}
      <div className="bg-white/5 p-4 border-t border-white/10">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center gap-4">
            <span>🛰️ High-Resolution Imagery</span>
            <span>📅 Updated: {new Date().toLocaleDateString()}</span>
          </div>
          <div>
            <span>Powered by Google Maps & Mapbox</span>
          </div>
        </div>
      </div>
    </div>
  )
}

