# Contributing / المساهمة

[العربية](#العربية) · [English](#english)

<div dir="rtl">

## العربية

### المساهمة في وصل

نرحّب بمساهمات مطوّري الأنظمة المضمنة، والمهندسين الكهربائيين، وشركات الإلكترونيات، والمختبرات الجامعية، والمصنّعين. تُقدّم المساهمات البرمجية بموجب رخصة MIT.

استخدم صياغة واضحة وطبيعية في الواجهة العربية والإنجليزية. اختبر العربية باتجاه من اليمين إلى اليسار (RTL)، والإنجليزية باتجاه من اليسار إلى اليمين (LTR)، وحافظ على استقلال إعداد لغة التطبيق عن لغة رسائل بيئة البرمجة. يجب أن تبقى المعرّفات التقنية والشيفرة البرمجية والعناوين ووحدات القياس باتجاه LTR. ضمّن الخطوط والملفات اللازمة داخل البرنامج، وتجنّب الاعتماد على خطوط تُحمّل من الإنترنت أو خدمات سحابية.

### التحقق من التغييرات

قبل إرسال مساهمتك، شغّل الأوامر التالية من مجلد المشروع:

</div>

```sh
npm run check
npm test
npm run build
```

<div dir="rtl">

عند تعديل التخطيط أو اللغات، شغّل أيضاً `npm run test:ui` بعد البناء. تُحفظ لقطات الشاشة في `release/qa`. اختبر تشغيل تطبيق Electron على نظام التشغيل المتأثر بالتغيير، واشرح المشكلة التي عالجتها وكيف تحققت من النتيجة.

حافظ على بيئة التشغيل المعزولة، وعزل السياق، والتحقق الصارم من مصدر رسائل IPC، واستعلامات SQL ذات المعاملات، وحفظ البيانات بطريقة ذرّية، وتخزين مفاتيح الوصول بصيغة تجزئة. يجب أن يبقى استقبال اتصالات الشبكة المحلية معطّلاً افتراضياً.

### حماية البيانات

لا تضف بيانات تسجيل الدخول أو مفاتيح الأجهزة أو كلمات مرور الشبكات أو قياسات المستخدمين الفعلية أو قواعد بياناتهم إلى Git. تتطلب تغييرات بنية قاعدة البيانات آلية ترحيل مرتبطة برقم إصدار. لا تحذف البيانات بصمت عند العثور على بنية قاعدة بيانات من إصدار أحدث.

### أولويات التطوير

تشمل الأولويات الحالية بوابة MQTT، ودعم عدة قنوات قياس لكل جهاز، وتخزين القراءات مؤقتاً على الأجهزة عند انقطاع الاتصال، وتحسين تخزين بيانات السلاسل الزمنية، وتوقيع حزم التثبيت رقمياً، وتحسين إمكانية الوصول، ودعم ARM64، ثم macOS لاحقاً.

</div>

## English

Contributions are welcome from embedded developers, electrical engineers, electronics companies, university labs, and manufacturers. Code contributions are MIT-licensed.

Keep the UI natural in Arabic (RTL) and English (LTR). Test both directions and preserve independent app/IDE message preferences. Technical identifiers, firmware code, addresses, and units should remain explicitly LTR. Bundle assets locally and avoid remote fonts or cloud dependencies.

Run `npm run check`, `npm test`, and `npm run build`. For layout/language changes, run `npm run test:ui` after building; screenshots are written under release/qa. Test native Electron startup on the affected platform. Include the scenario fixed and the verification performed. Preserve the sandbox, context isolation, strict sender validation, prepared SQL, atomic persistence, token hashes, and disabled-by-default LAN listening.

No credentials, device tokens, network passwords, real telemetry, or user databases belong in Git. Database schema changes need a versioned migration. Never erase data silently when a newer schema is encountered.

Current priorities: MQTT gateway, multi-channel sensors, offline device buffers, efficient time-series storage, signed installers, accessibility, ARM64, and eventually macOS.
