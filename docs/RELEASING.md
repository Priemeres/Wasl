# Building and publishing on GitHub

This source tree is a standalone repository. Use its contents (or extract the source ZIP) as the GitHub repository root. Do not upload node_modules, local databases, release binaries into Git source, tokens, or the former website project.

## Native builds

Node 24 LTS, npm, and Git are recommended. Install dependencies with `npm ci`, then run `npm run check` and `npm test`.

- Windows x64: `npm run dist:win` creates `Wasl-0.3.1-win-x64.exe` (NSIS installer) and `.zip` (portable folder).
- Linux x64: `npm run dist:linux` creates `Wasl-0.3.1-linux-x64.AppImage` and `.tar.gz`.
- Cross-platform portable packaging: `npm run dist:portable` produces ZIP and tar.gz without native database addons. This can package targets on another host but is not proof they have run on that OS.
- `npm run source` produces `Wasl-0.3.1-source.zip` with all source, docs, lockfile, license, and workflow.

No signing credentials are required for development builds. Current artifacts are unsigned. Add real Windows code signing before broad distribution; do not disable OS security checks. macOS packaging is deliberately excluded.

## GitHub Actions

1. Create an empty repository under your account and upload these source files, including the hidden `.github` folder. The provided MIT LICENSE must remain in the repository.
2. Run the **Desktop builds** workflow manually or push to `main`. It builds on native `windows-latest` and `ubuntu-22.04` runners, runs backend tests and an Electron startup smoke test, and uploads the OS artifacts.
3. To prepare a release, ensure the version in package.json and package-lock.json matches the version tag, then push a tag such as `v0.3.1`.
4. The workflow creates a **draft** GitHub Release containing both OS builds, checksums, and source. Review and publish that draft when ready.

On Linux the smoke test runs under Xvfb with Chromium's normal sandbox. If a runner's AppArmor policy blocks unprivileged user namespaces, configure an administrator-approved application-specific profile; the workflow does not bypass or disable the sandbox.

GitHub Actions network access downloads npm dependencies Electron and Arduino CLI. Editing and local IoT features work offline; compiling/uploading additionally requires board toolchains installed once or imported offline. Platform compatibility still needs testing on representative real Windows/Linux machines; CI startup tests cannot establish hardware/driver compatibility.

## Release checklist

Run backend tests, type checking, renderer build, native startup test, `npm run test:ui`, and verify archive contents. Exercise Arabic display, register a device, send a reading, rotate/revoke its key, restart to verify persistence, and test CSV/backup native dialogs. Test real ESP32 connectivity on a private LAN before claiming hardware validation.
