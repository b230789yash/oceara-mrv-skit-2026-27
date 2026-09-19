'use client'

import './globals.css'
import { DataProvider } from '@/context/DataContext'
import { AuthProvider } from '@/context/AuthContext'
import { FeatureFlagProvider } from '@/context/FeatureFlagContext'
import { Toaster } from 'react-hot-toast'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
        <meta name="theme-color" content="#0f172a" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <title>Oceara - Blue Carbon MRV & Registry | SIH 2025</title>
        <meta name="description" content="Digital MRV & Registry Platform for Blue Carbon Projects. Measure, track, and verify mangrove and coastal restoration using satellite data, AI, and blockchain-backed registries." />
        <meta name="robots" content="noindex, nofollow, noarchive, nosnippet" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
      </head>
      <body>
        <AuthProvider>
          <FeatureFlagProvider>
            <DataProvider>
              <Toaster position="top-center" />
              {children}
            </DataProvider>
          </FeatureFlagProvider>
        </AuthProvider>
      </body>
    </html>
  )
}

