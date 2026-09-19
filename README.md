<div dir="rtl">
Scroll down for the instructions in English

# وصل — Wasl Desktop

**منصة عربية مفتوحة المصدر لإنترنت الأشياء على Windows وLinux.**

برنامج سطح مكتب مستقل يعمل دون متصفح أو حساب سحابي. تُحفظ أجهزتك وقراءاتها على الكمبيوتر، ويمكن للعتاد الموجود على شبكتك المحلية إرسال القياسات مباشرة إليه.

[English](#english) · [دليل المستخدم](docs/USER_GUIDE.ar.md) · [واجهة الأجهزة](docs/API.md) · [البناء والإصدارات](docs/RELEASING.md) · [المساهمة](CONTRIBUTING.md)

## بيئة البرمجة واللغات

يتضمن الإصدار 0.3 محرر C/C++ لبرامج Arduino، وتجميعاً ورفعاً فعليين بواسطة Arduino CLI، ومراقب منفذ تسلسلي، وإدارة حزم اللوحات واستيراد المكتبات المحلية. من «الإعدادات» يمكنك اختيار العربية أو الإنجليزية للتطبيق، واختيار لغة رسائل طرفية IDE بشكل مستقل. تبقى الشيفرة البرمجية ومخرجات أدوات التجميع الأصلية بالإنجليزية أو بلغتها الأصلية دون ترجمة.

الأداة مضمنة، لكن حزمة اللوحة تُثبّت مرة واحدة عبر الإنترنت أو تُستورد من جهاز موثوق يعمل بالنظام والمعمارية نفسيهما. بعدها يمكن التجميع دون إنترنت. [دليل بيئة البرمجة](docs/IDE.md).

## جديد في 0.3.1

زر **English / العربية** ظاهر في الشريط العلوي على جميع الصفحات. أُعيد تنظيم البطاقات وحقول الإعدادات وأدوات البرمجة لتجنب تداخلها عند تصغير النافذة أو تكبير النص، مع تحسين المصطلحات العربية.

## المزايا

- واجهة عربية بالكامل واتجاه من اليمين لليسار، مع خط عربي مضمن يعمل دون إنترنت.
- تسجيل الأجهزة وتنظيمها ضمن مشاريع والبحث فيها وتصفية حالتها.
- استقبال HTTP بمفتاح وصول خاص لكل جهاز، مع تجديد المفاتيح وإيقافها.
- تخزين SQLite محلي، ورسوم للقياسات وآخر ١٠٠ قراءة لكل جهاز.
- تنبيه محلي عندما يتوقف جهاز سبق له الاتصال عن الإرسال لمدة خمس دقائق.
- تصدير CSV بالعربية ونسخ احتياطية لقاعدة البيانات.
- مساحة بيانات تجريبية منفصلة بوضوح عن أجهزة المستخدم.

## تنزيل وتشغيل

### Windows 10/11 — x64

فك ضغط `Wasl-0.3.1-win-x64.zip` وشغّل `Wasl.exe`. لا تنقل ملف exe وحده؛ يحتاج إلى بقية ملفات المجلد. يمكن بناء مثبّت NSIS بامتداد exe عبر GitHub Actions أو على Windows.

### Linux — x64

فك ضغط `Wasl-0.3.1-linux-x64.tar.gz` وشغّل `./wasl` من داخل المجلد. استخدم مستخدماً عادياً لا المستخدم root. يحتاج Electron إلى جلسة رسومية وإلى مكتبات GTK/NSS المتوفرة عادة في توزيعات سطح المكتب الحديثة. يمكن أيضاً بناء AppImage على Linux أو عبر GitHub Actions.

لم يتم إصدار حزمة macOS في هذا الإصدار. لا يتطلب المستخدم تثبيت Node.js لتشغيل الحزم؛ بيئة التشغيل مضمنة فيها.

## أول جهاز

١. افتح «أجهزتي» ثم «إضافة جهاز» وأدخل بيانات اللوحة والمشروع.

٢. انسخ مفتاح الوصول الذي يظهر مرة واحدة واحفظه في إعدادات العتاد، لا في مستودع GitHub.

٣. للتجربة من نفس الكمبيوتر استخدم `http://127.0.0.1:8080/api/telemetry`.

٤. لربط لوحة أخرى، فعّل استقبال الشبكة المحلية من الإعدادات، وافتح المنفذ في جدار الحماية للشبكة الخاصة فقط، ثم استخدم عنوان الكمبيوتر الظاهر في البرنامج.

٥. أرسل JSON بالشكل `{"value":26.4,"unit":"C"}` مع الترويسة `Authorization: Bearer DEVICE_TOKEN`.

يتوقف الاستقبال عند إغلاق التطبيق. كل جهاز يدعم قناة قياس رقمية واحدة في هذا الإصدار.

## تشغيل المصدر

يتطلب التطوير Node.js 22.16 أو أحدث وnpm. يُنصح بـ Node.js 24 LTS.

</div>

```sh
npm ci
npm run fetch:cli
npm run check
npm test
npm run build
npm start
```

<div dir="rtl">

## بناء حزم النظام

</div>

```sh
# On Windows: installer + portable ZIP
npm run dist:win

# On Linux: AppImage + tar.gz
npm run dist:linux

# ZIP for Windows and tar.gz for Linux; no native Node addons to cross-compile
npm run dist:portable

# Clean GitHub-ready source archive
npm run source
```

<div dir="rtl">

تظهر الملفات في مجلد `release/`. يتضمن المستودع سير عمل GitHub Actions يبني الحزم ويجري اختبار تشغيل أصلياً على Windows وLinux. نشرها يتم كمسودة إصدار عند دفع وسم مثل `v0.3.1`.

## النطاق الحالي

هذا إصدار أولي محلي لسطح المكتب، وليس بديلاً مكتملاً لـ ThingsBoard. الحد الأقصى ١٠٠ جهاز، وآخر ٥٠٬٠٠٠ قراءة إجمالاً، وقراءة واحدة في الثانية لكل جهاز. تستخدم قاعدة البيانات sql.js؛ وهي SQLite مضمنة تُحفظ ذرياً على القرص بعد كل عملية كتابة. يلائم ذلك المشاريع الصغيرة والمختبرات؛ ليس مصمماً لمعدلات القياس الصناعية العالية.

MQTT وOTA والتحكم بالمشغلات والعمل كخدمة خلفية وإدارة الفرق وTLS مدمج ليست متاحة بعد. الاستقبال HTTP غير مشفر، لذا يُستخدم على شبكة موثوقة أو خلف بوابة TLS/VPN. لا توجد اتصالات تحليلية أو حساب سحابي أو موارد خطوط من الإنترنت. الحزم غير موقعة رقمياً حالياً.

## الرخصة

شيفرة وصل مرخصة وفق MIT. أداة Arduino CLI المضمنة مرخصة وفق GPL-3.0 وتأتي مع رخصتها وأرشيف مصدرها في resources/arduino-cli/legal. راجع [إشعارات المكونات](THIRD_PARTY_NOTICES.md). يمكنك الاستخدام والتعديل والتوزيع والنشر. التبعيات الخارجية تحتفظ برخصها؛ يتضمن مصدر الخط نسخة SIL Open Font License.

</div>
-------------------------------------------------------------------------------------------------------------------

<a id="english"></a>

# Wasl Desktop — وصل

An Arabic, right-to-left, MIT-licensed desktop IoT workspace for Windows and Linux. This is a standalone Electron application: bundled assets, local SQLite storage, a restricted IPC bridge, and a built-in token-authenticated HTTP receiver. It does not load or require the previous hosted website, Cloudflare, or ChatGPT.

## Embedded IDE and independent languages

The IDE includes a C/C++ editor, English Blink starter, multi-file sketches, real Arduino CLI compilation/upload, serial monitor, AVR/ESP32 board managers, local library import, and offline toolchain export/import. In **Settings**, choose Arabic or English separately for the app and IDE terminal messages. Code stays English/LTR; compiler diagnostics and device output remain verbatim.

Arduino CLI is bundled. Board cores must be installed once online or imported from a trusted computer with the same OS/CPU architecture. Compilation can then run offline. See [IDE guide](docs/IDE.md).

## New in 0.3.1

An **English / العربية** switch is visible in the top bar on every page. Cards and controls wrap at narrower widths and enlarged text sizes; Arabic wording and relative-time grammar have been revised. The terminal language remains independent. `npm run test:ui` checks the real desktop renderer across both languages and several widths/zoom levels.

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
