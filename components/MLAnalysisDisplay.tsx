'use client'

import CarbonDisclaimer from '@/components/CarbonDisclaimer'

interface MLAnalysisDisplayProps {
  data: {
    coordinates: { lat: number; lng: number }
    area: number
    satelliteImages: string[]
    mlAnalysis: {
      treeCount: number
      mangroveArea: number
      healthScore: number
      speciesDetected: string[]
      carbonCredits: number
      confidence: number
    }
  }
}

export default function MLAnalysisDisplay({ data }: MLAnalysisDisplayProps) {
  const { coordinates, area, satelliteImages, mlAnalysis } = data

  return (
    <div className="space-y-6">
      {/* Success Banner */}
      <div className="bg-green-500/20 border-2 border-green-500 rounded-xl p-6">
        <div className="flex items-center gap-4">
          <div className="text-5xl">✅</div>
          <div>
            <h3 className="text-2xl font-bold text-white mb-1">Location Analysis Complete!</h3>
            <p className="text-green-200">
              Preliminary analysis complete. Estimates are indicative and subject to verification.
            </p>
          </div>
        </div>
      </div>

      {/* Satellite Images */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4">📡 Satellite Imagery</h3>
        <p className="text-gray-400 text-sm mb-3">Illustrative satellite snapshot. Supports MRV workflow.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {satelliteImages.map((img, index) => (
            <div key={index} className="relative aspect-video rounded-lg overflow-hidden border border-white/20">
              <img
                src={img}
                alt={`Illustrative satellite view ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
              />
              <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                Zoom Level {15 + index}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Location Details */}
      <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4">📍 Location Details</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/5 rounded-lg p-4">
            <div className="text-gray-400 text-sm mb-1">Latitude</div>
            <div className="text-white font-bold text-lg">{coordinates.lat.toFixed(6)}°</div>
          </div>
          <div className="bg-white/5 rounded-lg p-4">
            <div className="text-gray-400 text-sm mb-1">Longitude</div>
            <div className="text-white font-bold text-lg">{coordinates.lng.toFixed(6)}°</div>
          </div>
          <div className="bg-white/5 rounded-lg p-4">
            <div className="text-gray-400 text-sm mb-1">Total Area</div>
            <div className="text-white font-bold text-lg">{area} hectares</div>
          </div>
          <div className="bg-white/5 rounded-lg p-4">
            <div className="text-gray-400 text-sm mb-1">Region</div>
            <div className="text-white font-bold text-lg">Coastal Zone</div>
          </div>
        </div>
      </div>

      {/* Preliminary analysis results */}
      <div className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 border-2 border-purple-500/50 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="text-4xl">🤖</div>
          <div>
            <h3 className="text-2xl font-bold text-white">Preliminary Analysis Results</h3>
            <p className="text-gray-300">Preliminary area-based estimation. Transparent and auditable.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Tree Count */}
          <div className="bg-white/10 rounded-lg p-5">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">🌳</span>
              <div>
                <div className="text-gray-300 text-sm">Tree Count (AI Detected)</div>
                <div className="text-white font-bold text-2xl">{mlAnalysis.treeCount.toLocaleString()}</div>
              </div>
            </div>
            <div className="text-green-400 text-sm mt-2">✓ Preliminary estimate — subject to verification</div>
          </div>

          {/* Mangrove Area */}
          <div className="bg-white/10 rounded-lg p-5">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">📐</span>
              <div>
                <div className="text-gray-300 text-sm">Mangrove Coverage</div>
                <div className="text-white font-bold text-2xl">{mlAnalysis.mangroveArea} ha</div>
              </div>
            </div>
            <div className="text-blue-400 text-sm mt-2">✓ Calculated from imagery</div>
          </div>

          {/* Health Score */}
          <div className="bg-white/10 rounded-lg p-5">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">💚</span>
              <div>
                <div className="text-gray-300 text-sm">Forest Health Score</div>
                <div className="text-white font-bold text-2xl">{mlAnalysis.healthScore}%</div>
              </div>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2 mt-2">
              <div
                className="bg-green-500 h-2 rounded-full"
                style={{ width: `${mlAnalysis.healthScore}%` }}
              />
            </div>
          </div>

          {/* Confidence */}
          <div className="bg-white/10 rounded-lg p-5">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">🎯</span>
              <div>
                <div className="text-gray-300 text-sm">AI Confidence Level</div>
                <div className="text-white font-bold text-2xl">{mlAnalysis.confidence}%</div>
              </div>
            </div>
            <div className="text-purple-400 text-sm mt-2">✓ High accuracy prediction</div>
          </div>
        </div>

        {/* Species Detected */}
        <div className="mt-4 bg-white/10 rounded-lg p-5">
          <div className="text-gray-300 text-sm mb-2">🔬 Species Detected</div>
          <div className="flex flex-wrap gap-2">
            {mlAnalysis.speciesDetected.map((species, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-green-500/20 border border-green-500/50 rounded-full text-green-200 text-sm font-semibold"
              >
                {species}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Carbon Credits Calculation */}
      <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-2 border-green-500 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="text-4xl">💰</div>
          <div>
            <h3 className="text-2xl font-bold text-white">Carbon Credits Calculation</h3>
            <p className="text-gray-300">Based on reference coefficients. Transparent and auditable.</p>
          </div>
        </div>

        {/* Main Carbon Credit Display */}
        <div className="bg-white/10 rounded-xl p-8 text-center mb-6">
          <div className="text-gray-300 text-lg mb-2">Estimated Annual Carbon Credits</div>
          <div className="text-6xl font-bold text-white mb-2">
            {mlAnalysis.carbonCredits.toLocaleString()}
          </div>
          <div className="text-2xl text-green-400">tons CO₂e / year</div>
        </div>

        {/* Formula Breakdown */}
        <div className="bg-white/5 rounded-lg p-5">
          <h4 className="text-white font-semibold mb-3">📊 Calculation Methodology</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-300">
              <span>Crown Area per tree:</span>
              <span className="text-white font-mono">π × (2.5m)² = 19.63 m²</span>
            </div>
            <div className="flex justify-between text-gray-300">
              <span>Above Ground Biomass (AGB):</span>
              <span className="text-white font-mono">0.25π × D² × H × ρ × BEF</span>
            </div>
            <div className="flex justify-between text-gray-300">
              <span>Carbon Stock:</span>
              <span className="text-white font-mono">AGB × 0.46</span>
            </div>
            <div className="flex justify-between text-gray-300">
              <span>CO₂ Sequestration:</span>
              <span className="text-white font-mono">Carbon × 3.67</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-white/20">
            <div className="flex justify-between text-white font-semibold">
              <span>Total Estimated Carbon Potential:</span>
              <span className="text-green-400">{mlAnalysis.carbonCredits.toLocaleString()} tons CO₂e</span>
            </div>
          </div>
        </div>

        {/* Economic Value (optional / advanced) */}
        <div className="mt-4 bg-white/10 rounded-lg p-5">
          <h4 className="text-white font-semibold mb-3">💵 Estimated Market Value</h4>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-gray-400 text-xs">@ $10/credit</div>
              <div className="text-white font-bold text-lg">
                ${(mlAnalysis.carbonCredits * 10).toLocaleString()}
              </div>
            </div>
            <div className="text-center">
              <div className="text-gray-400 text-xs">@ $15/credit</div>
              <div className="text-green-400 font-bold text-lg">
                ${(mlAnalysis.carbonCredits * 15).toLocaleString()}
              </div>
            </div>
            <div className="text-center">
              <div className="text-gray-400 text-xs">@ $20/credit</div>
              <div className="text-white font-bold text-lg">
                ${(mlAnalysis.carbonCredits * 20).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

