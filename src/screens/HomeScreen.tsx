import { useEffect, useState } from 'react'
import { useAppStore } from '../app/store/appStore'
import { useShieldStore } from '../app/store/shieldStore'

export function HomeScreen() {
  const { config, logoUrl, setScreen } = useAppStore()
  const { shields, current, refresh, createShield, openShield } = useShieldStore()
  const [name, setName] = useState('')
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    void refresh()
  }, [refresh])

  const handleCreate = async () => {
    if (creating) return
    setCreating(true)
    try {
      await createShield(name)
      setName('')
      setScreen('character')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div
      className="relative flex h-full flex-col items-center justify-center gap-10 overflow-hidden px-8"
      style={{
        background:
          'radial-gradient(1200px 600px at 50% -10%, color-mix(in srgb, var(--shield-secondary) 45%, transparent), transparent), var(--shield-bg)'
      }}
    >
      <header className="flex flex-col items-center gap-3 text-center">
        {logoUrl && <img src={logoUrl} alt="" className="h-16 w-16 object-contain" />}
        <p className="text-sm uppercase tracking-[0.4em] text-[var(--shield-accent)]">
          {config.schoolName} &middot; {config.schoolYear}
        </p>
        <h1
          className="text-7xl font-black tracking-tight"
          style={{
            background:
              'linear-gradient(180deg, var(--shield-fg), var(--shield-primary))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          THE SHIELD
        </h1>
        <p className="max-w-md text-balance text-white/60">
          Your year. Your story. Build a shield that shows everything you learned.
        </p>
      </header>

      <div className="flex w-full max-w-sm flex-col gap-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && void handleCreate()}
          placeholder="Your name"
          className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-center text-lg outline-none transition focus:border-[var(--shield-primary)]"
        />
        <button
          onClick={() => void handleCreate()}
          disabled={creating}
          className="rounded-xl bg-[var(--shield-primary)] px-4 py-3 text-lg font-bold text-black transition hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
        >
          {creating ? 'Creating…' : 'New Shield'}
        </button>
      </div>

      {shields.length > 0 && (
        <section className="w-full max-w-sm">
          <h2 className="mb-2 text-xs uppercase tracking-widest text-white/40">Your shields</h2>
          <ul className="flex max-h-40 flex-col gap-1 overflow-y-auto">
            {shields.map((s) => (
              <li key={s.id}>
                <button
                  onClick={() => void openShield(s.id).then(() => setScreen('character'))}
                  className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition hover:bg-white/10 ${
                    current?.id === s.id
                      ? 'border-[var(--shield-primary)] bg-white/10'
                      : 'border-white/10 bg-white/5'
                  }`}
                >
                  <span className="font-semibold">{s.studentName}</span>
                  <span className="ml-2 text-white/40">
                    {new Date(s.createdAt).toLocaleDateString()}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
