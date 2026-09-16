import { useEffect, useState } from 'react'
import type { TemplateProps } from '../types'
import { SUBJECTS } from '../../../types/shield'
import { ArtifactCard, EmptyState } from '../shared'

// A 2D storybook: one page per artifact, turned with arrows or arrow keys.
export function StoryTemplate({ shield }: TemplateProps) {
  const pages = shield.artifacts
  const [page, setPage] = useState(0)
  const [turn, setTurn] = useState<'next' | 'prev' | null>(null)

  const flip = (dir: 'next' | 'prev') => {
    const target = dir === 'next' ? page + 1 : page - 1
    if (target < 0 || target >= pages.length || turn) return
    setTurn(dir)
    window.setTimeout(() => {
      setPage(target)
      setTurn(null)
    }, 280)
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') flip('next')
      if (e.key === 'ArrowLeft') flip('prev')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pages.length, turn])

  if (pages.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <EmptyState note="Every page of your story is a piece of your work." />
      </div>
    )
  }

  const current = pages[Math.min(page, pages.length - 1)]
  const meta = SUBJECTS[current.subject]

  return (
    <div className="flex h-full flex-col items-center justify-center gap-8 px-10">
      <div
        className="w-full max-w-2xl rounded-2xl border border-white/10 bg-white/[0.04] p-8 shadow-2xl"
        style={{
          transition: 'transform 280ms ease, opacity 280ms ease',
          transformOrigin: turn === 'next' ? 'left center' : 'right center',
          transform: turn ? 'perspective(1200px) rotateY(-14deg) scale(0.97)' : 'none',
          opacity: turn ? 0.4 : 1
        }}
      >
        <p className="mb-3 text-sm" style={{ color: meta.hue }}>
          Chapter {page + 1} &middot; {meta.label}
        </p>
        <ArtifactCard artifact={current} size="lg" />
        {current.caption && current.kind !== 'text' && (
          <p className="mt-4 text-lg leading-relaxed text-white/80">{current.caption}</p>
        )}
      </div>

      <div className="flex items-center gap-6">
        <button
          onClick={() => flip('prev')}
          disabled={page === 0}
          className="rounded-full border border-white/25 px-5 py-2 text-white/70 transition hover:bg-white/10 disabled:opacity-30"
        >
          &larr; Back
        </button>
        <span className="text-sm tabular-nums text-white/40">
          Page {page + 1} of {pages.length}
        </span>
        <button
          onClick={() => flip('next')}
          disabled={page >= pages.length - 1}
          className="rounded-full border border-white/25 px-5 py-2 text-white/70 transition hover:bg-white/10 disabled:opacity-30"
        >
          Next &rarr;
        </button>
      </div>
    </div>
  )
}
