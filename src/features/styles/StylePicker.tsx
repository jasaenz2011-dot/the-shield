import { STYLES } from './registry'
import { SampleRoom } from './SampleRoom'

// The gallery: the same sample room re-rendered live in all seven styles,
// mascot included, so students instantly "get" each one.
export function StylePicker({
  currentId,
  onPick,
  onClose
}: {
  currentId: string | null
  onPick: (id: string) => void
  onClose: () => void
}) {
  return (
    <div className="absolute inset-0 z-50 overflow-y-auto bg-black/80 p-10 backdrop-blur-md">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-4xl font-black">Pick your art style</h2>
            <p className="mt-1 text-white/50">
              Same room, seven worlds. Your whole shield takes the look you choose.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg border border-white/25 px-4 py-2 text-sm text-white/70 hover:bg-white/10"
          >
            Close
          </button>
        </div>
        <div className="grid grid-cols-2 gap-5 lg:grid-cols-3 xl:grid-cols-4">
          {STYLES.map((s) => (
            <button
              key={s.id}
              onClick={() => onPick(s.id)}
              className={`group overflow-hidden rounded-2xl border text-left transition hover:-translate-y-1 focus:outline-none ${
                currentId === s.id
                  ? 'border-[var(--shield-primary)] ring-2 ring-[var(--shield-primary)]/40'
                  : 'border-white/10 hover:border-white/30'
              }`}
            >
              <div className="h-40">
                <SampleRoom style={s} />
              </div>
              <div className="bg-white/[0.04] p-3">
                <h3 className="font-black" style={{ fontFamily: s.headingFont }}>
                  {s.name}
                  {currentId === s.id && (
                    <span className="ml-2 text-xs font-normal text-[var(--shield-primary)]">
                      current
                    </span>
                  )}
                </h3>
                <p className="mt-0.5 text-xs text-white/50">{s.tagline}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
