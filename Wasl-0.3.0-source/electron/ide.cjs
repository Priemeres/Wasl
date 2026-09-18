const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');
const BLINK = `// Wasl Blink example. Code and comments stay in English.
// Select your board, install its core once, then Verify and Upload.
void setup() {
  pinMode(LED_BUILTIN, OUTPUT);
  Serial.begin(115200);
}

void loop() {
  digitalWrite(LED_BUILTIN, HIGH);
  Serial.println("LED ON");
  delay(1000);
  digitalWrite(LED_BUILTIN, LOW);
  Serial.println("LED OFF");
  delay(1000);
}
`;
const SUPPORTED_CORES = ['arduino:avr', 'esp32:esp32'];
const EXTENSIONS = /\.(ino|h|hpp|c|cpp|S)$/;
function validFiles(files, mainName) {
  if (!Array.isArray(files) || files.length < 1 || files.length > 30) throw Error('Invalid sketch files');
  const names = new Set(); let bytes = 0;
  for (const file of files) {
    if (!file || typeof file.name !== 'string' || !/^[A-Za-z_][A-Za-z0-9_.-]*\.(ino|h|hpp|c|cpp|S)$/.test(file.name) || names.has(file.name) || typeof file.content !== 'string') throw Error('Invalid sketch filename');
    names.add(file.name); bytes += Buffer.byteLength(file.content);
  }
  if (bytes > 1024 * 1024 || !names.has(mainName)) throw Error('Sketch must include its main .ino file and be under 1 MB');
  return files.map(f => ({ name: f.name, content: f.content }));
}
function boardName(value) {
  if (typeof value !== 'string' || !/^[A-Za-z0-9_.-]+:[A-Za-z0-9_.-]+:[A-Za-z0-9_.-]+(?::[A-Za-z0-9_.,=+-]+)?$/.test(value) || value.length > 250) throw Error('Select a valid board FQBN');
  return value;
}
function serialPort(value) {
  if (typeof value !== 'string' || !(/^(COM[1-9][0-9]*)$/i.test(value) || /^\/dev\/(tty|cu)[A-Za-z0-9_.-]+$/.test(value))) throw Error('Select a local serial port');
  return value;
}
function createIDE({ directory, executable, dialogs }) {
  fs.mkdirSync(directory, { recursive: true });
  const tools = path.join(directory, 'toolchains');
  const sketches = path.join(directory, 'sketches');
  fs.mkdirSync(sketches, { recursive: true }); fs.mkdirSync(tools, { recursive: true });
  const config = path.join(directory, 'arduino-cli.yaml');
  // JSON-quoted strings are valid YAML scalar values, including Windows backslashes.
  const q = value => JSON.stringify(value);
  fs.writeFileSync(config, `directories:\n  data: ${q(tools)}\n  downloads: ${q(path.join(directory,'downloads'))}\n  user: ${q(path.join(directory,'user'))}\nboard_manager:\n  additional_urls:\n    - https://espressif.github.io/arduino-esp32/package_esp32_index.json\nnetwork:\n  connection_timeout: 30s\n`);
  const draftFile = path.join(directory, 'draft.json');
  let sketch, job = null, monitor = null, boards = [], ports = [], cores = [], logs = [], sequence = 0, dirty = false;
  function log(key, values = {}) { logs.push({ id: ++sequence, kind: 'system', key, values, time: Date.now() }); trim(); }
  function raw(text, stream = 'stdout') { logs.push({ id: ++sequence, kind: 'raw', text: text.replace(/\x1b\[[0-9;]*[a-zA-Z]/g, '').slice(-16000), stream, time: Date.now() }); trim(); }
  function trim() { if (logs.length > 600) logs = logs.slice(-500); }
  function persistDraft() { fs.writeFileSync(draftFile + '.tmp', JSON.stringify({ ...sketch, dirty }), { mode: 0o600 }); fs.renameSync(draftFile + '.tmp', draftFile); }
  function readSketch(folder) {
    const name = path.basename(folder); const main = name + '.ino';
    const files = fs.readdirSync(folder).filter(f => EXTENSIONS.test(f)).map(file => {
      const filename = path.join(folder, file); const stat = fs.lstatSync(filename);
      if (!stat.isFile() || stat.isSymbolicLink() || stat.size > 1024 * 1024) throw Error('Unsupported sketch file');
      return { name: file, content: fs.readFileSync(filename, 'utf8') };
    });
    validFiles(files, main);
    return { folder, name, main, files };
  }
  function createSketch() {
    const name = 'Sketch_' + new Date().toISOString().replace(/[^0-9]/g, '').slice(0,17);
    const folder = path.join(sketches, name); fs.mkdirSync(folder);
    fs.writeFileSync(path.join(folder, name + '.ino'), BLINK);
    sketch = readSketch(folder); dirty = false; persistDraft(); return sketch;
  }
  if (fs.existsSync(draftFile)) {
    try { const draft = JSON.parse(fs.readFileSync(draftFile,'utf8')); if (typeof draft.folder !== 'string' || !fs.existsSync(draft.folder)) throw Error('Missing sketch'); validFiles(draft.files, draft.main); sketch = draft; dirty = !!draft.dirty; }
    catch { createSketch(); }
  } else createSketch();
  function stopChild(child) {
    if (!child || child.exitCode !== null) return;
    if (process.platform === 'win32') spawn('taskkill', ['/pid', String(child.pid), '/t', '/f'], { windowsHide: true, stdio: 'ignore', shell: false });
    else { try { process.kill(-child.pid, 'SIGTERM'); } catch { child.kill('SIGTERM'); } }
  }
  function run(args, { silent = false, streaming = false, timeout = 180000 } = {}) {
    if (!fs.existsSync(executable)) throw Error('Arduino CLI is missing. Run npm run fetch:cli before packaging.');
    const child = spawn(executable, ['--config-file', config, '--no-color', ...args], { cwd: directory, env: { ...process.env, LANG: 'C', LC_ALL: 'C' }, shell: false, windowsHide: true, detached: process.platform !== 'win32', stdio: ['pipe','pipe','pipe'] });
    let stdout = '', stderr = ''; const cap = 4 * 1024 * 1024;
    child.stdout.on('data', bytes => { stdout = (stdout + bytes.toString()).slice(-cap); if (!silent) raw(bytes.toString()); });
    child.stderr.on('data', bytes => { stderr = (stderr + bytes.toString()).slice(-cap); if (!silent) raw(bytes.toString(), 'stderr'); });
    const timer = streaming ? null : setTimeout(() => { log('timeout'); stopChild(child); }, timeout);
    const done = new Promise((resolve, reject) => {
      child.on('error', error => { if(timer)clearTimeout(timer); reject(error); });
      child.on('close', (code, signal) => { if(timer)clearTimeout(timer); resolve({code,signal,stdout,stderr}); });
    });
    return { child, done };
  }
  async function command(args, options) {
    const process = run(args, options); job = process;
    try { return await process.done; } finally { if(job === process) job = null; }
  }
  function ensureIdle() { if (job || monitor) throw Error('Stop the current build or serial monitor first'); }
  async function refresh() {
    ensureIdle();
    for (const [args, apply] of [
      [['board','listall','--json'], data => { boards = data.boards || []; }],
      [['board','list','--json'], data => { ports = (data.detected_ports || data.ports || []).filter(p => p.port?.protocol === 'serial'); }],
      [['core','list','--json'], data => { cores = (data.platforms || []).map(p => ({ id: p.id, installed: p.installed_version || p.installed || '', latest: p.latest_version || p.latest || '', name: p.name || p.id })); }],
    ]) {
      const result = await command(args, { silent: true, timeout: 60000 });
      if (result.code === 0) { try { apply(JSON.parse(result.stdout)); } catch { raw(result.stdout); } }
      else raw(result.stderr || result.stdout, 'stderr');
    }
    log('refreshed'); return state();
  }
  function save(files) {
    const validated = validFiles(files, sketch.main);
    for (const file of validated) {
      const target = path.join(sketch.folder,file.name);
      if (fs.existsSync(target) && fs.lstatSync(target).isSymbolicLink()) throw Error('Refusing to overwrite a symbolic link');
      fs.writeFileSync(target+'.tmp', file.content, 'utf8'); fs.renameSync(target+'.tmp', target);
    }
    sketch.files=validated; dirty=false; persistDraft(); log('saved'); return sketch;
  }
  function state() { return { sketch, dirty, boards, ports, cores, busy: !!job, monitoring: !!monitor, logs, cliAvailable: fs.existsSync(executable), toolchainPath: tools, platform: `${process.platform}-${process.arch}` }; }
  async function build(input, upload) {
    ensureIdle(); const fqbn=boardName(input.fqbn); const port=upload?serialPort(input.port):null;
    save(input.files); log(upload?'uploadStart':'compileStart',{board:fqbn});
    const args=['compile','--fqbn',fqbn,'--warnings','default', '--output-dir',path.join(directory,'build',sketch.name)];
    if(upload) args.push('--upload','--port',port);
    args.push(sketch.folder);
    const result=await command(args,{timeout:600000});
    log(result.code===0?(upload?'uploadSuccess':'compileSuccess'):result.signal?'canceled':'failed',{code:result.code});
    return state();
  }
  async function copyTree(from,to,sourceRoot=from) {
    fs.mkdirSync(to,{recursive:true});
    for(const entry of fs.readdirSync(from,{withFileTypes:true})) {
      const source=path.join(from,entry.name),target=path.join(to,entry.name);
      if(entry.isSymbolicLink()) {
        const link=fs.readlinkSync(source);const resolved=path.resolve(path.dirname(source),link);
        if(path.isAbsolute(link)||!resolved.startsWith(path.resolve(sourceRoot)+path.sep))throw Error('Toolchain symlink escapes the bundle');
        fs.symlinkSync(link,target);continue;
      }
      if(entry.isDirectory())await copyTree(source,target,sourceRoot);
      else if(entry.isFile())fs.copyFileSync(source,target);
    }
  }
  return {
    state,
    updateDraft(files) { sketch.files=validFiles(files,sketch.main); dirty=true; persistDraft(); return { saved: true }; },
    save,
    newSketch() { ensureIdle(); if(dirty)throw Error('Save the current sketch before creating a new one'); log('newSketch'); return createSketch(); },
    async open() { ensureIdle(); if(dirty)throw Error('Save the current sketch before opening another'); const filename=await dialogs.openSketch(); if(!filename)return null; sketch=readSketch(path.dirname(filename));dirty=false;persistDraft();log('opened');return sketch; },
    async exportSketch() { ensureIdle(); const parent=await dialogs.folder('exportSketch');if(!parent)return null;const destination=path.join(parent,sketch.name);if(fs.existsSync(destination))throw Error('A folder with this sketch name already exists');fs.mkdirSync(destination);for(const f of sketch.files)fs.writeFileSync(path.join(destination,f.name),f.content,'utf8');log('exported',{path:destination});return destination; },
    refresh,
    compile: input => build(input,false),
    upload: input => build(input,true),
    async installCore(core) {
      ensureIdle(); if(!SUPPORTED_CORES.includes(core))throw Error('Unsupported core');log('installStart',{core});
      let result=await command(['core','update-index'],{timeout:300000});
      if(result.code===0)result=await command(['core','install',core],{timeout:900000});
      log(result.code===0?'installSuccess':'failed',{code:result.code});return state();
    },
    async monitorStart(input) {
      ensureIdle(); const port=serialPort(input.port),fqbn=boardName(input.fqbn);
      if(![9600,19200,38400,57600,115200,230400].includes(input.baud))throw Error('Invalid baud rate');
      monitor=run(['monitor','--port',port,'--fqbn',fqbn,'--config',`baudrate=${input.baud}`,'--quiet'],{streaming:true});
      const running=monitor;log('monitorStart',{port});
      running.done.then(result=>{if(monitor===running)monitor=null;log('monitorStopped',{code:result.code});}).catch(error=>{if(monitor===running)monitor=null;raw(error.message,'stderr');});
      return state();
    },
    monitorSend(input) { if(!monitor||typeof input.text!=='string'||input.text.length>4096||!['none','lf','crlf'].includes(input.ending))throw Error('Serial monitor is not ready');monitor.child.stdin.write(input.text+{none:'',lf:'\n',crlf:'\r\n'}[input.ending]);return {sent:true}; },
    stop() { if(job)stopChild(job.child);if(monitor)stopChild(monitor.child);log('stopRequested');return {stopping:true}; },
    clearLogs() {logs=[];return state();},
    async exportTools() {
      ensureIdle();const parent=await dialogs.folder('exportTools');if(!parent)return null;const target=path.join(parent,`Wasl-toolchains-${process.platform}-${process.arch}`);if(fs.existsSync(target))throw Error('Export folder already exists');
      fs.mkdirSync(target);await copyTree(tools,path.join(target,'data'));
      const libraries=path.join(directory,'user','libraries');if(fs.existsSync(libraries))await copyTree(libraries,path.join(target,'libraries'));
      fs.writeFileSync(path.join(target,'wasl-toolchains.json'),JSON.stringify({format:1,platform:process.platform,arch:process.arch,cli:'1.5.1'}));log('toolsExported',{path:target});return target;
    },
    async importTools() {
      ensureIdle();const source=await dialogs.folder('importTools');if(!source)return null;
      const manifest=JSON.parse(fs.readFileSync(path.join(source,'wasl-toolchains.json'),'utf8'));
      if(manifest.format!==1||manifest.platform!==process.platform||manifest.arch!==process.arch)throw Error('Toolchains must match this operating system and CPU architecture');
      if(!await dialogs.confirmTools())return null;
      // Stage fully before replacing existing tools; rollback on a failed rename.
      const staged=path.join(directory,'toolchains-import-'+Date.now());await copyTree(path.join(source,'data'),staged);
      const backup=tools+'-previous-'+Date.now();fs.renameSync(tools,backup);
      try{fs.renameSync(staged,tools);}catch(error){fs.renameSync(backup,tools);throw error;}
      if(fs.existsSync(path.join(source,'libraries')))await copyTree(path.join(source,'libraries'),path.join(directory,'user','libraries'));
      log('toolsImported',{path:backup});return state();
    },
    async addLibrary() {ensureIdle();const source=await dialogs.folder('library');if(!source)return null;const name=path.basename(source);if(!/^[A-Za-z0-9_.-]+$/.test(name)||!fs.existsSync(path.join(source,'library.properties')))throw Error('Choose an Arduino library folder containing library.properties');const target=path.join(directory,'user','libraries',name);if(fs.existsSync(target))throw Error('Library already exists');await copyTree(source,target);log('libraryImported',{name});return state();},
    dispose() {if(job)stopChild(job.child);if(monitor)stopChild(monitor.child);},
  };
}
module.exports = { createIDE, validFiles, boardName, serialPort, BLINK };
