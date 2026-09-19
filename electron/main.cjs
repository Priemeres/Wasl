const { app, BrowserWindow, ipcMain, dialog, Menu, session } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const os = require('node:os');
const { pathToFileURL } = require('node:url');
const { openStore } = require('./store.cjs');
const { startReceiver } = require('./receiver.cjs');
const { openPreferences } = require('./preferences.cjs');
const { createIDE } = require('./ide.cjs');

const smoke = process.argv.includes('--smoke-test');
const uiTest = process.argv.includes('--ui-test');
let smokeDir;
if (smoke || uiTest) { smokeDir = fs.mkdtempSync(path.join(os.tmpdir(), 'wasl-smoke-')); app.setPath('userData', smokeDir); }
app.setName('Wasl');
if (!smoke && !uiTest && !app.requestSingleInstanceLock()) app.quit();
let preferences, ide;
const label = (ar,en) => preferences?.get().appLanguage === 'en' ? en : ar;
let window, store, receiver, receiverError = '', reconfiguring = false;
const rendererPath = path.join(__dirname, '../dist/index.html');
const rendererURL = pathToFileURL(rendererPath).href;
const csvCell = value => {
  let text = String(value ?? '');
  if (/^[\s]*[=+\-@\t\r]/.test(text)) text = "'" + text;
  return '"' + text.replaceAll('"', '""') + '"';
};
function runtime() {
  const addresses = Object.values(os.networkInterfaces()).flat().filter(n => n && n.family === 'IPv4' && !n.internal).map(n => n.address);
  return { preferences: preferences.get(), version: app.getVersion(), platform: process.platform, dataPath: app.getPath('userData'), settings: store.settings(), receiver: { running: !!receiver, error: receiverError, addresses, port: receiver?.port ?? store.settings().port } };
}
function handle(name, fn) {
  ipcMain.handle(name, async (event, input) => {
    if (!window || event.sender.id !== window.webContents.id || event.senderFrame !== window.webContents.mainFrame || event.senderFrame.url !== rendererURL) throw new Error('Unauthorized sender');
    try { return { ok: true, data: await fn(input) }; }
    catch (error) { return { ok: false, error: error.message || 'تعذّر إتمام العملية.' }; }
  });
}
function rebuildMenu() {
  Menu.setApplicationMenu(Menu.buildFromTemplate([
    {label:label('ملف','File'),submenu:[{label:label('إغلاق وصل','Quit Wasl'),role:'quit'}]},
    {label:label('تحرير','Edit'),submenu:[{label:label('تراجع','Undo'),role:'undo'},{label:label('إعادة','Redo'),role:'redo'},{type:'separator'},{label:label('قص','Cut'),role:'cut'},{label:label('نسخ','Copy'),role:'copy'},{label:label('لصق','Paste'),role:'paste'},{label:label('تحديد الكل','Select all'),role:'selectAll'}]},
    {label:label('عرض','View'),submenu:[{label:label('تكبير','Zoom in'),role:'zoomIn'},{label:label('تصغير','Zoom out'),role:'zoomOut'},{label:label('الحجم الأصلي','Actual size'),role:'resetZoom'},{label:label('ملء الشاشة','Full screen'),role:'togglefullscreen'}]},
  ]));
}
async function configure(input) {
  if (reconfiguring) throw new Error('جارٍ تحديث إعدادات الاستقبال.');
  if (!input || !['127.0.0.1', '0.0.0.0'].includes(input.host) || !Number.isInteger(input.port) || input.port < 1024 || input.port > 65535) throw new Error('اختر منفذاً بين ١٠٢٤ و٦٥٥٣٥.');
  reconfiguring = true;
  const previous = store.settings();
  try {
    if (receiver) await receiver.close(); receiver = undefined;
    try {
      receiver = await startReceiver(store, input);
      store.saveSettings(input); receiverError = '';
    } catch (error) {
      if (receiver) await receiver.close(); receiver = undefined;
      try { receiver = await startReceiver(store, previous); receiverError = ''; }
      catch { receiverError = 'تعذّر تشغيل مستقبل البيانات. اختر منفذاً آخر.'; }
      throw new Error(error.code === 'EADDRINUSE' ? 'المنفذ مستخدم. اختر منفذاً آخر.' : 'تعذّر حفظ إعدادات الاستقبال. تحقق من المنفذ ومساحة القرص.');
    }
    return runtime();
  } finally { reconfiguring = false; }
}
app.whenReady().then(async () => {
  try {
    store = await openStore(path.join(app.getPath('userData'), 'wasl.sqlite'));
    preferences = openPreferences(app.getPath('userData'));
    const target = `${{win32:'win',linux:'linux',darwin:'mac'}[process.platform]}-${process.arch}`;
    const binary = process.platform === 'win32' ? 'arduino-cli.exe' : 'arduino-cli';
    const executable = app.isPackaged ? path.join(process.resourcesPath,'arduino-cli',binary) : path.join(__dirname,'../vendor/arduino-cli',target,binary);
    ide = createIDE({ directory: path.join(app.getPath('userData'),'ide'), executable, dialogs: {
      openSketch: async () => { const result = await dialog.showOpenDialog(window, {title:label('فتح مشروع Arduino','Open Arduino sketch'),properties:['openFile'],filters:[{name:'Arduino sketch',extensions:['ino']}]}); return result.canceled ? null : result.filePaths[0]; },
      folder: async purpose => { const titles = {exportSketch:['تصدير نسخة من المشروع','Export sketch copy'],exportTools:['تصدير حزمة أدوات دون إنترنت','Export offline toolchains'],importTools:['استيراد حزمة أدوات موثوقة','Import trusted toolchains'],library:['استيراد مكتبة Arduino محلية','Import local Arduino library']};const result = await dialog.showOpenDialog(window,{title:label(...titles[purpose]),properties:['openDirectory','createDirectory']});return result.canceled ? null : result.filePaths[0]; },
      confirmTools: async () => (await dialog.showMessageBox(window,{type:'warning',title:label('استيراد أدوات محلية','Import local toolchains'),message:label('قد تشغّل أدوات الحزمة برامج على جهازك أثناء التجميع. استورد فقط حزمة من مصدر تثق به. ستُحفظ الأدوات الحالية كنسخة سابقة.','Toolchains execute programs during compilation. Import only a bundle from a trusted source. Current tools will be kept as a previous copy.'),buttons:[label('إلغاء','Cancel'),label('استيراد','Import')],defaultId:0,cancelId:0})).response===1,
    }});
    handle('wasl:preferences', input => { const saved=preferences.set(input); rebuildMenu(); return saved; });
    for(const [name,method] of Object.entries({state:'state',draft:'updateDraft',save:'save',new:'newSketch',open:'open',export:'exportSketch',refresh:'refresh',compile:'compile',upload:'upload',install:'installCore',monitor:'monitorStart',send:'monitorSend',stop:'stop',clear:'clearLogs',exportTools:'exportTools',importTools:'importTools',library:'addLibrary'})) handle('ide:'+name, input=>ide[method](input));
    if (!smoke) {
      try { receiver = await startReceiver(store, store.settings()); }
      catch { receiverError = 'تعذّر تشغيل مستقبل البيانات. قد يكون المنفذ ٨٠٨٠ مستخدماً. غيّره من الإعدادات.'; }
    }
    session.defaultSession.setPermissionRequestHandler((_contents, _permission, callback) => callback(false));
    session.defaultSession.setPermissionCheckHandler(() => false);
    handle('wasl:snapshot', period => store.snapshot(period));
    handle('wasl:create', input => store.create(input));
    handle('wasl:history', id => store.history(id));
    handle('wasl:rotate', id => store.rotate(id));
    handle('wasl:revoke', id => store.revoke(id));
    handle('wasl:runtime', () => runtime());
    handle('wasl:settings', configure);
    handle('wasl:export', async () => {
      const result = await dialog.showSaveDialog(window, { title: label('تصدير قائمة الأجهزة','Export devices'), defaultPath: 'wasl-devices.csv', filters: [{ name: 'CSV', extensions: ['csv'] }] });
      if (result.canceled || !result.filePath) return { canceled: true };
      const status = { online: 'متصل', offline: 'غير متصل', revoked: 'موقوف' };
      const rows = [['المعرّف','الجهاز','اللوحة','المشروع','الموقع','الحالة','القيمة','الوحدة'], ...store.snapshot().devices.map(d => [d.id,d.name,d.model,d.project,d.location,status[d.status],d.value,d.unit])];
      fs.writeFileSync(result.filePath, '\ufeff' + rows.map(row => row.map(csvCell).join(',')).join('\r\n'), 'utf8');
      return { canceled: false };
    });
    handle('wasl:backup', async () => {
      const result = await dialog.showSaveDialog(window, { title: label('حفظ نسخة احتياطية','Save backup'), defaultPath: `wasl-backup-${new Date().toISOString().slice(0,10)}.sqlite`, filters: [{ name: 'SQLite', extensions: ['sqlite'] }] });
      if (result.canceled || !result.filePath) return { canceled: true };
      store.backup(result.filePath); return { canceled: false };
    });
    window = new BrowserWindow({ width: 1360, height: 900, minWidth: 900, minHeight: 650, show: !smoke, backgroundColor: '#f6f8f7', title: 'وصل — منصة إنترنت الأشياء', icon: path.join(__dirname, '../assets/icon.png'), webPreferences: { preload: path.join(__dirname, 'preload.cjs'), contextIsolation: true, nodeIntegration: false, sandbox: true, webSecurity: true, spellcheck: false } });
    window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
    window.webContents.on('will-navigate', event => event.preventDefault());
    window.webContents.on('will-attach-webview', event => event.preventDefault());
    rebuildMenu();

    if (smoke) {
      const timeout = setTimeout(() => { console.error('Desktop smoke test timed out'); app.exit(1); }, 20000);
      app.once('quit', () => clearTimeout(timeout));
      ipcMain.once('wasl:ready', async event => {
        if (event.sender.id !== window.webContents.id) return;
        try {
          const created = store.create({ name: 'جهاز اختبار', model: 'ESP32', project: 'مختبر', location: 'دمشق' });
          const id = store.identify(created.token);
          store.ingest(id, { value: 25, unit: '°C' });
          if (store.snapshot().points !== 1) throw Error('Persistence check failed');
          console.log('PASS: Electron renderer, preload bridge, Arabic UI, and local database'); app.quit();
        } catch (error) { console.error(error); app.exit(1); }
      });
    }
    await window.loadFile(rendererPath);
  } catch (error) {
    if (smoke) { console.error(error); app.exit(1); }
    else { dialog.showErrorBox('تعذّر فتح وصل', 'تعذّر فتح قاعدة البيانات المحلية. احتفظ بنسخة منها وتحقق من صلاحيات الكتابة ومساحة القرص.\n' + error.message); app.quit(); }
  }
});
app.on('second-instance', () => { if (window) { if (window.isMinimized()) window.restore(); window.focus(); } });
app.on('window-all-closed', () => app.quit());
app.on('will-quit', () => { if (ide) ide.dispose(); if (receiver) receiver.close(); if (store) store.close(); if (smokeDir) {
    // Chromium may still hold cache files open during will-quit on Windows.
    // Test-profile cleanup must not interrupt application shutdown.
    try { fs.rmSync(smokeDir, { recursive: true, force: true }); }
    catch (error) { console.warn('Temporary test profile cleanup deferred:', error.code); }
  } });
