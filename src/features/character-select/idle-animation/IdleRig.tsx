import { useEffect, useRef, type ReactNode } from 'react'
import type { Vibe } from '../../../types/shield'
import { VIBES } from './vibes'

// Local idle animation: composes breathing, sway, and bob as a single CSS
// transform driven by requestAnimationFrame. Runs on the compositor with no
// layout work, so it holds 60fps on integrated graphics. When a cloud
// image-to-video idle loop exists (Phase 6), it replaces the child; this rig
// is the always-available offline default.
export function IdleRig({ vibe, children }: { vibe: Vibe; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const params = VIBES[vibe]
    const phase = Math.random() * Math.PI * 2
    let raf = 0

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion) {
      el.style.transform = `rotate(${params.tiltDeg}deg)`
      return
    }

    const tick = () => {
      const t = performance.now() / 1000
      const sway = params.swayDeg * Math.sin(2 * Math.PI * params.swayHz * t + phase)
      const bob = params.bobPx * Math.sin(2 * Math.PI * params.bobHz * t + phase * 0.7)
      const breathe =
        1 + params.breatheScale * Math.sin(2 * Math.PI * params.breatheHz * t + phase * 1.3)
      el.style.transform = `translateY(${bob.toFixed(2)}px) rotate(${(params.tiltDeg + sway).toFixed(3)}deg) scaleY(${breathe.toFixed(4)})`
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [vibe])

  return (
    <div ref={ref} style={{ transformOrigin: '50% 100%', willChange: 'transform' }}>
      {children}
    </div>
  )
}
