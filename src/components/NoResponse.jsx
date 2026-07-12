import { useEffect } from 'react'

export default function NoResponse({ onNavigate }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onNavigate('rosebox')
    }, 2000)
    return () => clearTimeout(timer)
  }, [onNavigate])

  return (
    <div className="no-response">
      <p>Lkn mai to donga</p>
      <div className="no-ellipsis">
        <span>.</span><span>.</span><span>.</span>
      </div>
    </div>
  )
}
