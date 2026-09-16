import { app, BrowserWindow, dialog, ipcMain, protocol, net, Menu } from 'electron'
import { join, resolve, normalize, sep } from 'node:path'
import { readFile, writeFile, mkdir, readdir, access, copyFile } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'

const isDev = !app.isPackaged

// school-config lives OUTSIDE the asar so an admin can edit it with no rebuild.
function schoolConfigDir(): string {
  return isDev
    ? resolve(process.cwd(), 'school-config')
    : join(process.resourcesPath, 'school-config')
}

function shieldsDir(): string {
  return join(app.getPath('userData'), 'shields')
}

// Shield documents are addressed by id; keep ids filesystem-safe.
const SHIELD_ID = /^[a-zA-Z0-9][a-zA-Z0-9_-]{0,63}$/
const ASSET_NAME = /^[a-zA-Z0-9][a-zA-Z0-9._-]{0,63}$/

async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path)
    return true
  } catch {
    return false
  }
}

interface SchoolConfigPayload {
  raw: unknown
  splashVideoUrl: string | null
  logoUrl: string | null
}

async function loadSchoolConfig(): Promise<SchoolConfigPayload> {
  const dir = schoolConfigDir()
  let raw: unknown = null
  try {
    raw = JSON.parse(await readFile(join(dir, 'config.json'), 'utf-8'))
  } catch {
    raw = null // missing or invalid config: renderer falls back to defaults
  }

  const splash =
    raw && typeof raw === 'object' ? (raw as Record<string, unknown>).splash : undefined
  const videoName =
    splash && typeof splash === 'object' ? (splash as Record<string, unknown>).video : null

  let splashVideoUrl: string | null = null
  if (typeof videoName === 'string' && videoName.length > 0 && !videoName.includes('..')) {
    if (await fileExists(join(dir, videoName))) {
      splashVideoUrl = `shield://school-config/${encodeURIComponent(videoName)}`
    }
  }

  const logoUrl = (await fileExists(join(dir, 'logo.png')))
    ? 'shield://school-config/logo.png'
    : null

  return { raw, splashVideoUrl, logoUrl }
}

// shield:// serves admin media and saved student assets to the sandboxed
// renderer without giving it filesystem access. app:// serves the packaged
// renderer itself (instead of file://) so same-origin fetches of the WASM
// runtime, segmentation model, and fonts work identically in dev and prod.
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'shield',
    privileges: { standard: true, secure: true, stream: true, supportFetchAPI: true }
  },
  {
    scheme: 'app',
    privileges: { standard: true, secure: true, stream: true, supportFetchAPI: true }
  }
])

function serveWithin(base: string, relativePath: string): Response | Promise<Response> {
  const target = normalize(join(base, relativePath))
  if (!target.startsWith(base + sep)) {
    return new Response('forbidden', { status: 403 })
  }
  return net.fetch(pathToFileURL(target).toString())
}

function registerProtocols(): void {
  protocol.handle('shield', (request) => {
    const url = new URL(request.url)
    const path = decodeURIComponent(url.pathname)
    if (url.host === 'school-config') return serveWithin(schoolConfigDir(), path)
    if (url.host === 'user-assets') return serveWithin(shieldsDir(), path)
    return new Response('not found', { status: 404 })
  })

  protocol.handle('app', (request) => {
    const url = new URL(request.url)
    if (url.host !== 'renderer') return new Response('not found', { status: 404 })
    let path = decodeURIComponent(url.pathname)
    if (path === '/' || path === '') path = '/index.html'
    return serveWithin(join(__dirname, '../renderer'), path)
  })
}

