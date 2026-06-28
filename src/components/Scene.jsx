import { useRef } from 'react'
import Sky from './Sky'
import Water from './Water'
import Terrain from './Terrain'
import SunflowerField from './SunflowerField'
import EnvironmentEffects from './EnvironmentEffects'
import Lighting from './Lighting'
import PostProcessing from './PostProcessing'

export default function Scene({ isLoaded, scrollProgress }) {
  const sceneRef = useRef()

  return (
    <group ref={sceneRef}>
      <Lighting />
      <Sky isLoaded={isLoaded} />
      <Water scrollProgress={scrollProgress} />
      <Terrain scrollProgress={scrollProgress} />
      <SunflowerField scrollProgress={scrollProgress} />
      <EnvironmentEffects isLoaded={isLoaded} />
      <PostProcessing />
    </group>
  )
}