import type { TemplateProps } from '../types'
import { ArtifactCard, EmptyState } from '../shared'

// Start-from-nothing: a clean board showing everything, arranged simply.
// The student's structure, not ours.
export function BlankTemplate({ shield }: TemplateProps) {
  if (shield.artifacts.length === 0) {
    return (
      <div className="flex h-full items-center justify-center">
        <EmptyState note="A blank shield. Whatever you add lands here, ready to arrange." />
      </div>
    )
  }
  return (
    <div className="h-full overflow-y-auto px-12 py-10">
      <div className="columns-2 gap-6 lg:columns-3 [&>*]:mb-6 [&>*]:break-inside-avoid">
        {shield.artifacts.map((a) => (
          <ArtifactCard key={a.id} artifact={a} />
        ))}
      </div>
    </div>
  )
}
