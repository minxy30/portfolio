// ============================================
// THEME TOGGLE
// ============================================
const themeToggle = document.getElementById('themeToggle');
const htmlElement = document.documentElement;

// Check for saved theme preference or default to light mode
const currentTheme = localStorage.getItem('theme') || 'light';
if (currentTheme === 'dark') {
    document.body.classList.add('dark-mode');
}

const portfolioVideoUrls = {
    video1: 'https://drive.google.com/file/d/1W45sC44AW6ZsF--wSmruDZaXRzH4zhTx/view?usp=drive_link',
    video2: 'https://drive.google.com/file/d/1sJmyRQiiok36jNZwLh70o3BfqcpvruNG/view?usp=drive_link',
    video3: 'https://drive.google.com/file/d/1wN0aTWmK4uuh2po3NHgHOg6_EmUZ54-r/view?usp=drive_link',
    video4: 'https://drive.google.com/file/d/1YOwQFnQH2OWmUBurRRgV4J_kfETX0xK-/view?usp=drive_link',
    video5: 'https://drive.google.com/file/d/1LIts3lbuLSTvYXAfMdFpbmxEyBD14ab3/view?usp=drive_link',
    video6: 'https://drive.google.com/file/d/1GXGTDDe7L5xlQfkWW9NrTMbLsIDxerqy/view?usp=drive_link'
};

const portfolioVideoPreviews = {
    video1: 'https://drive.google.com/thumbnail?id=1W45sC44AW6ZsF--wSmruDZaXRzH4zhTx&sz=w1200',
    video2: 'https://drive.google.com/thumbnail?id=1sJmyRQiiok36jNZwLh70o3BfqcpvruNG&sz=w1200',
    video3: 'https://drive.google.com/thumbnail?id=1wN0aTWmK4uuh2po3NHgHOg6_EmUZ54-r&sz=w1200',
    video4: 'https://drive.google.com/thumbnail?id=1YOwQFnQH2OWmUBurRRgV4J_kfETX0xK-&sz=w1200',
    video5: 'https://drive.google.com/thumbnail?id=1LIts3lbuLSTvYXAfMdFpbmxEyBD14ab3&sz=w1200',
    video6: 'https://drive.google.com/thumbnail?id=1GXGTDDe7L5xlQfkWW9NrTMbLsIDxerqy&sz=w1200'
};

themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const theme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
    localStorage.setItem('theme', theme);
});

// ============================================
// NAVBAR SCROLL EFFECT
// ============================================
const navbar = document.getElementById('navbar');
const backToTopButton = document.getElementById('backToTop');
let floatingCaraGif = null;
let floatingGifHasBeenDragged = false;
let floatingGifDragging = false;
let floatingGifPointerId = null;
let floatingGifOffsetX = 0;
let floatingGifOffsetY = 0;

