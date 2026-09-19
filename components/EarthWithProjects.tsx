'use client'

import { useRef, useEffect, useState } from 'react'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { motion } from 'framer-motion'
import * as THREE from 'three'
import type { Project } from '@/context/DataContext'

interface EarthWithProjectsProps {
  projects: Project[]
  /** Phase 1: hide prices and show "Request MRV / Fund Project" when false */
  showAdvanced?: boolean
}

function ProjectMarker({ 
  position, 
  project, 
  onClick
}: { 
  position: [number, number, number]
  project: Project
  onClick: () => void
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)

  useFrame((state) => {
    // Only pulse animation on marker
    if (meshRef.current) {
      const scale = hovered ? 0.08 + Math.sin(state.clock.elapsedTime * 3) * 0.015 : 0.06
      meshRef.current.scale.setScalar(scale)
    }
  })

  return (
    <group position={position}>
      {/* Pin Point */}
      <mesh
        ref={meshRef}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial
          color={hovered ? '#fbbf24' : '#10b981'}
          emissive={hovered ? '#fbbf24' : '#10b981'}
          emissiveIntensity={hovered ? 2 : 1.2}
          metalness={0.3}
          roughness={0.2}
        />
      </mesh>

      {/* Glow Ring - Horizontal */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.05, 0]}>
        <ringGeometry args={[1, 1.4, 32]} />
        <meshBasicMaterial
          color={hovered ? '#fbbf24' : '#10b981'}
          transparent
          opacity={hovered ? 0.8 : 0.5}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Vertical Beam */}
      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 1.2, 8]} />
        <meshStandardMaterial
          color={hovered ? '#fbbf24' : '#10b981'}
          emissive={hovered ? '#fbbf24' : '#10b981'}
          emissiveIntensity={0.8}
          transparent
          opacity={0.9}
        />
      </mesh>
      
      {/* Floating Label Plane */}
      {hovered && (
        <mesh position={[0, 2, 0]} rotation={[0, 0, 0]}>
          <planeGeometry args={[0.1, 0.1]} />
          <meshBasicMaterial
            color="#10b981"
            transparent
            opacity={0}
          />
        </mesh>
      )}
    </group>
  )
}

