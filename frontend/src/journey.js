const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const menu=document.querySelector('.menu'),nav=document.querySelector('#v-nav');
const closeMenu=()=>{menu.setAttribute('aria-expanded','false');nav.classList.remove('is-open');};
menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));nav.classList.toggle('is-open',open);});
nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu();});
if(!reduced.matches && 'IntersectionObserver' in window){
 document.body.classList.add('motion-ready');
 const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-visible');observer.unobserve(e.target);}}),{threshold:.08});
 document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));
}
const scene=document.querySelector('.scene'),progress=document.querySelector('.reading-line');
let frame=0;
function sync(){frame=0;const max=document.documentElement.scrollHeight-innerHeight;progress.style.transform='scaleX('+(max>0?Math.min(scrollY/max,1):0)+')';scene.style.setProperty('--travel',reduced.matches?'0px':Math.min(scrollY*.045,28)+'px');}
function schedule(){if(!frame)frame=requestAnimationFrame(sync);}
addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule,{passive:true});sync();
if(matchMedia('(hover: hover) and (pointer: fine)').matches){
 scene.addEventListener('pointermove',e=>{if(reduced.matches)return;const r=scene.getBoundingClientRect();scene.style.setProperty('--rx',(-(e.clientY-r.top)/r.height+.5)*8+'deg');scene.style.setProperty('--ry',((e.clientX-r.left)/r.width-.5)*12+'deg');});
 scene.addEventListener('pointerleave',()=>{scene.style.setProperty('--rx','0deg');scene.style.setProperty('--ry','0deg');});
 document.querySelectorAll('.stage').forEach(card=>{
  card.addEventListener('pointermove',e=>{if(reduced.matches)return;const r=card.getBoundingClientRect();card.style.setProperty('--card-rx',(-(e.clientY-r.top)/r.height+.5)*5+'deg');card.style.setProperty('--card-ry',((e.clientX-r.left)/r.width-.5)*6+'deg');});
  card.addEventListener('pointerleave',()=>{card.style.setProperty('--card-rx','0deg');card.style.setProperty('--card-ry','0deg');});
 });
}
reduced.addEventListener('change',()=>{if(reduced.matches){document.body.classList.remove('motion-ready');scene.style.setProperty('--rx','0deg');scene.style.setProperty('--ry','0deg');}schedule();});
const button=document.querySelector('.pause-start'),status=document.querySelector('.pause-status'),section=document.querySelector('.pause-section');
let timer=0,deadline=0;
function stop(completed=false){clearInterval(timer);timer=0;section.classList.remove('pause-running');button.textContent='Bắt đầu một phút thinh lặng';status.textContent=completed?'Một phút đã trọn. Hãy mang sự bình an vào bước chân tiếp theo.':'Bạn có thể bắt đầu lại khi sẵn sàng.';}
button.addEventListener('click',()=>{if(timer){stop();return;}deadline=Date.now()+60000;section.classList.add('pause-running');button.textContent='Kết thúc khoảng thinh lặng';status.textContent='Một phút đã bắt đầu. Hãy hít thở tự nhiên và lắng nghe.';timer=setInterval(()=>{if(Date.now()>=deadline)stop(true);},500);});
addEventListener('pagehide',()=>{clearInterval(timer);timer=0;});

document.querySelectorAll('a[href^="#"]').forEach(link=>link.addEventListener('click',event=>{
 const hash=link.getAttribute('href'),target=document.getElementById(hash.slice(1));
 if(!target)return;
 event.preventDefault();target.classList.add('is-visible');target.querySelectorAll('.reveal').forEach(el=>el.classList.add('is-visible'));
 target.scrollIntoView({behavior:reduced.matches?'instant':'smooth',block:'start'});
 history.replaceState(null,'',location.pathname+hash);
}));