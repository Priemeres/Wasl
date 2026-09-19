import { t, tr, locale, useLanguage, setLanguage } from './i18n';
import IDE from './IDE';
import type { Preferences } from './types';
import { useCallback, useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { Activity, ArrowDownToLine, ArrowLeft, Bell, BookOpen, Check, CheckCircle2, ChevronLeft, Copy, Cpu, Database, FolderKanban, GitBranch, Globe2, HardDrive, LayoutDashboard, Network, Plus, Radio, RefreshCw, Search, Settings2, ShieldCheck, Terminal, X } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { demoSnapshot } from './demo';
import appIcon from '../assets/icon.svg';
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
    { id: 'guide', name: t('دليل الربط'), icon: BookOpen },
    { id: 'settings', name: t('الإعدادات'), icon: Settings2 },
];
const empty: Snapshot = { devices: [], points: 0, activity: [], alerts: [] };
function elapsed(time: number | null) {
    if (!time)
        return t('بانتظار أول قراءة');
    const minutes = Math.floor((Date.now() - time) / 60000);
    return minutes < 1 ? t('الآن') : new Intl.RelativeTimeFormat(locale(), {numeric: 'always'}).format(minutes < 60 ? -minutes : -Math.floor(minutes / 60), minutes < 60 ? 'minute' : 'hour');
}
function Status({ device }: {
    device: Device;
}) {
    return <span className={`status ${device.status}`}><i aria-hidden="true" />{getStatusText()[device.status]}</span>;
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
            <CartesianGrid strokeDasharray="3 5" vertical={false} stroke="#c9a05a" strokeOpacity={0.16}/>
      <XAxis dataKey="time" tickFormatter={value => new Date(value).toLocaleString(locale(), period === '7d' ? { day: 'numeric', month: 'short' } : { hour: '2-digit', minute: '2-digit' })} tickLine={false} axisLine={false} minTickGap={30} tick={{ fontSize: 12, fill: '#a3b1c4' }} dy={8}/>
      <YAxis allowDecimals={false} tickFormatter={number} tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#a3b1c4' }}/>
      <Tooltip labelFormatter={label => new Date(Number(label)).toLocaleString(locale())} formatter={value => [number(Number(value)), t('قراءة')]} cursor={{ stroke: '#c9a05a', strokeOpacity: 0.5 }} contentStyle={{ direction: document.documentElement.dir as 'rtl' | 'ltr', borderRadius: 3, border: '1px solid #6b5a3a', background: '#12223a', color: '#efe7d5', fontFamily: 'Noto Sans Arabic', fontSize: 13 }} itemStyle={{ color: '#e2bd7b' }} labelStyle={{ color: '#a3b1c4' }}/>
      <Area type="monotone" dataKey="messages" stroke="#e2bd7b" strokeWidth={2} fill="none" isAnimationActive={false}/>
    </AreaChart>
  </ResponsiveContainer></div>;
}
const ARC = 150;
const polar = (angle: number, radius: number) => { const a = (angle - 90) * Math.PI / 180; return [130 + radius * Math.cos(a), 130 + radius * Math.sin(a)] as const; };
function Dial({ devices }: { devices: Device[] }) {
    const total = devices.length;
    const online = devices.filter(d => d.status === 'online').length;
    const needle = total ? -ARC + (online / total) * ARC * 2 : -ARC;
    const size = Math.max(3.2, Math.min(8, 9.5 - total * 0.09));
    const steps = total > 0 ? Math.min(total, 20) : 10;
    const ticks = Array.from({ length: steps + 1 }, (_, i) => { const major = steps % 2 === 0 && i === steps / 2; const angle = -ARC + (i / steps) * ARC * 2; const [x1, y1] = polar(angle, major ? 99 : 104); const [x2, y2] = polar(angle, 112); return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} className={major ? 'dial-tick major' : 'dial-tick'}/>; });
    const [zx, zy] = polar(-ARC, 90), [fx, fy] = polar(ARC, 90);
    const marks = devices.map((device, i) => {
        const angle = total === 1 ? 0 : -ARC + 12 + (i / (total - 1)) * (ARC * 2 - 24);
        const [x, y] = polar(angle, 82);
        const key = device.id;
        if (device.status === 'online') return <circle key={key} cx={x} cy={y} r={size} className="mark-online"/>;
        if (device.status === 'warning') return <path key={key} className="mark-warning" d={`M${x} ${y - size * 1.25}L${x + size * 1.15} ${y + size * 0.85}L${x - size * 1.15} ${y + size * 0.85}Z`}/>;
        return <g key={key} className="mark-offline"><circle cx={x} cy={y} r={size - 0.8}/>{device.status === 'revoked' && <line x1={x - size} y1={y + size} x2={x + size} y2={y - size}/>}</g>;
    });
    return <svg className="dial" viewBox="0 0 260 260" role="img" aria-label={tr(`${online} من ${total} أجهزة متصلة`, `${online} of ${total} devices online`)}>
      <circle cx="130" cy="130" r="126" className="dial-bezel"/><circle cx="130" cy="130" r="120" className="dial-bezel fine"/>
      {ticks}
      <path className="dial-arc" d={`M${polar(-ARC, 82).join(' ')}A82 82 0 1 1 ${polar(ARC, 82).join(' ')}`}/>
      {marks}
      <g className="dial-needle" style={{ ['--to' as string]: `${needle}deg` }}><line x1="130" y1="130" x2="130" y2="62"/><path d="M130 52L125 66h10z"/></g>
      <circle cx="130" cy="130" r="5" className="dial-hub"/>
      <text x={zx} y={zy + 5} textAnchor="middle" className="dial-end">0</text><text x={fx} y={fy + 5} textAnchor="middle" className="dial-end">{total}</text>
      <text x="130" y="200" textAnchor="middle" className="dial-value">{number(online)}</text>
      <text x="130" y="221" textAnchor="middle" className="dial-caption">{tr(`متصل من ${number(total)}`, `online of ${number(total)}`)}</text>
    </svg>;
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
      <div className="brand"><img className="brand-icon" src={appIcon} alt="" width={44} height={44}/><div className="brand-name"><strong>{t("وصل")}</strong><span className="brand-en">wasl</span></div><p className="brand-tag">{t("عالمك المتصل، بين يديك")}</p></div>
      <div className="nav-label">{t("مساحة العمل")}</div>
      <nav>{pages.slice(0, 5).map(item => <button key={item.id} className={`nav-item ${page === item.id ? 'active' : ''}`} aria-current={page === item.id ? 'page' : undefined} onClick={() => navigate(item.id)}><item.icon size={18}/><span>{item.name}</span>{item.id === 'alerts' && snapshot.alerts.length > 0 && <span className="nav-count">{number(snapshot.alerts.length)}</span>}</button>)}</nav>
      <div className="nav-label second">{t("التطوير والإدارة")}</div>
      <nav>{pages.slice(5).map(item => <button key={item.id} className={`nav-item ${page === item.id ? 'active' : ''}`} aria-current={page === item.id ? 'page' : undefined} onClick={() => navigate(item.id)}><item.icon size={18}/><span>{item.name}</span></button>)}</nav>
      <div className="sidebar-bottom"><p><ShieldCheck size={15}/>{t("لا تحتاج إلى حساب سحابي")}</p><p>{t("مساحة العمل المحلية")} · {t("الإصدار المجتمعي · مفتوحة المصدر")}</p><button onClick={() => navigate('guide')}>{t("تعرّف على وصل ")}<ArrowLeft size={14}/></button><small>MIT LICENSE · {t("سطح المكتب")}</small></div>
    </aside>
    <div className="app">
      <header className="topbar"><div className="breadcrumb"><span>{t("وصل")}</span><ChevronLeft size={14}/><b>{pages.find(p => p.id === page)?.name}</b></div><div className="top-actions"><button className="language-toggle" data-testid="app-language-toggle" disabled={!runtime} lang={language === 'ar' ? 'en' : 'ar'} aria-label={language === 'ar' ? 'Switch app language to English' : 'تغيير لغة التطبيق إلى العربية'} onClick={() => { if (runtime) changePreferences({...runtime.preferences, appLanguage: language === 'ar' ? 'en' : 'ar'}).catch(e => setError(e.message)); }}><Globe2 size={17}/><span>{language === 'ar' ? 'English' : 'العربية'}</span></button><span className="local-label"><HardDrive size={15}/>{t("يعمل على جهازك")}</span><span className={`receiver-state ${runtime?.receiver.running ? 'online' : 'offline'}`}><i />{runtime?.receiver.running ? t('استقبال البيانات مفعّل') : t('استقبال البيانات غير متاح')}</span><button className="icon-button" aria-label={t("التنبيهات")} onClick={() => navigate('alerts')}><Bell size={19}/></button></div></header>
      <main>
        {page !== 'ide' && <div className={`page-heading ${page === 'overview' ? 'scaled' : ''}`}><div><h1>{page === 'overview' ? t('نظرة على مساحة عملك') : pages.find(p => p.id === page)?.name}</h1><p>{page === 'overview' ? t('أجهزتك وبياناتك ومشاريعك، في مكان واحد.') : page === 'devices' ? t('أضف أجهزتك وتابع أحدث قراءاتها.') : page === 'projects' ? t('من أول نموذج تجريبي إلى خط الإنتاج.') : page === 'telemetry' ? t('تابع الإشارات القادمة من أجهزتك.') : page === 'alerts' ? t('الأجهزة التي تحتاج إلى انتباهك.') : page === 'settings' ? t('إعدادات الاستقبال والبيانات المحلية.') : t('تعرّف على طريقة توصيل جهازك ببرنامج وصل.')}</p></div>
          <div className="heading-actions"><button className="button" onClick={exportDevices} disabled={demo} title={demo ? t('انتقل إلى أجهزتي لتصدير الأجهزة الفعلية') : t('حفظ ملف CSV')}><ArrowDownToLine size={16}/>{t("تصدير")}</button><button className="button primary" onClick={() => { setFormError(''); setModal('add'); }}><Plus size={18}/>{t("إضافة جهاز")}</button></div>
        </div>}
        {page !== 'ide' && <div className="mode-bar"><div className="segmented" aria-label={t("مصدر البيانات")}><button className={!demo ? 'selected' : ''} aria-pressed={!demo} onClick={() => mode(false)}><Cpu size={15}/>{t("أجهزتي")}</button><button className={demo ? 'selected' : ''} aria-pressed={demo} onClick={() => mode(true)}><Activity size={15}/>{t("بيانات تجريبية")}</button></div><span>{demo ? t('بيانات توضيحية للتجربة، وليست قراءات من أجهزة حقيقية.') : t('تُحفظ البيانات محلياً ويُحدَّث العرض كل ٣ ثوانٍ.')}</span></div>}
        {error && <div className="error" role="alert">{t(error)}<button onClick={refresh}><RefreshCw size={15}/>{t("إعادة المحاولة")}</button></div>}
        {runtime?.receiver.error && <div className="warning-banner">{t(runtime.receiver.error)}<button onClick={() => navigate('settings')}>{t("فتح الإعدادات ")}<ArrowLeft size={15}/></button></div>}

        {(page === 'overview' || page === 'telemetry') && <>
          <div className="monitor-grid">
            <section className="panel health"><div className="panel-heading"><div><h2>{t("حالة الأجهزة")}</h2><p>{t("نظرة سريعة على شبكتك")}</p></div></div>
              <Dial devices={devices}/>
              <div className="health-legend">{(['online', 'warning', 'offline'] as const).map(s => <div key={s}><span className={`status ${s}`}><i aria-hidden="true"/>{getStatusText()[s]}{s === 'offline' && devices.some(d => d.status === 'revoked') ? t(' / موقوف') : ''}</span><b>{number(devices.filter(d => d.status === s || (s === 'offline' && d.status === 'revoked')).length)}</b></div>)}</div>
              <dl className="stats-grid">
                {[
                    { label: t('إجمالي الأجهزة'), value: devices.length, foot: tr(`عدد المشاريع: ${number(projects.length)}`, `Across ${number(projects.length)} projects`) },
                    { label: t('القراءات المحفوظة'), value: snapshot.points, foot: demo ? t('قراءات توضيحية للتجربة') : t('آخر ٥٠٬٠٠٠ قراءة كحد أقصى') },
                    { label: t('التنبيهات النشطة'), value: snapshot.alerts.length, foot: snapshot.alerts.length ? t('أجهزة تحتاج إلى متابعة') : t('لا توجد تنبيهات حالياً') },
                ].map(stat => <div className="stat-card" key={stat.label}><div className="stat-label"><dt>{stat.label}</dt><small className="stat-footer">{stat.foot}</small></div><dd className="stat-value">{number(stat.value)}</dd></div>)}
              </dl>
            </section>
            <section className="panel plot-panel"><div className="panel-heading"><div><h2>{t("القراءات الواردة ")}<span className="live-pill"><i />{demo ? t('تجريبي') : t('محلي')}</span></h2><p>{t("عدد القراءات المستقبلة خلال الفترة المحددة")}</p></div><div className="period-switch">{(['1h', '24h', '7d'] as Period[]).map(p => <button key={p} className={period === p ? 'selected' : ''} aria-pressed={period === p} onClick={() => setPeriod(p)}>{{ '1h': t('ساعة'), '24h': t('يوم'), '7d': t('أسبوع') }[p]}</button>)}</div></div><div className="chart-legend"><span><i />{t("القراءات")}</span><span>{t("بتوقيت هذا الكمبيوتر")}</span></div><Chart data={snapshot.activity} period={period}/><div className="chart-footer"><span><Radio size={15}/>{demo ? t('استكشف دون توصيل جهاز') : t('استقبال HTTP بمفتاح خاص لكل جهاز')}</span><button onClick={() => navigate('telemetry')}>{t("استعراض القياسات ")}<ArrowLeft size={15}/></button></div></section>
          </div>
        </>}

        {(page === 'overview' || page === 'devices') && <section className="panel device-panel"><div className="panel-heading"><h2>{page === 'devices' ? tr('كل الأجهزة المسجلة', 'All registered devices') : t("الأجهزة ")}<span className="count">{number(devices.length)}</span></h2><button className="text-button" onClick={() => navigate(page === 'devices' ? 'guide' : 'devices')}>{page === 'devices' ? t('دليل الربط') : t('عرض جميع الأجهزة')}<ArrowLeft size={15}/></button></div>
          <div className="table-toolbar"><div className="device-tabs" aria-label={t("حالة الجهاز")}>{[{ value: 'all', text: t('الكل') }, { value: 'online', text: t('متصل') }, { value: 'offline', text: t('غير متصل') }].map(item => <button key={item.value} className={status === item.value ? 'selected' : ''} aria-pressed={status === item.value} onClick={() => setStatus(item.value)}>{item.text}</button>)}</div><div className="filters"><label className="search"><Search size={16}/><input aria-label={t("البحث عن جهاز")} placeholder={t("ابحث عن جهاز...")} value={query} onChange={e => setQuery(e.target.value)}/></label><select aria-label={t("تصفية حسب المشروع")} value={project} onChange={e => setProject(e.target.value)}><option value="all">{t("كل المشاريع")}</option>{projects.map(p => <option key={p}>{p}</option>)}</select></div></div>
          <div className="table-scroll"><table><thead><tr>{[t('الجهاز'), t('الحالة'), t('المشروع'), t('آخر قراءة'), t('آخر اتصال'), ''].map((name, i) => <th key={i}>{name}</th>)}</tr></thead><tbody>{filtered.slice(0, page === 'overview' ? 5 : 100).map(device => <tr key={device.id}><td><div className="device-name"><div><button onClick={() => { setSelected(device); setModal('detail'); }}>{device.name}</button><small dir="ltr">{device.model}</small></div></div></td><td><Status device={device}/></td><td><span className="project-tag">{device.project}</span></td><td><span className={`reading ${device.status === 'online' ? '' : 'stale'}`} dir="ltr">{device.value === null ? '—' : number(device.value)} <small>{device.unit}</small></span></td><td><span className="last-seen">{device.demo && device.status !== 'offline' ? t('الآن') : elapsed(device.lastSeen)}</span></td><td><button className="icon-button" aria-label={t(`تفاصيل ${device.name}`)} onClick={() => { setSelected(device); setModal('detail'); }}><ChevronLeft size={18}/></button></td></tr>)}</tbody></table></div>
          {!filtered.length && <div className="empty"><Cpu size={35}/><h3>{devices.length ? t('لم نعثر على أجهزة مطابقة') : t('أول اتصال يبدأ من هنا')}</h3><p>{devices.length ? t('جرّب اسماً آخر أو غيّر خيارات التصفية.') : t('أضف جهازك واحصل على مفتاح لبدء إرسال القياسات.')}</p>{!devices.length && <button className="button primary" onClick={() => setModal('add')}><Plus size={16}/>{t("إضافة أول جهاز")}</button>}</div>}
          <div className="table-footer"><span>{tr('الأجهزة المعروضة:', 'Devices shown:')} {number(Math.min(filtered.length, page === 'overview' ? 5 : 100))} {t('من')} {number(filtered.length)}</span><span><i />{demo ? t('مساحة تجريبية') : t('SQLite · تخزين محلي')}</span></div>
        </section>}

        {(page === 'overview' || page === 'projects') && <section className="projects-section"><div className="section-heading"><h2>{page === 'projects' ? tr('المشاريع المسجلة', 'Registered projects') : t("مشاريعك ")}<span className="count">{number(projects.length)}</span></h2>{page === 'overview' && <button className="text-button" onClick={() => navigate('projects')}>{t("كل المشاريع ")}<ArrowLeft size={15}/></button>}</div><div className="project-grid">{projects.map(name => <button className="project-card" key={name} onClick={() => { navigate('devices'); setProject(name); }}><div className="project-card-top"><h3>{name}</h3><ChevronLeft size={18}/></div><p>{[...new Set(devices.filter(d => d.project === name).map(d => d.location))].join(' · ')}</p><div className="project-card-bottom"><span><Cpu size={14}/>{tr('الأجهزة:', 'Devices:')} {number(devices.filter(d => d.project === name).length)}</span><span><i />{tr('المتصلة:', 'Online:')} {number(devices.filter(d => d.project === name && d.status === 'online').length)}</span></div></button>)}</div>{!projects.length && <div className="panel empty"><FolderKanban size={32}/><h3>{t("مشروعك الأول بانتظارك")}</h3><p>{t("أدخل اسم المشروع عند تسجيل جهاز جديد.")}</p></div>}</section>}

        {page === 'alerts' && <section className="panel"><div className="panel-heading"><div><h2>{t("تنبيهات مساحة العمل")}</h2><p>{demo ? t('أمثلة توضيحية لتنبيهات الأجهزة') : t('يظهر تنبيه عندما يتوقف جهاز سبق له الاتصال عن الإرسال لمدة ٥ دقائق.')}</p></div><span className="count">{number(snapshot.alerts.length)}</span></div>{snapshot.alerts.length ? snapshot.alerts.map(alert => <div className="alert-row" key={alert.id}><span className="alert-icon"><Bell size={22}/></span><div><h3>{t(alert.title)}</h3><p>{alert.name} · {elapsed(alert.lastSeen)}</p></div><button className="button" onClick={() => { setSelected(devices.find(d => d.id === alert.id)!); setModal('detail'); }}>{t("تفاصيل الجهاز")}</button></div>) : <div className="empty"><CheckCircle2 size={38}/><h3>{t("كل شيء على ما يرام")}</h3><p>{t("لا توجد أجهزة انقطع اتصالها حالياً.")}</p></div>}</section>}

        {page === 'telemetry' && <section className="panel"><div className="panel-heading"><h2>{t("أحدث القراءات")}</h2><span className="muted">{t("أحدث قراءة من كل جهاز")}</span></div><div className="readings-grid">{devices.map(device => <button key={device.id} onClick={() => { setSelected(device); setModal('detail'); }}><span>{device.name}</span><strong dir="ltr">{device.value === null ? '—' : number(device.value)} <small>{device.unit}</small></strong><Status device={device}/></button>)}</div>{!devices.length && <div className="empty"><Activity size={32}/><p>{t("أضف جهازاً وأرسل أول قراءة لبدء المتابعة.")}</p></div>}</section>}

        {page === 'guide' && <div className="docs-grid"><article className="panel doc-panel"><h2>{t("اربط أول جهاز بخطوات بسيطة.")}</h2><p>{t("وصل برنامج محلي للمهندسين الكهربائيين وشركات الإلكترونيات والمختبرات الجامعية والمصانع ومطوّري إنترنت الأشياء.")}</p><h3><span>{t("١")}</span>{t(" أضف جهازك")}</h3><p>{t("اضغط «إضافة جهاز»، ثم أدخل اسمه ونوع اللوحة والمشروع والموقع. انسخ مفتاح الوصول الذي سيظهر مرة واحدة.")}</p><h3><span>{t("٢")}</span>{t(" جهّز الاتصال")}</h3><p>{t("للتجربة من هذا الكمبيوتر، استخدم العنوان المحلي. لربط ESP32 أو لوحة على نفس الشبكة، فعّل «الشبكة المحلية» في الإعدادات، ثم استخدم عنوان الكمبيوتر. أبقِ وصل مفتوحاً أثناء استقبال القراءات.")}</p><div className="endpoint"><code dir="ltr">{endpoint}</code><button className="icon-button" aria-label={t("نسخ عنوان الاستقبال")} onClick={() => copy(endpoint)}><Copy size={16}/></button></div><h3><span>{t("٣")}</span>{t(" أرسل أول قراءة")}</h3><p>{t("استبدل ")}<code>DEVICE_TOKEN</code>{t(" بمفتاح جهازك. على Windows استخدم ")}<code>curl.exe</code>{t(" في PowerShell.")}</p><pre dir="ltr">{`curl -X POST "${endpoint}" \\\n  -H "Authorization: Bearer DEVICE_TOKEN" \\\n  -H "Content-Type: application/json" \\\n  -d '{"value":26.4,"unit":"C"}'`}</pre><h3><span>{t("٤")}</span>{t(" تابع البيانات")}</h3><p>{t("انتقل إلى «أجهزتي». سيظهر الجهاز متصلاً بعد وصول القراءة، وتتحدث الواجهة كل ٣ ثوانٍ. يمكنك استعراض آخر ١٠٠ قراءة من تفاصيل الجهاز.")}</p><div className="doc-note"><ShieldCheck size={23}/><p>{t("استخدم HTTP على شبكة موثوقة. لربط أجهزة خارج الشبكة تحتاج إلى بوابة HTTPS أو VPN. هذا الإصدار لا يضم وسيط MQTT أو تحديثات OTA أو تحكماً بالمشغلات.")}</p></div></article><aside className="panel doc-panel"><GitBranch size={30}/><h2>{t("مفتوح للجميع.")}</h2><p>{t("مرخّص برخصة MIT. يمكنك استخدامه وتعديله ومشاركة تطويرك على GitHub.")}</p><h3>{t("في هذا الإصدار")}</h3><ul><li>{t("واجهة بالعربية والإنجليزية مع دعم اتجاه الكتابة")}</li><li>{t("برنامج Windows وLinux مستقل")}</li><li>{t("أجهزة ومشاريع وقراءات محلية")}</li><li>{t("مفاتيح وصول قابلة للتجديد والإيقاف")}</li><li>{t("تصدير CSV ونسخة احتياطية SQLite")}</li></ul><div className="doc-note"><HardDrive size={22}/><p>{t("تعمل لوحة المتابعة دون إنترنت، والخطوط والملفات اللازمة مضمنة في البرنامج. تتطلب البرمجة تثبيت أدوات اللوحة مرة واحدة أو استيرادها محلياً.")}</p></div><small className="license">MIT · v{runtime?.version || '0.2.0'}</small></aside></div>}

        {page === 'settings' && <section className="panel doc-panel language-settings"><h2>{tr('اللغة','Language & interface')}</h2><p>{tr('اختر لغة الواجهة ولغة رسائل بيئة البرمجة كلّاً على حدة. تبقى الشيفرة ورسائل المترجم والأجهزة دون تغيير.','Choose independent languages for the app and IDE messages. Source code and original tool output are never translated.')}</p><div className="language-fields"><label>{tr('لغة التطبيق','App language')}<select disabled={!runtime} value={language} onChange={e => changePreferences({...runtime!.preferences,appLanguage:e.target.value as 'ar'|'en'}).catch(e=>setError(e.message))}><option value="ar">العربية</option><option value="en">English</option></select></label><label>{tr('لغة رسائل بيئة البرمجة','IDE terminal message language')}<select disabled={!runtime} value={runtime?.preferences.terminalLanguage || 'en'} onChange={e=>changePreferences({...runtime!.preferences,terminalLanguage:e.target.value as 'ar'|'en'}).catch(e=>setError(e.message))}><option value="en">English</option><option value="ar">العربية</option></select></label></div></section>}
        <div hidden={page !== 'ide'}><IDE active={page === 'ide'} preferences={runtime?.preferences || {appLanguage:'ar',terminalLanguage:'en'}} onPreferences={changePreferences}/></div>
        {page === 'settings' && <div className="settings-grid"><section className="panel doc-panel"><Network size={27}/><h2>{t("مستقبل بيانات الأجهزة")}</h2><p>{t("يستقبل البرنامج القراءات ما دام مفتوحاً. حدّد إعدادات الشبكة ورقم المنفذ.")}</p><form onSubmit={saveSettings} className="settings-form"><label className="switch-row"><div><b>{t("السماح بالاتصال من الشبكة المحلية")}</b><small>{t("لتوصيل اللوحات والأجهزة الموجودة على نفس الشبكة.")}</small></div><input type="checkbox" role="switch" checked={host === '0.0.0.0'} onChange={e => setHost(e.target.checked ? '0.0.0.0' : '127.0.0.1')}/></label><label>{t("منفذ HTTP")}<input type="number" min={1024} max={65535} step={1} value={port} onChange={e => setPort(Number(e.target.value))} required dir="ltr"/></label>{host === '0.0.0.0' && <div className="doc-note"><Globe2 size={21}/><p>{t("سيسمح هذا الخيار للأجهزة على شبكتك بإرسال القياسات بمفاتيحها. قد تحتاج إلى السماح للتطبيق عبر جدار الحماية. استخدم شبكة خاصة موثوقة.")}</p></div>}{formError && <p className="form-error" role="alert">{t(formError)}</p>}<button className="button primary" disabled={busy}><Check size={17}/>{busy ? t('جارٍ الحفظ...') : t('حفظ إعدادات الاستقبال')}</button></form><div className="settings-status"><i className={runtime?.receiver.running ? 'green' : ''}/>{runtime?.receiver.running ? t(`يعمل على المنفذ ${number(runtime.receiver.port)}`) : t('استقبال البيانات متوقف')}</div><div className="endpoint"><code dir="ltr">{endpoint}</code><button className="icon-button" aria-label={t("نسخ العنوان")} onClick={() => copy(endpoint)}><Copy size={16}/></button></div></section>
          <section className="panel doc-panel"><Database size={27}/><h2>{t("بياناتك، على جهازك.")}</h2><p>{t("يحتفظ وصل بآخر ٥٠٬٠٠٠ قراءة في قاعدة بيانات SQLite على جهازك. تُحفظ مفاتيح الوصول بصيغة تجزئة آمنة، ولا تُخزّن كنص صريح.")}</p><label className="path-label">{t("مجلد البيانات")}<code dir="ltr">{runtime?.dataPath || '—'}</code></label><button className="button" onClick={async () => { try {
            const result = await window.wasl.backup();
            if (!result.canceled)
                setNotice(t('تم حفظ النسخة الاحتياطية. احتفظ بها في مكان آمن.'));
        }
        catch (e) {
            setError((e as Error).message);
        } }}><ArrowDownToLine size={17}/>{t("حفظ نسخة احتياطية")}</button><h3>{t("استعادة نسخة احتياطية")}</h3><p>{t("أغلق وصل، واحتفظ بنسخة من قاعدة البيانات الحالية، ثم استبدل ملف ")}<code>wasl.sqlite</code>{t(" في مجلد البيانات بنسختك الاحتياطية وافتح البرنامج من جديد.")}</p><div className="about"><Radio size={23}/><div><b>{t("وصل — الإصدار المجتمعي")}</b><small>v{runtime?.version || '0.2.0'} · {runtime?.platform === 'win32' ? 'Windows' : runtime?.platform === 'linux' ? 'Linux' : t('بيئة التطوير')} · MIT</small></div></div></section>
        </div>}
        <footer><span><Radio size={16}/>{t("وصل · اتصالات مفتوحة، وإمكانات مشتركة.")}</span><span>{t("الإصدار المجتمعي ")}<i /> v{runtime?.version || '0.2.0'}</span></footer>
      </main>
    </div>

    {modal === 'add' && <Modal title={t("إضافة جهاز جديد")} onClose={closeModal}><p className="modal-description">{t("أضف جهازك للحصول على مفتاح وصول خاص به.")}</p><form className="device-form" onSubmit={register}><label>{t("اسم الجهاز")}<input name="name" placeholder={t("مثال: حساس البيت البلاستيكي")} required maxLength={80} autoFocus/></label><label>{t("نوع اللوحة والحساس")}<input name="model" placeholder="ESP32 · DHT22" required maxLength={80} dir="auto"/></label><div className="form-pair"><label>{t("المشروع")}<input name="project" placeholder={t("مثال: الزراعة الذكية")} required maxLength={80} list="project-names"/></label><label>{t("الموقع")}<input name="location" placeholder={t("مثال: دمشق")} required maxLength={80}/></label></div><datalist id="project-names">{[...new Set(data.devices.map(d => d.project))].map(p => <option key={p} value={p}/>)}</datalist><div className="doc-note"><Cpu size={21}/><p>{t("سيبقى الجهاز غير متصل حتى يرسل أول قراءة عبر HTTP.")}</p></div>{formError && <p className="form-error" role="alert">{t(formError)}</p>}<button className="button primary" disabled={busy}>{busy ? t('جارٍ التسجيل...') : t('تسجيل الجهاز')}<Plus size={18}/></button></form></Modal>}
    {modal === 'token' && <Modal title={t("مفتاح جهازك جاهز")} onClose={closeModal}><div className="success-icon"><CheckCircle2 size={34}/></div><p className="modal-description">{t("انسخ هذا المفتاح الآن. لن يُعرض مجدداً بعد إغلاق النافذة.")}</p><pre className="token" dir="ltr">{token}</pre><button className="button" onClick={() => copy(token)}><Copy size={16}/>{t("نسخ المفتاح")}</button><div className="doc-note"><ShieldCheck size={21}/><p>{t("المفتاح يسمح بإرسال بيانات هذا الجهاز. لا تنشره في GitHub. يمكنك تجديده أو إيقافه من تفاصيل الجهاز.")}</p></div><button className="button primary full" onClick={() => { closeModal(); navigate('devices'); }}>{t("الانتقال إلى أجهزتي ")}<ArrowLeft size={17}/></button></Modal>}
    {modal === 'detail' && chosen && <Modal title={chosen.name} onClose={closeModal}><div className="detail-subtitle"><span dir="ltr">{chosen.model}</span><Status device={chosen}/></div><div className="detail-reading" dir="ltr">{chosen.value === null ? '—' : number(chosen.value)}<small>{chosen.unit}</small></div><div className="detail-grid"><div><small>{t("المشروع")}</small><b>{chosen.project}</b></div><div><small>{t("الموقع")}</small><b>{chosen.location}</b></div><div><small>{t("البروتوكول")}</small><b dir="ltr">{chosen.protocol}</b></div><div><small>{t("آخر اتصال")}</small><b>{elapsed(chosen.lastSeen)}</b></div></div><div className="device-id"><small>{t("معرّف الجهاز")}</small><code dir="ltr">{chosen.id}</code></div>{chosen.demo ? <div className="doc-note"><Activity size={21}/><p>{t("هذا جهاز تجريبي ببيانات توضيحية. أضف جهازك لجمع قراءات حقيقية.")}</p></div> : <><h3 className="history-heading">{t("آخر القراءات ")}<span className="count">{number(history.length)}</span></h3><div className="history-list">{history.length ? [...history].reverse().slice(0, 100).map((reading, i) => <div key={i}><time>{new Date(reading.time).toLocaleString(locale())}</time><strong dir="ltr">{number(reading.value)} {reading.unit}</strong></div>) : <p className="muted">{t("لم تصل أي قراءات بعد. اتبع دليل الربط لإرسال أول قراءة.")}</p>}</div><div className="detail-actions"><button className="button" onClick={() => { setFormError(''); setModal('rotate'); }}><RefreshCw size={15}/>{t("تجديد المفتاح")}</button><button className="button danger" disabled={chosen.status === 'revoked'} onClick={() => { setFormError(''); setModal('revoke'); }}>{t("إيقاف المفتاح")}</button></div></>}</Modal>}
    {(modal === 'rotate' || modal === 'revoke') && chosen && <Modal title={modal === 'rotate' ? t('تجديد مفتاح الوصول') : t('إيقاف مفتاح الوصول')} onClose={closeModal}><p className="modal-description">{modal === 'rotate' ? t('سيتوقف المفتاح الحالي عن العمل. حدّث برنامج جهازك بالمفتاح الجديد لاستئناف إرسال القياسات.') : t('سيتوقف استقبال القياسات من هذا الجهاز. ستبقى قراءاته محفوظة، ويمكنك إصدار مفتاح جديد لاحقاً.')}</p>{formError && <p className="form-error" role="alert">{t(formError)}</p>}<div className="detail-actions"><button className="button primary" disabled={busy} onClick={() => credentials(modal)}>{busy ? t('جارٍ التنفيذ...') : t('تأكيد')}</button><button className="button" onClick={() => setModal('detail')}>{t("رجوع")}</button></div></Modal>}
    {notice && <div className="toast" role="status"><CheckCircle2 size={20}/>{t(notice)}<button className="icon-button" aria-label={t("إغلاق الرسالة")} onClick={() => setNotice('')}><X size={16}/></button></div>}
  </div>;
}
