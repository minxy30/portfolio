# Portafolio de Yazmin Moreno — versión 4 (biblioteca visual)

Web estática en `minxy30/portfolio`, compatible con GitHub Pages. No requiere backend ni procesos de compilación.

## Cómo usarla

La portada artística tiene un retrato de fondo de manera provisional. Debajo se encuentra una biblioteca accesible con cinco destinos: Video, Diseño, Fotografía, Copywriter y Sobre mí. En móvil, una cuadrícula tipo Pinterest muestra proporciones diversas y permite explorar mediante el desplazamiento. Los proyectos se abren dentro del sitio; en escritorio el medio aparece a la izquierda y los detalles a la derecha, y en celular el medio está arriba, la descripción se despliega bajo él y hay trabajos relacionados debajo.

## Reemplazar manualmente el fondo por tu video (sin tocar el reproductor de proyectos)

1. Renderiza una secuencia original **silenciosa** de 5 a 12 s en MP4 H.264, en formato horizontal o adaptable, idealmente menos de 8 MB. Revisa cómo encuadra en celular.
2. En GitHub `minxy30/portfolio`, sube el archivo a `assets/hero/intro.mp4` usando `Add file` (crea la carpeta si no existe).
3. Abre `js/site-config.js`, cambia `heroVideoSrc: ''` por `heroVideoSrc: 'assets/hero/intro.mp4'` y confirma el cambio.
4. Si el archivo falla, el sistema conserva el retrato como fallback. La reproducción es **silenciosa**, automática y en bucle, solo como fondo decorativo. No se almacena un MP4 de ninguno de los proyectos: los visores siguen en Drive/YouTube.

## Contacto

El número de WhatsApp/llamada y correo provienen del CV facilitado por la autora. Si cambia el número o no desea hacerlo público, edita los enlaces del footer (`wa.me/`, `tel:`). 

## Verificaciones editoriales importantes

- Los favoritos de Benito Camelo identificados por la autora (Bolivia, México, Ormuz) **no han podido asociarse de forma inequívoca** a los enlaces enviados. Por tanto, el visor conserva tres enlaces publicados etiquetados solo como «Muestra 01/02/03», sin atribuirles esos títulos.
- Los archivos de Google Drive requieren que el titular autorice «Cualquier persona con el enlace → Lector»; la web no cambia permisos.
- Algunas piezas de Copywriter y Fotografía son muestras que necesitan precisar autoría textual y fotográfica antes de presentarlas como trabajo integral individual.
- Faltan resultados medibles documentados, por lo cual los textos hablan de entregas y procesos, no inventan indicadores.
- La música de fondo no está incluida por no contar aún con una composición original/licenciada. Prioridad: navegación rápida y silenciosa para reclutadores.

## Edición de obras

`projects.json` y `js/projects-data.js` contienen la misma selección; modifica **ambos** si actualizas textos o enlaces. En `js/app.js`, `GROUPS` controla qué piezas aparecen en cada disciplina y en qué orden.

El CSS admite `prefers-reduced-motion`. El visor de video no usa MP4 locales, solo iframes `youtube-nocookie.com` y `drive.google.com/.../preview`, que se eliminan al cerrar para detener reproducción. El video ambiental del inicio es opcional y se controla en `js/site-config.js`.
