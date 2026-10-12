import {test,expect} from '@playwright/test';

test('static reading does not wait for the hand sequence or rasterize a page',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 let release!:()=>void;const gate=new Promise<void>(resolve=>{release=resolve;});
 await page.route('**/hands-clay-full/**',async route=>{await gate;await route.continue();});
 try {
  await page.goto('/#work',{waitUntil:'domcontentloaded'});
  await expect(page.locator('.notebook')).toHaveAttribute('data-phase','reading',{timeout:15000});
  expect(await page.locator('.notebook').getAttribute('data-capture-count')).toBeNull();
  await expect(page.getByRole('link',{name:'Visit Komon (opens in a new tab)',exact:true})).toBeVisible();
 }finally{release();}
});

for(const width of [390,1440]) test(`idle snapshots eliminate capture work on navigation at ${width}`,async({page})=>{
 test.setTimeout(90000);
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await page.setViewportSize({width,height:900});await page.goto('/#work');
 await page.waitForFunction(n=>JSON.parse(document.querySelector('.notebook')?.getAttribute('data-cached-pages')||'[]').length===n,width<700?4:3,{timeout:60000});
 await expect(page.locator('.book-content')).toHaveCount(1);
 await expect(page.locator('.snapshot-preparation')).toHaveCount(0);
 const count=await page.locator('.notebook').getAttribute('data-capture-count');
 await page.getByRole('button',{name:'03 Connect',exact:true}).click();
 await expect(page.locator('.notebook')).toHaveAttribute('data-phase','reading',{timeout:10000});
 expect(await page.locator('.notebook').getAttribute('data-capture-count')).toBe(count);
 await expect(page.locator('.desk')).toHaveAttribute('data-renderer','webgl');
 await expect(page.getByRole('link',{name:/Contact me/})).toBeVisible();
 expect(errors).toEqual([]);
});
