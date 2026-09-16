import { useEffect, useRef } from 'react'
import type { TemplateProps } from '../types'
import { SUBJECTS, type Subject } from '../../../types/shield'
import { ArtifactCard, EmptyState, bySubject } from '../shared'

// Single scrolling cinematic page: one full-bleed section per subject,
// revealed with an IntersectionObserver-driven fade/rise (CSS only).
export function ScrollTemplate({ shield }: TemplateProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const groups = bySubject(shield.artifacts)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) e.target.classList.add('scroll-revealed')
        }
      },
      { root, threshold: 0.25 }
    )
    root.querySelectorAll('[data-reveal]').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [shield.artifacts])

  return (
    <div ref={rootRef} className="h-full snap-y snap-proximity overflow-y-auto scroll-smooth">
      <style>{`
        [data-reveal] { opacity: 0; transform: translateY(28px); transition: opacity 700ms ease, transform 700ms ease; }
        .scroll-revealed { opacity: 1 !important; transform: none !important; }
        @media (prefers-reduced-motion: reduce) { [data-reveal] { opacity: 1; transform: none; transition: none; } }
      `}</style>

      {/* opening frame */}
      <section className="flex h-full snap-start flex-col items-center justify-center gap-4 px-8 text-center">
        <h2 className="text-6xl font-black tracking-tight" data-reveal>
          {shield.studentName}&rsquo;s Year
        </h2>
        <p className="text-white/50" data-reveal>
          Scroll to travel through it.
        </p>
        <div className="mt-8 animate-bounce text-2xl text-white/40" aria-hidden>
          &darr;
        </div>
      </section>

      {shield.artifacts.length === 0 && (
        <section className="flex h-full snap-start items-center justify-center">
          <EmptyState note="Your story starts when you add your first piece of work." />
        </section>
      )}

      {(Object.keys(SUBJECTS) as Subject[]).map((subject) => {
        const items = groups.get(subject)
        if (!items?.length) return null
        const meta = SUBJECTS[subject]
        return (
          <section
            key={subject}
            className="flex min-h-full snap-start flex-col justify-center gap-8 px-16 py-16"
            style={{
              background: `radial-gradient(800px 400px at 15% 20%, color-mix(in srgb, ${meta.hue} 16%, transparent), transparent)`
            }}
          >
            <div data-reveal>
              <span className="text-xl" style={{ color: meta.hue }}>
                {meta.icon}
              </span>
              <h3 className="mt-1 text-5xl font-black">{meta.label}</h3>
            </div>
            <div className="grid grid-cols-2 gap-6 lg:grid-cols-3" data-reveal>
              {items.map((a) => (
                <ArtifactCard key={a.id} artifact={a} />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
