import {renderAbout} from './about-view.js';
import {initMusic} from './music.js';
const app=document.querySelector('#about-app');
function motion(){
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const progress=document.querySelector('.about-progress'),header=document.querySelector('.about-header');
 let scheduled=false;
 const sync=()=>{scheduled=false;const max=document.documentElement.scrollHeight-innerHeight;progress.style.transform=`scaleX(${max>0?Math.min(scrollY/max,1):0})`;header.classList.toggle('is-scrolled',scrollY>25);updateNavigation();if(!reduced)document.querySelector('.about-stage').style.setProperty('--parallax',`${Math.min(scrollY*.08,65)}px`);};
 window.addEventListener('scroll',()=>{if(!scheduled){scheduled=true;requestAnimationFrame(sync);}},{passive:true});sync();
 const elements=document.querySelectorAll('.about-reveal');
 if(!reduced && 'IntersectionObserver' in window){document.body.classList.add('about-motion');const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');observer.unobserve(e.target);}}),{threshold:.12});elements.forEach(el=>observer.observe(el));}
 if(!reduced && matchMedia('(hover:hover) and (pointer:fine)').matches)document.querySelectorAll('.about-tilt').forEach(el=>{
  let frame=0;
  el.addEventListener('pointermove',event=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>{const r=el.getBoundingClientRect(),x=(event.clientX-r.left)/r.width-.5,y=(event.clientY-r.top)/r.height-.5;el.style.setProperty('--rx',`${-y*5}deg`);el.style.setProperty('--ry',`${x*7}deg`);el.style.setProperty('--light-x',`${(x+.5)*100}%`);el.style.setProperty('--light-y',`${(y+.5)*100}%`);});});
  el.addEventListener('pointerleave',()=>{cancelAnimationFrame(frame);el.style.setProperty('--rx','0deg');el.style.setProperty('--ry','0deg');});
 });
}
function updateNavigation(){
 const header=document.querySelector('.about-header');if(!header)return;
 const offset=header.getBoundingClientRect().height+20;
 document.body.style.setProperty('--about-nav-offset',`${offset}px`);
 let active='#noi-dung';
 for(const id of ['dao-luyen','huynh-de','khoanh-khac']){const section=document.getElementById(id);if(section && section.getBoundingClientRect().top<=offset+30)active='#'+id;}
 document.querySelectorAll('.about-nav a').forEach(link=>{if(link.getAttribute('href')===active)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});
}
function initAnchorNavigation(){
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const move=(hash,behavior)=>{
  const target=document.getElementById(hash.slice(1));if(!target)return;
  target.querySelectorAll('.about-reveal').forEach(el=>el.classList.add('is-visible'));
  if(target.classList.contains('about-reveal'))target.classList.add('is-visible');
  const header=document.querySelector('.about-header'),offset=header.getBoundingClientRect().height+20;
  const top=hash==='#noi-dung'?0:Math.max(0,target.getBoundingClientRect().top+scrollY-offset);
  window.scrollTo({top,behavior});
 };
 document.querySelectorAll('a[href^="#"]').forEach(link=>link.addEventListener('click',event=>{
  const hash=link.getAttribute('href');if(!document.getElementById(hash.slice(1)))return;
  event.preventDefault();document.querySelector('.about-nav').classList.remove('is-open');document.querySelector('.about-menu').setAttribute('aria-expanded','false');
  if(location.hash!==hash)history.pushState(null,'',hash);move(hash,reduced?'instant':'smooth');
 }));
 window.addEventListener('resize',updateNavigation,{passive:true});
 window.addEventListener('popstate',()=>move(location.hash||'#noi-dung','instant'));
 const align=()=>{if(location.hash)move(location.hash,'instant');};
 if(document.readyState==='complete')align();else window.addEventListener('load',align,{once:true});
}
async function load(){try{
 let c,h;const embedded=document.querySelector('#about-data');
 if(embedded){({c,h}=JSON.parse(embedded.textContent));embedded.remove();}
 else{const responses=await Promise.all([fetch('/api/about'),fetch('/api/homepage')]);if(responses.some(r=>!r.ok))throw new Error('API chưa sẵn sàng');[c,h]=await Promise.all(responses.map(r=>r.json()));app.innerHTML=renderAbout(c,h);}
 document.title=`${c.pageTitle} | ${h.brand.eyebrow} ${h.brand.name}`;
 const menu=document.querySelector('.about-menu'),nav=document.querySelector('.about-nav');
 menu.onclick=()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));nav.classList.toggle('is-open',open);};
 nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{menu.setAttribute('aria-expanded','false');nav.classList.remove('is-open');}));
 document.addEventListener('keydown',event=>{if(event.key==='Escape'){menu.setAttribute('aria-expanded','false');nav.classList.remove('is-open');}});
 document.querySelectorAll('.about-photo img').forEach(img=>img.addEventListener('error',()=>{const box=img.parentElement;img.remove();const placeholder=document.createElement('div');placeholder.className='about-placeholder';placeholder.textContent=c.labels.imageEmpty;box.append(placeholder);},{once:true}));
 motion();initAnchorNavigation();initMusic(h.music);
}catch(error){console.error(error);app.innerHTML='<div class="about-boot"><p>Chưa tải được trang giới thiệu. Vui lòng thử lại.</p><button type="button" class="about-button">Thử lại</button></div>';app.querySelector('button').onclick=load;}}
load();
