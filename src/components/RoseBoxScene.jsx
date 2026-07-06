import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import RotatingRoseBox from './RotatingRoseBox'

export default function RoseBoxScene() {
  const { scene } = useThree()

  // Set black background when component mounts
  useEffect(() => {
    scene.background = new THREE.Color(0x000000)
    return () => {
      scene.background = null
    }
  }, [scene])

  return (
    <group>
      {/* Minimal lighting for black background aesthetic */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={0.6} />
      <pointLight position={[0, 0, 0]} intensity={0.3} color={0xffffff} />

      {/* The rotating rose box */}
      <RotatingRoseBox />
    </group>
  )
}
