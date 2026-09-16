import { useRef, useState, type DragEvent, type ReactNode } from 'react'
import type { ArtifactRef, Subject } from '../../types/shield'
import { SUBJECTS } from '../../types/shield'
import { importFiles } from './importer'
import { sfx } from '../sound/sound'

interface Props {
  shieldId: string
  onCommit: (artifacts: ArtifactRef[]) => void
  children: ReactNode // the template surface; the whole area accepts drops
}

// Wraps the shield surface: drag-and-drop + "Add work" flow. New files land
// in a tagging tray where the student sets subject + caption before they
// join the shield.
export function IngestPanel({ shieldId, onCommit, children }: Props) {
  const [dragging, setDragging] = useState(false)
  const [busy, setBusy] = useState(false)
  const [tray, setTray] = useState<ArtifactRef[]>([])
  const [skipped, setSkipped] = useState<{ name: string; reason: string }[]>([])
  const dragDepth = useRef(0)

  const ingest = async (files: Iterable<File>) => {
    setBusy(true)
    try {
      const outcome = await importFiles(shieldId, files)
      setTray((t) => [...t, ...outcome.artifacts])
      setSkipped(outcome.skipped)
    } finally {
      setBusy(false)
    }
  }

  const onDrop = (e: DragEvent) => {
    e.preventDefault()
    dragDepth.current = 0
    setDragging(false)
    if (e.dataTransfer.files.length) void ingest(Array.from(e.dataTransfer.files))
  }

  const updateTray = (id: string, patch: Partial<ArtifactRef>) =>
    setTray((t) => t.map((a) => (a.id === id ? { ...a, ...patch } : a)))

  const commit = () => {
    sfx.saved()
    onCommit(tray)
    setTray([])
    setSkipped([])
  }

  return (
    <div
      className="relative h-full"
      onDragEnter={(e) => {
        e.preventDefault()
        dragDepth.current++
        setDragging(true)
      }}
      onDragLeave={() => {
        if (--dragDepth.current <= 0) setDragging(false)
      }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
    >
      {children}

      {/* hidden picker used by the toolbar Add button */}
      <input
        id="ingest-file-input"
        type="file"
        accept="image/*,video/*,audio/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) void ingest(Array.from(e.target.files))
          e.target.value = ''
        }}
      />

      {dragging && (
        <div className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center border-4 border-dashed border-[var(--shield-primary)] bg-black/60 backdrop-blur-sm">
          <p className="text-2xl font-black text-[var(--shield-primary)]">
            Drop your work anywhere
          </p>
        </div>
      )}

      {busy && (
        <div className="absolute bottom-4 left-1/2 z-40 -translate-x-1/2 rounded-full bg-black/70 px-5 py-2 text-sm text-white/80 backdrop-blur-sm">
          Adding your work&hellip;
        </div>
      )}

      {tray.length > 0 && (
        <div className="absolute inset-x-0 bottom-0 z-50 max-h-[55%] overflow-y-auto border-t border-white/15 bg-black/85 p-5 backdrop-blur-md">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-black">
              Tag your work <span className="text-white/40">({tray.length})</span>
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setTray([])
                  setSkipped([])
                }}
                className="rounded-lg border border-white/20 px-4 py-1.5 text-sm text-white/60 hover:bg-white/10"
              >
                Discard
              </button>
              <button
                onClick={commit}
                className="rounded-lg bg-[var(--shield-primary)] px-5 py-1.5 text-sm font-bold text-black hover:brightness-110"
              >
                Add to my shield
              </button>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            {tray.map((a) => (
              <div key={a.id} className="flex items-center gap-4 rounded-xl bg-white/5 p-3">
                <div className="h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-black/50">
                  {a.kind === 'image' && <img src={a.url} alt="" className="h-full w-full object-cover" />}
                  {a.kind === 'video' && <video src={a.url} muted className="h-full w-full object-cover" />}
                  {a.kind === 'audio' && (
                    <div className="flex h-full items-center justify-center text-white/40">&#9834;</div>
                  )}
                </div>
                <input
                  value={a.caption}
                  onChange={(e) => updateTray(a.id, { caption: e.target.value })}
                  placeholder="What is this?"
                  className="min-w-0 flex-1 rounded-lg border border-white/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--shield-primary)]"
                />
                <div className="flex shrink-0 gap-1">
                  {(Object.keys(SUBJECTS) as Subject[]).map((s) => (
                    <button
                      key={s}
                      title={SUBJECTS[s].label}
                      onClick={() => updateTray(a.id, { subject: s })}
                      className={`h-8 w-8 rounded-lg border text-sm transition ${
                        a.subject === s ? 'border-current' : 'border-transparent opacity-40 hover:opacity-80'
                      }`}
                      style={{ color: SUBJECTS[s].hue, background: `color-mix(in srgb, ${SUBJECTS[s].hue} 12%, transparent)` }}
                    >
                      {SUBJECTS[s].icon}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          {skipped.length > 0 && (
            <p className="mt-3 text-xs text-[var(--shield-accent)]">
              Skipped: {skipped.map((s) => `${s.name} (${s.reason})`).join(' · ')}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
