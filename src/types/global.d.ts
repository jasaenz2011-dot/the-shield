import type { ShieldAPI } from '../../electron/preload'

declare global {
  interface Window {
    shieldAPI: ShieldAPI
  }
}

export {}
