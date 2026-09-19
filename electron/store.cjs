const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const initSqlJs = require('sql.js');

const MAX_DEVICES = 100;
const MAX_POINTS = 50000;
const hashToken = token => crypto.createHash('sha256').update(token).digest('hex');
const newToken = () => 'wasl_' + crypto.randomBytes(32).toString('hex');
function field(value, label, max = 80) {
  if (typeof value !== 'string' || !value.trim() || value.trim().length > max) {
    throw new Error(`${label}: أدخل نصاً من حرف واحد إلى ${max} حرفاً.`);
  }
  return value.trim();
}
function validateReading(input) {
  if (!input || typeof input.value !== 'number' || !Number.isFinite(input.value) ||
      typeof input.unit !== 'string' || input.unit.length > 16) {
    throw new Error('أرسل قيمة رقمية محدودة ووحدة لا تتجاوز ١٦ حرفاً.');
  }
  return { value: input.value, unit: input.unit };
}

async function openStore(filename) {
  const SQL = await initSqlJs({ locateFile: file => require.resolve(`sql.js/dist/${file}`) });
  fs.mkdirSync(path.dirname(filename), { recursive: true });
  let db = new SQL.Database(fs.existsSync(filename) ? fs.readFileSync(filename) : undefined);
  db.run('PRAGMA foreign_keys = ON');
  const all = (sql, params = []) => {
    const stmt = db.prepare(sql);
    try { stmt.bind(params); const result = []; while (stmt.step()) result.push(stmt.getAsObject()); return result; }
    finally { stmt.free(); }
  };
  const one = (sql, params = []) => all(sql, params)[0];
  const version = one('PRAGMA user_version').user_version;
  if (version > 1) throw new Error('قاعدة البيانات من إصدار أحدث. حدّث تطبيق وصل.');
  if (version === 0) {
    db.run(`CREATE TABLE devices (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, model TEXT NOT NULL,
      project TEXT NOT NULL, location TEXT NOT NULL, token_hash TEXT UNIQUE,
      created_at INTEGER NOT NULL, last_seen INTEGER, value REAL, unit TEXT NOT NULL DEFAULT ''
    );
    CREATE TABLE telemetry (
      id INTEGER PRIMARY KEY AUTOINCREMENT, device_id TEXT NOT NULL REFERENCES devices(id),
      value REAL NOT NULL, unit TEXT NOT NULL, received_at INTEGER NOT NULL
    );
    CREATE INDEX telemetry_device_time ON telemetry(device_id, received_at);
    CREATE TABLE settings (id INTEGER PRIMARY KEY CHECK (id=1), host TEXT NOT NULL, port INTEGER NOT NULL);
    INSERT INTO settings VALUES (1, '127.0.0.1', 8080);
    PRAGMA user_version = 1;`);
  }
  function persist() {
    const temp = filename + '.tmp';
    const bytes = db.export();
    const fd = fs.openSync(temp, 'w', 0o600);
    try { fs.writeFileSync(fd, bytes); fs.fsyncSync(fd); } finally { fs.closeSync(fd); }
    fs.renameSync(temp, filename);
  }
  // Restore the in-memory state if writing to disk fails, keeping memory and disk consistent.
  function mutate(fn) {
    const before = db.export();
    try { db.run('BEGIN'); const result = fn(); db.run('COMMIT'); persist(); return result; }
    catch (error) { db.close(); db = new SQL.Database(before); db.run('PRAGMA foreign_keys = ON'); throw error; }
  }
  persist();
  const publicDevice = row => ({
    id: row.id, name: row.name, model: row.model, project: row.project, location: row.location,
    value: row.value, unit: row.unit, lastSeen: row.last_seen,
    status: row.token_hash === null ? 'revoked' : row.last_seen && Date.now() - row.last_seen < 300000 ? 'online' : 'offline',
    protocol: 'HTTP',
  });
  const api = {
    create(input) {
      if (!input || typeof input !== 'object') throw new Error('بيانات الجهاز غير صالحة.');
      const device = {
        id: crypto.randomUUID(), name: field(input.name, 'اسم الجهاز'), model: field(input.model, 'نوع اللوحة'),
        project: field(input.project, 'المشروع'), location: field(input.location, 'الموقع'),
      };
      if (one('SELECT COUNT(*) n FROM devices').n >= MAX_DEVICES) throw new Error('الحد الأقصى لهذا الإصدار هو ١٠٠ جهاز.');
      const token = newToken();
      mutate(() => db.run('INSERT INTO devices(id,name,model,project,location,token_hash,created_at) VALUES(?,?,?,?,?,?,?)',
        [device.id, device.name, device.model, device.project, device.location, hashToken(token), Date.now()]));
      return { device: publicDevice(one('SELECT * FROM devices WHERE id=?', [device.id])), token };
    },
    identify(token) {
      if (typeof token !== 'string' || !/^wasl_[a-f0-9]{64}$/.test(token)) return null;
      return one('SELECT id FROM devices WHERE token_hash=?', [hashToken(token)])?.id ?? null;
    },
    ingest(deviceId, input) {
      const reading = validateReading(input);
      if (!one('SELECT id FROM devices WHERE id=? AND token_hash IS NOT NULL', [deviceId])) throw new Error('الجهاز غير موجود أو تم إيقاف مفتاحه.');
      const now = Date.now();
      mutate(() => {
        db.run('INSERT INTO telemetry(device_id,value,unit,received_at) VALUES(?,?,?,?)', [deviceId, reading.value, reading.unit, now]);
        db.run('UPDATE devices SET value=?,unit=?,last_seen=? WHERE id=?', [reading.value, reading.unit, now, deviceId]);
        // Keep the newest 50,000 measurements across the workspace to bound local storage.
        db.run('DELETE FROM telemetry WHERE id <= (SELECT MAX(id)-? FROM telemetry)', [MAX_POINTS]);
      });
      return { accepted: true, deviceId, receivedAt: now };
    },
    snapshot(period = '24h') {
      if (!['1h', '24h', '7d'].includes(period)) throw new Error('الفترة الزمنية غير صالحة.');
      const duration = { '1h': 3600000, '24h': 86400000, '7d': 604800000 }[period];
      const now = Date.now(), start = now - duration, bin = duration / 24;
      const activity = all('SELECT CAST((received_at-?)/? AS INTEGER) bucket,COUNT(*) messages FROM telemetry WHERE received_at>=? GROUP BY bucket', [start, bin, start]);
      const devices = all('SELECT * FROM devices ORDER BY created_at DESC').map(publicDevice);
      return {
        devices, points: one('SELECT COUNT(*) n FROM telemetry').n,
        activity: Array.from({ length: 24 }, (_, i) => ({ time: start + i * bin, messages: activity.find(b => b.bucket === i)?.messages ?? 0 })),
        alerts: devices.filter(d => d.status === 'offline' && d.lastSeen).map(d => ({ id: d.id, title: 'توقف الجهاز عن الإرسال', name: d.name, lastSeen: d.lastSeen })),
      };
    },
    history(id) { return all('SELECT value,unit,received_at AS time FROM telemetry WHERE device_id=? ORDER BY received_at DESC,id DESC LIMIT 100', [field(id, 'معرّف الجهاز')]).reverse(); },
    rotate(id) {
      if (!one('SELECT id FROM devices WHERE id=?', [field(id, 'معرّف الجهاز')])) throw new Error('الجهاز غير موجود.');
      const token = newToken();
      mutate(() => db.run('UPDATE devices SET token_hash=?,last_seen=NULL WHERE id=?', [hashToken(token), id]));
      return { token };
    },
    revoke(id) {
      if (!one('SELECT id FROM devices WHERE id=?', [field(id, 'معرّف الجهاز')])) throw new Error('الجهاز غير موجود.');
      mutate(() => db.run('UPDATE devices SET token_hash=NULL WHERE id=?', [id]));
      return { revoked: true };
    },
    settings() { return one('SELECT host,port FROM settings WHERE id=1'); },
    saveSettings(input) {
      if (!input || !['127.0.0.1', '0.0.0.0'].includes(input.host) || !Number.isInteger(input.port) || input.port < 1024 || input.port > 65535) throw new Error('اختر منفذاً بين ١٠٢٤ و٦٥٥٣٥.');
      mutate(() => db.run('UPDATE settings SET host=?,port=? WHERE id=1', [input.host, input.port]));
      return api.settings();
    },
    backup(destination) { fs.writeFileSync(destination, db.export(), { mode: 0o600 }); },
    close() { db.close(); },
  };
  return api;
}
module.exports = { openStore, validateReading, hashToken };
