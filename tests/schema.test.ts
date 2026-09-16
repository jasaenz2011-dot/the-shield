import { describe, expect, it } from 'vitest'
import { DEFAULT_CONFIG, resolveConfig } from '../src/config/schema'

describe('resolveConfig', () => {
  it('returns full defaults for a missing config', () => {
    expect(resolveConfig(null)).toEqual(DEFAULT_CONFIG)
    expect(resolveConfig(undefined)).toEqual(DEFAULT_CONFIG)
  })

  it('merges a partial config over defaults', () => {
    const cfg = resolveConfig({ schoolName: 'Stingray Elementary', colors: { primary: '#ff0000' } })
    expect(cfg.schoolName).toBe('Stingray Elementary')
    expect(cfg.colors.primary).toBe('#ff0000')
    // untouched fields keep defaults
    expect(cfg.colors.background).toBe(DEFAULT_CONFIG.colors.background)
    expect(cfg.splash).toEqual(DEFAULT_CONFIG.splash)
  })

  it('keeps the splash slot blank by default', () => {
    expect(resolveConfig({}).splash.video).toBeNull()
  })

  it('accepts a configured splash video with custom timing', () => {
    const cfg = resolveConfig({
      splash: { video: 'splash.mp4', maxSeconds: 5, fadeOutMs: 300, skipAfterFirstRun: false }
    })
    expect(cfg.splash).toEqual({
      video: 'splash.mp4',
      maxSeconds: 5,
      fadeOutMs: 300,
      skipAfterFirstRun: false
    })
  })

  it('falls back to defaults when the config is malformed', () => {
    expect(resolveConfig({ splash: { maxSeconds: -5 } })).toEqual(DEFAULT_CONFIG)
    expect(resolveConfig({ schoolName: 42 })).toEqual(DEFAULT_CONFIG)
    expect(resolveConfig('not an object')).toEqual(DEFAULT_CONFIG)
  })
})
