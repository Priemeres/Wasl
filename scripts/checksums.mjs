import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const version = JSON.parse(fs.readFileSync('package.json', 'utf8')).version;
const names = fs.readdirSync('release').filter(name => name.startsWith(`Wasl-${version}-`) && /\.(exe|zip|AppImage|tar\.gz)$/.test(name)).sort();
const lines = names.map(name => `${crypto.createHash('sha256').update(fs.readFileSync(path.join('release', name))).digest('hex')}  ${name}`);
fs.writeFileSync(path.join('release', `SHA256SUMS-${process.platform}.txt`), lines.join('\n') + '\n');
console.log(`Checksums generated for ${names.length} artifacts.`);
