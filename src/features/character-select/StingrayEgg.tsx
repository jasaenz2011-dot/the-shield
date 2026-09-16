import { useEffect, useState } from 'react'
import { Stingray } from '../styles/Stingray'

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
      <div style={{ filter: 'drop-shadow(0 0 14px var(--shield-primary))' }}>
        <Stingray color="var(--shield-primary)" size={140} />
      </div>
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
