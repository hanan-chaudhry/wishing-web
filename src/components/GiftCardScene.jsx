import { useState, useEffect } from 'react'
import FloatingParticles from './FloatingParticles'
import YesResponse from './YesResponse'
import NoResponse from './NoResponse'

export default function GiftCardScene({ onNavigate }) {
  const [clicked, setClicked] = useState(null)

  // Auto-reset after YES click - return to original card
  useEffect(() => {
    if (clicked === 'yes') {
      const timer = setTimeout(() => {
        setClicked(null)
      }, 2500)
      return () => clearTimeout(timer)
    }
  }, [clicked])

  return (
    <div className="gift-scene">
      <FloatingParticles />
      <div className={`gift-card ${clicked ? 'card-flipped' : ''}`}>
        {!clicked && (
          <>
            <div className="gift-icon">🎁</div>
            <h2>Gift to ni chahiye naw ??</h2>
            <div className="gift-buttons">
              <button
                className="gift-btn gift-btn-yes"
                onClick={() => setClicked('yes')}
              >
                YES
              </button>
              <button
                className="gift-btn gift-btn-no"
                onClick={() => setClicked('no')}
              >
                NO
              </button>
            </div>
          </>
        )}
        {clicked === 'yes' && <YesResponse />}
        {clicked === 'no' && <NoResponse onNavigate={onNavigate} />}
      </div>
    </div>
  )
}
