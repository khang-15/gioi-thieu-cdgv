import {renderHomepage} from './src/home-view.js';
import {renderLibrary} from './src/library-view.js';
import {renderNews} from './src/news-view.js';
import {renderActivities} from './src/activities-view.js';
import {renderAbout} from './src/about-view.js';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import pathTools, { dirname,resolve,extname } from 'node:path';
import { fileURLToPath } from 'node:url';
const root=dirname(fileURLToPath(import.meta.url));
try{process.loadEnvFile(resolve(root,'../.env'));}catch(e){if(e.code!=='ENOENT')throw e;}
const api=process.env.API_URL || `http://127.0.0.1:${process.env.BE_PORT || 4000}`;
const types={'.woff':'font/woff','.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml'};
export function resolvePublicFile(pathname, base=root, paths=pathTools) {
  let name;
  try { name=pathname==='/'?'index.html':['/gioi-thieu','/gioi-thieu/'].includes(pathname)?'about.html':['/hanh-trinh-on-goi','/hanh-trinh-on-goi/'].includes(pathname)?'journey.html':['/su-kien','/su-kien/'].includes(pathname)?'activities.html':['/tin-tuc','/tin-tuc/'].includes(pathname)?'news.html':['/thu-vien','/thu-vien/'].includes(pathname)?'library.html':decodeURIComponent(pathname).slice(1); }
  catch { return null; }
  if(name.includes('\\') || name.includes('\0')) return null;
  const target=paths.resolve(base,name);
  const relative=paths.relative(base,target);
  if(!relative || paths.isAbsolute(relative) || relative==='..' || relative.startsWith('..'+paths.sep)) return null;
  if(!relative.startsWith('src'+paths.sep) && !['index.html','about.html','journey.html','activities.html','news.html','library.html','favicon.svg'].includes(relative)) return null;
  return target;
}
export function createFrontendServer(apiUrl=api) { return createServer(async(req,res)=>{
 res.setHeader('X-Content-Type-Options','nosniff');
 res.setHeader('Referrer-Policy','strict-origin-when-cross-origin');
 try{
  const url=new URL(req.url,'http://localhost');
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);return res.end();}
  if(url.pathname.startsWith('/api/') || url.pathname.startsWith('/media/') || url.pathname==='/health'){
   const controller=new AbortController();
   res.on('close',()=>{if(!res.writableFinished)controller.abort();});
   const upstream=await fetch(new URL(url.pathname+url.search,apiUrl),{method:req.method,headers:req.headers.range?{Range:req.headers.range}:{},signal:controller.signal});
   const headers={};
   for(const key of ['content-type','content-length','content-range','accept-ranges','cache-control'])if(upstream.headers.has(key))headers[key]=upstream.headers.get(key);
   res.writeHead(upstream.status,headers);
   if(req.method==='HEAD' || !upstream.body)return res.end();
   await pipeline(Readable.fromWeb(upstream.body),res);return;
  }
  const path=resolvePublicFile(url.pathname);
  if(!path){res.writeHead(404);return res.end();}
  if(path===resolve(root,'library.html')){
   let html=await readFile(path,'utf8');
   html=html.replace('<div id="library-app"></div>',()=>'<div id="library-app">'+renderLibrary()+'</div>');
   res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});
   return res.end(req.method==='HEAD'?undefined:html);
  }
  if(path===resolve(root,'news.html')){
   let html=await readFile(path,'utf8');
   html=html.replace('<div id="news-app"></div>',()=>'<div id="news-app">'+renderNews()+'</div>');
   res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});
   return res.end(req.method==='HEAD'?undefined:html);
  }
  if(path===resolve(root,'activities.html')){
   let html=await readFile(path,'utf8');
   html=html.replace('<div id="activities-app"></div>',()=>'<div id="activities-app">'+renderActivities()+'</div>');
   res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});
   return res.end(req.method==='HEAD'?undefined:html);
  }
  if(path===resolve(root,'about.html') || path===resolve(root,'index.html')){
   const about=path===resolve(root,'about.html');
   const endpoints=about?['/api/about','/api/homepage']:['/api/homepage'];
   const responses=await Promise.all(endpoints.map(endpoint=>fetch(new URL(endpoint,apiUrl),{signal:AbortSignal.timeout(8000)})));
   if(responses.some(response=>!response.ok))throw new Error('API chưa sẵn sàng');
   const values=await Promise.all(responses.map(response=>response.json()));
   const [c,h]=values;
   const data=JSON.stringify(about?{c,h}:c).replace(/</g,'\\u003c').replace(/>/g,'\\u003e').replace(/&/g,'\\u0026');
   let html=await readFile(path,'utf8');
   const appId=about?'about-app':'app',dataId=about?'about-data':'home-data';
   html=html.replace(`<div id="${appId}"></div>`,()=>`<div id="${appId}">${about?renderAbout(c,h):renderHomepage(c)}</div><script id="${dataId}" type="application/json">${data}</script>`);
   res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});
   return res.end(req.method==='HEAD'?undefined:html);
  }
  res.writeHead(200,{'Content-Type':types[extname(path)]||'application/octet-stream','Cache-Control':'no-cache'});res.end(req.method==='HEAD'?undefined:await readFile(path));
 }catch(error){if(res.headersSent){res.destroy();return;}res.writeHead(error.code==='ENOENT'?404:502,{'Content-Type':'text/plain; charset=utf-8'});res.end(error.code==='ENOENT'?'Not found':'Không kết nối được BE.');}
}); }
if(process.argv[1] && fileURLToPath(import.meta.url)===resolve(process.argv[1])) {
const server=createFrontendServer();
server.listen(Number(process.env.FE_PORT||5173),process.env.FE_HOST||'127.0.0.1',()=>console.log(`FE: http://localhost:${process.env.FE_PORT||5173}`));
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>server.close(()=>process.exit(0)));

}
