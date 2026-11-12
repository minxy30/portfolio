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


### Collage audiovisual y ambientación de entrada

Cada recarga vuelve a mostrar el portal inicial. Detrás se encuentra un collage de 18 tarjetas de proyectos locales (fotografía, diseño, campañas), con posiciones y material visual alternantes; los cambios ocurren por grupos de cuatro cada ~2.65 s. El área central queda atenuada para mantener legible el botón «Entrar al portafolio». No usa archivos externos ni añade video pesado. La animación se reduce con `prefers-reduced-motion`.

El portal tiene una composición sintetizada original de **fantasía/organic house ambiental a 103 BPM**, generada en tiempo real con Web Audio y sin voces. Su reproducción previa al clic depende de la política de autoplay del navegador. Si el navegador la bloquea, el clic de entrada activa una breve transición sonora y la música del portafolio. Al entrar se inicia la pista **Abyssal Light Loop** al **10 % de volumen en cada visita**, sin recuperar preferencias anteriores; el visitante puede ajustar el volumen durante la sesión. Se mantiene el crossfade de 5 segundos y los efectos de navegación independientes.


### Collage cinético v8

La pantalla de entrada presenta cinco franjas horizontales densas de trabajos existentes que se desplazan a velocidades diferentes y alternan dirección. Cada ~780 ms una o dos tarjetas cambian su imagen/posición o producen un breve destello localizado (no destellos de toda la pantalla). Dos tarjetas intentan reproducir videos públicos de la selección ya incluida de YouTube mediante iframes sin sonido y sin controles; el funcionamiento de autoplay depende de YouTube y del navegador, por lo que hay imágenes de respaldo. En móviles, conexiones de bajo rendimiento y modo de movimiento reducido, se priorizan imágenes estáticas. La zona central y el botón son más prominentes. Todo el fondo y contenido principal permanecen iguales.


## Música original de lobby y cierre de portafolio

**Pista original:** `assets/audio/lobby-fantasy-house-original.m4a` (3:41.5, 104 BPM, ~1.4 MB). Composición instrumental de fantasía/organic house sintetizada específicamente para este proyecto, sin samples externos, piano agudo ni voz. El original también se guarda en Drive en `1BFfYh94jaXoLtR0PLBw78nvCV3qHQF6l`. En el lobby suena al 80 % de volumen, con crossfade de ~4.6 segundos al reiniciar. Al pulsar `Entrar al portafolio`, el lobby sale gradualmente y entra **Abyssal Light Loop** al 10 % con su propio loop de 5 segundos. Al pulsar **Cerrar portafolio**, se restaura el lobby con su música y el collage; se silencian temporalmente los videos abiertos y se recuperan las vistas previas en mute.

El navegador puede bloquear la reproducción inicial del lobby antes de una interacción. En ese caso aparece **Activar música del lobby**, que reproduce la canción sin salir de la pantalla. Los previews de videos decorativos siempre tienen `mute=1` y no muestran controles.


### Lobby v9: video local, alto adaptable, cursor 3D y año automático

El lobby tiene volumen **fijo al 80 %** sin deslizador. Si las políticas del navegador bloquean audio al abrir, aparece un único botón accesible para activarlo. Las vistas previas proceden de **The Homes, Smarketing 360, Casita de Sol y Minsis Kids**, extraídas de los videos que la autora proporcionó en Drive, codificadas a H.264 como clips mudos de 4 a 8 segundos. En el collage se usan **<video autoplay muted loop playsinline>**, y un observador solo carga/reproduce clips cuando son visibles. Los proyectos audiovisuales abiertos deliberadamente mantienen el sonido. El número de franjas del fondo se calcula según la altura de la ventana para llenar pantallas verticales y horizontales. Los indicadores de año del sitio se actualizan mediante `new Date().getFullYear()`. «Cerrar portafolio» se ubica a la izquierda, junto al CV. El cursor tipo vidrio/cromo reflectante es un SVG original que sigue el ratón en escritorio y responde a enlaces; móviles conservan el cursor táctil nativo. El sistema de partículas existente permanece intacto.


