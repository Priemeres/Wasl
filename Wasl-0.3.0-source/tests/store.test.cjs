const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { openStore } = require('../electron/store.cjs');
const { startReceiver } = require('../electron/receiver.cjs');
const input = { name: 'حساس الحرارة', model: 'ESP32', project: "مختبر ' دمشق", location: 'دمشق' };
async function fixture(t) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'wasl-test-'));
  const filename = path.join(directory, 'test.sqlite');
  const store = await openStore(filename);
  t.after(() => { store.close(); fs.rmSync(directory, { recursive: true, force: true }); });
  return { store, filename, directory };
}

test('Arabic device data and measurements survive reopening without storing plaintext keys', async t => {
  const { store, filename } = await fixture(t);
  const { device, token } = store.create(input);
  assert.equal(store.identify(token), device.id);
  assert.equal(store.snapshot().devices[0].status, 'offline');
  store.ingest(device.id, { value: 26.4, unit: '°C' });
  assert.equal(store.snapshot().devices[0].status, 'online');
  assert.equal(store.snapshot().devices[0].project, input.project);
  assert.equal(store.history(device.id)[0].value, 26.4);
  assert.equal(store.snapshot('1h').activity.reduce((sum, row) => sum + row.messages, 0), 1);
  assert.equal(fs.readFileSync(filename).includes(Buffer.from(token)), false);
  assert.equal(Object.keys(store.snapshot().devices[0]).includes('token_hash'), false);
  const reopened = await openStore(filename);
  assert.equal(reopened.identify(token), device.id);
  assert.equal(reopened.snapshot().points, 1);
  reopened.close();
});

test('rotating and revoking a key stops the previous key while preserving history', async t => {
  const { store } = await fixture(t);
  const created = store.create(input);
  store.ingest(created.device.id, { value: 21, unit: 'C' });
  const replacement = store.rotate(created.device.id);
  assert.equal(store.identify(created.token), null);
  assert.equal(store.identify(replacement.token), created.device.id);
  store.revoke(created.device.id);
  assert.equal(store.identify(replacement.token), null);
  assert.equal(store.snapshot().devices[0].status, 'revoked');
  assert.throws(() => store.ingest(created.device.id, { value: 2, unit: 'C' }));
  assert.equal(store.history(created.device.id).length, 1);
});

test('invalid fields, values, intervals and network settings do not corrupt state', async t => {
  const { store } = await fixture(t);
  assert.throws(() => store.create({ ...input, name: ' ' }));
  assert.throws(() => store.create({ ...input, name: 'a'.repeat(81) }));
  const created = store.create(input);
  for (const value of [NaN, Infinity, '26', null]) assert.throws(() => store.ingest(created.device.id, { value, unit: 'C' }));
  assert.throws(() => store.ingest(created.device.id, { value: 1, unit: 'x'.repeat(17) }));
  assert.throws(() => store.saveSettings({ host: 'evil.example', port: 8080 }));
  assert.throws(() => store.saveSettings({ host: '127.0.0.1', port: 80 }));
  assert.throws(() => store.snapshot('invalid'));
  assert.equal(store.snapshot().points, 0);
  assert.deepEqual(store.settings(), { host: '127.0.0.1', port: 8080 });
});

test('backup is a restorable SQLite database with the saved receiver settings', async t => {
  const { store, directory } = await fixture(t);
  store.create(input);
  store.saveSettings({ host: '0.0.0.0', port: 8092 });
  const backup = path.join(directory, 'backup.sqlite');
  store.backup(backup);
  const restored = await openStore(backup);
  assert.equal(restored.snapshot().devices.length, 1);
  assert.deepEqual(restored.settings(), { host: '0.0.0.0', port: 8092 });
  restored.close();
});

test('failed disk persistence rolls back the in-memory mutation', async t => {
  const { store, filename } = await fixture(t);
  fs.renameSync(filename, filename + '.saved');
  fs.mkdirSync(filename);
  assert.throws(() => store.create(input));
  assert.equal(store.snapshot().devices.length, 0);
  fs.rmdirSync(filename);
  fs.renameSync(filename + '.saved', filename);
  store.create(input);
  assert.equal(store.snapshot().devices.length, 1);
});

test('HTTP receiver authenticates, persists data, rejects browser requests and exposes no management API', async t => {
  const { store } = await fixture(t);
  const created = store.create(input);
  const server = await startReceiver(store, { host: '127.0.0.1', port: 0 });
  t.after(() => server.close());
  const url = `http://127.0.0.1:${server.port}`;
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${created.token}` };
  assert.equal((await fetch(url + '/api/devices')).status, 404);
  assert.equal((await fetch(url + '/api/telemetry', { method: 'POST', headers: { ...headers, Origin: 'https://example.com' }, body: '{}' })).status, 403);
  assert.equal((await fetch(url + '/api/telemetry', { method: 'POST', body: '{}' })).status, 401);
  assert.equal((await fetch(url + '/api/telemetry', { method: 'POST', headers, body: JSON.stringify({ value: 23.5, unit: 'C' }) })).status, 201);
  assert.equal(store.snapshot().devices[0].value, 23.5);
  assert.equal((await fetch(url + '/api/telemetry', { method: 'POST', headers, body: '{"value":24,"unit":"C"}' })).status, 429);
  const second = store.create({ ...input, name: 'جهاز ثانٍ' });
  const h2 = { ...headers, Authorization: `Bearer ${second.token}` };
  assert.equal((await fetch(url + '/api/telemetry', { method: 'POST', headers: h2, body: 'x'.repeat(5000) })).status, 413);
  assert.equal((await fetch(url + '/api/telemetry', { method: 'POST', headers: h2, body: '{"value":"bad","unit":"C"}' })).status, 400);
  assert.equal(store.snapshot().points, 1);
  store.revoke(created.device.id);
  assert.equal((await fetch(url + '/api/telemetry', { method: 'POST', headers, body: '{}' })).status, 401);
});
