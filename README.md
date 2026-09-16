# THE SHIELD

A student-run digital portfolio for parent-teacher conferences. Students build a
personalized, presentation-grade "shield" showcasing everything they learned this
year, and present it themselves.

## Status

- ✅ **Phase 0** — scaffold, config system, theming, school branding slot (blank splash)
- ✅ **Phase 1** — Character Select Screen: offline MediaPipe segmentation (bundled WASM + model),
  five-vibe idle animation rig, extruded 3D name (three.js), year badge, montage background,
  PRESS START. Verified 60fps in automated end-to-end test.
- ⬜ Phase 2 — Style Picker Gallery
- ✅ **Phase 3** — Template system: six templates (mansion, cinematic scroll, timeline,
  3D world, storybook, blank) over one shared content model; template switches never
  lose work; present mode.
- ✅ **Phase 4** — Artifact ingestion: drag-and-drop + picker, EXIF-stripping image
  re-encode, tagging tray, organize drawer. (720p video transcode deferred: 50MB cap
  instead — single-threaded WASM encoding is minutes-per-clip on school hardware.)
- ⬜ Phase 5 — Gaussian Splatting
- ⬜ Phase 6 — Cloud AI hooks (consent-gated; intentionally absent until then)
- ✅ **Phase 7** — Export pipeline: one folder (`index.html` + `assets/`), fully
  self-contained vanilla-JS viewer, presents from `file://` offline. Original
  photos never leave the machine. (3D world exports as grid view for now.)
- 🔶 Phase 8 — Polish (in progress): screen crossfades, keyboard-accessible uploads,
  reduced-motion coverage, Esc handling, Konami stingray. Remaining: sound design,
  per-style ambient audio, final art pass (waits on Phase 2 styles).

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
- **Segmentation** runs fully offline: `@mediapipe/tasks-vision` with the WASM
  runtime and `selfie_segmenter.tflite` bundled in `src/public/mediapipe/`.
  Providers implement `src/features/character-select/segmentation/segmenter.ts`,
  so a higher-quality matting model (e.g. RMBG) can be added without touching
  callers. If no person is found, the app falls back to a soft-masked full photo.
- **Idle animation** is a compositor-only CSS-transform rig
  (`idle-animation/IdleRig.tsx`) with five vibe presets; a cloud image-to-video
  loop can replace it per-character in Phase 6. Honors `prefers-reduced-motion`.
- **`app://` protocol** serves the packaged renderer (instead of `file://`) so
  same-origin fetches of WASM/model/fonts behave identically in dev and prod.
