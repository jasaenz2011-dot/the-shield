import { useEffect } from 'react'
import { useAppStore } from './store/appStore'
import { ThemeProvider } from '../theme/ThemeProvider'
import { SplashScreen } from '../screens/SplashScreen'
import { HomeScreen } from '../screens/HomeScreen'
import { CharacterSelectScreen } from '../features/character-select/CharacterSelectScreen'
import { ShieldScreen } from '../features/editor/ShieldScreen'

export function App() {
  const { screen, configLoaded, loadConfig } = useAppStore()

  useEffect(() => {
    void loadConfig()
  }, [loadConfig])

  if (!configLoaded) {
    return <div className="h-full" style={{ background: 'var(--shield-bg)' }} />
  }

  return (
    <ThemeProvider>
      {screen === 'splash' && <SplashScreen />}
      {screen === 'home' && <HomeScreen />}
      {screen === 'character' && <CharacterSelectScreen />}
      {screen === 'shield' && <ShieldScreen />}
    </ThemeProvider>
  )
}
