import test from 'node:test';
import assert from 'node:assert/strict';
import {createFrontendServer,resolvePublicFile} from './server.mjs';
import {renderActivities,activityImage} from './src/activities-view.js';
import {activitiesContent} from './src/activities-content.js';
import {win32,posix} from 'node:path';
test('Activity render escapes text and rejects unsafe images',()=>{
 const c=structuredClone(activitiesContent);c.lead='<script>alert(1)</script>';
 const html=renderActivities(c);assert(!html.includes('<script>alert'));assert(html.includes('&lt;script&gt;'));
 assert(!activityImage('javascript:alert(1)','x').includes('<img'));
 assert(!activityImage('/media/../../secret.jpg','x').includes('<img'));
 assert(activityImage('/media/example.webp','<photo>').includes('alt="&lt;photo&gt;"'));
 assert.equal((html.match(/data-story=/g)||[]).length,6);
 assert(html.includes('Lịch chính thức đang được cập nhật'));
 for(const [,target] of html.matchAll(/href="#([^"]+)"/g))assert(html.includes('id="'+target+'"'));
 const ids=new Set(c.stories.map(s=>s.id));assert.equal(ids.size,c.stories.length);
 for(const s of c.stories)assert(c.categories.some(x=>x.id===s.category));
});
test('Activities routes work on Windows and Linux',()=>{
 for(const [paths,root] of [[win32,'C:\\site\\frontend'],[posix,'/site/frontend']]){
 for(const route of ['/su-kien','/su-kien/'])assert.equal(resolvePublicFile(route,root,paths),paths.resolve(root,'activities.html'));
 }
});
test('Activities page renders and serves resources without backend',async()=>{
 const server=createFrontendServer('http://127.0.0.1:1');
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const base='http://127.0.0.1:'+server.address().port;
 try{
 const response=await fetch(base+'/su-kien/');assert.equal(response.status,200);
 assert((await response.text()).includes('data-story="tinh-tam"'));
 for(const file of ['activities.js','activities.css','activities-view.js','activities-content.js'])assert.equal((await fetch(base+'/src/'+file)).status,200);
 assert.equal((await fetch(base+'/su-kien/',{method:'HEAD'})).status,200);
 assert.equal((await fetch(base+'/su-kien/',{method:'POST'})).status,405);
 }finally{await new Promise(r=>server.close(r));}
});