import { app, BrowserWindow, ipcMain, protocol, net, Menu } from 'electron'
import { join, resolve, normalize, sep } from 'node:path'
import { readFile, writeFile, mkdir, readdir, access } from 'node:fs/promises'
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

// shield:// serves admin-provided media (splash video, logo) to the sandboxed
// renderer without giving it filesystem access.
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'shield',
    privileges: { standard: true, secure: true, stream: true, supportFetchAPI: true }
  }
])

function registerShieldProtocol(): void {
  protocol.handle('shield', (request) => {
    const url = new URL(request.url)
    if (url.host !== 'school-config') {
      return new Response('not found', { status: 404 })
    }
    const base = schoolConfigDir()
    const target = normalize(join(base, decodeURIComponent(url.pathname)))
    if (!target.startsWith(base + sep)) {
      return new Response('forbidden', { status: 403 })
    }
    return net.fetch(pathToFileURL(target).toString())
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
    void win.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

Menu.setApplicationMenu(null)

void app.whenReady().then(() => {
  registerShieldProtocol()
  registerIpc()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
