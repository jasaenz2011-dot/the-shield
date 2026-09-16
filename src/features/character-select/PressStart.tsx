import { sfx } from '../sound/sound'

export function PressStart({ onStart }: { onStart: () => void }) {
  return (
    <button
      onClick={() => {
        sfx.start()
        onStart()
      }}
      autoFocus
      className="group relative rounded-full border-2 border-[var(--shield-primary)] bg-black/50 px-12 py-4 text-xl font-black tracking-[0.35em] text-[var(--shield-primary)] backdrop-blur-sm transition hover:bg-[var(--shield-primary)] hover:text-black focus:outline-none focus-visible:ring-4 focus-visible:ring-[var(--shield-primary)]/40 active:scale-95"
      style={{ animation: 'press-start-pulse 1.6s ease-in-out infinite' }}
    >
      PRESS START
      <style>{`
        @keyframes press-start-pulse {
          0%, 100% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--shield-primary) 45%, transparent); opacity: 1; }
          50% { box-shadow: 0 0 32px 4px color-mix(in srgb, var(--shield-primary) 35%, transparent); opacity: 0.85; }
        }
        @media (prefers-reduced-motion: reduce) {
          button { animation: none !important; }
        }
      `}</style>
    </button>
  )
}
