# Security model

This is local prototype/lab software, not safety-critical control infrastructure.

The renderer uses local files, CSP, context isolation, a sandbox, and a narrow preload API. Node integration, new windows, navigation, webviews, and permission prompts are denied. Every privileged IPC handler checks the expected main frame and local renderer URL. No arbitrary filesystem/network IPC is exposed.

The receiver defaults to loopback. LAN mode is an explicit local setting. It uses bearer tokens over HTTP; confidentiality on untrusted networks requires a TLS/VPN gateway. Device keys are random 256-bit values, stored only as SHA-256 hashes. Key revocation applies to the next write. Rate, payload, timeout, and connection limits are basic safeguards, not fleet-scale denial-of-service protection.

Files under the user's OS profile are protected by OS account permissions. Anyone who can execute code as that user can access the local database. Backups contain device data and token hashes and should be treated as private. No database encryption at rest is implemented.

Do not publish secret-bearing exploit reports in public issues. Establish a private reporting channel in your GitHub repository before wider distribution.
