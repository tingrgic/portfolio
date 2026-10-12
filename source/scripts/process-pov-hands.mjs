import sharp from '/home/tin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp/dist/index.cjs';
import { mkdir } from 'node:fs/promises';
const [source,direction] = process.argv.slice(2);
if (!source || !['forward','backward'].includes(direction)) throw new Error('Usage: node scripts/process-pov-hands.mjs SOURCE forward|backward');
await mkdir('public/images/hands-pov',{recursive:true});
for(let index=0;index<6;index++) {
 const {data,info}=await sharp(source).extract({left:index%3*512,top:Math.floor(index/3)*512,width:512,height:512}).resize(480,480).ensureAlpha().raw().toBuffer({resolveWithObject:true});
 // Remove only detached fragments that bleed in from neighboring atlas cells.
 const visited=new Uint8Array(info.width*info.height);
 let largest=[];
 for(let start=0;start<visited.length;start++) {
  if(visited[start] || data[start*4+3]<8) continue;
  const component=[start];visited[start]=1;
  for(let cursor=0;cursor<component.length;cursor++) {
   const p=component[cursor],x=p%info.width;
   for(const next of [x>0?p-1:-1,x<info.width-1?p+1:-1,p-info.width,p+info.width]) {
    if(next<0||next>=visited.length||visited[next]||data[next*4+3]<8) continue;
    visited[next]=1;component.push(next);
   }
  }
  if(component.length>largest.length)largest=component;
 }
 const keep=new Uint8Array(visited.length);largest.forEach(p=>{keep[p]=1;});
 for(let p=0;p<keep.length;p++)if(!keep[p])data[p*4+3]=0;
 await sharp(data,{raw:info}).webp({quality:85,alphaQuality:100}).toFile(`public/images/hands-pov/${direction}-${index+1}.webp`);
}
