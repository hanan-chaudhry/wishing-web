import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import TeddyBear from './TeddyBear'

export default function RotatingTeddyBox() {
  const boxRef = useRef()

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

      {/* Single teddy bear centered in the box */}
      <TeddyBear position={[0, 0, 0]} rotation={[0, 0.3, 0]} scale={1.2} />
    </group>
  )
}
