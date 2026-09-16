import { useEffect, useState } from 'react'
import * as GaussianSplats3D from '@mkkellogg/gaussian-splats-3d'

// Gaussian splat environment as a drop-in object inside an existing r3f
// scene. Tuned for integrated graphics: CPU sort in a plain (non-SAB) worker,
// low alpha threshold to cull near-invisible splats, no GPU-accelerated sort.
export function SplatScene({ url, onError }: { url: string; onError?: (msg: string) => void }) {
  const [viewer, setViewer] = useState<GaussianSplats3D.DropInViewer | null>(null)

  useEffect(() => {
    let disposed = false
    const dropIn = new GaussianSplats3D.DropInViewer({
      sharedMemoryForWorkers: false,
      gpuAcceleratedSort: false,
      integerBasedSort: true,
      freeIntermediateSplatData: true
    })
    dropIn
      .addSplatScene(url, {
        splatAlphaRemovalThreshold: 5,
        showLoadingUI: false,
        rotation: [1, 0, 0, 0]
      })
      .then(() => {
        if (!disposed) setViewer(dropIn)
      })
      .catch((e: unknown) => {
        if (!disposed) onError?.(e instanceof Error ? e.message : 'Could not load this world')
      })
    return () => {
      disposed = true
      setViewer(null)
      void dropIn.dispose()
    }
  }, [url, onError])

  if (!viewer) return null
  return <primitive object={viewer} />
}
