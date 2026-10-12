import * as THREE from 'three';

// Imported only through import.meta.env.DEV. Reference originals never enter public/.
const references = import.meta.glob('/artifacts/visual-redesign/audit-2026-10-06/references/*.jpg', { query: '?url', import: 'default' });
export function createCalibration(host: HTMLElement, scene: THREE.Scene, camera: THREE.PerspectiveCamera, book: THREE.Group, renderer: THREE.WebGLRenderer, render: () => void, seek: (time:number) => void) {
 const params = new URLSearchParams(location.search);
 if (!params.has('reference') && !params.has('calibrate')) return null;
 const panel = document.createElement('aside'); panel.className='visual-calibration'; panel.setAttribute('aria-label','Development visual calibration');
 panel.style.cssText='position:fixed;z-index:1000;left:12px;top:65px;width:248px;padding:14px;background:#231e18ee;color:#fff8e8;font:12px/1.5 monospace;border:1px solid #b59965;border-radius:6px;max-height:80vh;overflow:auto';
 const img=document.createElement('img'); img.alt='Development reference comparison';img.style.cssText='position:fixed;inset:0;width:100%;height:100%;object-fit:contain;pointer-events:none;z-index:900;opacity:.45';
 document.body.append(img,panel);
 const row=(text:string)=>{const label=document.createElement('label');label.style.cssText='display:flex;gap:8px;align-items:center;margin:7px 0';label.append(text);panel.append(label);return label;};
 const title=document.createElement('strong');title.textContent='REFERENCE CALIBRATION · DEV';panel.append(title);
 const select=document.createElement('select');for(const name of ['work','connect','closed','lookbook']){const opt=new Option(name,name);select.add(opt);}select.value=params.get('reference')||'work';row('Reference').append(select);
 let closed=false;
 const change=async()=>{const number=({work:2,connect:3,closed:1,lookbook:4} as Record<string,number>)[select.value];const key=Object.keys(references).find(k=>k.endsWith(`${number}-Photo-${number}.jpg`));if(key){const url=await references[key]();if(!closed)img.src=url as string;}};
 void change();select.onchange=()=>void change();
 const opacity=document.createElement('input');opacity.type='range';opacity.min='0';opacity.max='100';opacity.value='45';opacity.oninput=()=>{img.style.opacity=String(Number(opacity.value)/100);};row('Opacity').append(opacity);
 const check=(text:string,callback:(v:boolean)=>void)=>{const el=document.createElement('input');el.type='checkbox';el.onchange=()=>callback(el.checked);row(text).prepend(el);return el;};
 check('Reference visible',v=>img.hidden=!v).checked=true;
 check('Fill viewport (crop)',v=>img.style.objectFit=v?'cover':'contain');
 const box=new THREE.BoxHelper(book,0xffaa00);box.visible=false;scene.add(box);
 check('Geometry bounds',v=>{box.visible=v;box.update();render();});
 const axes=new THREE.AxesHelper(.65);axes.name="CalibrationCameraTarget";axes.position.set(0,0,.1);axes.visible=false;scene.add(axes);
 check('Camera target / axes',v=>{axes.visible=v;render();});
 const lights:THREE.DirectionalLightHelper[]=[];scene.traverse(o=>{if(o instanceof THREE.DirectionalLight){const helper=new THREE.DirectionalLightHelper(o,.5);helper.visible=false;lights.push(helper);}});lights.forEach(h=>scene.add(h));
 check('Light helpers',v=>{lights.forEach(h=>h.visible=v);render();});
 check('Projected HTML bounds',v=>host.classList.toggle('show-html-bounds',v));
 const sheetBounds=new THREE.Box3Helper(new THREE.Box3(new THREE.Vector3(-3.15,-2.55,.245),new THREE.Vector3(3.15,2.55,.28)),0x00ffff);sheetBounds.visible=false;book.add(sheetBounds);
 check('Physical page bounds',v=>{sheetBounds.visible=v;render();});
 const time=document.createElement('input');time.type='range';time.min='0';time.max='4.8';time.step='.01';time.value='0';time.oninput=()=>seek(Number(time.value));row('Opening time').append(time);
 const stats=document.createElement('pre');check('FPS / render stats',v=>stats.hidden=!v).checked=true;stats.style.cssText='white-space:pre-wrap;font-size:10px';panel.append(stats);
 const update=()=>{stats.textContent=JSON.stringify({quality:host.dataset.quality,fps:host.dataset.fps,drawCalls:renderer.info.render.calls,triangles:renderer.info.render.triangles,memory:renderer.info.memory,canvas:[renderer.domElement.width,renderer.domElement.height],dpr:renderer.getPixelRatio(),camera:camera.position.toArray().map(n=>+n.toFixed(3)),target:host.dataset.cameraTarget,scale:book.scale.toArray(),label:host.dataset.timelineLabel,time:host.dataset.timelineTime},null,1);};
 const observer=new MutationObserver(update);observer.observe(host,{attributes:true,attributeFilter:['data-render-count']});update();
 return {dispose(){closed=true;observer.disconnect();panel.remove();img.remove();scene.remove(box,axes,...lights);book.remove(sheetBounds);box.dispose();axes.dispose();sheetBounds.dispose();lights.forEach(l=>l.dispose());}};
}
