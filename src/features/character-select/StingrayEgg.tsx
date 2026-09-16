import { useEffect, useState } from 'react'

const KONAMI = [
  'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
  'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'
]

// School-mascot Easter egg: the Konami code sends a stingray gliding across
// the title screen. Pure CSS transform animation; renders nothing until found.
export function StingrayEgg() {
  const [swimming, setSwimming] = useState(false)

  useEffect(() => {
    let progress = 0
    const onKey = (e: KeyboardEvent) => {
      progress = e.key === KONAMI[progress] ? progress + 1 : e.key === KONAMI[0] ? 1 : 0
      if (progress === KONAMI.length) {
        progress = 0
        setSwimming(true)
        window.setTimeout(() => setSwimming(false), 5200)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  if (!swimming) return null

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute z-40"
      style={{ top: '30%', left: 0, animation: 'stingray-swim 5s ease-in-out forwards' }}
    >
      <svg width="140" height="90" viewBox="0 0 140 90" style={{ filter: 'drop-shadow(0 0 14px var(--shield-primary))' }}>
        <path
          d="M10 45 Q 40 8 70 24 Q 100 8 118 40 Q 122 45 118 50 Q 100 82 70 66 Q 40 82 10 45 Z"
          fill="var(--shield-primary)"
          opacity="0.9"
        />
        <path d="M114 45 Q 138 40 139 45 Q 138 50 114 45 Z" fill="var(--shield-primary)" opacity="0.7" />
        <circle cx="52" cy="38" r="4" fill="#0b0f1a" />
        <circle cx="88" cy="38" r="4" fill="#0b0f1a" />
      </svg>
      <style>{`
        @keyframes stingray-swim {
          0% { transform: translateX(-160px) rotate(-6deg); }
          30% { transform: translateX(30vw) translateY(-40px) rotate(5deg); }
          60% { transform: translateX(62vw) translateY(20px) rotate(-5deg); }
          100% { transform: translateX(110vw) translateY(-20px) rotate(4deg); }
        }
      `}</style>
    </div>
  )
}
