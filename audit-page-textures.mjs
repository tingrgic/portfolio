import {chromium,webkit} from '@playwright/test';
import {writeFile} from 'node:fs/promises';
const kind=process.env.TEST_BROWSER||'chromium';
const browser=await (kind==='webkit'?webkit:chromium).launch({headless:true,...(kind==='chromium'?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,args:['--enable-unsafe-swiftshader']}:{executablePath:process.env.PLAYWRIGHT_WEBKIT_EXECUTABLE_PATH})});
const page=await browser.newPage({viewport:{width:390,height:664},reducedMotion:'reduce'});
page.on('pageerror',e=>console.log('ERROR',e.message));page.on('console',m=>{if(m.type()==='error'||m.type()==='debug')console.log('CONSOLE',m.text());});
for(const section of ['intro','work','work/normal','connect']) {
 await page.goto('http://127.0.0.1:5178/#'+section);
 await page.locator('.notebook[data-phase="reading"]').waitFor({timeout:30000});
 const result=await page.evaluate(async()=>{
  const {capturePage}=await import('/src/scene/capturePage.ts');
  const el=document.querySelector('.book-content');
  const canvas=await capturePage(el);
  const data=canvas.toDataURL().split(',')[1];
  el.style.transform='none';el.style.left='0';el.style.top='0';
  return {data,renderer:document.querySelector('.desk').dataset.renderer};
 });
 const name=section.replace('/','-');
 await writeFile(`artifacts/qa/iphone-content-glitch/${kind}-${name}-texture.png`,Buffer.from(result.data,'base64'));
 await page.locator('.book-content').screenshot({path:`artifacts/qa/iphone-content-glitch/${kind}-${name}-dom.png`});
 console.log(kind,section,result.renderer);
}
await browser.close();