## Ajustes de rendimiento, habilidades y partículas (noviembre 2026)

- Se **elimina** el cursor personalizado para restaurar el cursor nativo y reducir el trabajo visual en cada movimiento.
- Lobby: las filas se calculan según la proporción de pantalla (4–6 en vertical, 3–5 en horizontal), con tarjetas más grandes, menos nodos duplicados y un máximo de cuatro clips MP4 mudos que solo cargan cuando están visibles. El motor de partículas se suspende detrás de la pantalla de entrada para no gastar GPU en algo oculto.
- Partículas del portafolio: se reduce la zona de influencia del puntero un 30 % y el máximo gráfico a 68 000 partículas; los clics consecutivos se acumulan en un núcleo y generan una sola explosión al transcurrir 390 ms sin nuevos clics (máximo nueve cargas). El fallback Canvas 2D también refleja la acumulación.
- Herramientas: agrupadas en Video, Diseño, IA creativa y Gestión/publicación; filtros en la misma pantalla y desplazamiento interno. Se incorporan los logos compartidos por la usuaria y versiones vectoriales locales de Illustrator, Premiere, After Effects, Photoshop y Lightroom. El SVG suministrado bajo «InDesign» era idéntico al de Illustrator: se mantiene un icono correcto de InDesign del repositorio de marcas, sin atribuirle el logo equivocado.
- Ventanas: el diálogo «Sobre mí» desactiva el scrollytelling y la navegación de fondo. Las barras tipo Mac pasan de tres aparentes botones a un indicador decorativo de colores difuminados.

Estas decisiones buscan mejorar el rendimiento durante la grabación con OBS; no equivalen por sí solas a una medición de FPS en el dispositivo de la usuaria.

### Comprobación de rendimiento

Para comprobar la mejora durante una grabación con OBS, comparar el lobby anterior con la versión optimizada en la misma resolución y frecuencia de actualización, con y sin captura activa. Revisar también el cambio de secciones, el diálogo «Sobre mí», las herramientas y el efecto de acumulación con clics consecutivos. No atribuir una cifra de FPS sin mediciones en el dispositivo.


## Ajustes del 10 de noviembre de 2026 — navegación, acumulación y logos

- La rueda del mouse recorre la lista de Herramientas solo si todavía hay contenido desplazable en ese sentido. Al llegar al extremo, cambia de escena; también se reinicia su acumulador al pulsar los indicadores laterales. Se impide el scroll exterior cuando el visor «Sobre mí» está abierto.
- La acumulación de partículas acepta hasta 32 clics consecutivos antes de soltar la explosión; cada pulsación reaviva un anillo y movimiento elástico visible, con un crecimiento suave de la masa y el brillo en WebGL y en el fallback Canvas. El área de influencia del cursor permanece reducida 30 %.
- En el tema claro los puntos de tipo halo grande se convierten en motas pequeñas y más definidas, y se reduce la viñeta para evitar las manchas grandes.
- La biblioteca distingue mejor la barra lateral mediante tarjetas de fondo discreto, contorno y acento del apartado activo, y una animación breve que se podrá actualizar cuando la autora entregue los SVG específicos de cada disciplina.
- Se retiró Adobe Creative Cloud de Herramientas, se añadió un distintivo vectorial local de InDesign (diferenciado del SVG repetido de Illustrator), se utilizan logotipos de Canva y Claude sin fondo y se redondean los de Grok y OpenAI. Se añadieron iconos a las tarjetas de Gmail, WhatsApp, llamada y CV.
- Queda **pendiente** la asociación verificable de cada proyecto a sus programas/herramientas. No se implementan filtros por programas sin fichas definitivas de trabajos, funciones y herramientas utilizadas.

## Mejoras de noviembre: reel visual, navegación y CV

