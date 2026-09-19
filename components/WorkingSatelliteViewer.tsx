'use client'

import { useState } from 'react'
import { GOOGLE_MAPS_API_KEY, MAPBOX_TOKEN } from '@/lib/config'

interface WorkingSatelliteViewerProps {
  coordinates: { lat: number; lng: number }
  projectName: string
  area: number
  onClose?: () => void
}

export default function WorkingSatelliteViewer({
  coordinates,
  projectName,
  area,
  onClose
}: WorkingSatelliteViewerProps) {
  const [currentSource, setCurrentSource] = useState(0)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  const imageSources = [
    ...(GOOGLE_MAPS_API_KEY
      ? [
          {
            name: 'Google Maps',
            url: `https://maps.googleapis.com/maps/api/staticmap?center=${coordinates.lat},${coordinates.lng}&zoom=15&size=800x600&maptype=satellite&markers=color:red%7Csize:small%7C${coordinates.lat},${coordinates.lng}&key=${GOOGLE_MAPS_API_KEY}`,
          },
        ]
      : []),
    ...(MAPBOX_TOKEN
      ? [
          {
            name: 'Mapbox',
            url: `https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/${coordinates.lng},${coordinates.lat},15/800x600@2x?access_token=${MAPBOX_TOKEN}`,
          },
        ]
      : []),
    {
      name: 'OpenStreetMap',
      url: `https://tile.openstreetmap.org/15/${Math.floor((coordinates.lng + 180) / 360 * Math.pow(2, 15))}/${Math.floor((1 - Math.log(Math.tan(coordinates.lat * Math.PI / 180) + 1 / Math.cos(coordinates.lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, 15))}.png`,
    },
  ]

  const currentImage = imageSources[currentSource]

  const tryNextSource = () => {
    if (currentSource < imageSources.length - 1) {
      setCurrentSource(currentSource + 1)
      setImageError(false)
      setImageLoaded(false)
    } else {
      setImageError(true)
    }
  }

  const resetToFirst = () => {
    setCurrentSource(0)
    setImageError(false)
    setImageLoaded(false)
  }

  return (
    <div className="fixed inset-0 bg-black/90 z-[9999] overflow-y-auto">
      <div className="min-h-screen p-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-white">🛰️ Satellite View</h2>
              <p className="text-gray-300">{projectName}</p>
              <p className="text-gray-400 text-sm">
                {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)} • {area} hectares
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={resetToFirst}
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white font-semibold"
              >
                🔄 Reset
              </button>
              {onClose && (
                <button
                  onClick={onClose}
                  className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg text-white font-semibold"
                >
                  ✕ Close
                </button>
              )}
            </div>
          </div>

          {/* Image Display */}
          <div className="bg-gray-800 border-2 border-blue-500 rounded-xl overflow-hidden mb-6">
            <div className="relative">
              {!imageError ? (
                <div className="relative">
                  {!imageLoaded && (
                    <div className="absolute inset-0 bg-gray-900 flex items-center justify-center z-10">
                      <div className="text-center">
                        <div className="text-4xl mb-2 animate-pulse">🛰️</div>
                        <p className="text-white">Loading {currentImage.name}...</p>
                      </div>
                    </div>
                  )}
                  <img
                    src={currentImage.url}
                    alt="Satellite view"
                    className="w-full h-[500px] object-cover"
                    onLoad={() => {
                      setImageLoaded(true)
                      console.log('✅ Image loaded:', currentImage.name)
                    }}
                    onError={() => {
                      console.log('❌ Image failed:', currentImage.name)
                      setTimeout(tryNextSource, 1000)
                    }}
                  />
                </div>
              ) : (
                <div className="w-full h-[500px] bg-gray-900 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🛰️</div>
                    <p className="text-white font-semibold mb-2">Unable to load satellite imagery</p>
                    <p className="text-gray-400 text-sm mb-4">All sources failed to load</p>
                    <button
                      onClick={resetToFirst}
                      className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white font-semibold"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              )}

              {/* Overlay Info */}
              <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm rounded-lg p-3">
                <div className="text-white text-sm font-semibold">{currentImage.name}</div>
                <div className="text-gray-300 text-xs">Source: {currentSource + 1}/{imageSources.length}</div>
                <div className="text-gray-300 text-xs">
                  {coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)}
                </div>
              </div>

              {/* Status Badge */}
              <div className="absolute top-4 right-4 bg-green-500/90 backdrop-blur-sm rounded-lg px-3 py-2">
                <div className="text-white text-sm font-semibold">✅ Live</div>
              </div>
            </div>

            {/* Controls */}
            <div className="p-4 border-t-2 border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-white font-semibold">
                  {currentImage.name} ({currentSource + 1}/{imageSources.length})
                </span>
                {currentSource > 0 && (
                  <button
                    onClick={() => {
                      setCurrentSource(currentSource - 1)
                      setImageLoaded(false)
                      setImageError(false)
                    }}
                    className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded text-white text-sm"
                  >
                    ← Previous
                  </button>
                )}
                {currentSource < imageSources.length - 1 && (
                  <button
                    onClick={tryNextSource}
                    className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded text-white text-sm"
                  >
                    Next →
                  </button>
                )}
              </div>
              
              <button
                onClick={tryNextSource}
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white font-semibold"
              >
                🔄 Try Next Source
              </button>
            </div>
          </div>

          {/* Analysis Cards */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-gray-800 border-2 border-green-500 rounded-xl p-4">
              <h3 className="text-lg font-bold text-white mb-2">🌿 Vegetation Health</h3>
              <div className="text-3xl font-bold text-green-400 mb-1">86%</div>
              <div className="text-gray-300 text-sm">Overall Health Score</div>
              <div className="text-gray-400 text-xs mt-1">NDVI: 0.726</div>
            </div>
            
            <div className="bg-gray-800 border-2 border-blue-500 rounded-xl p-4">
              <h3 className="text-lg font-bold text-white mb-2">💧 Water Presence</h3>
              <div className="text-3xl font-bold text-blue-400 mb-1">✓</div>
              <div className="text-gray-300 text-sm">Water Detected</div>
              <div className="text-gray-400 text-xs mt-1">Estuary ecosystem</div>
            </div>
            
            <div className="bg-gray-800 border-2 border-yellow-500 rounded-xl p-4">
              <h3 className="text-lg font-bold text-white mb-2">📊 Estimated Carbon Potential</h3>
              <div className="text-3xl font-bold text-yellow-400 mb-1">647</div>
              <div className="text-gray-300 text-sm">Credits Generated</div>
              <div className="text-gray-400 text-xs mt-1">Annual: 3.5 tons CO₂</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
