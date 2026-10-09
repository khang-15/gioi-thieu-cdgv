import test from 'node:test';
import assert from 'node:assert/strict';
import {win32,posix} from 'node:path';
import {resolvePublicFile} from './server.mjs';
for(const [name,paths,root] of [['Windows',win32,'C:\\xampp\\htdocs\\cong-doan-web\\frontend'],['Linux',posix,'/workspace/cong-doan-web/frontend']]) {
 test(`${name}: trang chủ, CSS, JS tải đúng; chặn file nội bộ và vượt thư mục`,()=>{
  assert.equal(resolvePublicFile('/',root,paths),paths.resolve(root,'index.html'));
  assert.equal(resolvePublicFile('/src/styles.css',root,paths),paths.resolve(root,'src/styles.css'));
  assert.equal(resolvePublicFile('/src/app.js',root,paths),paths.resolve(root,'src/app.js'));
  for(const request of ['/server.mjs','/package.json','/src/../../backend/content/homepage.json','/src/../package.json','/src/..%5c..%5cbackend%5ccontent%5chomepage.json','/%ZZ']) assert.equal(resolvePublicFile(request,root,paths),null,request);
 });
}
