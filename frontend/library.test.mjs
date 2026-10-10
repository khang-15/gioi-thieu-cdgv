import test from 'node:test';
import assert from 'node:assert/strict';
import {renderLibrary} from './src/library-view.js';
import {libraryContent} from './src/library-content.js';
import {safeDriveUrl,filterAlbums} from './src/library-model.js';
import {createFrontendServer,resolvePublicFile} from './server.mjs';
import {win32,posix} from 'node:path';
test('Drive destinations allow folder and file links, reject other hosts and protocols',()=>{
 for(const u of ['https://drive.google.com/drive/folders/example_1?usp=sharing','https://drive.google.com/file/d/example-1/view','https://drive.google.com/open?id=example_1','https://drive.google.com/drive/u/0/folders/example_1'])assert(safeDriveUrl(u));
 for(const u of [null,'','javascript:alert(1)','http://drive.google.com/drive/folders/example','https://drive.google.com.evil.test/drive/folders/example','https://evil.test/','https://user:pass@drive.google.com/drive/folders/example','https://drive.google.com/','https://drive.google.com:8443/drive/folders/example'])assert.equal(safeDriveUrl(u),null);
});
test('Library keeps pending links disabled and opens configured Drive links in a new tab',()=>{
 const html=renderLibrary();assert.equal((html.match(/data-type=/g)||[]).length,6);
 assert(!html.includes('href="https://drive.google.com'));assert(html.includes('disabled>Đang cập nhật liên kết'));
 const c=structuredClone(libraryContent);c.albums[0].driveUrl='https://drive.google.com/drive/folders/example';
 c.albums[0].title='<script>bad</script>';
 const populated=renderLibrary(c);assert(populated.includes('target="_blank" rel="noopener noreferrer"'));assert(!populated.includes('<script>bad'));assert(populated.includes('&lt;script&gt;'));
 c.albums[0].cover='/media/../secret.jpg';assert(!renderLibrary(c).includes('src="/media/../'));
 c.albums[0].driveUrl='javascript:alert(1)';assert(!renderLibrary(c).includes('href="javascript:'));
 for(const [,id] of html.matchAll(/href="#([^"]+)"/g))assert(html.includes('id="'+id+'"'));
 assert.equal(filterAlbums(c.albums,'photo').length,4);assert.equal(filterAlbums(c.albums,'video').length,2);assert.equal(filterAlbums(c.albums,'all').length,6);
});
test('Library routes and resources load independently of backend',async()=>{
 for(const [paths,root] of [[win32,'C:\\site\\frontend'],[posix,'/site/frontend']])
 for(const route of ['/thu-vien','/thu-vien/'])assert.equal(resolvePublicFile(route,root,paths),paths.resolve(root,'library.html'));
 const server=createFrontendServer('http://127.0.0.1:1');await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const base='http://127.0.0.1:'+server.address().port;
 try{const res=await fetch(base+'/thu-vien/');assert.equal(res.status,200);assert((await res.text()).includes('id="albums"'));
 for(const f of ['library.js','library.css','library-view.js','library-content.js','library-model.js'])assert.equal((await fetch(base+'/src/'+f)).status,200);
 assert.equal((await fetch(base+'/thu-vien/',{method:'HEAD'})).status,200);
 assert.equal((await fetch(base+'/thu-vien/',{method:'POST'})).status,405);
 }finally{await new Promise(r=>server.close(r));}
});