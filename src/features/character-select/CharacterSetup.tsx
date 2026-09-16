import { useRef, useState } from 'react'
import type { CharacterConfig, Vibe } from '../../types/shield'
import { getSegmenter } from './segmentation/segmenter'
import { IdleRig } from './idle-animation/IdleRig'
import { VIBES, VIBE_ORDER } from './idle-animation/vibes'

// Below this person-coverage the segmentation clearly failed; keep the whole
// photo (soft-masked) instead of showing the student a broken cutout.
const MIN_COVERAGE = 0.03

type Step = 'photo' | 'vibe' | 'montage'

interface Props {
  shieldId: string
  initial: CharacterConfig | null
  onDone: (character: CharacterConfig) => void
}

async function fileToImage(file: File): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file)
  try {
    const img = new Image()
    img.src = url
    await img.decode()
    return img
  } finally {
    // Image is decoded; the object URL can be revoked after decode resolves.
    setTimeout(() => URL.revokeObjectURL(url), 0)
  }
}

function canvasToBytes(canvas: HTMLCanvasElement): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) return reject(new Error('Could not encode image'))
      blob.arrayBuffer().then((buf) => resolve(new Uint8Array(buf)), reject)
    }, 'image/png')
  })
}

function imageToCanvas(img: HTMLImageElement, maxDim = 1600): HTMLCanvasElement {
  const scale = Math.min(1, maxDim / Math.max(img.naturalWidth, img.naturalHeight))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(img.naturalWidth * scale)
  canvas.height = Math.round(img.naturalHeight * scale)
  canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
  return canvas
}

// Fallback when no person is detected: whole photo with a soft oval fade.
function softOvalMask(source: HTMLCanvasElement): HTMLCanvasElement {
  const out = document.createElement('canvas')
  out.width = source.width
  out.height = source.height
  const ctx = out.getContext('2d')!
  ctx.drawImage(source, 0, 0)
  ctx.globalCompositeOperation = 'destination-in'
  const g = ctx.createRadialGradient(
    out.width / 2,
    out.height / 2,
    Math.min(out.width, out.height) * 0.32,
    out.width / 2,
    out.height / 2,
    Math.min(out.width, out.height) * 0.52
  )
  g.addColorStop(0, 'rgba(0,0,0,1)')
  g.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, out.width, out.height)
  return out
}

