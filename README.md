# Portafolio interactivo de Yazmin Moreno — Versión 5

Sitio web estático para GitHub Pages, sin backend. Esta versión sigue el wireframe original de cinco hojas y su flujo: **Inicio → Herramientas → Contacto**, con escenas que se sustituyen mediante scrollytelling en lugar de una página inicial larga. Las disciplinas son entradas directas a bibliotecas tipo Pinterest, con barra lateral en escritorio, filtros, revelación por scroll y visor dentro de la web.

## Diseño

- El fondo de **partículas** es permanente y reacciona al puntero y a toques. Color automático según modo claro/oscuro. Fuente: `js/particles.js` (Canvas 2D sin librerías externas).
- En Inicio están las cinco hojas `Sobre mí`, `Video`, `Diseño`, `Fotografía`, `Copywriter` con hover de escala, sombra e iluminación.
- Hacer clic sobre una hoja abre su página mediante una **revelación de luz radial** desde el punto del clic; el header siempre mantiene CV, nombre, modo claro/oscuro, sonido, Contacto.
- Desplazamiento vertical desde Inicio pasa a **Herramientas** y luego a **Contacto**, con reemplazo de escena y efectos de revelación, no scroll largo.
- Secciones de trabajo: estructura del wireframe, con rail lateral, filtros horizontales y masonry con formatos diversos; scroll revelando piezas. Cada disciplina termina con footer de CV y contacto.
- Visor: fondo desenfocado, trabajo a la izquierda (~62 %), texto a la derecha (~38 %). En móvil imagen/reproductor arriba y texto debajo. Los videos usan iframe de Drive/YouTube. Ningún MP4 de proyectos se distribuye en esta web.
- Diseño responsivo, navegación por teclado, Escape para cerrar, soporte `prefers-reduced-motion`, controles accesibles.

## Música original y SFX

`assets/audio/ambient-original.ogg` es una composición instrumental **original de 2:08**, creada para este sitio sin muestras ajenas. No se reproduce automáticamente, no entra en loop; el visitante la activa al pulsar el botón de volumen **justo al lado del tema claro/oscuro**. El mismo botón silencia música y efectos. Se pausa al abrir un proyecto de video y se reanuda al cerrarlo si el visitante la tenía activada. Los efectos breves de clic/revelación se sintetizan con Web Audio, sin archivos adicionales.

## En dos semanas: reemplazar el fondo provisional

1. Renderiza tu video de fondo en **MP4 silencioso** (H.264, compatible con GitHub Pages), comprimido y corto, por ejemplo 10–20 segundos. 
2. En el repositorio `minxy30/portfolio`, súbelo como `assets/hero/intro.mp4`.
3. Abre `js/site-config.js` y cambia `backgroundVideoSrc:''` por `backgroundVideoSrc:'assets/hero/intro.mp4'`.
4. El video quedará **detrás del sistema de partículas permanente**, manteniendo el modo claro/oscuro. No afectará la música ni los reproductores de tus proyectos.

## Contenidos y advertencias

- Los favoritos de Benito Camelo (Bolivia, México y Ormuz) todavía no están vinculados con seguridad a los 48 enlaces históricos: **no se han inventado títulos o identificaciones**. El portfolio mantiene muestras etiquetadas de forma genérica que deben revisarse antes de enviar postulaciones.
- Los videos de Google Drive necesitan permiso de lector para cualquier persona con el enlace (y autorización de exhibición). Esta web no altera sus permisos.
- La autoría individual de algunas fotos, copies y piezas corporativas necesita confirmación; se indica en los textos sin atribuciones indebidas. Los resultados no incluyen métricas inventadas.
- Puedes editar las obras y textos en `js/projects-data.js`. Si mantienes `projects.json` como respaldo, sincronízalo.

## Estructura

- `index.html`: páginas, header, escenas, biblioteca y visor.
- `css/styles.css`: diseño, responsive, transiciones.
- `js/particles.js`: partículas fluidas interactivas.
- `js/app.js`: navegación/escenas, filtros, visor, audio, SFX y tema.
- `js/site-config.js`: video futuro, música y preferencias.
- `assets/audio/ambient-original.ogg`: composición original (128 segundos).

## Rendimiento y compatibilidad

El Canvas limita la resolución a 1.6 DPR y reduce el número de partículas en móvil; se detiene al ocultar la pestaña y respeta movimiento reducido. Los iframes solo se instancian al abrir un proyecto. La portada funciona sin música, sin video nuevo y sin bibliotecas de terceros.
