import {chromium} from '@playwright/test';
import {mkdirSync,writeFileSync,readFileSync} from 'node:fs';
const out='artifacts/clay-refinement';mkdirSync(out,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--enable-unsafe-swiftshader']});
const results=[];
try {
 for(const [width,height] of [[390,844],[430,932],[768,1024],[1440,900]]) {
  const page=await browser.newPage({viewport:{width,height},reducedMotion:'reduce'});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  for(const section of ['intro','work','connect']) {
   await page.goto(`${process.env.PREVIEW_URL || 'http://127.0.0.1:4178/'}#${section}`);
   await page.waitForFunction(()=>document.querySelector('.desk')?.dataset.renderer==='fallback'||document.querySelector('.notebook')?.dataset.phase==='reading',null,{timeout:60000});
   const result={width,height,section,errors:[...errors],...await page.evaluate(()=>({renderer:document.querySelector('.desk').dataset.renderer,phase:document.querySelector('.notebook').dataset.phase,calibration:document.querySelectorAll('.visual-calibration').length,bounds:JSON.parse(document.querySelector('.notebook').dataset.bookBounds || 'null'),overflow:document.documentElement.scrollWidth>innerWidth,pages:[...document.querySelectorAll('.paper-page')].map(e=>({class:e.className,height:e.clientHeight,scroll:e.scrollHeight})),brokenImages:[...document.images].filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src)}))};
   results.push(result);console.log(JSON.stringify(result));
   if(result.renderer!=='webgl'||result.errors.length||result.overflow||result.calibration||result.brokenImages.length)throw new Error('Production preview check failed');
   await page.screenshot({path:`${out}/final/${width}x${height}-${section}.png`});
  }
  await page.close();
 }
 const reportPath=`${out}/final/report.json`;
 const report=JSON.parse(readFileSync(reportPath,'utf8')).map(row=>results.find(r=>r.width===row.width&&r.height===row.height&&r.section===row.section)||row);
 writeFileSync(reportPath,JSON.stringify(report,null,2));
} finally {writeFileSync(`${out}/production-smoke.json`,JSON.stringify(results,null,2));await browser.close();}
