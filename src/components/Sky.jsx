import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function Sky({ isLoaded }) {
  const skyMeshRef = useRef()
  const sunMeshRef = useRef()
  const moonMeshRef = useRef()
  const cloudsRef = useRef()

  // Create sunset sky gradient shader
  const skyShader = useMemo(() => ({
    uniforms: {
      topColor: { value: new THREE.Color(0x1a0a2e) },      // Deep purple at top
      horizonColor: { value: new THREE.Color(0xff6b35) },   // Orange at horizon
      sunPosition: { value: new THREE.Vector3(0, 0.2, 1) },
      time: { value: 0 }
    },
    vertexShader: `
      varying vec3 vWorldPosition;
      void main() {
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 topColor;
      uniform vec3 horizonColor;
      uniform vec3 sunPosition;
      uniform float time;
      varying vec3 vWorldPosition;

      void main() {
        // Calculate gradient based on y position
        float y = normalize(vWorldPosition).y;
        float gradient = smoothstep(-0.2, 0.5, y);

        // Base sky color
        vec3 skyColor = mix(horizonColor, topColor, gradient);

        // Add sunset glow near horizon
        float sunsetGlow = smoothstep(-0.1, 0.3, y) * smoothstep(0.5, 0.2, y);
        vec3 sunsetColor = vec3(1.0, 0.4, 0.2);
        skyColor = mix(skyColor, sunsetColor, sunsetGlow * 0.3);

        // Sun glow
        vec3 sunDir = normalize(sunPosition);
        vec3 viewDir = normalize(vWorldPosition);
        float sunDot = dot(viewDir, sunDir);
        float sunGlow = pow(max(sunDot, 0.0), 32.0);

        // Sun core
        float sunCore = pow(max(sunDot - 0.98, 0.0), 8.0) * 50.0;

        // Sun rays
        float sunRays = pow(max(sunDot - 0.9, 0.0), 4.0) * 2.0;

        // Combine effects
        vec3 sunColor = vec3(1.0, 0.7, 0.3);
        skyColor += sunColor * sunGlow * 2.0;
        skyColor += sunColor * sunCore * 1.5;
        skyColor += sunColor * sunRays * 0.5;

        // Atmospheric haze
        float haze = smoothstep(0.0, 0.15, y) * smoothstep(0.4, 0.1, y);
        vec3 hazeColor = vec3(0.4, 0.3, 0.2);
        skyColor = mix(skyColor, hazeColor, haze * 0.2);

        gl_FragColor = vec4(skyColor, 1.0);
      }
    `
  }), [])

  // Create sky dome material
  const skyMaterial = useMemo(() => new THREE.ShaderMaterial({
    ...skyShader,
    side: THREE.BackSide
  }), [skyShader])

  // Create sun material
  const sunMaterial = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 },
      coreColor: { value: new THREE.Color(0xffffff) },
      glowColor: { value: new THREE.Color(0xFFA500) }
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vNormal;
      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float time;
      uniform vec3 coreColor;
      uniform vec3 glowColor;
      varying vec2 vUv;
      varying vec3 vNormal;

      void main() {
        // Create glowing sun effect
        vec2 center = vec2(0.5);
        float dist = distance(vUv, center);

        // Subtle pulsating effect
        float pulse = 1.0 + sin(time * 2.0) * 0.05;

        // Core brightness
        float core = 1.0 - smoothstep(0.0, 0.3 * pulse, dist);

        // Outer glow
        float glow = 1.0 - smoothstep(0.2, 0.5 * pulse, dist);
        glow = pow(glow, 2.0);

        // Intense rim
        float rim = 1.0 - smoothstep(0.3 * pulse, 0.4, dist);
        rim = pow(rim, 3.0);

        vec3 finalColor = coreColor * core * 2.0;
        finalColor += glowColor * glow * 1.5;
        finalColor += glowColor * rim * 2.0;

        // Add warmth
        finalColor *= vec3(1.0, 0.95, 0.9);

        gl_FragColor = vec4(finalColor, glow);
      }
    `,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide
  }), [])

  // Create moon material
  const moonMaterial = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 }
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vNormal;
      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float time;
      varying vec2 vUv;
      varying vec3 vNormal;

      void main() {
        // Moon base color (silver-white)
        vec3 moonColor = vec3(0.95, 0.95, 1.0);

        // Moon glow
        vec2 center = vec2(0.5);
        float dist = distance(vUv, center);
        float glow = 1.0 - smoothstep(0.3, 0.5, dist);

        // Subtle surface variation (craters simulation)
        float noise = sin(vUv.x * 20.0 + time * 0.1) * 0.05;
        noise += sin(vUv.y * 15.0) * 0.05;
        moonColor += noise;

        // Ambient glow
        vec3 ambientGlow = vec3(0.6, 0.7, 0.9) * glow * 0.3;

        vec3 finalColor = moonColor + ambientGlow;

        gl_FragColor = vec4(finalColor, glow);
      }
    `,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide
  }), [])

  useFrame((state) => {
    const time = state.clock.getElapsedTime()

    if (skyMeshRef.current) {
      skyMeshRef.current.material.uniforms.time.value = time
    }

    if (sunMeshRef.current) {
      sunMeshRef.current.material.uniforms.time.value = time
    }

    if (moonMeshRef.current) {
      moonMeshRef.current.material.uniforms.time.value = time
    }
  })

  return (
    <group>
      {/* Sky dome */}
      <mesh ref={skyMeshRef} scale={[100, 100, 100]} material={skyMaterial}>
        <sphereGeometry args={[1, 64, 32]} />
      </mesh>

      {/* Sun */}
      <group position={[0, 12, 15]} visible={isLoaded}>
        <mesh ref={sunMeshRef} scale={[2.5, 2.5, 1]}>
          <planeGeometry args={[2, 2]} />
          <primitive object={sunMaterial} />
        </mesh>

        {/* Sun halo */}
        <mesh scale={[4, 4, 1]} position={[0.1, 0.1, -0.1]}>
          <planeGeometry args={[2, 2]} />
          <meshBasicMaterial
            color={0xffa500}
            transparent
            opacity={0.15}
            depthWrite={false}
          />
        </mesh>

        {/* Outer glow rings */}
        {[2, 3, 4].map((size, i) => (
          <mesh
            key={i}
            scale={[5 + size * 1.5, 5 + size * 1.5, 1]}
            position={[size * 0.05, size * 0.05, -size * 0.1]}
          >
            <ringGeometry args={[0.4, 0.5, 64]} />
            <meshBasicMaterial
              color={0xffa500}
              transparent
              opacity={0.1 / size}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>
        ))}
      </group>

      {/* Moon */}
      <group position={[-8, 10, -8]} visible={isLoaded}>
        <mesh ref={moonMeshRef} scale={[1.2, 1.2, 1]}>
          <circleGeometry args={[1, 32]} />
          <primitive object={moonMaterial} />
        </mesh>

        {/* Moon glow */}
        <mesh scale={[2, 2, 1]} position={[-0.1, 0.1, -0.1]}>
          <planeGeometry args={[2, 2]} />
          <meshBasicMaterial
            color={0x87ceeb}
            transparent
            opacity={0.1}
            depthWrite={false}
          />
        </mesh>
      </group>

      {/* Atmospheric fog glow near horizon */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
        <planeGeometry args={[200, 200]} />
        <meshBasicMaterial
          color={0xff6b35}
          transparent
          opacity={0.15}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}