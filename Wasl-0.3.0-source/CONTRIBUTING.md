# Contributing / المساهمة

Contributions are welcome from embedded developers, electrical engineers, electronics companies, university labs, and manufacturers. Code contributions are MIT-licensed.

Keep the UI Arabic and RTL. Technical identifiers, firmware code, addresses, and units should remain explicitly LTR. Bundle assets locally and avoid remote fonts or cloud dependencies.

Run `npm run check`, `npm test`, and `npm run build`. Test native Electron startup on the affected platform. Include the scenario fixed and the verification performed. Preserve the sandbox, context isolation, strict sender validation, prepared SQL, atomic persistence, token hashes, and disabled-by-default LAN listening.

No credentials, device tokens, network passwords, real telemetry, or user databases belong in Git. Database schema changes need a versioned migration. Never erase data silently when a newer schema is encountered.

Current priorities: MQTT gateway, multi-channel sensors, offline device buffers, efficient time-series storage, signed installers, accessibility, ARM64, and eventually macOS.
