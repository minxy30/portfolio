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
    gallery.className = 'gallery';
    (project.gallery || []).forEach((src, i) => {
      const img = document.createElement('img');
      img.src = src;
      img.loading = 'lazy';
      img.alt = `Diseño ${i + 1} de la serie ${project.title}`;
      gallery.appendChild(img);
    });
    wrap.appendChild(gallery);
    return wrap;
  }

  function openModal(project) {
    if (!project) return;
    lastFocused = document.activeElement;
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
  closeButton.addEventListener('click', closeModal);
  modal.querySelector('.modal-backdrop').addEventListener('click', closeModal);
  document.addEventListener('keydown', e => {
    if (!modal.classList.contains('open')) return;
    if (e.key === 'Escape') closeModal();
    if (e.key === 'Tab') {
      const focusable = Array.from(panel.querySelectorAll('a[href], button:not([disabled])')).filter(el => el.offsetParent !== null);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

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

  const savedTheme = (() => { try { return localStorage.getItem('ym-theme'); } catch { return null; } })();
  if (savedTheme === 'dark') document.documentElement.dataset.theme = 'dark';
  theme.addEventListener('click', () => {
    const isDark = document.documentElement.dataset.theme === 'dark';
    document.documentElement.dataset.theme = isDark ? 'light' : 'dark';
    try { localStorage.setItem('ym-theme', isDark ? 'light' : 'dark'); } catch { /* optional */ }
  });
})();
