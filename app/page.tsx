'use client'

import { useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import HolographicCard from '@/components/HolographicCard'
import PlatformNav from '@/components/PlatformNav'
import '@/styles/holographic.css'

const RealisticEarth = dynamic(() => import('@/components/RealisticEarth'), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-screen">Loading Earth...</div>
})

export default function Home() {
  const [selectedRole, setSelectedRole] = useState<string | null>(null)
  const [hoveredRole, setHoveredRole] = useState<string | null>(null)
  const { scrollY } = useScroll()
  const scrollIndicatorOpacity = useTransform(scrollY, [0, 120], [1, 0])
  const belowFoldOpacity = useTransform(scrollY, [80, 280], [0, 1])
  const belowFoldY = useTransform(scrollY, [80, 280], [24, 0])

  const roles = [
    {
      id: 'landowner',
      title: 'Project Owner',
      description: 'Register your mangrove project and track MRV status',
      icon: '🌴',
      color: 'from-green-500 to-emerald-600'
    },
    {
      id: 'buyer',
      title: 'Institution / Program',
      description: 'View verified projects and request MRV or funding',
      icon: '🏛️',
      color: 'from-blue-500 to-cyan-600'
    },
    {
      id: 'admin',
      title: 'MRV Administrator',
      description: 'Review projects, verify MRV status, and generate reports',
      icon: '👤',
      color: 'from-purple-500 to-indigo-600'
    }
  ]

  return (
    <main className="relative w-full min-h-screen overflow-x-hidden overflow-y-auto">
      {/* 3D Realistic Earth Background - fixed so it stays while scrolling */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <RealisticEarth hoveredRole={hoveredRole} />
      </div>

      {/* Top Nav */}
      <header className="fixed top-0 left-0 right-0 z-20 py-3 px-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <Link href="/" className="text-xl font-bold text-white/90 hover:text-white">
            🌊 Oceara
          </Link>
          <PlatformNav />
        </div>
      </header>

      {/* Content - first view */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4 sm:p-6 md:p-8 pt-16">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8 sm:mb-12"
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-3 sm:mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
            Oceara
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-300 mb-2 px-2">
            Digital MRV & Registry Platform for Blue Carbon Projects
          </p>
          <p className="text-sm sm:text-base md:text-lg text-gray-400 px-4 max-w-2xl mx-auto">
            We help measure, track, and verify mangrove and coastal restoration projects using satellite data, AI, and transparent registries. MRV (Measurement, Reporting, Verification) supports credible carbon estimates and institutional verification.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-5xl w-full px-2"
        >
          {roles.map((role, index) => (
            <motion.div
              key={role.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
            >
              <HolographicCard
                role={role}
                isSelected={selectedRole === role.id}
                onSelect={() => setSelectedRole(role.id)}
                onHover={(isHovered) => setHoveredRole(isHovered ? role.id : null)}
              />
            </motion.div>
          ))}
        </motion.div>

        {selectedRole && (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 sm:mt-8 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full text-white font-bold text-base sm:text-lg hover:shadow-2xl transition-all duration-300 w-full sm:w-auto max-w-md"
              onClick={() => {
                if (selectedRole === 'landowner') window.location.href = '/auth/login?role=landowner'
                else if (selectedRole === 'buyer') window.location.href = '/auth/login?role=buyer'
                else if (selectedRole === 'admin') window.location.href = '/auth/login?role=admin'
              }}
            >
              {selectedRole === 'buyer' ? 'Request MRV Pilot' : `Continue as ${roles.find(r => r.id === selectedRole)?.title}`}
            </motion.button>
        )}

        {/* Scroll hint - fades out as user scrolls */}
        <motion.div
          style={{ opacity: scrollIndicatorOpacity }}
          className="absolute bottom-6 sm:bottom-10 left-0 right-0 flex flex-col items-center gap-2 text-gray-400"
        >
          <motion.span
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="text-white/60"
            aria-hidden
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12l7 7 7-7" />
            </svg>
          </motion.span>
          <p className="text-xs">Scroll to explore</p>
        </motion.div>
      </div>

      {/* Below-fold section - fades in on scroll */}
      <motion.section
        style={{ opacity: belowFoldOpacity, y: belowFoldY }}
        className="relative z-10 min-h-[40vh] flex flex-col items-center justify-center px-4 py-16"
      >
        <p className="text-gray-400 text-sm sm:text-base text-center max-w-xl mb-6">
          Join us in protecting mangrove ecosystems through measurement, reporting, and verification.
        </p>
        <Link
          href="/how-it-works"
          className="text-blue-400 hover:text-blue-300 font-medium text-sm transition-colors"
        >
          See how it works →
        </Link>
      </motion.section>
    </main>
  )
}

