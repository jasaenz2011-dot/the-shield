# THE SHIELD

A student-run digital portfolio for parent-teacher conferences. Students build a
personalized, presentation-grade "shield" showcasing everything they learned this
year, and present it themselves.

## Status

- ✅ **Phase 0** — scaffold, config system, theming, school branding slot (blank splash)
- ⬜ Phase 1 — Character Select Screen (segmentation, idle animation, 3D name, montage, PRESS START)
- ⬜ Phase 2 — Style Picker Gallery
- ⬜ Phase 3 — Template system
- ⬜ Phase 4 — Artifact ingestion
- ⬜ Phase 5 — Gaussian Splatting
- ⬜ Phase 6 — Cloud AI hooks (consent-gated; intentionally absent until then)
- ⬜ Phase 7 — Export pipeline
- ⬜ Phase 8 — Polish

## Development

```bash
npm install
npm run dev        # hot-reload dev app
npm run typecheck  # strict TS check
npm run build      # bundle main/preload/renderer to out/
npm run dist       # build installers (.exe on Windows, .dmg on macOS, AppImage on Linux)
```

Installers must be built on (or CI-targeted at) each OS; cross-building Windows
installers from Linux/macOS requires Wine and is not recommended.

## Architecture notes

- **Offline-first.** There is no network code in this codebase. Cloud features
  arrive in Phase 6 behind a single consent-gated gatekeeper module.
- **Sandboxed renderer.** `contextIsolation: true`, `sandbox: true`,
  `nodeIntegration: false`. The renderer talks to disk only through the typed
  `window.shieldAPI` preload bridge.
- **`shield://` protocol.** Admin media (splash video, logo) is served to the
  sandboxed renderer through a path-checked custom protocol, never raw `file://`.
- **School branding** lives in `school-config/` (packaged outside the asar as an
  extraResource) so admins edit JSON/media directly — see its README.
- **Shield documents** are versioned JSON (`src/types/shield.ts`) saved under the
  OS user-data dir. The document is designed to become the Phase 7 export format.
