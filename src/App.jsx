import { useState, useEffect, useCallback, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import SceneCanvas from './components/Canvas'
import CameraControls from './components/CameraControls'
import LoadingScreen from './components/LoadingScreen'
import RoseBoxScene from './components/RoseBoxScene'
import TeddyBearScene from './components/TeddyBearScene'
import LetterScene from './components/LetterScene'
import GiftCardScene from './components/GiftCardScene'
import QuizScene from './components/QuizScene'
import './index.css'

/**
 * Main application component.
 * Sets up the Three.js canvas, loading screen, UI overlays, and scroll handling.
 */
export default function App() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [activeScene, setActiveScene] = useState('sunset')
  const [showRoseText, setShowRoseText] = useState(false)

  // Scroll listener to drive scroll‑based animations in the 3D scene.
  const handleScroll = useCallback(() => {
    const scrollY = window.scrollY
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight
    const progress = Math.min(scrollY / maxScroll, 1)
    setScrollProgress(progress)
  }, [])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  // Cursor glow effect follows the mouse pointer.
  useEffect(() => {
    const glow = document.createElement('div')
    glow.className = 'cursor-glow'
    document.body.appendChild(glow)
    const moveGlow = (e) => {
      glow.style.left = `${e.clientX}px`
      glow.style.top = `${e.clientY}px`
    }
    window.addEventListener('mousemove', moveGlow)
    return () => {
      window.removeEventListener('mousemove', moveGlow)
      document.body.removeChild(glow)
    }
  }, [])

  return (
    <>
      {/* Loading overlay – shows until the 3D assets are ready. */}
      <LoadingScreen onComplete={() => setIsLoaded(true)} />

      {/* UI overlay for title and scroll indicator - only in sunset scene */}
      {activeScene === 'sunset' && (
        <div className="ui-overlay">
          <section className="title-section">
            <h1>Happy Birthday Suwat</h1>
            <p>Find 3 suns and then go to next part</p>
          </section>
          <div className="scroll-indicator">
            <span>Scroll</span>
            <div className="arrow" />
          </div>
          <div className="hint-text">Zoom in and zoom out and move in 3d space to take a look at complete scene</div>
        </div>
      )}

      {/* Scene toggle button - hidden in sun and giftcard, visible in other scenes */}
      {activeScene !== 'giftcard' && activeScene !== 'quiz' && (
        <button 
          className={`scene-toggle ${activeScene === 'sunset' ? 'hidden-in-sun' : ''}`}
          onClick={() => {
            if (activeScene === 'sunset') setActiveScene('giftcard')
            else if (activeScene === 'rosebox') setActiveScene('teddy')
            else if (activeScene === 'teddy') setActiveScene('quiz')
            else if (activeScene === 'letter') setActiveScene('sunset')
          }}
        >
          {activeScene === 'sunset' ? 'Next' : activeScene === 'letter' ? 'Back' : 'Next'}
        </button>
      )}

      {/* The Three.js canvas - hidden when letter, giftcard, or quiz scene is active */}
      {activeScene !== 'letter' && activeScene !== 'giftcard' && activeScene !== 'quiz' && (
        <Canvas
          gl={{
            antialias: true,
            alpha: true,
            stencil: false,
            depth: true,
            powerPreference: 'high-performance'
          }}
          shadows={{
            enabled: true,
            type: THREE.PCFSoftShadowMap
          }}
          camera={{ position: [0, 5, 10], fov: 50 }}
          dpr={[1, 2]}
          frameloop="always"
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
        >
          <Suspense fallback={null}>
            {activeScene === 'sunset' && (
              <SceneCanvas isLoaded={isLoaded} scrollProgress={scrollProgress} />
            )}
            {activeScene === 'rosebox' && (
              <RoseBoxScene />
            )}
            {activeScene === 'teddy' && (
              <TeddyBearScene />
            )}
          </Suspense>
          {/* Camera controls – user can orbit/zoom after the initial animation */}
          <CameraControls />
        </Canvas>
      )}

      {/* Letter scene - rendered outside Canvas as HTML/CSS */}
      {activeScene === 'letter' && (
        <LetterScene />
      )}

      {/* Gift card scene - rendered outside Canvas as HTML/CSS */}
      {activeScene === 'giftcard' && (
        <GiftCardScene 
          onNavigate={(scene) => {
            if (scene === 'rosebox') {
              setShowRoseText(true)
              setActiveScene('rosebox')
            }
          }} 
        />
      )}

      {/* Quiz scene - rendered outside Canvas as HTML/CSS */}
      {activeScene === 'quiz' && (
        <QuizScene 
          onNavigate={(scene) => {
            if (scene === 'letter') {
              setActiveScene('letter')
            }
          }} 
        />
      )}

      {/* Rose box scene with text when coming from NO click */}
      {activeScene === 'rosebox' && showRoseText && (
        <div className="rose-text-overlay">
          <p>But I am giving you...</p>
        </div>
      )}
    </>
  )
}

