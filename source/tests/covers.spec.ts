import {test,expect} from '@playwright/test';
import {mkdirSync} from 'node:fs';
mkdirSync('artifacts/page-fit-covers',{recursive:true});

for(const width of [390,1440]) test(`physical covers close and reopen at ${width}`,async({page})=>{
 test.setTimeout(120000);
 await page.setViewportSize({width,height:900});
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/#work');
 await page.locator('.notebook[data-phase="reading"]').waitFor();
 await page.evaluate(async()=>{
  // @ts-expect-error Vite-only helper.
  const m=await import('/tests/browser/motion-control.ts');m.freezeMotion();
 });
 for(const side of ['front','back'] as const) {
  // Route to the relevant boundary instantly, then test real cover motion.
  await page.goto(side==='front'?'/#cover/front':'/#cover/back');
  await page.locator('.notebook[data-phase="closed"]').waitFor();
  await page.evaluate(async()=>{
   // @ts-expect-error Vite-only helper.
   const m=await import('/tests/browser/motion-control.ts');m.freezeMotion();
  });
  await page.getByRole('button',{name:'Open notebook',exact:true}).click();
  await page.locator('.notebook[data-phase="reopening"]').waitFor();
  for(const t of [.7,1.8]) await page.evaluate(async time=>{
   // @ts-expect-error Vite-only helper.
   const m=await import('/tests/browser/motion-control.ts');m.seekCover(time);
  },t);
  await expect(page.locator('.notebook')).toHaveAttribute('data-phase','reading');
  await expect(page.locator('#section-heading')).toBeFocused();
  await page.getByRole('button',{name:`Close ${side} cover`,exact:true}).click();
  await page.locator('.notebook[data-phase="closing"]').waitFor();
  await page.evaluate(async()=>{
   // @ts-expect-error Vite-only helper.
   const m=await import('/tests/browser/motion-control.ts');m.seekCover(.85);
  });
  const angle=Number(await page.locator('.notebook').getAttribute(side==='front'?'data-cover-angle':'data-back-cover-angle'));
  expect(Math.abs(angle)).toBeGreaterThan(.5);expect(Math.abs(angle)).toBeLessThan(2.7);
  await expect(page.locator('.book-content')).toHaveAttribute('inert','');
  await page.screenshot({path:`artifacts/page-fit-covers/${width}-${side}-closing.png`});
  await page.evaluate(async()=>{
   // @ts-expect-error Vite-only helper.
   const m=await import('/tests/browser/motion-control.ts');m.seekCover(1.8);
  });
  await expect(page.locator('.notebook')).toHaveAttribute('data-phase','closed');
  await expect(page.locator('.desk')).toHaveAttribute('data-renderer','webgl');
  await expect(page.getByRole('button',{name:'Open notebook',exact:true})).toBeFocused();
  await expect(page.locator('.book-content')).toHaveCSS('opacity','0');
  await expect(page.locator('.notebook')).toHaveAttribute('data-root-scale','[1,1,1]');
  await page.screenshot({path:`artifacts/page-fit-covers/${width}-${side}-closed.png`});
  const frames=await page.locator('.notebook').getAttribute('data-render-count');
  await page.waitForTimeout(250);expect(await page.locator('.notebook').getAttribute('data-render-count')).toBe(frames);
 }
 expect(errors).toEqual([]);
});