function registerIpc(): void {
  ipcMain.handle('school:getConfig', () => loadSchoolConfig())

  ipcMain.handle('shield:save', async (_event, doc: { id?: unknown }) => {
    if (!doc || typeof doc.id !== 'string' || !SHIELD_ID.test(doc.id)) {
      throw new Error('Invalid shield id')
    }
    await mkdir(shieldsDir(), { recursive: true })
    await writeFile(join(shieldsDir(), `${doc.id}.json`), JSON.stringify(doc, null, 2), 'utf-8')
    return { ok: true }
  })

  ipcMain.handle('shield:load', async (_event, id: unknown) => {
    if (typeof id !== 'string' || !SHIELD_ID.test(id)) throw new Error('Invalid shield id')
    return JSON.parse(await readFile(join(shieldsDir(), `${id}.json`), 'utf-8'))
  })

  ipcMain.handle(
    'shield:saveAsset',
    async (_event, shieldId: unknown, name: unknown, bytes: unknown) => {
      if (typeof shieldId !== 'string' || !SHIELD_ID.test(shieldId)) {
        throw new Error('Invalid shield id')
      }
      if (typeof name !== 'string' || !ASSET_NAME.test(name) || name.includes('..')) {
        throw new Error('Invalid asset name')
      }
      if (!(bytes instanceof Uint8Array) && !(bytes instanceof ArrayBuffer)) {
        throw new Error('Invalid asset data')
      }
      const dir = join(shieldsDir(), shieldId, 'assets')
      await mkdir(dir, { recursive: true })
      await writeFile(join(dir, name), Buffer.from(bytes as ArrayBuffer))
      return { url: `shield://user-assets/${shieldId}/assets/${encodeURIComponent(name)}` }
    }
  )

  // Export: write the viewer HTML and copy the listed assets. Sources may
  // only come from this shield's own asset folder — anything else is refused.
  ipcMain.handle(
    'shield:export',
    async (
      _event,
      shieldId: unknown,
      html: unknown,
      assets: unknown,
      destDir: unknown
    ) => {
      if (typeof shieldId !== 'string' || !SHIELD_ID.test(shieldId)) {
        throw new Error('Invalid shield id')
      }
      if (typeof html !== 'string' || html.length > 8 * 1024 * 1024) {
        throw new Error('Invalid export document')
      }
      if (!Array.isArray(assets)) throw new Error('Invalid asset list')

      let target: string
      if (typeof destDir === 'string' && destDir.length > 0) {
        target = destDir
      } else {
        const win = BrowserWindow.getAllWindows()[0]
        const picked = await dialog.showOpenDialog(win, {
          title: 'Choose where to export your shield',
          properties: ['openDirectory', 'createDirectory']
        })
        if (picked.canceled || picked.filePaths.length === 0) return { ok: false, canceled: true }
        target = join(picked.filePaths[0], `${shieldId}-shield`)
      }

      const assetBase = join(shieldsDir(), shieldId, 'assets')
      await mkdir(join(target, 'assets'), { recursive: true })

      for (const entry of assets as { from?: unknown; to?: unknown }[]) {
        if (typeof entry.from !== 'string' || typeof entry.to !== 'string') continue
        const name = decodeURIComponent(entry.from.split('/').pop() ?? '')
        if (!ASSET_NAME.test(name)) continue
        const source = normalize(join(assetBase, name))
        if (!source.startsWith(assetBase + sep)) continue
        const dest = normalize(join(target, 'assets', name))
        if (!dest.startsWith(join(target, 'assets') + sep)) continue
        try {
          await copyFile(source, dest)
        } catch {
          // missing asset: viewer degrades gracefully, keep exporting
        }
      }

      await writeFile(join(target, 'index.html'), html, 'utf-8')
      return { ok: true, dir: target }
    }
  )

  ipcMain.handle('shield:list', async () => {
    await mkdir(shieldsDir(), { recursive: true })
    const entries = await readdir(shieldsDir())
    const docs: unknown[] = []
    for (const entry of entries) {
      if (!entry.endsWith('.json')) continue
      try {
        docs.push(JSON.parse(await readFile(join(shieldsDir(), entry), 'utf-8')))
      } catch {
        // skip corrupt files rather than failing the whole list
      }
    }
    return docs
  })
}

function createWindow(): void {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 960,
    minHeight: 600,
    show: false,
    backgroundColor: '#0b0f1a',
    webPreferences: {
      preload: join(__dirname, '../preload/preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  })

  win.once('ready-to-show', () => win.show())

  if (isDev && process.env['ELECTRON_RENDERER_URL']) {
    void win.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    void win.loadURL('app://renderer/')
  }
}

Menu.setApplicationMenu(null)

void app.whenReady().then(() => {
  registerProtocols()
  registerIpc()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
