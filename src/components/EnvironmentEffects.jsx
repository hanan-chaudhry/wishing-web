import { useRef, useMemo, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function EnvironmentEffects({ isLoaded }) {
  const firefliesRef = useRef()
  const butterfliesRef = useRef()
  const pollenRef = useRef()
  const fogRef = useRef()
  const [firefliesVisible, setFirefliesVisible] = useState(false)

  // Create firefly data
  const createFireflies = () => {
    const fireflies = []
    for (let i = 0; i < 100; i++) {
      fireflies.push({
        position: new THREE.Vector3(
          (Math.random() - 0.5) * 30,
          0.5 + Math.random() * 4,
          (Math.random() - 0.5) * 20 - 5
        ),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.01,
          (Math.random() - 0.5) * 0.02
        ),
        size: 0.05 + Math.random() * 0.05,
        blinkSpeed: 1 + Math.random() * 2,
        blinkOffset: Math.random() * Math.PI * 2,
        color: new THREE.Color().setHSL(0.15 + Math.random() * 0.1, 1, 0.5)
      })
    }
    return fireflies
  }

  const fireflyData = useMemo(createFireflies, [])

  // Create butterfly data
  const createButterflies = () => {
    const butterflies = []
    for (let i = 0; i < 8; i++) {
      butterflies.push({
        position: new THREE.Vector3(
          (Math.random() - 0.5) * 20,
          2 + Math.random() * 3,
          (Math.random() - 0.5) * 15 - 5
        ),
        targetPosition: new THREE.Vector3(),
        speed: 0.5 + Math.random() * 0.5,
        wingColor: new THREE.Color().setHSL(Math.random() * 0.2 + 0.05, 0.8, 0.5),
        wingPattern: Math.random() > 0.5 ? 'monarch' : 'swallowtail',
        phase: Math.random() * Math.PI * 2,
        flutterSpeed: 8 + Math.random() * 4
      })
    }
    return butterflies
  }

  const butterflyData = useMemo(createButterflies, [])

  // Create pollen particles
  const createPollen = () => {
    const pollen = []
    for (let i = 0; i < 300; i++) {
      pollen.push({
        position: new THREE.Vector3(
          (Math.random() - 0.5) * 30,
          1 + Math.random() * 6,
          (Math.random() - 0.5) * 20 - 5
        ),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.01,
          -0.005 - Math.random() * 0.01,
          (Math.random() - 0.5) * 0.01
        ),
        size: 0.02 + Math.random() * 0.03,
        lifetime: Math.random() * 10
      })
    }
    return pollen
  }

  const pollenData = useMemo(createPollen, [])

  // Create wing geometry for butterflies
  const butterflyWingGeometry = useMemo(() => {
    const wingShape = new THREE.Shape()
    wingShape.moveTo(0, 0)
    wingShape.bezierCurveTo(0.3, 0.1, 0.5, 0.3, 0.6, 0.5)
    wingShape.bezierCurveTo(0.5, 0.7, 0.3, 0.9, 0, 1)
    wingShape.bezierCurveTo(-0.2, 0.8, -0.3, 0.6, -0.2, 0.4)
    wingShape.bezierCurveTo(-0.1, 0.2, -0.2, 0.1, 0, 0)
    wingShape.closePath()

    return new THREE.ExtrudeGeometry(wingShape, { depth: 0.01, bevelEnabled: false })
  }, [])

  useFrame((state) => {
    const time = state.clock.getElapsedTime()

    // Show fireflies after some time (dusk effect)
    if (!firefliesVisible && isLoaded && time > 8) {
      setFirefliesVisible(true)
    }

    // Animate fireflies
    if (firefliesRef.current) {
      const positions = firefliesRef.current.geometry.attributes.position.array
      const colors = firefliesRef.current.geometry.attributes.color.array
      const sizes = firefliesRef.current.geometry.attributes.size.array

      fireflyData.forEach((fly, i) => {
        // Update position with wandering behavior
        fly.position.add(fly.velocity)
        fly.velocity.add(new THREE.Vector3(
          (Math.random() - 0.5) * 0.001,
          (Math.random() - 0.5) * 0.002,
          (Math.random() - 0.5) * 0.001
        ))

        // Keep within bounds
        fly.position.x = THREE.MathUtils.clamp(fly.position.x, -15, 15)
        fly.position.y = THREE.MathUtils.clamp(fly.position.y, 0.3, 6)
        fly.position.z = THREE.MathUtils.clamp(fly.position.z, -15, 10)

        const idx = i * 3
        positions[idx] = fly.position.x
        positions[idx + 1] = fly.position.y
        positions[idx + 2] = fly.position.z

        // Blink effect
        const opacity = firefliesVisible ?
          0.5 + Math.sin(time * fly.blinkSpeed + fly.blinkOffset) * 0.5 : 0

        colors[idx] = fly.color.r * opacity
        colors[idx + 1] = fly.color.g * opacity
        colors[idx + 2] = fly.color.b * opacity

        // Size variation
        sizes[i] = fly.size * (0.8 + Math.sin(time * fly.blinkSpeed + fly.blinkOffset) * 0.2)
      })

      firefliesRef.current.geometry.attributes.position.needsUpdate = true
      firefliesRef.current.geometry.attributes.color.needsUpdate = true
      firefliesRef.current.geometry.attributes.size.needsUpdate = true
    }

    // Animate butterflies
    if (butterfliesRef.current) {
      butterfliesRef.current.children.forEach((butterfly, i) => {
        const data = butterflyData[i]
        if (!data) return

        // Update target position occasionally
        if (Math.random() < 0.01) {
          data.targetPosition.set(
            (Math.random() - 0.5) * 20,
            2 + Math.random() * 3,
            (Math.random() - 0.5) * 15 - 5
          )
        }

        // Move toward target with smooth path
        const direction = data.targetPosition.clone().sub(butterfly.position)
        const distance = direction.length()
        if (distance > 0.1) {
          direction.normalize()
          butterfly.position.add(direction.multiplyScalar(data.speed * 0.01))

          // Add sinusoidal flight path
          butterfly.position.x += Math.sin(time * 2 + i) * 0.01
          butterfly.position.y += Math.cos(time * 2.5 + i) * 0.008
        }

        // Face direction of movement
        butterfly.lookAt(data.targetPosition)

        // Wing flutter animation
        const wingAngle = Math.sin(time * data.flutterSpeed + data.phase) * 0.4

        // Animate wings
        butterfly.children.forEach((wing, wingIndex) => {
          const direction = wingIndex === 0 ? 1 : -1
          wing.rotation.z = wingAngle * direction
        })
      })
    }

    // Animate pollen particles
    if (pollenRef.current) {
      const positions = pollenRef.current.geometry.attributes.position.array

      pollenData.forEach((particle, i) => {
        // Update position
        particle.position.add(particle.velocity)
        particle.velocity.y += 0.001 // Gravity
        particle.velocity.x += Math.sin(time + i) * 0.0005 // Wind

        // Reset if below ground or lifetime expired
        if (particle.position.y < -1 || particle.lifetime < 0) {
          particle.position.set(
            (Math.random() - 0.5) * 30,
            6 + Math.random() * 2,
            (Math.random() - 0.5) * 20 - 5
          )
          particle.velocity.set(
            (Math.random() - 0.5) * 0.01,
            -0.005 - Math.random() * 0.01,
            (Math.random() - 0.5) * 0.01
          )
          particle.lifetime = 10 + Math.random() * 5
        }

        particle.lifetime -= 0.01

        const idx = i * 3
        positions[idx] = particle.position.x
        positions[idx + 1] = particle.position.y
        positions[idx + 2] = particle.position.z
      })

      pollenRef.current.geometry.attributes.position.needsUpdate = true
    }

    // Animate fog particles
    if (fogRef.current) {
      fogRef.current.rotation.y += 0.0003
      fogRef.current.children.forEach((particle, i) => {
        const floatSpeed = 0.5 + (i % 3) * 0.2
        particle.position.y += Math.sin(time * floatSpeed + i) * 0.001
      })
    }
  })

  return (
    <group>
      {/* Fireflies */}
      {isLoaded && (
        <points ref={firefliesRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={fireflyData.length}
              array={new Float32Array(fireflyData.flatMap(f => [f.position.x, f.position.y, f.position.z]))}
              itemSize={3}
            />
            <bufferAttribute
              attach="attributes-color"
              count={fireflyData.length}
              array={new Float32Array(fireflyData.flatMap(f => [f.color.r, f.color.g, f.color.b]))}
              itemSize={3}
            />
            <bufferAttribute
              attach="attributes-size"
              count={fireflyData.length}
              array={new Float32Array(fireflyData.map(f => f.size))}
              itemSize={1}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.05}
            vertexColors
            transparent
            opacity={0.8}
            sizeAttenuation
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </points>
      )}

      {/* Butterflies */}
      {isLoaded && (
        <group ref={butterfliesRef}>
          {butterflyData.map((data, i) => (
            <group key={`butterfly-${i}`} position={data.position}>
              {/* Body */}
              <mesh scale={[0.05, 0.15, 0.05]}>
                <capsuleGeometry args={[1, 1, 4, 8]} />
                <meshStandardMaterial color={0x2a1a0a} roughness={0.9} />
              </mesh>

              {/* Wings */}
              <group scale={[0.5, 0.5, 0.1]}>
                <mesh position={[0.3, 0.1, 0]} rotation={[0, 0, 0]}>
                  <primitive object={butterflyWingGeometry} />
                  <meshStandardMaterial
                    color={data.wingPattern === 'monarch' ? 0xFFA500 : 0xFFFF00}
                    roughness={0.6}
                    metalness={0.2}
                    side={THREE.DoubleSide}
                  />
                </mesh>
                <mesh position={[-0.3, 0.1, 0]} rotation={[0, 0, 0]}>
                  <primitive object={butterflyWingGeometry} scale={[-1, 1, 1]} />
                  <meshStandardMaterial
                    color={data.wingPattern === 'monarch' ? 0xFFA500 : 0xFFFF00}
                    roughness={0.6}
                    metalness={0.2}
                    side={THREE.DoubleSide}
                  />
                </mesh>
              </group>

              {/* Antennae */}
              <group>
                <mesh position={[0.02, 0.1, 0]} scale={[0.008, 0.1, 0.008]}>
                  <cylinderGeometry args={[1, 1, 1, 4]} />
                  <meshStandardMaterial color={0x1a0a05} />
                </mesh>
                <mesh position={[-0.02, 0.1, 0]} scale={[0.008, 0.1, 0.008]}>
                  <cylinderGeometry args={[1, 1, 1, 4]} />
                  <meshStandardMaterial color={0x1a0a05} />
                </mesh>
              </group>
            </group>
          ))}
        </group>
      )}

      {/* Pollen particles */}
      {isLoaded && (
        <points ref={pollenRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={pollenData.length}
              array={new Float32Array(pollenData.flatMap(p => [p.position.x, p.position.y, p.position.z]))}
              itemSize={3}
            />
            <bufferAttribute
              attach="attributes-size"
              count={pollenData.length}
              array={new Float32Array(pollenData.map(p => p.size))}
              itemSize={1}
            />
          </bufferGeometry>
          <pointsMaterial
            size={0.03}
            color={0xfff7e6}
            transparent
            opacity={0.6}
            sizeAttenuation
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </points>
      )}

      {/* Ambient fog particles */}
      {isLoaded && (
        <group ref={fogRef}>
          {Array.from({ length: 50 }).map((_, i) => (
            <mesh
              key={`fog-${i}`}
              position={[
                (Math.random() - 0.5) * 30,
                1 + Math.random() * 3,
                (Math.random() - 0.5) * 20 - 5
              ]}
              scale={[0.5, 0.3, 0.5]}
            >
              <sphereGeometry args={[1, 8, 8]} />
              <meshBasicMaterial
                color={0xffffff}
                transparent
                opacity={0.03}
                depthWrite={false}
              />
            </mesh>
          ))}
        </group>
      )}

      {/* Distant birds */}
      {isLoaded && (
        <group>
          {Array.from({ length: 5 }).map((_, i) => {
            const speed = 0.1 + i * 0.05
            const y = 15 + i * 2
            return (
              <Bird
                key={`bird-${i}`}
                initialX={-20 - i * 5}
                y={y}
                speed={speed}
                zIndex={-10 - i}
              />
            )
          })}
        </group>
      )}
    </group>
  )
}

