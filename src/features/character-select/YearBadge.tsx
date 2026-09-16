import { useAppStore } from '../../app/store/appStore'

export function YearBadge() {
  const year = useAppStore((s) => s.config.schoolYear)
  return (
    <div className="pointer-events-none inline-flex items-center gap-2 rounded-full border border-[var(--shield-accent)]/50 bg-black/40 px-5 py-1.5 backdrop-blur-sm">
      <span className="h-1.5 w-1.5 rounded-full bg-[var(--shield-accent)]" />
      <span className="text-sm font-bold tracking-[0.3em] text-[var(--shield-accent)]">
        {year}
      </span>
      <span className="h-1.5 w-1.5 rounded-full bg-[var(--shield-accent)]" />
    </div>
  )
}
