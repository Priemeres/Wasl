# IDE / بيئة البرمجة

## العربية

1. من **الإعدادات** اختر لغة التطبيق ولغة رسائل طرفية IDE بصورة مستقلة. تُحفظ الخيارات بعد إعادة التشغيل. تبقى الشيفرة باتجاه يسار إلى يمين، ولا تُترجم أسماء الدوال أو الكلمات المحجوزة أو الرسائل الأصلية الصادرة عن الأدوات والأجهزة.
2. افتح بيئة البرمجة. ابدأ بالمثال Blink أو افتح ملف `.ino` محلياً. يدعم المحرر ملفات `.h` و`.hpp` و`.c` و`.cpp` و`.S` أيضاً. تُحفظ المسودات تلقائياً؛ زر الحفظ يكتب ملفات المشروع.
3. افتح مدير اللوحات. ثبّت Arduino AVR للـ Uno/Nano/Mega أو ESP32 عبر الإنترنت. إذا تعذر التنزيل، صدّر الأدوات من نسخة وصل على جهاز موثوق يعمل **بنظام التشغيل ومعمارية المعالج نفسيهما** ثم استورد المجلد هنا. انسخ المكتبات المطلوبة أيضاً باستخدام استيراد مكتبة محلية.
4. حدّث قائمة اللوحات واختر معرف اللوحة FQBN مثل `arduino:avr:uno`. يمكنك إدخال المعرف يدوياً.
5. اضغط التحقق/التجميع. لا يحتاج هذا الإجراء لوحة موصولة. تظهر رسائل وصل باللغة المحددة للطرفية، وتظهر مخرجات المترجم كما صدرت منه.
6. للرفع، صِل اللوحة واختر المنفذ مثل `COM3` أو `/dev/ttyUSB0` ثم اضغط الرفع وأكّد الجهاز. تستبدل العملية البرنامج الحالي على اللوحة. قد تحتاج تعريف USB على Windows أو صلاحية الوصول للمنفذ التسلسلي على Linux بحسب التوزيعة.
7. أوقف المراقب التسلسلي قبل التجميع أو الرفع. اختر سرعة الاتصال المطابقة لبرنامجك؛ المثال الشائع `115200`. يمكن إرسال سطر مع LF أو CRLF أو دون نهاية سطر.

الطرفية هنا تعرض سجلات البناء وتتواصل مع المنفذ التسلسلي؛ ليست صدفة أوامر عامة. الأدوات الخارجية والعتاد لا تُترجم رسائلها آلياً، حتى لا تتغير المعلومات التقنية.

## English

- **Settings → App language** controls the interface (Arabic RTL / English LTR).
- **Settings → IDE terminal message language** independently controls Wasl-generated build/status messages. Compiler diagnostics and serial bytes are preserved exactly. This terminal is a build log and serial console, not a general-purpose shell.
- The editor always uses LTR source code and an English Blink starter. Save writes the sketch files; automatic draft recovery preserves edits separately. Save before opening or creating another sketch.
- Open Board Manager and install Arduino AVR or ESP32 once. Internet installation depends on vendor-server access. Alternatively, export an offline toolchain folder from Wasl on a trusted computer with the **same OS and CPU architecture**, then import that folder. Toolchain bundles contain executable programs. Import project libraries separately from a local folder containing `library.properties`.
- Refresh boards and ports, choose an FQBN (`arduino:avr:uno` for Uno), then Verify. For Upload, connect a board, select its serial port, and confirm firmware replacement. Windows may need the board’s USB driver; Linux may require serial-device group permissions appropriate to your distribution.
- Stop Serial Monitor before building/uploading. Match baud rate and choose the outgoing line ending.

Arduino CLI 1.5.1 is included; board cores/toolchains are not preinstalled. A real Uno Blink compile was tested on the development host. Physical-board uploading, Windows/Linux runtime behavior, and USB driver compatibility still require native hardware testing. No cloud account is required.
