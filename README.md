# THE SHIELD

[![CI](https://github.com/jasaenz2011-dot/the-shield/actions/workflows/ci.yml/badge.svg)](https://github.com/jasaenz2011-dot/the-shield/actions/workflows/ci.yml)

A student-run digital portfolio for parent-teacher conferences. Students build a
personalized, presentation-grade "shield" showcasing everything they learned this
year, and present it themselves.

## Status

- ✅ **Phase 0** — scaffold, config system, theming, school branding slot (blank splash)
- ✅ **Phase 1** — Character Select Screen: offline MediaPipe segmentation (bundled WASM + model),
  five-vibe idle animation rig, extruded 3D name (three.js), year badge, montage background,
  PRESS START. Verified 60fps in automated end-to-end test.
- ✅ **Phase 2** — Style Picker Gallery: seven art styles as token sets with live
  sample-room previews (same room, restyled per style) and the stingray mascot in
  every one; styles restyle the 3D name material and scene surfaces.
- ✅ **Phase 3** — Template system: six templates (mansion, cinematic scroll, timeline,
  3D world, storybook, blank) over one shared content model; template switches never
  lose work; present mode.
- ✅ **Phase 4** — Artifact ingestion: drag-and-drop + picker, EXIF-stripping image
  re-encode, tagging tray, organize drawer. (720p video transcode deferred: 50MB cap
  instead — single-threaded WASM encoding is minutes-per-clip on school hardware.)
- ✅ **Phase 5** — Gaussian splatting: photoreal `.ply/.splat/.ksplat` worlds inside the
  3D World template (CPU sort, no SharedArrayBuffer, alpha culling), bundled sample
  scene. 30fps-on-iGPU floor still needs verification on real hardware.
- ⬜ Phase 6 — Cloud AI hooks (consent-gated; intentionally absent until then)
- ✅ **Phase 7** — Export pipeline: one folder (`index.html` + `assets/`), fully
  self-contained vanilla-JS viewer, presents from `file://` offline. Original
  photos never leave the machine. (3D world exports as grid view for now.)
- ✅ **Phase 8** — Polish: screen crossfades, keyboard-accessible uploads, reduced-motion
  coverage, Esc handling, Konami stingray, and asset-free sound design — every cue is
  synthesized via the Web Audio API (start chime, door whoosh, save chime, UI ticks)
  with a persisted mute toggle on the title screen and shield toolbar.

## Development

```bash
npm install
npm run dev        # hot-reload dev app
npm run typecheck  # strict TS check
npm test           # unit tests (vitest)
npm run build      # bundle main/preload/renderer to out/
npm run dist       # build installers (.exe on Windows, .dmg on macOS, AppImage on Linux)
```

## Testing

Unit tests live in `tests/` and cover the pure logic that the app's safety and
portability guarantees rest on: config resolution and fallbacks, shield
document invariants, idle-vibe parameters, mansion room presets, viewer HTML
generation (including hostile-name escaping), and export URL rewriting
(including the guarantee that the original photo never leaves the machine).

UI flows are covered by Playwright-driven end-to-end runs against the packaged
app (see phase history in the commits); those need a display/Xvfb and are run
before each push rather than in CI. CI (`.github/workflows/ci.yml`) runs
typecheck + unit tests + bundle build on every push and pull request.

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
