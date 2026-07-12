import { useMemo } from 'react'
import { getScoreMessage } from '../data/quizData'

export default function ScoreSummary({ score, total, onContinue }) {
  const message = getScoreMessage(score)
  const percentage = (score / total) * 100

  const sparkles = useMemo(() => {
    return Array.from({ length: 25 }, (_, i) => ({
      id: i,
      left: 20 + Math.random() * 60,
      top: 20 + Math.random() * 60,
      size: 4 + Math.random() * 8,
      delay: Math.random() * 1
    }))
  }, [])

  return (
    <div className="score-summary">
      <div className="score-sparkles">
        {sparkles.map((s) => (
          <div
            key={s.id}
            className="score-sparkle"
            style={{
              left: `${s.left}%`,
              top: `${s.top}%`,
              width: `${s.size}px`,
              height: `${s.size}px`,
              animationDelay: `${s.delay}s`
            }}
          />
        ))}
      </div>

      <div className="score-circle" style={{ borderColor: message.color }}>
        <div className="score-circle-inner">
          <span className="score-number">{score}</span>
          <span className="score-total">/{total}</span>
        </div>
      </div>

      <h2 className="score-title" style={{ color: message.color }}>
        {message.title}
      </h2>

      <p className="score-emoji">{message.emoji}</p>

      <p className="score-message">{message.message}</p>

      <div className="score-percentage">
        <span>{percentage}% correct</span>
      </div>

      <button className="score-continue-btn" onClick={onContinue}>
        Continue to Letter
      </button>
    </div>
  )
}
