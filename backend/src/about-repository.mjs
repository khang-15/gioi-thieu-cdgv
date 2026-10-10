import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {root} from './config.mjs';
import {normalizeText} from './content-upgrades.mjs';
export function validateAbout(c){
 const string=(v,label)=>{if(typeof v!=='string' || !v.trim() || v.length>12000)throw new Error(`Nội dung ${label} không hợp lệ.`);};
 if(!c || c.version!==1)throw new Error('Sai phiên bản nội dung giới thiệu.');
 string(c.pageTitle,'tiêu đề');
 for(const name of ['hero','identity','formation','life','gallery','invitation']){const section=c[name];if(!section || typeof section!=='object')throw new Error(`Thiếu ${name}.`);string(section.title,name);string(section.eyebrow,name);}
 for(const name of ['hero','formation','life','gallery','invitation'])string(c[name].description,name);
 for(const name of ['primaryLabel','secondaryLabel','imageAlt','imageCaption'])string(c.hero[name],name);
 if(c.hero.image!==null && (typeof c.hero.image!=='string' || !/^\/media\/[a-zA-Z0-9][a-zA-Z0-9_.-]*\.(jpg|jpeg|png|webp|gif)$/i.test(c.hero.image)))throw new Error('Ảnh giới thiệu phải là đường dẫn ảnh /media/ hoặc null.');
 const list=(a,label,min=1,max=20)=>{if(!Array.isArray(a)||a.length<min||a.length>max)throw new Error(`Danh sách ${label} không hợp lệ.`);};
 list(c.hero.images,'ảnh mở đầu',4,4);for(const image of c.hero.images){string(image.alt,'mô tả ảnh');string(image.caption,'chú thích ảnh');if(image.src!==null && (typeof image.src!=='string' || !/^\/media\/[a-zA-Z0-9][a-zA-Z0-9_.-]*\.(jpg|jpeg|png|webp|gif)$/i.test(image.src)))throw new Error('Đường dẫn ảnh mở đầu không hợp lệ.');}
 list(c.hero.orbitWords,'từ khóa',3,3);c.hero.orbitWords.forEach(x=>string(x,'từ khóa'));
 string(c.identity.lead,'mở đầu');string(c.identity.note,'ghi chú');list(c.identity.paragraphs,'đoạn văn');c.identity.paragraphs.forEach(x=>string(x,'đoạn văn'));
 list(c.formation.items,'chiều kích',4,4);const ids=new Set();
 for(const item of c.formation.items){if(!item || !/^[a-zA-Z0-9_-]+$/.test(item.id)||ids.has(item.id))throw new Error('ID chiều kích bị trùng hoặc sai.');ids.add(item.id);for(const key of ['title','subtitle','description','icon'])string(item[key],key);if(!['prayer','community','book','heart'].includes(item.icon))throw new Error('Biểu tượng không hợp lệ.');}
 list(c.life.items,'đời sống',1,8);for(const item of c.life.items){string(item.title,'đời sống');string(item.description,'đời sống');}
 for(const key of ['contactLabel','journeyLabel'])string(c.invitation[key],key);
 for(const key of ['home','about','identity','formation','life','gallery','contact','menu','backTop','scroll','imageEmpty','retry','error','skip'])string(c.labels?.[key],key);
 return c;
}
export function createAboutStore(db){
 db.exec('CREATE TABLE IF NOT EXISTS about_content (id INTEGER PRIMARY KEY CHECK(id=1), payload TEXT NOT NULL, updated_at TEXT NOT NULL)');
 const save=input=>{const c=normalizeText(input);if(c.hero && c.hero.images===undefined)c.hero.images=JSON.parse(readFileSync(resolve(root,'content/about.json'),'utf8')).hero.images;validateAbout(c);db.prepare('INSERT INTO about_content VALUES(1,?,?) ON CONFLICT(id) DO UPDATE SET payload=excluded.payload,updated_at=excluded.updated_at').run(JSON.stringify(c),new Date().toISOString());};
 if(!db.prepare('SELECT id FROM about_content WHERE id=1').get())save(JSON.parse(readFileSync(resolve(root,'content/about.json'),'utf8')));
 const existing=JSON.parse(db.prepare('SELECT payload FROM about_content WHERE id=1').get().payload);if(existing.hero.images===undefined)save(existing);
 return {get:()=>JSON.parse(db.prepare('SELECT payload FROM about_content WHERE id=1').get().payload),save};
}
