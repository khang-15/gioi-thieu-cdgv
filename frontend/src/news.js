import {newsContent as content} from './news-content.js';
import {renderNews,newsImage} from './news-view.js';
import {selectArticles} from './news-model.js';
const app=document.getElementById('news-app');
if(!app.querySelector('main'))app.innerHTML=renderNews(content);
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const menu=document.querySelector('.n-menu'),nav=document.getElementById('n-nav');
function closeMenu(){menu.setAttribute('aria-expanded','false');nav.classList.remove('is-open');}
menu.onclick=()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));nav.classList.toggle('is-open',open);};
nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu();});
if(!reduced.matches&&'IntersectionObserver' in window){
 document.body.classList.add('n-motion');
 const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');observer.unobserve(e.target);}}),{threshold:.06});
 document.querySelectorAll('.n-reveal').forEach(el=>observer.observe(el));
}
let category='all',limit=4;
const input=document.getElementById('news-search'),more=document.querySelector('.n-more');
function updateList(){
 const matches=selectArticles(content.articles,category,input.value),visible=new Set(matches.slice(0,limit).map(a=>a.id));
 document.querySelectorAll('[data-card]').forEach(card=>{card.hidden=!visible.has(card.dataset.card);if(!card.hidden)card.classList.add('is-visible');});
 document.querySelector('.n-result-count').textContent=matches.length+' nội dung'+(matches.length>limit?' · đang hiển thị '+limit:'');
 document.querySelector('.n-no-results').hidden=matches.length!==0;more.hidden=matches.length<=limit;
}
document.querySelectorAll('[data-filter]').forEach(button=>button.onclick=()=>{category=button.dataset.filter;limit=4;document.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));updateList();});
input.addEventListener('input',()=>{limit=4;updateList();});more.onclick=()=>{limit+=4;updateList();};updateList();
const dialog=document.querySelector('.n-dialog'),body=document.querySelector('.n-dialog-body'),shareStatus=document.querySelector('.n-share-status');
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let activeId=null,opener=null;
function articleHash(id){return '#bai='+encodeURIComponent(id);}
function openArticle(id,trigger=null,writeHash=true){
 const a=content.articles.find(x=>x.id===id);if(!a)return;
 activeId=id;if(trigger)opener=trigger;shareStatus.textContent='';
 const related=content.articles.find(x=>x.category===a.category&&x.id!==id);
 body.innerHTML='<p class="n-kicker">'+escape(a.kind)+' · '+(a.status==='published'?'ĐÃ CÔNG BỐ':'NỘI DUNG MẪU')+'</p><h2 id="n-article-title">'+escape(a.title)+'</h2><p class="n-article-lead">'+escape(a.summary)+'</p><figure>'+newsImage(a.image,a.alt,true)+'<figcaption>'+escape(a.caption)+'</figcaption></figure><div class="n-article-text">'+a.body.map(p=>'<p>'+escape(p)+'</p>').join('')+'</div>'+(related?'<button class="n-related" data-related="'+escape(related.id)+'">Đọc tiếp: '+escape(related.title)+' ↗</button>':'');
 body.querySelector('[data-related]')?.addEventListener('click',e=>openArticle(e.currentTarget.dataset.related,null,true));
 if(!dialog.open)dialog.showModal();dialog.scrollTop=0;
 if(writeHash)history.replaceState(null,'',location.pathname+location.search+articleHash(id));
}
document.querySelectorAll('[data-article]').forEach(b=>b.onclick=()=>openArticle(b.dataset.article,b));
document.querySelector('.n-dialog-close').onclick=()=>dialog.close();
dialog.addEventListener('close',()=>{activeId=null;body.replaceChildren();shareStatus.textContent='';if(location.hash.startsWith('#bai='))history.replaceState(null,'',location.pathname+location.search);opener?.focus();opener=null;});
dialog.addEventListener('click',e=>{if(e.target!==dialog)return;const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();});
document.querySelector('.n-share').onclick=async()=>{
 if(!activeId)return;
 const url=new URL(location.href);url.hash=articleHash(activeId);
 try{if(!navigator.clipboard?.writeText)throw Error('Clipboard unavailable');await navigator.clipboard.writeText(url.href);shareStatus.textContent='Đã sao chép liên kết bài.';}catch{shareStatus.textContent='Bạn có thể sao chép liên kết trên thanh địa chỉ.';}
};
function restoreHash(){if(location.hash.startsWith('#bai=')){let id;try{id=decodeURIComponent(location.hash.slice(5));}catch{return;}openArticle(id,null,false);}}
addEventListener('hashchange',restoreHash);restoreHash();
document.querySelectorAll('a[href^="#"]').forEach(link=>link.addEventListener('click',e=>{const hash=link.getAttribute('href'),target=document.getElementById(hash.slice(1));if(!target)return;e.preventDefault();target.classList.add('is-visible');target.querySelectorAll('.n-reveal').forEach(el=>el.classList.add('is-visible'));target.scrollIntoView({behavior:reduced.matches?'instant':'smooth'});history.replaceState(null,'',location.pathname+location.search+hash);}));
const scene=document.querySelector('.n-paper-scene');let frame=0;
function sync(){frame=0;const max=document.documentElement.scrollHeight-innerHeight;document.querySelector('.n-progress').style.transform='scaleX('+(max>0?Math.min(scrollY/max,1):0)+')';scene.style.setProperty('--shift',reduced.matches?'0px':Math.min(scrollY*.04,22)+'px');}
function schedule(){if(!frame)frame=requestAnimationFrame(sync);}
addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule,{passive:true});sync();
if(matchMedia('(hover:hover) and (pointer:fine)').matches){
 scene.addEventListener('pointermove',e=>{if(reduced.matches)return;const r=scene.getBoundingClientRect();scene.style.setProperty('--rx',(-(e.clientY-r.top)/r.height+.5)*7+'deg');scene.style.setProperty('--ry',((e.clientX-r.left)/r.width-.5)*9+'deg');});
 scene.addEventListener('pointerleave',()=>{scene.style.setProperty('--rx','0deg');scene.style.setProperty('--ry','0deg');});
 document.querySelectorAll('.n-path').forEach(card=>{card.addEventListener('pointermove',e=>{if(reduced.matches)return;const r=card.getBoundingClientRect();card.style.setProperty('--cx',(-(e.clientY-r.top)/r.height+.5)*5+'deg');card.style.setProperty('--cy',((e.clientX-r.left)/r.width-.5)*6+'deg');});card.addEventListener('pointerleave',()=>{card.style.setProperty('--cx','0deg');card.style.setProperty('--cy','0deg');});});
}
reduced.addEventListener('change',()=>{if(reduced.matches)document.body.classList.remove('n-motion');schedule();});
document.addEventListener('visibilitychange',()=>document.querySelectorAll('.n-paper-stamp,.n-quote-ring').forEach(el=>el.style.animationPlayState=document.hidden?'paused':'running'));
app.addEventListener('error',e=>{const img=e.target;if(img.tagName!=='IMG')return;const parent=img.closest('.n-photo');if(parent){const temp=document.createElement('div');temp.innerHTML=newsImage(null,img.alt);parent.replaceWith(temp.firstElementChild);}},true);
