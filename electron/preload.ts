import { contextBridge, ipcRenderer } from 'electron'

const api = {
  getSchoolConfig: (): Promise<{
    raw: unknown
    splashVideoUrl: string | null
    logoUrl: string | null
  }> => ipcRenderer.invoke('school:getConfig'),

  saveShield: (doc: unknown): Promise<{ ok: boolean }> => ipcRenderer.invoke('shield:save', doc),

  loadShield: (id: string): Promise<unknown> => ipcRenderer.invoke('shield:load', id),

  saveAsset: (shieldId: string, name: string, bytes: Uint8Array): Promise<{ url: string }> =>
    ipcRenderer.invoke('shield:saveAsset', shieldId, name, bytes),

  listShields: (): Promise<unknown[]> => ipcRenderer.invoke('shield:list'),

  exportShield: (
    shieldId: string,
    html: string,
    assets: { from: string; to: string }[],
    destDir?: string
  ): Promise<{ ok: boolean; dir?: string; canceled?: boolean; error?: string }> =>
    ipcRenderer.invoke('shield:export', shieldId, html, assets, destDir)
}

export type ShieldAPI = typeof api

contextBridge.exposeInMainWorld('shieldAPI', api)
