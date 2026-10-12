import {readFileSync,writeFileSync,existsSync,statSync,readdirSync,createReadStream} from 'node:fs';
import {resolve,extname,join,sep} from 'node:path';
import {gzipSync} from 'node:zlib';
import type {Plugin} from 'vite';

/** Precompress text/geometry once at build time; images already use WebP. */
export function previewCompression(): Plugin {
 let output='',base='/',building=false;
 const types:Record<string,string>={'.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.glb':'model/gltf-binary'};
 return {
  name:'notebook-preview-compression',
  transformIndexHtml:{order:'post',handler(_html,context){
   const chunk=context.bundle && Object.values(context.bundle).find(output => output.type==='chunk' && output.facadeModuleId?.endsWith('/src/scene/NotebookScene.ts'));
   return chunk ? [{tag:'link',attrs:{rel:'modulepreload',crossorigin:'',href:`${base}${chunk.fileName}`},injectTo:'head'}] : [];
  }},
  configResolved(config){output=resolve(config.root,config.build.outDir);base=config.base;building=config.command==='build';},
  closeBundle(){
   if(!building||!existsSync(output))return;
   const visit=(dir:string)=>{for(const entry of readdirSync(dir,{withFileTypes:true})){
    const file=join(dir,entry.name);
    if(entry.isDirectory())visit(file);
    else if(types[extname(file)])writeFileSync(file+'.gz',gzipSync(readFileSync(file),{level:9}));
   }};visit(output);
  },
  configurePreviewServer(server){
   server.middlewares.use((req,res,next)=>{
    // Leave unknown Host headers to Vite's existing allow-list checks.
    let host='';try{host=new URL(`http://${req.headers.host}`).hostname;}catch{next();return;}
    const allowed=server.config.preview.allowedHosts;
    if(!['localhost','127.0.0.1','[::1]'].includes(host)&&allowed!==true&&!allowed?.some(name=>name===host||(name.startsWith('.')&&(host===name.slice(1)||host.endsWith(name))))){next();return;}
    if(!['GET','HEAD'].includes(req.method||'')||req.headers.range||!/(?:^|,)\s*gzip\s*(?:,|$|;\s*q=(?!0(?:\.0*)?(?:,|$)))/i.test(req.headers['accept-encoding']||'')){next();return;}
    let pathname:string;
    try{pathname=decodeURIComponent(new URL(req.url||'/', 'http://localhost').pathname);}catch{next();return;}
    const file=resolve(output,'.'+pathname),type=types[extname(file)];
    if(!file.startsWith(output+sep)||!type||!existsSync(file+'.gz')||!existsSync(file)){next();return;}
    const source=statSync(file),packed=statSync(file+'.gz');
    if(packed.mtimeMs<source.mtimeMs){next();return;}
    const etag=`W/"${packed.size}-${Math.trunc(packed.mtimeMs)}-gzip"`;
    res.setHeader('Vary','Accept-Encoding');res.setHeader('ETag',etag);
    res.setHeader('Cache-Control',pathname.startsWith('/assets/')?'public, max-age=31536000, immutable':'public, max-age=0, must-revalidate');
    if(req.headers['if-none-match']===etag){res.statusCode=304;res.end();return;}
    res.setHeader('Content-Type',type);res.setHeader('Content-Encoding','gzip');res.setHeader('Content-Length',packed.size);
    if(req.method==='HEAD'){res.end();return;}
    const stream=createReadStream(file+'.gz');stream.on('error',()=>res.destroy());stream.pipe(res);
   });
  },
 };
}
