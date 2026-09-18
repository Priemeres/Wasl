const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { createIDE, validFiles, boardName, serialPort, BLINK } = require('../electron/ide.cjs');
const { openPreferences } = require('../electron/preferences.cjs');
function folder(t) { const result = fs.mkdtempSync(path.join(os.tmpdir(),'wasl-ide-test-')); t.after(()=>fs.rmSync(result,{recursive:true,force:true})); return result; }
function ide(t) {const directory=folder(t);const result=createIDE({directory,executable:path.join(directory,'no-cli'),dialogs:{openSketch:async()=>null,folder:async()=>null,confirmTools:async()=>false}});t.after(()=>result.dispose());return {ide:result,directory};}

test('app and terminal languages persist independently and reject invalid values', t=>{
  const directory=folder(t);const prefs=openPreferences(directory);
  assert.deepEqual(prefs.get(),{appLanguage:'ar',terminalLanguage:'en'});
  prefs.set({appLanguage:'en',terminalLanguage:'ar'});
  assert.deepEqual(openPreferences(directory).get(),{appLanguage:'en',terminalLanguage:'ar'});
  assert.throws(()=>prefs.set({appLanguage:'invalid',terminalLanguage:'ar'}));
  assert.deepEqual(prefs.get(),{appLanguage:'en',terminalLanguage:'ar'});
});

test('English starter code, draft recovery, save, and additional source files',t=>{
  const {ide:editor,directory}=ide(t);const first=editor.state().sketch;
  assert.equal(/[\u0600-\u06ff]/.test(BLINK),false);
  const files=[{name:first.main,content:BLINK+'\n// changed\n'},{name:'sensor.h',content:'#pragma once\n'}];
  editor.updateDraft(files);assert.equal(editor.state().dirty,true);
  assert.throws(()=>editor.newSketch());
  const restored=createIDE({directory,executable:'missing',dialogs:{}});
  assert.equal(restored.state().sketch.files[0].content,files[0].content);
  restored.dispose();
  editor.save(files);assert.equal(editor.state().dirty,false);
  assert.equal(fs.readFileSync(path.join(first.folder,'sensor.h'),'utf8'),'#pragma once\n');
});

test('sketch filenames, board options, and local serial ports reject path/argument injection',()=>{
  assert.throws(()=>validFiles([{name:'../secret.ino',content:''}],'../secret.ino'));
  assert.throws(()=>validFiles([{name:'a.ino',content:''},{name:'a.ino',content:''}],'a.ino'));
  assert.throws(()=>boardName('arduino:avr:uno --upload'));
  assert.equal(boardName('arduino:avr:nano:cpu=atmega328old'),'arduino:avr:nano:cpu=atmega328old');
  assert.equal(serialPort('COM3'),'COM3');assert.equal(serialPort('/dev/ttyUSB0'),'/dev/ttyUSB0');
  assert.throws(()=>serialPort('/dev/tty/../../etc/passwd'));assert.throws(()=>serialPort('--help'));
});

test('toolchain import rejects a mismatched OS without changing existing tools',async t=>{
  const directory=folder(t),bundle=path.join(directory,'bundle');fs.mkdirSync(bundle);
  fs.writeFileSync(path.join(bundle,'wasl-toolchains.json'),JSON.stringify({format:1,platform:'unsupported-os',arch:process.arch}));
  const editor=createIDE({directory:path.join(directory,'ide'),executable:'missing',dialogs:{folder:async()=>bundle,confirmTools:async()=>true}});
  await assert.rejects(()=>editor.importTools(),/operating system/);editor.dispose();
});

test('all static Arabic app labels have English translations',async()=>{
  const ts=require('typescript');const {english}=await import('../src/i18n.ts');
  const source=ts.createSourceFile('App.tsx',fs.readFileSync(path.join(__dirname,'../src/App.tsx'),'utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
  const missing=new Set();
  function visit(n){if(ts.isCallExpression(n)&&n.expression.getText(source)==='t'&&n.arguments[0]&&ts.isStringLiteral(n.arguments[0])){const value=n.arguments[0].text.trim();if(/[\u0600-\u06ff]/.test(value)&&!english[value])missing.add(value);}ts.forEachChild(n,visit);}visit(source);
  assert.deepEqual([...missing],[]);
});