// Bird component for distant flying birds
function Bird({ initialX, y, speed = 0.1, zIndex = -10 }) {
  const groupRef = useRef()
  const [position, setPosition] = useState(new THREE.Vector3(initialX, y, zIndex))

  useFrame(() => {
    if (!groupRef.current) return

    // Fly across the screen
    position.x += speed
    if (position.x > 25) {
      position.x = -25
    }

    groupRef.current.position.copy(position)

    // Subtle wing flapping rotation
    if (groupRef.current.children.length > 0) {
      groupRef.current.children.forEach((wing, i) => {
        const direction = i === 0 ? 1 : -1
        wing.rotation.z = Math.sin(Date.now() * 0.01 + i) * 0.3 * direction
      })
    }
  })

  return (
    <group ref={groupRef} position={position}>
      {/* Bird body (simplified as silhouette) */}
      <mesh scale={[0.3, 0.08, 0.02]}>
        <capsuleGeometry args={[1, 1, 4, 4]} />
        <meshBasicMaterial color={0x000000} />
      </mesh>

      {/* Wings */}
      <mesh position={[0.15, 0, 0]} scale={[0.25, 0.12, 0.01]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial color={0x000000} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[-0.15, 0, 0]} scale={[0.25, 0.12, 0.01]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial color={0x000000} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}