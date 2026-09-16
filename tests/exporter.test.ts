import { afterEach, describe, expect, it, vi } from 'vitest'
import { exportShield } from '../src/features/export/exporter'
import { DEFAULT_CONFIG } from '../src/config/schema'
import { newShieldDocument, type ShieldDocument } from '../src/types/shield'

type ExportArgs = {
  shieldId: string
  html: string
  assets: { from: string; to: string }[]
}

function mockShieldAPI(): { calls: ExportArgs[] } {
  const calls: ExportArgs[] = []
  vi.stubGlobal('window', {
    shieldAPI: {
      exportShield: async (shieldId: string, html: string, assets: ExportArgs['assets']) => {
        calls.push({ shieldId, html, assets })
        return { ok: true, dir: '/tmp/out' }
      }
    }
  })
  return { calls }
}

function fullDoc(): ShieldDocument {
  const doc = newShieldDocument('Avery')
  return {
    ...doc,
    template: 'mansion',
    character: {
      cutoutUrl: `shield://user-assets/${doc.id}/assets/cutout.png`,
      originalUrl: `shield://user-assets/${doc.id}/assets/photo-original.png`,
      vibe: 'cool',
      montageUrls: [`shield://user-assets/${doc.id}/assets/montage-0.png`]
    },
    artifacts: [
      {
        id: 'a1',
        kind: 'image',
        url: `shield://user-assets/${doc.id}/assets/image-a1.jpg`,
        caption: 'Volcano',
        subject: 'science',
        createdAt: '2026-03-01T00:00:00.000Z'
      },
      {
        id: 'a2',
        kind: 'text',
        url: '',
        caption: 'A note',
        subject: 'life',
        createdAt: '2026-04-01T00:00:00.000Z'
      }
    ]
  }
}

afterEach(() => vi.unstubAllGlobals())

describe('exportShield', () => {
  it('rewrites every shield:// URL to a relative assets/ path', async () => {
    const { calls } = mockShieldAPI()
    await exportShield(fullDoc(), DEFAULT_CONFIG)
    const { html, assets } = calls[0]
    expect(html).toContain('assets/cutout.png')
    expect(html).toContain('assets/image-a1.jpg')
    expect(html).not.toContain('shield://')
    expect(assets.map((a) => a.to).sort()).toEqual([
      'assets/cutout.png',
      'assets/image-a1.jpg',
      'assets/montage-0.png'
    ])
  })

  it('never exports the un-cropped original photo', async () => {
    const { calls } = mockShieldAPI()
    await exportShield(fullDoc(), DEFAULT_CONFIG)
    const { html, assets } = calls[0]
    expect(html).not.toContain('photo-original')
    expect(assets.some((a) => a.to.includes('photo-original'))).toBe(false)
  })

  it('leaves non-asset URLs (text artifacts) alone and deduplicates assets', async () => {
    const { calls } = mockShieldAPI()
    const doc = fullDoc()
    // duplicate reference to the same asset
    doc.artifacts.push({ ...doc.artifacts[0], id: 'a3' })
    await exportShield(doc, DEFAULT_CONFIG)
    const tos = calls[0].assets.map((a) => a.to)
    expect(new Set(tos).size).toBe(tos.length)
  })
})
