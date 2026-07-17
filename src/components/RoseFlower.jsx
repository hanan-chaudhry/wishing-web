import { useTexture } from '@react-three/drei'

export default function RoseFlower({ position = [0, 0, 0], rotation = [0, 0, 0], scale = 1 }) {
  const texture = useTexture(import.meta.env.BASE_URL + 'rose.png')

  return (
    <mesh position={position} rotation={rotation} scale={scale}>
      <planeGeometry args={[2, 3]} />
      <meshStandardMaterial
        map={texture}
        transparent={true}
        alphaTest={0.5}
        side={2}
        depthWrite={false}
      />
    </mesh>
  )
}
