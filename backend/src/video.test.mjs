import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync,readFileSync,cpSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {execFileSync} from 'node:child_process';
import {createRepository} from './repository.mjs';
import {createApp} from './server.mjs';
import {createFrontendServer} from '../../frontend/server.mjs';
const listen=server=>new Promise(done=>server.listen(0,'127.0.0.1',done));
const address=server=>`http://127.0.0.1:${server.address().port}`;
const close=server=>new Promise(done=>{server.close(done);server.closeAllConnections();});
test('MP4 qua FE/BE: stream đầy đủ, HEAD, tua byte và từ chối range sai',async()=>{
 const dir=mkdtempSync(join(tmpdir(),'video-stream-')),repo=createRepository(':memory:');
 const bytes=Buffer.from('0123456789abcdefghij');writeFileSync(join(dir,'clip.mp4'),bytes);
 const be=createApp(repo,dir);await listen(be);const fe=createFrontendServer(address(be));await listen(fe);
 try{
  for(const base of [address(be),address(fe)]){
   let response=await fetch(base+'/media/clip.mp4');assert.equal(response.status,200);assert.equal(response.headers.get('content-type'),'video/mp4');assert.deepEqual(Buffer.from(await response.arrayBuffer()),bytes);
   response=await fetch(base+'/media/clip.mp4',{method:'HEAD'});assert.equal(response.status,200);assert.equal(response.headers.get('content-length'),'20');assert.equal((await response.arrayBuffer()).byteLength,0);
   for(const [range,expected,contentRange] of [['bytes=2-5','2345','bytes 2-5/20'],['bytes=15-','fghij','bytes 15-19/20'],['bytes=-3','hij','bytes 17-19/20'],['bytes=17-100','hij','bytes 17-19/20']]){
    response=await fetch(base+'/media/clip.mp4',{headers:{Range:range}});assert.equal(response.status,206);assert.equal(response.headers.get('content-range'),contentRange);assert.equal(response.headers.get('accept-ranges'),'bytes');assert.equal(await response.text(),expected);
   }
   for(const range of ['bytes=30-','bytes=8-2','bytes=-0','bytes=0-1,3-4','bytes=bad']){response=await fetch(base+'/media/clip.mp4',{headers:{Range:range}});assert.equal(response.status,416);assert.equal(response.headers.get('content-range'),'bytes */20');await response.arrayBuffer();}
   assert.equal((await fetch(base+'/media/missing.mp4')).status,404);
  }
 }finally{await close(fe);await close(be);repo.close();rmSync(dir,{recursive:true,force:true});}
});
test('Lệnh video:set chỉ cập nhật video; giữ ảnh/nội dung và từ chối sai file',()=>{
 const dir=mkdtempSync(join(tmpdir(),'video-cli-'));let repo;
 try{
  cpSync(new URL('.',import.meta.url),join(dir,'backend/src'),{recursive:true});cpSync(new URL('../content/',import.meta.url),join(dir,'backend/content'),{recursive:true});
  const cli=join(dir,'backend/src/content-cli.mjs'),db=join(dir,'backend/storage/community.sqlite');
  execFileSync(process.execPath,[cli,'export',join(dir,'before.json')]);
  const initial=JSON.parse(readFileSync(join(dir,'before.json'),'utf8'));initial.hero.image='/media/own-photo.jpg';initial.contact.email='my@example.org';writeFileSync(join(dir,'before.json'),JSON.stringify(initial));execFileSync(process.execPath,[cli,'import',join(dir,'before.json')]);
  writeFileSync(join(dir,'clip cộng đoàn.mp4'),Buffer.from('test video bytes'));execFileSync(process.execPath,[cli,'video',join(dir,'clip cộng đoàn.mp4')]);
  repo=createRepository(db);const updated=repo.get();repo.close();repo=null;assert.match(updated.hero.videoUrl,/^\/media\/[\w-]+\.mp4$/);assert.deepEqual(readFileSync(resolve(dir,'backend/storage',updated.hero.videoUrl.slice(1))),Buffer.from('test video bytes'));initial.hero.videoUrl=updated.hero.videoUrl;assert.deepEqual(updated,initial);
  for(const name of ['missing.mp4','wrong.jpg','empty.mp4']){if(name==='empty.mp4')writeFileSync(join(dir,name),'');assert.throws(()=>execFileSync(process.execPath,[cli,'video',join(dir,name)],{stdio:'pipe'}));}
  repo=createRepository(db);assert.deepEqual(repo.get(),updated);
  for(const url of ['/media/../clip.mp4','/media/.clip.mp4','javascript:alert(1)','/media/clip.mp4?x=1']){const bad=structuredClone(updated);bad.hero.videoUrl=url;assert.throws(()=>repo.save(bad));}
 }finally{repo?.close();rmSync(dir,{recursive:true,force:true});}
});
test('Nhập nhạc nền chỉ thay file nhạc, giữ phân tổ/chức vụ/ảnh/video; BE phát đúng MIME và range',async()=>{
 const dir=mkdtempSync(join(tmpdir(),'music-cli-'));let repo,be,fe;
 try {
  cpSync(new URL('.',import.meta.url),join(dir,'backend/src'),{recursive:true});cpSync(new URL('../content/',import.meta.url),join(dir,'backend/content'),{recursive:true});
  const cli=join(dir,'backend/src/content-cli.mjs'),db=join(dir,'backend/storage/community.sqlite');execFileSync(process.execPath,[cli,'export',join(dir,'data.json')]);
  const before=JSON.parse(readFileSync(join(dir,'data.json'),'utf8'));before.groups.items[0].leader='Tổ trưởng đã nhập';before.groups.items[0].deputy='Tổ phó đã nhập';before.hero.image='/media/own.jpg';before.hero.videoUrl='/media/own.mp4';writeFileSync(join(dir,'data.json'),JSON.stringify(before));execFileSync(process.execPath,[cli,'import',join(dir,'data.json')]);
  const bytes=Buffer.from('ID3-test-audio-content');writeFileSync(join(dir,'Xin giữ con.mp3'),bytes);execFileSync(process.execPath,[cli,'music',join(dir,'Xin giữ con.mp3')]);
  repo=createRepository(db);const after=repo.get();assert.match(after.music.src,/^\/media\/[\w-]+\.mp3$/);const expected=structuredClone(before);expected.music.src=after.music.src;assert.deepEqual(after,expected);
  for(const src of ['javascript:alert(1)','/media/../track.mp3','/media/track.mp4']){const bad=structuredClone(after);bad.music.src=src;assert.throws(()=>repo.save(bad));}
  assert.throws(()=>execFileSync(process.execPath,[cli,'music',join(dir,'missing.mp3')],{stdio:'pipe'}));assert.throws(()=>execFileSync(process.execPath,[cli,'music',join(dir,'wrong.exe')],{stdio:'pipe'}));assert.deepEqual(repo.get(),after);
  be=createApp(repo,join(dir,'backend/storage/media'));await listen(be);fe=createFrontendServer(address(be));await listen(fe);
  const response=await fetch(address(fe)+after.music.src,{headers:{Range:'bytes=0-2'}});assert.equal(response.status,206);assert.equal(response.headers.get('content-type'),'audio/mpeg');assert.equal(await response.text(),'ID3');
 }finally{if(fe)await close(fe);if(be)await close(be);repo?.close();rmSync(dir,{recursive:true,force:true});}
});
