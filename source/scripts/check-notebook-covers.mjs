import {chromium} from '@playwright/test';
import {mkdirSync,writeFileSync} from 'node:fs';
const out='artifacts/page-fit-covers';mkdirSync(out,{recursive:true});
const browser=await chromium.launch({args:['--enable-unsafe-swiftshader']});
const report=[];
try {
 for(const width of [390,1440]) {
  const page=await browser.newPage({viewport:{width,height:width===390?844:900},reducedMotion:'reduce'});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  for(const section of ['intro','work','connect']) {
   await page.goto('http://127.0.0.1:4178/#'+section);await page.locator('.notebook[data-phase="reading"]').waitFor();
   const state=await page.evaluate(()=>({renderer:document.querySelector('.desk').dataset.renderer,overflow:document.documentElement.scrollWidth>innerWidth,calibration:!!document.querySelector('.visual-calibration'),leaves:[...document.querySelectorAll('.paper-page')].map(e=>({height:e.clientHeight,scroll:e.scrollHeight}))}));
   if(state.renderer!=='webgl'||state.overflow||state.calibration||state.leaves.some(x=>x.scroll>x.height+1))throw new Error(JSON.stringify(state));
   await page.screenshot({path:`${out}/production-${width}-${section}.png`});report.push({width,section,...state,errors:[...errors]});
  }
  for(const side of ['back','front']) {
   if(side==='front') {await page.getByRole('button',{name:'01 Hello',exact:true}).click();await page.locator('.notebook[data-phase="reading"]').waitFor();}
   await page.getByRole('button',{name:`Close ${side} cover`,exact:true}).click();await page.locator('.notebook[data-phase="closed"]').waitFor();
   await page.screenshot({path:`${out}/production-${width}-${side}.png`});
   await page.reload();await page.locator('.notebook[data-phase="closed"]').waitFor();
   await page.getByRole('button',{name:'Open notebook',exact:true}).click();await page.locator('.notebook[data-phase="reading"]').waitFor();
   await page.goBack();await page.locator('.notebook[data-phase="closed"]').waitFor();
   await page.setViewportSize({width:width+10,height:900});await page.locator('.notebook[data-phase="closed"]').waitFor();
   await page.getByRole('button',{name:'Open notebook',exact:true}).click();await page.locator('.notebook[data-phase="reading"]').waitFor();
   await page.setViewportSize({width,height:width===390?844:900});
   report.push({width,side,reloadHistoryResize:'passed',errors:[...errors]});
  }
  if(errors.length)throw new Error(errors.join('\n'));await page.close();
 }
} finally {writeFileSync(`${out}/production.json`,JSON.stringify(report,null,2));await browser.close();}
console.log('Production layout, cover reload, browser history and resize checks passed.');
