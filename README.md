# Portafolio Yazmin Moreno — Ajustes v6 (9 de noviembre de 2026)

Este paquete es un **parche incremental** para el repositorio `minxy30/portfolio`. No es el sitio completo offline: las demás imágenes, datos de proyectos y archivos existentes se mantienen en GitHub.

## Cambios

- Música ambiental original nueva: `assets/audio/ambient-original.ogg`, **4:00, 96 BPM**. House suave, armonías jazz, pad y bajo redondo, sin piano agudo. Repetición automática; final e inicio cruzados para una transición discreta. El visitante debe activar la música manualmente.
- Efectos sonoros independientes de la música: clic de tipo tap filtrado y swoosh de viento. El botón de volumen sólo silencia la música, no los sonidos de navegación.
- Más partículas diminutas, especialmente visibles en modo claro. Canvas optimizado con dos grupos de color y menor frecuencia de actualización en móvil.
- Herramientas: iconos de marca mediante Simple Icons v13 (Adobe, porque se retiraron en v14) y v16, más iconos/favicons oficiales obtenidos del dominio de cada proveedor. Si no cargan por conexión o retiro del recurso, aparece un monograma honesto; no se inventan logotipos. Animación de polvo al hover que revela el logo. Creative Cloud es la denominación correcta de Adobe, no «Creative Claude».
- **Sobre mí:** se abre en ventana macOS desde la hoja o el rail. Foto a la izquierda, nombre superpuesto y carrera, perfil profesional a la derecha. No se declara experiencia senior.
- Header en bibliotecas: nombre de la disciplina `| Yazmin Moreno` en el centro; botón de inicio con icono de casa junto al CV. Se quitaron los encabezados decorativos anteriores de cada biblioteca.
- Video: ahora se muestran **ocho tarjetas independientes** (cuatro videos de Benito Camello, The Homes, Smarketing, Casita de Sol, Minsis). Los cuatro enlaces de Benito provienen de los suministrados por la autora; **no se ha verificado que sean los favoritos titulados Bolivia, México y Ormuz**. Por ello tienen títulos neutrales, sin afirmaciones falsas.
- Fotografía: serie conceptual de seis fotografías seleccionadas de ocho de una carpeta de Drive aportada por la autora. Se muestra como **una sola galería**, además del retrato conceptual anterior.
- Carruseles existentes de The Homes (4 páginas), Omar China (3), Smarketing editorial (3), y Sabías que (3) continúan como conjuntos completos disponibles en el repositorio, sin mezclarlos en tarjetas individuales. Se añadió swipe táctil además de flechas.
- Desvanecimiento y entrada de abajo a arriba para textos del scrollytelling, además de las tarjetas.

## Configuración futura

La portada seguirá usando partículas hasta que se produzca tu video. Para agregarlo, súbelo como `assets/hero/intro.mp4` y actualiza `js/site-config.js` → `backgroundVideoSrc`. Las partículas permanecen superpuestas.

## Permisos y verificación editorial

Los reproductores Google Drive requieren que la propietaria configure lector con enlace y autorización de exhibición. Las métricas de rendimiento no se inventan. Verifica los tres títulos favoritos y la autoría de los materiales gráficos/fotográficos antes de publicar el portafolio a reclutadores.

## Licencias de los iconos

Los pictogramas externos representan marcas de terceros; se utilizan para identificar las herramientas aprendidas, no para sugerir afiliación. Consulta licencias y condiciones de uso antes de redistribuir sus archivos. Las fuentes de iconos referenciadas por URL pueden cambiar con el tiempo.
