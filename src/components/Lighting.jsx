import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function Lighting() {
  const directionalLightRef = useRef()
  const ambientLightRef = useRef()
  const sunRef = useRef()
  const moonRef = useRef()

  useFrame((state) => {
    const time = state.clock.getElapsedTime()

    // Sun animation - subtle movement
    if (sunRef.current) {
      sunRef.current.position.x = Math.sin(time * 0.1) * 2
      sunRef.current.position.y = 15 + Math.sin(time * 0.15) * 1
    }

    // Moon animation - very subtle
    if (moonRef.current) {
      moonRef.current.position.x = -5 + Math.cos(time * 0.08) * 0.5
      moonRef.current.position.y = 12 + Math.cos(time * 0.12) * 0.3
    }

    // Dynamic ambient light for sunset effect
    if (ambientLightRef.current) {
      const sunsetFactor = (Math.sin(time * 0.1) + 1) / 2
      const sunsetColor = new THREE.Color(1, 0.6, 0.3)
      const twilightColor = new THREE.Color(0.3, 0.2, 0.5)
      const mixedColor = sunsetColor.clone().lerp(twilightColor, sunsetFactor)
      ambientLightRef.current.color.copy(mixedColor)
    }

    // Shadow animation
    if (directionalLightRef.current) {
      directionalLightRef.current.shadow.camera.left = -50
      directionalLightRef.current.shadow.camera.right = 50
      directionalLightRef.current.shadow.camera.top = 50
      directionalLightRef.current.shadow.camera.bottom = -50
    }
  })

  return (
    <>
      {/* Main sunlight with warm colors */}
      <directionalLight
        ref={sunRef}
        position={[0, 15, 10]}
        intensity={2.5}
        color={0xffa500}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={100}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
        shadow-bias={-0.0001}
      />

      {/* Soft ambient light for overall scene illumination */}
      <ambientLight
        ref={ambientLightRef}
        intensity={0.4}
        color={0x6b5d4f}
      />

      {/* Fill light from sunset reflection */}
      <pointLight
        position={[-10, 5, -5]}
        intensity={0.8}
        color={0xff6b6b}
        distance={30}
        decay={2}
      />

      {/* Cool fill light from moon */}
      <pointLight
        ref={moonRef}
        position={[-5, 12, -10]}
        intensity={0.3}
        color={0x87ceeb}
        distance={40}
        decay={1.5}
      />

      {/* Rim light for dramatic effect */}
      <spotLight
        position={[15, 8, 15]}
        intensity={1.2}
        color={0xffd700}
        angle={0.3}
        penumbra={0.5}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      {/* Ground reflected light */}
      <hemisphereLight
        intensity={0.3}
        groundColor={0x8b7355}
        skyColor={0xffa500}
      />

      {/* Subtle volumetric light simulation */}
      <rectAreaLight
        position={[0, 20, 0]}
        width={50}
        height={30}
        intensity={0.5}
        color={0xffa500}
        rotation={[-Math.PI / 2, 0, 0]}
      />
    </>
  )
}