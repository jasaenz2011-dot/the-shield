import { FilesetResolver, ImageSegmenter } from '@mediapipe/tasks-vision'
import type { Segmenter, SegmentationResult } from './segmenter'
import { applyMask } from './matting'

// Paths are relative to the renderer origin (dev server or app://renderer/),
// resolving to files bundled from src/public — fully offline.
const WASM_PATH = 'mediapipe/wasm'
const MODEL_PATH = 'mediapipe/selfie_segmenter.tflite'

export async function createMediaPipeSegmenter(): Promise<Segmenter> {
  const fileset = await FilesetResolver.forVisionTasks(WASM_PATH)
  const segmenter = await ImageSegmenter.createFromOptions(fileset, {
    baseOptions: { modelAssetPath: MODEL_PATH },
    runningMode: 'IMAGE',
    outputConfidenceMasks: true,
    outputCategoryMask: false
  })

  return {
    async segment(image): Promise<SegmentationResult> {
      const result = segmenter.segment(image)
      try {
        const mask = result.confidenceMasks?.[0]
        if (!mask) throw new Error('Segmentation produced no mask')
        const confidence = mask.getAsFloat32Array()
        return applyMask(image, confidence, mask.width, mask.height)
      } finally {
        result.close()
      }
    }
  }
}
