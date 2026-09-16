import { useEffect, useState } from 'react'

const CYCLE_MS = 6000
const FADE_MS = 1600

function isVideo(url: string): boolean {
  return /\.(mp4|webm|mov)(\?|$)/i.test(url)
}

// Personality montage behind the character: low opacity, heavy blur, slow
// Ken Burns drift, lazy crossfades. Only the current and previous items are
// mounted, so cost stays flat however many uploads exist.
export function MontageBackground({ urls, sceneFilter }: { urls: string[]; sceneFilter?: string }) {
  const [index, setIndex] = useState(0)

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  useEffect(() => {
    if (urls.length < 2 || reduceMotion) return
    const id = window.setInterval(() => setIndex((i) => (i + 1) % urls.length), CYCLE_MS)
    return () => window.clearInterval(id)
  }, [urls.length, reduceMotion])

  if (urls.length === 0) {
    return (
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(900px 500px at 50% 20%, color-mix(in srgb, var(--shield-secondary) 50%, transparent), transparent), var(--shield-bg)'
        }}
      />
    )
  }

  const prev = (index - 1 + urls.length) % urls.length

  return (
    <div className="absolute inset-0 overflow-hidden bg-black">
      {urls.map((url, i) => {
        const active = i === index
        if (!active && i !== prev) return null
        const media = isVideo(url) ? (
          <video
            src={url}
            autoPlay
            muted
            loop
            playsInline
            className="h-full w-full object-cover"
          />
        ) : (
          <img src={url} alt="" className="h-full w-full object-cover" />
        )
        return (
          <div
            key={url}
            className="absolute inset-0 transition-opacity ease-in-out"
            style={{
              opacity: active ? 0.35 : 0,
              transitionDuration: `${FADE_MS}ms`,
              filter: `blur(14px) saturate(1.1) ${sceneFilter ?? ''}`,
              transform: 'scale(1.12)',
              animation:
                active && !reduceMotion ? `montage-drift ${CYCLE_MS + FADE_MS}ms linear` : undefined
            }}
          >
            {media}
          </div>
        )
      })}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/50" />
      <style>{`@keyframes montage-drift { from { transform: scale(1.12) translateX(-0.6%); } to { transform: scale(1.17) translateX(0.6%); } }`}</style>
    </div>
  )
}
