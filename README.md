# YAZMIN MORENO — Portafolio 2026

Sitio estático responsivo HTML + CSS + JavaScript; retoma el enfoque editorial de `yazmin-portfolio-vanilla.zip` (la versión previa guardada en Drive). Selección curada: Benito Camelo, The Homes/Campaña Zarú, Smarketing 360, Casita de Sol y serie gráfica The Homes/Potencial de zona.

## Cómo abrirlo

Puedes abrir `index.html` o ejecutar `python -m http.server 8000` desde esta carpeta y visitar `http://localhost:8000`.

No hay archivos MP4 dentro de este paquete. Los videos se **reproducen mediante visores integrados**:

- YouTube: `https://www.youtube-nocookie.com/embed/VIDEO_ID` para las tres muestras de Benito Camelo.
- Google Drive: `https://drive.google.com/file/d/FILE_ID/preview` para los tres videos verticales.

Al hacer clic en una tarjeta se abre una ventana central inspirada en macOS con fondo desenfocado (`backdrop-filter: blur`), reproductor integrado y detalles del proyecto. Se cierra con el botón, clic en el fondo o tecla `Escape`. Al cerrarse se elimina el iframe para detener la reproducción. La galería de diseño también se abre en la ventana.

## IMPORTANTE — Permisos de Google Drive

Los tres archivos que se usan como reproductor de Drive estaban **privados** al momento de producir esta versión. La conexión a Drive disponible en el chat no expone la acción de `Cualquier persona con el enlace → Lector` (solo lectores concretos o del dominio). **No se ha aplicado ningún cambio a los permisos**.

Antes de enviar el portafolio a reclutadores, ajusta estos tres archivos desde su enlace, uno por uno:

1. [The Homes — Campaña Zarú](https://drive.google.com/file/d/1NSVQOAdZBtTL2Qjb-l_lOaQIHc9rLjhQ/view)
2. [Smarketing 360 — Video de valor](https://drive.google.com/file/d/1U7oDG8iPb6dGdsKsi5FVAa0RPQ4qDGDg/view)
3. [Casita de Sol](https://drive.google.com/file/d/1aCt90Z5WIPtY2DiBWs3essgODzgwXMa-/view)

Google Drive → botón **Compartir** → **Acceso general** → **Cualquier persona con el enlace** → **Lector** → **Listo**.

Verifica que cuentas con autorización para mostrar material comercial públicamente. Prueba cada reproductor en una ventana de incógnito *sin iniciar sesión*. Si un video no carga, comprueba que sigue disponible y que Drive permite la vista previa insertada.

## Restricciones y autoría

- Las tres muestras de Benito Camelo son enlaces reales compartidos por la autora, pero no representan una verificación técnica de que sean los cinco videos calificados con `☆☆☆`: su correspondencia numérica continúa incierta. Sustituye el ID en `projects.json` y `js/projects-data.js` cuando se reconcilie.
- Las contribuciones se describen a partir de lo declarado por la autora. No se ha verificado toda la autoría ni la autorización de marca.
- The Homes — Zarú: el video muestra «Casa en Zarú, Qro» aunque el archivo se llama «Casa Amalfi».
- La serie gráfica The Homes contiene imágenes de las fuentes entregadas. Debe confirmarse permiso de exhibición y crédito de recursos de terceros.
- El retrato, los posters y la serie gráfica están guardados como imágenes locales para que la portada cargue rápidamente; **solo los videos** quedan alojados externamente.

## Estructura

- `index.html` página web
- `css/styles.css` diseño responsivo y modal
- `js/script.js` filtros, modo oscuro, reproducción integrada y accesibilidad
- `js/projects-data.js` metadatos usados por la web
- `projects.json` copia legible de datos de proyectos
- `assets/images/*` fotografías, portadas y gráficas optimizadas
- `assets/docs/CV-Yazmin-Moreno.pdf` CV

## Publicación

Sube la carpeta descomprimida a GitHub Pages, Netlify o Vercel como web estática (no necesita build). No se ha publicado por tu cuenta desde este chat.
