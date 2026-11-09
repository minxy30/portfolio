(() => {
  'use strict';
  const DATA=window.PORTFOLIO_DATA||{};
  const CONFIG=window.YAZMIN_SITE_CONFIG||{};
  const GROUPS={
    video:{label:'01 / VIDEO',title:'Historias en movimiento.',description:'Edición narrativa, campañas, motion y contenido audiovisual.',items:['benito','smarketing','zaru','casita','minsis']},
    diseno:{label:'02 / DISEÑO',title:'Ideas que toman forma.',description:'Diseño editorial y composiciones para marcas, cultura y redes.',items:['wbmf','editorial','potencial','sabias','omar']},
    fotografia:{label:'03 / FOTOGRAFÍA',title:'Mirar de otra forma.',description:'Exploraciones visuales y fotografía conceptual.',items:['foto-terror']},
    copywriter:{label:'04 / COPYWRITER',title:'Las palabras también cuentan.',description:'Muestras de parrillas, conceptos editoriales y adaptación de mensajes.',items:['copy-sm','copy-wbmf']}
  };
  const ALL=Object.entries(GROUPS).flatMap(([category,v])=>v.items.map(id=>({id,category})));
  const $=(s)=>document.querySelector(s),$$=(s)=>Array.from(document.querySelectorAll(s));
  const grid=$('#project-grid'),dialog=$('#viewer'),media=$('#viewer-media'),inside=$('#viewer-scroll');
  let activeCategory='video';let currentId=null;let lastFocus=null;let gallery=null;
  function safeText(id,content){const el=$('#'+id);if(el)el.textContent=content||''}
  function previewFor(id){const item=DATA[id];return item?.images?.[0]||({zaru:'assets/images/poster-thehomes.webp',smarketing:'assets/images/poster-smarketing.webp',casita:'assets/images/poster-casita.webp',minsis:'assets/images/poster-minsis.webp',benito:''})[id]||''}
  function makeTile(id,related=false){const item=DATA[id];if(!item)return document.createDocumentFragment();const wrap=document.createElement(related?'button':'article');wrap.className=related?'related-item':'tile'+(item.type==='video'?' tile-video':'');if(related)wrap.type='button';wrap.dataset.project=id;const btn=related?wrap:document.createElement('button');if(!related){btn.type='button';btn.className='tile-button';wrap.appendChild(btn)}
    const pic=document.createElement('div');pic.className=related?'related-thumb':'tile-preview';const imgSrc=previewFor(id);
    if(imgSrc){const img=document.createElement('img');img.src=imgSrc;img.alt='Vista previa: '+item.title;img.loading='lazy';img.decoding='async';pic.appendChild(img)}
    else{const art=document.createElement('div');art.className=related?'related-art':'tile-illustration';if(related){art.textContent='BC'}else{const s=document.createElement('small');s.textContent='EDICIÓN PARA YOUTUBE';const t=document.createElement('span');t.className='tile-art-type';t.innerHTML='Historias<br><em>con ritmo.</em>';art.append(s,t)}pic.appendChild(art)}
    if(!related){if(item.type==='video'){const shape=({zaru:'9/13',smarketing:'9/14',casita:'9/13',minsis:'4/3',benito:'4/5'})[id]||'4/5';pic.style.setProperty('--tile-ratio',shape);const play=document.createElement('span');play.className='tile-video-icon';play.textContent='▶';pic.appendChild(play)}else if(item.images?.length>1){const counter=document.createElement('span');counter.className='tile-count';counter.textContent=item.images.length+' piezas';pic.appendChild(counter)}}
    const info=document.createElement('div');if(related){const name=document.createElement('strong');name.textContent=item.title;const label=document.createElement('small');label.textContent=item.kind.split('·')[0].trim();info.append(name,label)}else{info.className='tile-label';const meta=document.createElement('span'),name=document.createElement('strong'),label=document.createElement('small'),arrow=document.createElement('span');name.textContent=item.title;label.textContent=item.kind;arrow.textContent='↗';arrow.className='tile-arrow';meta.append(name,label);info.append(meta,arrow)}btn.append(pic,info);
    btn.setAttribute('aria-label','Abrir proyecto: '+item.title);btn.addEventListener('click',()=>openProject(id));return wrap}
  function showCategory(name,scroll=false){if(!GROUPS[name])return;activeCategory=name;const content=GROUPS[name];safeText('category-eyebrow',content.label);safeText('category-title',content.title);safeText('category-description',content.description);
    grid.replaceChildren(...content.items.map(id=>makeTile(id)));
    $$('.category-tab').forEach(tab=>{const on=tab.dataset.category===name;tab.classList.toggle('active',on);tab.setAttribute('aria-selected',String(on))});$('#category-panel').setAttribute('aria-labelledby','tab-'+name);
    if(scroll){const destination=$('#biblioteca');destination.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth',block:'start'})}
  }
  $$('.category-tab').forEach(tab=>tab.addEventListener('click',()=>showCategory(tab.dataset.category)));
  $$('[data-category]').filter(el=>!el.classList.contains('category-tab')).forEach(el=>el.addEventListener('click',()=>showCategory(el.dataset.category,true)));
  $$('.category-tab').forEach(tab=>tab.addEventListener('keydown',e=>{if(e.key!=='ArrowLeft'&&e.key!=='ArrowRight')return;e.preventDefault();const names=Object.keys(GROUPS),i=names.indexOf(tab.dataset.category),next=names[(i+(e.key==='ArrowRight'?1:-1)+names.length)%names.length];showCategory(next);$('#tab-'+next).focus()}));
  function embed(provider,id,title){if(!/^[\w-]{8,}$/.test(id))return document.createTextNode('Video no disponible');const el=document.createElement('iframe');el.title='Reproductor: '+title;el.allowFullscreen=true;el.allow='autoplay; encrypted-media; fullscreen; picture-in-picture';el.loading='eager';el.referrerPolicy='strict-origin-when-cross-origin';el.src=provider==='youtube'?`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&playsinline=1`:`https://drive.google.com/file/d/${id}/preview`;return el}
  function renderVideo(item){const player=document.createElement('div');player.className='player-wrap'+(item.aspect==='portrait'?' portrait':'');const start=item.clips?.[0]?.id||item.id;player.appendChild(embed(item.platform,start,item.title));media.appendChild(player);
    if(item.clips?.length>1){const switches=document.createElement('div');switches.className='clip-choices';item.clips.forEach((clip,i)=>{const b=document.createElement('button');b.type='button';b.textContent=clip.label;b.setAttribute('aria-pressed',String(!i));b.addEventListener('click',()=>{switches.querySelectorAll('button').forEach(n=>n.setAttribute('aria-pressed','false'));b.setAttribute('aria-pressed','true');player.replaceChildren(embed(item.platform,clip.id,item.title))});switches.appendChild(b)});media.appendChild(switches)}
  }
  function renderGallery(item){gallery={index:0,item};const wrap=document.createElement('div');wrap.className='gallery-wrap';const img=document.createElement('img');img.alt=item.title+' · pieza 1';img.draggable=false;wrap.appendChild(img);media.appendChild(wrap);const ctr=document.createElement('div');ctr.className='gallery-controls';const prev=document.createElement('button'),count=document.createElement('span'),next=document.createElement('button');prev.type=next.type='button';prev.textContent='‹';next.textContent='›';prev.setAttribute('aria-label','Imagen anterior');next.setAttribute('aria-label','Imagen siguiente');count.setAttribute('aria-live','polite');ctr.append(prev,count,next);media.appendChild(ctr);
    const slide=(dir)=>{gallery.index=(gallery.index+dir+item.images.length)%item.images.length;img.src=item.images[gallery.index];img.alt=`${item.title} · imagen ${gallery.index+1} de ${item.images.length}`;count.textContent=`${gallery.index+1} / ${item.images.length}`};slide(0);prev.onclick=()=>slide(-1);next.onclick=()=>slide(1);gallery.slide=slide;
    let x=null;wrap.addEventListener('touchstart',e=>{x=e.changedTouches[0].clientX},{passive:true});wrap.addEventListener('touchend',e=>{if(x===null)return;const d=e.changedTouches[0].clientX-x;x=null;if(Math.abs(d)>40)slide(d<0?1:-1)},{passive:true});
  }
  function openProject(id){const item=DATA[id];if(!item)return;const isNew=!dialog.open;if(isNew)lastFocus=document.activeElement;currentId=id;gallery=null;media.replaceChildren();safeText('viewer-title',item.title);safeText('viewer-kind',item.kind);safeText('viewer-deck',item.deck);safeText('viewer-description',item.description);safeText('viewer-role',item.role);safeText('viewer-results',item.results);safeText('viewer-tools',item.tools);safeText('viewer-notice',item.platform==='drive'?'El video requiere permiso de lectura en Google Drive.':'');
    if(item.type==='video')renderVideo(item);else renderGallery(item);
    const alternatives=ALL.filter(x=>x.id!==id).sort((a,b)=>(a.category===activeCategory?-1:1)-(b.category===activeCategory?-1:1)).slice(0,4);$('#related-grid').replaceChildren(...alternatives.map(x=>makeTile(x.id,true)));
    $('#viewer-description-toggle').open=innerWidth>700; if(isNew){dialog.showModal();$('#viewer-close').focus()}inside.scrollTop=0;
  }
  function closeProject(){if(dialog.open)dialog.close()}
  $('#viewer-close').addEventListener('click',closeProject);$('#viewer-back').addEventListener('click',closeProject);
  dialog.addEventListener('click',e=>{if(e.target===dialog)closeProject()});
  dialog.addEventListener('close',()=>{media.replaceChildren();gallery=null;currentId=null;if(lastFocus?.focus)lastFocus.focus()});
  dialog.addEventListener('keydown',e=>{if(!gallery)return;if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();gallery.slide(e.key==='ArrowRight'?1:-1)}});
  // A video replaces the DOM iframe when closed, stopping playback immediately.
  const initial=location.hash.replace('#','');showCategory(GROUPS[initial]?initial:'video',false);
  let theme=null;try{theme=localStorage.getItem('ym-portfolio-theme')}catch{};if(theme==='dark')document.documentElement.dataset.theme='dark';$('#theme-toggle').addEventListener('click',()=>{const dark=document.documentElement.dataset.theme==='dark';document.documentElement.dataset.theme=dark?'light':'dark';try{localStorage.setItem('ym-portfolio-theme',dark?'light':'dark')}catch{}});
  if(CONFIG.heroVideoSrc){const v=$('#hero-video');v.src=CONFIG.heroVideoSrc;v.poster=CONFIG.heroVideoPoster||'';v.muted=true;v.loop=true;v.playsInline=true;v.addEventListener('canplay',()=>$('.hero').classList.add('has-video'),{once:true});v.addEventListener('error',()=>$('.hero').classList.remove('has-video'));v.play().catch(()=>{})}
  const hero=$('#portada'),ripple=$('#ripple-layer');let ripples=0;hero.addEventListener('pointerdown',e=>{if(e.pointerType==='touch'||e.target.closest('button,a'))return;if(matchMedia('(prefers-reduced-motion:reduce)').matches)return;if(ripples>3)return;const r=document.createElement('span');r.className='ripple';const rect=hero.getBoundingClientRect();r.style.left=e.clientX-rect.left+'px';r.style.top=e.clientY-rect.top+'px';ripple.appendChild(r);ripples++;r.addEventListener('animationend',()=>{r.remove();ripples--},{once:true})});
})();
