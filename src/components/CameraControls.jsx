import { useRef, useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import gsap from 'gsap'

export default function CameraControls() {
  const { camera, gl } = useThree()
  const controlsRef = useRef()

  useEffect(() => {
    // Set initial camera position for cinematic aerial shot
    const startPos = { x: 0, y: 20, z: 30 }
    const targetPos = { x: 0, y: 5, z: 15 }

    // Apply start position instantly
    camera.position.set(startPos.x, startPos.y, startPos.z)
    camera.lookAt(0, 0, 0)
    gl.setSize(window.innerWidth, window.innerHeight)

    // Animate to target position over 5 seconds
    gsap.to(camera.position, {
      duration: 5,
      x: targetPos.x,
      y: targetPos.y,
      z: targetPos.z,
      ease: 'power2.out',
      onUpdate: () => {
        camera.lookAt(0, 0, 0)
      }
    })
  }, [camera, gl])

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.1}
      rotateSpeed={0.5}
      minDistance={5}
      maxDistance={50}
      maxPolarAngle={Math.PI / 2 - 0.1}
    />
  )
}
