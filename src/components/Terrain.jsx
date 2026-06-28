import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function Terrain({ scrollProgress = 0 }) {
  const terrainRef = useRef()
  const grassRef = useRef()

  // Create terrain shader with realistic grass texture
  const terrainShader = useMemo(() => ({
    uniforms: {
      time: { value: 0 },
      scrollProgress: { value: 0 },
      grassColor: { value: new THREE.Color(0x3a7a3a) },
      dirtColor: { value: new THREE.Color(0x4a3c31) },
      waterEdgeColor: { value: new THREE.Color(0x2a5a4a) }
    },
    vertexShader: `
      uniform float time;
      uniform float scrollProgress;
      varying vec2 vUv;
      varying vec3 vWorldPosition;
      varying vec3 vNormal;
      varying float vElevation;

      // Simple noise function
      float noise(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
      }

      void main() {
        vUv = uv;

        // Create terrain with slight undulation
        float elevation = sin(vUv.x * 5.0) * 0.1 +
                         cos(vUv.y * 3.0) * 0.08 +
                         sin(vUv.x * 10.0 + vUv.y * 8.0) * 0.05;

        // Scroll-based terrain movement
        elevation += scrollProgress * 0.5;

        vElevation = elevation;

        vec3 newPosition = position;
        newPosition.y += elevation;

        vec4 worldPosition = modelMatrix * vec4(newPosition, 1.0);
        vWorldPosition = worldPosition.xyz;

        // Calculate normal from terrain
        float dx = cos(vUv.x * 5.0) * 0.5;
        float dy = cos(vUv.y * 3.0) * 0.4;
        vec3 normal = normalize(vec3(-dx, 1.0, -dy));
        vNormal = normal;

        gl_Position = projectionMatrix * viewMatrix * worldPosition;
      }
    `,
    fragmentShader: `
      uniform float time;
      uniform vec3 grassColor;
      uniform vec3 dirtColor;
      uniform vec3 waterEdgeColor;
      varying vec2 vUv;
      varying vec3 vWorldPosition;
      varying vec3 vNormal;
      varying float vElevation;

      void main() {
        // Base color interpolation
        vec3 color = mix(dirtColor, grassColor, vElevation + 0.5);

        // Add some variation
        float noise = fract(sin(dot(vUv * 100.0, vec2(12.9898,78.233))) * 43758.5453123);
        color *= 0.9 + noise * 0.2;

        // Subtle grass blade simulation
        float grassBlades = sin(vWorldPosition.x * 50.0) * sin(vWorldPosition.z * 40.0);
        grassBlades = pow(abs(grassBlades), 2.0) * 0.1;
        color += grassColor * grassBlades;

        // Water edge gradient
        float waterEdge = smoothstep(0.3, 0.6, vWorldPosition.z + 5.0);
        color = mix(waterEdgeColor, color, waterEdge);

        // Lighting calculation
        vec3 lightDir = normalize(vec3(0.5, 1.0, 0.3));
        float diffuse = max(dot(vNormal, lightDir), 0.3);
        color *= diffuse;

        // Ambient occlusion simulation
        float ao = 1.0 - smoothstep(0.0, 0.3, vElevation) * 0.2;
        color *= ao;

        // Fresnel effect for grass tips
        vec3 viewDir = normalize(cameraPosition - vWorldPosition);
        float fresnel = pow(1.0 - max(dot(viewDir, vec3(0, 1, 0)), 0.0), 2.0);
        color += fresnel * 0.1 * grassColor;

        // Add some moisture/sunlight highlights
        float highlight = pow(max(dot(vNormal, lightDir), 0.0), 16.0);
        color += vec3(0.1, 0.05, 0.02) * highlight;

        gl_FragColor = vec4(color, 1.0);
      }
    `
  }), [])

  // Create individual grass blades
  const createGrassBlades = () => {
    const blades = []
    const bladePositions = []

    for (let i = 0; i < 5000; i++) {
      bladePositions.push({
        x: (Math.random() - 0.5) * 40,
        z: (Math.random() - 0.5) * 30 - 10,
        height: 0.15 + Math.random() * 0.2,
        width: 0.02 + Math.random() * 0.01,
        bendFactor: Math.random()
      })
    }

    return bladePositions
  }

  const grassBlades = useMemo(createGrassBlades, [])

  // Create blade geometry
  const bladeGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry()
    const vertices = new Float32Array([
      0, 0, 0,
      0.05, 0.2, 0,
      -0.05, 0.2, 0
    ])
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3))
    geometry.computeVertexNormals()
    return geometry
  }, [])

  const terrainMaterial = useMemo(() => new THREE.ShaderMaterial({
    ...terrainShader,
    side: THREE.DoubleSide
  }), [terrainShader])

  useFrame((state) => {
    const time = state.clock.getElapsedTime()

    if (terrainRef.current) {
      terrainRef.current.material.uniforms.time.value = time
      terrainRef.current.material.uniforms.scrollProgress.value = scrollProgress
    }

    // Animate grass blades
    if (grassRef.current) {
      grassRef.current.children.forEach((blade, i) => {
        const data = grassBlades[i]
        if (data) {
          const windStrength = 0.2 + scrollProgress * 0.1
          const wind = Math.sin(time * 2 + data.x + data.bendFactor * 10) * windStrength
          blade.rotation.z = wind
          blade.scale.y = data.height * (0.95 + Math.sin(time * 3 + i * 0.1) * 0.05)
        }
      })
    }
  })

  const grassMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: 0x4a8f4a,
    roughness: 0.9,
    metalness: 0.0,
    side: THREE.DoubleSide
  }), [])

  return (
    <group>
      {/* Main terrain mesh */}
      <mesh
        ref={terrainRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -1.8, 0]}
        scale={[30, 20, 1]}
        material={terrainMaterial}
        receiveShadow
      >
        <planeGeometry args={[1, 1, 128, 128]} />
      </mesh>

      {/* Small grass blade instances */}
      <group ref={grassRef}>
        {grassBlades.slice(0, 500).map((data, i) => (
          <mesh
            key={`grass-${i}`}
            geometry={bladeGeometry}
            material={grassMaterial}
            position={[data.x, -1.6, data.z]}
            scale={[data.width, data.height, 1]}
            receiveShadow
          />
        ))}
      </group>

      {/* Small rocks and pebbles */}
      {Array.from({ length: 50 }).map((_, i) => {
        const position = [
          (Math.random() - 0.5) * 30,
          -1.65 + Math.random() * 0.1,
          (Math.random() - 0.5) * 30 - 10
        ]
        const scale = 0.05 + Math.random() * 0.15

        return (
          <mesh
            key={`rock-${i}`}
            position={position}
            scale={[scale, scale * 0.6, scale]}
            castShadow
            receiveShadow
          >
            <dodecahedronGeometry args={[1, 0]} />
            <meshStandardMaterial
              color={0x6b6b6b}
              roughness={0.9}
              metalness={0.1}
            />
          </mesh>
        )
      })}

      {/* Small vegetation patches */}
      {Array.from({ length: 30 }).map((_, i) => {
        const position = [
          (Math.random() - 0.5) * 25,
          -1.5,
          (Math.random() - 0.5) * 20 - 8
        ]
        const scale = 0.1 + Math.random() * 0.2

        return (
          <group key={`veg-${i}`} position={position}>
            <mesh scale={[scale, scale * 2, scale]} castShadow>
              <cylinderGeometry args={[0.3, 0.1, 1, 6]} />
              <meshStandardMaterial color={0x228B22} roughness={0.8} />
            </mesh>
            <mesh position={[0, scale, 0]} scale={[scale * 1.5, scale * 0.5, scale * 1.5]} castShadow>
              <sphereGeometry args={[1, 8, 8]} />
              <meshStandardMaterial color={0x32CD32} roughness={0.7} />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}