import {chromium} from '@playwright/test';
import {mkdirSync, writeFileSync, readFileSync, existsSync} from 'node:fs';
const out=process.env.CAPTURE_DIR || 'artifacts/visual-redesign/final';mkdirSync(out,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--enable-unsafe-swiftshader']});
const motionOnly=process.env.CAPTURE_PHASE==='motion';
const report=motionOnly && existsSync(`${out}/report.json`) ? JSON.parse(readFileSync(`${out}/report.json`,'utf8')).filter(x=>x.section) : [];
for(const [width,height] of [[1440,900],[1920,1080],[2560,1440],[1366,768],[1280,800],[768,1024],[390,844],[430,932]]) {
 const page=await browser.newPage({viewport:{width,height},reducedMotion:'reduce'});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 for(const section of (motionOnly ? [] : ['intro','work','connect'])) {
  await page.goto(`http://127.0.0.1:5178/#${section}`);await page.locator('.notebook[data-phase="reading"]').waitFor({timeout:60000});
  await page.screenshot({path:`${out}/${width}x${height}-${section}.png`});
  report.push({width,height,section,errors:[...errors],...await page.evaluate(()=>({renderer:document.querySelector('.desk').dataset.renderer,bounds:JSON.parse(document.querySelector('.notebook').dataset.bookBounds),overflow:document.documentElement.scrollWidth>innerWidth,pages:[...document.querySelectorAll('.paper-page')].map(e=>({class:e.className,height:e.clientHeight,scroll:e.scrollHeight})),tabs:[...document.querySelectorAll('.section-tab')].map(e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height};})}))});
 }
 await page.close();
 if(width<1280)continue;
 const motion=await browser.newPage({viewport:{width,height}});
 await motion.goto('http://127.0.0.1:5178/?timeline=paused');await motion.locator('.notebook[data-phase="opening"]').waitFor({timeout:60000});
 await motion.evaluate(async()=>{const m=await import('/tests/browser/motion-control.ts');m.freezeMotion();});
 for(const [name,time] of [['closed-seated',0],['mid-lean',1.3],['lean-complete',2],['hand-contact',2.6],['cover-25',3.08],['cover-50',3.3],['cover-75',3.52],['open-settle',4.5]]){
  await motion.evaluate(async t=>{const m=await import('/tests/browser/motion-control.ts');m.seekOpening(t);},time);
  await motion.screenshot({path:`${out}/${width}x${height}-${name}.png`});
  report.push({width,height,state:name,...await motion.locator('.notebook').evaluate(e=>({scale:e.dataset.rootScale,camera:e.dataset.cameraPosition,clearance:e.dataset.coverClearance,label:e.dataset.timelineLabel}))});
 }
 await motion.close();
}
writeFileSync(`${out}/report.json`,JSON.stringify(report,null,2));await browser.close();
