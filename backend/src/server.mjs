import { createServer } from 'node:http';
import { stat } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import { pipeline } from 'node:stream/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRepository } from './repository.mjs';
import { port,host,storage } from './config.mjs';
const types={'.jpg':'image/jpeg','.jpeg':'image/jpeg','.png':'image/png','.webp':'image/webp','.gif':'image/gif','.mp4':'video/mp4','.mp3':'audio/mpeg','.m4a':'audio/mp4','.ogg':'audio/ogg','.wav':'audio/wav'};
export function createApp(repository,mediaDirectory=resolve(storage,'media')) {
 return createServer(async(req,res)=> {
  res.setHeader('X-Content-Type-Options','nosniff');
  const json=(code,data)=>{res.writeHead(code,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(req.method==='HEAD'?undefined:JSON.stringify(data));};
  try {
   const url=new URL(req.url,'http://localhost');
   if(!['GET','HEAD'].includes(req.method)) return json(405,{error:'Method not allowed'});
   if(url.pathname==='/health') return json(200,{status:'ok'});
   if(url.pathname==='/api/about') return json(200,repository.getAbout());
   if(url.pathname==='/api/homepage') return json(200,repository.get());
   if(url.pathname.startsWith('/media/')) {
    const name=url.pathname.slice(7);
    if(!/^[a-zA-Z0-9_.-]+$/.test(name) || name.startsWith('.')) return json(404,{error:'Not found'});
    const extension=name.slice(name.lastIndexOf('.')).toLowerCase();
    if(!types[extension]) return json(404,{error:'Not found'});
    const file=resolve(mediaDirectory,name),info=await stat(file);
    if(!info.isFile()) return json(404,{error:'Not found'});
    const headers={'Content-Type':types[extension],'Cache-Control':'public, max-age=300','Accept-Ranges':'bytes'};
    let start=0,end=info.size-1,status=200;
    if(req.headers.range && req.method==='GET') {
     const match=/^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
     if(!match || (!match[1] && !match[2])) {res.writeHead(416,{...headers,'Content-Range':`bytes */${info.size}`});return res.end();}
     if(!match[1]) start=Math.max(0,info.size-Number(match[2]));
     else {start=Number(match[1]);if(match[2])end=Math.min(end,Number(match[2]));}
     if(!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start>end || start>=info.size || info.size===0) {res.writeHead(416,{...headers,'Content-Range':`bytes */${info.size}`});return res.end();}
     status=206;headers['Content-Range']=`bytes ${start}-${end}/${info.size}`;
    }
    headers['Content-Length']=status===206?end-start+1:info.size;
    res.writeHead(status,headers);
    if(req.method==='HEAD' || info.size===0)return res.end();
    await pipeline(createReadStream(file,{start,end}),res);return;
   }
   return json(404,{error:'Not found'});
  } catch(error) { if(res.headersSent){res.destroy();return;} if(error.code==='ENOENT') return json(404,{error:'Not found'}); console.error(error);json(500,{error:'Internal server error'}); }
 });
}
if(process.argv[1] && fileURLToPath(import.meta.url)===resolve(process.argv[1])) {
 const repo=createRepository(); const server=createApp(repo);
 server.listen(port,host,()=>console.log(`BE: http://${host}:${port}`));
 for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>server.close(()=>{repo.close();process.exit(0);}));
}
