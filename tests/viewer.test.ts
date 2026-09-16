import { describe, expect, it } from 'vitest'
import { buildViewerHtml } from '../src/features/export/viewer'
import { DEFAULT_CONFIG } from '../src/config/schema'
import { newShieldDocument, type ShieldDocument } from '../src/types/shield'

function docWith(overrides: Partial<ShieldDocument>): ShieldDocument {
  return { ...newShieldDocument('Avery'), ...overrides }
}

describe('buildViewerHtml', () => {
  it('produces a complete standalone page', () => {
    const html = buildViewerHtml(docWith({}), DEFAULT_CONFIG)
    expect(html).toContain('<!doctype html>')
    expect(html).toContain('PRESS')
    expect(html).toContain(DEFAULT_CONFIG.schoolYear)
    // no external references: everything inline or relative
    expect(html).not.toMatch(/src="https?:/)
    expect(html).not.toMatch(/href="https?:/)
  })

  it('escapes a hostile student name in the title', () => {
    const html = buildViewerHtml(docWith({ studentName: '<script>alert(1)</script>' }), DEFAULT_CONFIG)
    expect(html).toContain('<title>&lt;script&gt;alert(1)&lt;/script&gt;')
    expect(html).not.toContain('<title><script>')
  })

  it('embeds the document JSON without a script-breaking "<"', () => {
    const doc = docWith({ studentName: 'x</script><img onerror=alert(1)>' })
    const html = buildViewerHtml(doc, DEFAULT_CONFIG)
    const jsonBlock = html.split('<script type="application/json" id="doc">')[1].split('</script>')[0]
    expect(jsonBlock).not.toContain('<')
    expect(JSON.parse(jsonBlock).studentName).toBe(doc.studentName)
  })

  it('carries relative asset paths through untouched', () => {
    const doc = docWith({
      character: {
        cutoutUrl: 'assets/cutout.png',
        originalUrl: '',
        vibe: 'playful',
        montageUrls: ['assets/montage-1.png']
      }
    })
    const html = buildViewerHtml(doc, DEFAULT_CONFIG)
    expect(html).toContain('assets/cutout.png')
    expect(html).toContain('assets/montage-1.png')
  })

  it('themes the page from the school config colors', () => {
    const config = {
      ...DEFAULT_CONFIG,
      colors: { ...DEFAULT_CONFIG.colors, primary: '#123456' }
    }
    expect(buildViewerHtml(docWith({}), config)).toContain('--p:#123456')
  })
})
