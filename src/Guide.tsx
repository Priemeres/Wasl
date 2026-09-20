import { tr, locale } from './i18n';
import type { Runtime } from './types';
import type { ReactNode } from 'react';
import { Copy, ShieldCheck, Wifi } from 'lucide-react';

type GuideProps = {
  runtime: Runtime | null;
  copy: (value: string) => void;
  navigate: (page: string) => void;
  onAddDevice: () => void;
  onMyDevices: () => void;
};

const n = (value: number) => new Intl.NumberFormat(locale()).format(value);
// Latin fragments inside Arabic prose are wrapped in {{ }} and rendered as isolated LTR code so bidi cannot scramble them.
const rich = (text: string) => text.split(/\{\{(.+?)\}\}/g).map((part, i) => i % 2 ? <code key={i} dir="ltr">{part}</code> : part);
const T = (ar: string, en: string) => rich(tr(ar, en));

function CodeBlock({ label, code, copy }: { label: string; code: string; copy: (value: string) => void }) {
  return <div className="code-block">
    <div className="code-block-head"><span>{label}</span><button className="icon-button" aria-label={tr('نسخ', 'Copy')} title={tr('نسخ', 'Copy')} onClick={() => copy(code)}><Copy size={15}/></button></div>
    <pre dir="ltr">{code}</pre>
  </div>;
}

function Address({ value, note, copy }: { value: string; note?: string; copy: (value: string) => void }) {
  return <div className="endpoint">
    <div className="endpoint-text"><code dir="ltr">{value}</code>{note && <small>{note}</small>}</div>
    <button className="icon-button" aria-label={tr('نسخ العنوان', 'Copy address')} onClick={() => copy(value)}><Copy size={16}/></button>
  </div>;
}

function Help({ symptom, children }: { symptom: ReactNode; children: ReactNode }) {
  return <details className="guide-help"><summary>{symptom}</summary><p>{children}</p></details>;
}

const sections = [
  { id: 'guide-how', ar: 'كيف يعمل', en: 'How it works' },
  { id: 'guide-register', ar: 'سجّل الجهاز', en: 'Register the device' },
  { id: 'guide-address', ar: 'اختر العنوان', en: 'Pick the address' },
  { id: 'guide-test', ar: 'قراءة تجريبية', en: 'Send a test reading' },
  { id: 'guide-board', ar: 'لوحة حقيقية', en: 'Use a real board' },
  { id: 'guide-check', ar: 'تأكد أنها تعمل', en: 'Check it worked' },
  { id: 'guide-help', ar: 'إذا لم يعمل شيء', en: 'If something fails' },
  { id: 'guide-limits', ar: 'حدود مهمة', en: 'Good to know' },
];

function jump(id: string) {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.getElementById(id)?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
}

