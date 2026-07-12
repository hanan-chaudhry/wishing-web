import { useState, useMemo } from 'react'
import { questions } from '../data/quizData'
import ScoreSummary from './ScoreSummary'

export default function QuizScene({ onNavigate }) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [score, setScore] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [quizComplete, setQuizComplete] = useState(false)
  const [answeredCorrectly, setAnsweredCorrectly] = useState(false)

  const particles = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: 2 + Math.random() * 4,
      delay: Math.random() * 5,
      duration: 3 + Math.random() * 4
    }))
  }, [])

  const handleAnswer = (index) => {
    if (showFeedback) return

    setSelectedAnswer(index)
    setShowFeedback(true)

    const isCorrect = index === questions[currentQuestion].correct
    setAnsweredCorrectly(isCorrect)

    if (isCorrect) {
      setScore((prev) => prev + 1)
    }
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1)
      setSelectedAnswer(null)
      setShowFeedback(false)
      setAnsweredCorrectly(false)
    } else {
      setQuizComplete(true)
    }
  }

  const handleContinue = () => {
    onNavigate('letter')
  }

  const getOptionClass = (index) => {
    if (!showFeedback) return ''
    if (index === questions[currentQuestion].correct) return 'correct'
    if (index === selectedAnswer && index !== questions[currentQuestion].correct) return 'incorrect'
    return ''
  }

  return (
    <div className="quiz-scene">
      <div className="quiz-particles">
        {particles.map((p) => (
          <div
            key={p.id}
            className="quiz-particle"
            style={{
              left: `${p.left}%`,
              top: `${p.top}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`
            }}
          />
        ))}
      </div>

      {!quizComplete ? (
        <>
          <div className="quiz-progress">
            <span className="quiz-progress-text">
              Question {currentQuestion + 1} of {questions.length}
            </span>
            <div className="quiz-progress-bar">
              <div
                className="quiz-progress-fill"
                style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
              />
            </div>
            <div className="quiz-score-display">
              Score: {score}
            </div>
          </div>

          <div className={`quiz-card ${showFeedback ? (answeredCorrectly ? 'correct' : 'incorrect') : ''}`}>
            <div className="quiz-question-number">
              Q{currentQuestion + 1}
            </div>
            <h3 className="quiz-question-text">
              {questions[currentQuestion].question}
            </h3>
            <div className="quiz-options">
              {questions[currentQuestion].options.map((option, index) => (
                <button
                  key={index}
                  className={`quiz-option ${getOptionClass(index)} ${
                    selectedAnswer === index ? 'selected' : ''
                  }`}
                  onClick={() => handleAnswer(index)}
                  disabled={showFeedback}
                >
                  <span className="option-letter">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="option-text">{option}</span>
                </button>
              ))}
            </div>

            {showFeedback && (
              <div className="quiz-feedback">
                <p className={`feedback-text ${answeredCorrectly ? 'correct' : 'incorrect'}`}>
                  {answeredCorrectly ? '✓ Correct!' : '✗ Incorrect'}
                </p>
                {!answeredCorrectly && (
                  <div className="feedback-reason">
                    <p className="reason-text">
                      {questions[currentQuestion].reason} &#129217;
                    </p>
                    <p className="correct-answer">
                      Correct answer: <strong>{questions[currentQuestion].options[questions[currentQuestion].correct]}</strong>
                    </p>
                  </div>
                )}
                <button className="quiz-next-btn" onClick={handleNext}>
                  {currentQuestion < questions.length - 1 ? 'Next Question' : 'See Results'}
                </button>
              </div>
            )}
          </div>
        </>
      ) : (
        <ScoreSummary score={score} total={questions.length} onContinue={handleContinue} />
      )}
    </div>
  )
}
