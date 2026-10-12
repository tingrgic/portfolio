import { chromium, webkit } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
const kind = process.env.TEST_BROWSER || 'chromium';
const target = process.env.PRODUCTION_URL || 'http://127.0.0.1:4178/';
const deploymentPath = new URL(target).pathname.replace(/\/?$/, '/');
const browser = await (kind === 'webkit' ? webkit : chromium).launch({ headless: true, ...(kind === 'webkit' ? { executablePath: process.env.PLAYWRIGHT_WEBKIT_EXECUTABLE_PATH } : { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH, args: ['--enable-unsafe-swiftshader'] }) });
const errors=[];
const results=[];
try {
 for (const [width,height] of [[390,664],[1366,768]]) {
  const page=await browser.newPage({viewport:{width,height},reducedMotion:'no-preference'});
  const handRequests=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  page.on('request',request=>{if(request.url().includes('/hands-clay-full/'))handRequests.push(request.url());});
  page.on('response',response=>{if(response.status()>=400&&response.url().startsWith(new URL(target).origin))errors.push(`${response.status()} ${response.url()}`);});
  await page.goto(target);
  await page.locator('.notebook[data-phase="reading"]').waitFor({timeout:30000});
  if(await page.locator('.desk').getAttribute('data-renderer')!=='webgl')throw Error('Production did not initialize WebGL');
  if(handRequests.length!==12)throw Error(`Opening loaded ${handRequests.length} hand frames instead of 12`);
  if(handRequests.some(url=>!new URL(url).pathname.startsWith(`${deploymentPath}images/hands-clay-full/`)))throw Error(`Hand frame escaped deployment base ${deploymentPath}`);
  await page.screenshot({path:`artifacts/qa/production-3d-${kind}-${width}-intro.png`});
  await page.getByRole('button',{name:'See my work'}).click();
  await page.locator('.notebook[data-phase="reading"][aria-busy="false"]').waitFor({timeout:30000});
  if(await page.locator('a[href="https://komon.hr"]').count()<1)throw Error('Komon links missing');
  if(width===390){await page.getByRole('button',{name:'Next section'}).click();await page.locator('.notebook[data-phase="reading"][aria-busy="false"]').waitFor({timeout:30000});}
  if(await page.locator('a[href="https://tingrgic.github.io/pk-normal"]').count()<1)throw Error('PK Normal links missing');
  await page.screenshot({path:`artifacts/qa/production-3d-${kind}-${width}-work.png`});
  results.push({width,height,renderer:await page.locator('.desk').getAttribute('data-renderer'),bounds:await page.locator('.notebook').getAttribute('data-book-bounds')});
  await page.close();
 }
 if(errors.length)throw Error(errors.join('\n'));
 await writeFile(`artifacts/qa/production-3d-${kind}-results.json`,JSON.stringify({results,errors},null,2));
 console.log(JSON.stringify({results,errors},null,2));
} finally {await browser.close();}
