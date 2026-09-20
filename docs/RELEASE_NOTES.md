# وصل لسطح المكتب — Wasl Desktop 0.5.0

## Changes / التغييرات

- New colors: white plates with green keylines and a single green accent, replacing the dark blue and brass palette. The code editor and terminal are light too.
- Rewritten Connection guide: step-by-step from registering a device to the first reading, with the computer's real network address, copy-ready commands for macOS/Linux and Windows PowerShell, an ESP32 example, status meanings, and a list of common errors (400, 401, 413, 415, 429, connection refused). Arabic and English.
- Clearer message when the Arduino CLI is missing (source builds run `npm run fetch:cli`).
- New in 0.4.0: the engraved-instrument design, an overview status dial, shape-mark device status, the app icon in the sidebar, and bundled Latin font subsets.
- Earlier in 0.3.1:
- Fixed overlapping cards and controls in Arabic, including narrow windows and enlarged text.
- Revised Arabic terminology and relative-time grammar.
- Added an always-visible English / العربية language button in the top bar; IDE message language stays independent.
- Restored a GitHub-ready repository root and native Windows/Linux build workflow.
- Added bilingual Electron layout regression checks and updated Vite to a patched release.

واجهة عربية واتجاه من اليمين لليسار. تخزين محلي مستقل. تسجيل أجهزة ومشاريع وقياسات HTTP ومفاتيح وصول قابلة للتجديد والإيقاف. نسخ احتياطية وتصدير CSV.

IDE: English C/C++ source editing, Arduino CLI compilation/upload, serial monitor, AVR/ESP32 core installation, offline toolchain transfer, and local libraries. App language and generated IDE terminal messages switch independently between Arabic and English. Raw compiler/device output is preserved. Board toolchains require a one-time installation or trusted offline import.

Windows x64: unzip and run Wasl.exe, or use the NSIS installer.
Linux x64: run the AppImage or extract the tar.gz and launch ./wasl as a normal desktop user.

Packages are unsigned. macOS is not included. MQTT, OTA, actuator commands, and background service operation are not part of this release. Data reception requires the app to remain open. Use HTTP only on a trusted LAN or behind TLS/VPN.

Wasl source is MIT licensed; bundled Arduino CLI is GPL-3.0 with its corresponding source and license included. Source archive and SHA-256 checksums are included. See README and docs for hardware setup and source builds.
