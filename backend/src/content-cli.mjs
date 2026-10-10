import { readFileSync,writeFileSync,copyFileSync,mkdirSync,statSync,unlinkSync } from 'node:fs';
import { resolve,extname } from 'node:path';
import { randomUUID } from 'node:crypto';
import { createRepository } from './repository.mjs';
import { storage } from './config.mjs';
const [command,file,target]=process.argv.slice(2); const repo=createRepository();
try {
 if(command==='about-set' && file && target!==undefined){
  if(!/^[a-zA-Z][a-zA-Z0-9]*(?:\.(?:[a-zA-Z][a-zA-Z0-9]*|\d+))*$/.test(file))throw new Error('Đường dẫn nội dung không hợp lệ.');
  const c=repo.getAbout(),parts=file.split('.');let object=c;
  for(const key of parts.slice(0,-1)){if(!object || !Object.hasOwn(object,key))throw new Error('Mục nội dung không tồn tại.');object=object[key];}
  const key=parts.at(-1);if(!object || !Object.hasOwn(object,key) || typeof object[key]!=='string')throw new Error('Chỉ cập nhật được mục văn bản đang có.');
  object[key]=target.replace(/\\n/g,'\n');repo.saveAbout(c);console.log('Đã cập nhật '+file+' trên trang giới thiệu.');
 }
 else if(command==='about-import' && file){repo.saveAbout(JSON.parse(readFileSync(resolve(file),'utf8')));console.log('Đã cập nhật riêng trang Giới thiệu Cộng đoàn.');}
 else if(command==='about-export' && file){writeFileSync(resolve(file),JSON.stringify(repo.getAbout(),null,2));console.log('Đã xuất nội dung trang giới thiệu.');}
 else if(command==='import' && file) {repo.save(JSON.parse(readFileSync(resolve(file),'utf8')));console.log('Đã nhập nội dung.');}
 else if(command==='export' && file) {writeFileSync(resolve(file),JSON.stringify(repo.get(),null,2));console.log('Đã xuất nội dung.');}
 else if((command==='groups-import' || command==='teams-import') && file) {
  const c=repo.get();c.groups=JSON.parse(readFileSync(resolve(file),'utf8'));if(c.groups.layout!=='teams')throw new Error('Dữ liệu phải là các tổ: hãy dùng teams:export để lấy mẫu hiện tại.');repo.save(c);console.log('Đã cập nhật danh sách các tổ.');
 }
 else if((command==='groups-export' || command==='teams-export') && file) {writeFileSync(resolve(file),JSON.stringify(repo.get().groups,null,2));console.log('Đã xuất danh sách các tổ.');}
 else if(command==='music' && file) {
  const extension=extname(file).toLowerCase();
  if(!['.mp3','.m4a','.ogg','.wav'].includes(extension))throw new Error('Chỉ hỗ trợ nhạc MP3, M4A, OGG, WAV.');
  const source=resolve(file),info=statSync(source);
  if(!info.isFile() || info.size===0)throw new Error('File nhạc trống hoặc không hợp lệ.');
  const c=repo.get();if(target)c.music.title=target;
  const destination=resolve(storage,'media',randomUUID()+extension);mkdirSync(resolve(storage,'media'),{recursive:true});copyFileSync(source,destination);
  try{c.music.src='/media/'+destination.split(/[\\/]/).at(-1);repo.save(c);}catch(error){unlinkSync(destination);throw error;}
  console.log('Đã cập nhật nhạc nền. Tải lại trang rồi bấm Bật nhạc.');
 }
 else if(command==='video' && file) {
  if(extname(file).toLowerCase()!=='.mp4')throw new Error('Video phải là file MP4.');
  const source=resolve(file);
  if(!statSync(source).isFile() || statSync(source).size===0)throw new Error('File video trống hoặc không hợp lệ.');
  const name=randomUUID()+'.mp4',destination=resolve(storage,'media',name);
  const c=repo.get();mkdirSync(resolve(storage,'media'),{recursive:true});copyFileSync(source,destination);
  try{c.hero.videoUrl='/media/'+name;repo.save(c);}catch(error){unlinkSync(destination);throw error;}
  console.log('Đã cập nhật video giới thiệu. Tải lại trang rồi bấm Xem video giới thiệu.');
 }
 else if(command==='media' && file && target) {
  const extension=extname(file).toLowerCase(); if(!['.png','.jpg','.jpeg','.webp','.gif'].includes(extension))throw new Error('Chỉ hỗ trợ PNG, JPG, WEBP, GIF.');
  const c=repo.get(); let object,key;
  if(target==='about' || /^about:[1-4]$/.test(target)){
   const a=repo.getAbout(),name=randomUUID()+extension,destination=resolve(storage,'media',name);
   mkdirSync(resolve(storage,'media'),{recursive:true});copyFileSync(resolve(file),destination);
   try{if(target==='about')a.hero.image='/media/'+name;else a.hero.images[Number(target.split(':')[1])-1].src='/media/'+name;repo.saveAbout(a);}catch(error){unlinkSync(destination);throw error;}
   console.log('Đã cập nhật ảnh giới thiệu: '+target);
  }
  else {
  if(target==='hero' || target==='journey'){object=c[target];key='image';}
  else if(target==='logo'){object=c.brand;key='logo';}
  else if(target.startsWith('news:')){object=c.news.find(x=>x.id===target.slice(5));key='image';}
  else if(target.startsWith('group:')){object=c.groups.items.find(x=>x.id===target.slice(6));key='image';}
  else if(target.startsWith('gallery:')){object=c.gallery.images.find(x=>x.id===target.slice(8));key='src';}
  if(!object)throw new Error('Vị trí ảnh không tồn tại.');
  const name=randomUUID()+extension;mkdirSync(resolve(storage,'media'),{recursive:true});copyFileSync(resolve(file),resolve(storage,'media',name));object[key]='/media/'+name;repo.save(c);console.log('Đã cập nhật ảnh: '+target);
  }
 } else throw new Error('Cú pháp: import <json> | export <json> | media <ảnh> <hero|journey|logo|news:ID|gallery:ID|group:ID> | video <file.mp4> | groups-import <json> | groups-export <json>');
} catch(error) {console.error(error.message);process.exitCode=1;} finally{repo.close();}
