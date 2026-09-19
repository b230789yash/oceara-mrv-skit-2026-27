'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface AnimatedParticlesProps {
  hoveredRole: string | null
}

export default function AnimatedParticles({ hoveredRole }: AnimatedParticlesProps) {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (groupRef.current && hoveredRole) {
      // Smooth, elegant rotation
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.3
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.05
    }
  })

  if (!hoveredRole) return null

  const color = 
    hoveredRole === 'landowner' ? '#10b981' : 
    hoveredRole === 'buyer' ? '#3b82f6' : '#a855f7'

  return (
    <group ref={groupRef}>
      {/* Gentle orbiting particles */}
      {[...Array(16)].map((_, i) => {
        const angle = (i / 16) * Math.PI * 2
        const radius = 3.8
        const x = Math.cos(angle) * radius
        const z = Math.sin(angle) * radius
        const y = Math.sin(angle * 2) * 0.3
        
        return (
          <mesh key={`orbit-${i}`} position={[x, y, z]}>
            <sphereGeometry args={[0.03, 12, 12]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={0.5}
              transparent
              opacity={0.7}
            />
          </mesh>
        )
      })}
    </group>
  )
}

