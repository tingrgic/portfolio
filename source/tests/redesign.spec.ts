import {test, expect} from '@playwright/test';

test('the lean translates the camera while notebook scale and FOV stay fixed', async ({page}) => {
 await page.setViewportSize({width:1440,height:900});
 await page.goto('/?timeline=paused');
 await page.locator('.notebook[data-phase="opening"]').waitFor();
 const states=[];
 for(const time of [.01,1.3,2,4.8]) {
  await page.evaluate(async t=>{
   // @ts-expect-error Vite-only test helper.
   const {seekOpening}=await import('/tests/browser/motion-control.ts');seekOpening(t);
  },time);
  states.push(await page.locator('.notebook').evaluate(e=>({camera:JSON.parse((e as HTMLElement).dataset.cameraPosition!),scale:JSON.parse((e as HTMLElement).dataset.rootScale!),bounds:JSON.parse((e as HTMLElement).dataset.bookBounds!),lens:JSON.parse((e as HTMLElement).dataset.cameraLens!)})));
 }
 states.forEach(s=>{expect(s.scale).toEqual([1,1,1]);expect(s.lens).toEqual({fov:34,zoom:1});});
 expect(states[0].camera[2]-states[2].camera[2]).toBeGreaterThan(.2);
 expect(Math.abs(states[0].camera[1]-states[2].camera[1])).toBeGreaterThan(1);
 const ratio=(states[3].bounds.right-states[3].bounds.left)/1440;
 expect(ratio).toBeGreaterThan(.65);expect(ratio).toBeLessThan(.75);
 await expect(page.locator('.book-content')).not.toHaveAttribute('inert');
});

test('repeated navigation has bounded GPU texture allocation and stops at rest',async({page})=>{
 await page.addInitScript(()=>{
  const audit={created:0,deleted:0};Object.assign(window,{textureAudit:audit});
  for(const kind of [WebGLRenderingContext,WebGL2RenderingContext]) {
   const create=kind.prototype.createTexture, remove=kind.prototype.deleteTexture;
   kind.prototype.createTexture=function(){audit.created++;return create.call(this);};
   kind.prototype.deleteTexture=function(texture){if(texture)audit.deleted++;return remove.call(this,texture);};
  }
 });
 await page.setViewportSize({width:390,height:844});await page.goto('/#work');
 await page.locator('.notebook[data-phase="reading"]').waitFor();
 const allocations=[];
 for(let round=0;round<3;round++) {
  for(const name of ['03 Connect','01 Hello','02 Work']) {
   await page.getByRole('button',{name,exact:true}).click();
   await expect(page.locator('.notebook')).toHaveAttribute('aria-busy','false');
   await expect(page.locator('.desk')).toHaveAttribute('data-renderer','webgl');
  }
  allocations.push(await page.evaluate(()=>{
   const a=(window as unknown as {textureAudit:{created:number;deleted:number}}).textureAudit;return a.created-a.deleted;
  }));
 }
 expect(allocations[2]).toBeLessThanOrEqual(allocations[1]+2);
 const count=await page.locator('.notebook').getAttribute('data-render-count');
 await page.waitForTimeout(350);expect(await page.locator('.notebook').getAttribute('data-render-count')).toBe(count);
});

test('mobile Connect captures hidden decoration without disabling WebGL', async ({page}) => {
 await page.setViewportSize({width:390,height:844});
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto('/#connect');
 await expect(page.locator('.notebook')).toHaveAttribute('data-phase','reading');
 await expect(page.locator('.desk')).toHaveAttribute('data-renderer','webgl');
 await expect(page.getByRole('link',{name:/Contact me/})).toBeVisible();
 await page.getByRole('button',{name:'02 Work',exact:true}).click();
 await expect(page.locator('.notebook')).toHaveAttribute('aria-busy','false');
 await page.getByRole('button',{name:'03 Connect',exact:true}).click();
 await expect(page.locator('.notebook')).toHaveAttribute('aria-busy','false');
 await expect(page.locator('.desk')).toHaveAttribute('data-renderer','webgl');
});

test('reference overlay is adjustable and tabs retain large reachable targets',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto('/?reference=work#work');await page.locator('.notebook[data-phase="reading"]').waitFor();
 await expect(page.getByRole('complementary',{name:'Development visual calibration'})).toBeVisible();
 const reference=page.getByAltText('Development reference comparison');
 await expect(reference).toHaveJSProperty('naturalWidth',1280);
 await page.locator('.visual-calibration input[type=range]').first().fill('20');await expect(reference).toHaveCSS('opacity','0.2');
 for(const button of await page.locator('.section-tab').all()) {
  const r=(await button.boundingBox())!;expect(r.width).toBeGreaterThanOrEqual(44);expect(r.height).toBeGreaterThanOrEqual(44);
  expect(r.x).toBeGreaterThanOrEqual(0);expect(r.x+r.width).toBeLessThanOrEqual(390);
 }
});
