// Small, dependency-free ZIP writer for source distribution (ZIP STORE format).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const folders = ['src', 'electron', 'assets', 'tests', 'scripts', 'docs', 'examples', '.github'];
const files = ['package.json', 'package-lock.json', 'tsconfig.json', 'vite.config.ts', 'index.html', '.gitignore', 'LICENSE', 'README.md', 'CONTRIBUTING.md', 'SECURITY.md', 'THIRD_PARTY_NOTICES.md'];
function collect(dir) {
  for (const entry of fs.readdirSync(path.join(root, dir), { withFileTypes: true })) {
    if (['.DS_Store', 'Thumbs.db'].includes(entry.name)) continue;
    const name = `${dir}/${entry.name}`;
    if (entry.isDirectory()) collect(name); else if (entry.isFile()) files.push(name);
  }
}
folders.forEach(collect);
function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) { crc ^= byte; for (let k = 0; k < 8; k++) crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1; }
  return (crc ^ 0xffffffff) >>> 0;
}
const chunks = [], central = []; let offset = 0;
for (const file of files.sort()) {
  const name = Buffer.from(file), data = fs.readFileSync(path.join(root, file)), crc = crc32(data);
  const header = Buffer.alloc(30); header.writeUInt32LE(0x04034b50); header.writeUInt16LE(20, 4); header.writeUInt16LE(0x800, 6);
  header.writeUInt32LE(crc, 14); header.writeUInt32LE(data.length, 18); header.writeUInt32LE(data.length, 22); header.writeUInt16LE(name.length, 26);
  chunks.push(header, name, data);
  const directory = Buffer.alloc(46); directory.writeUInt32LE(0x02014b50); directory.writeUInt16LE(20, 4); directory.writeUInt16LE(20, 6); directory.writeUInt16LE(0x800, 8);
  directory.writeUInt32LE(crc, 16); directory.writeUInt32LE(data.length, 20); directory.writeUInt32LE(data.length, 24); directory.writeUInt16LE(name.length, 28); directory.writeUInt32LE(offset, 42);
  central.push(directory, name); offset += header.length + name.length + data.length;
}
const directory = Buffer.concat(central), end = Buffer.alloc(22); end.writeUInt32LE(0x06054b50); end.writeUInt16LE(files.length, 8); end.writeUInt16LE(files.length, 10); end.writeUInt32LE(directory.length, 12); end.writeUInt32LE(offset, 16);
const output = path.join(root, 'release', `Wasl-${pkg.version}-source.zip`); fs.mkdirSync(path.dirname(output), { recursive: true }); fs.writeFileSync(output, Buffer.concat([...chunks, directory, end]));
console.log(`Source archive: ${files.length} files → ${output}`);
