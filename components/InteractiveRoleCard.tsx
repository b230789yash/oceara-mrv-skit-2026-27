'use client'

import { useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, MeshDistortMaterial, Sphere } from '@react-three/drei'
import * as THREE from 'three'

interface InteractiveRoleCardProps {
  role: {
    id: string
    title: string
    description: string
    icon: string
    color: string
  }
  isSelected: boolean
  onSelect: () => void
}

function AnimatedSphere({ color, isHovered, isSelected }: { color: string; isHovered: boolean; isSelected: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [rotation, setRotation] = useState(0)

  useFrame((state, delta) => {
    if (meshRef.current) {
      // Continuous rotation
      meshRef.current.rotation.y += delta * 0.5
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.2

      // Interactive movements
      if (isHovered) {
        meshRef.current.position.z = THREE.MathUtils.lerp(meshRef.current.position.z, 0.3, 0.1)
        meshRef.current.scale.setScalar(THREE.MathUtils.lerp(meshRef.current.scale.x, 1.2, 0.1))
      } else if (isSelected) {
        meshRef.current.position.z = THREE.MathUtils.lerp(meshRef.current.position.z, 0.15, 0.1)
        meshRef.current.scale.setScalar(THREE.MathUtils.lerp(meshRef.current.scale.x, 1.1, 0.1))
      } else {
        meshRef.current.position.z = THREE.MathUtils.lerp(meshRef.current.position.z, 0, 0.1)
        meshRef.current.scale.setScalar(THREE.MathUtils.lerp(meshRef.current.scale.x, 1, 0.1))
      }
    }
  })

  return (
    <Float
      speed={2}
      rotationIntensity={isHovered ? 1 : 0.3}
      floatIntensity={isHovered ? 2 : 0.5}
    >
      <Sphere ref={meshRef} args={[1, 64, 64]}>
        <MeshDistortMaterial
          color={color}
          attach="material"
          distort={isHovered ? 0.6 : 0.3}
          speed={isHovered ? 3 : 1.5}
          roughness={0.2}
          metalness={0.8}
        />
      </Sphere>

      {/* Glowing Ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.3, 0.02, 16, 100]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={isHovered ? 0.8 : 0.3}
        />
      </mesh>

      {/* Particles around sphere */}
      {isHovered && (
        <>
          <pointLight position={[0, 0, 0]} intensity={2} color={color} distance={3} />
          {[...Array(8)].map((_, i) => {
            const angle = (i / 8) * Math.PI * 2
            const x = Math.cos(angle) * 1.5
            const y = Math.sin(angle) * 1.5
            return (
              <mesh key={i} position={[x, y, 0]}>
                <sphereGeometry args={[0.05, 16, 16]} />
                <meshBasicMaterial color={color} />
              </mesh>
            )
          })}
        </>
      )}
    </Float>
  )
}

export default function InteractiveRoleCard({ role, isSelected, onSelect }: InteractiveRoleCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  const getColorFromGradient = (colorClass: string) => {
    if (colorClass.includes('green')) return '#10b981'
    if (colorClass.includes('blue')) return '#3b82f6'
    if (colorClass.includes('purple')) return '#a855f7'
    return '#3b82f6'
  }

  return (
    <div
      className={`
        relative bg-white/10 backdrop-blur-lg rounded-2xl p-8 cursor-pointer
        border-2 transition-all duration-500 overflow-hidden
        ${isSelected ? 'border-white/60 ring-4 ring-white/30' : 'border-white/20 hover:border-white/40'}
        ${isHovered ? 'shadow-2xl shadow-blue-500/50' : ''}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onSelect}
    >
      {/* 3D Canvas Background */}
      <div className="absolute inset-0 opacity-60">
        <Canvas
          camera={{ position: [0, 0, 3], fov: 50 }}
          style={{ background: 'transparent' }}
        >
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} intensity={1} />
          <AnimatedSphere
            color={getColorFromGradient(role.color)}
            isHovered={isHovered}
            isSelected={isSelected}
          />
        </Canvas>
      </div>

      {/* Content Overlay */}
      <div className="relative z-10">
        {/* Icon with animation */}
        <div 
          className={`text-6xl mb-4 transition-all duration-500 ${
            isHovered ? 'scale-125 rotate-12' : 'scale-100'
          }`}
        >
          {role.icon}
        </div>

        {/* Title */}
        <h3 className={`text-2xl font-bold mb-3 text-white transition-all duration-300 ${
          isHovered ? 'text-shadow-lg' : ''
        }`}>
          {role.title}
        </h3>

        {/* Description */}
        <p className={`text-gray-300 transition-all duration-300 ${
          isHovered ? 'text-white' : ''
        }`}>
          {role.description}
        </p>

        {/* Gradient Line */}
        <div className={`mt-6 h-1 rounded-full bg-gradient-to-r ${role.color} transition-all duration-500 ${
          isHovered ? 'h-2 shadow-lg' : ''
        }`} />

        {/* Selection Indicator */}
        {isSelected && (
          <div className="absolute top-4 right-4">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
              <span className="text-white text-lg">✓</span>
            </div>
          </div>
        )}

        {/* Hover Overlay Effect */}
        {isHovered && (
          <div className="absolute inset-0 bg-gradient-to-t from-blue-500/20 to-transparent pointer-events-none rounded-2xl" />
        )}
      </div>

      {/* Animated Border Glow */}
      {isHovered && (
        <div className="absolute inset-0 rounded-2xl">
          <div className="absolute inset-0 rounded-2xl animate-pulse bg-gradient-to-r from-blue-500/50 via-purple-500/50 to-emerald-500/50 blur-xl" />
        </div>
      )}
    </div>
  )
}

