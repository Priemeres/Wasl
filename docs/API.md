# Device API

Desktop administration is local IPC only. The HTTP listener never exposes device registration, tokens, backups, or database queries.

Default listener: `127.0.0.1:8080`; enable LAN mode in Settings for external boards. `GET /health` returns a non-sensitive readiness response. Device ingestion is the only public mutation.

## POST /api/telemetry

```http
Authorization: Bearer wasl_<64 hexadecimal characters>
Content-Type: application/json

{"value":26.4,"unit":"C"}
```

- A finite JSON number and a unit string of 0–16 characters are required.
- Maximum body: 4,096 bytes. No Origin/CORS requests from browsers are allowed.
- The token identifies the device; a supplied deviceId never selects another device.
- The server supplies receipt time in Unix milliseconds. Client clocks are not trusted.
- Successful writes persist before returning 201 `{accepted:true,deviceId,receivedAt}`.
- Statuses: 400 invalid input, 401 bad/revoked token, 403 browser Origin, 404 route/method, 413 oversized body, 415 content type, 429 rate limit, 503 storage failure.
- Maximum one request per second per authenticated device, including invalid attempted submissions. Wait before retrying 429. No idempotency key support; retries can create duplicate readings.
- Receiver must be reachable over a trusted LAN. Built-in TLS, MQTT, WebSockets, OTA, and remote commands are not provided.

Linux shell:

```sh
export WASL_URL='http://127.0.0.1:8080'
export DEVICE_TOKEN='replace-with-your-device-token'
curl -X POST "$WASL_URL/api/telemetry" \
  -H "Authorization: Bearer $DEVICE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"value":26.4,"unit":"C"}'
```

Windows PowerShell:

```powershell
$env:WASL_URL = 'http://127.0.0.1:8080'
$env:DEVICE_TOKEN = 'replace-with-your-device-token'
Invoke-RestMethod -Method Post -Uri "$env:WASL_URL/api/telemetry" `
  -Headers @{Authorization="Bearer $env:DEVICE_TOKEN"} `
  -ContentType 'application/json' -Body '{"value":26.4,"unit":"C"}'
```

The Python example uses standard-library modules and works on both operating systems. The ESP32 example shows a trusted-LAN HTTP connection; never commit actual Wi-Fi credentials or device tokens.
