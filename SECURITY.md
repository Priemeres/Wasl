# Security / الأمان

[العربية](#العربية) · [English](#english)

<div dir="rtl">

## العربية

### النموذج الأمني

وصل برنامج محلي للنماذج الأولية والمختبرات، وليس نظام تحكم مخصصاً للتطبيقات التي قد يؤدي تعطلها إلى تعريض سلامة الأشخاص للخطر.

تعتمد الواجهة على ملفات محلية وسياسة أمان المحتوى (CSP)، وعزل السياق، وبيئة تشغيل معزولة (sandbox)، وواجهة محدودة تُتاح عبر ملف preload. يُمنع تشغيل Node.js من الواجهة، وفتح نوافذ جديدة، والانتقال إلى صفحات أخرى، وتضمين webviews، وطلبات الأذونات. يتحقق كل معالج IPC ذي صلاحيات من الإطار الرئيسي المتوقع وعنوان الواجهة المحلية. لا تُتاح للواجهة أوامر عامة للوصول إلى الملفات أو الشبكة عبر IPC.

يستقبل البرنامج البيانات من الكمبيوتر نفسه فقط افتراضياً (loopback). يمكن للمستخدم تفعيل استقبال البيانات من الشبكة المحلية من الإعدادات. يعتمد الاستقبال على مفاتيح وصول تُرسل مع طلبات HTTP؛ ولحماية سرية البيانات على الشبكات غير الموثوقة، يلزم استخدام بوابة TLS أو اتصال VPN. تُولّد مفاتيح الأجهزة عشوائياً بطول ٢٥٦ بت، ولا تُحفظ إلا بصيغة تجزئة SHA-256. يسري إلغاء المفتاح على طلب الكتابة التالي. الحدود المفروضة على معدل الطلبات وحجم البيانات والمهلة وعدد الاتصالات وسائل حماية أساسية، وليست حماية من هجمات حجب الخدمة على نطاق واسع.

تحمي صلاحيات حساب نظام التشغيل الملفات المحفوظة ضمن مجلد بيانات المستخدم. من يستطيع تشغيل برامج بصلاحيات هذا المستخدم يستطيع الوصول إلى قاعدة البيانات المحلية. تحتوي النسخ الاحتياطية على بيانات الأجهزة وقيم تجزئة مفاتيح الوصول، ويجب التعامل معها بوصفها بيانات خاصة. لا يوفر البرنامج حالياً تشفيراً لقاعدة البيانات أثناء تخزينها على القرص.

### الإبلاغ عن الثغرات

لا تنشر تفاصيل الثغرات أو بيانات تسجيل الدخول أو مفاتيح الأجهزة أو البيانات الخاصة في البلاغات العامة (Issues). إذا ظهر خيار **Report a vulnerability** في تبويب **Security** بالمستودع، فاستخدمه للإبلاغ بشكل خاص. إذا لم يتوفر هذا الخيار، فاطلب من القائمين على المشروع وسيلة تواصل خاصة، دون الكشف عن تفاصيل الثغرة علناً.

</div>

## English

This is local prototype/lab software, not safety-critical control infrastructure.

The renderer uses local files, CSP, context isolation, a sandbox, and a narrow preload API. Node integration, new windows, navigation, webviews, and permission prompts are denied. Every privileged IPC handler checks the expected main frame and local renderer URL. No arbitrary filesystem/network IPC is exposed.

The receiver defaults to loopback. LAN mode is an explicit local setting. It uses bearer tokens over HTTP; confidentiality on untrusted networks requires a TLS/VPN gateway. Device keys are random 256-bit values, stored only as SHA-256 hashes. Key revocation applies to the next write. Rate, payload, timeout, and connection limits are basic safeguards, not fleet-scale denial-of-service protection.

Files under the user's OS profile are protected by OS account permissions. Anyone who can execute code as that user can access the local database. Backups contain device data and token hashes and should be treated as private. No database encryption at rest is implemented.

Do not post vulnerability details, credentials, device tokens, or private data in public issues. If the repository’s Security tab offers “Report a vulnerability”, use that private reporting option. Otherwise, ask the maintainers for a private reporting channel without disclosing the vulnerability details publicly.
