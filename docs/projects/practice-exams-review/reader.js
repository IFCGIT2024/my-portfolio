(() => {
  'use strict';
  const contents = document.querySelector('.contents');
  const media = window.matchMedia('(max-width: 740px)');
  const setContents = () => { contents.open = !media.matches; };
  setContents();
  media.addEventListener('change', setContents);
  const article = document.getElementById('paper');
  const progress = document.getElementById('reading-progress');
  const links = [...document.querySelectorAll('.contents a')];
  const sections = [...article.querySelectorAll('.paper-section')];
  let pending = false;
  const update = () => {
    const rect = article.getBoundingClientRect();
    const fraction = Math.max(0, Math.min(1, (120 - rect.top) / Math.max(1, rect.height - window.innerHeight + 120)));
    progress.style.width = `${fraction * 100}%`;
    let active = sections[0];
    for (const section of sections) {
      if (section.getBoundingClientRect().top <= 160) active = section;
    }
    links.forEach(link => {
      const current = link.hash === `#${active?.id}`;
      link.classList.toggle('active', current);
      if (current) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    pending = false;
  };
  const requestUpdate = () => { if (!pending) { pending = true; requestAnimationFrame(update); } };
  window.addEventListener('scroll', requestUpdate, {passive: true});
  window.addEventListener('resize', requestUpdate);
  update();
  const status = document.getElementById('copy-status');
  let timeout;
  const notify = message => {
    status.textContent = message;
    status.classList.add('visible');
    clearTimeout(timeout);
    timeout = setTimeout(() => status.classList.remove('visible'), 4000);
  };
  document.querySelector('[data-copy]').addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(location.href);
      notify('Page link copied');
    } catch {
      notify('Copy this page’s address from your browser to share it.');
    }
  });
  document.querySelector('[data-print]').addEventListener('click', () => window.print());
  let fontSize = 19;
  try {
    const saved = Number(localStorage.getItem('assessment-paper-text-size'));
    if ([17, 19, 21, 23].includes(saved)) fontSize = saved;
  } catch { /* Reading remains available if storage is blocked. */ }
  const applySize = () => {
    document.documentElement.style.setProperty('--article-size', `${fontSize}px`);
    document.querySelector('[data-font="down"]').disabled = fontSize <= 17;
    document.querySelector('[data-font="up"]').disabled = fontSize >= 23;
  };
  document.querySelectorAll('[data-font]').forEach(button => button.addEventListener('click', () => {
    fontSize = Math.min(23, Math.max(17, fontSize + (button.dataset.font === 'up' ? 2 : -2)));
    applySize();
    try { localStorage.setItem('assessment-paper-text-size', String(fontSize)); } catch {}
    requestUpdate();
  }));
  applySize();
})();
