'use client'

import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Sphere, MeshDistortMaterial } from '@react-three/drei'
import * as THREE from 'three'

function RotatingEarth({ hoveredRole }: { hoveredRole: string | null }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const targetScale = useRef(2.5)
  const targetDistort = useRef(0.3)

  useFrame((state, delta) => {
    if (meshRef.current) {
      // Continuous rotation
      meshRef.current.rotation.y += delta * 0.15
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.1

      // Interactive effects on hover
      if (hoveredRole) {
        targetScale.current = 3.2
        targetDistort.current = 0.8
        // Add wobble effect
        meshRef.current.position.x = Math.sin(state.clock.elapsedTime * 3) * 0.1
        meshRef.current.position.y = Math.cos(state.clock.elapsedTime * 2) * 0.1
      } else {
        targetScale.current = 2.5
        targetDistort.current = 0.3
        // Return to center
        meshRef.current.position.x = THREE.MathUtils.lerp(meshRef.current.position.x, 0, 0.1)
        meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, 0, 0.1)
      }

      // Smooth transitions
      meshRef.current.scale.setScalar(
        THREE.MathUtils.lerp(meshRef.current.scale.x, targetScale.current, 0.1)
      )
    }
  })

  return (
    <>
      <Sphere ref={meshRef} args={[1, 100, 200]} scale={2.5}>
        <MeshDistortMaterial
          color={hoveredRole === 'landowner' ? '#10b981' : hoveredRole === 'buyer' ? '#3b82f6' : hoveredRole === 'admin' ? '#a855f7' : '#0ea5e9'}
          attach="material"
          distort={hoveredRole ? targetDistort.current : 0.3}
          speed={hoveredRole ? 3 : 1.5}
          roughness={0.2}
          metalness={0.8}
        />
      </Sphere>

      {/* Particles around Earth on hover */}
      {hoveredRole && (
        <>
          {[...Array(20)].map((_, i) => {
            const angle = (i / 20) * Math.PI * 2
            const radius = 3.5
            const x = Math.cos(angle) * radius
            const y = Math.sin(angle) * radius
            const z = Math.sin(angle * 2) * 0.5
            return (
              <mesh key={i} position={[x, y, z]}>
                <sphereGeometry args={[0.05, 16, 16]} />
                <meshBasicMaterial 
                  color={hoveredRole === 'landowner' ? '#10b981' : hoveredRole === 'buyer' ? '#3b82f6' : '#a855f7'}
                  transparent
                  opacity={0.8}
                />
              </mesh>
            )
          })}
        </>
      )}

      {/* Glowing ring on hover */}
      {hoveredRole && (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[3.5, 0.05, 16, 100]} />
          <meshBasicMaterial
            color={hoveredRole === 'landowner' ? '#10b981' : hoveredRole === 'buyer' ? '#3b82f6' : '#a855f7'}
            transparent
            opacity={0.6}
          />
        </mesh>
      )}
    </>
  )
}

export default function Earth({ hoveredRole }: { hoveredRole?: string | null }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 45 }}
      style={{ background: 'transparent' }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <pointLight position={[-10, -10, -5]} intensity={0.5} color="#60a5fa" />
      
      {/* Extra lights on hover */}
      {hoveredRole && (
        <>
          <pointLight position={[0, 0, 3]} intensity={2} color={
            hoveredRole === 'landowner' ? '#10b981' : 
            hoveredRole === 'buyer' ? '#3b82f6' : '#a855f7'
          } />
          <spotLight position={[5, 5, 5]} intensity={1} angle={0.6} penumbra={1} />
        </>
      )}
      
      <RotatingEarth hoveredRole={hoveredRole || null} />
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 1.5}
      />
      {/* Stars background */}
      <mesh>
        <sphereGeometry args={[50, 32, 32]} />
        <meshBasicMaterial color="#000510" side={THREE.BackSide} />
      </mesh>
    </Canvas>
  )
}

