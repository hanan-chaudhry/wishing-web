import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import Sunflower from './Sunflower'

export default function SunflowerField({ scrollProgress = 0 }) {
  const groupRef = useRef()

  // Generate sunflower positions and properties
  const sunflowerData = useMemo(() => {
    const data = []
    const layers = [
      { y: -1.5, count: 15, radius: 12 },
      { y: -1, count: 20, radius: 15 },
      { y: -0.5, count: 25, radius: 18 }
    ]

    layers.forEach(layer => {
      for (let i = 0; i < layer.count; i++) {
        const angle = (i / layer.count) * Math.PI * 2 + Math.random() * 0.5
        const radius = layer.radius * (0.5 + Math.random() * 0.5)
        const x = Math.cos(angle) * radius
        const z = Math.sin(angle) * radius - 5 // Position behind the water

        data.push({
          position: [x, layer.y, z],
          delay: Math.random() * 5,
          priority: Math.random() // For sorting rendering order
        })
      }
    })

    // Sort by priority (closer flowers render first)
    return data.sort((a, b) => b.priority - a.priority)
  }, [])

  useFrame((state) => {
    const time = state.clock.getElapsedTime()

    if (groupRef.current) {
      // Subtle scene-wide animation
      groupRef.current.rotation.y = Math.sin(time * 0.05) * 0.02
    }
  })

  return (
    <group ref={groupRef}>
      {sunflowerData.map((data, index) => (
        <Sunflower
          key={`sunflower-${index}`}
          position={data.position}
          delay={data.delay}
          scrollProgress={scrollProgress}
        />
      ))}

      {/* Ambient flower glow for atmosphere */}
      <ambientLight intensity={0.1} color={0xffa500} />
    </group>
  )
}