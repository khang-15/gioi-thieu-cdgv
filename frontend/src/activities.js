import {activitiesContent as content} from './activities-content.js';
import {renderActivities,activityImage} from './activities-view.js';
const app=document.getElementById('activities-app');
if(!app.querySelector('main'))app.innerHTML=renderActivities(content);
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const menu=document.querySelector('.a-menu'),nav=document.querySelector('#a-nav');
function closeMenu(){menu.setAttribute('aria-expanded','false');nav.classList.remove('is-open');}
menu.onclick=()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));nav.classList.toggle('is-open',open);};
nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu();});
if(!reduced.matches && 'IntersectionObserver' in window){
 document.body.classList.add('a-motion');
 const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');observer.unobserve(e.target);}}),{threshold:.06});
 document.querySelectorAll('.a-reveal').forEach(el=>observer.observe(el));
}
document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{
 document.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
 let count=0;document.querySelectorAll('.a-story').forEach(card=>{card.hidden=button.dataset.filter!=='all' && card.dataset.category!==button.dataset.filter;if(!card.hidden){count++;card.classList.add('is-visible');}});
 document.querySelector('.a-results').textContent=count+' nội dung gợi ý';
}));
const dialog=document.querySelector('.a-dialog'),body=document.querySelector('#a-dialog-content');
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function open(html){body.innerHTML=html;dialog.showModal();}
document.querySelector('.a-dialog-close').onclick=()=>dialog.close();
dialog.addEventListener('close',()=>{body.replaceChildren();});
dialog.addEventListener('click',e=>{if(e.target!==dialog)return;const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();});
document.querySelectorAll('[data-story]').forEach(button=>button.onclick=()=>{const s=content.stories.find(x=>x.id===button.dataset.story);if(!s)return;open('<p class="a-kicker">GỢI Ý SINH HOẠT</p><h2 id="a-dialog-title">'+escape(s.title)+'</h2>'+activityImage(s.image,s.alt)+s.body.split('\n\n').map(p=>'<p>'+escape(p)+'</p>').join(''));});
document.querySelectorAll('[data-photo]').forEach(button=>button.onclick=()=>{const p=content.gallery[Number(button.dataset.photo)];if(p?.src)open('<h2 id="a-dialog-title">'+escape(p.alt)+'</h2>'+activityImage(p.src,p.alt));});
document.querySelectorAll('a[href^="#"]').forEach(link=>link.addEventListener('click',e=>{const hash=link.getAttribute('href'),target=document.getElementById(hash.slice(1));if(!target)return;e.preventDefault();target.classList.add('is-visible');target.querySelectorAll('.a-reveal').forEach(x=>x.classList.add('is-visible'));target.scrollIntoView({behavior:reduced.matches?'instant':'smooth'});history.replaceState(null,'',location.pathname+hash);}));
const stage=document.querySelector('.a-stage');let frame=0;
function sync(){frame=0;const max=document.documentElement.scrollHeight-innerHeight;document.querySelector('.a-progress').style.transform='scaleX('+(max>0?Math.min(scrollY/max,1):0)+')';stage.style.setProperty('--shift',reduced.matches?'0px':Math.min(scrollY*.045,22)+'px');}
function schedule(){if(!frame)frame=requestAnimationFrame(sync);}
addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule,{passive:true});sync();
if(matchMedia('(hover:hover) and (pointer:fine)').matches){
 stage.addEventListener('pointermove',e=>{if(reduced.matches)return;const r=stage.getBoundingClientRect();stage.style.setProperty('--rx',(-(e.clientY-r.top)/r.height+.5)*7+'deg');stage.style.setProperty('--ry',((e.clientX-r.left)/r.width-.5)*10+'deg');});
 stage.addEventListener('pointerleave',()=>{stage.style.setProperty('--rx','0deg');stage.style.setProperty('--ry','0deg');});
 document.querySelectorAll('.a-tilt').forEach(card=>{card.addEventListener('pointermove',e=>{if(reduced.matches)return;const r=card.getBoundingClientRect();card.style.setProperty('--cx',(-(e.clientY-r.top)/r.height+.5)*5+'deg');card.style.setProperty('--cy',((e.clientX-r.left)/r.width-.5)*6+'deg');});card.addEventListener('pointerleave',()=>{card.style.setProperty('--cx','0deg');card.style.setProperty('--cy','0deg');});});
}
reduced.addEventListener('change',()=>{if(reduced.matches)document.body.classList.remove('a-motion');schedule();});
document.addEventListener('visibilitychange',()=>{document.querySelectorAll('.a-floating,.a-orbit,.a-ribbon').forEach(el=>el.style.animationPlayState=document.hidden?'paused':'running');});
app.addEventListener('error',e=>{const img=e.target;if(img.tagName!=='IMG')return;const parent=img.closest('.a-photo');if(parent)parent.innerHTML=activityImage(null,img.alt);},true);
