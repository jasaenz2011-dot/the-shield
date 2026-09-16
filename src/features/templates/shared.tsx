import type { ArtifactRef } from '../../types/shield'
import { SUBJECTS } from '../../types/shield'

// A single piece of student work, rendered consistently across templates.
export function ArtifactCard({
  artifact,
  size = 'md'
}: {
  artifact: ArtifactRef
  size?: 'sm' | 'md' | 'lg'
}) {
  const heights = { sm: 'h-28', md: 'h-44', lg: 'h-72' }
  const subject = SUBJECTS[artifact.subject]
  return (
    <figure className="group overflow-hidden rounded-xl border border-white/10 bg-black/30 backdrop-blur-sm">
      <div className={`${heights[size]} w-full overflow-hidden bg-black/40`}>
        {artifact.kind === 'image' && artifact.url && (
          <img
            src={artifact.url}
            alt={artifact.caption}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            loading="lazy"
          />
        )}
        {artifact.kind === 'video' && artifact.url && (
          <video src={artifact.url} muted loop autoPlay playsInline className="h-full w-full object-cover" />
        )}
        {artifact.kind === 'audio' && artifact.url && (
          <div className="flex h-full items-center justify-center px-4">
            <audio src={artifact.url} controls className="w-full" />
          </div>
        )}
        {artifact.kind === 'text' && (
          <div className="flex h-full items-center justify-center p-4 text-center text-white/80">
            {artifact.caption}
          </div>
        )}
      </div>
      {artifact.kind !== 'text' && (
        <figcaption className="flex items-center gap-2 px-3 py-2 text-sm">
          <span style={{ color: subject.hue }}>{subject.icon}</span>
          <span className="truncate text-white/80">{artifact.caption || subject.label}</span>
        </figcaption>
      )}
    </figure>
  )
}

export function EmptyState({ note }: { note: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-white/15 bg-white/[0.03] px-10 py-12 text-center">
      <p className="text-white/50">{note}</p>
      <p className="text-xs text-white/30">Add work from the toolbar above.</p>
    </div>
  )
}

export function bySubject(artifacts: ArtifactRef[]): Map<string, ArtifactRef[]> {
  const map = new Map<string, ArtifactRef[]>()
  for (const a of artifacts) {
    const list = map.get(a.subject) ?? []
    list.push(a)
    map.set(a.subject, list)
  }
  return map
}
