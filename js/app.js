(() => {
'use strict';
const $=id=>document.getElementById(id);
const DATA=window.PORTFOLIO_DATA||{};
const CFG=window.YAZMIN_SITE_CONFIG||{};
const CATS=[
 {id:'video',label:'Video',title:'Edición de video',intro:'',desc:'',icon:'▷',filters:[['all','Todo'],['youtube','YouTube'],['marcas','Marcas'],['motion','Motion Graphic'],['ia','Producción con IA']],items:[['benito-1','youtube'],['benito-2','youtube'],['benito-3','youtube'],['benito-4','youtube'],['zaru','ia'],['smarketing','ia'],['casita','marcas'],['minsis','motion']]},
 {id:'diseno',label:'Diseño',title:'Diseño visual',intro:'',desc:'Composición, narrativas gráficas y publicaciones para marcas.',icon:'✎',filters:[['all','Todo'],['editorial','Editorial'],['carrusel','Carruseles'],['marcas','Marcas']],items:[['potencial','carrusel'],['omar','carrusel'],['editorial','editorial'],['wbmf','editorial'],['sabias','marcas']]},
 {id:'fotografia',label:'Fotografía',title:'Fotografía',intro:'',desc:'Fotografía conceptual y retratos.',icon:'◎',filters:[['all','Todo'],['conceptual','Conceptual'],['retrato','Retratos']],items:[['foto-halloween','retrato'],['foto-terror','conceptual']]},
 {id:'copywriter',label:'Copywriter',title:'Copywriter',intro:'',desc:'Copies, mensajes editoriales y parrillas de contenido.',icon:'≡',filters:[['all','Todo'],['redes','Redes sociales'],['editorial','Editorial']],items:[['copy-sm','redes'],['copy-wbmf','editorial']]},
 {id:'about',label:'Sobre mí',title:'Sobre mí',intro:'Detrás de cada idea',desc:'Mi perfil, herramientas y enfoque creativo.',icon:'✳',filters:[],items:[]}
];
const catById=Object.fromEntries(CATS.map(c=>[c.id,c]));
let activeCategory=null,activeFilter='all',activeItems=[],activeProject=null,stage=0,locked=false,visitorSound=true,wasPlaying=false,audioCtx=null,toastTimer=0,scrollLock=0,returnFocus=null;
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
const collageAssets=[
 ['assets/images/poster-thehomes.webp','VIDEO / THE HOMES'],
 ['assets/images/smarketing-historia-1.webp','CONTENIDO'],
 ['assets/images/omar-1.webp','DISEÑO'],
 ['assets/images/foto-terror.webp','FOTOGRAFÍA'],
 ['assets/images/poster-casita.webp','VIDEO'],
 ['assets/images/sabias-1.webp','CARRUSEL'],
 ['assets/images/fotografia-halloween-02.webp','RETRATO'],
 ['assets/images/thehomes-3.webp','CAMPAÑA'],
 ['assets/images/poster-minsis.webp','MOTION'],
 ['assets/images/wbmf-fanta.webp','EDITORIAL'],
 ['assets/images/omar-3.webp','DISEÑO'],
 ['assets/images/smarketing-mexico.webp','CONTENIDO'],
 ['assets/images/fotografia-halloween-05.webp','FOTOGRAFÍA'],
 ['assets/images/thehomes-1.webp','CAMPAÑA'],
 ['assets/images/sabias-3.webp','CARRUSEL'],
 ['assets/images/wbmf-london.webp','EDITORIAL'],
 ['assets/images/poster-smarketing.webp','VIDEO'],
 ['assets/images/fotografia-halloween-04.webp','RETRATO'],
 ['assets/images/omar-2.webp','DISEÑO'],
 ['assets/images/fotografia-halloween-01.webp','FOTOGRAFÍA'],
 ['assets/images/thehomes-2.webp','CAMPAÑA'],
 ['assets/images/smarketing-historia-2.webp','CONTENIDO'],
 ['assets/images/sabias-2.webp','CARRUSEL'],
 ['assets/images/fotografia-halloween-06.webp','RETRATO'],
 ['assets/images/thehomes-4.webp','CAMPAÑA'],
 ['assets/images/smarketing-historia-3.webp','CONTENIDO'],
 ['assets/images/fotografia-halloween-03.webp','RETRATO']
];
// Published editing examples already present in the projects catalog.
// Embedded video is optional: image previews remain as graceful fallbacks.
const collageVideoSamples=[
 {id:'6-oAd_46hvQ',label:'VIDEO / EDICIÓN'},
 {id:'IPPXTg9O-Bs',label:'VIDEO / YOUTUBE'}
];
let collageTimer=0;
let collageTick=0;
const collageCards=[];
const collageReduced=matchMedia('(prefers-reduced-motion: reduce)');
const collageMobile=matchMedia('(max-width: 740px)');
function makeCollageCard(row,col,copy){
 const index=(row*9+col*5+(col%3)*2)%collageAssets.length;
 const [src,label]=collageAssets[index];
 const figure=document.createElement('figure');
 figure.className='entry-collage-tile';
 figure.dataset.row=String(row);
 const ratio=[.64,.78,1,1.23,1.47,1.72][(row*3+col*5)%6];
 const width=148+((col*31+row*47)%95);
 const height=Math.round(width/ratio);
 figure.style.setProperty('--card-w',width+'px');
 figure.style.setProperty('--card-ratio',String(ratio));
 figure.style.setProperty('--tilt',(((col*7+row*9)%13)-6)+'deg');
 figure.style.setProperty('--jitter-x','0px');
 figure.style.setProperty('--jitter-y','0px');
 figure.style.setProperty('--jitter-scale','1');
 figure.style.setProperty('--card-h',height+'px');
 const image=document.createElement('img');
 image.src=src;image.alt='';image.loading=col<8?'eager':'lazy';image.decoding='async';
 figure.appendChild(image);
 const videoSlot=copy===0&&((row===1&&col===2)||(row===3&&col===4));
 if(videoSlot&&!collageReduced.matches&&!collageMobile.matches){
  const spec=collageVideoSamples[row===1?0:1];
  const iframe=document.createElement('iframe');
  iframe.className='entry-collage-video';
  iframe.title='Vista previa de video sin sonido';
  iframe.setAttribute('aria-hidden','true');
  iframe.tabIndex=-1;
  iframe.loading='eager';
  iframe.referrerPolicy='strict-origin-when-cross-origin';
  iframe.allow='autoplay; encrypted-media; picture-in-picture';
  iframe.src='https://www.youtube-nocookie.com/embed/'+spec.id+
   '?autoplay=1&mute=1&controls=0&loop=1&playlist='+spec.id+
   '&playsinline=1&rel=0&disablekb=1&iv_load_policy=3';
  figure.appendChild(iframe);
  figure.classList.add('entry-collage-tile--video');
  figure.dataset.fallback=src;
 }
 const cap=document.createElement('figcaption');
 cap.textContent=videoSlot?'VIDEO / EDICIÓN':label;
 figure.appendChild(cap);
 // Never modify card dimensions across duplicated groups: marquee stays seamless.
 if(!videoSlot)collageCards.push(figure);
 return figure;
}
function initCollage(){
 if(!collageRoot)return;
 const fragment=document.createDocumentFragment();
 for(let row=0;row<5;row++){
  const lane=document.createElement('div');
  lane.className='entry-collage-lane entry-collage-lane--'+row;
  lane.style.setProperty('--speed',(17+row*5)+'s');
  const track=document.createElement('div');
  track.className='entry-collage-track';
  for(let copy=0;copy<2;copy++)
   for(let col=0;col<14;col++)track.appendChild(makeCollageCard(row,col,copy));
  lane.appendChild(track);fragment.appendChild(lane);
 }
 collageRoot.replaceChildren(fragment);
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
    const [newSrc,newLabel]=collageAssets[(Math.random()*collageAssets.length)|0];
    const img=tile.querySelector('img');
    img.src=newSrc;
    tile.querySelector('figcaption').textContent=newLabel;
   }
   tile.classList.remove('is-glint');
   void tile.offsetWidth;
   tile.classList.add('is-glint');
  }
 },780);
 document.addEventListener('visibilitychange',()=>{
  collageRoot.classList.toggle('is-paused',document.hidden);
 });
}
initCollage();

