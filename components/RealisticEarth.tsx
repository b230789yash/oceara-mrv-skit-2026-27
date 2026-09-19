'use client'

import { useRef, useMemo } from 'react'
import { Canvas, useFrame, useLoader } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import * as THREE from 'three'
import dynamic from 'next/dynamic'

const AnimatedParticles = dynamic(() => import('./AnimatedParticles'), { ssr: false })

interface RealisticEarthProps {
  hoveredRole?: string | null
}

function Earth({ hoveredRole }: { hoveredRole: string | null }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const cloudsRef = useRef<THREE.Mesh>(null)
  const atmosphereRef = useRef<THREE.Mesh>(null)

  // Load textures
  const [dayTexture, nightTexture, cloudsTexture] = useLoader(THREE.TextureLoader, [
    '/earth/day.jpg',
    '/earth/night.jpg',
    '/earth/specularClouds.jpg'
  ])

  // Shader material for day/night cycle
  const earthMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        dayTexture: { value: dayTexture },
        nightTexture: { value: nightTexture },
        sunDirection: { value: new THREE.Vector3(5, 0, 1).normalize() },
        atmosphereColor: { value: new THREE.Color(
          hoveredRole === 'landowner' ? 0x10b981 : 
          hoveredRole === 'buyer' ? 0x3b82f6 : 
          hoveredRole === 'admin' ? 0xa855f7 : 0x4fc3f7
        )}
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPosition;

        void main() {
          vUv = uv;
          vNormal = normalize(normalMatrix * normal);
          vPosition = (modelMatrix * vec4(position, 1.0)).xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D dayTexture;
        uniform sampler2D nightTexture;
        uniform vec3 sunDirection;
        uniform vec3 atmosphereColor;

        varying vec2 vUv;
        varying vec3 vNormal;
        varying vec3 vPosition;

        void main() {
          vec3 normal = normalize(vNormal);
          vec3 viewDirection = normalize(cameraPosition - vPosition);
          
          // Day and night textures
          vec4 dayColor = texture2D(dayTexture, vUv);
          vec4 nightColor = texture2D(nightTexture, vUv);
          
          // Sun intensity
          float sunIntensity = max(0.0, dot(normal, sunDirection));
          
          // Mix day and night
          vec4 color = mix(nightColor, dayColor, smoothstep(0.0, 0.5, sunIntensity));
          
          // Fresnel effect for atmosphere
          float fresnel = pow(1.0 - max(0.0, dot(normal, viewDirection)), 3.0);
          vec3 atmosphere = atmosphereColor * fresnel * 0.5;
          
          // Specular highlight
          vec3 reflectDirection = reflect(-sunDirection, normal);
          float specular = pow(max(0.0, dot(reflectDirection, viewDirection)), 32.0);
          
          gl_FragColor = vec4(color.rgb + atmosphere + vec3(specular * 0.5), 1.0);
        }
      `
    })
  }, [dayTexture, nightTexture, hoveredRole])

  // Update atmosphere color on hover
  useMemo(() => {
    if (earthMaterial.uniforms.atmosphereColor) {
      earthMaterial.uniforms.atmosphereColor.value = new THREE.Color(
        hoveredRole === 'landowner' ? 0x10b981 : 
        hoveredRole === 'buyer' ? 0x3b82f6 : 
        hoveredRole === 'admin' ? 0xa855f7 : 0x4fc3f7
      )
    }
  }, [hoveredRole, earthMaterial])

  useFrame((state, delta) => {
    if (meshRef.current) {
      // Smooth continuous rotation
      meshRef.current.rotation.y += delta * 0.1
      
      // Professional hover animation
      if (hoveredRole) {
        // Elegant scale up with subtle pulse
        const targetScale = 2.8 + Math.sin(state.clock.elapsedTime * 2) * 0.05
        meshRef.current.scale.lerp(
          new THREE.Vector3(targetScale, targetScale, targetScale), 
          0.03
        )
        
        // Smooth Y-axis spin acceleration
        meshRef.current.rotation.y += delta * 0.15
        
        // Subtle tilt for depth
        const targetTiltX = Math.sin(state.clock.elapsedTime * 0.8) * 0.08
        const targetTiltZ = Math.cos(state.clock.elapsedTime * 0.6) * 0.06
        meshRef.current.rotation.x = THREE.MathUtils.lerp(
          meshRef.current.rotation.x,
          targetTiltX,
          0.02
        )
        meshRef.current.rotation.z = THREE.MathUtils.lerp(
          meshRef.current.rotation.z,
          targetTiltZ,
          0.02
        )
        
        // Gentle forward motion
        meshRef.current.position.z = THREE.MathUtils.lerp(
          meshRef.current.position.z,
          0.3,
          0.02
        )
      } else {
        // Smooth return to original state
        meshRef.current.scale.lerp(new THREE.Vector3(2.2, 2.2, 2.2), 0.03)
        meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, 0, 0.03)
        meshRef.current.rotation.z = THREE.MathUtils.lerp(meshRef.current.rotation.z, 0, 0.03)
        meshRef.current.position.z = THREE.MathUtils.lerp(meshRef.current.position.z, 0, 0.03)
      }
    }

    // Professional cloud animation
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += hoveredRole ? delta * 0.12 : delta * 0.04
      
      if (hoveredRole) {
        const cloudTilt = Math.sin(state.clock.elapsedTime * 0.5) * 0.03
        cloudsRef.current.rotation.x = THREE.MathUtils.lerp(
          cloudsRef.current.rotation.x,
          cloudTilt,
          0.02
        )
      } else {
        cloudsRef.current.rotation.x = THREE.MathUtils.lerp(
          cloudsRef.current.rotation.x,
          0,
          0.03
        )
      }
    }

    // Elegant atmosphere glow
    if (atmosphereRef.current) {
      if (hoveredRole) {
        const targetScale = 2.85 + Math.sin(state.clock.elapsedTime * 2.5) * 0.08
        atmosphereRef.current.scale.lerp(
          new THREE.Vector3(targetScale, targetScale, targetScale),
          0.02
        )
      } else {
        atmosphereRef.current.scale.lerp(new THREE.Vector3(2.5, 2.5, 2.5), 0.03)
      }
    }
  })

  return (
    <group>
      {/* Main Earth */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[1, 128, 128]} />
        <primitive object={earthMaterial} attach="material" />
      </mesh>

      {/* Clouds */}
      <mesh ref={cloudsRef}>
        <sphereGeometry args={[1.01, 64, 64]} />
        <meshStandardMaterial
          map={cloudsTexture}
          transparent
          opacity={0.4}
          depthWrite={false}
        />
      </mesh>

      {/* Atmosphere glow */}
      <mesh ref={atmosphereRef} scale={2.5}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshBasicMaterial
          color={
            hoveredRole === 'landowner' ? '#10b981' : 
            hoveredRole === 'buyer' ? '#3b82f6' : 
            hoveredRole === 'admin' ? '#a855f7' : '#4fc3f7'
          }
          transparent
          opacity={hoveredRole ? 0.15 : 0.08}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Elegant orbital particles */}
      {hoveredRole && (
        <>
          {[...Array(24)].map((_, i) => {
            const angle = (i / 24) * Math.PI * 2
            const radius = 3.2
            const x = Math.cos(angle) * radius
            const z = Math.sin(angle) * radius
            const y = Math.sin(angle * 3) * 0.4
            return (
              <mesh key={i} position={[x, y, z]}>
                <sphereGeometry args={[0.035, 12, 12]} />
                <meshStandardMaterial
                  color={
                    hoveredRole === 'landowner' ? '#10b981' : 
                    hoveredRole === 'buyer' ? '#3b82f6' : '#a855f7'
                  }
                  emissive={
                    hoveredRole === 'landowner' ? '#10b981' : 
                    hoveredRole === 'buyer' ? '#3b82f6' : '#a855f7'
                  }
                  emissiveIntensity={0.8}
                  transparent
                  opacity={0.9}
                />
              </mesh>
            )
          })}
        </>
      )}

      {/* Elegant ring system */}
      {hoveredRole && (
        <>
          {/* Main equatorial ring */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[3.3, 0.02, 16, 100]} />
            <meshStandardMaterial
              color={
                hoveredRole === 'landowner' ? '#10b981' : 
                hoveredRole === 'buyer' ? '#3b82f6' : '#a855f7'
              }
              emissive={
                hoveredRole === 'landowner' ? '#10b981' : 
                hoveredRole === 'buyer' ? '#3b82f6' : '#a855f7'
              }
              emissiveIntensity={0.6}
              transparent
              opacity={0.7}
            />
          </mesh>
          
          {/* Angled accent ring */}
          <mesh rotation={[Math.PI / 3, Math.PI / 6, 0]}>
            <torusGeometry args={[3.5, 0.015, 16, 100]} />
            <meshStandardMaterial
              color={
                hoveredRole === 'landowner' ? '#10b981' : 
                hoveredRole === 'buyer' ? '#3b82f6' : '#a855f7'
              }
              emissive={
                hoveredRole === 'landowner' ? '#10b981' : 
                hoveredRole === 'buyer' ? '#3b82f6' : '#a855f7'
              }
              emissiveIntensity={0.4}
              transparent
              opacity={0.4}
            />
          </mesh>
        </>
      )}
    </group>
  )
}

export default function RealisticEarth({ hoveredRole }: RealisticEarthProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 45 }}
      style={{ background: 'transparent' }}
    >
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 3, 5]} intensity={1.5} />
      <pointLight position={[-5, -3, -5]} intensity={0.5} color="#4fc3f7" />
      
      {/* Subtle accent lighting on hover */}
      {hoveredRole && (
        <pointLight
          position={[0, 0, 3]}
          intensity={1.2}
          color={
            hoveredRole === 'landowner' ? '#10b981' : 
            hoveredRole === 'buyer' ? '#3b82f6' : '#a855f7'
          }
          distance={8}
          decay={2}
        />
      )}
      
      <Earth hoveredRole={hoveredRole || null} />
      <AnimatedParticles hoveredRole={hoveredRole || null} />
      
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.5}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 1.5}
      />
      
      {/* Stars background */}
      <Stars
        radius={100}
        depth={50}
        count={5000}
        factor={4}
        saturation={0}
        fade
        speed={1}
      />
    </Canvas>
  )
}

