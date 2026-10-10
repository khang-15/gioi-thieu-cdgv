import test from 'node:test';
import assert from 'node:assert/strict';
import {createFrontendServer,resolvePublicFile} from './server.mjs';
import {win32,posix} from 'node:path';
test('Journey routes work on Windows and Linux',()=>{
 for(const [paths,root] of [[win32,'C:\\site\\frontend'],[posix,'/site/frontend']]){
  for(const url of ['/hanh-trinh-on-goi','/hanh-trinh-on-goi/'])assert.equal(resolvePublicFile(url,root,paths),paths.resolve(root,'journey.html'));
 }
});
test('Journey page and resources load without backend; contains five stages and anchor targets',async()=>{
 const server=createFrontendServer('http://127.0.0.1:1');
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const base='http://127.0.0.1:'+server.address().port;
 try{
  const response=await fetch(base+'/hanh-trinh-on-goi/');assert.equal(response.status,200);
  const html=await response.text();
  assert.equal((html.match(/class="stage reveal"/g)||[]).length,5);
  for(const [,target] of html.matchAll(/href="#([^"]+)"/g))assert(html.includes('id="'+target+'"'));
  for(const path of ['/src/journey.js','/src/journey.css'])assert.equal((await fetch(base+path)).status,200);
  assert.equal((await fetch(base+'/hanh-trinh-on-goi/',{method:'HEAD'})).status,200);
  assert.equal((await fetch(base+'/hanh-trinh-on-goi/',{method:'POST'})).status,405);
 }finally{await new Promise(r=>server.close(r));}
});
