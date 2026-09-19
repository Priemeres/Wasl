// Explicit online integration check. Uses a disposable workspace; never flashes hardware.
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {createIDE}=require('../electron/ide.cjs');
const directory=fs.mkdtempSync(path.join(os.tmpdir(),'wasl-cli-integration-'));
const target=`${{win32:'win',linux:'linux',darwin:'mac'}[process.platform]}-${process.arch}`;
const executable=path.resolve('vendor/arduino-cli',target,process.platform==='win32'?'arduino-cli.exe':'arduino-cli');
const editor=createIDE({directory,executable,dialogs:{}});
(async()=>{
  console.log('Installing Arduino AVR into disposable test workspace…');
  let last=0;const timer=setInterval(()=>{for(const log of editor.state().logs.filter(l=>l.id>last)){last=log.id;if(log.kind==='raw')process.stdout.write(log.text);}},1000);
  try{
    await editor.installCore('arduino:avr');
    const input={fqbn:'arduino:avr:uno',files:editor.state().sketch.files};
    const result=await editor.compile(input);
    if(result.logs.at(-1).key!=='compileSuccess')throw Error('Real Arduino compilation failed');
    console.log('\nPASS: bundled Arduino CLI compiled an actual Uno Blink sketch. No upload attempted.');
  }finally{clearInterval(timer);editor.dispose();fs.rmSync(directory,{recursive:true,force:true});}
})().catch(error=>{console.error(error);process.exitCode=1;});
