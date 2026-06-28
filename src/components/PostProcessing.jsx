import { EffectComposer, Bloom, DepthOfField, Vignette, SMAA } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'

export default function PostProcessing() {
  return (
    <EffectComposer multisampling={0}>
      {/* Soft bloom for glowing highlights */}
      <Bloom
        luminanceThreshold={0.15}
        luminanceSmoothing={0.9}
        height={300}
        opacity={1}
        kernelSize={3}
        blendFunction={BlendFunction.ADD}
      />
      {/* Shallow depth of field for cinematic focus */}
      <DepthOfField
        focusDistance={0.0}
        focalLength={0.02}
        bokehScale={2}
        height={480}
      />
      {/* Vignette to frame the scene */}
      <Vignette eskil={false} offset={0.1} darkness={0.5} />
      {/* SMAA anti-aliasing */}
      <SMAA />
    </EffectComposer>
  )
}