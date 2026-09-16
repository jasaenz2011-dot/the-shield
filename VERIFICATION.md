# Verifying the splat sample on a real school laptop

The photoreal-world renderer (Gaussian splatting) is the one feature whose
performance could not be verified in the cloud build environment (it renders
WebGL in software there). This is the 10-minute check to run once on a real
integrated-graphics laptop — the kind students will actually use.

## Steps

1. Install the app (grab the `.exe` from the **Installers** workflow artifacts
   on GitHub Actions, or run `npm install && npm run dev` from a clone).
2. Create a shield: any name → any photo → any vibe → skip the montage →
   **PRESS START**.
3. Pick the **3D World** template.
4. Click **Try the sample world** (top-left). Within a couple of seconds a
   green terrain with trees and floating lights should appear around the
   subject islands.
5. Click and drag to orbit for ~15 seconds. Then click an island to open its
   panel, close it, and orbit again.

## What "passing" looks like (≥30fps)

- The world **tracks your drag directly** — when you move the mouse, the
  camera moves with it, no lag, no rubber-banding.
- The slow automatic rotation is **continuous**, not a slideshow.
- Opening/closing an island panel doesn't freeze the scene.

To put a number on it: press `Ctrl+Shift+I` in a dev build (`npm run dev`),
open DevTools → the three-dot menu → *More tools* → *Rendering* → check
*Frame rendering stats*. The FPS meter should read 30+ while dragging.

## What "choking" looks like, and what to do

Choking = the camera lags visibly behind the mouse, rotation stutters in
steps, or the fans spin up and the whole app slows down.

If that happens on the sample world (5,420 splats — tiny), the machine's GPU
driver is likely falling back to software rendering:

1. Check `chrome://gpu`-equivalent: in a dev build DevTools console, run
   `document.createElement('canvas').getContext('webgl2').getParameter(0x1F01)`
   — if it mentions *SwiftShader* or *llvmpipe*, WebGL is software-rendered;
   update the graphics driver before judging the feature.
2. If real scans (not the sample) choke: convert `.ply` scenes to `.ksplat`
   (compressed) before importing, and prefer scans under ~500k splats for
   this hardware class.
3. If it still chokes, click **Remove world** — the islands scene runs at
   60fps everywhere and is the supported fallback. File an issue with the
   laptop model and driver version.

## Record the result

Edit the Phase 5 line in `README.md`: replace the "needs verification on real
hardware" note with the laptop model and the FPS you observed.
