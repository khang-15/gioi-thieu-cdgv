import test from 'node:test';
import assert from 'node:assert/strict';
import {createFrontendServer,resolvePublicFile} from './server.mjs';
import {renderNews,newsImage} from './src/news-view.js';
import {newsContent} from './src/news-content.js';
import {selectArticles} from './src/news-model.js';
import {win32,posix} from 'node:path';
test('News search supports accents, combined categories and body text',()=>{
 assert(selectArticles(newsContent.articles,'all','lang nghe').some(a=>a.id==='lang-nghe'));
 assert(selectArticles(newsContent.articles,'dao-luyen','đỌc').every(a=>a.category==='dao-luyen'));
 assert.equal(selectArticles(newsContent.articles,'all','khongtimthay123').length,0);
 assert.equal(selectArticles(newsContent.articles,'thong-bao','').length,2);
 assert(selectArticles(newsContent.articles,'all','điện thoại').some(a=>a.id==='lang-nghe'));
 assert.equal(selectArticles(newsContent.articles,'all','   ').length,newsContent.articles.length);
 const ids=new Set(newsContent.articles.map(a=>a.id));assert.equal(ids.size,newsContent.articles.length);
 assert(ids.has(newsContent.featuredId));
 for(const a of newsContent.articles){assert(newsContent.categories.some(c=>c.id===a.category));assert.equal(a.status,'sample');assert.equal(a.date,null);}
});
test('News renders safely, keeps anchors valid and separates sample notices',()=>{
 const c=structuredClone(newsContent);c.lead='<script>alert(1)</script>';
 const html=renderNews(c);assert(!html.includes('<script>alert'));assert(html.includes('&lt;script&gt;'));
 assert(!newsImage('javascript:alert(1)','x').includes('<img'));
 assert(!newsImage('/media/../../secret.jpg','x').includes('<img'));
 assert(newsImage('/media/photo.webp','<photo>').includes('alt="&lt;photo&gt;"'));
 assert.equal((html.match(/data-card=/g)||[]).length,8);
 assert(html.includes('Chưa có thông báo chính thức.'));
 c.articles.find(a=>a.category==='thong-bao').status='published';
 assert(!renderNews(c).includes('Chưa có thông báo chính thức.'));
 for(const [,target] of html.matchAll(/href="#([^"]+)"/g))assert(html.includes('id="'+target+'"'));
});
test('News routes support Windows and Linux',()=>{
 for(const [paths,root] of [[win32,'C:\\site\\frontend'],[posix,'/site/frontend']])
 for(const route of ['/tin-tuc','/tin-tuc/'])assert.equal(resolvePublicFile(route,root,paths),paths.resolve(root,'news.html'));
});
test('News HTML and modules are available without backend',async()=>{
 const server=createFrontendServer('http://127.0.0.1:1');await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const base='http://127.0.0.1:'+server.address().port;
 try{
 const response=await fetch(base+'/tin-tuc/');assert.equal(response.status,200);assert((await response.text()).includes('data-card="lang-nghe"'));
 for(const file of ['news.js','news.css','news-view.js','news-content.js','news-model.js'])assert.equal((await fetch(base+'/src/'+file)).status,200);
 assert.equal((await fetch(base+'/tin-tuc/',{method:'HEAD'})).status,200);
 assert.equal((await fetch(base+'/tin-tuc/',{method:'POST'})).status,405);
 }finally{await new Promise(r=>server.close(r));}
});