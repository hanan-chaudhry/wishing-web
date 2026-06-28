import { useRef, useMemo, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function Sunflower({ position, delay = 0, scrollProgress = 0, onHover = null }) {
  const groupRef = useRef()
  const stemRef = useRef()
  const flowerHeadRef = useRef()
  const leavesRef = useRef()
  const [isHovered, setIsHovered] = useState(false)

  const sunflowerProps = useMemo(() => ({
    petalCount: 18 + Math.floor(Math.random() * 8),
    size: 0.9 + Math.random() * 0.25,
    stemHeight: 2.5 + Math.random() * 1.2,
    stemThickness: 0.06 + Math.random() * 0.02,
    petalColor1: new THREE.Color().setHSL(0.1 + Math.random() * 0.04, 0.85, 0.55),
    petalColor2: new THREE.Color().setHSL(0.08 + Math.random() * 0.04, 0.9, 0.35),
    centerColor: new THREE.Color().setHSL(0.08, 0.7, 0.25),
    seedColor: new THREE.Color().setHSL(0.07, 0.5, 0.15),
    leafPositions: [
      { y: 0.35, angle: 0.6, scale: 0.9 },
      { y: 0.7, angle: -0.4, scale: 0.7 }
    ]
  }), [])

  const petalMaterial = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      color1: { value: sunflowerProps.petalColor1 },
      color2: { value: sunflowerProps.petalColor2 },
      lightDir: { value: new THREE.Vector3(0.5, 0.8, 0.3).normalize() }
    },
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vViewPosition;
      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vViewPosition = -mvPosition.xyz;
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform vec3 color1;
      uniform vec3 color2;
      uniform vec3 lightDir;
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vViewPosition;

      void main() {
        float petalLen = 1.8;
        vec2 uv = vUv * vec2(1.0, petalLen);
        float width = uv.y / petalLen * 0.45 + 0.08;
        float dist = abs(uv.x - 0.5);
        float shape = 1.0 - smoothstep(0.0, width, dist);
        float tip = 1.0 - uv.y / petalLen;
        float tipSmooth = smoothstep(0.0, 0.3, tip);
        float baseSmooth = smoothstep(0.0, 0.15, uv.y / petalLen);
        float alpha = shape * tipSmooth * baseSmooth * 0.95;
        if (alpha < 0.01) discard;

        vec3 color = mix(color1, color2, uv.y / petalLen);
        float centerLine = 1.0 - smoothstep(0.0, 0.06, dist);
        color += centerLine * 0.08 * color1;

        float vein = sin(uv.y * 14.0 - uv.x * 6.0) * 0.5 + 0.5;
        vein *= sin(uv.y * 10.0 + uv.x * 4.0) * 0.5 + 0.5;
        vein = smoothstep(0.5, 0.9, vein) * 0.12;
        color += vein * vec3(1.0, 0.7, 0.2);

        float edgeDark = 1.0 - smoothstep(width * 0.6, width, dist);
        color *= 0.7 + edgeDark * 0.3;

        vec3 normal = normalize(vNormal);
        float diffuse = max(dot(normal, lightDir), 0.25);
        color *= (0.75 + diffuse * 0.5);

        vec3 viewDir = normalize(vViewPosition);
        float fresnel = pow(1.0 - max(dot(viewDir, normal), 0.0), 4.0);
        color += fresnel * 0.15 * color1;

        gl_FragColor = vec4(color, alpha);
      }
    `
  }), [sunflowerProps.petalColor1, sunflowerProps.petalColor2])

  const leafGeometry = useMemo(() => {
    const shape = new THREE.Shape()
    shape.moveTo(0, 0)
    for (let i = 1; i <= 20; i++) {
      const t = i / 20
      const x = Math.sin(t * Math.PI) * 0.3
      const y = t * 0.8
      shape.lineTo(x, y)
    }
    for (let i = 19; i >= 0; i--) {
      const t = i / 20
      const x = -Math.sin(t * Math.PI) * 0.3
      const y = t * 0.8
      shape.lineTo(x, y)
    }
    shape.closePath()
    return new THREE.ShapeGeometry(shape)
  }, [])

  const petalGeometry = useMemo(() => new THREE.PlaneGeometry(1, 1.8, 8, 16), [])

  useFrame((state) => {
    const time = state.clock.getElapsedTime()
    const effectiveDelay = Math.max(0, time - delay)

    if (!groupRef.current) return

    const bloomProgress = Math.min(effectiveDelay / 3, 1)
    const easeBloom = 1 - Math.pow(1 - bloomProgress, 3)

    if (stemRef.current) {
      stemRef.current.scale.y = easeBloom * sunflowerProps.stemHeight
      stemRef.current.scale.x = sunflowerProps.stemThickness
      stemRef.current.scale.z = sunflowerProps.stemThickness

      const windStrength = 0.12 + scrollProgress * 0.08
      stemRef.current.rotation.x = Math.sin(time * 1.5 + position[0]) * windStrength
      stemRef.current.rotation.z = Math.cos(time * 1.2 + position[2]) * windStrength * 0.5
    }

    if (flowerHeadRef.current) {
      flowerHeadRef.current.scale.setScalar(easeBloom * sunflowerProps.size)
      flowerHeadRef.current.rotation.y = Math.sin(time * 0.5) * 0.1 + (isHovered ? 0.25 : 0)
      flowerHeadRef.current.rotation.z = Math.sin(time * 0.3) * 0.05
    }

    if (leavesRef.current) {
      leavesRef.current.children.forEach((leaf, i) => {
        const leafData = sunflowerProps.leafPositions[i]
        if (!leafData) return
        const leafBloom = Math.min((effectiveDelay - 0.5 - i * 0.3) / 3, 1)
        const leafScale = 1 - Math.pow(1 - leafBloom, 2)
        leaf.position.y = leafData.y * easeBloom
        leaf.rotation.y = leafData.angle + Math.sin(time * 1.2 + i) * 0.1
        leaf.rotation.z = -leafData.angle * 0.5 + Math.sin(time * 0.9 + i) * 0.05
        leaf.scale.setScalar(leafScale * leafData.scale)
      })
    }

    if (isHovered) {
      groupRef.current.position.y = THREE.MathUtils.lerp(
        groupRef.current.position.y, position[1] + 0.15, 0.1
      )
    } else {
      groupRef.current.position.y = THREE.MathUtils.lerp(
        groupRef.current.position.y, position[1], 0.1
      )
    }
  })

  const petalAngle = useMemo(() => {
    return Array.from({ length: sunflowerProps.petalCount }, (_, i) =>
      (i / sunflowerProps.petalCount) * Math.PI * 2
    )
  }, [sunflowerProps.petalCount])

  return (
    <group
      ref={groupRef}
      position={position}
      onPointerEnter={() => { setIsHovered(true); onHover?.(true) }}
      onPointerLeave={() => { setIsHovered(false); onHover?.(false) }}
    >
      <mesh ref={stemRef} castShadow receiveShadow>
        <cylinderGeometry args={[0.5, 0.3, 1, 8]} />
        <meshStandardMaterial color={0x2d7a2d} roughness={0.8} metalness={0} />
      </mesh>

      <group ref={leavesRef}>
        {sunflowerProps.leafPositions.map((_, i) => (
          <mesh key={`leaf-${i}`} geometry={leafGeometry} castShadow receiveShadow>
            <meshStandardMaterial
              color={0x3cb043}
              roughness={0.7}
              metalness={0}
              side={THREE.DoubleSide}
            />
          </mesh>
        ))}
      </group>

      <group ref={flowerHeadRef} position={[0, 1, 0]}>
        <group>
          {petalAngle.map((angle, i) => (
            <mesh
              key={`petal-${i}`}
              geometry={petalGeometry}
              material={petalMaterial}
              position={[
                Math.cos(angle) * 0.2,
                0.02,
                Math.sin(angle) * 0.2
              ]}
              rotation={[
                Math.PI / 2,
                0,
                angle - Math.PI / 2
              ]}
              scale={[0.7, 0.7, 0.7]}
            />
          ))}
        </group>

        <mesh position={[0, 0.03, 0]} scale={[0.35, 0.35, 0.06]}>
          <cylinderGeometry args={[1, 1.1, 1, 32]} />
          <meshStandardMaterial
            color={sunflowerProps.centerColor}
            roughness={0.95}
            metalness={0}
          />
        </mesh>

        {Array.from({ length: 5 }).map((_, ring) =>
          Array.from({ length: 10 + ring * 3 }).map((_, i) => {
            const angle = (i / (10 + ring * 3)) * Math.PI * 2 + ring * 0.2
            const radius = 0.04 + ring * 0.045
            return (
              <mesh
                key={`seed-${ring}-${i}`}
                position={[Math.cos(angle) * radius, 0.04, Math.sin(angle) * radius]}
                scale={[0.018, 0.012, 0.018]}
              >
                <sphereGeometry args={[1, 6, 6]} />
                <meshStandardMaterial color={sunflowerProps.seedColor} roughness={1} />
              </mesh>
            )
          })
        )}
      </group>
    </group>
  )
}
