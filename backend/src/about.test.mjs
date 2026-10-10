import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createRepository} from './repository.mjs';
import {createApp} from './server.mjs';
import {validateAbout} from './about-repository.mjs';
import {createFrontendServer,resolvePublicFile} from '../../frontend/server.mjs';
import {renderAbout} from '../../frontend/src/about-view.js';
const listen=server=>new Promise(done=>server.listen(0,'127.0.0.1',done));
const close=server=>new Promise(done=>{server.close(done);server.closeAllConnections();});
test('Nội dung giới thiệu lưu riêng, khởi tạo một lần và không đổi dữ liệu trang chủ',()=>{
 const dir=mkdtempSync(join(tmpdir(),'about-store-')),file=join(dir,'db.sqlite');let repo=createRepository(file);
 try{const home=repo.get();home.hero.image='/media/user-photo.jpg';home.hero.videoUrl='/media/user-clip.mp4';home.music.src='/media/user-music.mp3';home.groups.items[0].leader='Tên riêng';repo.save(home);const about=repo.getAbout();about.identity.title='Câu chuyện của chúng tôi';about.identity.paragraphs[0]='Đoạn văn riêng'.normalize('NFD');repo.saveAbout(about);assert.deepEqual(repo.get(),home);repo.close();repo=createRepository(file);assert.equal(repo.getAbout().identity.title,about.identity.title);assert.equal(repo.getAbout().identity.paragraphs[0],'Đoạn văn riêng');assert.deepEqual(repo.get(),home);}finally{repo.close();rmSync(dir,{recursive:true,force:true});}
});
test('Giới thiệu từ chối sai cấu trúc/ảnh; giao diện thoát ký tự trong nội dung và giữ liên kết',()=>{
 const repo=createRepository(':memory:');try{
  for(const change of [c=>c.hero.image='javascript:alert(1)',c=>c.hero.images.pop(),c=>c.hero.images[0].src='javascript:alert(1)',c=>c.formation.items[0].id=c.formation.items[1].id,c=>c.identity.paragraphs='sai',c=>c.formation.items.pop(),c=>c.labels.menu=null]){const c=repo.getAbout();change(c);assert.throws(()=>validateAbout(c));}
  const c=repo.getAbout(),h=repo.get();c.identity.paragraphs[0]='<script>alert(1)</script>';h.hero.image='/media/real-photo.jpg';h.gallery.images[0].src='/media/gallery-photo.jpg';const html=renderAbout(c,h);
  assert.ok(html.includes('&lt;script&gt;'));assert.ok(!html.includes('<script>'));assert.ok(!html.includes('/media/real-photo.jpg'));assert.equal((html.match(/class="about-mosaic-card /g)||[]).length,4);c.hero.images[1].src='/media/new-intro.jpg';assert.ok(renderAbout(c,h).includes('/media/new-intro.jpg'));assert.ok(html.includes('/media/gallery-photo.jpg'));assert.equal((html.match(/class="about-pillar /g)||[]).length,4);assert.ok(html.includes('href="/#contact"'));assert.ok(html.includes('aria-expanded="false"'));assert.ok(html.includes('href="/"'));
 }finally{repo.close();}
});
test('Trang /gioi-thieu và API qua FE/BE, module và nội dung mới tải được',async()=>{
 const repo=createRepository(':memory:'),be=createApp(repo);await listen(be);const fe=createFrontendServer(`http://127.0.0.1:${be.address().port}`);await listen(fe);const base=`http://127.0.0.1:${fe.address().port}`;
 try{
  for(const path of ['/gioi-thieu','/gioi-thieu/']){const r=await fetch(base+path);assert.equal(r.status,200);assert.match(await r.text(),/about-page.js/);}
  const a=repo.getAbout();a.hero.title='Tiêu đề mới';repo.saveAbout(a);let r=await fetch(base+'/api/about');assert.equal(r.status,200);assert.equal((await r.json()).hero.title,'Tiêu đề mới');
  for(const path of ['/src/about-page.js','/src/about-view.js','/src/about.css','/src/music.js'])assert.equal((await fetch(base+path)).status,200);
  assert.equal((await fetch(base+'/api/about',{method:'POST'})).status,405);assert.equal(resolvePublicFile('/src/../../backend/content/about.json'),null);
 }finally{await close(fe);await close(be);repo.close();}
});

test('Nâng cấp dữ liệu cũ thêm đúng bốn khung trống, giữ nội dung riêng',()=>{
 const repo=createRepository(':memory:');try{const c=repo.getAbout();delete c.hero.images;c.hero.image='/media/my-photo.jpg';c.identity.title='Tiêu đề riêng';repo.saveAbout(c);const updated=repo.getAbout();assert.equal(updated.hero.images.length,4);assert.ok(updated.hero.images.every(x=>x.src===null));assert.equal(updated.hero.image,c.hero.image);assert.equal(updated.identity.title,c.identity.title);}finally{repo.close();}
});
