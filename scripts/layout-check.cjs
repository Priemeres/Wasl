// Exercise real Electron rendering in an isolated profile; never flashes hardware.
const { _electron: electron, expect } = require('@playwright/test');
const path = require('node:path');
const fs = require('node:fs');
const assert = require('node:assert/strict');
(async () => {
 const output = path.resolve('release/qa'); fs.mkdirSync(output,{recursive:true});
 const app = await electron.launch({args:['.','--ui-test'],executablePath:require('electron'),chromiumSandbox:true});
 const errors=[];
 try {
  const page=await app.firstWindow(); page.on('pageerror',e=>errors.push(e.message));
  await expect(page.getByTestId('app-language-toggle')).toBeEnabled();
  await page.evaluate(()=>document.fonts.ready);
  async function inspect(name){
   const problems=await page.evaluate(()=>{
    const failures=[];
    const visible=e=>e.getClientRects().length&&getComputedStyle(e).visibility!=='hidden';
    if(document.documentElement.scrollWidth>innerWidth+1)failures.push('Page overflows viewport');
    const rowSelectors=['.topbar','.top-actions','.page-heading','.heading-actions','.mode-bar','.stats-grid','.stat-label','.stat-value','.stat-footer','.monitor-grid','.panel-heading','.project-grid','.project-card-bottom','.settings-grid','.language-fields','.ide-title','.ide-toolbar','.ide-run-buttons','.core-grid','.core-card','.offline-tools','.code-titlebar','.code-status','.terminal-heading','.serial-toolbar','.detail-actions','.form-pair'];
    for(const row of document.querySelectorAll(rowSelectors.join(','))){
     if(!visible(row))continue;
     const children=[...row.children].filter(visible),r=row.getBoundingClientRect();
     for(const child of children){const b=child.getBoundingClientRect();if(b.left<r.left-2||b.right>r.right+2)failures.push(`${row.className}: child outside card (${child.tagName})`);}
     for(let i=0;i<children.length;i++)for(let j=i+1;j<children.length;j++){
      const a=children[i].getBoundingClientRect(),b=children[j].getBoundingClientRect();
      if(Math.min(a.right,b.right)-Math.max(a.left,b.left)>2&&Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>2)failures.push(`${row.className}: overlapping controls`);
     }
    }
    for(const el of document.querySelectorAll('.stat-card,.project-card,.doc-panel,.language-fields label,.core-card,.topbar button,.board-field,.port-field,.ide-title,.code-status')){
     if(visible(el)&&el.scrollWidth>el.clientWidth+2)failures.push(`${el.className}: clipped content`);
    }
    return failures;
   });
   if(problems.length){await page.screenshot({path:path.join(output,name+'-failure.png'),fullPage:true});throw Error(name+': '+problems.join('; '));}
  }
  for(const language of ['ar','en']){
   if(await page.locator('html').getAttribute('lang')!==language)await page.getByTestId('app-language-toggle').click();
   await expect(page.locator('html')).toHaveAttribute('dir',language==='ar'?'rtl':'ltr');
   for(const width of [1360,1024,900]){
    await app.evaluate(({BrowserWindow},width)=>BrowserWindow.getAllWindows()[0].setContentSize(width,850),width);
    for(let nav=0;nav<8;nav++){
     await page.locator('.nav-item').nth(nav).click();
     if(nav===5){await expect(page.locator('.cm-content')).toContainText('void setup()');await page.locator('.ide-title-actions button').click();}
     await inspect(`${language}-${width}-page-${nav}`);
     if(nav===0||nav===5||nav===7)await page.screenshot({path:path.join(output,`${language}-${width}-page-${nav}.png`),fullPage:true});
     if(nav===5)await page.locator('.ide-title-actions button').click();
    }
   }
  }
  // The header switch must preserve terminal preference and English source.
  await page.locator('.language-fields select').nth(1).selectOption('ar');
  await page.getByTestId('app-language-toggle').click();
  await page.locator('.nav-item').nth(5).click();
  const source=await page.locator('.cm-content').innerText();
  await expect(page.locator('.terminal-output')).toContainText('جاهز.');
  await page.getByTestId('app-language-toggle').click();
  await expect(page.locator('.terminal-output')).toContainText('جاهز.');
  assert.equal(await page.locator('.cm-content').innerText(),source);
  await page.reload();await expect(page.getByTestId('app-language-toggle')).toBeEnabled();
  await expect(page.locator('html')).toHaveAttribute('lang','en');
  await page.locator('.nav-item').nth(5).click();await expect(page.locator('.terminal-output')).toContainText('جاهز.');
  // Zoom simulates enlarged desktop text and checks the effective 720px viewport.
  await app.evaluate(({BrowserWindow})=>{const w=BrowserWindow.getAllWindows()[0];w.setContentSize(900,850);w.webContents.setZoomFactor(1.25);});
  for(const language of ['ar','en']){
   if(await page.locator('html').getAttribute('lang')!==language)await page.getByTestId('app-language-toggle').click();
   for(const nav of [0,5,7]){await page.locator('.nav-item').nth(nav).click();await inspect(`${language}-zoom125-page-${nav}`);}
  }
  assert.deepEqual(errors,[]);
  console.log('PASS: 48 bilingual page/size checks, 6 zoom checks, persistent independent languages, unchanged English code.');
 }finally{await app.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
