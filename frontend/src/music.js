let dispose=()=>{};
// Thử phát ngay; nếu trình duyệt chặn, thử lại trong thao tác thật của người xem.
export function autoMusic(audio,page,onError=()=>{}) {
 let wanted=true,active=true;
 const gestures=['click','touchend','keydown'];
 const remove=()=>gestures.forEach(type=>page.removeEventListener(type,onGesture,true));
 const attempt=()=>{
  if(!active || !wanted)return;
  try {
   Promise.resolve(audio.play()).then(()=>{if(!active || !wanted)audio.pause();else remove();}).catch(error=>{
    if(!active || !wanted)return;
    if(error.name!=='NotAllowedError'){remove();onError(error);}
   });
  }catch(error){remove();onError(error);}
 };
 const onGesture=event=>{
  if(!event.isTrusted || event.defaultPrevented || event.target?.closest?.('.music-switch') || event.target?.tagName==='VIDEO')return;
  attempt();
 };
 const pause=()=>{wanted=false;remove();audio.pause();};
 const onVideo=event=>{if(event.target.tagName==='VIDEO')pause();};
 gestures.forEach(type=>page.addEventListener(type,onGesture,true));
 page.addEventListener('play',onVideo,true);
 attempt();
 return {
  toggle(){if(!audio.paused){pause();}else{wanted=true;attempt();}},
  dispose(){active=false;pause();page.removeEventListener('play',onVideo,true);}
 };
}
export function initMusic(m){
 dispose();
 if(!m || typeof m.src!=='string' || !/^\/media\/[a-zA-Z0-9][a-zA-Z0-9_.-]*\.(mp3|m4a|ogg|wav)$/i.test(m.src))return;
 const audio=document.createElement('audio');audio.loop=true;audio.preload='auto';audio.volume=m.volume;audio.src=m.src;
 const button=document.createElement('button');button.type='button';button.className='music-switch';
 const update=()=>{
  const label=(audio.paused?m.labels.play:m.labels.pause)+' · '+m.title;
  button.setAttribute('aria-label',label);button.setAttribute('aria-pressed',String(!audio.paused));button.title=label;
  button.textContent=audio.paused?'♪':'♫';button.classList.toggle('is-playing',!audio.paused);
 };
 const error=()=>{button.title=m.labels.error;button.setAttribute('aria-label',m.labels.error);};
 audio.addEventListener('play',update);audio.addEventListener('pause',update);audio.addEventListener('error',error);
 document.body.append(audio,button);update();
 const controller=autoMusic(audio,document,error);button.onclick=()=>controller.toggle();
 dispose=()=>{controller.dispose();audio.removeAttribute('src');audio.load();audio.remove();button.remove();};
}
