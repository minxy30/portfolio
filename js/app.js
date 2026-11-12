(() => {
'use strict';
const $=id=>document.getElementById(id);
const DATA=window.PORTFOLIO_DATA||{};
const CFG=window.YAZMIN_SITE_CONFIG||{};
const CATS=[
 {id:'video',label:'Video',title:'Edición de video',intro:'',desc:'',icon:'▷',filters:[['all','Todo'],['youtube','YouTube'],['marcas','Marcas'],['motion','Motion Graphic'],['ia','Producción con IA']],items:[['benito-mexico','youtube'],['benito-ia','youtube'],['benito-bolivia','youtube'],['benito-viral','youtube'],['benito-ormuz','youtube'],['zaru','ia'],['smarketing','ia'],['casita','marcas'],['minsis','motion']]},
 {id:'diseno',label:'Diseño',title:'Diseño visual',intro:'',desc:'Composición, narrativas gráficas y publicaciones para marcas.',icon:'✎',filters:[['all','Todo'],['editorial','Editorial'],['carrusel','Carruseles'],['marcas','Marcas']],items:[['potencial','carrusel'],['omar','carrusel'],['editorial','editorial'],['wbmf','editorial'],['sabias','marcas']]},
 {id:'fotografia',label:'Fotografía',title:'Fotografía',intro:'',desc:'Fotografía conceptual y retratos.',icon:'◎',filters:[['all','Todo'],['conceptual','Conceptual'],['retrato','Retratos']],items:[['foto-halloween','retrato'],['foto-terror','conceptual']]},
 {id:'copywriter',label:'Copywriter',title:'Copywriter',intro:'',desc:'Copies, mensajes editoriales y parrillas de contenido.',icon:'≡',filters:[['all','Todo'],['redes','Redes sociales'],['editorial','Editorial']],items:[['copy-sm','redes'],['copy-wbmf','editorial']]},
 {id:'about',label:'Sobre mí',title:'Sobre mí',intro:'Detrás de cada idea',desc:'Mi perfil, herramientas y enfoque creativo.',icon:'✳',filters:[],items:[]}
];
const catById=Object.fromEntries(CATS.map(c=>[c.id,c]));
let activeCategory=null,activeFilter='all',activeItems=[],activeProject=null,stage=0,locked=false,visitorSound=true,wasPlaying=false,audioCtx=null,toastTimer=0,scrollLock=0,returnFocus=null;
// Avoid editing copyright and portfolio year by hand every January.
document.querySelectorAll('[data-current-year]').forEach(node=>node.textContent=String(new Date().getFullYear()));
const originalBrand=$('brand-home').innerHTML;const aboutDialog=$('about-viewer');let aboutReturnFocus=null;
const sound=$('sound-toggle'),music=$('ambient-audio'),viewer=$('project-viewer'),work=$('work-space'),workMain=$('work-main');
let reduce=matchMedia('(prefers-reduced-motion: reduce)');
function toast(msg){let e=$('status-toast');e.textContent=msg;e.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>e.classList.remove('show'),3200)}
function localPref(name){try{return localStorage.getItem(name)}catch{return null}}
function setPref(name,val){try{localStorage.setItem(name,val)}catch{}}
function setTheme(val){document.body.dataset.theme=val;setPref('ym-theme',val);$('theme-toggle').setAttribute('aria-label',val==='dark'?'Cambiar a modo claro':'Cambiar a modo oscuro');document.querySelector('meta[name="theme-color"]').setAttribute('content',val==='dark'?'#080e14':'#f1f1ec')}
setTheme('dark'); // Cada visita empieza en oscuro; el visitante puede cambiarlo durante la sesión.
$('theme-toggle').addEventListener('click',()=>{setTheme(document.body.dataset.theme==='dark'?'light':'dark');soundEffect('toggle')});
function context(){if(!audioCtx){const C=window.AudioContext||window.webkitAudioContext;if(!C)return null;audioCtx=new C()}if(audioCtx.state==='suspended')audioCtx.resume().catch(()=>{});return audioCtx}
// Navigation SFX are independent of background music and never muted by the music button.
let lastHoverAt=0;
function soundEffect(type='click'){
 if(CFG.enableClickSounds===false)return;
 const ac=context();if(!ac)return;
 const now=ac.currentTime;
 const hover=type==='hover',reveal=type==='reveal';
 const duration=reveal?.43:hover?.057:.11;
 const buffer=ac.createBuffer(1,Math.max(1,Math.round(ac.sampleRate*duration)),ac.sampleRate);
 const ch=buffer.getChannelData(0);
 for(let i=0;i<ch.length;i++)ch[i]=(Math.random()*2-1);
 const noise=ac.createBufferSource();noise.buffer=buffer;
 const filter=ac.createBiquadFilter();filter.type=reveal?'bandpass':'lowpass';
 filter.frequency.setValueAtTime(reveal?350:hover?1750:1050,now);filter.Q.value=reveal?.4:.7;
 if(reveal)filter.frequency.exponentialRampToValueAtTime(1500,now+duration*.7);
 const gain=ac.createGain();gain.gain.setValueAtTime(.0001,now);
 gain.gain.linearRampToValueAtTime(reveal?.11:hover?.062:.085,now+(reveal?.12:hover?.005:.006));
 gain.gain.exponentialRampToValueAtTime(.0001,now+duration);
 noise.connect(filter);filter.connect(gain);gain.connect(ac.destination);noise.start(now);noise.stop(now+duration);
 if(!reveal){const tap=ac.createOscillator(),env=ac.createGain();tap.type='triangle';
  tap.frequency.setValueAtTime(hover?240:185,now);
  tap.frequency.exponentialRampToValueAtTime(hover?150:105,now+(hover?.042:.068));
  env.gain.setValueAtTime(hover?.025:.034,now);
  env.gain.exponentialRampToValueAtTime(.0001,now+(hover?.05:.078));
  tap.connect(env);env.connect(ac.destination);tap.start(now);tap.stop(now+(hover?.053:.08))}
}
// Desktop hover has one soft plastic tap, rate-limited to avoid a cascade of clicks.
document.addEventListener('pointerover',e=>{
 if(document.body.classList.contains('pre-entry'))return;
 if(e.pointerType!=='mouse'&&e.pointerType!=='pen')return;
 const target=e.target.closest?.('button,a[href],[role="button"]');
 if(!target||target.disabled||target.contains(e.relatedTarget))return;
 const now=performance.now();if(now-lastHoverAt<125)return;
 lastHoverAt=now;soundEffect('hover');
},{passive:true});

const volumeInput=$('ambient-volume'),volumeValue=$('volume-value'),volumeTrigger=$('sound-toggle'),volumePanel=$('volume-panel');
// The soundtrack ALWAYS starts at 10% on each new page visit.
let musicLevel=.10,entryMix=0;
const crossfadeSeconds=5;
const musicA=music,musicB=new Audio();
const musicUrl=CFG.ambientAudioSrc||'';
let activeTrack=musicA,standbyTrack=musicB,transition=null,crossfadeFrame=0;
let audioNeedsGesture=false,unlockRunning=false,pausedForProjectVideo=false,crossfadePending=false;
[musicA,musicB].forEach(track=>{track.src=musicUrl;track.loop=false;track.preload='auto';track.volume=0});
volumeInput.value=String(Math.round(musicLevel*100));
volumeValue.textContent=String(Math.round(musicLevel*100))+'%';

function musicIsPlaying(){return !activeTrack.paused||Boolean(transition&&!transition.to.paused)}
function currentFadeProgress(){
 if(!transition)return 0;
 const {from,duration,start}=transition;
 return Math.max(0,Math.min(1,(from.currentTime-start)/duration));
}
function updateMusicVolumes(){
 if(!transition){activeTrack.volume=musicLevel*entryMix;standbyTrack.volume=0;return}
 const progress=currentFadeProgress();
 transition.from.volume=musicLevel*entryMix*Math.cos(progress*Math.PI/2);
 transition.to.volume=musicLevel*entryMix*Math.sin(progress*Math.PI/2);
}
function finishCrossfade(){
 if(!transition)return;
 const {from,to}=transition;
 transition=null;
 cancelAnimationFrame(crossfadeFrame);
 from.pause();from.currentTime=0;from.volume=0;
 activeTrack=to;standbyTrack=from;
 updateMusicVolumes();
}
function animateCrossfade(){
 if(!transition)return;
 if(pausedForProjectVideo||transition.from.paused){cancelAnimationFrame(crossfadeFrame);return}
 updateMusicVolumes();
 if(currentFadeProgress()>=1){finishCrossfade();return}
 crossfadeFrame=requestAnimationFrame(animateCrossfade);
}
function beginCrossfade(){
 if(transition||crossfadePending||pausedForProjectVideo||activeTrack.paused)return;
 const remaining=activeTrack.duration-activeTrack.currentTime;
 if(!Number.isFinite(remaining)||remaining<=0||remaining>crossfadeSeconds)return;
 const from=activeTrack,to=standbyTrack;
 crossfadePending=true;
 try{to.currentTime=0}catch(e){crossfadePending=false;return}
 to.volume=0;
 let p;
 try{p=to.play()}catch(e){crossfadePending=false;from.loop=true;return}
 if(!p||!p.then){crossfadePending=false;return}
 p.then(()=>{
  crossfadePending=false;
  from.loop=false;
  // Playback could have been interrupted while the second stream was starting.
  if(pausedForProjectVideo||activeTrack!==from||from.paused){to.pause();return}
  const actualRemaining=Math.max(.15,from.duration-from.currentTime);
  transition={from,to,start:from.currentTime,duration:actualRemaining};
  updateMusicVolumes();
  cancelAnimationFrame(crossfadeFrame);
  crossfadeFrame=requestAnimationFrame(animateCrossfade);
 }).catch(()=>{
  crossfadePending=false;
  // Fallback if a browser rejects the second player's playback.
  // The original track still restarts when it reaches its end.
  if(!from.paused)from.loop=true;
 });
}
for(const track of [musicA,musicB]){
 track.addEventListener('timeupdate',()=>{
  if(transition&&transition.from===track){
   updateMusicVolumes();
   if(currentFadeProgress()>=1)finishCrossfade();
  }else if(!transition&&track===activeTrack)beginCrossfade();
 });
 track.addEventListener('ended',()=>{
  if(transition&&transition.from===track){finishCrossfade();return}
  if(track!==activeTrack||pausedForProjectVideo)return;
  // Emergency gap-safe fallback when the second stream was unavailable.
  track.currentTime=0;
  track.play().catch(()=>{audioNeedsGesture=true;syncMusicButton()});
 });
 track.addEventListener('error',()=>{
  if(track!==activeTrack)return;
  audioNeedsGesture=true;syncMusicButton();
  toast('No se pudo cargar la pista ambiental. Comprueba tu conexión.');
 });
 track.addEventListener('playing',()=>{if(track===activeTrack){audioNeedsGesture=false;syncMusicButton()}});
}
function pauseMusicForVideo(){
 pausedForProjectVideo=true;
 cancelAnimationFrame(crossfadeFrame);
 musicA.pause();musicB.pause();
}
function syncMusicButton(){
 sound.classList.toggle('sound-needs-gesture',audioNeedsGesture);
 sound.dataset.muted=String(musicLevel===0);
 sound.title=audioNeedsGesture?'Ajustar volumen · tocar para iniciar la música':'Ajustar volumen de música';
 sound.setAttribute('aria-label',sound.title);
}
function requestMusic(){
 if(pausedForProjectVideo||(viewer.open&&activeProject&&DATA[activeProject]?.type==='video'))return Promise.resolve();
 const targets=transition?[transition.from,transition.to]:[activeTrack];
 const promises=targets.filter(track=>track.paused).map(track=>track.play());
 if(!promises.length)return Promise.resolve();
 return Promise.all(promises).then(()=>{
  audioNeedsGesture=false;syncMusicButton();
  updateMusicVolumes();
  if(transition){cancelAnimationFrame(crossfadeFrame);crossfadeFrame=requestAnimationFrame(animateCrossfade)}
 }).catch(err=>{
  audioNeedsGesture=true;syncMusicButton();
  if(err?.name!=='NotAllowedError'&&err?.name!=='AbortError')
   console.warn('No se pudo iniciar la música ambiental.',err);
 });
}
// The speaker has no pause button: it only opens the volume slider.
volumeTrigger.addEventListener('click',()=>{
 const show=volumePanel.hidden;
 volumePanel.hidden=!show;
 volumeTrigger.setAttribute('aria-expanded',String(show));
 if(show)volumeInput.focus();
 requestMusic();soundEffect('toggle');
});
volumeInput.addEventListener('input',()=>{
 musicLevel=Math.max(0,Math.min(1,Number(volumeInput.value)/100));
 updateMusicVolumes();
 volumeValue.textContent=String(volumeInput.value)+'%';
 syncMusicButton();
});
document.addEventListener('pointerdown',e=>{
 if(document.body.classList.contains('pre-entry'))return;
 if(!volumePanel.hidden&&!e.target.closest?.('.audio-group')){
  volumePanel.hidden=true;volumeTrigger.setAttribute('aria-expanded','false');
 }
 if(!pausedForProjectVideo&&!musicIsPlaying()&&!unlockRunning){
  unlockRunning=true;requestMusic().finally(()=>unlockRunning=false);
 }
},{capture:true,passive:true});
document.addEventListener('keydown',e=>{
 if(document.body.classList.contains('pre-entry'))return;
 if(e.key==='Escape'&&!volumePanel.hidden){
  volumePanel.hidden=true;volumeTrigger.setAttribute('aria-expanded','false');
 }
 if((e.key==='Enter'||e.key===' ')&&!musicIsPlaying())requestMusic();
});
syncMusicButton();
// The visitor activates audio with the Enter button, avoiding blocked autoplay.


// Always-visible re-entry collage, built entirely from real portfolio materials.
// The gentle, randomized card changes are capped at <3 Hz and respect reduced motion.
// Cinematic entrance: a compact, constantly moving wall of the author's real work.
// Five independent sideways-moving strips cover the full frame. Only a few local
// elements flash or change at a time; the CTA stays sharp and visually dominant.
const collageRoot=$('entry-collage');
// The lobby is populated from the SAME curated project list as the portfolio.
// Removing a project from CATS or DATA removes its assets from the next lobby load.
// This does not expose the user's private Google Drive or require public Drive permissions.
const curatedVideoPosters={
 zaru:'assets/images/poster-thehomes.webp',
 smarketing:'assets/images/poster-smarketing.webp',
 casita:'assets/images/poster-casita.webp',
 minsis:'assets/images/poster-minsis.webp'
};
const benitoLobbyClips=[
 ['México','19Wy0dyV2yVSzhMTD3svLVIC7k2m7vuFJ'],
 ['IA','17_oiQzEXxhAE45vufIw5IrTeEf7v1C8S'],
 ['Bolivia','1cYIEP-AVYMvv_WaLlsQU_cqCL9F4dyUd'],
 ['Viral','1kJ-0gWMhBy9HAXxQs6m898a9g49sAF7T'],
 ['Ormuz','1kzco9PTns8T0lVifjnIPT0wDOrZq1-oD']
];
const benitoLobbyPosters=benitoLobbyClips.map(([name,id])=>[
 'https://drive.google.com/thumbnail?id='+encodeURIComponent(id)+'&sz=w640',
 'BENITO CAMELLO · '+name.toUpperCase()
]);
function buildCollageAssets(){
 const pool=[],seen=new Set();
 const publishedIds=CATS.flatMap(group=>group.items.map(([id])=>id));
 for(const id of publishedIds){
  const project=DATA[id];
  if(!project||project.hidden||project.archived||project.visible===false)continue;
  if(project.type==='video')continue; // Video work appears exclusively as moving, playable clips.
  const label=String(project.title||project.kind||'PROYECTO').toUpperCase().slice(0,40);
  const pics=Array.isArray(project.images)?project.images:
   project.type==='video'?[curatedVideoPosters[id]||
    (project.platform==='youtube'&&/^[\w-]{11}$/.test(project.id||'')?
      'https://i.ytimg.com/vi/'+project.id+'/hqdefault.jpg':null)]:[];
  for(const src of pics){
   if(typeof src!=='string'||!src||seen.has(src))continue;
   if(!/^(assets\/images\/|https:\/\/i\.ytimg\.com\/vi\/)/.test(src))continue;
   pool.push([src,label]);seen.add(src);
  }
 }
 return pool.length?pool:[['assets/images/yazmin-retrato.jpg','YAZMIN MORENO']];
}
let collageAssets=buildCollageAssets();
// Short muted previews were derived from the user's original Drive videos.
// Native MP4 previews autoplay much more reliably than Drive/YouTube iframes.
const collageVideoMap={
 'assets/images/poster-thehomes.webp':'assets/video/lobby-thehomes.mp4',
 'assets/images/poster-smarketing.webp':'assets/video/lobby-smarketing.mp4',
 'assets/images/poster-casita.webp':'assets/video/lobby-casita.mp4',
 'assets/images/poster-minsis.webp':'assets/video/lobby-minsis.mp4'
};
for(const [name,id] of benitoLobbyClips){
 collageVideoMap['https://drive.google.com/thumbnail?id='+encodeURIComponent(id)+'&sz=w640']=
 'assets/video/lobby-'+({México:'mexico',IA:'ia',Bolivia:'bolivia',Viral:'viral',Ormuz:'ormuz'}[name])+'.mp4';
}
const lobbyVideoSlots=[
 'assets/images/poster-thehomes.webp',benitoLobbyPosters[0][0],benitoLobbyPosters[1][0],
 'assets/images/poster-smarketing.webp',benitoLobbyPosters[2][0],benitoLobbyPosters[3][0],
 'assets/images/poster-casita.webp',benitoLobbyPosters[4][0],
 'assets/images/poster-minsis.webp'
];
const collageVideos=[];
let collageVideoObserver=null;
let collageViewportKey='',collageResizeTimer=0;
let collageTimer=0;
let collageVisibilityBound=false;
let collageTick=0;
const collageCards=[];
const collageReduced=matchMedia('(prefers-reduced-motion: reduce)');
const collageMobile=matchMedia('(max-width: 740px)');
function makeCollageCard(row,col,copy){
 const videoSlot=(row<3&&col<5&&col%2===0)?row*3+col/2:-1;
 const slotPoster=videoSlot>=0?lobbyVideoSlots[videoSlot]:null;
 const index=(row*9+col*5+(col%3)*2)%collageAssets.length;
 const [src,label]=slotPoster?
  [slotPoster,benitoLobbyPosters.find(([p])=>p===slotPoster)?.[1]||
   ({'assets/images/poster-thehomes.webp':'THE HOMES','assets/images/poster-smarketing.webp':'SMARKETING 360',
   'assets/images/poster-casita.webp':'CASITA DE SOL','assets/images/poster-minsis.webp':'MINSIS KIDS'}[slotPoster]||'VIDEO')]:
  collageAssets[index];
 const figure=document.createElement('figure');
 figure.className='entry-collage-tile';
 figure.dataset.row=String(row);
 const ratio=[.64,.78,1,1.23,1.47,1.72][(row*3+col*5)%6];
 const width=148+((col*31+row*47)%95);
 figure.style.setProperty('--card-w',width+'px');
 figure.style.setProperty('--card-ratio',String(ratio));
 figure.style.setProperty('--tilt',(((col*7+row*9)%13)-6)+'deg');
 figure.style.setProperty('--jitter-x','0px');
 figure.style.setProperty('--jitter-y','0px');
 figure.style.setProperty('--jitter-scale','1');
 const image=document.createElement('img');
 if(!slotPoster){
  image.src=src;image.alt='';
  image.onerror=()=>{image.onerror=null;image.src='assets/images/yazmin-retrato.jpg'};
  image.loading=(copy===0&&col<4)?'eager':'lazy';image.decoding='async';
  figure.appendChild(image);
 }
 if(slotPoster&&collageVideoMap[slotPoster]){
  figure.classList.add('entry-collage-tile--video');
  const video=document.createElement('video');
  video.className='entry-collage-video';
  video.dataset.src=collageVideoMap[slotPoster];
  video.muted=true;video.defaultMuted=true;video.setAttribute('muted','');
  video.autoplay=true;video.loop=true;video.playsInline=true;
  video.setAttribute('playsinline','');video.setAttribute('autoplay','');
  video.preload='none';video.controls=false;video.disablePictureInPicture=true;
  video.setAttribute('aria-hidden','true');video.tabIndex=-1;
  video.addEventListener('error',()=>{video.hidden=true;video.dataset.failed='true'});
  video.addEventListener('canplay',playAllLobbyPreviews);
  figure.appendChild(video);
  collageVideos.push(video);
 }
 const cap=document.createElement('figcaption');cap.textContent=label;
 figure.appendChild(cap);
 collageCards.push(figure);
 return figure;
}
function playAllLobbyPreviews(){
 if(!document.body.classList.contains('pre-entry')||document.hidden)return;
 for(const video of collageVideos){
  if(video.dataset.failed||!video.src||!video.dataset.inView)continue;
  video.muted=true;
  if(video.paused)video.play().catch(()=>{});
 }
}
function initCollage(){
 if(!collageRoot)return;
 collageAssets=buildCollageAssets();
 if(collageTimer)window.clearInterval(collageTimer);
 if(collageVideoObserver){collageVideoObserver.disconnect();collageVideoObserver=null;}
 for(const oldVideo of collageVideos){oldVideo.pause();oldVideo.removeAttribute('src');oldVideo.load()}
 collageCards.length=0;collageVideos.length=0;
 const portrait=innerHeight>innerWidth*1.12;
 const rowHeight=portrait?260:230;
 const rows=Math.max(portrait?4:3,Math.min(portrait?6:5,Math.round(innerHeight/rowHeight)));
 const cols=Math.max(portrait?5:7,Math.min(11,Math.ceil(innerWidth/(portrait?185:215))+1));
 collageViewportKey=rows+':'+cols+':'+(portrait?'portrait':'landscape');
 collageRoot.style.setProperty('--entry-rows',String(rows));
 const fragment=document.createDocumentFragment();
 for(let row=0;row<rows;row++){
  const lane=document.createElement('div');
  lane.className='entry-collage-lane entry-collage-lane--'+(row%5);
  lane.style.top=(row*100/rows)+'%';
  lane.style.height=(100/rows+.28)+'%';
  lane.style.setProperty('--speed',(17+(row%5)*5)+'s');
  const track=document.createElement('div');
  track.className='entry-collage-track';
  for(let copy=0;copy<2;copy++)
   for(let col=0;col<cols;col++)track.appendChild(makeCollageCard(row,col,copy));
  lane.appendChild(track);fragment.appendChild(lane);
 }
 collageRoot.replaceChildren(fragment);
 collageVideoObserver=new IntersectionObserver(entries=>{
  for(const entry of entries){
   const video=entry.target;
   if(entry.isIntersecting){
    video.dataset.inView='yes';
    if(!video.src){video.src=video.dataset.src;video.load();}
    if(document.body.classList.contains('pre-entry')&&!document.hidden)
     video.play().catch(()=>{});
   }else{delete video.dataset.inView;video.pause();}
  }
 },{root:null,rootMargin:'150px 0px',threshold:0});
 collageVideos.forEach(video=>collageVideoObserver.observe(video));
 playAllLobbyPreviews();
 // Keep the actual previews playing while the lobby is visible, regardless
 // of the horizontal still-image marquee's position. Only four decoders are used.
 if(!collageVisibilityBound){
  collageVisibilityBound=true;
  document.addEventListener('visibilitychange',()=>{
   collageRoot.classList.toggle('is-paused',document.hidden);
   if(document.hidden){
    for(const video of collageVideos)video.pause();
   }else playAllLobbyPreviews();
  });
  window.addEventListener('pageshow',playAllLobbyPreviews);
 }
 if(collageReduced.matches)return;
 // Fast but restrained editorial bursts: only one or two tiles per beat.
 collageTimer=window.setInterval(()=>{
  if(!document.body.classList.contains('pre-entry')||document.hidden)return;
  collageTick++;
  // Prefer currently visible pieces: spectators should actually see each burst.
  const visible=collageCards.filter(tile=>{
   const bounds=tile.getBoundingClientRect();
   return bounds.right>8&&bounds.left<innerWidth-8&&bounds.bottom>8&&bounds.top<innerHeight-8;
  });
  const options=visible.length?visible:collageCards;
  for(let j=0;j<(collageTick%3===0?2:1);j++){
   const tile=options[(Math.random()*options.length)|0];
   if(!tile)continue;
   tile.style.setProperty('--jitter-x',(Math.random()*42-21).toFixed(0)+'px');
   tile.style.setProperty('--jitter-y',(Math.random()*24-12).toFixed(0)+'px');
   tile.style.setProperty('--jitter-scale',(Math.random()*.16+.93).toFixed(2));
   if(collageTick%2===0||j===1){
    if(tile.classList.contains('entry-collage-tile--video'))continue;
   const fresh=collageAssets.filter(([poster])=>!collageVideoMap[poster]);
    const [newSrc,newLabel]=(fresh.length?fresh:collageAssets)[(Math.random()*(fresh.length||collageAssets.length))|0];
    const img=tile.querySelector('img');
    img.src=newSrc;
    tile.querySelector('figcaption').textContent=newLabel;
   }
   tile.classList.remove('is-glint');
   void tile.offsetWidth;
   tile.classList.add('is-glint');
  }
 },780);
}
initCollage();
// Orientation changes and large resizes rebuild the collage to fill the new height.
window.addEventListener('resize',()=>{
 if(!document.body.classList.contains('pre-entry'))return;
 window.clearTimeout(collageResizeTimer);
 collageResizeTimer=window.setTimeout(()=>{
  const portrait=innerHeight>innerWidth*1.12;
  const rows=Math.max(portrait?4:3,Math.min(portrait?6:5,Math.round(innerHeight/(portrait?260:230))));
  const cols=Math.max(portrait?5:7,Math.min(11,Math.ceil(innerWidth/(portrait?185:215))+1));
  const key=rows+':'+cols+':'+(portrait?'portrait':'landscape');
  if(key!==collageViewportKey)initCollage();
 },220);
},{passive:true});

// Separate ORIGINAL fantasy-house lobby soundtrack, rendered from synthesis.
// Saved as 3:41.5 AAC audio. No voice, no piano; plays at 16% by default.
// This file is entirely separate from Abyssal Light Loop inside the portfolio.
const lobbySource=CFG.lobbyAudioSrc||'assets/audio/lobby-fantasy-house-original.m4a';
const lobbyPlayers=[new Audio(lobbySource),new Audio(lobbySource)];
const lobbyActivate=$('lobby-audio-enable');
let lobbyActiveTrack=lobbyPlayers[0],lobbyStandbyTrack=lobbyPlayers[1];
const lobbyLevel=.80; // Fixed 80% gain; the only lobby control is mute/unmute.
let lobbyUserMuted=false;
let lobbyMix=1,lobbyTransition=null,lobbyFrame=0,lobbyPending=false;
let lobbyFadeFrame=0,lobbyShouldPlay=true,lobbyAudioBlocked=false;
for(const track of lobbyPlayers){track.preload='auto';track.loop=false;track.volume=0}

function lobbyIsPlaying(){return !lobbyActiveTrack.paused||!!(lobbyTransition&&!lobbyTransition.to.paused)}
function lobbyProgress(){
 if(!lobbyTransition)return 0;
 return Math.max(0,Math.min(1,(lobbyTransition.from.currentTime-lobbyTransition.start)/lobbyTransition.duration));
}
function updateLobbyVolumes(){
 const gain=lobbyUserMuted?0:lobbyLevel*lobbyMix;
 if(!lobbyTransition){
  lobbyActiveTrack.volume=Math.min(1,gain);
  lobbyStandbyTrack.volume=0;return;
 }
 const p=lobbyProgress();
 lobbyTransition.from.volume=Math.min(1,gain*Math.cos(p*Math.PI/2));
 lobbyTransition.to.volume=Math.min(1,gain*Math.sin(p*Math.PI/2));
}
function finishLobbyBlend(){
 if(!lobbyTransition)return;
 const {from,to}=lobbyTransition;
 lobbyTransition=null;cancelAnimationFrame(lobbyFrame);
 from.pause();try{from.currentTime=0}catch(e){}
 from.volume=0;lobbyActiveTrack=to;lobbyStandbyTrack=from;
 updateLobbyVolumes();
}
function advanceLobbyBlend(){
 if(!lobbyTransition||!lobbyShouldPlay)return;
 if(lobbyTransition.from.paused)return;
 updateLobbyVolumes();
 if(lobbyProgress()>=1){finishLobbyBlend();return}
 lobbyFrame=requestAnimationFrame(advanceLobbyBlend);
}
function beginLobbyBlend(){
 if(lobbyPending||lobbyTransition||!lobbyShouldPlay||lobbyActiveTrack.paused)return;
 const remaining=lobbyActiveTrack.duration-lobbyActiveTrack.currentTime;
 if(!Number.isFinite(remaining)||remaining>4.6||remaining<=0)return;
 lobbyPending=true;
 const from=lobbyActiveTrack,to=lobbyStandbyTrack;
 try{to.currentTime=0}catch(e){lobbyPending=false;return}
 to.volume=0;
 let p;try{p=to.play()}catch(e){lobbyPending=false;from.loop=true;return}
 if(!p||!p.then){lobbyPending=false;return}
 p.then(()=>{
  lobbyPending=false;from.loop=false;
  if(!lobbyShouldPlay||lobbyActiveTrack!==from||from.paused){to.pause();return}
  lobbyTransition={from,to,start:from.currentTime,duration:Math.max(.15,from.duration-from.currentTime)};
  updateLobbyVolumes();cancelAnimationFrame(lobbyFrame);
  lobbyFrame=requestAnimationFrame(advanceLobbyBlend);
 }).catch(()=>{lobbyPending=false;if(!from.paused)from.loop=true});
}
function lobbyFeedback(){
 // Keep a compact sound toggle present. Browser autoplay policy may block
 // audible playback until an actual user gesture; don't pretend it is playing.
 const off=lobbyUserMuted||(lobbyAudioBlocked&&!lobbyIsPlaying());
 lobbyActivate.hidden=false;
 lobbyActivate.classList.toggle('is-muted',off);
 lobbyActivate.setAttribute('aria-pressed',String(!off));
 const label=off?'Activar música del lobby':'Silenciar música del lobby';
 lobbyActivate.setAttribute('aria-label',label);
 lobbyActivate.title=label;
}
function requestLobbyMusic(){
 if(!lobbyShouldPlay)return Promise.resolve();
 updateLobbyVolumes();
 const targets=lobbyTransition?[lobbyTransition.from,lobbyTransition.to]:[lobbyActiveTrack];
 const paused=targets.filter(track=>track.paused);
 if(!paused.length){lobbyAudioBlocked=false;lobbyFeedback();return Promise.resolve()}
 let p;
 try{p=Promise.all(paused.map(track=>track.play()))}
 catch(e){lobbyAudioBlocked=true;lobbyFeedback();return Promise.resolve()}
 return p.then(()=>{
  lobbyAudioBlocked=false;updateLobbyVolumes();lobbyFeedback();
  if(lobbyTransition){cancelAnimationFrame(lobbyFrame);lobbyFrame=requestAnimationFrame(advanceLobbyBlend)}
 }).catch(err=>{
  lobbyAudioBlocked=true;lobbyFeedback();
  if(err?.name!=='NotAllowedError'&&err?.name!=='AbortError')console.warn('Música lobby:',err);
 });
}
for(const track of lobbyPlayers){
 track.addEventListener('timeupdate',()=>{
  if(track===lobbyActiveTrack&&!lobbyTransition)beginLobbyBlend();
  else if(lobbyTransition?.from===track){updateLobbyVolumes();if(lobbyProgress()>=1)finishLobbyBlend()}
 });
 track.addEventListener('ended',()=>{
  if(lobbyTransition?.from===track){finishLobbyBlend();return}
  if(!lobbyShouldPlay||track!==lobbyActiveTrack)return;
  track.currentTime=0;track.play().catch(()=>{lobbyAudioBlocked=true;lobbyFeedback()});
 });
 track.addEventListener('playing',()=>{if(lobbyShouldPlay){lobbyAudioBlocked=false;lobbyFeedback()}});
 track.addEventListener('error',()=>{if(lobbyShouldPlay){lobbyAudioBlocked=true;lobbyFeedback()}});
}
function fadeLobby(target,duration=1300,done){
 cancelAnimationFrame(lobbyFadeFrame);
 const initial=lobbyMix,start=performance.now();
 function frame(now){
  const u=Math.max(0,Math.min(1,(now-start)/duration));
  lobbyMix=initial+(target-initial)*(u*u*(3-2*u));
  updateLobbyVolumes();
  if(u<1)lobbyFadeFrame=requestAnimationFrame(frame);
  else if(done)done();
 }
 lobbyFadeFrame=requestAnimationFrame(frame);
}
function parkLobbyAudio(){
 lobbyShouldPlay=false;cancelAnimationFrame(lobbyFrame);
 lobbyPlayers.forEach(track=>track.pause());
}
function startIntroMusic(){
 lobbyShouldPlay=true;
 return requestLobbyMusic();
}
function fadeIntroMusic(){
 fadeLobby(0,1600,parkLobbyAudio);
}
lobbyActivate.addEventListener('click',e=>{
 e.stopPropagation();
 if(lobbyUserMuted||lobbyAudioBlocked&&!lobbyIsPlaying()){
  lobbyUserMuted=false;updateLobbyVolumes();startIntroMusic();
 }else{
  lobbyUserMuted=true;updateLobbyVolumes();
 }
 lobbyFeedback();
});
// Attempt the soundtrack immediately, then unlock it on the visitor's FIRST
// interaction when the browser blocks autoplay. This also works after a return
// to the lobby, without introducing a large "Activar música" call to action.
function unlockLobbyOnGesture(e){
 if(e.target?.closest?.('#lobby-audio-enable'))return;
 if(!lobbyShouldPlay||lobbyUserMuted||lobbyIsPlaying()||
    !document.body.classList.contains('pre-entry'))return;
 requestLobbyMusic();
}
document.addEventListener('pointerdown',unlockLobbyOnGesture,{capture:true});
document.addEventListener('keydown',unlockLobbyOnGesture,{capture:true});

lobbyFeedback();
// Request lobby music right away; if sound autoplay is blocked, expose the
// dedicated "Activar música del lobby" gesture without leaving the screen.
startIntroMusic();

// A single game-like start action intentionally unlocks music under autoplay rules.
const entryGate=$('entry-gate'),entryButton=$('enter-portfolio'),siteMain=$('site-main'),siteHeader=document.querySelector('.site-header');
let hasEntered=false;
siteMain.inert=true;
siteHeader.inert=true;
function fantasyEntranceSfx(){
 if(CFG.enableClickSounds===false)return;
 const ac=context();
 if(!ac)return;
 const t=ac.currentTime;
 // Airy portal sweep: filtered noise, with a light original rising chime.
 const len=Math.round(ac.sampleRate*1.18);
 const noiseBuf=ac.createBuffer(1,len,ac.sampleRate),samples=noiseBuf.getChannelData(0);
 for(let i=0;i<len;i++)samples[i]=Math.random()*2-1;
 const gust=ac.createBufferSource(),filter=ac.createBiquadFilter(),vol=ac.createGain();
 gust.buffer=noiseBuf;filter.type='bandpass';filter.Q.value=.7;
 filter.frequency.setValueAtTime(250,t);
 filter.frequency.exponentialRampToValueAtTime(2300,t+.58);
 filter.frequency.exponentialRampToValueAtTime(480,t+1.1);
 vol.gain.setValueAtTime(.0001,t);
 vol.gain.exponentialRampToValueAtTime(.055,t+.25);
 vol.gain.exponentialRampToValueAtTime(.0001,t+1.15);
 gust.connect(filter);filter.connect(vol);vol.connect(ac.destination);
 gust.start(t);gust.stop(t+1.18);
 const tones=[{hz:294,at:.04},{hz:440,at:.17},{hz:587,at:.34},{hz:740,at:.50},{hz:880,at:.72}];
 for(const note of tones){
  const osc=ac.createOscillator(),amp=ac.createGain(),start=t+note.at;
  osc.type='sine';osc.frequency.setValueAtTime(note.hz,start);
  osc.frequency.exponentialRampToValueAtTime(note.hz*1.012,start+.35);
  amp.gain.setValueAtTime(.0001,start);
  amp.gain.exponentialRampToValueAtTime(.024,start+.035);
  amp.gain.exponentialRampToValueAtTime(.0001,start+.92);
  osc.connect(amp);amp.connect(ac.destination);osc.start(start);osc.stop(start+.95);
 }
 const bass=ac.createOscillator(),bassAmp=ac.createGain();
 bass.type='triangle';bass.frequency.setValueAtTime(110,t);
 bass.frequency.exponentialRampToValueAtTime(165,t+.46);
 bassAmp.gain.setValueAtTime(.0001,t);
 bassAmp.gain.exponentialRampToValueAtTime(.018,t+.15);
 bassAmp.gain.exponentialRampToValueAtTime(.0001,t+.75);
 bass.connect(bassAmp);bassAmp.connect(ac.destination);bass.start(t);bass.stop(t+.8);
}
function enterPortfolio(){
 if(hasEntered)return;
 hasEntered=true;
 // The music starts at exactly 10% on every visit, regardless of past changes.
 musicLevel=.10;volumeInput.value='10';volumeValue.textContent='10%';
 updateMusicVolumes();
 // These audio operations run inside a real click to satisfy browser autoplay policies.
 // User activation unlocks the music and the magical transition in one click.
 requestMusic();
 fantasyEntranceSfx();
 fadeIntroMusic();
 entryButton.disabled=true;
 entryGate.classList.add('is-opening');
 document.body.classList.remove('pre-entry');
 document.body.classList.add('entering-portfolio');
 siteMain.inert=false;siteHeader.inert=false;
 // Bring the primary soundtrack up under the portal SFX as the home page emerges.
 const fadeStart=performance.now();
 function rise(now){
  entryMix=Math.min(1,Math.max(0,(now-fadeStart-370)/1150));
  updateMusicVolumes();
  if(entryMix<1)requestAnimationFrame(rise);
 }
 requestAnimationFrame(rise);
 if(collageTimer)window.clearInterval(collageTimer);
 for(const video of collageVideos)video.pause();
 const speed=reduce.matches?130:1840;
 window.setTimeout(()=>{
  entryGate.hidden=true;
  document.body.classList.remove('entering-portfolio');
  entryButton.disabled=false;
  const focusTarget=document.body.dataset.screen==='home'?document.querySelector('.paper-about'):$('back-home');
  focusTarget?.focus({preventScroll:true});
 },speed);
}

// Close the experience and return to the actual lobby without reloading.
// Lobby music resumes, the 10%-volume main music fades and stops, and the
// original collage is restored with its autoplay-muted video previews.
const closePortfolioButton=$('close-portfolio');
let closingPortfolio=false;
function returnToLobby(){
 if(closingPortfolio||!hasEntered)return;
 closingPortfolio=true;
 if(viewer.open){
  $('viewer-media').replaceChildren();
  viewer.close();activeProject=null;
  pausedForProjectVideo=false;wasPlaying=false;
 }
 if(aboutDialog?.open)closeAbout();
 soundEffect('reveal');
 lobbyShouldPlay=true;lobbyMix=0;updateLobbyVolumes();
 startIntroMusic();fadeLobby(1,1450);
 const oldMix=entryMix,fadeStart=performance.now();
 function mainExit(now){
  const u=Math.min(1,(now-fadeStart)/950);
  entryMix=oldMix*(1-u);
  updateMusicVolumes();
  if(u<1)requestAnimationFrame(mainExit);
  else{
   cancelAnimationFrame(crossfadeFrame);transition=null;crossfadePending=false;
   musicA.pause();musicB.pause();
   try{musicA.currentTime=0;musicB.currentTime=0}catch(e){}
   activeTrack=musicA;standbyTrack=musicB;entryMix=0;updateMusicVolumes();
  }
 }
 requestAnimationFrame(mainExit);
 entryGate.hidden=false;entryGate.classList.remove('is-opening');
 entryButton.disabled=false;
 hasEntered=false;
 document.body.classList.remove('entering-portfolio');
 document.body.classList.add('pre-entry');
 siteMain.inert=true;siteHeader.inert=true;
 goHome(0);
 try{history.replaceState({screen:'inicio'},'',location.pathname+location.search)}catch(e){}
 // Rebuild only the lobby's muted visual previews and restarting strips.
 initCollage();
 entryButton.focus({preventScroll:true});
 window.setTimeout(()=>closingPortfolio=false,1000);
}
closePortfolioButton.addEventListener('click',returnToLobby);

entryButton.addEventListener('click',enterPortfolio);
entryButton.focus({preventScroll:true});


// One-click recruitment: direct Gmail compose plus copyable address, no Outlook dependency.
const publicEmail='yazmin.moreno374@gmail.com';
document.addEventListener('click',async event=>{
 const button=event.target.closest?.('[data-copy-email]');
 if(!button)return;
 const previous=button.textContent;
 let copied=false;
 try{await navigator.clipboard.writeText(publicEmail);copied=true}catch(error){
  // Clipboard fallback for older browsers or restricted embedded contexts.
  const input=document.createElement('textarea');input.value=publicEmail;
  input.style.position='fixed';input.style.opacity='0';
  document.body.appendChild(input);input.select();
  try{copied=document.execCommand('copy')}catch(e){}
  input.remove();
 }
 if(copied){toast('Correo copiado: '+publicEmail);button.textContent='¡Copiado!'}
 else toast('Correo: '+publicEmail);
 window.setTimeout(()=>{if(button.isConnected)button.textContent=previous},1800);
 soundEffect('click');
});

// PDF preview is fitted to the available screen; separate pages use arrows instead
// of requiring a visitor to scroll the PDF. "Ver en grande" always remains available.
const cvDialog=$('cv-dialog'),cvOpen=$('lobby-view-cv'),cvClose=$('cv-close');
const cvCanvas=$('cv-page-canvas'),cvFallback=$('cv-pdf-fallback');
const cvArea=$('cv-page-area'),cvLoading=$('cv-loading'),cvPagination=$('cv-pagination');
const cvPrev=$('cv-prev'),cvNext=$('cv-next'),cvCount=$('cv-page-count');
let cvDocument=null,cvPage=1,cvLibPromise=null,cvRenderTask=null,cvRevision=0,cvResizeTimer=0,cvReturnFocus=null;
function ensureCvLibrary(){
 if(window.pdfjsLib)return Promise.resolve(window.pdfjsLib);
 if(cvLibPromise)return cvLibPromise;
 cvLibPromise=new Promise((resolve,reject)=>{
  const script=document.createElement('script');
  script.src='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
  script.async=true;script.crossOrigin='anonymous';
  script.onload=()=>window.pdfjsLib?resolve(window.pdfjsLib):reject(new Error('PDF.js no disponible'));
  script.onerror=()=>reject(new Error('No se pudo descargar el visor'));
  document.head.appendChild(script);
 });
 return cvLibPromise;
}
function cvFallbackView(){
 cvLoading.hidden=true;cvCanvas.hidden=true;cvPagination.hidden=true;
 cvFallback.hidden=false;
 if(cvFallback.src==='about:blank')cvFallback.src='assets/docs/CV-Yazmin-Moreno.pdf#page=1&view=Fit&toolbar=0&navpanes=0';
}
async function renderCvPage(pageNumber){
 if(!cvDialog?.open)return;
 const seq=++cvRevision;
 try{
  const library=await ensureCvLibrary();
  if(!cvDocument){
   library.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
   cvDocument=await library.getDocument('assets/docs/CV-Yazmin-Moreno.pdf').promise;
  }
  if(!cvDialog.open||seq!==cvRevision)return;
  cvPage=Math.max(1,Math.min(cvDocument.numPages,pageNumber));
  const page=await cvDocument.getPage(cvPage);
  if(!cvDialog.open||seq!==cvRevision)return;
  if(cvRenderTask){try{cvRenderTask.cancel();await cvRenderTask.promise}catch(e){}cvRenderTask=null}
  const rect=cvArea.getBoundingClientRect(),unscaled=page.getViewport({scale:1});
  const scale=Math.min(Math.max(1,rect.width-28)/unscaled.width,Math.max(1,rect.height-24)/unscaled.height);
  const viewport=page.getViewport({scale});
  const dpi=Math.min(window.devicePixelRatio||1,2);
  cvCanvas.width=Math.max(1,Math.ceil(viewport.width*dpi));
  cvCanvas.height=Math.max(1,Math.ceil(viewport.height*dpi));
  cvCanvas.style.width=viewport.width+'px';cvCanvas.style.height=viewport.height+'px';
  cvLoading.hidden=true;cvCanvas.hidden=false;cvFallback.hidden=true;
  cvRenderTask=page.render({canvasContext:cvCanvas.getContext('2d'),viewport,
   transform:[dpi,0,0,dpi,0,0]});
  await cvRenderTask.promise;
  if(seq!==cvRevision)return;
  cvPagination.hidden=cvDocument.numPages<=1;
  cvCount.textContent=cvPage+' / '+cvDocument.numPages;
  cvPrev.disabled=cvPage<=1;cvNext.disabled=cvPage>=cvDocument.numPages;
 }catch(error){
  if(!cvDialog.open)return;
  console.warn('Visor PDF: se usará el visor nativo',error);
  cvFallbackView();
 }
}
function openCvDialog(){
 if(!cvDialog||cvDialog.open)return;
 cvReturnFocus=document.activeElement;
 cvDialog.classList.toggle('cv-over-about',Boolean(aboutDialog?.open));
 cvDialog.showModal();cvLoading.hidden=false;cvFallback.hidden=true;
 cvCanvas.hidden=true;cvPage=1;cvClose.focus({preventScroll:true});
 requestAnimationFrame(()=>renderCvPage(1));
 soundEffect('click');
}
cvOpen?.addEventListener('click',openCvDialog);
$('about-view-cv')?.addEventListener('click',openCvDialog);
cvClose?.addEventListener('click',()=>cvDialog.close());
cvDialog?.addEventListener('click',e=>{if(e.target===cvDialog)cvDialog.close()});
cvDialog?.addEventListener('close',()=>{
 cvDialog.classList.remove('cv-over-about');
 cvRevision++;
 if(cvRenderTask){try{cvRenderTask.cancel()}catch(e){}cvRenderTask=null}
 if(cvReturnFocus?.isConnected)cvReturnFocus.focus({preventScroll:true});
});
cvPrev?.addEventListener('click',()=>renderCvPage(cvPage-1));
cvNext?.addEventListener('click',()=>renderCvPage(cvPage+1));
window.addEventListener('resize',()=>{
 if(!cvDialog?.open||!cvDocument)return;
 window.clearTimeout(cvResizeTimer);
 cvResizeTimer=window.setTimeout(()=>renderCvPage(cvPage),160);
},{passive:true});

// The background video only supplements the particle field and has no soundtrack.
if(CFG.backgroundVideoSrc){const v=$('background-video');v.src=CFG.backgroundVideoSrc;v.classList.add('has-source');v.play().catch(()=>{})}
// Home: exactly three scenes in one fixed plane. Wheel/touch replace panels instead of scrolling a document.
const scenes=[$('scene-entrance'),$('scene-tools'),$('scene-contact')];
function showStage(n){if(document.body.classList.contains('pre-entry')||document.body.classList.contains('entering-portfolio')||aboutDialog?.open)return;n=Math.max(0,Math.min(2,n));if(n===stage||locked)return;locked=true;soundEffect('reveal');scenes[stage].classList.remove('is-active');scenes[stage].inert=true;stage=n;scenes[stage].inert=false;scenes[stage].classList.add('is-active');if(stage===1)requestAnimationFrame(()=>{queueToolFit();animateToolSelection()});document.querySelectorAll('.stage-dot').forEach((dot,i)=>{dot.classList.toggle('is-active',i===stage);if(i===stage)dot.setAttribute('aria-current','step');else dot.removeAttribute('aria-current')});setTimeout(()=>{locked=false},600)}
for(const dot of document.querySelectorAll('[data-stage]'))dot.addEventListener('click',()=>{wheelBuffer=0;showStage(+dot.dataset.stage)});
for(const b of document.querySelectorAll('[data-next]'))b.addEventListener('click',()=>showStage(+b.dataset.next));
let wheelBuffer=0,lastWheelAt=0;
window.addEventListener('wheel',e=>{
 if(aboutDialog?.open||viewer.open||document.body.dataset.screen!=='home')return;
 if(document.body.classList.contains('pre-entry')||document.body.classList.contains('entering-portfolio'))return;
 const delta=e.deltaMode===1?e.deltaY*16:e.deltaMode===2?e.deltaY*innerHeight:e.deltaY;
 if(Math.abs(delta)<1)return;
 e.preventDefault();
 const now=performance.now();
 if(locked||now-scrollLock<680){wheelBuffer=0;return}
 if(now-lastWheelAt>360||Math.sign(wheelBuffer)!==Math.sign(delta))wheelBuffer=0;
 lastWheelAt=now;wheelBuffer+=delta;
 if(Math.abs(wheelBuffer)>=42){
  const next=stage+(wheelBuffer>0?1:-1);wheelBuffer=0;
  if(next>=0&&next<scenes.length){scrollLock=now;showStage(next)}
 }
},{passive:false});
let touchY=null;
$('home-deck').addEventListener('touchstart',e=>{touchY=e.touches[0]?.clientY??null},{passive:true});
$('home-deck').addEventListener('touchend',e=>{if(aboutDialog?.open||touchY==null||document.body.dataset.screen!=='home')return;const d=touchY-(e.changedTouches[0]?.clientY??touchY);touchY=null;if(Math.abs(d)>72)showStage(stage+(d>0?1:-1))},{passive:true});
window.addEventListener('keydown',e=>{if(aboutDialog?.open||viewer.open||document.body.dataset.screen!=='home')return;if(['ArrowDown','PageDown'].includes(e.key)){e.preventDefault();showStage(stage+1)}else if(['ArrowUp','PageUp'].includes(e.key)){e.preventDefault();showStage(stage-1)}});
function revealChange(callback,element){if(locked)return;locked=true;const pos=element?.getBoundingClientRect?.();const x=pos?pos.left+pos.width/2:innerWidth/2,y=pos?pos.top+pos.height/2:innerHeight/2;const light=$('light-reveal');light.style.setProperty('--cx',x+'px');light.style.setProperty('--cy',y+'px');soundEffect('reveal');if(reduce.matches){callback();locked=false;return}light.classList.remove('entering','leaving');void light.offsetWidth;light.classList.add('entering');setTimeout(()=>{callback();light.classList.remove('entering');light.classList.add('leaving');setTimeout(()=>{light.classList.remove('leaving');locked=false},530)},520)}
const aboutHTML=`<div class="about-editorial"><p class="eyebrow">PERFIL CREATIVO / MÉXICO</p><h2>Editar también es <em>contar historias.</em></h2><p class="about-lead">Soy Yazmin Moreno. Mi trabajo se mueve entre la edición audiovisual, el diseño gráfico y la creación de contenido para creadores y marcas.</p><p>Estudio Ingeniería en Comunicación Multimedia y busco desarrollar mi carrera en equipos de entretenimiento, música, cultura y producción audiovisual. La tecnología es una herramienta para mejorar lo que comunico, no el centro de mi perfil.</p><div class="about-cols"><div><h3>Lo que hago</h3><p>Edición narrativa · Montaje · Tratamiento sonoro · Composición visual · Contenido digital · Adaptación de formatos</p></div><div><h3>Herramientas</h3><p>Premiere Pro · CapCut · After Effects · Canva · Remotion · Herramientas creativas de IA</p></div></div><a class="about-cv" href="assets/docs/CV-Yazmin-Moreno.pdf" target="_blank" rel="noopener">Ver CV completo ↗</a></div>`;
function openAbout(){
  if(!aboutDialog)return;aboutReturnFocus=document.activeElement;
  if(!aboutDialog.open)aboutDialog.showModal();document.body.classList.add('about-is-open');siteMain.inert=true;siteHeader.inert=true;
  $('about-close').focus();soundEffect('click');
}
function closeAbout(){if(!aboutDialog?.open)return;aboutDialog.close();document.body.classList.remove('about-is-open');siteMain.inert=false;siteHeader.inert=false;if(aboutReturnFocus?.isConnected)aboutReturnFocus.focus();soundEffect('click')}
// Permit the modal's own scroll, but not wheel or touch movement behind it.
for(const type of ['wheel','touchmove']){
 document.addEventListener(type,e=>{
  if(!aboutDialog?.open)return;
  if(cvDialog?.open&&cvDialog.contains(e.target))return;
  const inside=e.target instanceof Element?e.target.closest('.about-description,.about-modal-body'):null;
  if(!inside)e.preventDefault();
 },{capture:true,passive:false});
}
$('about-close')?.addEventListener('click',closeAbout);
$('about-contact')?.addEventListener('click',()=>{
 closeAbout();
 route('contact',null);
});
aboutDialog?.addEventListener('cancel',e=>{e.preventDefault();closeAbout()});
aboutDialog?.addEventListener('click',e=>{if(e.target===aboutDialog)closeAbout()});
$('header-home-icon')?.addEventListener('click',e=>route('home',e.currentTarget));
function goHome(nextStage=0){$('brand-home').innerHTML=originalBrand;$('header-home-icon').hidden=true;document.body.dataset.screen='home';work.hidden=true;$('home-deck').hidden=false;activeCategory=null;stage=nextStage;scenes.forEach((e,i)=>{e.inert=i!==nextStage;e.classList.toggle('is-active',i===nextStage)});document.querySelectorAll('.stage-dot').forEach((dot,i)=>{dot.classList.toggle('is-active',i===stage);if(i===stage)dot.setAttribute('aria-current','step');else dot.removeAttribute('aria-current')})}
function route(category,element,replace=false){if(category==='about'){openAbout();return}const go=()=>{if(category==='home'){goHome(0)}else if(category==='contact'){goHome(2)}else if(catById[category]){document.body.dataset.screen='work';$('home-deck').hidden=true;work.hidden=false;selectCategory(category)}else{goHome(0)}};if(replace||reduce.matches||document.readyState==='loading')go();else revealChange(go,element);if(!replace){let h=category==='home'?'inicio':category==='contact'?'contacto':category;history.pushState({screen:h},'',`#${h}`)}}
function routeByHash(){const hash=location.hash.replace('#','');if(hash==='contacto')route('contact',null,true);else if(catById[hash])route(hash,null,true);else route('home',null,true)}
for(const p of document.querySelectorAll('[data-destination]'))p.addEventListener('click',()=>route(p.dataset.destination,p));
$('brand-home').addEventListener('click',e=>route('home',e.currentTarget));
$('header-contact').addEventListener('click',e=>route('contact',e.currentTarget));
$('back-home').addEventListener('click',e=>route('home',e.currentTarget));
window.addEventListener('popstate',routeByHash);
// Icons supplied by the author. Their artwork stays UPRIGHT (0°), while
// category labels keep the original vertical reading direction.
const railIconFiles={
 video:'assets/icons/rail-video.svg',
 diseno:'assets/icons/rail-diseno.svg',
 fotografia:'assets/icons/rail-fotografia.svg',
 copywriter:'assets/icons/rail-copywriter.svg'
};
function renderRail(){
 const el=$('work-rail');el.replaceChildren();
 for(const c of CATS){
  const b=document.createElement('button');
  b.type='button';b.className='rail-link'+(activeCategory===c.id?' is-active':'');
  b.setAttribute('aria-current',activeCategory===c.id?'page':'false');
  const icon=document.createElement('span');icon.className='rail-icon';icon.setAttribute('aria-hidden','true');
  if(railIconFiles[c.id]){
   const img=document.createElement('img');img.src=railIconFiles[c.id];
   img.alt='';img.decoding='async';icon.appendChild(img);
  }else icon.textContent=c.icon;
  const label=document.createElement('span');label.className='rail-label';label.textContent=c.label;
  b.append(icon,label);
  b.addEventListener('click',()=>route(c.id,b));el.appendChild(b);
 }
}
function selectCategory(id){const c=catById[id];if(!c)return;activeCategory=id;$('brand-home').innerHTML=`${c.title} <span class="brand-divider">|</span> <span class="brand-suffix">Yazmin Moreno</span>`;$('header-home-icon').hidden=false;activeFilter='all';renderRail();$('work-heading').innerHTML=`${c.title} <span>| Yazmin Moreno</span>`;$('work-intro-title').textContent=c.intro;$('work-caption').textContent='TRABAJOS SELECCIONADOS / '+c.title.toUpperCase();$('work-intro-detail').textContent=c.desc;const tabs=$('work-tabs');tabs.replaceChildren();
if(id==='about'){const home=document.createElement('button');home.type='button';home.className='filter-chip active';home.textContent='Mi perfil';tabs.appendChild(home);$('work-grid').className='about-container';$('work-grid').innerHTML=aboutHTML;activeItems=[]}
else{$('work-grid').className='masonry';for(const [key,label]of c.filters){const b=document.createElement('button');b.type='button';b.className='filter-chip'+(key==='all'?' active':'');b.setAttribute('aria-pressed',String(key==='all'));b.textContent=label;b.addEventListener('click',()=>{activeFilter=key;tabs.querySelectorAll('button').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',String(x===b))});renderGrid()});tabs.appendChild(b)}renderGrid()}
workMain.scrollTop=0}
const posters={'benito-mexico':'https://drive.google.com/thumbnail?id=1UU3FM64slAynypB1hQHap4snWBUrlaxl&sz=w1200','benito-ia':'https://drive.google.com/thumbnail?id=1HSEWZS7De15K7rjQFRzuFxQli0mxor08&sz=w1200','benito-bolivia':'https://drive.google.com/thumbnail?id=1TWbeBngOQUy3ZJORXFtsQlG2Rp1qGg_R&sz=w1200','benito-viral':'https://drive.google.com/thumbnail?id=15GeMttaRFHF-yKP5IJQzSVC2rQCB4II9&sz=w1200','benito-ormuz':'https://drive.google.com/thumbnail?id=1TQyrCCEYhe5JVGe-hG-6leOQI3NWhLlq&sz=w1200',zaru:'assets/images/poster-thehomes.webp',smarketing:'assets/images/poster-smarketing.webp',casita:'assets/images/poster-casita.webp',minsis:'assets/images/poster-minsis.webp'};
const aspects={'benito-mexico':'16/10','benito-ia':'16/10','benito-bolivia':'16/10','benito-viral':'16/10','benito-ormuz':'16/10','foto-halloween':'3/4',zaru:'9/16',smarketing:'9/16',casita:'9/16',minsis:'16/10',potencial:'1/1',omar:'4/5',editorial:'4/5',wbmf:'4/5',sabias:'4/5','foto-terror':'3/4','copy-sm':'4/5','copy-wbmf':'4/5'};
function visibleIDs(){const c=catById[activeCategory];return c.items.filter(([id,filter])=>activeFilter==='all'||filter===activeFilter).map(([id])=>id)}
function makeCard(id){const item=DATA[id];if(!item)return document.createElement('div');const article=document.createElement('article');article.className='project-card';const btn=document.createElement('button');btn.type='button';btn.className='project-open';btn.setAttribute('aria-label','Abrir '+item.title);const frame=document.createElement('div');frame.className='project-image';frame.style.setProperty('--ratio',aspects[id]||'4/5');const pic=(item.images&&item.images[0])||posters[id];
if(pic){const img=document.createElement('img');img.src=pic;img.loading='lazy';img.alt='Vista previa: '+item.title;img.decoding='async';img.onerror=()=>{img.style.opacity='0';const fallback=document.createElement('div');fallback.className='image-no-preview';fallback.innerHTML='<span>YAZMIN<br><small>Ver proyecto ↗</small></span>';frame.appendChild(fallback)};frame.appendChild(img)}else{const fall=document.createElement('div');fall.className='image-no-preview';fall.innerHTML='<span>YAZMIN<br><small>Ver proyecto ↗</small></span>';frame.appendChild(fall)}if(item.type==='video'){let play=document.createElement('span');play.className='play-hint';play.textContent='▶';play.setAttribute('aria-hidden','true');frame.appendChild(play)}
const caption=document.createElement('div');caption.className='project-caption';const title=document.createElement('strong');title.textContent=item.title;const sub=document.createElement('span');sub.textContent=item.kind;caption.append(title,sub);btn.append(frame,caption);btn.addEventListener('click',()=>openProject(id,btn));article.appendChild(btn);return article}
let observer=null;
function renderGrid(){const ids=visibleIDs(),el=$('work-grid');el.replaceChildren();activeItems=ids;if(observer)observer.disconnect();if(!ids.length){el.textContent='No hay piezas en este filtro.';return}ids.forEach(id=>el.appendChild(makeCard(id)));const cards=el.querySelectorAll('.project-card');if(reduce.matches||!('IntersectionObserver' in window)){cards.forEach(e=>e.classList.add('is-visible'))}else{observer=new IntersectionObserver(entries=>{entries.forEach(x=>{if(x.isIntersecting){x.target.classList.add('is-visible');observer.unobserve(x.target)}})},{root:workMain,rootMargin:'120px 0px',threshold:.02});cards.forEach(e=>observer.observe(e));setTimeout(()=>cards.forEach(e=>{if(e.getBoundingClientRect().top<innerHeight+200)e.classList.add('is-visible')}),250)}}
function ytEmbed(id){if(!/^[A-Za-z0-9_-]{11}$/.test(id))return null;let f=document.createElement('iframe');f.src=`https://www.youtube-nocookie.com/embed/${id}?rel=0&playsinline=1`;f.allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen';f.allowFullscreen=true;f.title='Reproductor de YouTube';f.referrerPolicy='strict-origin-when-cross-origin';f.loading='eager';return f}
function driveEmbed(id){if(!/^[A-Za-z0-9_-]{15,}$/.test(id))return null;let f=document.createElement('iframe');f.src=`https://drive.google.com/file/d/${id}/preview`;f.allow='autoplay; fullscreen; picture-in-picture';f.allowFullscreen=true;f.title='Visor de Google Drive';return f}
function makeMedia(item){const media=$('viewer-media');media.replaceChildren();const box=document.createElement('div');box.className='media-box'+(item.aspect==='portrait'?' portrait':'');media.appendChild(box);
 if(item.type==='video'){
  const build=identity=>{box.querySelector('iframe')?.remove();let iframe=item.platform==='youtube'?ytEmbed(identity):driveEmbed(identity);if(iframe)box.prepend(iframe);else box.prepend(document.createTextNode('Video no disponible'))};
  if(item.clips?.length){build(item.clips[0].id);const choices=document.createElement('div');choices.className='clip-choices';item.clips.forEach((clip,i)=>{const b=document.createElement('button');b.type='button';b.textContent=clip.label||`Video ${i+1}`;b.className=i===0?'is-selected':'';b.addEventListener('click',()=>{choices.querySelectorAll('button').forEach(x=>x.classList.remove('is-selected'));b.classList.add('is-selected');build(clip.id);soundEffect('click')});choices.appendChild(b)});box.appendChild(choices)}else{build(item.id)}
  if(item.platform==='drive'&&item.id&&item.clips?.length){
   const sourceLink=document.createElement('a');
   sourceLink.className='viewer-drive-source';
   sourceLink.href='https://drive.google.com/file/d/'+encodeURIComponent(item.id)+'/view';
   sourceLink.target='_blank';sourceLink.rel='noopener noreferrer';
   sourceLink.textContent='Abrir video completo en Drive ↗';
   sourceLink.setAttribute('aria-label','Abrir video completo en una pestaña de Drive');
   box.appendChild(sourceLink);
  }
 }else if(item.images?.length){const stage=document.createElement('div');stage.className='gallery-stage';const pic=document.createElement('img');pic.alt=item.title;let index=0;pic.src=item.images[index];stage.appendChild(pic);const ctl=document.createElement('div');ctl.className='gallery-controls';const prev=document.createElement('button'),next=document.createElement('button'),count=document.createElement('span');prev.textContent='←';next.textContent='→';const update=()=>{pic.src=item.images[index];count.textContent=`${index+1} / ${item.images.length}`};prev.addEventListener('click',()=>{index=(index-1+item.images.length)%item.images.length;update();soundEffect()});next.addEventListener('click',()=>{index=(index+1)%item.images.length;update();soundEffect()});update();ctl.append(prev,count,next);if(item.images.length>1)stage.appendChild(ctl);
   let touchX=null;stage.addEventListener('touchstart',e=>{touchX=e.touches[0]?.clientX??null},{passive:true});stage.addEventListener('touchend',e=>{if(touchX==null)return;const dx=(e.changedTouches[0]?.clientX??touchX)-touchX;touchX=null;if(Math.abs(dx)>55){index=(index+(dx<0?1:-1)+item.images.length)%item.images.length;update();soundEffect('click')}},{passive:true});
   box.appendChild(stage)}
}
// Hover-only particle assembly reveals the actual brand logo after a soft dust burst.


// The full tool library stays centered and FIXED within a single scene.
// On smaller screens, scale the content uniformly instead of creating an
// internal scrollbar; filters and scene navigation remain available.
let toolFitFrame=0;
function fitToolScene(){
 const scene=$('scene-tools'),inner=scene?.querySelector('.scene-inner');
 if(!scene||!inner)return;
 inner.style.setProperty('--tools-fit','1');
 const available=Math.max(150,scene.clientHeight-44);
 const needed=Math.max(inner.scrollHeight,inner.offsetHeight);
 const scale=Math.max(.24,Math.min(1,available/Math.max(needed,1)));
 inner.style.setProperty('--tools-fit',String(scale));
}
function queueToolFit(){
 cancelAnimationFrame(toolFitFrame);
 toolFitFrame=requestAnimationFrame(fitToolScene);
}
window.addEventListener('resize',queueToolFit,{passive:true});

function animateToolSelection(){
 if(reduce.matches)return;
 const wall=$('tool-wall');
 const tiles=Array.from(wall.querySelectorAll('.tool-category:not([hidden]) .tool-chip'));
 // All entries complete within ~1.8s for the full library. Smaller groups
 // retain the overlapping motion instead of waiting for invisible items.
 const spacing=Math.min(.16,1.43/Math.max(1,tiles.length-1));
 for(const [i,tile] of tiles.entries()){
  tile.classList.remove('tool-cascade');
  tile.style.setProperty('--tool-stagger',(i*spacing).toFixed(3)+'s');
 }
 // Restart the animation when the visitor switches specialties.
 void wall.offsetWidth;
 tiles.forEach(tile=>{
  tile.classList.add('tool-cascade');
  tile.addEventListener('animationend',event=>{
   if(event.animationName==='toolCardCascade')tile.classList.remove('tool-cascade');
  },{once:true});
 });
}

// All tools stay on one page; grouped tabs help people hiring for a specific role.
function categorizeTools(){
 const wall=$('tool-wall'),tabs=$('tool-filters');
 if(!wall||!tabs)return;
 const tiles=[...wall.querySelectorAll('.tool-chip')].filter(tile=>{const redundant=tile.querySelector('.tool-name')?.textContent.trim()==='Adobe Creative Cloud';if(redundant)tile.remove();return !redundant});
 for(const [name,symbol,source,color] of [
 ['Illustrator','Ai','assets/logos/illustrator.svg','#ff9a00'],
 ['Claude','Cl','https://cdn.simpleicons.org/claude/D97757','#d97757'],
 ['Grok','Gk','assets/logos/grok.png','#181818']
 ]){
  const node=document.createElement('div');node.className='tool-chip particle-tool';node.dataset.symbol=symbol;node.style.setProperty('--tool',color);
  const mark=document.createElement('span');mark.className='tool-mark';
  const logo=document.createElement('img');logo.alt='';logo.src=source;logo.loading='lazy';logo.decoding='async';
  const fallback=document.createElement('b');fallback.className='tool-fallback';fallback.textContent=symbol;
  logo.onerror=()=>{logo.style.display='none';fallback.style.opacity='1'};
  const dust=document.createElement('canvas');dust.className='tool-dust';dust.setAttribute('aria-hidden','true');
  const title=document.createElement('span');title.className='tool-name';title.textContent=name;
  mark.append(logo,fallback,dust);node.append(mark,title);tiles.push(node);
 }
 const sources={
 'Premiere Pro':'assets/logos/premiere.svg','After Effects · básico':'assets/logos/after-effects.svg',
 'Photoshop':'assets/logos/photoshop.svg','Lightroom · básico':'assets/logos/lightroom.svg',
 'Google Flow':'assets/logos/flow.png','OpenAI':'assets/logos/openai.png',
 'Canva':'https://cdn.simpleicons.org/canva/00C4CC','Adobe UXP':'assets/logos/uxp.png',
 'Trello':'https://cdn.simpleicons.org/trello','WordPress':'https://cdn.simpleicons.org/wordpress',
 'InDesign':'assets/logos/indesign.svg'
 };
 const byName=new Map(tiles.map(node=>{
  const name=node.querySelector('.tool-name').textContent.trim();
  if(sources[name])node.querySelector('.tool-mark img').src=sources[name];
   if(name==='Grok'||name==='OpenAI')node.classList.add('tool-rounded-brand');
   if(name==='Canva'||name==='Claude')node.classList.add('tool-transparent-brand');
  return [name,node];
 }));
 const groups=[
 ['video','Video y motion','Edición y animación',['Premiere Pro','After Effects · básico','CapCut']],
 ['diseno','Diseño e imagen','Fotografía y diseño gráfico',['Photoshop','Illustrator','InDesign','Lightroom · básico','Affinity','Canva']],
 ['ia','IA creativa','Apoyo creativo y producción',['Google Flow','Kling AI','Magnific AI','OpenAI','Claude','Grok']],
 ['gestion','Gestión y publicación','Planificación y herramientas técnicas',['Trello','Metricool','WordPress','Adobe UXP']]
 ];
 const fragment=document.createDocumentFragment(),sections=[],buttons=[];
 let assigned=0;
 for(const [id,label,caption,names]of groups){
  const section=document.createElement('section');section.className='tool-category';section.dataset.category=id;
  const head=document.createElement('div');head.className='tool-category-head';
  const h=document.createElement('h2');h.textContent=label;
  const small=document.createElement('small');small.textContent=caption;head.append(h,small);
  const grid=document.createElement('div');grid.className='tool-category-grid';
  for(const name of names){const tile=byName.get(name);if(tile){grid.appendChild(tile);assigned++}}
  section.append(head,grid);sections.push(section);fragment.appendChild(section);
 }
 wall.replaceChildren(fragment);
 if(assigned!==tiles.length)console.warn('Unassigned tools',assigned,tiles.length);
 function select(id){
  sections.forEach(s=>s.hidden=id!=='all'&&s.dataset.category!==id);
  buttons.forEach(btn=>{const yes=btn.dataset.filter===id;btn.classList.toggle('active',yes);btn.setAttribute('aria-pressed',String(yes))});
  queueToolFit();
  if(document.getElementById('scene-tools')?.classList.contains('is-active'))
   requestAnimationFrame(animateToolSelection);
 }
 for(const [id,label] of [['all','Todas'],...groups.map(g=>[g[0],g[1]])]){
  const btn=document.createElement('button');btn.type='button';btn.className='filter-chip tool-filter-chip';btn.textContent=label;btn.dataset.filter=id;
  btn.addEventListener('click',()=>{select(id);soundEffect('click')});
  tabs.appendChild(btn);buttons.push(btn);
 }
 select('all');
}
categorizeTools();
queueToolFit();

function decorateToolDust(){
 document.querySelectorAll('.particle-tool').forEach(tile=>{
  const canvas=tile.querySelector('canvas.tool-dust'),img=tile.querySelector('img');if(!canvas||!img)return;
  canvas.width=120;canvas.height=120;const ctx=canvas.getContext('2d');
  const pts=Array.from({length:82},(_,i)=>{const a=i*2.39996,r=16+Math.sqrt(i/82)*37;return {x:60+Math.cos(a)*r,y:60+Math.sin(a)*r,tx:40+Math.random()*40,ty:30+Math.random()*60}});
  let raf=0,start=0;
  function frame(t){if(!start)start=t;const f=Math.min(1,(t-start)/560),ease=1-(1-f)**3;ctx.clearRect(0,0,120,120);ctx.fillStyle=getComputedStyle(tile).getPropertyValue('--tool').trim()||'#3b9cc1';
   for(const pt of pts){const x=pt.x+(pt.tx-pt.x)*ease,y=pt.y+(pt.ty-pt.y)*ease;ctx.globalAlpha=Math.min(.75,1-f*.95);ctx.fillRect(x,y,1.2+f*1.5,1.2+f*1.5)}ctx.globalAlpha=1;
   if(f<1)raf=requestAnimationFrame(frame);else img.style.opacity='.88';
  }
  tile.addEventListener('pointerenter',()=>{if(reduce.matches)return;cancelAnimationFrame(raf);start=0;img.style.opacity='0';raf=requestAnimationFrame(frame)});
  tile.addEventListener('pointerleave',()=>{cancelAnimationFrame(raf);start=0;ctx.clearRect(0,0,120,120);img.style.opacity='.85'});
 });
}
decorateToolDust();
function openProject(id,focusEl){const item=DATA[id];if(!item||!viewer)return;returnFocus=focusEl||returnFocus;activeProject=id;$('viewer-area').textContent=item.kind;$('viewer-title').textContent=item.title;$('viewer-deck').textContent=item.deck||'';$('viewer-description').textContent=item.description||'';$('viewer-role').textContent=item.role||'';$('viewer-results').textContent=item.results||'Pieza final entregada.';$('viewer-tools').textContent=item.tools||'Herramientas documentadas en el proyecto';$('viewer-note').textContent=item.note||'';makeMedia(item);let index=activeItems.indexOf(id);$('viewer-count').textContent=`${index+1} / ${activeItems.length}`;$('viewer-prev').disabled=index<=0;$('viewer-next').disabled=index>=activeItems.length-1;
if(item.type==='video'){
 wasPlaying=wasPlaying||musicIsPlaying();
 pauseMusicForVideo();
}else if(viewer.open&&pausedForProjectVideo){
 pausedForProjectVideo=false;wasPlaying=false;
 requestMusic();
}
if(!viewer.open)viewer.showModal();$('viewer-close').focus();soundEffect('click')}
function closeProject(){if(!viewer.open)return;$('viewer-media').replaceChildren();viewer.close();activeProject=null;pausedForProjectVideo=false;wasPlaying=false;requestMusic();if(returnFocus?.isConnected)returnFocus.focus()}
$('viewer-close').addEventListener('click',closeProject);viewer.addEventListener('cancel',e=>{e.preventDefault();closeProject()});viewer.addEventListener('click',e=>{if(e.target===viewer)closeProject()});
function moveProject(delta){const i=activeItems.indexOf(activeProject),target=activeItems[i+delta];if(target){$('viewer-media').replaceChildren();openProject(target,returnFocus)}}
$('viewer-prev').addEventListener('click',()=>moveProject(-1));$('viewer-next').addEventListener('click',()=>moveProject(1));
$('work-return-top').addEventListener('click',()=>{workMain.scrollTo({top:0,behavior:reduce.matches?'instant':'smooth'});soundEffect('click')});

// Preserves natural browser navigation; direct #video/#diseno URLs work on Pages.
routeByHash();
})();
