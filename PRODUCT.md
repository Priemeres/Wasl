# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Arabic-speaking makers, students and small lab teams running small IoT projects. They register devices, watch sensor readings, and write, compile and upload Arduino (C/C++) code from the same desktop app. They work on Windows 10/11 and Linux, often on a local network and sometimes offline. Confirmed by the product owner; other audiences are not established.

## Product Purpose
Wasl (وصل) is a standalone, open-source (MIT) Electron desktop workspace for IoT. It keeps devices and readings on the user's own computer: no browser, no cloud account, no analytics. Success is a user going from registering a first device to seeing live readings, and from writing a sketch to uploading it to a board, without leaving the app or the internet.

## Positioning
An Arabic-first, right-to-left, fully local IoT and Arduino workspace. Devices, telemetry and the IDE live in one offline desktop app with no hosted service behind it, which a cloud IoT platform cannot truthfully claim.

## Operating Context
- Devices post JSON telemetry over HTTP to a built-in receiver, using a per-device bearer token. The receiver runs only while the app is open.
- Storage is local SQLite (sql.js). It keeps up to 100 devices and the last 50,000 readings, with CSV export in Arabic and database backups.
- Embedded IDE: C/C++ editor (CodeMirror), Arduino CLI compile and upload, serial monitor, AVR/ESP32 board manager, local library import, offline toolchain export and import.
- App language and IDE terminal language are chosen independently (Arabic or English) in Settings. A language switch sits in the top bar. Code and compiler output stay English and LTR.
- The app must work with no network. The font is bundled and no web resources are loaded.

## Capabilities and Constraints
- Electron desktop app (React, Vite, TypeScript, Recharts, lucide-react). Distributed as portable ZIP and tar.gz, and as installers.
- No web fonts or external assets. Fonts and imagery must be bundled.
- Must be fully right-to-left, and must stay usable when the window is small or text is enlarged.
- One numeric telemetry channel per device in this version. Demo data is kept visibly separate from the user's own devices.
- Local-network HTTP is unencrypted, so the UI must not imply that the app secures transport.

## Brand Commitments
- Name: وصل / Wasl.
- Keep the existing app icon (`assets/icon.png`) and the bundled Noto Sans Arabic font. The user confirmed both as binding.
- Bilingual: Arabic primary, English secondary. Everything else visual is open to redesign.

## Evidence on Hand
- Existing UI in `src/` (`App.tsx`, `IDE.tsx`, `styles.css`), the docs in `docs/`, and `examples/`.
- No customer testimonials, benchmarks, or usage statistics exist. None may be invented.

## Product Principles
1. Local and private by default. The interface must make it obvious that data stays on the user's machine.
2. Arabic is the primary language, not a translation. Right-to-left is the default, and English and LTR code are the exceptions handled with care.
3. Honest about limits. Scale, security and platform boundaries are stated plainly, not hidden.
4. One workspace: monitoring devices and writing firmware should feel like one tool, not two apps.
5. Made for makers and learners, so first-run and empty states should teach the next step.

## Accessibility & Inclusion
Readable Arabic at enlarged text sizes, and no reliance on color alone for device status (online, offline, alerting). No product-specific standard has been named beyond that.
