(()=>{const d=window.PORTFOLIO_DATA||{};if(d['copy-sm']){d['copy-sm'].title='Contenido editorial y automatización';d['copy-sm'].deck='Publicaciones y artículos para Smarketing 360';d['copy-sm'].description='Selección de publicaciones y artículos desarrollados para la web de Smarketing 360.';d['copy-sm'].role='Antes redactaba directamente algunos contenidos. Actualmente implemento métodos para automatizar la producción con IA y reviso/edito los resultados; cuando el tema requiere una voz propia, escribo el texto personalmente.';d['copy-sm'].tools='Redacción · IA · Automatización editorial';d['copy-sm'].note='Artículos: https://blog.smarketing360.lat/2025/09/22/blog-smarketing360-lat-2025-09-22-borrador-automatico/ · https://blog.smarketing360.lat/2026/08/05/geo-la-nueva-estrategia-que-podria-reemplazar-parte-del-seo-tradicional/ · https://blog.smarketing360.lat/2026/06/15/tendencias-y-actualizaciones-de-marketing-que-estan-marcando-2026/ · https://blog.smarketing360.lat/2025/11/28/arquitectura-de-audiencias-como-construir-clusters-predictivos-con-ia/';}if(d['copy-wbmf']){d['copy-wbmf'].role='Contenido editorial desarrollado para marca; parte de la producción actual se automatiza con IA mediante métodos implementados para mantener consistencia, revisión y ritmo de publicación.';d['copy-wbmf'].tools='Copywriting · IA · Automatización editorial';}const a=(id,title,url,img)=>d[id]={title,kind:"Artículo web · Smarketing 360",deck:"Publicación web",description:"Artículo publicado en el blog de Smarketing 360.",role:"Redacción y/o automatización editorial según el proceso documentado.",type:"gallery",images:[img],tools:"WordPress · IA · Automatización",results:"Artículo publicado.",externalUrl:url};a("article-borrador","Borrador automático","https://blog.smarketing360.lat/2025/09/22/blog-smarketing360-lat-2025-09-22-borrador-automatico/","assets/images/smarketing-mexico.webp");a("article-geo","GEO: la nueva estrategia","https://blog.smarketing360.lat/2026/08/05/geo-la-nueva-estrategia-que-podria-reemplazar-parte-del-seo-tradicional/","assets/images/smarketing-historia-1.webp");a("article-tendencias","Tendencias de marketing 2026","https://blog.smarketing360.lat/2026/06/15/tendencias-y-actualizaciones-de-marketing-que-estan-marcando-2026/","assets/images/smarketing-historia-2.webp");a("article-audiencias","Arquitectura de audiencias con IA","https://blog.smarketing360.lat/2025/11/28/arquitectura-de-audiencias-como-construir-clusters-predictivos-con-ia/","assets/images/smarketing-historia-3.webp");})();
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
   const preview=document.createElement('iframe');
   preview.className='copy-preview-frame';preview.src=url;preview.tabIndex=-1;
   preview.setAttribute('aria-hidden','true');preview.setAttribute('loading','lazy');
   preview.setAttribute('referrerpolicy','strict-origin-when-cross-origin');
   preview.setAttribute('sandbox','allow-same-origin allow-scripts');
   frame.appendChild(preview);
   const labelTag=document.createElement('span');labelTag.className='copy-preview-label';labelTag.textContent='VISTA DE LA PÁGINA';frame.appendChild(labelTag);
  });
 }
 const obs=new MutationObserver(()=>{if(location.hash.includes('copywriter'))decorate()});
 document.addEventListener('DOMContentLoaded',()=>{const grid=document.getElementById('work-grid');if(grid)obs.observe(grid,{childList:true});decorate()});
})();
