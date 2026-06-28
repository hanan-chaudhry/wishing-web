import { Suspense } from 'react'
import Scene from './Scene'

export default function SceneCanvas({ isLoaded, scrollProgress }) {
  return (
    <Suspense fallback={null}>
      <Scene isLoaded={isLoaded} scrollProgress={scrollProgress} />
    </Suspense>
  )
}