import { useEffect, type ReactNode } from 'react'
import { useAppStore } from '../app/store/appStore'

// Pushes school colors from config onto CSS custom properties so both
// Tailwind utilities and plain CSS pick up the theme with no rebuild.
export function ThemeProvider({ children }: { children: ReactNode }) {
  const colors = useAppStore((s) => s.config.colors)

  useEffect(() => {
    const root = document.documentElement.style
    root.setProperty('--shield-primary', colors.primary)
    root.setProperty('--shield-secondary', colors.secondary)
    root.setProperty('--shield-accent', colors.accent)
    root.setProperty('--shield-bg', colors.background)
    root.setProperty('--shield-fg', colors.foreground)
  }, [colors])

  return <>{children}</>
}
