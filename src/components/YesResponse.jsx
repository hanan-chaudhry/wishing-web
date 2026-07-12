import { useMemo } from 'react'

export default function YesResponse() {
  const sparkles = useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => ({
      id: i,
      left: 30 + Math.random() * 40,
      top: 20 + Math.random() * 60,
      size: 4 + Math.random() * 8,
      delay: Math.random() * 0.5
    }))
  }, [])

  return (
    <div className="yes-response">
      {sparkles.map((s) => (
        <div
          key={s.id}
          className="sparkle"
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            animationDelay: `${s.delay}s`
          }}
        />
      ))}
      <h3>Mai hi sabse bhara gift hon uh k lye</h3>
      <p className="yes-subtitle">Bas bas shukriya ki koi zaroorat ni &#128526;</p>
    </div>
  )
}
