import { t, tr, locale, useLanguage, setLanguage } from './i18n';
import IDE from './IDE';
import type { Preferences } from './types';
import { useCallback, useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { Activity, ArrowDownToLine, ArrowLeft, Bell, BookOpen, Check, CheckCircle2, ChevronLeft, CircleHelp, Copy, Cpu, Database, FolderKanban, GitBranch, Globe2, HardDrive, LayoutDashboard, Network, Plus, Radio, RefreshCw, Search, Settings2, ShieldCheck, Terminal, Wifi, X, Zap } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { demoSnapshot } from './demo';
import type { Device, Period, Reading, Runtime, Snapshot } from './types';
const number = (value: number) => new Intl.NumberFormat(locale(), { maximumFractionDigits: 2 }).format(value);
const getStatusText = () => ({ online: t('متصل'), offline: t('غير متصل'), warning: t('تنبيه'), revoked: t('موقوف') });
const getPages = () => [
    { id: 'overview', name: t('نظرة عامة'), icon: LayoutDashboard },
    { id: 'devices', name: t('الأجهزة'), icon: Cpu },
    { id: 'projects', name: t('المشاريع'), icon: FolderKanban },
    { id: 'telemetry', name: t('القياسات'), icon: Activity },
    { id: 'alerts', name: t('التنبيهات'), icon: Bell },
    { id: 'ide', name: t('بيئة البرمجة'), icon: Terminal },
    { id: 'guide', name: t('دليل الربط'), icon: Terminal },
    { id: 'settings', name: t('الإعدادات'), icon: Settings2 },
];
const empty: Snapshot = { devices: [], points: 0, activity: [], alerts: [] };
function elapsed(time: number | null) {
    if (!time)
        return t('بانتظار أول قراءة');
    const minutes = Math.floor((Date.now() - time) / 60000);
    return minutes < 1 ? t('الآن') : minutes < 60 ? t(`منذ ${number(minutes)} دقيقة`) : t(`منذ ${number(Math.floor(minutes / 60))} ساعة`);
}
function Status({ device }: {
    device: Device;
}) {
    return <span className={`status ${device.status}`}><i />{getStatusText()[device.status]}</span>;
}
function Modal({ title, onClose, children }: {
    title: string;
    onClose: () => void;
    children: ReactNode;
}) {
    const ref = useRef<HTMLDialogElement>(null);
    useEffect(() => { const dialog = ref.current!; dialog.showModal(); return () => dialog.close(); }, []);
    return <dialog ref={ref} aria-labelledby="dialog-title" onCancel={event => { event.preventDefault(); onClose(); }}>
    <div className="modal-heading"><h2 id="dialog-title">{title}</h2><button className="icon-button" aria-label={t("إغلاق")} onClick={onClose}><X size={20}/></button></div>
    {children}
  </dialog>;
}
function Chart({ data, period }: {
    data: Snapshot['activity'];
    period: Period;
}) {
    return <div className="chart" dir="ltr"><ResponsiveContainer width="100%" height="100%" minWidth={0}>
    <AreaChart data={data} margin={{ top: 10, left: -24, right: 15, bottom: 0 }}>
      <defs><linearGradient id="mint" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#18a574" stopOpacity={0.2}/><stop offset="100%" stopColor="#18a574" stopOpacity={0.01}/></linearGradient></defs>
      <CartesianGrid strokeDasharray="3 5" vertical={false} stroke="#e7eee9"/>
      <XAxis dataKey="time" tickFormatter={value => new Date(value).toLocaleString(locale(), period === '7d' ? { day: 'numeric', month: 'short' } : { hour: '2-digit', minute: '2-digit' })} tickLine={false} axisLine={false} minTickGap={30} tick={{ fontSize: 12, fill: '#78887e' }} dy={8}/>
      <YAxis allowDecimals={false} tickFormatter={number} tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#78887e' }}/>
      <Tooltip labelFormatter={label => new Date(Number(label)).toLocaleString(locale())} formatter={value => [number(Number(value)), t('قراءة')]} contentStyle={{ direction: 'rtl', borderRadius: 8, border: '1px solid #e4ebe6', fontFamily: 'Noto Sans Arabic', fontSize: 13 }}/>
      <Area type="monotone" dataKey="messages" stroke="#16a173" strokeWidth={2.5} fill="url(#mint)" isAnimationActive={false}/>
    </AreaChart>
  </ResponsiveContainer></div>;
}
export default function App() {
    const language = useLanguage();
    const pages = getPages();
    const [page, setPage] = useState('overview');
    const [demo, setDemo] = useState(true);
    const [data, setData] = useState<Snapshot>(empty);
    const [runtime, setRuntime] = useState<Runtime | null>(null);
    const [period, setPeriod] = useState<Period>('24h');
    const [query, setQuery] = useState('');
    const [status, setStatus] = useState('all');
    const [project, setProject] = useState('all');
    const [modal, setModal] = useState<'add' | 'detail' | 'token' | 'rotate' | 'revoke' | null>(null);
    const [selected, setSelected] = useState<Device | null>(null);
    const [history, setHistory] = useState<Reading[]>([]);
    const [token, setToken] = useState('');
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [formError, setFormError] = useState('');
    const [notice, setNotice] = useState('');
    const [host, setHost] = useState('127.0.0.1');
    const [port, setPort] = useState(8080);
    const snapshot = demo ? demoSnapshot(period) : data;
    const devices = snapshot.devices;
    const chosen = devices.find(d => d.id === selected?.id) ?? selected;
    const projects = [...new Set(devices.map(d => d.project))];
    const filtered = devices.filter(d => (status === 'all' || d.status === status) && (project === 'all' || d.project === project) && `${d.name} ${d.model} ${d.location} ${d.id}`.toLocaleLowerCase().includes(query.toLocaleLowerCase()));
    const online = devices.filter(d => d.status === 'online').length;
    const endpoint = runtime ? `http://${runtime.settings.host === '0.0.0.0' ? runtime.receiver.addresses[0] || 'YOUR_COMPUTER_IP' : '127.0.0.1'}:${runtime.receiver.port}/api/telemetry` : 'http://127.0.0.1:8080/api/telemetry';
    const refresh = useCallback(async () => {
        try {
            setData(await window.wasl.snapshot(period));
            setRuntime(await window.wasl.runtime());
            setError('');
        }
        catch (e) {
            setError(e instanceof Error ? e.message : t('تعذّر قراءة البيانات المحلية.'));
        }
    }, [period]);
    useEffect(() => {
        if (!window.wasl) {
            setError(t('شغّل تطبيق وصل من ملفه التنفيذي؛ هذه الواجهة مخصصة لبرنامج سطح المكتب.'));
            return;
        }
        let active = true;
        window.wasl.runtime().then(result => { if (active) {
            setHost(result.settings.host);
            setPort(result.settings.port); setLanguage(result.preferences.appLanguage);
        } }).catch(e => setError(e.message));
        refresh();
        const timer = setInterval(refresh, 3000);
        window.wasl.ready();
        return () => { active = false; clearInterval(timer); };
    }, [refresh]);
    useEffect(() => { if (!notice)
        return; const timer = setTimeout(() => setNotice(''), 5000); return () => clearTimeout(timer); }, [notice]);
    useEffect(() => {
        if (!selected || selected.demo || !window.wasl) {
            setHistory([]);
            return;
        }
        let active = true;
        window.wasl.history(selected.id).then(result => { if (active)
            setHistory(result); }).catch(e => setError(e.message));
        return () => { active = false; };
    }, [selected, data.points]);
    async function changePreferences(value: Preferences) {
      const saved = await window.wasl.preferences(value);
      setLanguage(saved.appLanguage);
      setRuntime(current => current ? {...current, preferences:saved} : current);
      setProject('all');
    }
    function navigate(value: string) { setPage(value); setQuery(''); setStatus('all'); setProject('all'); }
    function closeModal() { setModal(null); setToken(''); setFormError(''); }
    function mode(value: boolean) { setDemo(value); setQuery(''); setStatus('all'); setProject('all'); }
    async function copy(value: string) {
        try {
            await navigator.clipboard.writeText(value);
            setNotice(t('تم النسخ إلى الحافظة.'));
        }
        catch {
            setNotice(t('حدد النص وانسخه باستخدام Ctrl+C.'));
        }
    }
    async function register(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setBusy(true);
        setFormError('');
        const values = new FormData(event.currentTarget);
        try {
            const result = await window.wasl.createDevice({ name: String(values.get('name')), model: String(values.get('model')), project: String(values.get('project')), location: String(values.get('location')) });
            setToken(result.token);
            setSelected(result.device);
            mode(false);
            await refresh();
            setModal('token');
        }
        catch (e) {
            setFormError((e as Error).message);
        }
        finally {
            setBusy(false);
        }
    }
    async function credentials(action: 'rotate' | 'revoke') {
        if (!chosen)
            return;
        setBusy(true);
        setFormError('');
        try {
            if (action === 'rotate') {
                const result = await window.wasl.rotateToken(chosen.id);
                setToken(result.token);
                setModal('token');
            }
            else {
                await window.wasl.revokeToken(chosen.id);
                setModal(null);
                setNotice(t('تم إيقاف المفتاح. يمكنك إصدار مفتاح جديد لاحقاً.'));
            }
            await refresh();
        }
        catch (e) {
            setFormError((e as Error).message);
        }
        finally {
            setBusy(false);
        }
    }
    async function exportDevices() {
        try {
            const result = await window.wasl.exportDevices();
            if (!result.canceled)
                setNotice(t('تم تصدير قائمة الأجهزة.'));
        }
        catch (e) {
            setError((e as Error).message);
        }
    }
    async function saveSettings(event: FormEvent) {
        event.preventDefault();
        setBusy(true);
        setFormError('');
        try {
            const result = await window.wasl.saveSettings({ host, port });
            setRuntime(result);
            setNotice(t('تم حفظ إعدادات مستقبل البيانات.'));
        }
        catch (e) {
            setFormError((e as Error).message);
        }
        finally {
            setBusy(false);
        }
    }
    return <div className="shell">
    <aside className="sidebar">
      <div className="brand"><span className="brand-icon"><Radio size={29}/></span><strong>{t("\u0648\u0635\u0644")}</strong><span className="brand-en">wasl</span><span className="edition">{t("\u0633\u0637\u062D \u0627\u0644\u0645\u0643\u062A\u0628")}</span></div>
      <div className="workspace"><span className="workspace-icon"><HardDrive size={20}/></span><div><b>{t("\u0645\u0633\u0627\u062D\u0629 \u0627\u0644\u0639\u0645\u0644 \u0627\u0644\u0645\u062D\u0644\u064A\u0629")}</b><small>{t("\u0646\u0633\u062E\u0629 \u0627\u0644\u0645\u062C\u062A\u0645\u0639 \u00B7 \u0645\u0641\u062A\u0648\u062D\u0629 \u0627\u0644\u0645\u0635\u062F\u0631")}</small></div></div>
      <div className="nav-label">{t("\u0645\u0633\u0627\u062D\u0629 \u0627\u0644\u0639\u0645\u0644")}</div>
      <nav>{pages.slice(0, 5).map(item => <button key={item.id} className={`nav-item ${page === item.id ? 'active' : ''}`} onClick={() => navigate(item.id)}><item.icon size={19}/><span>{item.name}</span>{item.id === 'alerts' && snapshot.alerts.length > 0 && <span className="nav-count">{number(snapshot.alerts.length)}</span>}</button>)}</nav>
      <div className="nav-label second">{t("\u0627\u0644\u062A\u0637\u0648\u064A\u0631 \u0648\u0627\u0644\u0625\u062F\u0627\u0631\u0629")}</div>
      <nav>{pages.slice(5).map(item => <button key={item.id} className={`nav-item ${page === item.id ? 'active' : ''}`} onClick={() => navigate(item.id)}><item.icon size={19}/>{item.name}</button>)}</nav>
      <div className="open-source"><GitBranch size={22}/><h3>{t("\u062A\u0642\u0646\u064A\u0629 \u0646\u0635\u0646\u0639\u0647\u0627 \u0645\u0639\u0627\u064B.")}</h3><p>{t("\u0645\u0641\u062A\u0648\u062D\u0629 \u0627\u0644\u0645\u0635\u062F\u0631. \u062A\u0639\u0645\u0644 \u0645\u062D\u0644\u064A\u0627\u064B.")}<br />{t("\u0628\u064A\u0627\u0646\u0627\u062A\u0643 \u0639\u0644\u0649 \u062C\u0647\u0627\u0632\u0643.")}</p><button onClick={() => navigate('guide')}>{t("\u062A\u0639\u0631\u0651\u0641 \u0639\u0644\u0649 \u0648\u0635\u0644 ")}<ArrowLeft size={16}/></button><small>MIT LICENSE</small></div>
      <div className="sidebar-bottom"><ShieldCheck size={18}/><span>{t("\u0644\u0627 \u062A\u062D\u062A\u0627\u062C \u0625\u0644\u0649 \u062D\u0633\u0627\u0628 \u0633\u062D\u0627\u0628\u064A")}</span></div>
    </aside>
    <div className="app">
      <header className="topbar"><div className="breadcrumb"><span>{t("\u0648\u0635\u0644")}</span><ChevronLeft size={14}/><b>{pages.find(p => p.id === page)?.name}</b></div><div className="top-actions"><span className="local-label"><HardDrive size={15}/>{t("\u064A\u0639\u0645\u0644 \u0639\u0644\u0649 \u062C\u0647\u0627\u0632\u0643")}</span><span className={`receiver-state ${runtime?.receiver.running ? 'online' : 'offline'}`}><i />{runtime?.receiver.running ? t('المستقبل جاهز') : t('المستقبل غير متاح')}</span><button className="icon-button" aria-label={t("التنبيهات")} onClick={() => navigate('alerts')}><Bell size={19}/></button></div></header>
      <main>
        {page !== 'ide' && <div className="page-heading"><div><div className="eyebrow">{t("\u0639\u0627\u0644\u0645\u0643 \u0627\u0644\u0645\u062A\u0635\u0644\u060C \u0628\u064A\u0646 \u064A\u062F\u064A\u0643")}</div><h1>{page === 'overview' ? t('نظرة على مساحة عملك') : pages.find(p => p.id === page)?.name}</h1><p>{page === 'overview' ? t('أجهزتك وبياناتك ومشاريعك، في مكان واحد.') : page === 'devices' ? t('سجّل عتادك وتابع أحدث قراءاته.') : page === 'projects' ? t('من أول نموذج تجريبي إلى خط الإنتاج.') : page === 'telemetry' ? t('تابع الإشارات القادمة من أجهزتك.') : page === 'alerts' ? t('الأجهزة التي تحتاج إلى انتباهك.') : page === 'settings' ? t('إعدادات الاستقبال والبيانات المحلية.') : t('ابدأ أول اتصال بين عتادك ووصل.')}</p></div>
          <div className="heading-actions"><button className="button" onClick={exportDevices} disabled={demo} title={demo ? t('انتقل إلى أجهزتي لتصدير الأجهزة الفعلية') : t('حفظ ملف CSV')}><ArrowDownToLine size={16}/>{t("\u062A\u0635\u062F\u064A\u0631")}</button><button className="button primary" onClick={() => { setFormError(''); setModal('add'); }}><Plus size={18}/>{t("\u0625\u0636\u0627\u0641\u0629 \u062C\u0647\u0627\u0632")}</button></div>
        </div>}
        {page !== 'ide' && <div className="mode-bar"><div className="segmented" aria-label={t("مصدر البيانات")}><button className={!demo ? 'selected' : ''} aria-pressed={!demo} onClick={() => mode(false)}><Cpu size={15}/>{t("\u0623\u062C\u0647\u0632\u062A\u064A")}</button><button className={demo ? 'selected' : ''} aria-pressed={demo} onClick={() => mode(true)}><Activity size={15}/>{t("\u0628\u064A\u0627\u0646\u0627\u062A \u062A\u062C\u0631\u064A\u0628\u064A\u0629")}</button></div><span>{demo ? t('مساحة للتجربة؛ هذه القراءات لا تأتي من عتاد حقيقي.') : t('تُحفظ البيانات محلياً ويُحدَّث العرض كل ٣ ثوانٍ.')}</span></div>}
        {error && <div className="error" role="alert">{t(error)}<button onClick={refresh}><RefreshCw size={15}/>{t("\u0625\u0639\u0627\u062F\u0629 \u0627\u0644\u0645\u062D\u0627\u0648\u0644\u0629")}</button></div>}
        {runtime?.receiver.error && <div className="warning-banner">{t(runtime.receiver.error)}<button onClick={() => navigate('settings')}>{t("\u0641\u062A\u062D \u0627\u0644\u0625\u0639\u062F\u0627\u062F\u0627\u062A ")}<ArrowLeft size={15}/></button></div>}

        {(page === 'overview' || page === 'telemetry') && <>
          <div className="stats-grid">
            {[
                { label: t('إجمالي الأجهزة'), value: devices.length, foot: t(`موزعة على ${number(projects.length)} مشاريع`), icon: Cpu },
                { label: t('الأجهزة المتصلة'), value: online, foot: devices.length ? t(`${number(Math.round(online / devices.length * 100))}٪ من أجهزتك`) : t('بانتظار أول اتصال'), icon: Wifi },
                { label: t('القراءات المحفوظة'), value: snapshot.points, foot: demo ? t('قراءات توضيحية للتجربة') : t('آخر ٥٠٬٠٠٠ قراءة كحد أقصى'), icon: Activity },
                { label: t('التنبيهات النشطة'), value: snapshot.alerts.length, foot: snapshot.alerts.length ? t('أجهزة تحتاج إلى متابعة') : t('لا توجد تنبيهات حالياً'), icon: Bell },
            ].map((stat, i) => <section className="stat-card" key={stat.label}><div className="stat-label">{stat.label}<stat.icon size={19}/></div><div className="stat-value">{number(stat.value)}{i === 1 && <div className="signal-bars"><i /><i /><i /><i /></div>}{i === 2 && <svg width="85" height="30" viewBox="0 0 85 30" aria-hidden="true"><path d="M1 25L9 23 15 26 23 18 29 21 37 13 43 16 51 10 57 14 65 6 73 9 81 3" fill="none" stroke="#30a77f" strokeWidth="2"/></svg>}</div><div className="stat-footer">{stat.foot}<CircleHelp size={13}/></div></section>)}
          </div>
          <div className="monitor-grid"><section className="panel"><div className="panel-heading"><div><h2>{t("\u0646\u0634\u0627\u0637 \u0627\u0644\u0642\u064A\u0627\u0633\u0627\u062A ")}<span className="live-pill"><i />{demo ? t('تجريبي') : t('محلي')}</span></h2><p>{t("\u0639\u062F\u062F \u0627\u0644\u0642\u0631\u0627\u0621\u0627\u062A \u0627\u0644\u0645\u0633\u062A\u0642\u0628\u0644\u0629 \u062E\u0644\u0627\u0644 \u0627\u0644\u0641\u062A\u0631\u0629 \u0627\u0644\u0645\u062D\u062F\u062F\u0629")}</p></div><div className="period-switch">{(['1h', '24h', '7d'] as Period[]).map(p => <button key={p} className={period === p ? 'selected' : ''} aria-pressed={period === p} onClick={() => setPeriod(p)}>{{ '1h': t('ساعة'), '24h': t('يوم'), '7d': t('أسبوع') }[p]}</button>)}</div></div><div className="chart-legend"><span><i />{t("\u0627\u0644\u0642\u0631\u0627\u0621\u0627\u062A")}</span><span>{t("\u0628\u062A\u0648\u0642\u064A\u062A \u0647\u0630\u0627 \u0627\u0644\u0643\u0645\u0628\u064A\u0648\u062A\u0631")}</span></div><Chart data={snapshot.activity} period={period}/><div className="chart-footer"><span><Radio size={15}/>{demo ? t('استكشف دون توصيل جهاز') : t('استقبال HTTP بمفتاح خاص لكل جهاز')}</span><button onClick={() => navigate('telemetry')}>{t("\u0627\u0633\u062A\u0639\u0631\u0627\u0636 \u0627\u0644\u0642\u064A\u0627\u0633\u0627\u062A ")}<ArrowLeft size={15}/></button></div></section>
            <section className="panel health"><div className="panel-heading"><div><h2>{t("\u062D\u0627\u0644\u0629 \u0627\u0644\u0623\u062C\u0647\u0632\u0629")}</h2><p>{t("\u0646\u0638\u0631\u0629 \u0633\u0631\u064A\u0639\u0629 \u0639\u0644\u0649 \u0634\u0628\u0643\u062A\u0643")}</p></div><ShieldCheck size={21}/></div><div className="donut-wrap"><div className="donut" style={{ background: devices.length ? `conic-gradient(#21a77d 0 ${online / devices.length * 100}%,#e8b85d 0 ${(online + devices.filter(d => d.status === 'warning').length) / devices.length * 100}%,#dfe7e2 0)` : '#e5ebe7' }}><div><strong>{number(devices.length)}</strong><span>{t("\u0625\u062C\u0645\u0627\u0644\u064A \u0627\u0644\u0623\u062C\u0647\u0632\u0629")}</span></div></div></div><div className="health-legend">{(['online', 'warning', 'offline'] as const).map(s => <div key={s}><span><i className={s}/>{getStatusText()[s]}{s === 'offline' && devices.some(d => d.status === 'revoked') ? t(' / موقوف') : ''}</span><b>{number(devices.filter(d => d.status === s || (s === 'offline' && d.status === 'revoked')).length)}</b></div>)}</div></section>
          </div>
        </>}

        {(page === 'overview' || page === 'devices') && <section className="panel device-panel"><div className="panel-heading"><h2>{t("\u0627\u0644\u0623\u062C\u0647\u0632\u0629 ")}<span className="count">{number(devices.length)}</span></h2><button className="text-button" onClick={() => navigate(page === 'devices' ? 'guide' : 'devices')}>{page === 'devices' ? t('دليل الربط') : t('عرض جميع الأجهزة')}<ArrowLeft size={15}/></button></div>
          <div className="table-toolbar"><div className="device-tabs" aria-label={t("حالة الجهاز")}>{[{ value: 'all', text: t('الكل') }, { value: 'online', text: t('متصل') }, { value: 'offline', text: t('غير متصل') }].map(item => <button key={item.value} className={status === item.value ? 'selected' : ''} aria-pressed={status === item.value} onClick={() => setStatus(item.value)}>{item.text}</button>)}</div><div className="filters"><label className="search"><Search size={16}/><input aria-label={t("البحث عن جهاز")} placeholder={t("ابحث عن جهاز...")} value={query} onChange={e => setQuery(e.target.value)}/></label><select aria-label={t("تصفية حسب المشروع")} value={project} onChange={e => setProject(e.target.value)}><option value="all">{t("\u0643\u0644 \u0627\u0644\u0645\u0634\u0627\u0631\u064A\u0639")}</option>{projects.map(p => <option key={p}>{p}</option>)}</select></div></div>
          <div className="table-scroll"><table><thead><tr>{[t('الجهاز'), t('الحالة'), t('المشروع'), t('آخر قراءة'), t('آخر نشاط'), ''].map((name, i) => <th key={i}>{name}</th>)}</tr></thead><tbody>{filtered.slice(0, page === 'overview' ? 5 : 100).map(device => <tr key={device.id}><td><div className="device-name"><span className="device-icon"><Cpu size={20}/></span><div><button onClick={() => { setSelected(device); setModal('detail'); }}>{device.name}</button><small dir="ltr">{device.model}</small></div></div></td><td><Status device={device}/></td><td><span className="project-tag">{device.project}</span></td><td><span className="reading" dir="ltr">{device.value === null ? '—' : number(device.value)} <small>{device.unit}</small></span></td><td><span className="last-seen">{device.demo && device.status !== 'offline' ? t('الآن') : elapsed(device.lastSeen)}</span></td><td><button className="icon-button" aria-label={t(`تفاصيل ${device.name}`)} onClick={() => { setSelected(device); setModal('detail'); }}><ChevronLeft size={18}/></button></td></tr>)}</tbody></table></div>
          {!filtered.length && <div className="empty"><Cpu size={35}/><h3>{devices.length ? t('لم نعثر على أجهزة مطابقة') : t('أول اتصال يبدأ من هنا')}</h3><p>{devices.length ? t('جرّب اسماً آخر أو غيّر مرشحات البحث.') : t('أضف جهازك واحصل على مفتاح لبدء إرسال القياسات.')}</p>{!devices.length && <button className="button primary" onClick={() => setModal('add')}><Plus size={16}/>{t("\u0625\u0636\u0627\u0641\u0629 \u0623\u0648\u0644 \u062C\u0647\u0627\u0632")}</button>}</div>}
          <div className="table-footer"><span>{t("\u0639\u0631\u0636 ")}{number(Math.min(filtered.length, page === 'overview' ? 5 : 100))}{t(" \u0645\u0646 ")}{number(filtered.length)}{t(" \u0623\u062C\u0647\u0632\u0629")}</span><span><i />{demo ? t('مساحة تجريبية') : t('SQLite · تخزين محلي')}</span></div>
        </section>}

        {(page === 'overview' || page === 'projects') && <section className="projects-section"><div className="section-heading"><h2>{t("\u0645\u0634\u0627\u0631\u064A\u0639\u0643 ")}<span className="count">{number(projects.length)}</span></h2>{page === 'overview' && <button className="text-button" onClick={() => navigate('projects')}>{t("\u0643\u0644 \u0627\u0644\u0645\u0634\u0627\u0631\u064A\u0639 ")}<ArrowLeft size={15}/></button>}</div><div className="project-grid">{projects.map((name, i) => <button className="project-card" key={name} onClick={() => { navigate('devices'); setProject(name); }}><div className="project-card-top"><span className={`project-icon color-${i % 4}`}>{i % 3 === 0 ? <Network size={22}/> : i % 3 === 1 ? <Cpu size={22}/> : <Zap size={22}/>}</span><ChevronLeft size={18}/></div><h3>{name}</h3><p>{[...new Set(devices.filter(d => d.project === name).map(d => d.location))].join(' · ')}</p><div className="project-card-bottom"><span><Cpu size={14}/>{number(devices.filter(d => d.project === name).length)}{t(" \u0623\u062C\u0647\u0632\u0629")}</span><span><i />{number(devices.filter(d => d.project === name && d.status === 'online').length)}{t(" \u0645\u062A\u0635\u0644")}</span></div></button>)}</div>{!projects.length && <div className="panel empty"><FolderKanban size={32}/><h3>{t("\u0645\u0634\u0631\u0648\u0639\u0643 \u0627\u0644\u0623\u0648\u0644 \u0628\u0627\u0646\u062A\u0638\u0627\u0631\u0643")}</h3><p>{t("\u0623\u062F\u062E\u0644 \u0627\u0633\u0645 \u0627\u0644\u0645\u0634\u0631\u0648\u0639 \u0639\u0646\u062F \u062A\u0633\u062C\u064A\u0644 \u062C\u0647\u0627\u0632 \u062C\u062F\u064A\u062F.")}</p></div>}</section>}

        {page === 'alerts' && <section className="panel"><div className="panel-heading"><div><h2>{t("\u062A\u0646\u0628\u064A\u0647\u0627\u062A \u0645\u0633\u0627\u062D\u0629 \u0627\u0644\u0639\u0645\u0644")}</h2><p>{demo ? t('أمثلة توضيحية لتنبيهات الأجهزة') : t('يظهر تنبيه عندما يتوقف جهاز سبق له الاتصال عن الإرسال لمدة ٥ دقائق.')}</p></div><span className="count">{number(snapshot.alerts.length)}</span></div>{snapshot.alerts.length ? snapshot.alerts.map(alert => <div className="alert-row" key={alert.id}><span className="alert-icon"><Bell size={22}/></span><div><h3>{t(alert.title)}</h3><p>{alert.name} · {elapsed(alert.lastSeen)}</p></div><button className="button" onClick={() => { setSelected(devices.find(d => d.id === alert.id)!); setModal('detail'); }}>{t("\u062A\u0641\u0627\u0635\u064A\u0644 \u0627\u0644\u062C\u0647\u0627\u0632")}</button></div>) : <div className="empty"><CheckCircle2 size={38}/><h3>{t("\u0643\u0644 \u0634\u064A\u0621 \u0639\u0644\u0649 \u0645\u0627 \u064A\u0631\u0627\u0645")}</h3><p>{t("\u0644\u0627 \u062A\u0648\u062C\u062F \u0623\u062C\u0647\u0632\u0629 \u0627\u0646\u0642\u0637\u0639 \u0627\u062A\u0635\u0627\u0644\u0647\u0627 \u062D\u0627\u0644\u064A\u0627\u064B.")}</p></div>}</section>}

        {page === 'telemetry' && <section className="panel"><div className="panel-heading"><h2>{t("\u0623\u062D\u062F\u062B \u0627\u0644\u0642\u0631\u0627\u0621\u0627\u062A")}</h2><span className="muted">{t("\u0642\u0631\u0627\u0621\u0629 \u0648\u0627\u062D\u062F\u0629 \u0644\u0643\u0644 \u062C\u0647\u0627\u0632")}</span></div><div className="readings-grid">{devices.map(device => <button key={device.id} onClick={() => { setSelected(device); setModal('detail'); }}><span>{device.name}</span><strong dir="ltr">{device.value === null ? '—' : number(device.value)} <small>{device.unit}</small></strong><Status device={device}/></button>)}</div>{!devices.length && <div className="empty"><Activity size={32}/><p>{t("\u0623\u0636\u0641 \u062C\u0647\u0627\u0632\u0627\u064B \u0648\u0623\u0631\u0633\u0644 \u0623\u0648\u0644 \u0642\u0631\u0627\u0621\u0629 \u0644\u0628\u062F\u0621 \u0627\u0644\u0645\u062A\u0627\u0628\u0639\u0629.")}</p></div>}</section>}

        {page === 'guide' && <div className="docs-grid"><article className="panel doc-panel"><span className="doc-label">{t("\u062F\u0644\u064A\u0644 \u0627\u0644\u0645\u0637\u0648\u0651\u0631 / \u0648\u0635\u0644")}</span><h2>{t("\u0627\u0631\u0628\u0637 \u0623\u0648\u0644 \u062C\u0647\u0627\u0632 \u0628\u062E\u0637\u0648\u0627\u062A \u0628\u0633\u064A\u0637\u0629.")}</h2><p>{t("\u0648\u0635\u0644 \u0628\u0631\u0646\u0627\u0645\u062C \u0645\u062D\u0644\u064A \u0644\u0644\u0645\u0647\u0646\u062F\u0633\u064A\u0646 \u0627\u0644\u0643\u0647\u0631\u0628\u0627\u0626\u064A\u064A\u0646 \u0648\u0634\u0631\u0643\u0627\u062A \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A\u0627\u062A \u0648\u0627\u0644\u0645\u062E\u062A\u0628\u0631\u0627\u062A \u0627\u0644\u062C\u0627\u0645\u0639\u064A\u0629 \u0648\u0627\u0644\u0645\u0635\u0627\u0646\u0639 \u0648\u0645\u0637\u0648\u0651\u0631\u064A \u0625\u0646\u062A\u0631\u0646\u062A \u0627\u0644\u0623\u0634\u064A\u0627\u0621.")}</p><h3><span>{t("\u0661")}</span>{t(" \u0633\u062C\u0651\u0644 \u0639\u062A\u0627\u062F\u0643")}</h3><p>{t("\u0627\u0636\u063A\u0637 \u00AB\u0625\u0636\u0627\u0641\u0629 \u062C\u0647\u0627\u0632\u00BB\u060C \u062B\u0645 \u0623\u062F\u062E\u0644 \u0627\u0633\u0645\u0647 \u0648\u0646\u0648\u0639 \u0627\u0644\u0644\u0648\u062D\u0629 \u0648\u0627\u0644\u0645\u0634\u0631\u0648\u0639 \u0648\u0627\u0644\u0645\u0648\u0642\u0639. \u0627\u0646\u0633\u062E \u0645\u0641\u062A\u0627\u062D \u0627\u0644\u0648\u0635\u0648\u0644 \u0627\u0644\u0630\u064A \u0633\u064A\u0638\u0647\u0631 \u0645\u0631\u0629 \u0648\u0627\u062D\u062F\u0629.")}</p><h3><span>{t("\u0662")}</span>{t(" \u062C\u0647\u0651\u0632 \u0627\u0644\u0627\u062A\u0635\u0627\u0644")}</h3><p>{t("\u0644\u0644\u062A\u062C\u0631\u0628\u0629 \u0645\u0646 \u0647\u0630\u0627 \u0627\u0644\u0643\u0645\u0628\u064A\u0648\u062A\u0631\u060C \u0627\u0633\u062A\u062E\u062F\u0645 \u0627\u0644\u0639\u0646\u0648\u0627\u0646 \u0627\u0644\u0645\u062D\u0644\u064A. \u0644\u0631\u0628\u0637 ESP32 \u0623\u0648 \u0644\u0648\u062D\u0629 \u0639\u0644\u0649 \u0646\u0641\u0633 \u0627\u0644\u0634\u0628\u0643\u0629\u060C \u0641\u0639\u0651\u0644 \u00AB\u0627\u0644\u0634\u0628\u0643\u0629 \u0627\u0644\u0645\u062D\u0644\u064A\u0629\u00BB \u0641\u064A \u0627\u0644\u0625\u0639\u062F\u0627\u062F\u0627\u062A\u060C \u062B\u0645 \u0627\u0633\u062A\u062E\u062F\u0645 \u0639\u0646\u0648\u0627\u0646 \u0627\u0644\u0643\u0645\u0628\u064A\u0648\u062A\u0631. \u0623\u0628\u0642\u0650 \u0648\u0635\u0644 \u0645\u0641\u062A\u0648\u062D\u0627\u064B \u0623\u062B\u0646\u0627\u0621 \u0627\u0633\u062A\u0642\u0628\u0627\u0644 \u0627\u0644\u0642\u0631\u0627\u0621\u0627\u062A.")}</p><div className="endpoint"><code dir="ltr">{endpoint}</code><button className="icon-button" aria-label={t("نسخ عنوان الاستقبال")} onClick={() => copy(endpoint)}><Copy size={16}/></button></div><h3><span>{t("\u0663")}</span>{t(" \u0623\u0631\u0633\u0644 \u0623\u0648\u0644 \u0642\u0631\u0627\u0621\u0629")}</h3><p>{t("\u0627\u0633\u062A\u0628\u062F\u0644 ")}<code>DEVICE_TOKEN</code>{t(" \u0628\u0645\u0641\u062A\u0627\u062D \u062C\u0647\u0627\u0632\u0643. \u0639\u0644\u0649 Windows \u0627\u0633\u062A\u062E\u062F\u0645 ")}<code>curl.exe</code>{t(" \u0641\u064A PowerShell.")}</p><pre dir="ltr">{`curl -X POST "${endpoint}" \\\n  -H "Authorization: Bearer DEVICE_TOKEN" \\\n  -H "Content-Type: application/json" \\\n  -d '{"value":26.4,"unit":"C"}'`}</pre><h3><span>{t("\u0664")}</span>{t(" \u062A\u0627\u0628\u0639 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A")}</h3><p>{t("\u0627\u0646\u062A\u0642\u0644 \u0625\u0644\u0649 \u00AB\u0623\u062C\u0647\u0632\u062A\u064A\u00BB. \u0633\u064A\u0638\u0647\u0631 \u0627\u0644\u062C\u0647\u0627\u0632 \u0645\u062A\u0635\u0644\u0627\u064B \u0628\u0639\u062F \u0648\u0635\u0648\u0644 \u0627\u0644\u0642\u0631\u0627\u0621\u0629\u060C \u0648\u062A\u062A\u062D\u062F\u062B \u0627\u0644\u0648\u0627\u062C\u0647\u0629 \u0643\u0644 \u0663 \u062B\u0648\u0627\u0646\u064D. \u064A\u0645\u0643\u0646\u0643 \u0627\u0633\u062A\u0639\u0631\u0627\u0636 \u0622\u062E\u0631 \u0661\u0660\u0660 \u0642\u0631\u0627\u0621\u0629 \u0645\u0646 \u062A\u0641\u0627\u0635\u064A\u0644 \u0627\u0644\u062C\u0647\u0627\u0632.")}</p><div className="doc-note"><ShieldCheck size={23}/><p>{t("\u0627\u0633\u062A\u062E\u062F\u0645 HTTP \u0639\u0644\u0649 \u0634\u0628\u0643\u0629 \u0645\u0648\u062B\u0648\u0642\u0629. \u0644\u0631\u0628\u0637 \u0623\u062C\u0647\u0632\u0629 \u062E\u0627\u0631\u062C \u0627\u0644\u0634\u0628\u0643\u0629 \u062A\u062D\u062A\u0627\u062C \u0625\u0644\u0649 \u0628\u0648\u0627\u0628\u0629 HTTPS \u0623\u0648 VPN. \u0647\u0630\u0627 \u0627\u0644\u0625\u0635\u062F\u0627\u0631 \u0644\u0627 \u064A\u0636\u0645 \u0648\u0633\u064A\u0637 MQTT \u0623\u0648 \u062A\u062D\u062F\u064A\u062B\u0627\u062A OTA \u0623\u0648 \u062A\u062D\u0643\u0645\u0627\u064B \u0628\u0627\u0644\u0645\u0634\u063A\u0644\u0627\u062A.")}</p></div></article><aside className="panel doc-panel"><GitBranch size={30}/><h2>{t("\u0645\u0641\u062A\u0648\u062D \u0644\u0644\u062C\u0645\u064A\u0639.")}</h2><p>{t("\u0645\u0631\u062E\u0651\u0635 \u0628\u0631\u062E\u0635\u0629 MIT. \u064A\u0645\u0643\u0646\u0643 \u0627\u0633\u062A\u062E\u062F\u0627\u0645\u0647 \u0648\u062A\u0639\u062F\u064A\u0644\u0647 \u0648\u0645\u0634\u0627\u0631\u0643\u0629 \u062A\u0637\u0648\u064A\u0631\u0643 \u0639\u0644\u0649 GitHub.")}</p><h3>{t("\u0641\u064A \u0647\u0630\u0627 \u0627\u0644\u0625\u0635\u062F\u0627\u0631")}</h3><ul><li>{t("\u0648\u0627\u062C\u0647\u0629 \u0639\u0631\u0628\u064A\u0629 \u0648\u0627\u062A\u062C\u0627\u0647 \u0645\u0646 \u0627\u0644\u064A\u0645\u064A\u0646 \u0644\u0644\u064A\u0633\u0627\u0631")}</li><li>{t("\u0628\u0631\u0646\u0627\u0645\u062C Windows \u0648Linux \u0645\u0633\u062A\u0642\u0644")}</li><li>{t("\u0623\u062C\u0647\u0632\u0629 \u0648\u0645\u0634\u0627\u0631\u064A\u0639 \u0648\u0642\u0631\u0627\u0621\u0627\u062A \u0645\u062D\u0644\u064A\u0629")}</li><li>{t("\u0645\u0641\u0627\u062A\u064A\u062D \u0648\u0635\u0648\u0644 \u0642\u0627\u0628\u0644\u0629 \u0644\u0644\u062A\u062C\u062F\u064A\u062F \u0648\u0627\u0644\u0625\u064A\u0642\u0627\u0641")}</li><li>{t("\u062A\u0635\u062F\u064A\u0631 CSV \u0648\u0646\u0633\u062E\u0629 \u0627\u062D\u062A\u064A\u0627\u0637\u064A\u0629 SQLite")}</li></ul><div className="doc-note"><HardDrive size={22}/><p>{t("\u0644\u0627 \u064A\u062A\u0637\u0644\u0628 \u0627\u062A\u0635\u0627\u0644\u0627\u064B \u0628\u0627\u0644\u0625\u0646\u062A\u0631\u0646\u062A \u0623\u062B\u0646\u0627\u0621 \u0627\u0644\u0627\u0633\u062A\u062E\u062F\u0627\u0645. \u0627\u0644\u062E\u0637\u0648\u0637 \u0648\u0627\u0644\u0623\u0635\u0648\u0644 \u0645\u0636\u0645\u0646\u0629 \u0641\u064A \u0627\u0644\u0628\u0631\u0646\u0627\u0645\u062C.")}</p></div><small className="license">MIT · v{runtime?.version || '0.2.0'}</small></aside></div>}

        {page === 'settings' && <section className="panel doc-panel language-settings"><h2>{tr('اللغة واتجاه الواجهة','Language & interface')}</h2><p>{tr('اختر لغة التطبيق ورسائل بيئة البرمجة بشكل مستقل. تبقى الشيفرة والمخرجات الأصلية دون ترجمة.','Choose independent languages for the app and IDE messages. Source code and original tool output are never translated.')}</p><div className="language-fields"><label>{tr('لغة التطبيق','App language')}<select value={language} onChange={e => changePreferences({...runtime!.preferences,appLanguage:e.target.value as 'ar'|'en'}).catch(e=>setError(e.message))}><option value="ar">العربية</option><option value="en">English</option></select></label><label>{tr('لغة رسائل طرفية IDE','IDE terminal message language')}<select value={runtime?.preferences.terminalLanguage || 'en'} onChange={e=>changePreferences({...runtime!.preferences,terminalLanguage:e.target.value as 'ar'|'en'}).catch(e=>setError(e.message))}><option value="en">English</option><option value="ar">العربية</option></select></label></div></section>}
        <div hidden={page !== 'ide'}><IDE active={page === 'ide'} preferences={runtime?.preferences || {appLanguage:'ar',terminalLanguage:'en'}} onPreferences={changePreferences}/></div>
        {page === 'settings' && <div className="settings-grid"><section className="panel doc-panel"><Network size={27}/><h2>{t("\u0645\u0633\u062A\u0642\u0628\u0644 \u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0623\u062C\u0647\u0632\u0629")}</h2><p>{t("\u064A\u0633\u062A\u0642\u0628\u0644 \u0627\u0644\u0628\u0631\u0646\u0627\u0645\u062C \u0627\u0644\u0642\u064A\u0627\u0633\u0627\u062A \u0645\u0627 \u062F\u0627\u0645 \u0645\u0641\u062A\u0648\u062D\u0627\u064B. \u0627\u062E\u062A\u0631 \u0645\u0635\u062F\u0631 \u0627\u0644\u0627\u062A\u0635\u0627\u0644 \u0648\u0627\u0644\u0645\u0646\u0641\u0630.")}</p><form onSubmit={saveSettings} className="settings-form"><label className="switch-row"><div><b>{t("\u0627\u0644\u0633\u0645\u0627\u062D \u0628\u0627\u0644\u0627\u062A\u0635\u0627\u0644 \u0645\u0646 \u0627\u0644\u0634\u0628\u0643\u0629 \u0627\u0644\u0645\u062D\u0644\u064A\u0629")}</b><small>{t("\u0644\u062A\u0648\u0635\u064A\u0644 \u0627\u0644\u0644\u0648\u062D\u0627\u062A \u0648\u0627\u0644\u0623\u062C\u0647\u0632\u0629 \u0627\u0644\u0645\u0648\u062C\u0648\u062F\u0629 \u0639\u0644\u0649 \u0646\u0641\u0633 \u0627\u0644\u0634\u0628\u0643\u0629.")}</small></div><input type="checkbox" role="switch" checked={host === '0.0.0.0'} onChange={e => setHost(e.target.checked ? '0.0.0.0' : '127.0.0.1')}/></label><label>{t("\u0645\u0646\u0641\u0630 HTTP")}<input type="number" min={1024} max={65535} step={1} value={port} onChange={e => setPort(Number(e.target.value))} required dir="ltr"/></label>{host === '0.0.0.0' && <div className="doc-note"><Globe2 size={21}/><p>{t("\u0633\u064A\u0633\u0645\u062D \u0647\u0630\u0627 \u0627\u0644\u062E\u064A\u0627\u0631 \u0644\u0644\u0623\u062C\u0647\u0632\u0629 \u0639\u0644\u0649 \u0634\u0628\u0643\u062A\u0643 \u0628\u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0642\u064A\u0627\u0633\u0627\u062A \u0628\u0645\u0641\u0627\u062A\u064A\u062D\u0647\u0627. \u0642\u062F \u062A\u062D\u062A\u0627\u062C \u0625\u0644\u0649 \u0627\u0644\u0633\u0645\u0627\u062D \u0644\u0644\u062A\u0637\u0628\u064A\u0642 \u0639\u0628\u0631 \u062C\u062F\u0627\u0631 \u0627\u0644\u062D\u0645\u0627\u064A\u0629. \u0627\u0633\u062A\u062E\u062F\u0645 \u0634\u0628\u0643\u0629 \u062E\u0627\u0635\u0629 \u0645\u0648\u062B\u0648\u0642\u0629.")}</p></div>}{formError && <p className="form-error" role="alert">{t(formError)}</p>}<button className="button primary" disabled={busy}><Check size={17}/>{busy ? t('جارٍ الحفظ...') : t('حفظ إعدادات الاستقبال')}</button></form><div className="settings-status"><i className={runtime?.receiver.running ? 'green' : ''}/>{runtime?.receiver.running ? t(`يعمل على المنفذ ${number(runtime.receiver.port)}`) : t('المستقبل متوقف')}</div><div className="endpoint"><code dir="ltr">{endpoint}</code><button className="icon-button" aria-label={t("نسخ العنوان")} onClick={() => copy(endpoint)}><Copy size={16}/></button></div></section>
          <section className="panel doc-panel"><Database size={27}/><h2>{t("\u0628\u064A\u0627\u0646\u0627\u062A\u0643\u060C \u0639\u0644\u0649 \u062C\u0647\u0627\u0632\u0643.")}</h2><p>{t("\u064A\u062D\u062A\u0641\u0638 \u0648\u0635\u0644 \u0628\u0622\u062E\u0631 \u0665\u0660\u066C\u0660\u0660\u0660 \u0642\u0631\u0627\u0621\u0629. \u062A\u064F\u062D\u0641\u0638 \u0627\u0644\u0623\u062C\u0647\u0632\u0629 \u0648\u0627\u0644\u0645\u0641\u0627\u062A\u064A\u062D \u0627\u0644\u0645\u0634\u0641\u0651\u0631\u0629 \u062A\u062C\u0632\u0626\u0648\u064A\u0627\u064B \u0641\u064A \u0642\u0627\u0639\u062F\u0629 SQLite \u0645\u062D\u0644\u064A\u0629.")}</p><label className="path-label">{t("\u0645\u062C\u0644\u062F \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A")}<code dir="ltr">{runtime?.dataPath || '—'}</code></label><button className="button" onClick={async () => { try {
            const result = await window.wasl.backup();
            if (!result.canceled)
                setNotice(t('تم حفظ النسخة الاحتياطية. احتفظ بها في مكان آمن.'));
        }
        catch (e) {
            setError((e as Error).message);
        } }}><ArrowDownToLine size={17}/>{t("\u062D\u0641\u0638 \u0646\u0633\u062E\u0629 \u0627\u062D\u062A\u064A\u0627\u0637\u064A\u0629")}</button><h3>{t("\u0627\u0633\u062A\u0639\u0627\u062F\u0629 \u0646\u0633\u062E\u0629 \u0627\u062D\u062A\u064A\u0627\u0637\u064A\u0629")}</h3><p>{t("\u0623\u063A\u0644\u0642 \u0648\u0635\u0644\u060C \u0648\u0627\u062D\u062A\u0641\u0638 \u0628\u0646\u0633\u062E\u0629 \u0645\u0646 \u0642\u0627\u0639\u062F\u0629 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u062D\u0627\u0644\u064A\u0629\u060C \u062B\u0645 \u0627\u0633\u062A\u0628\u062F\u0644 \u0645\u0644\u0641 ")}<code>wasl.sqlite</code>{t(" \u0641\u064A \u0645\u062C\u0644\u062F \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0628\u0646\u0633\u062E\u062A\u0643 \u0627\u0644\u0627\u062D\u062A\u064A\u0627\u0637\u064A\u0629 \u0648\u0627\u0641\u062A\u062D \u0627\u0644\u0628\u0631\u0646\u0627\u0645\u062C \u0645\u0646 \u062C\u062F\u064A\u062F.")}</p><div className="about"><Radio size={23}/><div><b>{t("\u0648\u0635\u0644 \u2014 \u0646\u0633\u062E\u0629 \u0627\u0644\u0645\u062C\u062A\u0645\u0639")}</b><small>v{runtime?.version || '0.2.0'} · {runtime?.platform === 'win32' ? 'Windows' : runtime?.platform === 'linux' ? 'Linux' : t('بيئة التطوير')} · MIT</small></div></div></section>
        </div>}
        <footer><span><Radio size={16}/>{t("\u0648\u0635\u0644 \u00B7 \u0627\u062A\u0635\u0627\u0644\u0627\u062A \u0645\u0641\u062A\u0648\u062D\u0629\u060C \u0648\u0625\u0645\u0643\u0627\u0646\u0627\u062A \u0645\u0634\u062A\u0631\u0643\u0629.")}</span><span>{t("\u0646\u0633\u062E\u0629 \u0627\u0644\u0645\u062C\u062A\u0645\u0639 ")}<i /> v{runtime?.version || '0.2.0'}</span></footer>
      </main>
    </div>

    {modal === 'add' && <Modal title={t("إضافة جهاز جديد")} onClose={closeModal}><p className="modal-description">{t("\u0633\u062C\u0651\u0644 \u0639\u062A\u0627\u062F\u0643 \u0644\u0644\u062D\u0635\u0648\u0644 \u0639\u0644\u0649 \u0645\u0641\u062A\u0627\u062D \u0648\u0635\u0648\u0644 \u062E\u0627\u0635 \u0628\u0647.")}</p><form className="device-form" onSubmit={register}><label>{t("\u0627\u0633\u0645 \u0627\u0644\u062C\u0647\u0627\u0632")}<input name="name" placeholder={t("مثال: حساس البيت البلاستيكي")} required maxLength={80} autoFocus/></label><label>{t("\u0646\u0648\u0639 \u0627\u0644\u0644\u0648\u062D\u0629 \u0648\u0627\u0644\u062D\u0633\u0627\u0633")}<input name="model" placeholder="ESP32 · DHT22" required maxLength={80} dir="auto"/></label><div className="form-pair"><label>{t("\u0627\u0644\u0645\u0634\u0631\u0648\u0639")}<input name="project" placeholder={t("مثال: الزراعة الذكية")} required maxLength={80} list="project-names"/></label><label>{t("\u0627\u0644\u0645\u0648\u0642\u0639")}<input name="location" placeholder={t("مثال: دمشق")} required maxLength={80}/></label></div><datalist id="project-names">{[...new Set(data.devices.map(d => d.project))].map(p => <option key={p} value={p}/>)}</datalist><div className="doc-note"><Cpu size={21}/><p>{t("\u0633\u064A\u0628\u0642\u0649 \u0627\u0644\u062C\u0647\u0627\u0632 \u063A\u064A\u0631 \u0645\u062A\u0635\u0644 \u062D\u062A\u0649 \u064A\u0631\u0633\u0644 \u0623\u0648\u0644 \u0642\u0631\u0627\u0621\u0629 \u0639\u0628\u0631 HTTP.")}</p></div>{formError && <p className="form-error" role="alert">{t(formError)}</p>}<button className="button primary" disabled={busy}>{busy ? t('جارٍ التسجيل...') : t('تسجيل الجهاز')}<Plus size={18}/></button></form></Modal>}
    {modal === 'token' && <Modal title={t("مفتاح جهازك جاهز")} onClose={closeModal}><div className="success-icon"><CheckCircle2 size={34}/></div><p className="modal-description">{t("\u0627\u0646\u0633\u062E \u0647\u0630\u0627 \u0627\u0644\u0645\u0641\u062A\u0627\u062D \u0627\u0644\u0622\u0646. \u0644\u0646 \u064A\u064F\u0639\u0631\u0636 \u0645\u062C\u062F\u062F\u0627\u064B \u0628\u0639\u062F \u0625\u063A\u0644\u0627\u0642 \u0627\u0644\u0646\u0627\u0641\u0630\u0629.")}</p><pre className="token" dir="ltr">{token}</pre><button className="button" onClick={() => copy(token)}><Copy size={16}/>{t("\u0646\u0633\u062E \u0627\u0644\u0645\u0641\u062A\u0627\u062D")}</button><div className="doc-note"><ShieldCheck size={21}/><p>{t("\u0627\u0644\u0645\u0641\u062A\u0627\u062D \u064A\u0633\u0645\u062D \u0628\u0625\u0631\u0633\u0627\u0644 \u0628\u064A\u0627\u0646\u0627\u062A \u0647\u0630\u0627 \u0627\u0644\u062C\u0647\u0627\u0632. \u0644\u0627 \u062A\u0646\u0634\u0631\u0647 \u0641\u064A GitHub. \u064A\u0645\u0643\u0646\u0643 \u062A\u062C\u062F\u064A\u062F\u0647 \u0623\u0648 \u0625\u064A\u0642\u0627\u0641\u0647 \u0645\u0646 \u062A\u0641\u0627\u0635\u064A\u0644 \u0627\u0644\u062C\u0647\u0627\u0632.")}</p></div><button className="button primary full" onClick={() => { closeModal(); navigate('devices'); }}>{t("\u0627\u0644\u0627\u0646\u062A\u0642\u0627\u0644 \u0625\u0644\u0649 \u0623\u062C\u0647\u0632\u062A\u064A ")}<ArrowLeft size={17}/></button></Modal>}
    {modal === 'detail' && chosen && <Modal title={chosen.name} onClose={closeModal}><div className="detail-subtitle"><span dir="ltr">{chosen.model}</span><Status device={chosen}/></div><div className="detail-reading" dir="ltr">{chosen.value === null ? '—' : number(chosen.value)}<small>{chosen.unit}</small></div><div className="detail-grid"><div><small>{t("\u0627\u0644\u0645\u0634\u0631\u0648\u0639")}</small><b>{chosen.project}</b></div><div><small>{t("\u0627\u0644\u0645\u0648\u0642\u0639")}</small><b>{chosen.location}</b></div><div><small>{t("\u0627\u0644\u0628\u0631\u0648\u062A\u0648\u0643\u0648\u0644")}</small><b dir="ltr">{chosen.protocol}</b></div><div><small>{t("\u0622\u062E\u0631 \u0646\u0634\u0627\u0637")}</small><b>{elapsed(chosen.lastSeen)}</b></div></div><div className="device-id"><small>{t("\u0645\u0639\u0631\u0651\u0641 \u0627\u0644\u062C\u0647\u0627\u0632")}</small><code dir="ltr">{chosen.id}</code></div>{chosen.demo ? <div className="doc-note"><Activity size={21}/><p>{t("\u0647\u0630\u0627 \u062C\u0647\u0627\u0632 \u062A\u062C\u0631\u064A\u0628\u064A \u0628\u0628\u064A\u0627\u0646\u0627\u062A \u062A\u0648\u0636\u064A\u062D\u064A\u0629. \u0623\u0636\u0641 \u062C\u0647\u0627\u0632\u0643 \u0644\u062C\u0645\u0639 \u0642\u0631\u0627\u0621\u0627\u062A \u062D\u0642\u064A\u0642\u064A\u0629.")}</p></div> : <><h3 className="history-heading">{t("\u0622\u062E\u0631 \u0627\u0644\u0642\u0631\u0627\u0621\u0627\u062A ")}<span className="count">{number(history.length)}</span></h3><div className="history-list">{history.length ? [...history].reverse().slice(0, 100).map((reading, i) => <div key={i}><time>{new Date(reading.time).toLocaleString(locale())}</time><strong dir="ltr">{number(reading.value)} {reading.unit}</strong></div>) : <p className="muted">{t("\u0644\u0645 \u062A\u0635\u0644 \u0623\u064A \u0642\u0631\u0627\u0621\u0627\u062A \u0628\u0639\u062F. \u0627\u062A\u0628\u0639 \u062F\u0644\u064A\u0644 \u0627\u0644\u0631\u0628\u0637 \u0644\u0625\u0631\u0633\u0627\u0644 \u0623\u0648\u0644 \u0642\u0631\u0627\u0621\u0629.")}</p>}</div><div className="detail-actions"><button className="button" onClick={() => { setFormError(''); setModal('rotate'); }}><RefreshCw size={15}/>{t("\u062A\u062C\u062F\u064A\u062F \u0627\u0644\u0645\u0641\u062A\u0627\u062D")}</button><button className="button danger" disabled={chosen.status === 'revoked'} onClick={() => { setFormError(''); setModal('revoke'); }}>{t("\u0625\u064A\u0642\u0627\u0641 \u0627\u0644\u0645\u0641\u062A\u0627\u062D")}</button></div></>}</Modal>}
    {(modal === 'rotate' || modal === 'revoke') && chosen && <Modal title={modal === 'rotate' ? t('تجديد مفتاح الوصول') : t('إيقاف مفتاح الوصول')} onClose={closeModal}><p className="modal-description">{modal === 'rotate' ? t('سيتوقف المفتاح الحالي عن العمل. حدّث برنامج جهازك بالمفتاح الجديد لاستئناف إرسال القياسات.') : t('سيتوقف استقبال القياسات من هذا الجهاز. ستبقى قراءاته محفوظة، ويمكنك إصدار مفتاح جديد لاحقاً.')}</p>{formError && <p className="form-error" role="alert">{t(formError)}</p>}<div className="detail-actions"><button className="button primary" disabled={busy} onClick={() => credentials(modal)}>{busy ? t('جارٍ التنفيذ...') : t('تأكيد')}</button><button className="button" onClick={() => setModal('detail')}>{t("\u0631\u062C\u0648\u0639")}</button></div></Modal>}
    {notice && <div className="toast" role="status"><CheckCircle2 size={20}/>{t(notice)}<button className="icon-button" aria-label={t("إغلاق الرسالة")} onClick={() => setNotice('')}><X size={16}/></button></div>}
  </div>;
}
