import {cp, mkdir, readFile, readdir, writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {renderHomepage} from '../frontend/src/home-view.js';
import {renderNews} from '../frontend/src/news-view.js';
import {renderActivities} from '../frontend/src/activities-view.js';
import {renderAbout} from '../frontend/src/about-view.js';
import assert from 'node:assert/strict';

const base = process.env.PREVIEW_BASE || '/gioi-thieu-cdgv/';
if (!/^\/[a-zA-Z0-9_/-]*\/$/.test(base)) throw new Error('Invalid preview base');
const out = resolve('dist');
const home = JSON.parse(await readFile('backend/content/homepage.json','utf8'));
const about = JSON.parse(await readFile('backend/content/about.json','utf8'));
// Keep the large LFS video outside the Pages artifact.
if (home.hero.videoUrl?.startsWith('/media/')) {
 home.hero.videoUrl = 'https://media.githubusercontent.com/media/khang-15/gioi-thieu-cdgv/main/backend/storage' + home.hero.videoUrl;
}
await mkdir(out,{recursive:true});
await cp('frontend/src',resolve(out,'src'),{recursive:true});
await cp('frontend/favicon.svg',resolve(out,'favicon.svg'));
await mkdir(resolve(out,'media'),{recursive:true});
for (const name of await readdir('backend/storage/media')) {
 if (/\.(jpg|jpeg|png|webp|gif|mp3|m4a|ogg|wav)$/i.test(name))
  await cp(resolve('backend/storage/media',name),resolve(out,'media',name));
}
const prefix = value => value.replace(/(href|src)="\/(?!\/)/g, '$1="'+base);
const embed = value => JSON.stringify(value).replace(/</g,'\\u003c').replace(/>/g,'\\u003e').replace(/&/g,'\\u0026');
for (const [file,id,dataId,value,html] of [
 ['index.html','app','home-data',home,renderHomepage(home)],
 ['gioi-thieu/index.html','about-app','about-data',{c:about,h:home},renderAbout(about,home)]
]) {
 let page = await readFile(file==='index.html'?'frontend/index.html':'frontend/about.html','utf8');
 page = page.replace('<div id="'+id+'"></div>',()=>'<div id="'+id+'">'+html+'</div><script id="'+dataId+'" type="application/json">'+embed(value)+'</script>');
 page = prefix(page).replaceAll(base+'gioi-thieu"',base+'gioi-thieu/"');
 page = page.replace('<head>','<head><base href="'+base+'">');
 assert(page.includes('id="'+dataId+'"'));
 assert(!/(href|src)="\/(src|media)\//.test(page));
 await mkdir(resolve(out,file,'..'),{recursive:true});
 await writeFile(resolve(out,file),page);
}
async function adapt(directory) {
 for(const entry of await readdir(directory,{withFileTypes:true})) {
  const file=resolve(directory,entry.name);
  if(entry.isDirectory()){await adapt(file);continue;}
  if(!/\.(js|css)$/.test(entry.name))continue;
  let source=await readFile(file,'utf8');
  if(entry.name.endsWith('.js')) {
   // Preserve /media validation; resolve paths only when inserting URLs into HTML.
   if(source.includes("String(s??'')")) {
    source='const previewPath=s=>typeof s==="string" && /^\\/(?:media\\/|gioi-thieu(?:\\/|$))/.test(s)?'+JSON.stringify(base)+'+s.slice(1):s;\n'+source.replaceAll("String(s??'')","String(previewPath(s)??'')");
   }
   source=prefix(source);
   source=source.replaceAll("audio.src=m.src","audio.src=new URL('.'+m.src,document.baseURI).href");
   source=source.replaceAll("fetch('/api/homepage')","fetch(new URL('data/homepage.json',document.baseURI))");
   source=source.replaceAll("fetch('/api/about')","fetch(new URL('data/about.json',document.baseURI))");
  } else source=source.replaceAll('/src/',base+'src/');
  await writeFile(file,source);
 }
}
await adapt(resolve(out,'src'));
let newsPage=await readFile('frontend/news.html','utf8');
newsPage=newsPage.replace('<div id="news-app"></div>',()=>'<div id="news-app">'+renderNews()+'</div>');
newsPage=prefix(newsPage).replace('<head>','<head><base href="'+base+'">');
assert(newsPage.includes(base+'src/news.js'));
assert(newsPage.includes('id="thong-bao"'));
assert(!newsPage.includes('src="/src/'));
await mkdir(resolve(out,'tin-tuc'),{recursive:true});
await writeFile(resolve(out,'tin-tuc/index.html'),newsPage);
let activitiesPage=await readFile('frontend/activities.html','utf8');
activitiesPage=activitiesPage.replace('<div id="activities-app"></div>',()=>'<div id="activities-app">'+renderActivities()+'</div>');
activitiesPage=prefix(activitiesPage).replace('<head>','<head><base href="'+base+'">');
assert(activitiesPage.includes(base+'src/activities.js'));
assert(activitiesPage.includes('id="cau-chuyen"'));
await mkdir(resolve(out,'su-kien'),{recursive:true});
await writeFile(resolve(out,'su-kien/index.html'),activitiesPage);
const journeyPage=prefix(await readFile('frontend/journey.html','utf8')).replace('<head>','<head><base href="'+base+'">');
assert(journeyPage.includes('id="hanh-trinh"'));
assert(journeyPage.includes(base+'src/journey.js'));
assert(!journeyPage.includes('src="/src/'));
await mkdir(resolve(out,'hanh-trinh-on-goi'),{recursive:true});
await writeFile(resolve(out,'hanh-trinh-on-goi/index.html'),journeyPage);
await mkdir(resolve(out,'data'),{recursive:true});
await writeFile(resolve(out,'data/homepage.json'),JSON.stringify(home));
await writeFile(resolve(out,'data/about.json'),JSON.stringify(about));
await writeFile(resolve(out,'.nojekyll'),'');
console.log('Preview built: '+base);
