// Pin official release assets, check their SHA-256, and bundle the matching source/license.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
const version = '1.5.1';
const base = `https://github.com/arduino/arduino-cli/releases/download/v${version}`;
const archives = {
  'win-x64': `arduino-cli_${version}_Windows_64bit.zip`,
  'linux-x64': `arduino-cli_${version}_Linux_64bit.tar.gz`,
  'mac-arm64': `arduino-cli_${version}_macOS_ARM64.tar.gz`,
  'mac-x64': `arduino-cli_${version}_macOS_64bit.tar.gz`,
};
const host = `${{win32:'win',linux:'linux',darwin:'mac'}[process.platform]}-${process.arch}`;
const targets = process.argv.includes('--all') ? [...new Set(['win-x64','linux-x64',host])] : [host];
async function get(url) { const r=await fetch(url); if(!r.ok)throw Error(`${r.status}: ${url}`); return Buffer.from(await r.arrayBuffer()); }
fs.mkdirSync('vendor/arduino-cli/common', { recursive:true });
const checksums = (await get(`${base}/${version}-checksums.txt`)).toString();
fs.writeFileSync('vendor/arduino-cli/common/CHECKSUMS.txt',checksums);
for(const target of targets) {
  const name=archives[target]; if(!name)throw Error(`Unsupported CLI target ${target}`);
  const expected=checksums.split('\n').find(line=>line.trim().endsWith(name))?.split(/\s+/)[0];
  if(!expected)throw Error(`No checksum for ${name}`);
  const folder=path.resolve('vendor/arduino-cli',target);fs.mkdirSync(folder,{recursive:true});
  const filename=path.join(folder,name);
  let data=fs.existsSync(filename)?fs.readFileSync(filename):await get(`${base}/${name}`);
  if(crypto.createHash('sha256').update(data).digest('hex')!==expected)throw Error(`Checksum mismatch: ${name}`);
  fs.writeFileSync(filename,data);
  if(name.endsWith('.zip')) {
    if(process.platform==='win32')execFileSync('tar',['-xf',filename,'-C',folder]);
    else execFileSync('unzip',['-oq',filename,'-d',folder]);
  } else execFileSync('tar',['-xzf',filename,'-C',folder]);
  const binary=path.join(folder,target.startsWith('win')?'arduino-cli.exe':'arduino-cli');
  if(!target.startsWith('win'))fs.chmodSync(binary,0o755);
  fs.writeFileSync(path.join(folder,'release.json'),JSON.stringify({version,source:`https://github.com/arduino/arduino-cli/tree/v${version}`,archive:name,sha256:expected},null,2));
  console.log(`Verified Arduino CLI ${version}: ${target}`);
}
const source='vendor/arduino-cli/common/arduino-cli-source.tar.gz';
if(!fs.existsSync(source))fs.writeFileSync(source,await get(`https://api.github.com/repos/arduino/arduino-cli/tarball/v${version}`));
fs.writeFileSync('vendor/arduino-cli/common/LICENSE-GPL-3.txt',await get(`https://raw.githubusercontent.com/arduino/arduino-cli/v${version}/LICENSE.txt`));
