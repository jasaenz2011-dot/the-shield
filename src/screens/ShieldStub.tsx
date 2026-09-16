import { useAppStore } from '../app/store/appStore'
import { useShieldStore } from '../app/store/shieldStore'

// Where PRESS START lands until Phase 3 delivers the template system.
export function ShieldStub() {
  const setScreen = useAppStore((s) => s.setScreen)
  const current = useShieldStore((s) => s.current)

  return (
    <div
      className="flex h-full flex-col items-center justify-center gap-6"
      style={{
        background:
          'radial-gradient(1000px 500px at 50% 110%, color-mix(in srgb, var(--shield-secondary) 40%, transparent), transparent), var(--shield-bg)'
      }}
    >
      <h1 className="text-5xl font-black">
        Welcome, {current?.studentName ?? 'Player'}.
      </h1>
      <p className="max-w-md text-center text-white/60">
        This is where your shield begins &mdash; mansion, world, timeline, or story. Templates
        arrive in Phase 3.
      </p>
      <button
        onClick={() => setScreen('character')}
        className="rounded-xl border border-white/20 px-6 py-3 text-white/70 transition hover:bg-white/10"
      >
        Back to title screen
      </button>
    </div>
  )
}
