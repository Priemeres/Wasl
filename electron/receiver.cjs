const http = require('node:http');
function startReceiver(store, { host, port }) {
  return new Promise((resolve, reject) => {
    const limits = new Map();
    const server = http.createServer(async (request, response) => {
      const json = (status, body) => { response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' }); response.end(JSON.stringify(body)); };
      if (request.headers.origin) return json(403, { error: 'Browser-origin requests are not accepted.' });
      if (request.method === 'GET' && request.url === '/health') return json(200, { service: 'wasl', status: 'ok' });
      if (request.method !== 'POST' || request.url !== '/api/telemetry') return json(404, { error: 'Not found' });
      const auth = request.headers.authorization || '';
      const deviceId = auth.startsWith('Bearer ') ? store.identify(auth.slice(7)) : null;
      if (!deviceId) return json(401, { error: 'Invalid device token' });
      if (!request.headers['content-type']?.startsWith('application/json')) return json(415, { error: 'Use application/json' });
      if (Number(request.headers['content-length']) > 4096) return json(413, { error: 'Payload too large' });
      const now = Date.now();
      if (now - (limits.get(deviceId) || 0) < 1000) return json(429, { error: 'Maximum one reading per second per device' });
      limits.set(deviceId, now);
      try {
        let total = 0; const chunks = [];
        for await (const chunk of request) {
          total += chunk.length;
          if (total > 4096) { json(413, { error: 'Payload too large' }); return; }
          chunks.push(chunk);
        }
        let input;
        try { input = JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch { return json(400, { error: 'Invalid JSON' }); }
        const { validateReading } = require('./store.cjs');
        try { validateReading(input); } catch { return json(400, { error: 'Send finite numeric value and a unit string up to 16 characters' }); }
        try { json(201, store.ingest(deviceId, input)); }
        catch { json(503, { error: 'Local storage unavailable. Check free disk space.' }); }
      } catch { if (!response.headersSent) json(400, { error: 'Incomplete request' }); }
    });
    server.requestTimeout = 5000;
    server.headersTimeout = 5000;
    server.timeout = 5000;
    server.maxConnections = 32;
    server.on('error', reject);
    server.listen(port, host, () => {
      const actualPort = server.address().port;
      resolve({ port: actualPort, host, close: () => new Promise(done => { server.close(done); server.closeAllConnections(); }) });
    });
  });
}
module.exports = { startReceiver };
