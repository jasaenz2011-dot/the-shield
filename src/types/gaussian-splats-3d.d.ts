declare module '@mkkellogg/gaussian-splats-3d' {
  import type { Object3D } from 'three'

  export interface DropInViewerOptions {
    sharedMemoryForWorkers?: boolean
    gpuAcceleratedSort?: boolean
    integerBasedSort?: boolean
    freeIntermediateSplatData?: boolean
    halfPrecisionCovariancesOnGPU?: boolean
  }

  export interface AddSplatSceneOptions {
    splatAlphaRemovalThreshold?: number
    showLoadingUI?: boolean
    position?: [number, number, number]
    rotation?: [number, number, number, number]
    scale?: [number, number, number]
  }

  export class DropInViewer extends Object3D {
    constructor(options?: DropInViewerOptions)
    addSplatScene(url: string, options?: AddSplatSceneOptions): Promise<void>
    dispose(): Promise<void>
  }
}
