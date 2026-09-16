// Provider interface for person segmentation. MediaPipe (bundled, offline) is
// the default; a higher-quality ONNX matting model (e.g. RMBG) can slot in
// later as a second provider without touching callers.

export interface SegmentationResult {
  // Cutout with per-pixel alpha, cropped to the subject with padding.
  cutout: HTMLCanvasElement
  // Fraction of pixels considered "person" (0..1) — callers use this to
  // detect a failed segmentation and fall back gracefully.
  coverage: number
}

export interface Segmenter {
  segment(image: HTMLImageElement | HTMLCanvasElement): Promise<SegmentationResult>
}

let instance: Promise<Segmenter> | null = null

export function getSegmenter(): Promise<Segmenter> {
  if (!instance) {
    instance = import('./mediapipe').then((m) => m.createMediaPipeSegmenter())
  }
  return instance
}