- El anillo de acumulación ahora es una línea de partículas visible y progresivamente más gruesa durante los clics, incluso cuando el shader tiene pocos puntos justo sobre el borde. Se dibuja en un pequeño Canvas 2D complementario (320×320 nativo, 260 px visuales), no un efecto de pantalla completa; mantiene el rebote de cada clic y desaparece al liberar la explosión.
- Los iconos de Video, Diseño, Fotografía y Copywriter son los cuatro SVG proporcionados por la autora, almacenados en `assets/icons/`. Se presentan **erguidos (0°)** aunque el texto de navegación esté en vertical. La animación de selección es escala/brillo, sin giros del icono. Sobre mí conserva su símbolo actual hasta recibir un SVG.
- Los monitores verticales tienen una biblioteca con dos columnas de imágenes más grandes; la barra lateral mantiene las opciones juntas, y el pie de contacto usa mejor la altura disponible. La pantalla Herramientas centra su contenido.
- El correo ofrece un enlace a **Gmail en el navegador** y la dirección visible con botón para copiarla. Esto evita depender de Outlook u otro cliente configurado. WhatsApp abre un texto breve preescrito. Tanto Contacto como el footer de proyectos muestran iconos.
- El lobby ofrece **Ver mi CV** sin abandonar la página. El visor emergente muestra una sola página adaptada a la ventana mediante PDF.js; si es un documento de varias páginas, usa flechas, y ofrece verlo en grande o guardar el PDF. Si no se puede cargar PDF.js, hay un visor nativo de respaldo.
- El collage del lobby se genera a partir de los proyectos **publicados en `CATS` y `window.PORTFOLIO_DATA`**, no de todo el Drive. Al retirar o añadir un proyecto al catálogo se actualizan las imágenes elegibles automáticamente. Los clips locales mudos siguen asociados solo a los proyectos que permanezcan publicados. Este sistema evita exhibir por error materiales privados o no seleccionados y no depende de abrir Google Drive al público.


## Ajustes de lobby y navegación — 11 de noviembre de 2026

- **Lobby:** cuatro clips originales de video (The Homes, Smarketing 360, Casita de Sol y Minsis Kids) permanecen visibles y se reproducen con `autoplay muted loop playsinline`, mediante cuatro elementos HTML5 independientes de las franjas de imágenes. Ya no desaparecen al salir la primera copia del carrusel y el observador ya no los pausa durante el desplazamiento horizontal. Los medios no tienen banda sonora. Al cerrar el portafolio se reconstruyen y se reanudan; al entrar se pausan. Si un navegador bloquea autoplay incluso en silencio, se conserva una imagen de respaldo y se reintenta al cargar el clip o volver a mostrar la página.
- Los otros videos del catálogo que solo tienen enlace externo de YouTube siguen figurando con su imagen representativa: para que esas piezas también tengan reproducción autónoma y fiable en el lobby, se necesita incorporar clips MP4 autorizados, cortos y silenciados, como los cuatro que ya existen. No se falsifica reproducción mediante un póster animado.
- **Herramientas:** nunca tiene un scroll interior. El contenido se muestra completo, centrado y ajustado proporcionalmente a la altura disponible, incluyendo cuando se filtra por grupo o cambia la orientación. La rueda o gesto vertical se reserva para navegar entre las tres escenas de inicio.
- **Barra izquierda de trabajos:** las cinco categorías usan Flexbox con distribución espaciada uniformemente a lo largo de la altura del monitor; la versión móvil continúa horizontal.


## Adaptación de layout, audio y motion (12 de noviembre de 2026)

