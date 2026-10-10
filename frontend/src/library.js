import {libraryContent as content} from './library-content.js';
import {renderLibrary} from './library-view.js';
import {filterAlbums,safeDriveUrl} from './library-model.js';
const app=document.getElementById('library-app');
if(!app.querySelector('main'))app.innerHTML=renderLibrary(content);
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const menu=document.querySelector('.l-menu'),nav=document.getElementById('l-nav');
function closeMenu(){menu.setAttribute('aria-expanded','false');nav.classList.remove('is-open');}
menu.onclick=()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));nav.classList.toggle('is-open',open);};
nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu();});
if(!reduced.matches&&'IntersectionObserver' in window){document.body.classList.add('l-motion');const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');observer.unobserve(e.target);}}),{threshold:.06});document.querySelectorAll('.l-reveal').forEach(el=>observer.observe(el));}
function filter(type){
 const albums=filterAlbums(content.albums,type),ready=albums.filter(a=>safeDriveUrl(a.driveUrl)).length;
 document.querySelectorAll('[data-type]').forEach(card=>{card.hidden=type!=='all'&&card.dataset.type!==type;if(!card.hidden)card.classList.add('is-visible');});
 document.querySelector('.l-results').textContent=albums.length+' bộ tư liệu · '+ready+' liên kết đã cập nhật';
 document.querySelector('.l-empty').hidden=albums.length!==0;
}
document.querySelectorAll('[data-filter]').forEach(b=>b.onclick=()=>{document.querySelectorAll('[data-filter]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));filter(b.dataset.filter);});filter('all');
document.querySelectorAll('a[href^="#"]').forEach(link=>link.addEventListener('click',e=>{const hash=link.getAttribute('href'),target=document.getElementById(hash.slice(1));if(!target)return;e.preventDefault();target.classList.add('is-visible');target.querySelectorAll('.l-reveal').forEach(el=>el.classList.add('is-visible'));target.scrollIntoView({behavior:reduced.matches?'instant':'smooth'});history.replaceState(null,'',location.pathname+location.search+hash);}));
const scene=document.querySelector('.l-scene');let frame=0;
function sync(){frame=0;const max=document.documentElement.scrollHeight-innerHeight;document.querySelector('.l-progress').style.transform='scaleX('+(max>0?Math.min(scrollY/max,1):0)+')';scene.style.setProperty('--travel',reduced.matches?'0px':Math.min(scrollY*.04,22)+'px');}
function schedule(){if(!frame)frame=requestAnimationFrame(sync);}
addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule,{passive:true});sync();
if(matchMedia('(hover:hover) and (pointer:fine)').matches){scene.addEventListener('pointermove',e=>{if(reduced.matches)return;const r=scene.getBoundingClientRect();scene.style.setProperty('--rx',(-(e.clientY-r.top)/r.height+.5)*7+'deg');scene.style.setProperty('--ry',((e.clientX-r.left)/r.width-.5)*10+'deg');});scene.addEventListener('pointerleave',()=>{scene.style.setProperty('--rx','0deg');scene.style.setProperty('--ry','0deg');});document.querySelectorAll('.l-card').forEach(card=>{card.addEventListener('pointermove',e=>{if(reduced.matches)return;const r=card.getBoundingClientRect();card.style.setProperty('--cx',(-(e.clientY-r.top)/r.height+.5)*5+'deg');card.style.setProperty('--cy',((e.clientX-r.left)/r.width-.5)*6+'deg');});card.addEventListener('pointerleave',()=>{card.style.setProperty('--cx','0deg');card.style.setProperty('--cy','0deg');});});}
reduced.addEventListener('change',()=>{if(reduced.matches)document.body.classList.remove('l-motion');schedule();});
document.addEventListener('visibilitychange',()=>document.querySelectorAll('.l-scene-ring,.l-float,.l-interlude-ring').forEach(el=>el.style.animationPlayState=document.hidden?'paused':'running'));
app.addEventListener('error',e=>{const img=e.target;if(img.tagName!=='IMG')return;const parent=img.closest('.l-photo');if(parent){const fallback=document.createElement('div');fallback.className='l-placeholder';const text=document.createElement('p');text.textContent=img.alt+' · Hình ảnh đang được cập nhật';fallback.append(text);parent.replaceChildren(fallback);}},true);
