import { useEffect, useState } from 'react'

/**
 * Simple loading screen that displays a pulsing sun and a text.
 * It fades out once the `onComplete` callback is called.
 */
export default function LoadingScreen({ onComplete }) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    // Simulate loading time – replace with actual asset loading logic if needed.
    const timer = setTimeout(() => {
      setVisible(false)
      onComplete && onComplete()
    }, 3000) // 3 seconds for demo

    return () => clearTimeout(timer)
  }, [onComplete])

  return (
    <div className={
      `loading-screen ${visible ? '' : 'hidden'}`
    }>
      <div className="loading-sun" />
      <div className="loading-text">Loading…</div>
    </div>
  )
}
