'use client'

import Link from 'next/link'

/**
 * Shared navigation for Blue Carbon MRV & Registry.
 * Home, How It Works, Projects, Reports, Contact / Request Pilot.
 * No Marketplace link (Phase 1).
 */
export default function PlatformNav({ className = '' }: { className?: string }) {
  const links = [
    { href: '/', label: 'Home' },
    { href: '/how-it-works', label: 'How It Works' },
    { href: '/buyer', label: 'Projects' },
    { href: '/reports', label: 'Reports' },
    { href: '/contact', label: 'Contact / Request Pilot' },
  ]

  return (
    <nav className={`flex flex-wrap items-center justify-center gap-4 sm:gap-6 ${className}`}>
      {links.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          className="text-gray-300 hover:text-white text-sm font-medium transition-colors"
        >
          {label}
        </Link>
      ))}
    </nav>
  )
}
