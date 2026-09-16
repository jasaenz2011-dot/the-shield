import { create } from 'zustand'
import { DEFAULT_CONFIG, resolveConfig, type SchoolConfig } from '../../config/schema'

export type Screen = 'splash' | 'home'

interface AppState {
  screen: Screen
  config: SchoolConfig
  splashVideoUrl: string | null
  logoUrl: string | null
  configLoaded: boolean
  loadConfig: () => Promise<void>
  setScreen: (screen: Screen) => void
}

export const useAppStore = create<AppState>((set) => ({
  screen: 'splash',
  config: DEFAULT_CONFIG,
  splashVideoUrl: null,
  logoUrl: null,
  configLoaded: false,

  loadConfig: async () => {
    try {
      const payload = await window.shieldAPI.getSchoolConfig()
      set({
        config: resolveConfig(payload.raw),
        splashVideoUrl: payload.splashVideoUrl,
        logoUrl: payload.logoUrl,
        configLoaded: true
      })
    } catch {
      set({ config: DEFAULT_CONFIG, configLoaded: true })
    }
  },

  setScreen: (screen) => set({ screen })
}))