export function CharacterSetup({ shieldId, initial, onDone }: Props) {
  const [step, setStep] = useState<Step>('photo')
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [cutoutPreview, setCutoutPreview] = useState<string | null>(null)
  const [usedFallback, setUsedFallback] = useState(false)
  const [vibe, setVibe] = useState<Vibe>(initial?.vibe ?? 'confident')
  const [montageUrls, setMontageUrls] = useState<string[]>(initial?.montageUrls ?? [])
  const saved = useRef<{ cutoutUrl: string; originalUrl: string } | null>(
    initial ? { cutoutUrl: initial.cutoutUrl, originalUrl: initial.originalUrl } : null
  )

  const handlePhoto = async (file: File) => {
    setError(null)
    setBusy('Reading your photo…')
    try {
      const img = await fileToImage(file)
      const source = imageToCanvas(img)
      setBusy('Cutting you out…')
      const segmenter = await getSegmenter()
      const result = await segmenter.segment(source)
      const fallback = result.coverage < MIN_COVERAGE
      const cutout = fallback ? softOvalMask(source) : result.cutout

      setBusy('Saving…')
      const [cutoutSaved, originalSaved] = await Promise.all([
        window.shieldAPI.saveAsset(shieldId, 'cutout.png', await canvasToBytes(cutout)),
        window.shieldAPI.saveAsset(shieldId, 'photo-original.png', await canvasToBytes(source))
      ])
      saved.current = { cutoutUrl: cutoutSaved.url, originalUrl: originalSaved.url }
      setUsedFallback(fallback)
      setCutoutPreview(cutout.toDataURL('image/png'))
      setStep('vibe')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong with that photo.')
    } finally {
      setBusy(null)
    }
  }

  const handleMontageFiles = async (files: FileList) => {
    setBusy('Adding to your montage…')
    try {
      const urls: string[] = []
      for (const [i, file] of Array.from(files).slice(0, 12).entries()) {
        const ext = file.type.startsWith('video/') ? 'mp4' : 'png'
        let bytes: Uint8Array
        if (ext === 'png') {
          const img = await fileToImage(file)
          bytes = await canvasToBytes(imageToCanvas(img, 1280))
        } else {
          bytes = new Uint8Array(await file.arrayBuffer())
        }
        const { url } = await window.shieldAPI.saveAsset(
          shieldId,
          `montage-${Date.now()}-${i}.${ext}`,
          bytes
        )
        urls.push(url)
      }
      setMontageUrls((prev) => [...prev, ...urls])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not add those files.')
    } finally {
      setBusy(null)
    }
  }

  const finish = () => {
    if (!saved.current) return
    onDone({ ...saved.current, vibe, montageUrls })
  }

  return (
    <div className="relative z-10 flex h-full flex-col items-center justify-center gap-8 px-8">
      {step === 'photo' && (
        <>
          <h2 className="text-4xl font-black">Create your character</h2>
          <p className="max-w-md text-center text-white/60">
            Upload a photo of yourself &mdash; any background is fine, we&rsquo;ll cut you out.
          </p>
          <label
            tabIndex={0}
            role="button"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                ;(e.currentTarget.querySelector('input') as HTMLInputElement | null)?.click()
              }
            }}
            className="cursor-pointer rounded-2xl border-2 border-dashed border-[var(--shield-primary)]/60 bg-white/5 px-16 py-14 text-center transition hover:bg-white/10 focus-visible:ring-4 focus-visible:ring-[var(--shield-primary)]/40"
          >
            <span className="text-lg font-bold text-[var(--shield-primary)]">
              {busy ?? 'Choose a photo'}
            </span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={busy !== null}
              onChange={(e) => e.target.files?.[0] && void handlePhoto(e.target.files[0])}
            />
          </label>
        </>
      )}

      {step === 'vibe' && cutoutPreview && (
        <>
          <h2 className="text-4xl font-black">Pick your vibe</h2>
          {usedFallback && (
            <p className="text-sm text-[var(--shield-accent)]">
              We couldn&rsquo;t find a person in that photo, so we kept all of it &mdash; you can
              go back and try another.
            </p>
          )}
          <div className="h-64">
            <IdleRig vibe={vibe}>
              <img src={cutoutPreview} alt="Your cutout" className="h-64 object-contain" />
            </IdleRig>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {VIBE_ORDER.map((v) => (
              <button
                key={v}
                onClick={() => setVibe(v)}
                className={`rounded-xl border px-5 py-3 text-left transition ${
                  vibe === v
                    ? 'border-[var(--shield-primary)] bg-[var(--shield-primary)]/15'
                    : 'border-white/15 bg-white/5 hover:bg-white/10'
                }`}
              >
                <div className="font-bold">{VIBES[v].label}</div>
                <div className="text-xs text-white/50">{VIBES[v].hint}</div>
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setStep('photo')}
              className="rounded-xl border border-white/20 px-6 py-3 text-white/70 transition hover:bg-white/10"
            >
              Different photo
            </button>
            <button
              onClick={() => setStep('montage')}
              className="rounded-xl bg-[var(--shield-primary)] px-8 py-3 font-bold text-black transition hover:brightness-110"
            >
              Next
            </button>
          </div>
        </>
      )}

      {step === 'montage' && (
        <>
          <h2 className="text-4xl font-black">Your background montage</h2>
          <p className="max-w-md text-center text-white/60">
            Add photos or clips of your life &mdash; pets, sports, friends, hobbies. They&rsquo;ll
            play softly behind you. Optional.
          </p>
          <label
            tabIndex={0}
            role="button"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                ;(e.currentTarget.querySelector('input') as HTMLInputElement | null)?.click()
              }
            }}
            className="cursor-pointer rounded-xl border border-dashed border-white/30 bg-white/5 px-10 py-6 transition hover:bg-white/10 focus-visible:ring-4 focus-visible:ring-[var(--shield-primary)]/40"
          >
            <span className="text-white/70">
              {busy ?? (montageUrls.length > 0 ? `${montageUrls.length} added — add more` : 'Add photos or videos')}
            </span>
            <input
              type="file"
              accept="image/*,video/mp4,video/webm"
              multiple
              className="hidden"
              disabled={busy !== null}
              onChange={(e) => e.target.files && void handleMontageFiles(e.target.files)}
            />
          </label>
          <button
            onClick={finish}
            disabled={busy !== null}
            className="rounded-xl bg-[var(--shield-primary)] px-10 py-3 text-lg font-bold text-black transition hover:brightness-110 disabled:opacity-50"
          >
            {montageUrls.length > 0 ? 'Finish' : 'Skip — finish'}
          </button>
        </>
      )}

      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  )
}
