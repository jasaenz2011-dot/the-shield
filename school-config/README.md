# School branding (admin-editable, no rebuild needed)

Everything in this folder is read at launch. Edit and relaunch — no rebuild.

- `config.json` — school name, year, colors, splash settings.
- `logo.png` — optional. Shown on the home screen if present.
- Splash video — optional. Drop a file here (e.g. `splash.mp4`) and set
  `"splash": { "video": "splash.mp4" }` in `config.json`. It plays before the
  app loads, capped at `maxSeconds`, fading out over `fadeOutMs`.
  With `skipAfterFirstRun: true`, a Skip button appears from the second launch on.

The slot ships blank (`"video": null`): no splash plays until you add one.
