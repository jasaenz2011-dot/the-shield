import { useEffect, useMemo, useState } from 'react'
import type { TemplateProps } from '../types'
import { SUBJECTS } from '../../../types/shield'
import { ArtifactCard, EmptyState } from '../shared'

const PLAY_MS = 4000

// The year as a horizontal track of moments; play mode walks through them.
export function TimelineTemplate({ shield, presentMode }: TemplateProps) {
  const items = useMemo(
    () => [...shield.artifacts].sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    [shield.artifacts]
  )
  const [index, setIndex] = useState(0)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    if (!playing || items.length === 0) return
    const id = window.setInterval(
      () => setIndex((i) => (i + 1 < items.length ? i + 1 : (setPlaying(false), i))),
      PLAY_MS
    )
    return () => window.clearInterval(id)
  }, [playing, items.length])

  useEffect(() => {
    if (presentMode && items.length > 1) setPlaying(true)
  }, [presentMode, items.length])

  if (items.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <EmptyState note="Your timeline will grow as you add work through the year." />
      </div>
    )
  }

  const current = items[Math.min(index, items.length - 1)]
  const meta = SUBJECTS[current.subject]

  return (
    <div className="flex h-full flex-col items-center justify-center gap-10 px-10">
      <div key={current.id} className="w-full max-w-2xl" style={{ animation: 'tl-in 500ms ease' }}>
        <style>{`@keyframes tl-in { from { opacity: 0; transform: translateX(24px);} to { opacity: 1; transform: none; } }
          @media (prefers-reduced-motion: reduce) { [data-tl] { animation: none !important; } }`}</style>
        <div data-tl>
          <p className="mb-2 text-sm text-white/40">
            {new Date(current.createdAt).toLocaleDateString(undefined, {
              month: 'long',
              year: 'numeric'
            })}
            <span className="mx-2" style={{ color: meta.hue }}>
              {meta.icon} {meta.label}
            </span>
          </p>
          <ArtifactCard artifact={current} size="lg" />
        </div>
      </div>

      {/* track */}
      <div className="flex w-full max-w-3xl items-center gap-3">
        <button
          onClick={() => setPlaying((p) => !p)}
          className="rounded-full border border-white/25 px-4 py-1.5 text-sm text-white/70 transition hover:bg-white/10"
        >
          {playing ? 'Pause' : 'Play my year'}
        </button>
        <div className="relative h-1 flex-1 rounded bg-white/10">
          {items.map((a, i) => (
            <button
              key={a.id}
              onClick={() => {
                setIndex(i)
                setPlaying(false)
              }}
              aria-label={a.caption || `Moment ${i + 1}`}
              className="absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full border-2 transition hover:scale-125"
              style={{
                left: `${items.length === 1 ? 50 : (i / (items.length - 1)) * 100}%`,
                transform: 'translate(-50%, -50%)',
                borderColor: SUBJECTS[a.subject].hue,
                background: i === index ? SUBJECTS[a.subject].hue : 'var(--shield-bg)'
              }}
            />
          ))}
        </div>
        <span className="text-sm tabular-nums text-white/40">
          {index + 1}/{items.length}
        </span>
      </div>
    </div>
  )
}