test('compact Connect and tabs fit small phones without inner scrolling',async({page})=>{
 await page.setViewportSize({width:375,height:600});await page.emulateMedia({reducedMotion:'reduce'});
 for(const route of ['intro','work','work/normal','connect']) {
  await page.goto('/#'+route);await page.locator('.notebook[data-phase="reading"]').waitFor();
  for(const leaf of await page.locator('.paper-page,.book-content').all()) {
   const size=await leaf.evaluate(el=>({height:el.clientHeight,scroll:el.scrollHeight}));
   expect(size.scroll).toBeLessThanOrEqual(size.height+1);
   await leaf.evaluate(el=>{el.scrollTop=500;});expect(await leaf.evaluate(el=>el.scrollTop)).toBe(0);
  }
 }
 await expect(page.locator('.connect-introduction,.contact-note,.back-intro')).toHaveCount(0);
 for(const link of await page.locator('.contact-action').all()) {
  const fits=await link.evaluate(el=>{const a=el.getBoundingClientRect(),p=el.closest('.book-content')!.getBoundingClientRect();return a.top>=p.top&&a.bottom<=p.bottom;});expect(fits).toBe(true);
 }
 for(const icon of await page.locator('.tab-icon').all()) {
  const centered=await icon.evaluate(el=>{const a=el.getBoundingClientRect(),button=el.parentElement as HTMLElement,host=el.closest('.notebook')!.getBoundingClientRect();return Math.abs((a.left+a.width/2)-(host.left+Number(button.dataset.tabAnchorX)))<.75&&Math.abs((a.top+a.height/2)-(host.top+Number(button.dataset.tabAnchorY)))<.75;});
  expect(centered).toBe(true);
  const fits=await icon.evaluate(el=>{const a=el.getBoundingClientRect(),button=el.parentElement!.getBoundingClientRect();return a.left>=button.left-1&&a.right<=button.right+1&&a.top>=button.top-1&&a.bottom<=button.bottom+1;});
  expect(fits).toBe(true);
 }
 await expect(page.locator('.tab-icon')).toHaveCount(3);
 await expect(page.getByRole('button',{name:'03 Connect',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Close back cover'}).click();
 await expect(page.locator('.notebook')).toHaveAttribute('data-phase','closed');
 await expect(page.locator('.notebook')).toHaveAttribute('data-physical-tabs','tucked');
 await page.keyboard.press('ArrowLeft');
 await expect(page.locator('.notebook')).toHaveAttribute('data-phase','reading');
 await expect(page.locator('.notebook')).toHaveAttribute('data-physical-tabs','visible');
 await expect(page.locator('.book-content')).not.toHaveAttribute('inert');
});

for (const [width,height] of [[390,844],[430,932]]) test(`tab icons stay tucked until the opening cover clears them at ${width}x${height}`,async({page})=>{
 await page.setViewportSize({width,height});
 await page.goto('/?timeline=1');
 await expect(page.locator('.notebook')).toHaveAttribute('data-phase','opening',{timeout:15000});
 await expect(page.locator('.notebook')).toHaveAttribute('data-physical-tabs','tucked');
 await expect(page.locator('.section-tabs')).toHaveCSS('opacity','0');
 for(const icon of await page.locator('.tab-icon').all()) await expect(icon).not.toBeVisible();
 await page.evaluate(async()=>{
  // @ts-expect-error Vite-only helper.
  const m=await import('/tests/browser/motion-control.ts');m.seekOpening(3.04);
 });
 await expect(page.locator('.notebook')).toHaveAttribute('data-physical-tabs','tucked');
 await page.evaluate(async()=>{
  // @ts-expect-error Vite-only helper.
  const m=await import('/tests/browser/motion-control.ts');m.seekOpening(3.06);
 });
 await expect(page.locator('.notebook')).toHaveAttribute('data-physical-tabs','visible');
 for(const icon of await page.locator('.tab-icon').all()) {
  await expect(icon).toBeVisible();
  const centered=await icon.evaluate(el=>{const a=el.getBoundingClientRect(),button=el.parentElement as HTMLElement,host=el.closest('.notebook')!.getBoundingClientRect();return Math.abs((a.left+a.width/2)-(host.left+Number(button.dataset.tabAnchorX)))<.75&&Math.abs((a.top+a.height/2)-(host.top+Number(button.dataset.tabAnchorY)))<.75;});
  expect(centered).toBe(true);
  const fits=await icon.evaluate(el=>{const a=el.getBoundingClientRect(),button=el.parentElement!.getBoundingClientRect();return a.left>=button.left-1&&a.right<=button.right+1&&a.top>=button.top-1&&a.bottom<=button.bottom+1;});
  expect(fits).toBe(true);
 }
 await expect(page.locator('.tab-icon')).toHaveCount(3);
 await expect(page.getByRole('button',{name:'03 Connect',exact:true})).toBeVisible();
});
