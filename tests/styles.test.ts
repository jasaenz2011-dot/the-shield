import { describe, expect, it } from 'vitest'
import { DEFAULT_STYLE_ID, STYLES, styleById } from '../src/features/styles/registry'

describe('style registry', () => {
  it('ships exactly the seven planned styles with unique ids', () => {
    expect(STYLES.length).toBe(7)
    expect(new Set(STYLES.map((s) => s.id)).size).toBe(7)
    expect(STYLES.map((s) => s.id)).toContain(DEFAULT_STYLE_ID)
  })

  it('gives every style complete, sane tokens', () => {
    for (const s of STYLES) {
      expect(s.name.length).toBeGreaterThan(0)
      expect(s.tagline.length).toBeGreaterThan(0)
      for (const hex of [s.palette.primary, s.palette.accent, s.palette.glow]) {
        expect(hex).toMatch(/^#[0-9a-f]{6}$/i)
      }
      expect(s.nameMaterial.metalness).toBeGreaterThanOrEqual(0)
      expect(s.nameMaterial.metalness).toBeLessThanOrEqual(1)
      expect(s.nameMaterial.roughness).toBeGreaterThanOrEqual(0)
      expect(s.nameMaterial.roughness).toBeLessThanOrEqual(1)
      expect(s.sceneFilter.length).toBeGreaterThan(0)
      expect(s.headingFont.length).toBeGreaterThan(0)
    }
  })

  it('exactly one style bakes motion into the scene', () => {
    expect(STYLES.filter((s) => s.livelyScene).map((s) => s.id)).toEqual(['animated'])
  })

  it('falls back to the default style for unknown or unset ids', () => {
    expect(styleById(null).id).toBe(DEFAULT_STYLE_ID)
    expect(styleById('nope').id).toBe(DEFAULT_STYLE_ID)
    expect(styleById('cyberpunk').name).toBe('Futuristic')
  })
})
