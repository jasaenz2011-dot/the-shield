import type { ArtifactKind, ArtifactRef } from '../../types/shield'

// Media caps keep shield folders portable and iGPU-friendly.
const MAX_IMAGE_DIM = 1600
const MAX_MEDIA_BYTES = 50 * 1024 * 1024

export interface ImportOutcome {
  artifacts: ArtifactRef[]
  skipped: { name: string; reason: string }[]
}

function kindOf(file: File): ArtifactKind | null {
  if (file.type.startsWith('image/')) return 'image'
  if (file.type.startsWith('video/')) return 'video'
  if (file.type.startsWith('audio/')) return 'audio'
  return null
}

function safeExt(file: File): string {
  const fromName = file.name.split('.').pop()?.toLowerCase() ?? ''
  return /^[a-z0-9]{1,5}$/.test(fromName) ? fromName : 'bin'
}

// Decode + re-encode through canvas: strips EXIF (including GPS) by
// construction and bounds the resolution.
async function imageToBytes(file: File): Promise<Uint8Array> {
  const url = URL.createObjectURL(file)
  try {
    const img = new Image()
    img.src = url
    await img.decode()
    const scale = Math.min(1, MAX_IMAGE_DIM / Math.max(img.naturalWidth, img.naturalHeight))
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(img.naturalWidth * scale))
    canvas.height = Math.max(1, Math.round(img.naturalHeight * scale))
    canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, 'image/jpeg', 0.88))
    if (!blob) throw new Error('encode failed')
    return new Uint8Array(await blob.arrayBuffer())
  } finally {
    URL.revokeObjectURL(url)
  }
}

export async function importFiles(shieldId: string, files: Iterable<File>): Promise<ImportOutcome> {
  const artifacts: ArtifactRef[] = []
  const skipped: ImportOutcome['skipped'] = []

  for (const file of files) {
    const kind = kindOf(file)
    if (!kind) {
      skipped.push({ name: file.name, reason: 'Not a photo, video, or audio file' })
      continue
    }
    try {
      let bytes: Uint8Array
      let ext: string
      if (kind === 'image') {
        bytes = await imageToBytes(file)
        ext = 'jpg'
      } else {
        if (file.size > MAX_MEDIA_BYTES) {
          skipped.push({ name: file.name, reason: 'Over 50MB — trim it first' })
          continue
        }
        bytes = new Uint8Array(await file.arrayBuffer())
        ext = safeExt(file)
      }
      const id = crypto.randomUUID()
      const { url } = await window.shieldAPI.saveAsset(shieldId, `${kind}-${id}.${ext}`, bytes)
      artifacts.push({
        id,
        kind,
        url,
        caption: file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' '),
        subject: 'life',
        createdAt: new Date(file.lastModified || Date.now()).toISOString()
      })
    } catch {
      skipped.push({ name: file.name, reason: 'Could not read this file' })
    }
  }
  return { artifacts, skipped }
}