// Original, procedural fantasy / organic-house intro bed:
// 103 BPM, soft kick, moving warm pads, gentle bass and air textures, no vocals.
// Attempts autoplay only when the browser permits it; otherwise the entry click
// unlocks the audio and plays a short fantasy-house transition.
const introBeat=60/103,introBar=introBeat*4;
let introAudio=null,introMaster=null,introNextTime=0,introBarCount=0,introTicker=0,introRunning=true,introNoise=null;
const introChords=[
 [174.61,207.65,261.63,311.13],
 [155.56,196,233.08,311.13],
 [138.59,174.61,207.65,261.63],
 [155.56,196,261.63,293.66],
 [174.61,207.65,261.63,349.23],
 [146.83,174.61,233.08,311.13],
 [138.59,174.61,220,261.63],
 [155.56,196,233.08,293.66]
];
function introTone(ac,hz,when,duration,gain,type='sine',dest=introMaster){
 const osc=ac.createOscillator(),amp=ac.createGain();
 osc.type=type;osc.frequency.setValueAtTime(hz,when);
 amp.gain.setValueAtTime(.0001,when);
 amp.gain.exponentialRampToValueAtTime(Math.max(.00011,gain),when+.06);
 amp.gain.exponentialRampToValueAtTime(.0001,when+duration);
 osc.connect(amp);amp.connect(dest);osc.start(when);osc.stop(when+duration+.025);
}
function introKick(ac,when){
 const osc=ac.createOscillator(),amp=ac.createGain();
 osc.type='sine';osc.frequency.setValueAtTime(120,when);
 osc.frequency.exponentialRampToValueAtTime(47,when+.17);
 amp.gain.setValueAtTime(.0001,when);
 amp.gain.exponentialRampToValueAtTime(.07,when+.006);
 amp.gain.exponentialRampToValueAtTime(.0001,when+.29);
 osc.connect(amp);amp.connect(introMaster);osc.start(when);osc.stop(when+.31);
}
function introShimmer(ac,when,gain=.006){
 if(!introNoise){
  introNoise=ac.createBuffer(1,Math.round(ac.sampleRate*.16),ac.sampleRate);
  const samples=introNoise.getChannelData(0);
  for(let i=0;i<samples.length;i++)samples[i]=Math.random()*2-1;
 }
 const noise=ac.createBufferSource(),filter=ac.createBiquadFilter(),amp=ac.createGain();
 noise.buffer=introNoise;filter.type='highpass';filter.frequency.value=2300;
 amp.gain.setValueAtTime(.0001,when);
 amp.gain.exponentialRampToValueAtTime(gain,when+.006);
 amp.gain.exponentialRampToValueAtTime(.0001,when+.115);
 noise.connect(filter);filter.connect(amp);amp.connect(introMaster);
 noise.start(when);noise.stop(when+.13);
}
function scheduleIntroBar(ac,time,index){
 const chord=introChords[index%introChords.length];
 const voicing=(Math.floor(index/8)%3);
 chord.forEach((hz,i)=>{
  // Pads change subtly each eight bars; no distracting piano melody.
  introTone(ac,hz*(voicing===1&&i===3?2:1),time,Math.min(introBar*1.42,3.3),.0125, i%2?'triangle':'sine');
 });
 for(let b=0;b<4;b++){
  introKick(ac,time+introBeat*b);
  if(b%2===1)introShimmer(ac,time+introBeat*b,.006);
  if(b===0||b===2)introTone(ac,chord[0]/2,time+introBeat*b,introBeat*.8,.025,'sine');
  introShimmer(ac,time+introBeat*(b+.5),.003);
 }
 if(index%4===2)introTone(ac,chord[2]*2,time+introBeat*2.65,introBeat*2,.006,'sine');
}
function scheduleIntroMusic(){
 if(!introRunning)return;
 const ac=introAudio;
 if(!ac||ac.state!=='running')return;
 if(introNextTime<ac.currentTime-.2)introNextTime=ac.currentTime+.05;
 while(introNextTime<ac.currentTime+.4){
  scheduleIntroBar(ac,introNextTime,introBarCount++);
  introNextTime+=introBar;
 }
}
function startIntroMusic(){
 if(!introRunning)return;
 const ac=context();if(!ac)return;
 introAudio=ac;
 if(!introMaster){
  introMaster=ac.createGain();introMaster.gain.value=.38;
  introMaster.connect(ac.destination);
 }
 if(!introTicker)introTicker=window.setInterval(scheduleIntroMusic,130);
 scheduleIntroMusic();
}
function fadeIntroMusic(){
 const ac=introAudio;
 if(!ac||!introMaster)return;
 const now=ac.currentTime;
 introMaster.gain.cancelScheduledValues(now);
 introMaster.gain.setValueAtTime(introMaster.gain.value,now);
 introMaster.gain.linearRampToValueAtTime(.0001,now+1.75);
 window.setTimeout(()=>{
  introRunning=false;
  if(introTicker)window.clearInterval(introTicker);
  introTicker=0;
 },1900);
}
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
 startIntroMusic();
 scheduleIntroMusic();
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
 const speed=reduce.matches?130:1840;
 window.setTimeout(()=>{
  entryGate.hidden=true;
  document.body.classList.remove('entering-portfolio');
  entryButton.disabled=false;
  const focusTarget=document.body.dataset.screen==='home'?document.querySelector('.paper-about'):$('back-home');
  focusTarget?.focus({preventScroll:true});
 },speed);
}
entryButton.addEventListener('click',enterPortfolio);
entryButton.focus({preventScroll:true});

