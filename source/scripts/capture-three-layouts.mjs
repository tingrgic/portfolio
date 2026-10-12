import {chromium} from '@playwright/test';
const browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,args:['--enable-unsafe-swiftshader'],headless:true});
for(const [width,height] of [[1440,900],[390,844],[390,664],[375,600]]){
 const page=await browser.newPage({viewport:{width,height},reducedMotion:'reduce'});page.on('pageerror',error=>console.log(error.message));
 await page.goto('http://127.0.0.1:5178/');await page.locator('.notebook[data-phase="reading"]').waitFor({timeout:30000});
 await page.screenshot({path:`artifacts/qa/three-refined-${width}x${height}.png`});
 await page.getByRole('button',{name:'See my work'}).click();await page.screenshot({path:`artifacts/qa/three-refined-${width}x${height}-work.png`});
 console.log(width,height,await page.evaluate(()=>{const book=document.querySelector('.notebook');const paper=document.querySelector('.book-content').getBoundingClientRect();const link=document.querySelector('.project-link').getBoundingClientRect();return {bounds:book.dataset.bookBounds,fit:link.bottom<=paper.bottom,scroll:document.documentElement.scrollHeight};}));
 await page.close();
}await browser.close();
