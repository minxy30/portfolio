(() => {
  'use strict';
  const data = window.PORTFOLIO_DATA || {};
  const dialog = document.getElementById('viewer');
  const stage = document.getElementById('viewer-stage');
  const menu = document.getElementById('site-nav');
  const menuButton = document.getElementById('menu-toggle');
  let previousFocus = null;
  let currentGallery = null;
  let pointerStart = null;

  const assign = (id, content) => { document.getElementById(id).textContent = content || ''; };
  function frameFor(provider, id, title) {
    if (!/^[a-zA-Z0-9_-]{8,}$/.test(id)) throw new Error('ID de video no válido');
    const el = document.createElement('iframe');
    el.title = 'Reproductor de ' + title;
    el.allowFullscreen = true;
    el.allow = 'autoplay; encrypted-media; fullscreen; picture-in-picture; web-share';
    el.referrerPolicy = 'strict-origin-when-cross-origin';
    el.src = provider === 'youtube'
      ? 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0&playsinline=1'
      : 'https://drive.google.com/file/d/' + id + '/preview';
    return el;
  }
  function makeVideo(item) {
    const viewport = document.createElement('div');
    viewport.className = 'stage-player' + (item.aspect === 'portrait' ? ' vertical' : '');
    const startId = item.clips ? item.clips[0].id : item.id;
    viewport.appendChild(frameFor(item.platform, startId, item.title));
    stage.appendChild(viewport);
    if (item.clips?.length > 1) {
      const choices = document.createElement('div');
      choices.className = 'clip-controls';
      item.clips.forEach((clip, index) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = clip.label;
        button.setAttribute('aria-pressed', String(index === 0));
        button.addEventListener('click', () => {
          choices.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', 'false'));
          button.setAttribute('aria-pressed', 'true');
          viewport.replaceChildren(frameFor('youtube', clip.id, item.title + ' ' + clip.label));
        });
        choices.appendChild(button);
      });
      stage.appendChild(choices);
    }
    const note = document.createElement('p');
    note.className = 'stage-note';
    note.textContent = item.platform === 'drive' ? 'Reproductor de Google Drive · Requiere acceso de lectura al archivo.' : 'Reproductor integrado de YouTube.';
    stage.appendChild(note);
  }
  function makeGallery(item) {
    currentGallery = { images:item.images, index:0, title:item.title };
    const container = document.createElement('div');container.className = 'gallery-image-wrap';
    const pic = document.createElement('img');pic.className = 'gallery-image';pic.alt = 'Pieza 1 de ' + item.title;pic.draggable=false;
    container.appendChild(pic);stage.appendChild(container);
    const controls = document.createElement('div'); controls.className = 'gallery-controls';
    const prev = document.createElement('button'), next = document.createElement('button'), count = document.createElement('span');
    prev.type='button';prev.textContent='‹';prev.setAttribute('aria-label','Diseño anterior');
    next.type='button';next.textContent='›';next.setAttribute('aria-label','Diseño siguiente');
    count.setAttribute('aria-live','polite');
    controls.append(prev,count,next);stage.appendChild(controls);
    function draw(){if(!currentGallery)return;pic.src = currentGallery.images[currentGallery.index];pic.alt = 'Pieza ' + (currentGallery.index+1) + ' de ' + currentGallery.images.length + ': ' + currentGallery.title;count.textContent = (currentGallery.index+1) + ' / ' + currentGallery.images.length;}
    const slide = dir => {currentGallery.index=(currentGallery.index+dir+currentGallery.images.length)%currentGallery.images.length;draw();};
    prev.addEventListener('click',()=>slide(-1)); next.addEventListener('click',()=>slide(1));
    container.addEventListener('touchstart',e=>{pointerStart=e.changedTouches[0]?.clientX ?? null},{passive:true});
    container.addEventListener('touchend',e=>{if(pointerStart===null)return;const delta=e.changedTouches[0].clientX-pointerStart;pointerStart=null;if(Math.abs(delta)>44)slide(delta<0?1:-1)},{passive:true});
    currentGallery.slide=slide; draw();
  }
  function openProject(id){
    const item = data[id];if(!item)return;
    previousFocus=document.activeElement;
    assign('viewer-kind',item.kind); assign('viewer-title',item.title); assign('viewer-deck',item.deck);
    assign('viewer-description',item.description); assign('viewer-role',item.role);
    assign('viewer-notice',item.type==='video'&&item.platform==='drive'?'La reproducción depende de los permisos del archivo en Drive.':'');
    currentGallery=null;stage.replaceChildren();
    if(item.type==='video')makeVideo(item);else makeGallery(item);
    dialog.showModal();document.getElementById('viewer-close').focus();
  }
  function closeProject(){if(dialog.open)dialog.close();}
  document.querySelectorAll('[data-open]').forEach(el=>el.addEventListener('click',()=>openProject(el.dataset.open)));
  document.getElementById('viewer-close').addEventListener('click',closeProject);
  dialog.addEventListener('click',e=>{if(e.target===dialog)closeProject()});
  dialog.addEventListener('close',()=>{stage.replaceChildren();currentGallery=null;if(previousFocus?.focus)previousFocus.focus()});
  dialog.addEventListener('keydown',e=>{if(currentGallery&&e.key==='ArrowRight'){e.preventDefault();currentGallery.slide(1)}else if(currentGallery&&e.key==='ArrowLeft'){e.preventDefault();currentGallery.slide(-1)}});
  menuButton.addEventListener('click',()=>{const open=menu.classList.toggle('open');menuButton.setAttribute('aria-expanded',String(open));menuButton.setAttribute('aria-label',open?'Cerrar menú':'Abrir menú')});
  document.querySelectorAll('.site-nav a').forEach(link=>link.addEventListener('click',()=>{menu.classList.remove('open');menuButton.setAttribute('aria-expanded','false')}));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu.classList.contains('open')){menu.classList.remove('open');menuButton.setAttribute('aria-expanded','false')}});
  if('IntersectionObserver' in window){const navlinks=document.querySelectorAll('.site-nav a');const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){navlinks.forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+entry.target.id))}})},{rootMargin:'-22% 0px -66% 0px'});['trabajos','diseno','perfil'].forEach(id=>{const node=document.getElementById(id);if(node)observer.observe(node)})}
})();
