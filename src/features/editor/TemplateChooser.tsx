import { TEMPLATES } from '../templates/registry'
import { sfx } from '../sound/sound'

export function TemplateChooser({
  onPick,
  switching
}: {
  onPick: (id: string) => void
  switching: boolean
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-10 overflow-y-auto px-10 py-12">
      <header className="text-center">
        <h2 className="text-5xl font-black tracking-tight">
          {switching ? 'Switch your shield’s shape' : 'Choose your shield’s shape'}
        </h2>
        <p className="mt-2 text-white/50">
          {switching
            ? 'Your work comes with you — nothing is lost.'
            : 'This is YOUR presentation. Pick a structure — or a blank canvas.'}
        </p>
      </header>
      <div className="grid w-full max-w-5xl grid-cols-2 gap-5 lg:grid-cols-3">
        {TEMPLATES.map((t) => (
          <button
            key={t.id}
            onClick={() => {
              sfx.tick()
              onPick(t.id)
            }}
            className="group overflow-hidden rounded-2xl border border-white/10 text-left transition hover:-translate-y-1 hover:border-[var(--shield-primary)] focus:outline-none focus-visible:border-[var(--shield-primary)]"
          >
            <div
              className="flex h-36 items-center justify-center text-5xl text-white/70 transition duration-500 group-hover:scale-105"
              style={{ background: t.previewCss }}
            >
              {t.icon}
            </div>
            <div className="bg-white/[0.04] p-4">
              <h3 className="font-black">{t.name}</h3>
              <p className="mt-1 text-sm text-white/50">{t.tagline}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
