let cleanup=[];
export function disposeMotion(){cleanup.forEach(fn=>fn());cleanup=[];}
export function enhanceMotion(){
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const fine=matchMedia('(hover: hover) and (pointer: fine)').matches;
 const header=document.querySelector('.header'),hero=document.querySelector('.hero'),media=document.querySelector('.hero-media');
 const progress=document.createElement('div');progress.className='reading-progress';progress.setAttribute('aria-hidden','true');document.body.append(progress);cleanup.push(()=>progress.remove());
 let scrollFrame=0;
 function syncScroll(){scrollFrame=0;const y=window.scrollY,max=document.documentElement.scrollHeight-innerHeight;progress.style.transform=`scaleX(${max>0?Math.min(y/max,1):0})`;header.classList.toggle('is-scrolled',y>90);
 const links=[...header.querySelectorAll('nav a[href^="#"]')];
 const active=[...links].reverse().find(a=>{const section=document.querySelector(a.getAttribute('href'));return section && section.getBoundingClientRect().top<=150;});
 if(active)links.forEach(a=>a.classList.toggle('active',a===active));if(!reduced){media.style.setProperty('--parallax',`${Math.min(y*.14,90)}px`);hero.style.setProperty('--hero-fade',`${Math.min(y/1200,.35)}`);}}
 function onScroll(){if(!scrollFrame)scrollFrame=requestAnimationFrame(syncScroll);}
 window.addEventListener('scroll',onScroll,{passive:true});syncScroll();cleanup.push(()=>{window.removeEventListener('scroll',onScroll);cancelAnimationFrame(scrollFrame);});
 const cards=document.querySelectorAll('.news-card,.value,.event-card,.gallery-item,.group-card');
 cards.forEach((el,i)=>{el.classList.add('motion-card');el.style.setProperty('--reveal-delay',`${Math.min(i%5*85,340)}ms`);});
 const observer=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('motion-visible');observer.unobserve(e.target);}});},{threshold:.1});cards.forEach(el=>observer.observe(el));cleanup.push(()=>observer.disconnect());
 if(reduced)return;
 if(fine){
  cards.forEach(el=>{
   const move=e=>{const r=el.getBoundingClientRect();el.style.setProperty('--pointer-x',`${e.clientX-r.left}px`);el.style.setProperty('--pointer-y',`${e.clientY-r.top}px`);};el.addEventListener('pointermove',move);cleanup.push(()=>el.removeEventListener('pointermove',move));
  });
  document.querySelectorAll('.button,.search-button').forEach(el=>{
   const move=e=>{const r=el.getBoundingClientRect();el.style.setProperty('--magnet-x',`${(e.clientX-r.left-r.width/2)*.075}px`);el.style.setProperty('--magnet-y',`${(e.clientY-r.top-r.height/2)*.075}px`);};
   const leave=()=>{el.style.setProperty('--magnet-x','0px');el.style.setProperty('--magnet-y','0px');};
   el.addEventListener('pointermove',move);el.addEventListener('pointerleave',leave);cleanup.push(()=>{el.removeEventListener('pointermove',move);el.removeEventListener('pointerleave',leave);});
  });
  const glow=e=>{const r=hero.getBoundingClientRect();hero.style.setProperty('--glow-x',`${(e.clientX-r.left)/r.width*100}%`);hero.style.setProperty('--glow-y',`${(e.clientY-r.top)/r.height*100}%`);};hero.addEventListener('pointermove',glow);cleanup.push(()=>hero.removeEventListener('pointermove',glow));
 }
 const canvas=document.querySelector('.hero-particles'),ctx=canvas?.getContext('2d');
 if(!ctx)return;
 let width=0,height=0,frame=0,active=true,last=0;
 const particles=Array.from({length:innerWidth<650?18:35},()=>({x:Math.random(),y:Math.random(),size:.6+Math.random()*1.5,speed:4+Math.random()*7,phase:Math.random()*6.28}));
 function resize(){const r=hero.getBoundingClientRect();width=r.width;height=r.height;const dpr=Math.min(devicePixelRatio||1,1.5);canvas.width=width*dpr;canvas.height=height*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);}
 function draw(time){frame=0;if(!active || document.hidden){last=0;return;}const delta=last?Math.min((time-last)/1000,.05):0;last=time;ctx.clearRect(0,0,width,height);for(const p of particles){p.y-=delta*p.speed/height;if(p.y<-.02){p.y=1.02;p.x=Math.random();}const alpha=.12+.24*(.5+.5*Math.sin(time*.0005+p.phase));ctx.beginPath();ctx.fillStyle=`rgba(242,199,131,${alpha})`;ctx.arc(p.x*width+Math.sin(time*.00012+p.phase)*12,p.y*height,p.size,0,Math.PI*2);ctx.fill();}frame=requestAnimationFrame(draw);}
 function resume(){if(active&&!document.hidden&&!frame)frame=requestAnimationFrame(draw);}
 const visibility=new IntersectionObserver(entries=>{active=entries[0].isIntersecting;if(active)resume();else{cancelAnimationFrame(frame);frame=0;last=0;}},{threshold:0});visibility.observe(hero);
 document.addEventListener('visibilitychange',resume);window.addEventListener('resize',resize,{passive:true});resize();resume();
 cleanup.push(()=>{visibility.disconnect();cancelAnimationFrame(frame);document.removeEventListener('visibilitychange',resume);window.removeEventListener('resize',resize);});
}