// The background video only supplements the particle field and has no soundtrack.
if(CFG.backgroundVideoSrc){const v=$('background-video');v.src=CFG.backgroundVideoSrc;v.classList.add('has-source');v.play().catch(()=>{})}
// Home: exactly three scenes in one fixed plane. Wheel/touch replace panels instead of scrolling a document.
const scenes=[$('scene-entrance'),$('scene-tools'),$('scene-contact')];
function showStage(n){if(document.body.classList.contains('pre-entry')||document.body.classList.contains('entering-portfolio'))return;n=Math.max(0,Math.min(2,n));if(n===stage||locked)return;locked=true;soundEffect('reveal');scenes[stage].classList.remove('is-active');scenes[stage].inert=true;stage=n;scenes[stage].inert=false;scenes[stage].classList.add('is-active');document.querySelectorAll('.stage-dot').forEach((dot,i)=>{dot.classList.toggle('is-active',i===stage);if(i===stage)dot.setAttribute('aria-current','step');else dot.removeAttribute('aria-current')});setTimeout(()=>{locked=false},600)}
for(const dot of document.querySelectorAll('[data-stage]'))dot.addEventListener('click',()=>showStage(+dot.dataset.stage));
for(const b of document.querySelectorAll('[data-next]'))b.addEventListener('click',()=>showStage(+b.dataset.next));
let wheelBuffer=0;
window.addEventListener('wheel',e=>{if(document.body.dataset.screen!=='home'||viewer.open)return;if(Math.abs(e.deltaY)<3)return;e.preventDefault();const now=Date.now();if(now-scrollLock<740)return;wheelBuffer+=e.deltaY;if(Math.abs(wheelBuffer)>=55){showStage(stage+(wheelBuffer>0?1:-1));scrollLock=now;wheelBuffer=0}},{passive:false});
let touchY=null;
$('home-deck').addEventListener('touchstart',e=>{touchY=e.touches[0]?.clientY??null},{passive:true});
$('home-deck').addEventListener('touchend',e=>{if(touchY==null||document.body.dataset.screen!=='home')return;const d=touchY-(e.changedTouches[0]?.clientY??touchY);touchY=null;if(Math.abs(d)>72)showStage(stage+(d>0?1:-1))},{passive:true});
window.addEventListener('keydown',e=>{if(viewer.open||document.body.dataset.screen!=='home')return;if(['ArrowDown','PageDown'].includes(e.key)){e.preventDefault();showStage(stage+1)}else if(['ArrowUp','PageUp'].includes(e.key)){e.preventDefault();showStage(stage-1)}});
function revealChange(callback,element){if(locked)return;locked=true;const pos=element?.getBoundingClientRect?.();const x=pos?pos.left+pos.width/2:innerWidth/2,y=pos?pos.top+pos.height/2:innerHeight/2;const light=$('light-reveal');light.style.setProperty('--cx',x+'px');light.style.setProperty('--cy',y+'px');soundEffect('reveal');if(reduce.matches){callback();locked=false;return}light.classList.remove('entering','leaving');void light.offsetWidth;light.classList.add('entering');setTimeout(()=>{callback();light.classList.remove('entering');light.classList.add('leaving');setTimeout(()=>{light.classList.remove('leaving');locked=false},530)},520)}
const aboutHTML=`<div class="about-editorial"><p class="eyebrow">PERFIL CREATIVO / CDMX</p><h2>Editar también es <em>contar historias.</em></h2><p class="about-lead">Soy Yazmin Moreno. Mi trabajo se mueve entre la edición audiovisual, el diseño gráfico y la creación de contenido para creadores y marcas.</p><p>Estudio Ingeniería en Comunicación Multimedia y busco desarrollar mi carrera en equipos de entretenimiento, música, cultura y producción audiovisual. La tecnología es una herramienta para mejorar lo que comunico, no el centro de mi perfil.</p><div class="about-cols"><div><h3>Lo que hago</h3><p>Edición narrativa · Montaje · Tratamiento sonoro · Composición visual · Contenido digital · Adaptación de formatos</p></div><div><h3>Herramientas</h3><p>Premiere Pro · CapCut · After Effects · Canva · Remotion · Herramientas creativas de IA</p></div></div><a class="about-cv" href="assets/docs/CV-Yazmin-Moreno.pdf" target="_blank" rel="noopener">Ver CV completo ↗</a></div>`;
function openAbout(){
  if(!aboutDialog)return;aboutReturnFocus=document.activeElement;
  if(!aboutDialog.open)aboutDialog.showModal();
  $('about-close').focus();soundEffect('click');
}
function closeAbout(){if(!aboutDialog?.open)return;aboutDialog.close();if(aboutReturnFocus?.isConnected)aboutReturnFocus.focus();soundEffect('click')}
$('about-close')?.addEventListener('click',closeAbout);
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
function renderRail(){const el=$('work-rail');el.replaceChildren();const ordered=[CATS[0],CATS[1],CATS[2],CATS[3],CATS[4]];for(const c of ordered){let b=document.createElement('button');b.type='button';b.className='rail-link'+(activeCategory===c.id?' is-active':'');b.setAttribute('aria-current',activeCategory===c.id?'page':'false');b.innerHTML=`<span class="rail-icon" aria-hidden="true">${c.icon}</span>${c.label}`;b.addEventListener('click',()=>route(c.id,b));el.appendChild(b)}}
function selectCategory(id){const c=catById[id];if(!c)return;activeCategory=id;$('brand-home').innerHTML=`${c.title} <span class="brand-divider">|</span> <span class="brand-suffix">Yazmin Moreno</span>`;$('header-home-icon').hidden=false;activeFilter='all';renderRail();$('work-heading').innerHTML=`${c.title} <span>| Yazmin Moreno</span>`;$('work-intro-title').textContent=c.intro;$('work-caption').textContent='TRABAJOS SELECCIONADOS / '+c.title.toUpperCase();$('work-intro-detail').textContent=c.desc;const tabs=$('work-tabs');tabs.replaceChildren();
if(id==='about'){const home=document.createElement('button');home.type='button';home.className='filter-chip active';home.textContent='Mi perfil';tabs.appendChild(home);$('work-grid').className='about-container';$('work-grid').innerHTML=aboutHTML;activeItems=[]}
else{$('work-grid').className='masonry';for(const [key,label]of c.filters){const b=document.createElement('button');b.type='button';b.className='filter-chip'+(key==='all'?' active':'');b.setAttribute('aria-pressed',String(key==='all'));b.textContent=label;b.addEventListener('click',()=>{activeFilter=key;tabs.querySelectorAll('button').forEach(x=>{x.classList.toggle('active',x===b);x.setAttribute('aria-pressed',String(x===b))});renderGrid()});tabs.appendChild(b)}renderGrid()}
workMain.scrollTop=0}
const posters={'benito-1':'https://i.ytimg.com/vi/6-oAd_46hvQ/hqdefault.jpg','benito-2':'https://i.ytimg.com/vi/SeXLp7olM2g/hqdefault.jpg','benito-3':'https://i.ytimg.com/vi/IPPXTg9O-Bs/hqdefault.jpg','benito-4':'https://i.ytimg.com/vi/4rEh5xkFjR4/hqdefault.jpg',benito:'https://i.ytimg.com/vi/6-oAd_46hvQ/hqdefault.jpg',zaru:'assets/images/poster-thehomes.webp',smarketing:'assets/images/poster-smarketing.webp',casita:'assets/images/poster-casita.webp',minsis:'assets/images/poster-minsis.webp'};
const aspects={'benito-1':'16/10','benito-2':'16/10','benito-3':'16/10','benito-4':'16/10','foto-halloween':'3/4',benito:'16/10',zaru:'9/16',smarketing:'9/16',casita:'9/16',minsis:'16/10',potencial:'1/1',omar:'4/5',editorial:'4/5',wbmf:'4/5',sabias:'4/5','foto-terror':'3/4','copy-sm':'4/5','copy-wbmf':'4/5'};
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
 }else if(item.images?.length){const stage=document.createElement('div');stage.className='gallery-stage';const pic=document.createElement('img');pic.alt=item.title;let index=0;pic.src=item.images[index];stage.appendChild(pic);const ctl=document.createElement('div');ctl.className='gallery-controls';const prev=document.createElement('button'),next=document.createElement('button'),count=document.createElement('span');prev.textContent='←';next.textContent='→';const update=()=>{pic.src=item.images[index];count.textContent=`${index+1} / ${item.images.length}`};prev.addEventListener('click',()=>{index=(index-1+item.images.length)%item.images.length;update();soundEffect()});next.addEventListener('click',()=>{index=(index+1)%item.images.length;update();soundEffect()});update();ctl.append(prev,count,next);if(item.images.length>1)stage.appendChild(ctl);
   let touchX=null;stage.addEventListener('touchstart',e=>{touchX=e.touches[0]?.clientX??null},{passive:true});stage.addEventListener('touchend',e=>{if(touchX==null)return;const dx=(e.changedTouches[0]?.clientX??touchX)-touchX;touchX=null;if(Math.abs(dx)>55){index=(index+(dx<0?1:-1)+item.images.length)%item.images.length;update();soundEffect('click')}},{passive:true});
   box.appendChild(stage)}
}
// Hover-only particle assembly reveals the actual brand logo after a soft dust burst.
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
