import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import RoseFlower from './RoseFlower'

export default function RotatingRoseBox() {
  const boxRef = useRef()

  // Generate random rose positions and rotations for bouquet effect
  const roses = useMemo(() => {
    const count = 25
    const arrangements = []

    for (let i = 0; i < count; i++) {
      // Spherical distribution for natural bouquet look
      const radius = 0.8 + Math.random() * 0.7
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)

      const x = radius * Math.sin(phi) * Math.cos(theta)
      const y = radius * Math.sin(phi) * Math.sin(theta)
      const z = radius * Math.cos(phi)

      // Random rotations for variety
      const rotX = (Math.random() - 0.5) * 0.6
      const rotY = Math.random() * Math.PI * 2
      const rotZ = (Math.random() - 0.5) * 0.5

      // Random scale variation
      const scale = 0.7 + Math.random() * 0.5

      arrangements.push({
        position: [x, y, z],
        rotation: [rotX, rotY, rotZ],
        scale: scale
      })
    }

    return arrangements
  }, [])

  // Horizontal rotation animation
  useFrame((state, delta) => {
    if (boxRef.current) {
      boxRef.current.rotation.y += delta * 0.15
    }
  })

  return (
    <group ref={boxRef}>
      {/* Wireframe box with white edges */}
      <mesh>
        <boxGeometry args={[4, 4, 4]} />
        <meshBasicMaterial visible={false} />
      </mesh>
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(4, 4, 4)]} />
        <lineBasicMaterial color={0xffffff} linewidth={2} />
      </lineSegments>

      {/* Rose bouquet inside the box */}
      {roses.map((rose, index) => (
        <RoseFlower
          key={index}
          position={rose.position}
          rotation={rose.rotation}
          scale={rose.scale}
        />
      ))}
    </group>
  )
}