function Earth({ projects, onProjectClick }: { projects: Project[], onProjectClick: (project: Project) => void }) {
  const earthGroupRef = useRef<THREE.Group>(null)
  const meshRef = useRef<THREE.Mesh>(null)
  const cloudsRef = useRef<THREE.Mesh>(null)
  const atmosphereRef = useRef<THREE.Mesh>(null)

  // Load textures
  const dayTexture = useLoader(THREE.TextureLoader, '/earth/day.jpg')
  const nightTexture = useLoader(THREE.TextureLoader, '/earth/night.jpg')
  const cloudsTexture = useLoader(THREE.TextureLoader, '/earth/specularClouds.jpg')

  // Custom shader material for day/night transition
  const earthMaterial = useRef(
    new THREE.ShaderMaterial({
      uniforms: {
        dayTexture: { value: dayTexture },
        nightTexture: { value: nightTexture },
        sunDirection: { value: new THREE.Vector3(1, 0, 0) }
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPosition;
        
        void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
          vPosition = (modelViewMatrix * vec4(position, 1.0)).xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D dayTexture;
        uniform sampler2D nightTexture;
        uniform vec3 sunDirection;
        
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPosition;
        
        void main() {
          vec3 dayColor = texture2D(dayTexture, vUv).rgb;
          vec3 nightColor = texture2D(nightTexture, vUv).rgb;
          
          float intensity = dot(vNormal, sunDirection);
          intensity = smoothstep(-0.3, 0.3, intensity);
          
          vec3 color = mix(nightColor * 0.5, dayColor, intensity);
          gl_FragColor = vec4(color, 1.0);
        }
      `
    })
  )

  useFrame((state, delta) => {
    // Rotate entire Earth group (includes markers)
    if (earthGroupRef.current) {
      earthGroupRef.current.rotation.y += delta * 0.02
    }
    
    // Independent cloud rotation for realism
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += delta * 0.005 // Slow independent rotation
      cloudsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.2) * 0.03
    }
    
    // Atmosphere pulse
    if (atmosphereRef.current) {
      const scale = 2.55 + Math.sin(state.clock.elapsedTime * 1.5) * 0.015
      atmosphereRef.current.scale.setScalar(scale)
    }
  })

  // Convert lat/lng to 3D coordinates
  const latLngToVector3 = (lat: number, lng: number, radius: number): [number, number, number] => {
    const phi = (90 - lat) * (Math.PI / 180)
    const theta = (lng + 180) * (Math.PI / 180)
    
    const x = -(radius * Math.sin(phi) * Math.cos(theta))
    const y = radius * Math.cos(phi)
    const z = radius * Math.sin(phi) * Math.sin(theta)
    
    return [x, y, z]
  }

  return (
    <>
      {/* Earth Group - Everything rotates together */}
      <group ref={earthGroupRef}>
        {/* Main Earth */}
        <mesh ref={meshRef}>
          <sphereGeometry args={[2, 64, 64]} />
          <primitive object={earthMaterial.current} attach="material" />
        </mesh>

        {/* Project Markers - Children of Earth group, rotate with it (only projects with valid coordinates) */}
        {(projects || []).filter((p) => p.coordinates && typeof p.coordinates.lat === 'number' && typeof p.coordinates.lng === 'number').map((project) => {
          const position = latLngToVector3(project.coordinates!.lat, project.coordinates!.lng, 2.12)
          return (
            <ProjectMarker
              key={project.id}
              position={position}
              project={project}
              onClick={() => onProjectClick(project)}
            />
          )
        })}
      </group>

      {/* Clouds Layer - Independent rotation */}
      <mesh ref={cloudsRef}>
        <sphereGeometry args={[2.02, 64, 64]} />
        <meshStandardMaterial
          map={cloudsTexture}
          transparent
          opacity={0.4}
          depthWrite={false}
        />
      </mesh>

      {/* Atmosphere - Outside, no rotation */}
      <mesh ref={atmosphereRef}>
        <sphereGeometry args={[2.5, 64, 64]} />
        <meshBasicMaterial
          color="#4da6ff"
          transparent
          opacity={0.15}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Ambient lighting */}
      <pointLight position={[5, 3, 5]} intensity={0.8} color="#ffffff" />
      <pointLight position={[-5, -3, -5]} intensity={0.3} color="#4da6ff" />
    </>
  )
}

export default function EarthWithProjects({ projects, showAdvanced = false }: EarthWithProjectsProps) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project)
  }

  const handleViewOnMap = () => {
    if (selectedProject?.coordinates && typeof selectedProject.coordinates.lat === 'number' && typeof selectedProject.coordinates.lng === 'number') {
      const { lat, lng } = selectedProject.coordinates
      window.open(`https://www.google.com/maps?q=${lat},${lng}&z=15&t=k`, '_blank')
    }
  }

  return (
    <div className="relative w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
      >
        <color attach="background" args={['#0a0a1a']} />
        <ambientLight intensity={0.3} />
        <directionalLight position={[5, 3, 5]} intensity={1.5} />
        <Earth projects={projects ?? []} onProjectClick={handleProjectClick} />
        <OrbitControls
          enableZoom={true}
          enablePan={false}
          minDistance={4}
          maxDistance={10}
          autoRotate={false}
          rotateSpeed={0.5}
        />
        
        {/* Stars Background */}
        <mesh>
          <sphereGeometry args={[50, 32, 32]} />
          <meshBasicMaterial
            color="#ffffff"
            side={THREE.BackSide}
            transparent
            opacity={0.3}
          />
        </mesh>
      </Canvas>

      {/* Info Panel */}
      {selectedProject && (
        <div className="absolute bottom-4 left-4 right-4 bg-slate-900/95 backdrop-blur-lg rounded-xl p-6 border border-green-500/50 shadow-2xl">
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{selectedProject.image}</span>
              <div>
                <h3 className="text-xl font-bold text-white">{selectedProject.name}</h3>
                <p className="text-gray-300 text-sm">📍 {selectedProject.location}</p>
              </div>
            </div>
            <button
              onClick={() => setSelectedProject(null)}
              className="text-white hover:text-red-400 text-2xl"
            >
              ✕
            </button>
          </div>

          <p className="text-gray-300 text-sm mb-4">{selectedProject.description}</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div className="bg-white/5 rounded-lg p-2">
              <div className="text-gray-400 text-xs">Area</div>
              <div className="text-white font-semibold text-sm">{selectedProject.area}</div>
            </div>
            <div className="bg-white/5 rounded-lg p-2">
              <div className="text-gray-400 text-xs">Estimated Carbon Potential</div>
              <div className="text-white font-semibold text-sm">{selectedProject.creditsAvailable}</div>
            </div>
            {showAdvanced && (
              <div className="bg-white/5 rounded-lg p-2">
                <div className="text-gray-400 text-xs">Price/Credit</div>
                <div className="text-white font-semibold text-sm">${selectedProject.pricePerCredit}</div>
              </div>
            )}
            <div className="bg-white/5 rounded-lg p-2">
              <div className="text-gray-400 text-xs">CO₂ Impact</div>
              <div className="text-white font-semibold text-sm">{selectedProject.impact}</div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleViewOnMap}
              className="flex-1 py-2 bg-green-500 hover:bg-green-600 rounded-lg text-white font-semibold transition-all"
            >
              🗺️ View on Map
            </button>
            <button className="flex-1 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white font-semibold transition-all">
              {showAdvanced ? '💰 Buy Credits' : '📄 Request MRV / Fund Project'}
            </button>
          </div>
        </div>
      )}

      {/* Instructions */}
      {!selectedProject && (
        <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md rounded-lg px-4 py-2 border border-green-500/30">
          <p className="text-green-400 text-sm">
            🌍 Click on green markers to view project details • Drag to rotate • Scroll to zoom
          </p>
        </div>
      )}
    </div>
  )
}
