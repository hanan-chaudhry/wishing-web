import { useTexture } from '@react-three/drei'
import * as THREE from 'three'

export default function TeddyBear({ position = [0, 0, 0], rotation = [0, 0, 0], scale = 1 }) {
  const texture = useTexture('/teddy.png')

  return (
    <mesh position={position} rotation={rotation} scale={scale}>
      <planeGeometry args={[3, 3.5]} />
      <meshStandardMaterial
        map={texture}
        transparent={true}
        alphaTest={0.5}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </mesh>
  )
}
