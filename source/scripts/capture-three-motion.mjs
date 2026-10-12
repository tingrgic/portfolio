import {chromium} from '@playwright/test';
const browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,args:['--enable-unsafe-swiftshader'],headless:true});
for(const width of [1440,390]){
 const page=await browser.newPage({viewport:{width,height:900}});page.on('pageerror',e=>console.log('ERROR',e.message));
 await page.clock.install({time:new Date('2026-09-30T12:00:00Z')});await page.clock.pauseAt(new Date('2026-09-30T12:00:01Z'));
 await page.goto('http://127.0.0.1:5178/');
 for(let i=0;i<80;i++){await page.clock.runFor(50);if(await page.locator('.notebook').getAttribute('data-phase')==='opening')break;await page.waitForTimeout(20);}
 for(let i=0;i<9;i++){await page.clock.runFor(300);await page.screenshot({path:`artifacts/qa/three-opening-${width}-${i}.png`});console.log(width,'open',i,await page.locator('.notebook').evaluate(e=>({angle:e.dataset.coverAngle,clearance:e.dataset.coverClearance,phase:e.dataset.phase})));}
 await page.clock.runFor(1000);
 for(const direction of ['forward','backward']){
  await page.getByRole('button',{name:direction==='forward'?'See my work':'01 Hello'}).click();
  for(let i=0;i<80;i++){await page.clock.runFor(25);if(await page.locator('.notebook').getAttribute('data-phase')==='turning')break;await page.waitForTimeout(20);}
  for(let i=0;i<7;i++){await page.clock.runFor(280);await page.screenshot({path:`artifacts/qa/three-${direction}-${width}-${i}.png`});}
  await page.clock.runFor(800);
 }
 await page.close();
}await browser.close();
