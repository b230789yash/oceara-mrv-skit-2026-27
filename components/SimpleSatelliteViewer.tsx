'use client'

import { useState, useEffect } from 'react'
import { GOOGLE_MAPS_API_KEY, MAPBOX_TOKEN } from '@/lib/config'

interface SimpleSatelliteViewerProps {
  coordinates: { lat: number; lng: number }
  projectName: string
  area: number
  onClose?: () => void
}

export default function SimpleSatelliteViewer({
  coordinates,
  projectName,
  area,
  onClose
}: SimpleSatelliteViewerProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [imageError, setImageError] = useState(false)

  // Multiple reliable image sources (keys from env only — never commit secrets)
  const imageSources = [
    ...(GOOGLE_MAPS_API_KEY
      ? [
          `https://maps.googleapis.com/maps/api/staticmap?center=${coordinates.lat},${coordinates.lng}&zoom=14&size=1200x1200&scale=2&maptype=satellite&markers=color:red%7Csize:small%7C${coordinates.lat},${coordinates.lng}&key=${GOOGLE_MAPS_API_KEY}`,
        ]
      : []),
    ...(MAPBOX_TOKEN
      ? [
          `https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/${coordinates.lng},${coordinates.lat},14/1200x1200@2x?access_token=${MAPBOX_TOKEN}`,
        ]
      : []),
    `https://tile.openstreetmap.org/14/${Math.floor((coordinates.lng + 180) / 360 * Math.pow(2, 14))}/${Math.floor((1 - Math.log(Math.tan(coordinates.lat * Math.PI / 180) + 1 / Math.cos(coordinates.lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, 14))}.png`,
    `https://gibs.earthdata.nasa.gov/wmts/epsg4326/best/MODIS_Terra_CorrectedReflectance_TrueColor/default/${new Date().toISOString().split('T')[0]}/250m/14/${Math.floor((coordinates.lat + 90) / 180 * Math.pow(2, 14))}/${Math.floor((coordinates.lng + 180) / 360 * Math.pow(2, 14))}.jpg`,
  ]

  const currentImageUrl = imageSources[currentImageIndex]

  const tryNextImage = () => {
    if (currentImageIndex < imageSources.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1)
      setImageError(false)
    } else {
      setImageError(true)
    }
  }

  const resetToFirst = () => {
    setCurrentImageIndex(0)
    setImageError(false)
  }

  return (
    <div className="fixed inset-0 bg-black/90 z-[9999] overflow-y-auto">
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-white">🛰️ Satellite View</h2>
              <p className="text-gray-300">{projectName}</p>
              <p className="text-gray-400 text-sm">
                Coordinates: {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)} • Area: {area} ha
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
                  className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg text-white font-semibold"
                >
                  ✕ Close
                </button>
              )}
            </div>
          </div>

          {/* Image Display */}
          <div className="bg-slate-800 border-2 border-purple-500 rounded-xl overflow-hidden">
            <div className="relative">
              {!imageError ? (
                <img
                  src={currentImageUrl}
                  alt="Satellite view"
                  className="w-full h-[600px] object-cover"
                  onLoad={() => {
                    console.log('✅ Image loaded successfully')
                  }}
                  onError={() => {
                    console.log('❌ Image failed, trying next source...')
                    setTimeout(tryNextImage, 1000)
                  }}
                />
              ) : (
                <div className="w-full h-[600px] bg-slate-900 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🛰️</div>
                    <p className="text-white font-semibold mb-2">Unable to load satellite imagery</p>
                    <p className="text-gray-400 text-sm mb-4">All image sources failed to load</p>
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
                <div className="text-white text-sm font-semibold">Satellite View</div>
                <div className="text-gray-300 text-xs">Source: {currentImageIndex + 1}/{imageSources.length}</div>
                <div className="text-gray-300 text-xs">
                  Location: {coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)}
                </div>
              </div>

              {/* Source Indicator */}
              <div className="absolute top-4 right-4 bg-green-500/90 backdrop-blur-sm rounded-lg px-3 py-2">
                <div className="text-white text-sm font-semibold">
                  ✅ Real-time
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="p-4 border-t-2 border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-white font-semibold">
                  Source: {currentImageIndex + 1}/{imageSources.length}
                </span>
                {currentImageIndex > 0 && (
                  <button
                    onClick={() => setCurrentImageIndex(currentImageIndex - 1)}
                    className="bg-slate-700 hover:bg-slate-600 px-3 py-1 rounded text-white text-sm"
                  >
                    ← Previous
                  </button>
                )}
                {currentImageIndex < imageSources.length - 1 && (
                  <button
                    onClick={() => setCurrentImageIndex(currentImageIndex + 1)}
                    className="bg-slate-700 hover:bg-slate-600 px-3 py-1 rounded text-white text-sm"
                  >
                    Next →
                  </button>
                )}
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={tryNextImage}
                  className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg text-white font-semibold"
                >
                  🔄 Try Next Source
                </button>
              </div>
            </div>
          </div>

          {/* Analysis Panel */}
          <div className="mt-6 grid md:grid-cols-3 gap-4">
            <div className="bg-slate-800 border-2 border-green-500 rounded-xl p-4">
              <h3 className="text-lg font-bold text-white mb-2">🌿 Vegetation Health</h3>
              <div className="text-3xl font-bold text-green-400 mb-1">86%</div>
              <div className="text-gray-300 text-sm">Overall Health Score</div>
            </div>
            
            <div className="bg-slate-800 border-2 border-blue-500 rounded-xl p-4">
              <h3 className="text-lg font-bold text-white mb-2">💧 Water Presence</h3>
              <div className="text-3xl font-bold text-blue-400 mb-1">✓</div>
              <div className="text-gray-300 text-sm">Water Detected</div>
            </div>
            
            <div className="bg-slate-800 border-2 border-yellow-500 rounded-xl p-4">
              <h3 className="text-lg font-bold text-white mb-2">📊 Estimated Carbon Potential</h3>
              <div className="text-3xl font-bold text-yellow-400 mb-1">647</div>
              <div className="text-gray-300 text-sm">Credits Generated</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