function clampValue(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

function setFloatingGifPosition(left, top) {
    if (!floatingCaraGif) return;

    const gifWidth = floatingCaraGif.offsetWidth || 90;
    const gifHeight = floatingCaraGif.offsetHeight || 90;

    const boundedLeft = clampValue(left, 8, window.innerWidth - gifWidth - 8);
    const boundedTop = clampValue(top, 68, window.innerHeight - gifHeight - 8);

    floatingCaraGif.style.left = `${Math.round(boundedLeft)}px`;
    floatingCaraGif.style.top = `${Math.round(boundedTop)}px`;
}

function positionFloatingGifNearHero(force = false) {
    if (!floatingCaraGif) return;
    if (floatingGifHasBeenDragged && !force) return;

    const heroTitle = document.querySelector('.hero-title');
    const gifWidth = floatingCaraGif.offsetWidth || 90;
    const gifHeight = floatingCaraGif.offsetHeight || 90;

    let left = (window.innerWidth * 0.54) - (gifWidth / 2);
    let top = 108;

    if (heroTitle) {
        const titleRect = heroTitle.getBoundingClientRect();
        left = titleRect.left + (titleRect.width * 0.72);
        top = titleRect.top - gifHeight - 12;
    }

    setFloatingGifPosition(left, top);
}

function updateFloatingGifVisibility() {
    if (!floatingCaraGif) return;

    const scrollTop = window.scrollY || window.pageYOffset || 0;
    const contactSection = document.getElementById('contacto');
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

    let isContactVisible = false;
    if (contactSection) {
        const contactRect = contactSection.getBoundingClientRect();
        isContactVisible = contactRect.top < viewportHeight * 0.82 && contactRect.bottom > viewportHeight * 0.22;
    }

    const shouldShow = scrollTop <= 12 || isContactVisible;
    floatingCaraGif.classList.toggle('is-visible', shouldShow);
    floatingCaraGif.classList.toggle('is-contact-zone', isContactVisible);
}

function initFloatingCaraGif() {
    floatingCaraGif = document.getElementById('floatingCaraGif');
    if (!floatingCaraGif) return;

    positionFloatingGifNearHero(true);
    updateFloatingGifVisibility();
    window.requestAnimationFrame(() => positionFloatingGifNearHero(true));
    window.setTimeout(() => positionFloatingGifNearHero(true), 450);

    floatingCaraGif.addEventListener('pointerdown', (event) => {
        if (event.pointerType === 'mouse' && event.button !== 0) return;

        const rect = floatingCaraGif.getBoundingClientRect();
        floatingGifDragging = true;
        floatingGifHasBeenDragged = true;
        floatingGifPointerId = event.pointerId;
        floatingGifOffsetX = event.clientX - rect.left;
        floatingGifOffsetY = event.clientY - rect.top;

        floatingCaraGif.classList.add('is-dragging');
        floatingCaraGif.setPointerCapture(event.pointerId);
        event.preventDefault();
    });

    window.addEventListener('pointermove', (event) => {
        if (!floatingGifDragging) return;
        if (floatingGifPointerId !== event.pointerId) return;

        const nextLeft = event.clientX - floatingGifOffsetX;
        const nextTop = event.clientY - floatingGifOffsetY;
        setFloatingGifPosition(nextLeft, nextTop);
        event.preventDefault();
    }, { passive: false });

    const stopDragging = (event) => {
        if (!floatingGifDragging) return;
        if (floatingGifPointerId !== event.pointerId) return;

        floatingGifDragging = false;
        floatingGifPointerId = null;
        floatingCaraGif.classList.remove('is-dragging');
    };

    window.addEventListener('pointerup', stopDragging);
    window.addEventListener('pointercancel', stopDragging);

    window.addEventListener('resize', () => {
        positionFloatingGifNearHero();
        updateFloatingGifVisibility();
    });
}

function handleScrollStates() {
    if (window.scrollY > 50) {
        navbar?.classList.add('scrolled');
    } else {
        navbar?.classList.remove('scrolled');
    }

    if (backToTopButton) {
        if (window.scrollY > 300) {
            backToTopButton.classList.add('show');
        } else {
            backToTopButton.classList.remove('show');
        }
    }

    updateFloatingGifVisibility();
}

window.addEventListener('scroll', handleScrollStates);
handleScrollStates();

if (backToTopButton) {
    backToTopButton.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// ============================================
// TYPEWRITER EFFECT
// ============================================
function typewriterLoop(element, texts, options = {}) {
    const typingSpeed = options.typingSpeed ?? 110;
    const deletingSpeed = options.deletingSpeed ?? 55;
    const pauseAfterType = options.pauseAfterType ?? 1800;
    const pauseAfterDelete = options.pauseAfterDelete ?? 400;
    const words = Array.isArray(texts) && texts.length ? texts : [String(texts ?? '')];

    let index = 0;
    let wordIndex = 0;
    let isDeleting = false;
    element.textContent = '';

    function tick() {
        const currentText = words[wordIndex];

        if (!isDeleting) {
            index = Math.min(index + 1, currentText.length);
            element.textContent = currentText.slice(0, index);

            if (index === currentText.length) {
                isDeleting = true;
                setTimeout(tick, pauseAfterType);
                return;
            }

            setTimeout(tick, typingSpeed);
            return;
        }

        index = Math.max(index - 1, 0);
        element.textContent = currentText.slice(0, index);

        if (index === 0) {
            isDeleting = false;
            wordIndex = (wordIndex + 1) % words.length;
            setTimeout(tick, pauseAfterDelete);
            return;
        }

        setTimeout(tick, deletingSpeed);
    }

    setTimeout(tick, 300);
}

// ============================================
// HERO PROFILE SLIDESHOW
// ============================================
let heroSlideshowTimer = null;

function initHeroProfileSlideshow() {
  const imageFrame = document.querySelector('.hero-image .image-frame');
  if (!imageFrame) return;

  const profileImages = imageFrame.querySelectorAll('img');
  if (profileImages.length < 2) return;

  const visibleDuration = 3000; // 3.0s por imagen
  const transitionDuration = 700; // ms
  imageFrame.style.setProperty('--profile-fade-duration', `${transitionDuration}ms`);

  let activeIndex = 0;

  imageFrame.classList.add('slideshow-ready');

  profileImages.forEach((img, index) => {
    img.classList.toggle('is-active', index === activeIndex);
  });

  function showNextImage() {
    const currentImage = profileImages[activeIndex];
    const nextIndex = (activeIndex + 1) % profileImages.length;
    const nextImage = profileImages[nextIndex];

    currentImage.classList.add('is-exiting');
    currentImage.classList.remove('is-active');

    nextImage.classList.remove('is-exiting');
    nextImage.classList.add('is-active');

    activeIndex = nextIndex;

    window.setTimeout(() => {
      currentImage.classList.remove('is-exiting');
    }, transitionDuration + 50);
  }

  // Evita loops duplicados
  if (heroSlideshowTimer) {
    window.clearInterval(heroSlideshowTimer);
  }

  heroSlideshowTimer = window.setInterval(showNextImage, visibleDuration);
}


// Initialize typewriter when page loads
document.addEventListener('DOMContentLoaded', () => {
    const typewriterElement = document.getElementById('typewriter');
    const subtitleElement = document.querySelector('.hero-subtitle');

    if (typewriterElement) {
        if (subtitleElement) {
            subtitleElement.style.display = 'none';
        }

        typewriterLoop(typewriterElement, ['Yazmin Moreno', 'Portafolio']);
    }

    initHeroProfileSlideshow();
    initFloatingCaraGif();
    syncSubpageCardPreviews();
});

// ============================================
// PROJECT DATA
// ============================================
const projectsData = {
    1: {
        title: 'Reel 2025',
        category: 'Producción Audiovisual',
        role: 'Edición & Motion Graphics',
        description: 'Compilación de los mejores trabajos de motion graphics y edición de video del último año.',
        image: 'images/project-audiovisual.jpg',
        tools: ['After Effects', 'Premiere Pro', 'Cinema 4D']
    },
    2: {
        title: 'Neon Campaign',
        category: 'Diseño Publicitario',
        role: 'Dirección de Arte',
        description: 'Campaña visual para marca de ropa urbana con estética cyberpunk.',
        image: 'images/project-advertising.jpg',
        tools: ['Photoshop', 'Illustrator', 'Midjourney']
    },
    3: {
        title: 'RyE Clínica',
        category: 'Desarrollo Web',
        role: 'Frontend & UX/UI',
        description: 'Rediseño completo de la identidad digital y sitio web para clínica dental.',
        image: 'images/project-webdev.jpg',
        tools: ['React', 'Tailwind', 'Figma']
    },
    4: {
        title: 'Tech Podcast',
        category: 'Producción Audiovisual',
        role: 'Edición de Audio & Video',
        description: 'Post-producción completa para serie de podcasts sobre tecnología.',
        image: 'images/project-audiovisual.jpg',
        tools: ['Audition', 'Premiere Pro']
    },
    'video-1': {
        title: 'Reel Vertical: Marca Personal',
        category: 'Producción Audiovisual',
        role: 'Guion, Edición y Motion Graphics',
        description: 'Pieza corta para redes sociales con ritmo dinámico, transiciones y narrativa visual enfocada en conversión.',
        image: portfolioVideoPreviews.video1,
        poster: portfolioVideoPreviews.video1,
        videoUrl: portfolioVideoUrls.video1,
        mediaOrientation: 'portrait',
        tools: ['Premiere Pro', 'After Effects', 'CapCut']
    },
    'video-2': {
        title: 'Spot Promo: Evento Local',
        category: 'Producción Audiovisual',
        role: 'Dirección de Arte y Edición',
        description: 'Video teaser para promoción de evento con estética moderna y enfoque en impacto visual inmediato.',
        image: portfolioVideoPreviews.video2,
        poster: portfolioVideoPreviews.video2,
        videoUrl: portfolioVideoUrls.video2,
        mediaOrientation: 'portrait',
        tools: ['Premiere Pro', 'Photoshop', 'Canva']
    },
    'video-3': {
        title: 'Tutorial Express',
        category: 'Contenido Educativo',
        role: 'Producción y Post-producción',
        description: 'Formato vertical de tips rápidos optimizado para retención y consumo móvil.',
        image: portfolioVideoPreviews.video3,
        poster: portfolioVideoPreviews.video3,
        videoUrl: portfolioVideoUrls.video3,
        mediaOrientation: 'portrait',
        tools: ['Veed.io', 'Premiere Pro', 'Flow']
    },
    'video-4': {
        title: 'Behind the Scenes',
        category: 'Documental Corto',
        role: 'Grabación y Montaje',
        description: 'Registro detrás de cámaras para mostrar proceso creativo y reforzar identidad de marca.',
        image: portfolioVideoPreviews.video4,
        poster: portfolioVideoPreviews.video4,
        videoUrl: portfolioVideoUrls.video4,
        mediaOrientation: 'portrait',
        tools: ['Premiere Pro', 'Audition', 'Lightroom']
    },
    'video-5': {
        title: 'Testimonial Edit',
        category: 'Video Corporativo',
        role: 'Edición Narrativa',
        description: 'Edición de entrevistas con soporte visual y subtítulos para redes y sitio web.',
        image: portfolioVideoPreviews.video5,
        poster: portfolioVideoPreviews.video5,
        videoUrl: portfolioVideoUrls.video5,
        mediaOrientation: 'portrait',
        tools: ['Premiere Pro', 'After Effects', 'Captions.ai']
    },
    'video-6': {
        title: 'Campaña Reels 6x15',
        category: 'Social Media Video',
        role: 'Estrategia y Ejecución',
        description: 'Serie de micro-videos verticales para campaña digital con identidad visual consistente.',
        image: portfolioVideoPreviews.video6,
        poster: portfolioVideoPreviews.video6,
        videoUrl: portfolioVideoUrls.video6,
        mediaOrientation: 'portrait',
        tools: ['Premiere Pro', 'Canva', 'Kling AI']
    },
    'social-1': {
        title: 'Branding de Feed Editorial',
        category: 'Social Media Design',
        role: 'Dirección Visual y Diseño',
        description: 'Sistema de piezas para Instagram con narrativa visual consistente y adaptada por campaña.',
        image: 'images/profiles 1.png',
        tools: ['Illustrator', 'Photoshop', 'Canva']
    },
    'social-2': {
        title: 'Carrusel Educativo',
        category: 'Contenido para Redes',
        role: 'Diseño y Copy',
        description: 'Diseño de carrusel informativo orientado a guardados, compartidos y crecimiento orgánico.',
        image: 'images/profiles 2.png',
        tools: ['Canva', 'Illustrator', 'ChatGPT']
    },
    'social-3': {
        title: 'Anuncios para Meta Ads',
        category: 'Paid Media Creatives',
        role: 'Diseño de Creativos',
        description: 'Variantes visuales para pruebas A/B con enfoque en CTR y claridad de propuesta.',
        image: 'images/profiles 3.png',
        tools: ['Photoshop', 'Canva', 'Meta Ads']
    },
    'social-4': {
        title: 'Story Pack Mensual',
        category: 'Diseño de Stories',
        role: 'Diseño y Producción',
        description: 'Paquete de stories animadas para campañas de temporada y acciones de conversión.',
        image: 'images/profiles 1.png',
        tools: ['After Effects', 'Canva', 'Premiere Pro']
    },
    'social-5': {
        title: 'Lanzamiento de Producto',
        category: 'Campaña Digital',
        role: 'Concepto y Ejecución',
        description: 'Concepto visual de lanzamiento con piezas para feed, stories y anuncios.',
        image: 'images/profiles 2.png',
        tools: ['Illustrator', 'Photoshop', 'Figma']
    },
    'social-6': {
        title: 'Identidad para Reels',
        category: 'Motion para Redes',
        role: 'Motion Graphics',
        description: 'Plantillas y cierres animados para reforzar identidad en contenido de video corto.',
        image: 'images/profiles 3.png',
        tools: ['After Effects', 'Premiere Pro', 'Canva']
    },
    'copy-1': {
        title: 'Exito en Negocios y Era Digital',
        category: 'Copywriting SEO',
        role: 'Investigación y Redacción',
        description: 'Analisis de como adaptar negocios a un contexto digital cambiante con enfoque en conversion y posicionamiento.',
        image: 'https://image.thum.io/get/width/1200/noanimate/https://blog.smarketing360.lat/2026/02/13/el-exito-en-los-negocios-como-adaptarse-a-la-nueva-era-digital/',
        articleUrl: 'https://blog.smarketing360.lat/2026/02/13/el-exito-en-los-negocios-como-adaptarse-a-la-nueva-era-digital/',
        mediaOrientation: 'web',
        tools: ['WordPress', 'Google Docs', 'Search Console']
    },
    'copy-2': {
        title: 'Contenido Creativo e Intencion',
        category: 'Copywriting Editorial',
        role: 'Investigación y Redacción',
        description: 'Reflexion sobre creatividad, IA y la importancia de la intencion estrategica para diferenciar contenido.',
        image: 'https://image.thum.io/get/width/1200/noanimate/https://blog.smarketing360.lat/2026/01/23/la-muerte-del-contenido-creativo-no-la-causa-la-ia-la-causa-la-falta-de-intencion/',
        articleUrl: 'https://blog.smarketing360.lat/2026/01/23/la-muerte-del-contenido-creativo-no-la-causa-la-ia-la-causa-la-falta-de-intencion/',
        mediaOrientation: 'web',
        tools: ['WordPress', 'Google Docs', 'SEO Surfer']
    },
    'copy-3': {
        title: 'Marketing 2026: Nuevo Contrato',
        category: 'Analisis de Tendencias',
        role: 'Research y Redacción',
        description: 'Articulo sobre datos, IA, privacidad y medicion, con foco en impacto real para estrategias de marketing.',
        image: 'https://image.thum.io/get/width/1200/noanimate/https://blog.smarketing360.lat/2026/01/19/marketing-en-2026-el-nuevo-contrato-entre-datos-ia-privacidad-y-medicion-y-como-cambia-todo/',
        articleUrl: 'https://blog.smarketing360.lat/2026/01/19/marketing-en-2026-el-nuevo-contrato-entre-datos-ia-privacidad-y-medicion-y-como-cambia-todo/',
        mediaOrientation: 'web',
        tools: ['Google Docs', 'GA4', 'Looker Studio']
    },
    'copy-4': {
        title: 'Marcas Dominantes en FIFA 2026',
        category: 'Contenido de Marca',
        role: 'Investigación y Storytelling',
        description: 'Exploracion de marcas con mayor presencia en Mexico rumbo al contexto FIFA 2026 y su posicionamiento.',
        image: 'https://image.thum.io/get/width/1200/noanimate/https://blog.smarketing360.lat/2025/12/31/marcas-que-dominan-mexico-en-la-fifa-2026/',
        articleUrl: 'https://blog.smarketing360.lat/2025/12/31/marcas-que-dominan-mexico-en-la-fifa-2026/',
        mediaOrientation: 'web',
        tools: ['WordPress', 'Google Trends', 'Google Docs']
    },
    'copy-5': {
        title: 'Calendario Editorial',
        category: 'Estrategia de Contenido',
        role: 'Planificación y Copy',
        description: 'Definición de temáticas, tono y piezas para mantener consistencia de marca.',
        image: 'images/profiles 2.png',
        tools: ['Notion', 'Google Sheets', 'Trello']
    },
    'copy-6': {
        title: 'Copy para Anuncios',
        category: 'Performance Copy',
        role: 'Redacción de Ads',
        description: 'Variantes de copy para campañas de alcance y conversión en distintas audiencias.',
        image: 'images/profiles 3.png',
        tools: ['Meta Ads', 'Google Ads', 'Notion']
    },
    'foto-1': {
        title: 'Retrato Editorial',
        category: 'Fotografía',
        role: 'Dirección y Edición',
        description: 'Sesión de retrato con edición de color y acabado editorial para branding personal.',
        image: 'images/profiles 1.png',
        tools: ['Lightroom', 'Photoshop', 'Camera Raw']
    },
    'foto-2': {
        title: 'Producto para E-commerce',
        category: 'Fotografía de Producto',
        role: 'Captura y Retoque',
        description: 'Fotografía de producto con limpieza de fondo, color preciso y enfoque comercial.',
        image: 'images/profiles 2.png',
        tools: ['Lightroom', 'Photoshop', 'Canva']
    },
    'foto-3': {
        title: 'Cobertura de Evento',
        category: 'Fotografía de Evento',
        role: 'Fotografía y Selección',
        description: 'Cobertura integral con selección de mejores tomas y edición para entrega rápida.',
        image: 'images/profiles 3.png',
        tools: ['Lightroom', 'Bridge', 'Photoshop']
    },
    'foto-4': {
        title: 'Retoque de Piel Profesional',
        category: 'Post-producción',
        role: 'Retoque Fotográfico',
        description: 'Retoque natural de piel, limpieza de distracciones y ajuste avanzado de color.',
        image: 'images/profiles 1.png',
        tools: ['Photoshop', 'Camera Raw', 'Lightroom']
    },
    'foto-5': {
        title: 'Lookbook de Marca',
        category: 'Moda y Marca',
        role: 'Dirección Visual',
        description: 'Serie fotográfica para catálogo digital y redes sociales con dirección coherente.',
        image: 'images/profiles 2.png',
        tools: ['Lightroom', 'Photoshop', 'Capture One']
    },
    'foto-6': {
        title: 'Fotografía Lifestyle',
        category: 'Contenido Editorial',
        role: 'Producción y Edición',
        description: 'Fotografía espontánea para contenido de marca con identidad cálida y natural.',
        image: 'images/profiles 3.png',
        tools: ['Lightroom', 'Premiere Pro', 'Canva']
    }
};

// ============================================
// MODAL FUNCTIONALITY
// ============================================
const modal = document.getElementById('projectModal');
const modalClose = document.querySelector('.modal-close');
const modalTriggers = document.querySelectorAll('[data-project]');

function getDriveFileId(url) {
    if (!url) return null;

    const directIdMatch = url.match(/\/file\/d\/([^/]+)/i);
    if (directIdMatch?.[1]) {
        return directIdMatch[1];
    }

    const idParamMatch = url.match(/[?&]id=([^&]+)/i);
    if (idParamMatch?.[1]) {
        return idParamMatch[1];
    }

    return null;
}

function getDriveThumbnailUrl(url, size = 'w1200') {
    const fileId = getDriveFileId(url);
    if (!fileId) return null;
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=${size}`;
}

function getDriveDirectVideoUrls(url) {
    const fileId = getDriveFileId(url);
    if (!fileId) return [];

    return [
        `https://drive.google.com/uc?export=download&id=${fileId}`,
        `https://drive.usercontent.google.com/download?id=${fileId}&export=download&confirm=t`,
        `https://drive.google.com/uc?export=view&id=${fileId}`
    ];
}

function getDriveEmbedUrl(url) {
    if (!url) return null;

    const folderIdMatch = url.match(/\/drive\/folders\/([^/?]+)/i);
    if (folderIdMatch?.[1]) {
        return `https://drive.google.com/embeddedfolderview?id=${folderIdMatch[1]}#grid`;
    }

    const fileId = getDriveFileId(url);
    if (fileId) {
        return `https://drive.google.com/file/d/${fileId}/preview?rm=minimal`;
    }

    return null;
}

function syncSubpageCardPreviews() {
    const cards = document.querySelectorAll('.subpage-card[data-project]');
    if (!cards.length) return;

    cards.forEach((card) => {
        const projectId = card.getAttribute('data-project');
        if (!projectId) return;

        const project = projectsData[projectId];
        if (!project) return;

        const previewElement = card.querySelector('.subpage-card-media img');
        if (!previewElement) return;
        if (previewElement.dataset.fixedPreview === 'true') return;

        const previewUrl = project.poster || project.image || getDriveThumbnailUrl(project.videoUrl || project.video);
        if (previewUrl) {
            previewElement.src = previewUrl;
        }

        if (project.title) {
            previewElement.alt = project.title;
        }
    });
}

function getYouTubeEmbedUrl(url) {
    if (!url) return null;

    const shortMatch = url.match(/youtu\.be\/([^?&/]+)/i);
    if (shortMatch?.[1]) {
        return `https://www.youtube.com/embed/${shortMatch[1]}`;
    }

    const watchMatch = url.match(/[?&]v=([^?&/]+)/i);
    if (watchMatch?.[1]) {
        return `https://www.youtube.com/embed/${watchMatch[1]}`;
    }

    const embedMatch = url.match(/youtube\.com\/embed\/([^?&/]+)/i);
    if (embedMatch?.[1]) {
        return `https://www.youtube.com/embed/${embedMatch[1]}`;
    }

    return null;
}

function resolveProjectMedia(project) {
    if (!project) return null;

    if (project.articleUrl) {
        return { type: 'iframe', src: project.articleUrl };
    }

    if (project.embedUrl) {
        return { type: 'iframe', src: project.embedUrl };
    }

    const rawVideoUrl = project.videoUrl || project.video;
    if (rawVideoUrl) {
        if (/\.(mp4|webm|ogg|m4v|mov)(\?|#|$)/i.test(rawVideoUrl)) {
            return { type: 'video', src: rawVideoUrl };
        }

        if (/drive\.google\.com/i.test(rawVideoUrl)) {
            const directVideoUrls = getDriveDirectVideoUrls(rawVideoUrl);
            const driveEmbedUrl = getDriveEmbedUrl(rawVideoUrl);

            if (directVideoUrls.length) {
                return {
                    type: 'video',
                    src: directVideoUrls[0],
                    backupSources: directVideoUrls.slice(1),
                    fallbackIframe: driveEmbedUrl
                };
            }

            if (driveEmbedUrl) {
                return { type: 'iframe', src: driveEmbedUrl };
            }
        }

        if (/youtube\.com|youtu\.be/i.test(rawVideoUrl)) {
            const youTubeEmbedUrl = getYouTubeEmbedUrl(rawVideoUrl);
            if (youTubeEmbedUrl) {
                return { type: 'iframe', src: youTubeEmbedUrl };
            }
        }

        if (/vimeo\.com/i.test(rawVideoUrl)) {
            const vimeoId = rawVideoUrl.match(/vimeo\.com\/(\d+)/i)?.[1];
            if (vimeoId) {
                return { type: 'iframe', src: `https://player.vimeo.com/video/${vimeoId}` };
            }
        }

        return { type: 'iframe', src: rawVideoUrl };
    }

    if (project.image) {
        return { type: 'image', src: project.image };
    }

    return null;
}

function createIframeElement(src) {
    const iframeElement = document.createElement('iframe');
    iframeElement.src = src;
    iframeElement.setAttribute('allowfullscreen', '');
    iframeElement.setAttribute('loading', 'lazy');
    iframeElement.setAttribute(
        'allow',
        'autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share'
    );
    iframeElement.referrerPolicy = 'strict-origin-when-cross-origin';
    return iframeElement;
}

function setModalMediaOrientation(orientation) {
    const mediaWrapper = modal?.querySelector('.modal-image');
    const modalBody = modal?.querySelector('.modal-body');
    if (!mediaWrapper) return;

    mediaWrapper.classList.remove('media-portrait', 'media-landscape', 'media-web');
    modalBody?.classList.remove('modal-portrait', 'modal-landscape', 'modal-web');

    if (orientation === 'web') {
        mediaWrapper.classList.add('media-web');
        modalBody?.classList.add('modal-web');
        return;
    }

    if (orientation === 'portrait') {
        mediaWrapper.classList.add('media-portrait');
        modalBody?.classList.add('modal-portrait');
        return;
    }

    mediaWrapper.classList.add('media-landscape');
    modalBody?.classList.add('modal-landscape');
}

function stopAndClearModalMedia() {
    const mediaWrapper = modal?.querySelector('.modal-image');
    const modalBody = modal?.querySelector('.modal-body');
    if (!mediaWrapper) return;

    mediaWrapper.querySelectorAll('video').forEach((video) => {
        video.pause();
        video.removeAttribute('src');
        video.load();
    });

    mediaWrapper.querySelectorAll('iframe').forEach((iframe) => {
        iframe.src = 'about:blank';
    });

    mediaWrapper.innerHTML = '';
    mediaWrapper.classList.remove('media-portrait', 'media-landscape', 'media-web');
    modalBody?.classList.remove('modal-portrait', 'modal-landscape', 'modal-web');
}

function renderModalMedia(project) {
    const mediaWrapper = modal?.querySelector('.modal-image');
    if (!mediaWrapper) return;

    stopAndClearModalMedia();

    const media = resolveProjectMedia(project);
    if (!media) return;

    if (project.mediaOrientation) {
        setModalMediaOrientation(project.mediaOrientation);
    }

    if (media.type === 'video') {
        const videoElement = document.createElement('video');
        videoElement.controls = true;
        videoElement.preload = 'metadata';
        videoElement.playsInline = true;
        videoElement.setAttribute('webkit-playsinline', '');
        if (project.poster || project.image) {
            videoElement.poster = project.poster || project.image;
        }

        const mediaSources = [media.src, ...(media.backupSources || [])].filter(Boolean);
        let sourceIndex = 0;

        const setVideoSource = (index) => {
            videoElement.src = mediaSources[index];
            videoElement.load();
        };

        const fallbackToIframe = () => {
            if (!media.fallbackIframe) return;

            stopAndClearModalMedia();
            if (project.mediaOrientation) {
                setModalMediaOrientation(project.mediaOrientation);
            } else {
                setModalMediaOrientation('landscape');
            }

            mediaWrapper.appendChild(createIframeElement(media.fallbackIframe));
        };

        videoElement.addEventListener('loadedmetadata', () => {
            if (!project.mediaOrientation) {
                const orientation = videoElement.videoHeight > videoElement.videoWidth ? 'portrait' : 'landscape';
                setModalMediaOrientation(orientation);
            }
        });

        videoElement.addEventListener('error', () => {
            sourceIndex += 1;

            if (sourceIndex < mediaSources.length) {
                setVideoSource(sourceIndex);
                return;
            }

            fallbackToIframe();
        });

        if (mediaSources.length) {
            setVideoSource(sourceIndex);
        }

        mediaWrapper.appendChild(videoElement);
        return;
    }

    if (media.type === 'iframe') {
        const iframeElement = createIframeElement(media.src);

        if (!project.mediaOrientation) {
            setModalMediaOrientation('landscape');
        }

        mediaWrapper.appendChild(iframeElement);
        return;
    }

    const imageElement = document.createElement('img');
    imageElement.src = media.src;
    imageElement.alt = project.title || 'Preview del proyecto';
    imageElement.loading = 'lazy';

    imageElement.addEventListener('load', () => {
        if (!project.mediaOrientation) {
            const orientation = imageElement.naturalHeight > imageElement.naturalWidth ? 'portrait' : 'landscape';
            setModalMediaOrientation(orientation);
        }
    });

    mediaWrapper.appendChild(imageElement);
}

function closeProjectModal() {
    if (!modal) return;
    stopAndClearModalMedia();
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

function openProjectModal(projectId) {
    if (!modal || !projectId) return;

    const project = projectsData[projectId];
    if (!project) return;

    const modalCategory = document.getElementById('modalCategory');
    const modalTitle = document.getElementById('modalTitle');
    const modalDescription = document.getElementById('modalDescription');
    const modalRole = document.getElementById('modalRole');
    const toolsContainer = document.getElementById('modalTools');

    if (!modalCategory || !modalTitle || !modalDescription || !modalRole || !toolsContainer) {
        return;
    }

    renderModalMedia(project);
    modalCategory.textContent = project.category;
    modalTitle.textContent = project.title;
    modalDescription.textContent = project.description;
    modalRole.textContent = project.role;

    const existingArticleLink = document.getElementById('modalArticleLink');
    if (existingArticleLink) {
        existingArticleLink.remove();
    }

    if (project.articleUrl) {
        const articleLink = document.createElement('a');
        articleLink.id = 'modalArticleLink';
        articleLink.className = 'modal-article-link';
        articleLink.href = project.articleUrl;
        articleLink.target = '_blank';
        articleLink.rel = 'noopener noreferrer';
        articleLink.textContent = 'Abrir articulo en nueva pestana';
        modalDescription.insertAdjacentElement('afterend', articleLink);
    }

    toolsContainer.innerHTML = '';
    project.tools.forEach((tool) => {
        const toolElement = document.createElement('span');
        toolElement.className = 'modal-tool';
        toolElement.textContent = tool;
        toolsContainer.appendChild(toolElement);
    });

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

modalTriggers.forEach((trigger) => {
    const isNavLink = trigger.tagName === 'A' && trigger.hasAttribute('href') && trigger.dataset.openModal !== 'true';
    if (isNavLink) return;

    trigger.addEventListener('click', (event) => {
        const projectId = trigger.getAttribute('data-project');
        if (!projectId) return;

        if (trigger.tagName === 'A') {
            event.preventDefault();
        }

        openProjectModal(projectId);
    });
});

if (modalClose) {
    modalClose.addEventListener('click', closeProjectModal);
}

if (modal) {
    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeProjectModal();
        }
    });
}

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal?.classList.contains('active')) {
        closeProjectModal();
    }
});

