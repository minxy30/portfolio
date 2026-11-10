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


## Música del portafolio — versión funcional

- **Master original:** [Abyssal Light Loop.mp3](https://drive.google.com/file/d/1_NWK3zKvX8BklDdnq-FLfotC-7wYCPrB/view) (Drive, privado, 3.2 MB).
- **Copia web:** `assets/audio/Abyssal-Light-Loop-web.m4a`, AAC-LC a 80 kb/s, 1.44 MB. **Es la misma canción**, comprimida para una reproducción fiable, y no otra pista.
- **Motivo:** Google Drive no ofrece un enlace público y estable de audio para `<audio>` con volumen, pausa y loop. Además, el master tiene permisos privados. Conservarlo únicamente en Drive impedía escucharlo a reclutadores. La copia web supone solo ~1.44 MB en el repositorio y se sirve directamente desde GitHub Pages.
- `js/site-config.js` controla el archivo de música; sustituir esa ruta permite cambiar la canción.
- La música se solicita automáticamente y permanece activa en la interfaz. **Ningún navegador garantiza autoplay con sonido sin consentimiento**: en los que lo bloquean empieza en la primera interacción del visitante. El altavoz activa/silencia; el botón de ajustes abre el control de volumen (20 % por defecto); las preferencias de volumen se guardan en el navegador; la pista hace loop.
- Los efectos de tap, hover y swoosh se sintetizan por separado con Web Audio y permanecen activos cuando se silencia la música. Los navegadores también pueden exigir una primera interacción para permitir estos efectos.
- Abrir un video pausa la música, cerrarlo la reanuda si el usuario no la ha silenciado.



### Música continua, control solo de volumen

El icono del altavoz abre un deslizador de 0 % a 100 %. No existe botón de pausa: al seleccionar 0 % la pista continúa en silencio, sin reiniciar el loop. La música se pausa únicamente al abrir un proyecto de video, para evitar superposición de audio, y se reanuda al cerrarlo. Se solicita reproducción inicial en todos los navegadores, pero sus políticas de autoplay pueden bloquear el sonido hasta una interacción del visitante. Los sonidos de navegación permanecen independientes.


### Crossfade de la pista ambiental

Para suavizar el loop, dos elementos de audio comparten la pista alojada en `assets/audio/Abyssal-Light-Loop-web.m4a`. El reproductor empieza a mezclar los últimos ~5 segundos con el comienzo de la misma pista usando una curva de volumen de potencia aproximadamente constante (sin repetición abrupta). El volumen afecta a ambos reproductores; abrir un proyecto de video pausa ambos y cerrar el visor los reanuda desde donde quedaron. Si el navegador rechaza el segundo reproductor, hay un reinicio de respaldo sin mezcla. La música sigue sujeta a las restricciones de autoplay de cada navegador.


## Acceso inicial tipo juego
La página muestra una entrada cinematográfica con botón **«Entrar al portafolio»**. El clic genera un sonido de portal fantástico sintetizado en Web Audio, llama a la reproducción de `Abyssal Light Loop` mediante un gesto real del usuario y desencadena un destello que revela la portada y sus cinco hojas en secuencia. El fondo de partículas y la navegación original no se modifican. Hay una variante sin animación prolongada para `prefers-reduced-motion`. No se descargan efectos de sonido externos.
