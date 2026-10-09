import test from 'node:test';
import assert from 'node:assert/strict';
import {autoMusic} from './src/music.js';
const tick=()=>new Promise(resolve=>setImmediate(resolve));
function setup(blocked=false){
 const events=new Map();const page={addEventListener(type,fn){if(!events.has(type))events.set(type,new Set());events.get(type).add(fn);},removeEventListener(type,fn){events.get(type)?.delete(fn);},emit(type,event){for(const fn of [...events.get(type)||[]])fn(event);}};
 const audio={paused:true,calls:0,blocked,play(){this.calls++;if(this.blocked)return Promise.reject(Object.assign(new Error('blocked'),{name:'NotAllowedError'}));this.paused=false;return Promise.resolve();},pause(){this.paused=true;}};
 return {audio,page,events};
}
test('Mở trang thử phát ngay; F5 tạo trình phát mới vẫn tự thử phát',async()=>{
 for(let i=0;i<2;i++){const {audio,page}=setup();const player=autoMusic(audio,page);await tick();assert.equal(audio.calls,1);assert.equal(audio.paused,false);player.dispose();assert.equal(audio.paused,true);}
});
test('Bị chặn tự phát: đợi thao tác thật; tắt nhạc không bị click khác bật lại',async()=>{
 const {audio,page}=setup(true);const player=autoMusic(audio,page);await tick();assert.equal(audio.paused,true);
 page.emit('click',{isTrusted:false,target:{tagName:'DIV'}});assert.equal(audio.calls,1);
 audio.blocked=false;page.emit('click',{isTrusted:true,target:{tagName:'DIV'}});await tick();assert.equal(audio.paused,false);
 player.toggle();assert.equal(audio.paused,true);page.emit('click',{isTrusted:true,target:{tagName:'DIV'}});await tick();assert.equal(audio.paused,true);
 player.toggle();await tick();assert.equal(audio.paused,false);player.dispose();
});
test('Video dừng nhạc và loại bỏ việc thử lại; lỗi file không thử lặp mỗi click',async()=>{
 const {audio,page}=setup();const player=autoMusic(audio,page);await tick();page.emit('play',{target:{tagName:'VIDEO'}});assert.equal(audio.paused,true);page.emit('click',{isTrusted:true,target:{tagName:'DIV'}});await tick();assert.equal(audio.paused,true);player.dispose();
 const broken=setup();let errors=0;broken.audio.play=()=>Promise.reject(Object.assign(new Error('format'),{name:'NotSupportedError'}));const bad=autoMusic(broken.audio,broken.page,()=>errors++);await tick();assert.equal(errors,1);broken.page.emit('click',{isTrusted:true,target:{tagName:'DIV'}});await tick();assert.equal(errors,1);bad.dispose();
});
