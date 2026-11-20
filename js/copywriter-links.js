(()=>{const d=window.PORTFOLIO_DATA||{};const a=(id,title,url)=>d[id]={title,kind:"Artículo web · Smarketing 360",deck:"Contenido web publicado",description:"Artículo publicado en WordPress con contenido e imágenes integradas para su lectura en web.",role:["Redacción y edición del contenido en WordPress","Colocación de imágenes: recursos de Google o imágenes apoyadas por ChatGPT, según la pieza","En artículos puntuales, ajustes básicos de HTML y CSS para integrar recursos multimedia"],type:"gallery",images:[],tools:"WordPress · Redacción · Gestión de imágenes",results:"Artículo publicado; incluye enlace de respaldo si su sitio de origen bloquea la vista interna.",externalUrl:url};a("article-borrador","De borrador a publicación","https://blog.smarketing360.lat/2025/09/22/blog-smarketing360-lat-2025-09-22-borrador-automatico/");a("article-geo","GEO, la nueva ruta","https://blog.smarketing360.lat/2026/08/05/geo-la-nueva-estrategia-que-podria-reemplazar-parte-del-seo-tradicional/");a("article-tendencias","Qué está moviendo el marketing","https://blog.smarketing360.lat/2026/06/15/tendencias-y-actualizaciones-de-marketing-que-estan-marcando-2026/");a("article-audiencias","Audiencias que sí conectan","https://blog.smarketing360.lat/2025/11/28/arquitectura-de-audiencias-como-construir-clusters-predictivos-con-ia/");d['content-grid-the-homes']={title:'De idea a calendario: The Homes',kind:'Parrilla de contenido · The Homes',deck:'Planeación para aprobación de cliente',description:'Parrilla desarrollada en Canva para presentar los contenidos, recibir la aprobación del cliente y preparar su programación posterior.',role:['Conceptualización y redacción de contenidos','Organización de la parrilla en Canva y exportación a PDF','Preparación posterior para programación en Metricool tras la aprobación'],type:'document',documentUrl:'https://drive.google.com/file/d/1REitML8_frUpCG9GA3NC2UImrET5Oats/preview',tools:'Canva · Redacción · Metricool',results:'Parrilla real de contenido disponible para revisión.'};d['content-grid-wbmf']={title:'Titulares que vuelven contenido',kind:'Contenido editorial · WBMF',deck:'Noticias convertidas en publicaciones',description:'Producción editorial de noticias convertidas en mensajes claros y breves para las redes de la marca.',role:['Investigación y selección de temas','Redacción de titulares, textos y copies','Planeación de publicaciones según el calendario editorial'],type:'gallery',images:['assets/images/wbmf-fanta.webp','assets/images/wbmf-london.webp'],tools:'Redacción · Canva · Planeación editorial',results:'Contenido editorial pensado para su publicación en redes.'};})();
/* Article reader: keeps visitors inside the portfolio. External sites may prohibit framing. */
(()=>{
 const safeUrl=u=>{try{const x=new URL(u);return x.protocol==='https:'&&x.hostname==='blog.smarketing360.lat'?x.href:null}catch{return null}};
 let dialog=null,lastTrigger=null;
 function ensureDialog(){
  if(dialog)return dialog;
  dialog=document.createElement('dialog');dialog.className='copy-article-dialog';
  dialog.setAttribute('aria-labelledby','copy-article-title');
  dialog.innerHTML='<div class="copy-article-shell"><header class="copy-article-toolbar"><span id="copy-article-title"></span><button type="button" class="copy-article-close" aria-label="Cerrar artículo">Cerrar ×</button></header><div class="copy-article-message">Leyendo el artículo desde su página original. Si el sitio impide mostrarlo aquí, puedes utilizar el enlace de respaldo.</div><iframe class="copy-article-frame" title="Artículo web" loading="eager" referrerpolicy="strict-origin-when-cross-origin"></iframe><footer class="copy-article-footer"><a class="copy-article-external" target="_blank" rel="noopener noreferrer">Abrir artículo original ↗</a><span>La visualización depende de los permisos del sitio de origen.</span></footer></div>';
  document.body.appendChild(dialog);
  dialog.querySelector('.copy-article-close').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});
  dialog.addEventListener('close',()=>{dialog.querySelector('iframe').src='about:blank';lastTrigger?.focus();document.body.classList.remove('copy-article-open')});
  return dialog;
 }
 window.openCopywriterArticle=(item,trigger)=>{
  const url=safeUrl(item.externalUrl);if(!url)return;
  lastTrigger=trigger;const d=ensureDialog();
  d.querySelector('#copy-article-title').textContent=item.title;
  d.querySelector('iframe').src=url;
  d.querySelector('a').href=url;
  document.body.classList.add('copy-article-open');
  if(!d.open)d.showModal();
 };
 // Live scaled page previews; retain the original image as a fallback underneath.
 function decorate(){
  document.querySelectorAll('#work-grid .project-card').forEach(card=>{
   if(card.dataset.articlePreview)return;
   const btn=card.querySelector('.project-open');
   const label=card.querySelector('.project-caption strong')?.textContent;
   const item=Object.values(window.PORTFOLIO_DATA||{}).find(x=>x.externalUrl&&x.title===label);
   const url=item&&safeUrl(item.externalUrl);if(!url)return;
   card.dataset.articlePreview='1';
   const frame=card.querySelector('.project-image');if(!frame)return;
   frame.classList.add('copy-live-preview');
   frame.querySelectorAll('img,.image-no-preview').forEach(el=>el.remove());
   const cover=document.createElement('div');cover.className='copy-article-cover';
   cover.innerHTML='<div class="copy-cover-browser"><span>● ● ●</span><span>blog.smarketing360.lat</span></div><div class="copy-cover-content"><span class="copy-cover-brand">smarketing<span>360</span></span><span class="copy-cover-kicker">ARTÍCULO WEB</span><strong></strong><small>Vista del artículo · Abrir para leer</small></div>';
   cover.querySelector('strong').textContent=item.title;
   frame.appendChild(cover);
   const preview=document.createElement('iframe');
   preview.className='copy-preview-frame';preview.src=url;preview.tabIndex=-1;
   preview.setAttribute('aria-hidden','true');preview.setAttribute('loading','lazy');
   preview.setAttribute('referrerpolicy','strict-origin-when-cross-origin');
   preview.setAttribute('sandbox','allow-same-origin allow-scripts');
   /* Embedded page may be blocked; never expose unrelated portfolio artwork as fallback. */
   frame.appendChild(preview);
   const labelTag=document.createElement('span');labelTag.className='copy-preview-label';labelTag.textContent='VISTA DE LA PÁGINA';frame.appendChild(labelTag);
  });
 }
 const obs=new MutationObserver(()=>{if(location.hash.includes('copywriter'))decorate()});
 document.addEventListener('DOMContentLoaded',()=>{const grid=document.getElementById('work-grid');if(grid)obs.observe(grid,{childList:true});decorate()});
})();
