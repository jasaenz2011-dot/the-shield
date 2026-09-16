import type { ShieldDocument } from '../../types/shield'
import type { SchoolConfig } from '../../config/schema'
import { buildViewerHtml } from './viewer'

export interface ExportResult {
  ok: boolean
  dir?: string
  canceled?: boolean
  error?: string
}

// Rewrites every shield:// asset URL to a relative assets/<file> path, builds
// the self-contained viewer HTML, and hands the main process the copy list.
// The export never contains editor code, absolute paths, or anything from
// outside this shield's own asset folder.
export async function exportShield(
  doc: ShieldDocument,
  config: SchoolConfig,
  destDir?: string
): Promise<ExportResult> {
  const assets: { from: string; to: string }[] = []

  const rewrite = (url: string): string => {
    if (!url.startsWith('shield://')) return url
    const name = decodeURIComponent(url.split('/').pop() ?? '')
    const to = `assets/${name}`
    if (!assets.some((a) => a.to === to)) assets.push({ from: url, to })
    return to
  }

  const exported: ShieldDocument = {
    ...doc,
    character: doc.character
      ? {
          ...doc.character,
          cutoutUrl: rewrite(doc.character.cutoutUrl),
          // The raw original photo stays private on the student's machine.
          originalUrl: '',
          montageUrls: doc.character.montageUrls.map(rewrite)
        }
      : null,
    artifacts: doc.artifacts.map((a) => ({ ...a, url: rewrite(a.url) }))
  }

  const html = buildViewerHtml(exported, config)
  return window.shieldAPI.exportShield(doc.id, html, assets, destDir)
}
