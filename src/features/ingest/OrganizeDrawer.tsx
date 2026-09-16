import { useEffect, useState } from 'react'
import type { ArtifactRef, Subject } from '../../types/shield'
import { SUBJECTS } from '../../types/shield'

interface Props {
  artifacts: ArtifactRef[]
  onSave: (artifacts: ArtifactRef[]) => void
  onClose: () => void
}

// Manual arrangement: reorder, retag, recaption, remove. Works on a draft
// copy; nothing touches the document until Save.
export function OrganizeDrawer({ artifacts, onSave, onClose }: Props) {
  const [draft, setDraft] = useState<ArtifactRef[]>(artifacts)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const move = (index: number, dir: -1 | 1) => {
    const target = index + dir
    if (target < 0 || target >= draft.length) return
    const next = [...draft]
    ;[next[index], next[target]] = [next[target], next[index]]
    setDraft(next)
  }

  const patch = (id: string, p: Partial<ArtifactRef>) =>
    setDraft((d) => d.map((a) => (a.id === id ? { ...a, ...p } : a)))

  return (
    <div className="absolute inset-y-0 right-0 z-50 flex w-[26rem] flex-col border-l border-white/15 bg-black/90 backdrop-blur-md">
      <header className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <h3 className="font-black">Organize my work</h3>
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="rounded-lg border border-white/20 px-3 py-1.5 text-sm text-white/60 hover:bg-white/10"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(draft)}
            className="rounded-lg bg-[var(--shield-primary)] px-4 py-1.5 text-sm font-bold text-black hover:brightness-110"
          >
            Save
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-3">
        {draft.length === 0 && (
          <p className="mt-8 text-center text-sm text-white/40">Nothing here yet.</p>
        )}
        <ul className="flex flex-col gap-2">
          {draft.map((a, i) => (
            <li key={a.id} className="rounded-xl bg-white/5 p-3">
              <div className="flex items-start gap-3">
                <div className="h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-black/50">
                  {a.kind === 'image' && <img src={a.url} alt="" className="h-full w-full object-cover" />}
                  {a.kind === 'video' && <video src={a.url} muted className="h-full w-full object-cover" />}
                  {a.kind === 'audio' && (
                    <div className="flex h-full items-center justify-center text-white/40">&#9834;</div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <input
                    value={a.caption}
                    onChange={(e) => patch(a.id, { caption: e.target.value })}
                    className="w-full rounded-lg border border-white/10 bg-transparent px-2 py-1 text-sm outline-none focus:border-[var(--shield-primary)]"
                  />
                  <select
                    value={a.subject}
                    onChange={(e) => patch(a.id, { subject: e.target.value as Subject })}
                    className="mt-1.5 rounded-lg border border-white/10 bg-black px-2 py-1 text-xs text-white/70"
                  >
                    {(Object.keys(SUBJECTS) as Subject[]).map((s) => (
                      <option key={s} value={s}>
                        {SUBJECTS[s].label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex shrink-0 flex-col gap-1">
                  <button
                    onClick={() => move(i, -1)}
                    disabled={i === 0}
                    aria-label="Move up"
                    className="rounded bg-white/10 px-2 py-0.5 text-xs disabled:opacity-25"
                  >
                    &uarr;
                  </button>
                  <button
                    onClick={() => move(i, 1)}
                    disabled={i === draft.length - 1}
                    aria-label="Move down"
                    className="rounded bg-white/10 px-2 py-0.5 text-xs disabled:opacity-25"
                  >
                    &darr;
                  </button>
                  <button
                    onClick={() => setDraft((d) => d.filter((x) => x.id !== a.id))}
                    aria-label="Remove"
                    className="rounded bg-red-500/20 px-2 py-0.5 text-xs text-red-300"
                  >
                    &times;
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
