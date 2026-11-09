(() => {
  'use strict';
  const projects = window.PORTFOLIO_PROJECTS || [];
  const byId = Object.fromEntries(projects.map(project => [project.id, project]));
  const modal = document.getElementById('project-modal');
  const panel = modal.querySelector('.modal-panel');
  const media = document.getElementById('modal-media');
  const closeButton = document.getElementById('modal-close');
  const theme = document.getElementById('theme-switch');
  let lastFocused = null;
  let currentProjectIndex = 0;
  const modalPrev = document.getElementById('modal-prev');
  const modalNext = document.getElementById('modal-next');

  function displayText(id, value) {
    const elem = document.getElementById(id);
    if (elem) elem.textContent = value || '';
  }

  function makeEmbed(provider, id, title) {
    if (!/^[A-Za-z0-9_-]{8,}$/.test(id)) throw new Error('ID de reproductor incorrecto');
    const frame = document.createElement('iframe');
    frame.title = `Reproductor integrado — ${title}`;
    frame.allowFullscreen = true;
    frame.loading = 'eager';
    frame.referrerPolicy = 'strict-origin-when-cross-origin';
    frame.allow = 'autoplay; encrypted-media; fullscreen; picture-in-picture; web-share';
    if (provider === 'youtube') {
      frame.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&playsinline=1`;
    } else if (provider === 'drive') {
      frame.src = `https://drive.google.com/file/d/${id}/preview`;
    } else {
      throw new Error('Plataforma no soportada');
    }
    return frame;
  }

  function createVideoShell(project) {
    const shell = document.createElement('div');
    shell.className = 'video-shell';
    const viewport = document.createElement('div');
    viewport.className = `player-viewport ${project.aspect === 'portrait' ? 'portrait' : ''}`;
    shell.appendChild(viewport);
    if (project.embed) viewport.appendChild(makeEmbed(project.embed.provider, project.embed.id, project.title));

    if (project.links && project.links.length) {
      const choices = document.createElement('div');
      choices.className = 'video-choices';
      project.links.forEach((link, i) => {
        const match = new URL(link.url).searchParams.get('v') || new URL(link.url).pathname.split('/').filter(Boolean).pop();
        const button = document.createElement('button');
        button.type = 'button';
        button.textContent = `MUESTRA ${String(i + 1).padStart(2, '0')}`;
        button.setAttribute('aria-label', `Reproducir muestra ${i + 1} de ${project.title}`);
        button.setAttribute('aria-pressed', i === 0 ? 'true' : 'false');
        button.addEventListener('click', () => {
          if (button.getAttribute('aria-pressed') === 'true') return;
          choices.querySelectorAll('button').forEach(item => item.setAttribute('aria-pressed', 'false'));
          button.setAttribute('aria-pressed', 'true');
          viewport.replaceChildren(makeEmbed('youtube', match, `${project.title} · Muestra ${i + 1}`));
        });
        choices.appendChild(button);
      });
      shell.appendChild(choices);
    }

    const label = document.createElement('p');
    label.className = 'privacy-note';
    label.textContent = project.embed?.provider === 'youtube'
      ? 'Reproducción integrada de YouTube · El video permanece dentro de la página.'
      : 'Reproducción integrada desde Google Drive.';
    shell.appendChild(label);
    return shell;
  }

  function createGallery(project) {
    const wrap = document.createElement('div');
    wrap.className = 'gallery-wrap';
    const gallery = document.createElement('div');
    gallery.className = 'gallery swipe-gallery';
    gallery.tabIndex = 0;
    gallery.setAttribute('aria-label', `Carrusel deslizable de ${project.title}. Usa las flechas o desliza horizontalmente.`);
    let current = 0;
    const slides = (project.gallery || []).map((src, i) => {
      const slide = document.createElement('div');
      slide.className = 'gallery-slide';
      const img = document.createElement('img');
      img.src = src;
      img.loading = 'lazy';
      img.alt = `Lámina ${i + 1} de ${project.gallery.length} — ${project.title}`;
      slide.appendChild(img);
      gallery.appendChild(slide);
      return slide;
    });
    wrap.appendChild(gallery);
    const controls = document.createElement('div');
    controls.className = 'gallery-controls';
    const previous = document.createElement('button');
    previous.type = 'button';
    previous.className = 'gallery-arrow';
    previous.textContent = '←';
    previous.setAttribute('aria-label', 'Lámina anterior');
    const next = document.createElement('button');
    next.type = 'button';
    next.className = 'gallery-arrow';
    next.textContent = '→';
    next.setAttribute('aria-label', 'Lámina siguiente');
    const status = document.createElement('span');
    status.className = 'gallery-status';
    status.setAttribute('aria-live', 'polite');
    const dots = document.createElement('div');
    dots.className = 'gallery-dots';
    const pointButtons = slides.map((_, i) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.setAttribute('aria-label', `Ver lámina ${i + 1}`);
      btn.addEventListener('click', () => goTo(i));
      dots.appendChild(btn);
      return btn;
    });
    function update() {
      status.textContent = `${String(current + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
      previous.disabled = current === 0;
      next.disabled = current === slides.length - 1;
      pointButtons.forEach((b, i) => b.setAttribute('aria-current', i === current ? 'true' : 'false'));
    }
    function goTo(index) {
      current = Math.max(0, Math.min(slides.length - 1, index));
      gallery.scrollTo({ left: slides[current].offsetLeft - gallery.offsetLeft, behavior: 'smooth' });
      update();
    }
    previous.addEventListener('click', () => goTo(current - 1));
    next.addEventListener('click', () => goTo(current + 1));
    let scrollFrame;
    gallery.addEventListener('scroll', () => {
      if (scrollFrame) cancelAnimationFrame(scrollFrame);
      scrollFrame = requestAnimationFrame(() => {
        const width = gallery.clientWidth || 1;
        current = Math.max(0, Math.min(slides.length - 1, Math.round(gallery.scrollLeft / width)));
        update();
      });
    }, {passive:true});
    gallery.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault(); goTo(current + (e.key === 'ArrowRight' ? 1 : -1));
      }
    });
    controls.append(previous, dots, status, next);
    wrap.appendChild(controls);
    const hint = document.createElement('p');
    hint.className = 'gallery-hint';
    hint.textContent = 'DESLIZA HACIA LOS LADOS ↔';
    wrap.appendChild(hint);
    update();
    return wrap;
  }

  function openModal(project) {
    if (!project) return;
    lastFocused = document.activeElement;
    currentProjectIndex = Math.max(0, projects.findIndex(p => p.id === project.id));
    displayText('modal-count', `YAZMIN MORENO / PROYECTO ${project.number}`);
    displayText('modal-cat', project.category);
    displayText('modal-title', project.title);
    displayText('modal-subtitle', project.subtitle);
    displayText('modal-summary', project.summary);
    displayText('modal-role', project.role);
    const tags = document.getElementById('modal-tools');
    tags.replaceChildren();
    for (const tool of project.tools || []) {
      const span = document.createElement('span');
      span.textContent = tool;
      tags.appendChild(span);
    }
    media.replaceChildren(project.kind === 'design' ? createGallery(project) : createVideoShell(project));
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    modalPrev.disabled = currentProjectIndex === 0;
    modalNext.disabled = currentProjectIndex === projects.length - 1;
    closeButton.focus();
  }

  function closeModal() {
    if (!modal.classList.contains('open')) return;
    // Removing the iframe, rather than hiding it, is essential to stop video/audio.
    media.replaceChildren();
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
  }

  document.querySelectorAll('[data-project]').forEach(card => {
    const button = card.querySelector('.card-hit');
    if (button) button.addEventListener('click', () => openModal(byId[card.dataset.project]));
  });
  function navigateProject(direction) {
    const nextIndex = Math.max(0, Math.min(projects.length - 1, currentProjectIndex + direction));
    if (nextIndex === currentProjectIndex) return;
    // Do not return focus to the card while changing the project inside the dialog.
    openModal(projects[nextIndex]);
    panel.querySelector('.modal-inner').scrollTop = 0;
  }
  modalPrev.addEventListener('click', () => navigateProject(-1));
  modalNext.addEventListener('click', () => navigateProject(1));
  closeButton.addEventListener('click', closeModal);
  modal.querySelector('.modal-backdrop').addEventListener('click', closeModal);
  document.addEventListener('keydown', e => {
    if (!modal.classList.contains('open')) return;
    if (e.key === 'Escape') closeModal();
    if ((e.key === 'ArrowUp' || e.key === 'ArrowDown') && !e.target.closest('.swipe-gallery')) {
      e.preventDefault(); navigateProject(e.key === 'ArrowDown' ? 1 : -1);
    }
    if (e.key === 'Tab') {
      const focusable = Array.from(panel.querySelectorAll('a[href], button:not([disabled])')).filter(el => el.offsetParent !== null);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  // Optional TikTok-like vertical swipe between projects, only on non-interactive copy area.
  let gestureStart = null;
  const copyPane = panel.querySelector('.modal-copy');
  copyPane.addEventListener('touchstart', e => {
    if (e.touches.length !== 1 || e.target.closest('button, a, iframe')) return;
    gestureStart = {y: e.touches[0].clientY, x: e.touches[0].clientX, time: Date.now()};
  }, {passive:true});
  copyPane.addEventListener('touchend', e => {
    if (!gestureStart || !e.changedTouches.length) return;
    const dy = e.changedTouches[0].clientY - gestureStart.y;
    const dx = e.changedTouches[0].clientX - gestureStart.x;
    const quick = Date.now() - gestureStart.time < 650;
    gestureStart = null;
    if (quick && Math.abs(dy) > 95 && Math.abs(dy) > 1.5 * Math.abs(dx)) navigateProject(dy < 0 ? 1 : -1);
  }, {passive:true});

  document.querySelectorAll('.filter').forEach(button => {
    button.addEventListener('click', () => {
      const selected = button.dataset.filter;
      document.querySelectorAll('.filter').forEach(f => {
        const active = f === button;
        f.classList.toggle('active', active);
        f.setAttribute('aria-pressed', String(active));
      });
      document.querySelectorAll('.project-card').forEach(card => {
        card.hidden = selected !== 'all' && card.dataset.kind !== selected;
      });
    });
  });

  const navTargets = document.querySelectorAll('.mobile-dock a[href^="#"]');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.filter(e=>e.isIntersecting).forEach(e => {
        navTargets.forEach(link => link.classList.toggle('active', link.getAttribute('href') === '#' + e.target.id));
      });
    }, {rootMargin:'-25% 0px -55% 0px'});
    document.querySelectorAll('#top, #proyectos, #extras, #contacto').forEach(el=>observer.observe(el));
  }

  const savedTheme = (() => { try { return localStorage.getItem('ym-theme'); } catch { return null; } })();
  if (savedTheme === 'dark') document.documentElement.dataset.theme = 'dark';
  theme.addEventListener('click', () => {
    const isDark = document.documentElement.dataset.theme === 'dark';
    document.documentElement.dataset.theme = isDark ? 'light' : 'dark';
    try { localStorage.setItem('ym-theme', isDark ? 'light' : 'dark'); } catch { /* optional */ }
  });
})();
