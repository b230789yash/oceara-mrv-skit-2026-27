'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import PlatformNav from '@/components/PlatformNav'

export default function HowItWorksPage() {
  const steps = [
    {
      icon: '📋',
      title: 'Register Project',
      description: 'Project owners register mangrove or coastal restoration projects, pin location on the map, and submit details. Optional field data and photos can be uploaded.',
    },
    {
      icon: '🛰️',
      title: 'MRV & Verification',
      description: 'Satellite imagery and reference-based estimation support carbon estimation. MRV administrators review projects, verify status, and generate Carbon Estimation Reports (Pre-Certification).',
    },
    {
      icon: '📊',
      title: 'Registry & Reports',
      description: 'Verified projects appear in the Project Registry. Institutions and programs can view projects, download MRV reports, and request MRV or funding.',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <header className="border-b border-white/20 py-4 px-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <Link href="/" className="text-xl font-bold text-white/90 hover:text-white">
            🌊 Oceara
          </Link>
          <PlatformNav />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12 sm:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">How It Works</h1>
          <p className="text-gray-300 text-lg">
            From project registration to verified MRV and the registry.
          </p>
        </motion.div>

        <div className="space-y-8 sm:space-y-10">
          {steps.map((step, index) => (
            <motion.section
              key={step.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.15 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 sm:p-8 border border-white/20"
            >
              <div className="flex flex-col sm:flex-row gap-6 items-start">
                <div className="flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-white/10 flex items-center justify-center text-3xl sm:text-4xl">
                  {step.icon}
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">{step.title}</h2>
                  <p className="text-gray-300 leading-relaxed">{step.description}</p>
                </div>
              </div>
            </motion.section>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-white/10 border border-white/20 rounded-full text-white font-semibold hover:bg-white/20 transition-all"
          >
            ← Back to Home
          </Link>
        </motion.div>
      </main>
    </div>
  )
}
