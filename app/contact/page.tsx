'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import PlatformNav from '@/components/PlatformNav'
import toast from 'react-hot-toast'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    organization: '',
    message: '',
    requestType: 'mrv_pilot',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    toast.success('Request received. We will get back to you soon.')
    setFormData({ name: '', email: '', organization: '', message: '', requestType: 'mrv_pilot' })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

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

      <main className="max-w-2xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20"
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Contact / Request Pilot</h1>
          <p className="text-gray-300 mb-6">
            Request an MRV pilot, ask about the platform, or get in touch.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-white mb-1 text-sm font-medium">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
                placeholder="Your name"
                required
              />
            </div>
            <div>
              <label className="block text-white mb-1 text-sm font-medium">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-white mb-1 text-sm font-medium">Organization (optional)</label>
              <input
                type="text"
                name="organization"
                value={formData.organization}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
                placeholder="Organization name"
              />
            </div>
            <div>
              <label className="block text-white mb-1 text-sm font-medium">Request type</label>
              <select
                name="requestType"
                value={formData.requestType}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white"
              >
                <option value="mrv_pilot">Request MRV Pilot</option>
                <option value="info">General inquiry</option>
                <option value="support">Support</option>
              </select>
            </div>
            <div>
              <label className="block text-white mb-1 text-sm font-medium">Message</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
                placeholder="Your message or pilot request details..."
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-lg text-white font-semibold hover:shadow-lg transition-all"
            >
              Submit
            </button>
          </form>

          <p className="text-gray-400 text-sm mt-6">
            You can also email us at{' '}
            <a href="mailto:contact@oceara.demo" className="text-blue-400 hover:text-blue-300">
              contact@oceara.demo
            </a>
          </p>
        </motion.div>

        <div className="text-center mt-8">
          <Link href="/" className="text-gray-400 hover:text-white text-sm">
            ← Back to Home
          </Link>
        </div>
      </main>
    </div>
  )
}
