import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync,rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createRepository,validateContent } from './repository.mjs';
import { createApp } from './server.mjs';
test('Nội dung cập nhật tồn tại sau khi mở lại database',()=>{
 const dir=mkdtempSync(join(tmpdir(),'cong-doan-'));const db=join(dir,'test.sqlite');
 let repo=createRepository(db);
 try {const c=repo.get();c.hero.title='Nội dung đã thay đổi';repo.save(c);repo.close();repo=createRepository(db);assert.equal(repo.get().hero.title,'Nội dung đã thay đổi');}finally{repo.close();rmSync(dir,{recursive:true,force:true});}
});
test('API lấy dữ liệu repository, từ chối ghi và không lộ file nội bộ',async()=>{
 const repo=createRepository(':memory:'); const app=createApp(repo);await new Promise(resolve=>app.listen(0,'127.0.0.1',resolve));const url=`http://127.0.0.1:${app.address().port}`;
 try {
  const c=repo.get();c.hero.title='API kiểm thử';repo.save(c);
  const response=await fetch(url+'/api/homepage');assert.equal(response.status,200);assert.equal((await response.json()).hero.title,'API kiểm thử');
  assert.equal((await fetch(url+'/health')).status,200);
  assert.equal((await fetch(url+'/api/homepage',{method:'POST',body:'{}'})).status,405);
  assert.equal((await fetch(url+'/media/..%2Fcommunity.sqlite')).status,404);
  assert.equal((await fetch(url+'/media/community.sqlite')).status,404);
 }finally{await new Promise(resolve=>app.close(resolve));repo.close();}
});
test('Import từ chối ID trùng và đường dẫn ảnh không an toàn',()=>{
 const repo=createRepository(':memory:');try {const c=repo.get();c.news.push({...c.news[0]});assert.throws(()=>validateContent(c));const d=repo.get();d.hero.image='javascript:alert(1)';assert.throws(()=>validateContent(d));}finally{repo.close();}
});
test('Nâng cấp dữ liệu cũ đổi tên một lần, giữ ảnh và nội dung đã nhập',async()=>{
 const {DatabaseSync}=await import('node:sqlite');const dir=mkdtempSync(join(tmpdir(),'cong-doan-migration-'));const file=join(dir,'test.sqlite');
 const seed=createRepository(':memory:');const c=seed.get();seed.close();
 c.brand.name='Xuân Lộc Gò Vấp';c.hero.title='Xuân Lộc Gò Vấp';c.footer.text='Cộng đoàn Dự tu Xuân Lộc Gò Vấp';c.hero.image='/media/own-photo.jpg';c.contact.email='contact@example.org';c.news[0].body='Nội dung riêng của tôi'.normalize('NFD');
 const old=new DatabaseSync(file);old.exec('CREATE TABLE content (id INTEGER PRIMARY KEY,payload TEXT NOT NULL,updated_at TEXT NOT NULL)');old.prepare('INSERT INTO content VALUES(1,?,?)').run(JSON.stringify(c),new Date().toISOString());old.close();
 let repo;
 try{repo=createRepository(file);let updated=repo.get();assert.equal(updated.brand.name,'Gò Vấp');assert.equal(updated.hero.title,'Gò Vấp');assert.equal(updated.hero.image,'/media/own-photo.jpg');assert.equal(updated.contact.email,'contact@example.org');assert.equal(updated.events[2].location,'Giáo phận Xuân Lộc');assert.equal(updated.news[0].body,'Nội dung riêng của tôi');updated.brand.name='Tên tôi cập nhật sau nâng cấp';repo.save(updated);repo.close();repo=createRepository(file);assert.equal(repo.get().brand.name,'Tên tôi cập nhật sau nâng cấp');}finally{repo?.close();rmSync(dir,{recursive:true,force:true});}
});
test('Nâng cấp ban nhóm thành đúng bốn tổ; giữ dữ liệu cũ và chỉ chạy một lần',async()=>{
 const {DatabaseSync}=await import('node:sqlite');
 for(const hasGroup of [false,true]){
  const dir=mkdtempSync(join(tmpdir(),'teams-upgrade-')),path=join(dir,'test.sqlite'),seed=createRepository(':memory:');const c=seed.get();seed.close();
  c.hero.image='/media/my-hero.jpg';c.hero.videoUrl='/media/my-video.mp4';c.gallery.images[0].src='/media/my-gallery.jpg';c.navigation.find(x=>x.href==='#groups').label='Các ban, nhóm';
  c.groups={title:'Các ban, nhóm',description:'Giới thiệu riêng',items:hasGroup?[{id:'my-group',title:'Nhóm đã nhập',description:'Nội dung riêng',leader:'Anh trưởng',deputy:'Anh phó',members:['Anh A'],image:'/media/my-group.jpg'}]:[]};
  const old=new DatabaseSync(path);old.exec('CREATE TABLE content (id INTEGER PRIMARY KEY,payload TEXT NOT NULL,updated_at TEXT NOT NULL)');old.prepare('INSERT INTO content VALUES(1,?,?)').run(JSON.stringify(c),new Date().toISOString());old.close();let repo;
  try{
   repo=createRepository(path);const data=repo.get();assert.equal(data.groups.items.length,4);assert.deepEqual(data.groups.items.map(x=>x.number),[1,2,3,4]);assert.equal(data.groups.layout,'teams');assert.equal(data.navigation.find(x=>x.href==='#groups').label,'Các tổ');
   for(const key of ['hero','brand','gallery','news','events','contact','footer'])assert.deepEqual(data[key],c[key]);
   if(hasGroup){assert.equal(data.groups.previous.items[0].image,'/media/my-group.jpg');assert.equal(data.groups.previous.description,'Giới thiệu riêng');assert.equal(data.groups.items[0].leader,'Anh trưởng');assert.equal(data.groups.items[0].deputy,'Anh phó');assert.deepEqual(data.groups.items[0].members,['Anh A']);}
   data.groups.items[3].members=['Tên người dùng cập nhật'];repo.save(data);repo.close();repo=createRepository(path);assert.deepEqual(repo.get().groups,data.groups);
  }finally{repo?.close();rmSync(dir,{recursive:true,force:true});}
 }
});
test('Dữ liệu tổ từ chối sai số tổ và danh sách thành viên',()=>{
 const repo=createRepository(':memory:');try{
  for(const change of [c=>c.groups.items.pop(),c=>c.groups.items[0].number=2,c=>c.groups.items[0].members=[123],c=>c.groups.items[0].members=[' '],c=>c.groups.items[0].deputy=null]){const c=repo.get();change(c);assert.throws(()=>repo.save(c));}
 }finally{repo.close();}
});
test('Ban, nhóm: từ chối ID trùng, nhiệm vụ sai kiểu và ảnh không an toàn',()=>{
 const repo=createRepository(':memory:');try{const a=repo.get();a.groups.items.push({...a.groups.items[0]});assert.throws(()=>repo.save(a));const b=repo.get();b.groups.items[0].mission='Sai kiểu';assert.throws(()=>repo.save(b));const d=repo.get();d.groups.items[0].image='javascript:alert(1)';assert.throws(()=>repo.save(d));}finally{repo.close();}
});
test('Bốn chiều kích thay dữ liệu cũ một lần, giữ mọi ảnh và các ban',async()=>{
 const {DatabaseSync}=await import('node:sqlite');const dir=mkdtempSync(join(tmpdir(),'formation-'));const path=join(dir,'test.sqlite');const seed=createRepository(':memory:');const c=seed.get();seed.close();
 c.values=Array.from({length:5},(_,i)=>({id:String(i),icon:'prayer',title:'Mục cũ '+i,description:'Cũ'}));c.hero.steps=['A','B','C','D','E'];c.hero.image='/media/hero.jpg';c.brand.logo='/media/logo.png';c.news[0].image='/media/news.jpg';c.gallery.images[1].src='/media/gallery.jpg';c.groups.items[0].title='Ban đã nhập';
 const old=new DatabaseSync(path);old.exec('CREATE TABLE content (id INTEGER PRIMARY KEY,payload TEXT NOT NULL,updated_at TEXT NOT NULL)');old.prepare('INSERT INTO content VALUES(1,?,?)').run(JSON.stringify(c),new Date().toISOString());old.close();let repo;
 try {repo=createRepository(path);const data=repo.get();assert.deepEqual(data.values.map(v=>v.title),['Thiêng liêng','Nhân bản','Tri thức','Mục vụ']);assert.deepEqual(data.hero.steps,data.values.map(v=>v.title));const expected=structuredClone(c);expected.values=data.values;expected.hero.steps=data.hero.steps;assert.deepEqual(data,expected);data.values[0].description='Mô tả riêng';repo.save(data);repo.close();repo=createRepository(path);assert.equal(repo.get().values[0].description,'Mô tả riêng');}finally{repo?.close();rmSync(dir,{recursive:true,force:true});}
});
