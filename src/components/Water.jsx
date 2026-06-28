import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function Water({ scrollProgress }) {
  const waterRef = useRef()
  const particlesRef = useRef()
  const leavesRef = useRef()

  const waterShader = useMemo(() => ({
    uniforms: {
      time: { value: 0 },
      scrollProgress: { value: 0 },
      sunPosition: { value: new THREE.Vector3(0.2, 0.8, 1) },
      moonPosition: { value: new THREE.Vector3(-0.5, 0.6, -0.5) },
      waterColor: { value: new THREE.Color(0x3d7a6b) },
      shallowColor: { value: new THREE.Color(0x5a9e8a) },
      deepColor: { value: new THREE.Color(0x1a4a3e) },
      foamColor: { value: new THREE.Color(0xe8f0e8) },
      sunsetColor: { value: new THREE.Color(0xff6b35) },
      sunGlow: { value: new THREE.Color(0xffa040) },
      moonColor: { value: new THREE.Color(0x87ceeb) }
    },
    vertexShader: `
      uniform float time;
      uniform float scrollProgress;
      varying vec2 vUv;
      varying vec3 vWorldPosition;
      varying vec3 vNormal;
      varying float vElevation;

      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
      }

      float smoothNoise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        float a = hash(i);
        float b = hash(i + vec2(1.0, 0.0));
        float c = hash(i + vec2(0.0, 1.0));
        float d = hash(i + vec2(1.0, 1.0));
        return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
      }

      void main() {
        vUv = uv;

        vec2 flowDir = vec2(0.3, -0.1);
        vec2 st = uv * 6.0 + flowDir * time * 0.3;

        float wave1 = sin(st.x * 1.8 + st.y * 0.6 + time * 0.7) * 0.12;
        float wave2 = cos(st.y * 1.2 - st.x * 0.4 + time * 0.5) * 0.08;
        float wave3 = sin((st.x + st.y) * 1.5 + time * 0.9) * 0.06;
        float wave4 = smoothNoise(st * 0.5 + time * 0.15) * 0.04;

        float scrollWave = sin(uv.x * 5.0 + uv.y * 3.0 + time + scrollProgress * 4.0) * 0.015;

        vElevation = wave1 + wave2 + wave3 + wave4 + scrollWave;

        vec3 newPosition = position;
        newPosition.z += vElevation;

        vec4 worldPosition = modelMatrix * vec4(newPosition, 1.0);
        vWorldPosition = worldPosition.xyz;

        float eps = 0.01;
        float dx = (sin((st.x + eps) * 1.8 + st.y * 0.6 + time * 0.7) * 0.12
                  - sin((st.x - eps) * 1.8 + st.y * 0.6 + time * 0.7) * 0.12) / (2.0 * eps);
        float dy = (cos(st.y * 1.2 - (st.x + eps) * 0.4 + time * 0.5) * 0.08
                  - cos(st.y * 1.2 - (st.x - eps) * 0.4 + time * 0.5) * 0.08) / (2.0 * eps);

        vNormal = normalize(vec3(-dx * 3.0, -dy * 3.0, 1.0));

        gl_Position = projectionMatrix * viewMatrix * worldPosition;
      }
    `,
    fragmentShader: `
      uniform float time;
      uniform float scrollProgress;
      uniform vec3 sunPosition;
      uniform vec3 moonPosition;
      uniform vec3 waterColor;
      uniform vec3 shallowColor;
      uniform vec3 deepColor;
      uniform vec3 foamColor;
      uniform vec3 sunsetColor;
      uniform vec3 sunGlow;
      uniform vec3 moonColor;
      varying vec2 vUv;
      varying vec3 vWorldPosition;
      varying vec3 vNormal;
      varying float vElevation;

      void main() {
        vec3 viewDir = normalize(cameraPosition - vWorldPosition);
        vec3 normal = normalize(vNormal);
        float fresnel = pow(1.0 - max(dot(viewDir, normal), 0.0), 4.0);

        float depthFactor = smoothstep(-0.15, 0.15, vElevation);
        vec3 baseColor = mix(shallowColor, deepColor, depthFactor);
        baseColor = mix(baseColor, waterColor, 0.5);

        vec3 reflectDir = reflect(-normalize(sunPosition), normal);
        float spec = pow(max(dot(viewDir, reflectDir), 0.0), 256.0);
        vec3 sunSpec = sunGlow * spec * 3.0;

        float sunSpread = pow(max(dot(viewDir, reflectDir), 0.0), 32.0);
        vec3 sunSpreadColor = sunsetColor * sunSpread * 0.6;

        vec3 moonReflectDir = reflect(-normalize(moonPosition), normal);
        float moonSpec = pow(max(dot(viewDir, moonReflectDir), 0.0), 64.0);
        vec3 moonReflection = moonColor * moonSpec * 0.2;

        float sunPath = pow(max(dot(normal, -normalize(sunPosition)), 0.0), 6.0);
        vec3 pathColor = sunsetColor * sunPath * 0.4;
        vec3 pathGlow = sunGlow * sunPath * 0.2;

        float skyReflect = pow(fresnel, 0.6);
        vec3 reflectedSky = mix(deepColor, sunsetColor, skyReflect * 0.5);
        reflectedSky = mix(reflectedSky, vec3(1.0, 0.7, 0.4), skyReflect * 0.2);

        float caustics = abs(sin(vUv.x * 18.0 + vUv.y * 12.0 + time * 0.8));
        caustics *= abs(cos(vUv.y * 14.0 - vUv.x * 10.0 + time * 0.6));
        caustics = pow(caustics, 2.0) * 0.12;

        float distFromCenter = length(vUv - 0.5) * 2.0;
        float foamEdge = smoothstep(0.8, 0.95, distFromCenter);
        vec3 foam = foamColor * foamEdge * 0.4;

        float surfaceNoise = sin(vUv.x * 40.0 + vUv.y * 30.0 + time * 0.4);
        surfaceNoise *= sin(vUv.y * 35.0 - vUv.x * 25.0 + time * 0.3);
        vec3 surfaceVariation = vec3(surfaceNoise * 0.03);

        vec3 finalColor = baseColor;
        finalColor *= (1.0 + caustics);
        finalColor += surfaceVariation;
        finalColor += sunSpec;
        finalColor += sunSpreadColor;
        finalColor += moonReflection;
        finalColor += pathColor;
        finalColor += pathGlow;
        finalColor += reflectedSky;
        finalColor += foam;

        float shimmer = sin(vWorldPosition.x * 12.0 + time * 2.5) *
                        cos(vWorldPosition.z * 10.0 + time * 1.8);
        finalColor += vec3(0.02, 0.015, 0.005) * shimmer;

        float warmMix = 0.3 + fresnel * 0.4;
        finalColor = mix(finalColor, finalColor * vec3(1.15, 0.95, 0.8), warmMix * 0.3);

        gl_FragColor = vec4(finalColor, 0.92);
      }
    `
  }), [])

  const createLeaves = () => {
    const leaves = []
    for (let i = 0; i < 40; i++) {
      leaves.push({
        position: new THREE.Vector3(
          (Math.random() - 0.5) * 30,
          0.15,
          (Math.random() - 0.5) * 20
        ),
        rotation: new THREE.Euler(
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2,
          Math.random() * Math.PI * 2
        ),
        scale: 0.25 + Math.random() * 0.25,
        speed: 0.2 + Math.random() * 0.15,
        wobble: Math.random() * Math.PI * 2
      })
    }
    return leaves
  }

  const leavesData = useMemo(createLeaves, [])

  const createParticles = () => {
    const particles = []
    for (let i = 0; i < 150; i++) {
      particles.push({
        position: new THREE.Vector3(
          (Math.random() - 0.5) * 30,
          0.05 + Math.random() * 0.1,
          (Math.random() - 0.5) * 20
        ),
        speed: 0.3 + Math.random() * 0.3,
        size: 0.015 + Math.random() * 0.025
      })
    }
    return particles
  }

  const particlesData = useMemo(createParticles, [])

  const waterMaterial = useMemo(() => new THREE.ShaderMaterial(waterShader), [waterShader])

  useFrame((state) => {
    const time = state.clock.getElapsedTime()

    if (waterRef.current) {
      waterRef.current.material.uniforms.time.value = time
      waterRef.current.material.uniforms.scrollProgress.value = scrollProgress
    }

    if (leavesRef.current) {
      leavesRef.current.children.forEach((leaf, i) => {
        const data = leavesData[i]
        if (data) {
          leaf.position.x = ((data.position.x + time * data.speed * 0.8) % 30 + 30) % 30 - 15
          leaf.position.z = ((data.position.z + time * data.speed * 0.3) % 20 + 20) % 20 - 10
          leaf.rotation.z += 0.008
          leaf.rotation.x = data.rotation.x + Math.sin(time + data.wobble) * 0.08
          leaf.rotation.y = data.rotation.y + Math.cos(time * 0.7 + data.wobble) * 0.08
          leaf.position.y = 0.12 + Math.sin(time * 1.8 + data.wobble) * 0.015
        }
      })
    }

    if (particlesRef.current) {
      const positions = particlesRef.current.geometry.attributes.position.array
      particlesData.forEach((p, i) => {
        const idx = i * 3
        positions[idx] = ((p.position.x + time * p.speed * 0.6) % 30 + 30) % 30 - 15
        positions[idx + 2] = ((p.position.z + time * p.speed * 0.2) % 20 + 20) % 20 - 10
        positions[idx + 1] = p.position.y + Math.sin(time * 2.5 + i) * 0.015
      })
      particlesRef.current.geometry.attributes.position.needsUpdate = true
    }
  })

  const leafGeometry = useMemo(() => new THREE.PlaneGeometry(0.25, 0.12, 1, 1), [])

  return (
    <group>
      <mesh
        ref={waterRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 5]}
        scale={[30, 20, 1]}
        material={waterMaterial}
        receiveShadow
      >
        <planeGeometry args={[1, 1, 256, 256]} />
      </mesh>

      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.005, 5]}
        scale={[30.2, 20.2, 1]}
      >
        <planeGeometry args={[1, 1, 64, 64]} />
        <meshBasicMaterial
          color={0x1a4a3e}
          transparent
          opacity={0.2}
          depthWrite={false}
        />
      </mesh>

      <group ref={leavesRef}>
        {leavesData.map((data, i) => (
          <mesh
            key={i}
            geometry={leafGeometry}
            position={data.position}
            scale={[data.scale, data.scale, data.scale]}
            receiveShadow
          >
            <meshStandardMaterial
              color={0x2d5a1a}
              roughness={0.8}
              metalness={0.1}
              side={THREE.DoubleSide}
            />
          </mesh>
        ))}
      </group>

      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particlesData.length}
            array={new Float32Array(particlesData.flatMap(p => [
              p.position.x, p.position.y, p.position.z
            ]))}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-size"
            count={particlesData.length}
            array={new Float32Array(particlesData.map(p => p.size))}
            itemSize={1}
          />
        </bufferGeometry>
        <pointsMaterial
          color={0xfff7e6}
          transparent
          opacity={0.5}
          size={0.015}
          sizeAttenuation
          depthWrite={false}
        />
      </points>
    </group>
  )
}