// ============================================
// SMOOTH SCROLL FOR BUTTONS
// ============================================
document.querySelectorAll('.hero-buttons .btn-primary').forEach(btn => {
    btn.addEventListener('click', () => {
        const projectsSection = document.getElementById('projects');
        projectsSection.scrollIntoView({ behavior: 'smooth' });
    });
});

// ============================================
// INTERSECTION OBSERVER FOR ANIMATIONS
// ============================================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = 'fadeInUp 0.6s ease-out forwards';
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe project cards and skill cards
document.querySelectorAll('.project-card, .skill-card').forEach(element => {
    element.style.opacity = '0';
    observer.observe(element);
});

// ============================================
// MARQUEE ANIMATION ENHANCEMENT
// ============================================
const marquees = document.querySelectorAll('.marquee');

marquees.forEach(marquee => {
    // Clone marquee items for seamless loop
    const marqueeText = marquee.querySelector('.marquee-text');
    if (marqueeText) {
        const clone1 = marqueeText.cloneNode(true);
        const clone2 = marqueeText.cloneNode(true);
        marquee.appendChild(clone1);
        marquee.appendChild(clone2);
    }
});

// ============================================
// CONTACT BUTTONS
// ============================================
const whatsappBtn = document.querySelector('.btn-contact.whatsapp');
const emailBtn = document.querySelector('.btn-contact.email');
const cvBtn = document.querySelector('.btn-contact.cv');

if (whatsappBtn) {
    whatsappBtn.addEventListener('click', () => {
        window.open('https://wa.me/your-number', '_blank');
    });
}

if (emailBtn) {
    emailBtn.addEventListener('click', () => {
        window.location.href = 'mailto:your-email@example.com';
    });
}

if (cvBtn) {
    cvBtn.addEventListener('click', () => {
        // Replace with your CV download link
        window.open('path/to/your/cv.pdf', '_blank');
    });
}

// ============================================
// LAZY LOADING IMAGES
// ============================================
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src || img.src;
                img.classList.add('loaded');
                observer.unobserve(img);
            }
        });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// ============================================
// MOBILE MENU (if needed in future)
// ============================================
// Add mobile menu functionality here if needed

console.log('✨ Yazmin Moreno Portfolio - Loaded Successfully');
