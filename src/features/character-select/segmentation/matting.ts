import type { SegmentationResult } from './segmenter'

// Confidence below LOW is fully transparent, above HIGH fully opaque, with a
// smooth ramp between — a cheap feather that avoids hard cutout edges.
const LOW = 0.35
const HIGH = 0.75

export function applyMask(
  image: HTMLImageElement | HTMLCanvasElement,
  confidence: Float32Array,
  maskWidth: number,
  maskHeight: number
): SegmentationResult {
  const width = image instanceof HTMLImageElement ? image.naturalWidth : image.width
  const height = image instanceof HTMLImageElement ? image.naturalHeight : image.height

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!
  ctx.drawImage(image, 0, 0, width, height)
  const pixels = ctx.getImageData(0, 0, width, height)

  let covered = 0
  const scaleX = maskWidth / width
  const scaleY = maskHeight / height

  for (let y = 0; y < height; y++) {
    const maskY = Math.min(maskHeight - 1, Math.floor(y * scaleY))
    for (let x = 0; x < width; x++) {
      const maskX = Math.min(maskWidth - 1, Math.floor(x * scaleX))
      const conf = confidence[maskY * maskWidth + maskX]
      const t = Math.min(1, Math.max(0, (conf - LOW) / (HIGH - LOW)))
      const alpha = t * t * (3 - 2 * t) // smoothstep
      pixels.data[(y * width + x) * 4 + 3] = Math.round(alpha * 255)
      if (alpha > 0.5) covered++
    }
  }
  ctx.putImageData(pixels, 0, 0)

  return { cutout: cropToSubject(canvas, pixels), coverage: covered / (width * height) }
}

// Trim transparent margins (with padding) so the cutout scales predictably.
function cropToSubject(canvas: HTMLCanvasElement, pixels: ImageData): HTMLCanvasElement {
  const { width, height, data } = pixels
  let minX = width
  let minY = height
  let maxX = -1
  let maxY = -1

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * 4 + 3] > 20) {
        if (x < minX) minX = x
        if (x > maxX) maxX = x
        if (y < minY) minY = y
        if (y > maxY) maxY = y
      }
    }
  }

  if (maxX < 0) return canvas // nothing found; caller checks coverage

  const pad = Math.round(Math.max(width, height) * 0.02)
  minX = Math.max(0, minX - pad)
  minY = Math.max(0, minY - pad)
  maxX = Math.min(width - 1, maxX + pad)
  maxY = Math.min(height - 1, maxY + pad)

  const out = document.createElement('canvas')
  out.width = maxX - minX + 1
  out.height = maxY - minY + 1
  out.getContext('2d')!.drawImage(canvas, -minX, -minY)
  return out
}