export default function Guide({ runtime, copy, navigate, onAddDevice, onMyDevices }: GuideProps) {
  const port = runtime?.receiver.port ?? 8080;
  const lanOn = runtime?.settings.host === '0.0.0.0';
  const lan = runtime?.receiver.addresses ?? [];
  const local = `http://127.0.0.1:${port}/api/telemetry`;
  const boardEndpoint = lan[0] ? `http://${lan[0]}:${port}/api/telemetry` : `http://192.168.1.10:${port}/api/telemetry`;
  const unix = `curl -X POST "${local}" \\\n  -H "Authorization: Bearer DEVICE_TOKEN" \\\n  -H "Content-Type: application/json" \\\n  -d '{"value":26.4,"unit":"C"}'`;
  const windows = `Invoke-RestMethod -Method Post -Uri "${local}" \`\n  -Headers @{Authorization="Bearer DEVICE_TOKEN"} \`\n  -ContentType 'application/json' -Body '{"value":26.4,"unit":"C"}'`;
  const sketch = `#include <WiFi.h>
#include <HTTPClient.h>

// 1) Edit these four lines.
const char* WIFI_SSID     = "YOUR_WIFI_NAME";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";
const char* WASL_ENDPOINT = "${boardEndpoint}";
const char* DEVICE_TOKEN  = "wasl_YOUR_DEVICE_KEY";

unsigned long lastSend = 0;

void setup() {
  Serial.begin(115200);
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
}

void loop() {
  if (millis() - lastSend < 5000) return;   // one reading every 5 seconds
  lastSend = millis();
  if (WiFi.status() != WL_CONNECTED) return;

  float value = 26.4;                        // 2) Replace with your sensor reading.
  HTTPClient http;
  http.begin(WASL_ENDPOINT);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("Authorization", String("Bearer ") + DEVICE_TOKEN);
  int status = http.POST("{\\"value\\":" + String(value) + ",\\"unit\\":\\"C\\"}");
  Serial.printf("Wasl status: %d\\n", status);   // 201 means it arrived
  http.end();
}`;

  return <div className="docs-grid guide">
    <article className="panel doc-panel guide-main">
      <h2>{T('اربط جهازك بوصل خطوة بخطوة', 'Connect a device to Wasl, step by step')}</h2>
      <p>{T('ترسل لوحتك (مثل ESP32) قراءة رقمية، كدرجة الحرارة، عبر الشبكة إلى وصل على هذا الكمبيوتر. يحفظها وصل ويعرضها في «نظرة عامة» و«الأجهزة». لا تحتاج إلى إنترنت ولا إلى حساب.', 'Your board (an ESP32, for example) sends a number, such as a temperature, across your network to Wasl on this computer. Wasl stores it and shows it on Overview and Devices. No internet and no account are needed.')}</p>

      <section id="guide-how" className="guide-section">
        <h3 className="plain">{T('كيف يعمل', 'How it works')}</h3>
        <ol className="guide-path">
          <li><b>{T('لوحتك أو أمر {{curl}}', 'Your board or a {{curl}} command')}</b><small>{T('يقيس القيمة ويرسلها', 'Measures a value and sends it')}</small></li>
          <li><b>{T('وصل على هذا الكمبيوتر', 'Wasl on this computer')}</b><small>{T('يتحقق من المفتاح ويحفظ القراءة', 'Checks the key and stores the reading')}</small></li>
          <li><b>{T('نظرة عامة والأجهزة', 'Overview and Devices')}</b><small>{T('تراها هنا خلال ثوانٍ', 'You see it here within seconds')}</small></li>
        </ol>
        <p>{T('تُرسل القراءة كطلب {{HTTP POST}} يحمل مفتاح الجهاز. المفتاح هو ما يعرّف وصل بأي جهاز تخص القراءة.', 'The reading travels as an {{HTTP POST}} request that carries the device key. The key is how Wasl knows which device a reading belongs to.')}</p>
        <div className="guide-callout">
          <b>{T('قبل أن تبدأ', 'Before you start')}</b>
          <ul>
            <li>{T('وصل مفتوح على هذا الكمبيوتر. يتوقف الاستقبال عند إغلاقه.', 'Wasl is open on this computer. Receiving stops when you close it.')}</li>
            <li>{T('للتجربة على هذا الكمبيوتر لا تحتاج إلى أي عتاد.', 'To try it on this computer you need no hardware at all.')}</li>
            <li>{T('للوحة حقيقية: لوحة تدعم Wi‑Fi موصولة بالشبكة نفسها التي يتصل بها هذا الكمبيوتر.', 'For a real board: a Wi‑Fi board on the same network this computer uses.')}</li>
          </ul>
          <p><b>{T('أسهل طريق:', 'Easiest route:')}</b> {T('جرّب أولاً من هذا الكمبيوتر (الخطوات ١ و٢ و٣ ثم ٥). بعد أن ترى القراءة تصل، انتقل إلى لوحة حقيقية (الخطوة ٤).', 'try it from this computer first (steps 1, 2, 3, then 5). Once you see a reading arrive, move to a real board (step 4).')}</p>
        </div>
      </section>

      <section id="guide-register" className="guide-section">
        <h3><span>{n(1)}</span>{T('سجّل الجهاز واحصل على مفتاحه', 'Register the device and get its key')}</h3>
        <p>{T('اضغط «إضافة جهاز» واملأ الحقول:', 'Choose Add device and fill in the fields:')}</p>
        <ul>
          <li><b>{T('اسم الجهاز:', 'Device name:')}</b> {T('أي اسم تفهمه، مثل «حساس البيت البلاستيكي».', 'any name you will recognize, like “Greenhouse sensor”.')}</li>
          <li><b>{T('نوع اللوحة والحساس:', 'Board and sensor:')}</b> {T('مثل {{ESP32 · DHT22}}.', 'for example {{ESP32 · DHT22}}.')}</li>
          <li><b>{T('المشروع والموقع:', 'Project and location:')}</b> {T('لتنظيم أجهزتك وتصفيتها لاحقاً.', 'to organize and filter your devices later.')}</li>
        </ul>
        <p>{T('بعد «تسجيل الجهاز» يظهر مفتاح الوصول، ويبدأ بـ {{wasl_}}. انسخه فوراً واحفظه في مكان خاص: يُعرض مرة واحدة فقط. إن فقدته، افتح تفاصيل الجهاز واختر «تجديد المفتاح» لإصدار مفتاح جديد.', 'After you register, the access key appears and starts with {{wasl_}}. Copy it right away and keep it private: it is shown only once. If you lose it, open the device details and choose Rotate key to get a new one.')}</p>
        <button className="button primary guide-action" onClick={onAddDevice}>{T('إضافة جهاز', 'Add device')}</button>
      </section>

      <section id="guide-address" className="guide-section">
        <h3><span>{n(2)}</span>{T('اختر العنوان الذي سيُرسل إليه الجهاز', 'Pick the address the device sends to')}</h3>
        <p><b>{T('من هذا الكمبيوتر', 'From this computer')}</b> {T('(تجربة، curl، برنامج بايثون). يعمل مباشرة:', '(a test, curl, a Python script). It works immediately:')}</p>
        <Address value={local} copy={copy}/>
        <p><b>{T('من لوحة أخرى على شبكتك', 'From another board on your network')}</b> {T('(ESP32 مثلاً). يلزم تفعيل الاتصال من الشبكة المحلية أولاً:', '(an ESP32, for example). You must turn on LAN access first:')}</p>
        {lanOn
          ? (lan.length
            ? <>{lan.map(address => <Address key={address} value={`http://${address}:${port}/api/telemetry`} note={tr('عنوان هذا الكمبيوتر على الشبكة', 'This computer’s address on your network')} copy={copy}/>)}</>
            : <p className="guide-note"><Wifi size={16}/>{T('الاتصال من الشبكة المحلية مفعّل، لكننا لم نجد عنواناً للكمبيوتر على الشبكة. تأكد أنه متصل بالشبكة ثم أعد فتح هذه الصفحة.', 'LAN access is on, but we could not find this computer’s network address. Make sure it is connected to your network, then reopen this page.')}</p>)
          : <div className="guide-note"><Wifi size={16}/><p>{T('الاتصال من الشبكة المحلية غير مفعّل الآن. افتح «الإعدادات»، فعّل «السماح بالاتصال من الشبكة المحلية»، واحفظ. ثم يظهر هنا عنوان الكمبيوتر جاهزاً للنسخ.', 'LAN access is off right now. Open Settings, turn on “Allow connections from the local network”, and save. This computer’s address then appears here, ready to copy.')}</p><button className="button" onClick={() => navigate('settings')}>{T('فتح الإعدادات', 'Open Settings')}</button></div>}
        <ul>
          <li>{T('يجب أن تكون اللوحة والكمبيوتر على الشبكة نفسها، وليس شبكة الضيوف.', 'The board and this computer must be on the same network, not a guest network.')}</li>
          <li>{T('إن ظهر تنبيه من جدار الحماية فاسمح لوصل بالشبكات الخاصة فقط.', 'If a firewall prompt appears, allow Wasl on private networks only.')}</li>
          <li>{T(`لاختبار العنوان: افتح من متصفح هاتفك على الشبكة نفسها {{http://COMPUTER-IP:${port}/health}} فيظهر {{status: ok}}.`, `To test the address: open {{http://COMPUTER-IP:${port}/health}} in your phone’s browser on the same network. It should show {{status: ok}}.`)}</li>
        </ul>
      </section>

      <section id="guide-test" className="guide-section">
        <h3><span>{n(3)}</span>{T('أرسل قراءة تجريبية من هذا الكمبيوتر', 'Send a test reading from this computer')}</h3>
        <p>{T('افتح الطرفية ({{Terminal}} على {{macOS}} و{{Linux}}، أو {{PowerShell}} على {{Windows}}). استبدل {{DEVICE_TOKEN}} بمفتاح جهازك ثم الصق الأمر:', 'Open a terminal (Terminal on macOS and Linux, PowerShell on Windows). Replace {{DEVICE_TOKEN}} with your device key and paste the command:')}</p>
        <CodeBlock label="macOS / Linux" code={unix} copy={copy}/>
        <CodeBlock label="Windows PowerShell" code={windows} copy={copy}/>
        <p>{T('إذا ردّ الأمر بـ {{accepted}} وقيمتها {{true}} فقد وصلت القراءة. شكل البيانات: {{value}} رقم (مثل {{26.4}}، دون علامات اقتباس) و{{unit}} نص حتى ١٦ حرفاً (مثل {{C}} أو {{%}}).', 'If the reply contains {{accepted}} with the value {{true}}, the reading arrived. The data has a {{value}} that is a number (like {{26.4}}, without quotes) and a {{unit}} that is text up to 16 characters (like {{C}} or {{%}}).')}</p>
      </section>

      <section id="guide-board" className="guide-section">
        <h3><span>{n(4)}</span>{T('أرسل من لوحة حقيقية (ESP32)', 'Send from a real board (ESP32)')}</h3>
        <p>{T('يفعل هذا المثال الشيء نفسه من اللوحة. حرّر السطور الأربعة الأولى: اسم الشبكة وكلمة مرورها، وعنوان وصل من الخطوة ٢، ومفتاح الجهاز من الخطوة ١. غيّر {{26.4}} إلى قراءة حساسك.', 'This example does the same thing from the board. Edit the first four settings: your Wi‑Fi name and password, the Wasl address from step 2, and the device key from step 1. Then replace {{26.4}} with your sensor’s reading.')}</p>
        <CodeBlock label="ESP32 · Arduino" code={sketch} copy={copy}/>
        <ul>
          <li>{T('افتح «بيئة البرمجة»، الصق الشيفرة، اختر اللوحة (مثل {{esp32:esp32:esp32}}) ثم «تجميع» و«رفع». تحتاج إلى تثبيت حزمة اللوحة مرة واحدة من «مدير اللوحات والأدوات».', 'Open Code studio, paste the code, choose the board (such as {{esp32:esp32:esp32}}), then Verify and Upload. You install the board package once from Boards & toolchains.')}</li>
          <li>{T('افتح المراقب التسلسلي بسرعة {{115200}}. ظهور {{Wasl status: 201}} يعني أن القراءة وصلت.', 'Open the serial monitor at {{115200}}. Seeing {{Wasl status: 201}} means the reading arrived.')}</li>
          <li>{T('أرسل قراءة كل ٥ ثوانٍ أو أكثر. الحد الأقصى قراءة واحدة في الثانية لكل جهاز.', 'Send a reading every 5 seconds or more. The maximum is one reading per second per device.')}</li>
          <li>{T('لا تنشر كلمة مرور الشبكة ولا مفتاح الجهاز في {{GitHub}}.', 'Never publish your Wi‑Fi password or device key on GitHub.')}</li>
        </ul>
      </section>

      <section id="guide-check" className="guide-section">
        <h3><span>{n(5)}</span>{T('تأكد أن كل شيء يعمل', 'Check that it worked')}</h3>
        <p>{T('في أعلى الصفحة اختر «أجهزتي» بدل «بيانات تجريبية»، ثم افتح صفحة الأجهزة.', 'At the top of the page choose My devices instead of Demo workspace, then open the Devices page.')}</p>
        <button className="button primary guide-action" onClick={onMyDevices}>{T('عرض أجهزتي', 'Show my devices')}</button>
        <ul className="guide-status">
          <li><span className="status online"><i aria-hidden="true"/>{T('متصل', 'Online')}</span>{T('وصلت قراءة خلال آخر ٥ دقائق. يتحدث العرض كل ٣ ثوانٍ.', 'A reading arrived in the last 5 minutes. The view refreshes every 3 seconds.')}</li>
          <li><span className="status offline"><i aria-hidden="true"/>{T('غير متصل', 'Offline')}</span>{T('لم تصل قراءة بعد، أو مرّت أكثر من ٥ دقائق. إن سبق للجهاز أن أرسل فسيظهر أيضاً في «التنبيهات».', 'No reading yet, or more than 5 minutes have passed. If the device sent before, it also appears in Alerts.')}</li>
          <li><span className="status revoked"><i aria-hidden="true"/>{T('موقوف', 'Disabled')}</span>{T('أُوقف مفتاح الجهاز. جدّده من تفاصيل الجهاز لاستئناف الإرسال.', 'The device key was disabled. Rotate it from the device details to resume.')}</li>
        </ul>
        <p>{T('اضغط اسم الجهاز لرؤية آخر ١٠٠ قراءة، ولتجديد مفتاحه أو إيقافه.', 'Select a device name to see its latest 100 readings and to rotate or disable its key.')}</p>
      </section>

      <section id="guide-help" className="guide-section">
        <h3 className="plain">{T('إذا لم يعمل شيء', 'If something fails')}</h3>
        <p>{T('اختر ما يشبه حالتك:', 'Pick what looks like your situation:')}</p>
        <Help symptom={T('الجهاز يبقى «غير متصل» ولا يظهر أي خطأ', 'The device stays Offline and nothing shows an error')}>{T('تحقق من أن وصل مفتوح، وأنك اخترت «أجهزتي» لا «بيانات تجريبية»، وأنك تستخدم مفتاح هذا الجهاز نفسه وليس مفتاح جهاز آخر.', 'Check that Wasl is open, that you selected My devices and not Demo workspace, and that you are using this device’s own key, not another device’s.')}</Help>
        <Help symptom={T('الأمر يقول {{Connection refused}} أو تعذر الاتصال', 'The command says {{Connection refused}} or cannot connect')}>{T('وصل مغلق، أو المنفذ خاطئ (راجع «الإعدادات»)، أو تستخدم عنوان الشبكة بينما الاتصال من الشبكة المحلية غير مفعّل.', 'Wasl is closed, the port is wrong (check Settings), or you are using the network address while LAN access is off.')}</Help>
        <Help symptom={T('اللوحة لا تصل أو تنتهي المهلة', 'The board cannot reach the computer, or it times out')}>{T('اللوحة والكمبيوتر على شبكتين مختلفتين، أو جدار الحماية يمنع الاتصال. جرّب عنوان {{/health}} من هاتفك على الشبكة نفسها.', 'The board and the computer are on different networks, or a firewall is blocking the connection. Try the {{/health}} address from your phone on the same network.')}</Help>
        <Help symptom={T('الرد 401', 'Reply 401')}>{T('المفتاح ناقص أو خاطئ، أو نسيت كلمة {{Bearer}} وبعدها مسافة، أو جدّدت المفتاح فصار القديم لا يعمل، أو أُوقف المفتاح. انسخ المفتاح من جديد أو جدّده من تفاصيل الجهاز.', 'The key is missing or wrong, you left out the word {{Bearer}} and a space, you rotated the key so the old one stopped working, or the key was disabled. Copy the key again or rotate it from the device details.')}</Help>
        <Help symptom={T('الرد 400', 'Reply 400')}>{T('المحتوى ليس JSON صحيحاً، أو {{value}} ليست رقماً (أرسل {{26.4}} وليس {{"26.4"}})، أو {{unit}} أطول من ١٦ حرفاً.', 'The body is not valid JSON, {{value}} is not a number (send {{26.4}}, not {{"26.4"}}), or {{unit}} is longer than 16 characters.')}</Help>
        <Help symptom={T('الرد 415', 'Reply 415')}>{T('أضف الترويسة {{Content-Type: application/json}}.', 'Add the header {{Content-Type: application/json}}.')}</Help>
        <Help symptom={T('الرد 429', 'Reply 429')}>{T('أرسلت أكثر من قراءة في الثانية لهذا الجهاز. انتظر ثانية على الأقل، ويفضّل ٥ ثوانٍ.', 'You sent more than one reading per second for this device. Wait at least a second; 5 seconds is better.')}</Help>
        <Help symptom={T('الرد 413 أو 403', 'Reply 413 or 403')}>{T('{{413}}: المحتوى أكبر من ٤٠٩٦ بايت. {{403}}: الطلب صادر من صفحة متصفح. أرسل من لوحة أو برنامج أو {{curl}}.', '{{413}}: the body is larger than 4,096 bytes. {{403}}: the request came from a browser page. Send from a board, a script, or {{curl}}.')}</Help>
        <Help symptom={T('اللوحة تطبع {{-1}} ({{ESP32}})', 'The board prints {{-1}} ({{ESP32}})')}>{T('فشل الاتصال بوصل قبل أن يصل أي رد. راجع Wi‑Fi والعنوان والمنفذ، وتأكد من تفعيل الاتصال من الشبكة المحلية.', 'The connection to Wasl failed before any reply came back. Check Wi‑Fi, the address and the port, and make sure LAN access is on.')}</Help>
        <Help symptom={T('كان يعمل ثم ظهر في «التنبيهات»', 'It worked, then showed up in Alerts')}>{T('توقف عن الإرسال أكثر من ٥ دقائق: انقطاع الكهرباء أو Wi‑Fi، أو أُغلق وصل. أعد تشغيله وستعود الحالة «متصل» تلقائياً عند وصول قراءة.', 'It stopped sending for more than 5 minutes: a power or Wi‑Fi drop, or Wasl was closed. Restart it and the status returns to Online as soon as a reading arrives.')}</Help>
      </section>

      <section id="guide-limits" className="guide-section">
        <h3 className="plain">{T('حدود مهمة', 'Good to know')}</h3>
        <p className="guide-limit"><ShieldCheck size={18}/><span>{T('استخدم HTTP على شبكة موثوقة فقط؛ البيانات غير مشفرة. لربط أجهزة خارج الشبكة تحتاج إلى بوابة HTTPS أو VPN. هذا الإصدار لا يضم MQTT أو تحديثات OTA أو تحكماً بالمشغلات، ولكل جهاز قناة قياس رقمية واحدة.', 'Use HTTP on a trusted network only; data is not encrypted. Devices outside your network need an HTTPS or VPN gateway. This release has no MQTT, OTA updates, or actuator control, and each device has one numeric channel.')}</span></p>
      </section>
    </article>

    <aside className="guide-side">
      <nav className="panel doc-panel guide-toc" aria-label={tr('محتويات الدليل', 'In this guide')}>
        <h2>{T('في هذا الدليل', 'In this guide')}</h2>
        <ol>{sections.map(section => <li key={section.id}><button onClick={() => jump(section.id)}>{tr(section.ar, section.en)}</button></li>)}</ol>
      </nav>
      <small className="license">MIT · v{runtime?.version || '0.5.0'}</small>
    </aside>
  </div>;
}