- **Biblioteca de proyectos:** masonry basado en columnas automáticas del ancho disponible, sin `column-count` fijo ni anchuras mínimas acumuladas. Los contenidos verticales y horizontales conservan sus proporciones; `work-main` tiene desplazamiento vertical normal y el footer aparece después de todas las tarjetas, no superpuesto. En monitor vertical se usan columnas más anchas y menos numerosas.
- **Barra lateral izquierda:** en monitor horizontal las cinco secciones mantienen cajas compactas con separación reducida. En monitor vertical la altura libre se reparte entre las cinco cajas, que se estiran hasta casi tocarse conservando las dimensiones de texto e iconos.
- **Header:** «Cerrar portafolio» es una salida visualmente discreta al extremo izquierdo; «Inicio» es el botón primario de navegación y el CV queda junto a «Hablemos» a la derecha, sin añadir otra fila.
- **Herramientas:** se centra verticalmente en el espacio real entre el encabezado y la parte inferior; un factor de escala calculado adapta la vista sin scrollbar interior, incluyendo la acción «Continuar a contacto». Cada filtro anima las tarjetas una por una, con animaciones superpuestas desde escala pequeña hasta tamaño normal y respeto de `prefers-reduced-motion`.
- **Lobby:** se intenta reproducir la música inmediatamente al 80 % sin un botón grande de activación. Un pequeño control abajo a la izquierda permite silenciar o reactivar el audio sin detener la posición temporal de la canción. Los efectos de sonido siguen independientes. **La reproducción audible automática sin interacción previa no se puede garantizar**: los navegadores pueden bloquearla; se reintenta al primer gesto y el botón de sonido sirve de alternativa accesible.
- El perfil muestra la ubicación únicamente como **México** (sin municipio ni ciudad).

Se conservaron sin alteración las fichas de proyectos, el motor de partículas, las pistas musicales y el funcionamiento de los clips mudos del lobby.


## Ajustes focalizados: animación, ventanas apiladas y lobby (noviembre 2026)

- **Herramientas:** con sus 19 tarjetas, la secuencia de escala termina en aproximadamente **1.81 segundos** (última transición incluida); para filtros con menos tarjetas, es más rápida. `prefers-reduced-motion` mantiene la opción sin animación.
- **Sobre mí:** el botón «Hablemos» cierra el cuadro y dirige al contacto de la pantalla principal, con las opciones Gmail, WhatsApp, teléfono y CV. «Ver CV» reutiliza el visor PDF dentro de otra ventana nativa sobre la primera, sin abrir otra pestaña. En escritorio permite observar el perfil detrás y en móvil conserva bordes visibles y un visor adaptable.
- **Videos del lobby:** además de los cuatro MP4 locales, los cuatro trabajos publicados de Benito Camello usan incorporaciones reales de YouTube (`autoplay=1`, `mute=1`, `loop=1`, `playlist=ID`, `playsinline=1`, `controls=0`), seleccionadas del catálogo de proyectos. Se muestran en tarjetas flotantes fijas para que no desaparezcan durante el desplazamiento del collage. Se descargan/desactivan al entrar a la página de trabajos o al ocultar la pestaña, y se recuperan al volver al lobby. **YouTube controla la disponibilidad y puede impedir autoplay o inserción de ciertas piezas**; su funcionamiento no se puede garantizar desde el código.
- **Audio del lobby:** el único control de sonido está en la esquina superior derecha. Solo alterna mute y sonido, mantiene volumen fijo del 80 % y no modifica el audio de los videos del fondo, que siempre se configura silenciado.


## Miniaturas y videos Benito Camello — 12 de noviembre de 2026

Se quitó la inserción de YouTube en el **lobby** para las cuatro piezas de Benito Camello y se conservan sus miniaturas oficiales directamente desde `i.ytimg.com` (sin iframe, sin anuncios, sin autoplay). Se mantienen los cuatro MP4 de fondo mudos para otros proyectos. Los videos completos de Benito Camello todavía se muestran mediante YouTube dentro del visor principal hasta que la autora suba los archivos completos a la carpeta de Drive **Videos completos — Benito Camello (portafolio)**: https://drive.google.com/drive/folders/12hk6ac2QC-Z-p5SlYCe5uW9sNbkiUFAS. No se han creado enlaces Drive ficticios ni trasladado archivos completos a GitHub. Cuando se disponga de los originales, cambiar el reproductor principal a la fuente aprobada, con un enlace separado «Ver en YouTube» y sin alterar las miniaturas seleccionadas. Nota: Drive puede exigir sesión o limitar el streaming; probar con visitantes sin acceso a su cuenta antes de fijar la solución.
