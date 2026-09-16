import { useState } from 'react'
import { isMuted, setMuted } from './sound'

export function MuteButton({ className = '' }: { className?: string }) {
  const [muted, set] = useState(isMuted())
  return (
    <button
      onClick={() => {
        setMuted(!muted)
        set(!muted)
      }}
      aria-label={muted ? 'Turn sound on' : 'Turn sound off'}
      title={muted ? 'Sound off' : 'Sound on'}
      className={`rounded-lg bg-black/40 px-3 py-1.5 text-xs backdrop-blur-sm transition ${
        muted ? 'text-white/30' : 'text-white/60'
      } hover:text-white ${className}`}
    >
      {muted ? '\u{1F507}' : '\u{1F50A}'}
    </button>
  )
}
