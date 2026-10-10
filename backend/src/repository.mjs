import {createAboutStore} from './about-repository.mjs';
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { root, storage } from './config.mjs';
import { normalizeText, upgradeCommunityName } from './content-upgrades.mjs';
export function validateContent(c) {
 if (!c || typeof c !== 'object' || !c.brand?.name || !c.hero?.title || !c.labels || !c.journey || !c.groups || !c.gallery || !c.contact || !c.footer) throw new Error('Thiếu nội dung bắt buộc.');
 for (const key of ['navigation','values','news','events']) if (!Array.isArray(c[key])) throw new Error(`${key} phải là mảng.`);
 if (!Array.isArray(c.gallery.images) || !Array.isArray(c.groups.items) || !Array.isArray(c.contact.links) || !Array.isArray(c.hero.steps)) throw new Error('Cấu trúc danh sách không hợp lệ.');
 for (const [key, items] of Object.entries({news:c.news,events:c.events})) {
  const ids = new Set();
  for (const item of items) {
   if (!item.id || ids.has(item.id) || !item.title || !/^\d{4}-\d{2}-\d{2}$/.test(item.date) || !Number.isFinite(Date.parse(item.date))) throw new Error(`Dữ liệu ${key} không hợp lệ hoặc trùng ID.`);
   ids.add(item.id);
  }
 }
 if(c.groups.labels) {
  for(const key of ['details','pending','mission','schedule','leader','about','empty']) if(typeof c.groups.labels[key]!=='string') throw new Error('Thiếu nhãn giao diện ban, nhóm.');
 }
 if(c.groups.layout==='teams') {
  if(c.groups.items.length!==4)throw new Error('Cần đúng 4 tổ.');
  const numbers=new Set();
  for(const group of c.groups.items){
   if(!Number.isInteger(group.number) || group.number<1 || group.number>4 || numbers.has(group.number))throw new Error('Số tổ phải là 1, 2, 3, 4 và không trùng.');
   numbers.add(group.number);
   if(typeof group.leader!=='string' || typeof group.deputy!=='string' || !Array.isArray(group.members) || group.members.some(name=>typeof name!=='string' || !name.trim()))throw new Error('Tên tổ trưởng, tổ phó và danh sách thành viên không hợp lệ.');
  }
  for(const key of ['deputy','members','number'])if(typeof c.groups.labels?.[key]!=='string')throw new Error('Thiếu nhãn hiển thị tổ.');
 }
 const groupIds=new Set();
 for(const group of c.groups.items) {
  if(!group || typeof group.title!=='string' || !group.title.trim()) throw new Error('Ban, nhóm phải có tên.');
  if(c.groups.labels && typeof group.id!=='string') throw new Error('Ban, nhóm phải có ID.');
  if(group.id!==undefined && (!/^[a-zA-Z0-9_-]+$/.test(group.id) || groupIds.has(group.id))) throw new Error('ID ban, nhóm không hợp lệ hoặc bị trùng.');
  groupIds.add(group.id);
  for(const key of ['tagline','description','schedule','leader','imageAlt']) if(group[key]!==undefined && typeof group[key]!=='string') throw new Error(`Thông tin ${key} của ban, nhóm phải là chữ.`);
  if(group.mission!==undefined && (!Array.isArray(group.mission) || group.mission.some(x=>typeof x!=='string'))) throw new Error('Nhiệm vụ của ban, nhóm phải là danh sách chữ.');
  if(group.isPlaceholder!==undefined && typeof group.isPlaceholder!=='boolean') throw new Error('isPlaceholder phải là true hoặc false.');
 }
 const images=[c.brand.logo,c.hero.image,c.journey.image,...c.news.map(n=>n.image),...c.gallery.images.map(n=>n.src),...c.groups.items.map(n=>n.image)];
 for (const src of images) if (src !== null && src !== undefined && !/^\/media\/[a-zA-Z0-9_.-]+$/.test(src)) throw new Error('Ảnh phải có đường dẫn /media/tên-file hoặc null.');
 if (c.hero.videoUrl && (typeof c.hero.videoUrl!=='string' || (!/^https:\/\//.test(c.hero.videoUrl) && !/^\/media\/[a-zA-Z0-9][a-zA-Z0-9_.-]*\.mp4$/i.test(c.hero.videoUrl)))) throw new Error('Video phải là URL HTTPS hoặc đường dẫn /media/tên-file.mp4.');
 if(c.music!==undefined) {
  const m=c.music;
  if(!m || typeof m.title!=='string' || !m.title.trim() || !Number.isFinite(m.volume) || m.volume<0 || m.volume>1)throw new Error('Cấu hình nhạc nền không hợp lệ.');
  if(m.src!==null && (typeof m.src!=='string' || !/^\/media\/[a-zA-Z0-9][a-zA-Z0-9_.-]*\.(mp3|m4a|ogg|wav)$/i.test(m.src)))throw new Error('Nhạc phải là file MP3, M4A, OGG hoặc WAV trong /media/.');
  for(const key of ['play','pause','volume','empty','error','background'])if(typeof m.labels?.[key]!=='string')throw new Error('Thiếu nhãn nhạc nền.');
 }
 return c;
}
export function createRepository(dbPath=resolve(storage,'community.sqlite')) {
 mkdirSync(storage,{recursive:true});
 const db=new DatabaseSync(dbPath);
 db.exec('PRAGMA journal_mode=WAL; CREATE TABLE IF NOT EXISTS content (id INTEGER PRIMARY KEY CHECK(id=1), payload TEXT NOT NULL, updated_at TEXT NOT NULL)');
 const save=input=> {const c=normalizeText(input);validateContent(c); db.prepare('INSERT INTO content(id,payload,updated_at) VALUES(1,?,?) ON CONFLICT(id) DO UPDATE SET payload=excluded.payload, updated_at=excluded.updated_at').run(JSON.stringify(c),new Date().toISOString());};
 if (!db.prepare('SELECT id FROM content WHERE id=1').get()) save(JSON.parse(readFileSync(resolve(root,'content/homepage.json'),'utf8')));
 db.exec('CREATE TABLE IF NOT EXISTS content_migrations (name TEXT PRIMARY KEY, applied_at TEXT NOT NULL)');
 const migration='20261008-community-go-vap-fonts';
 if(!db.prepare('SELECT name FROM content_migrations WHERE name=?').get(migration)) {
  db.exec('BEGIN IMMEDIATE');
  try {
   const previous=JSON.parse(db.prepare('SELECT payload FROM content WHERE id=1').get().payload);
   save(upgradeCommunityName(previous));
   db.prepare('INSERT INTO content_migrations(name,applied_at) VALUES(?,?)').run(migration,new Date().toISOString());
   db.exec('COMMIT');
  } catch(error) {db.exec('ROLLBACK');db.close();throw error;}
 }
 const groupsMigration='20261008-groups-module';
 if(!db.prepare('SELECT name FROM content_migrations WHERE name=?').get(groupsMigration)) {
  db.exec('BEGIN IMMEDIATE');
  try {
   const c=JSON.parse(db.prepare('SELECT payload FROM content WHERE id=1').get().payload);
   const template=JSON.parse(readFileSync(resolve(root,'content/groups.json'),'utf8'));
   if(c.groups.items.length===0) c.groups={...c.groups,...template};
   else {
    c.groups={...template,...c.groups,labels:{...template.labels,...c.groups.labels}};
    c.groups.items=c.groups.items.map((item,i)=>({id:`group-${i}`,tagline:'',description:'',mission:[],schedule:'',leader:'',image:null,imageAlt:item.title,isPlaceholder:false,...item}));
   }
   save(c);
   db.prepare('INSERT INTO content_migrations(name,applied_at) VALUES(?,?)').run(groupsMigration,new Date().toISOString());
   db.exec('COMMIT');
  } catch(error) {db.exec('ROLLBACK');db.close();throw error;}
 }
 const formationMigration='20261008-four-formation-dimensions';
 if(!db.prepare('SELECT name FROM content_migrations WHERE name=?').get(formationMigration)) {
  db.exec('BEGIN IMMEDIATE');
  try {
   const c=JSON.parse(db.prepare('SELECT payload FROM content WHERE id=1').get().payload);
   c.values=JSON.parse(readFileSync(resolve(root,'content/formation.json'),'utf8'));
   c.hero.steps=c.values.map(value=>value.title);
   save(c);
   db.prepare('INSERT INTO content_migrations(name,applied_at) VALUES(?,?)').run(formationMigration,new Date().toISOString());
   db.exec('COMMIT');
  } catch(error) {db.exec('ROLLBACK');db.close();throw error;}
 }
 const teamsMigration='20261009-four-teams';
 if(!db.prepare('SELECT name FROM content_migrations WHERE name=?').get(teamsMigration)) {
  db.exec('BEGIN IMMEDIATE');
  try {
   const c=JSON.parse(db.prepare('SELECT payload FROM content WHERE id=1').get().payload);
   if(c.groups.layout!=='teams') {
    const template=JSON.parse(readFileSync(resolve(root,'content/teams.json'),'utf8'));
    const previous=structuredClone(c.groups);
    c.groups={...template,previous};
    c.groups.items=template.items.map((item,i)=>({...item,leader:previous.items[i]?.leader||'',deputy:previous.items[i]?.deputy||'',members:previous.items[i]?.members||[]}));
   }
   for(const item of c.navigation)if(item.href==='#groups')item.label='Các tổ';
   save(c);
   db.prepare('INSERT INTO content_migrations(name,applied_at) VALUES(?,?)').run(teamsMigration,new Date().toISOString());
   db.exec('COMMIT');
  } catch(error) {db.exec('ROLLBACK');db.close();throw error;}
 }
 const musicMigration='20261009-background-music';
 if(!db.prepare('SELECT name FROM content_migrations WHERE name=?').get(musicMigration)) {
  db.exec('BEGIN IMMEDIATE');
  try {
   const c=JSON.parse(db.prepare('SELECT payload FROM content WHERE id=1').get().payload);
   if(c.music===undefined)c.music=JSON.parse(readFileSync(resolve(root,'content/music.json'),'utf8'));
   save(c);
   db.prepare('INSERT INTO content_migrations(name,applied_at) VALUES(?,?)').run(musicMigration,new Date().toISOString());db.exec('COMMIT');
  }catch(error){db.exec('ROLLBACK');db.close();throw error;}
 }
 const about=createAboutStore(db);
 return {getAbout:about.get,saveAbout:about.save,get:()=>JSON.parse(db.prepare('SELECT payload FROM content WHERE id=1').get().payload), save, close:()=>db.close()};
}
