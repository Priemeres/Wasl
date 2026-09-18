# Wasl Desktop — وصل

An Arabic, right-to-left, MIT-licensed desktop IoT workspace for Windows and Linux. This is a standalone Electron application: bundled assets, local SQLite storage, a restricted IPC bridge, and a built-in token-authenticated HTTP receiver. It does not load or require the previous hosted website, Cloudflare, or ChatGPT.

## Embedded IDE and independent languages

The IDE includes a C/C++ editor, English Blink starter, multi-file sketches, real Arduino CLI compilation/upload, serial monitor, AVR/ESP32 board managers, local library import, and offline toolchain export/import. In **Settings**, choose Arabic or English separately for the app and IDE terminal messages. Code stays English/LTR; compiler diagnostics and device output remain verbatim.

Arduino CLI is bundled. Board cores must be installed once online or imported from a trusted computer with the same OS/CPU architecture. Compilation can then run offline. See [IDE guide](docs/IDE.md).

## Distribution

- Windows x64: extract the portable ZIP and run `Wasl.exe`; keep the entire extracted folder together. The Windows build also supports an NSIS installer.
- Linux x64: extract the tar.gz and run `./wasl` as a normal desktop user. AppImage is built on Linux/CI. Standard Electron desktop dependencies are required.
- macOS is not a release target yet. ARM64 builds are not included in this release.
- End users do not need Node.js or npm. Packages bundle their runtime. Packages are currently unsigned.

## Development

Node.js >=22.16 (Node 24 LTS recommended), npm, and a desktop environment:

```sh
npm ci
npm run fetch:cli
npm run check
npm test
npm run build
npm start
```

`npm start -- --smoke-test` uses a temporary database and a hidden window. It verifies that the renderer and preload bridge load and local database operations succeed, then exits. On Linux CI, run it through `xvfb-run -a`.

## Release

`npm run dist:win` produces NSIS and ZIP; `npm run dist:linux` produces AppImage and tar.gz. `npm run dist:portable` builds Windows ZIP and Linux tar.gz without native database add-ons. `npm run source` creates a source ZIP with no dependencies, user data, secrets, old website, or compiled bundles. Upload the extracted source archive's contents as your GitHub repository root, including `.github/`.

See [release instructions](docs/RELEASING.md). The workflow tests both native platforms and uploads build artifacts. Tag builds create a draft GitHub Release; they do not silently publish a release.

## Architecture

- `src/`: React/TypeScript renderer, Arabic UI and RTL CSS; all fonts/assets packaged locally.
- `electron/main.cjs`: Electron window, validated IPC handlers, native CSV/backup dialogs, server lifecycle.
- `electron/preload.cjs`: fixed, narrow methods; no arbitrary Node, filesystem, or network access exposed.
- `electron/store.cjs`: parameterized SQLite queries via sql.js WASM, atomic file persistence and rollback on failed writes.
- `electron/receiver.cjs`: device-only HTTP ingestion; no management API over HTTP.
- `tests/`: persistence, validation, rotation/revocation, backup/restore, disk-write rollback, HTTP auth/limits.

The receiver binds to loopback by default. The user can enable LAN access. Device tokens are generated from 32 random bytes and stored as SHA-256 hashes. The UI never receives stored hashes. HTTP is plaintext: use a trusted LAN or a TLS/VPN gateway. Each device has one numeric measurement channel. The application must stay open. No background service is installed.

Data lives under Electron's OS-specific userData folder (shown in Settings), not alongside the executable. Protect backups as private operational data. Restore with the application closed. No telemetry, external font/CDN requests, cloud accounts, or automatic updates are used.

## Limits and roadmap

100 devices; newest 50,000 total measurements; up to one reading per second per device. sql.js exports the database after each write, so this release is intended for labs and low-throughput prototypes, not large industrial fleets. Repeated HTTP submissions are not deduplicated. Device offline detection uses the computer clock.

Future: MQTT gateway, OTA updates, actuator commands, retention policies, team roles, multi-channel sensors, signed installers, and macOS. This is not safety-critical control software.

Wasl source uses the MIT license. The separately bundled Arduino CLI uses GPL-3.0; its license and corresponding source archive ship under `resources/arduino-cli/legal`. See [third-party notices](THIRD_PARTY_NOTICES.md). Other third-party components retain their licenses. See `assets/FONT-LICENSE.txt` for the bundled Arabic font license.
