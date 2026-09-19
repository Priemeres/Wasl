# Third-party components

Wasl’s own source is MIT licensed (LICENSE). Dependencies retain their own licenses.

- Arduino CLI 1.5.1: GPL-3.0, https://github.com/arduino/arduino-cli/tree/v1.5.1. Distributed as an unmodified, separate executable invoked through subprocesses. Binary packages include its license and corresponding source archive in `resources/arduino-cli/legal/`, and release provenance in `resources/arduino-cli/release.json`. The source repository fetches verified official release binaries through `npm run fetch:cli`; generated vendor downloads are not committed.
- Electron: MIT; Chromium and bundled third-party notices are included by Electron in binary distributions (`LICENSE.electron.txt`, `LICENSES.chromium.html`).
- React, CodeMirror, Vite, sql.js and other npm dependencies: their upstream licenses apply; exact versions are recorded in package-lock.json.
- Noto Sans Arabic: SIL Open Font License; see assets/FONT-LICENSE.txt.

Optional board cores, compilers and libraries installed/imported by the user have their own licenses. Preserve their notices when exporting or redistributing toolchain bundles. Wasl is an independent project and is not affiliated with Arduino, ThingsBoard, or Blynk.
