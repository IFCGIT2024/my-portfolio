/* Simply the Best House-Sitters — client renderer (PORTFOLIO DEMO BUILD)
   Static-only variant of the production SPA.
   Differences from the live site:
     - Content is fetched from a co-located siteContent.json (no /api/content).
     - Routing is hash-based (#/pricing) so deep links work on GitHub Pages.
     - The quote form does not POST; it shows the success panel client-side
       with a note pointing to the real email address. */

(() => {
  'use strict';

  const state = {
    content: null,
    error: null,
  };

  // ---------- Utilities ----------
  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function escapeHTML(s) {
    if (s == null) return '';
    return String(s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  const escapeAttr = escapeHTML;
  function nl2p(s) {
    if (!s) return '';
    return String(s).trim().split(/\n{2,}/).map(p => `<p>${escapeHTML(p).replace(/\n/g, '<br />')}</p>`).join('');
  }

  function getPath() {
    // Hash-based routing: strip the leading '#'. Empty hash -> home.
    let p = (window.location.hash || '').replace(/^#/, '') || '/';
    if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1);
    return p;
  }

  function icon(name) {
    const paths = (state.content && state.content.iconSet) || {};
    const d = paths[name];
    if (!d) {
      // Fallback: a small dot
      return '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/></svg>';
    }
    return `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${d}"/></svg>`;
  }

  function starRow(n) {
    n = Math.max(0, Math.min(5, Math.round(Number(n) || 0)));
    return '★★★★★☆☆☆☆☆'.slice(5 - n, 5 - n + 5);
  }

  function formatDate(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short' });
  }

  // ---------- Init ----------
  async function init() {
    try {
      const res = await fetch('siteContent.json', { headers: { 'Accept': 'application/json' } });
      if (!res.ok) throw new Error('Content unavailable (' + res.status + ')');
      state.content = await res.json();
    } catch (err) {
      state.error = err.message || 'Failed to load site content';
    }
    renderHeader();
    renderFooter();
    render();
    setupRouting();
    setupHeaderBehaviour();
  }

  // ---------- Header / footer / nav ----------
  function renderHeader() {
    const nav = $('#siteNav');
    if (!nav || !state.content) return;
    const items = state.content.nav || [];
    const cta = state.content.primaryCta || { label: 'Request a Quote', url: '/request-a-quote' };
    const here = getPath();
    nav.innerHTML =
      items.map(i => {
        const active = (i.url === here || (i.url !== '/' && here.startsWith(i.url))) ? ' is-active' : '';
        return `<a href="${escapeAttr(i.url)}" data-link class="${active.trim()}">${escapeHTML(i.label)}</a>`;
      }).join('')
      + `<a href="${escapeAttr(cta.url)}" data-link class="nav-cta">${escapeHTML(cta.label)}</a>`;

    const toggle = $('#navToggle');
    if (toggle) {
      toggle.onclick = () => {
        const open = nav.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      };
    }
  }

  function renderFooter() {
    const foot = $('#siteFooter');
    if (!foot || !state.content) return;
    const site = state.content.site || {};
    const f = state.content.footer || { columns: [], legal: [] };
    const yr = new Date().getFullYear();
    foot.innerHTML = `
      <div class="container">
        <div class="site-footer__top">
          <div class="site-footer__brand">
            <h4>${escapeHTML(site.shortName || site.name || '')}</h4>
            <p>${escapeHTML(f.tagline || '')}</p>
            ${site.email ? `<p><a href="mailto:${escapeAttr(site.email)}">${escapeHTML(site.email)}</a></p>` : ''}
            ${site.phone ? `<p>${escapeHTML(site.phone)}</p>` : ''}
          </div>
          ${(f.columns || []).map(col => `
            <div>
              <h4>${escapeHTML(col.heading)}</h4>
              <ul>
                ${(col.links || []).map(l => `<li><a href="${escapeAttr(l.url)}" data-link>${escapeHTML(l.label)}</a></li>`).join('')}
              </ul>
            </div>
          `).join('')}
        </div>
        <div class="site-footer__bottom">
          <div>© ${yr} ${escapeHTML(site.name || '')}. All rights reserved.</div>
          <nav>${(f.legal || []).map(l => `<a href="${escapeAttr(l.url)}" data-link>${escapeHTML(l.label)}</a>`).join('')}</nav>
        </div>
      </div>`;
  }

  // ---------- Routing ----------
  function setupRouting() {
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[data-link]');
      if (!a) return;
      const href = a.getAttribute('href') || '';
      if (!href || href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('#')) return;
      e.preventDefault();
      // Hash routing: setting location.hash triggers hashchange -> render().
      const target = href.startsWith('/') ? href : '/' + href;
      if (target !== getPath()) {
        window.location.hash = target;
      } else {
        render();
        window.scrollTo({ top: 0, behavior: 'auto' });
      }
      // Close mobile nav
      const nav = $('#siteNav');
      const toggle = $('#navToggle');
      if (nav) nav.classList.remove('is-open');
      if (toggle) toggle.setAttribute('aria-expanded', 'false');
    });
    window.addEventListener('hashchange', () => {
      render();
      window.scrollTo({ top: 0, behavior: 'auto' });
    });
  }

  function setupHeaderBehaviour() {
    const header = $('#siteHeader');
    if (!header) return;
    let last = -1;
    const onScroll = () => {
      const y = window.scrollY;
      const scrolled = y > 24;
      if (scrolled !== (last > 24)) header.classList.toggle('is-scrolled', scrolled);
      last = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ---------- Fade-in observer ----------
  function bindFadeIns(root) {
    const els = root.querySelectorAll('.fade-in');
    if (!('IntersectionObserver' in window)) {
      els.forEach(el => el.classList.add('is-visible'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    els.forEach(el => io.observe(el));
  }

  // ---------- Router ----------
  function render() {
    renderHeader(); // refresh active state
    const app = $('#app');
    if (!app) return;
    if (!state.content) {
      app.innerHTML = renderError(state.error || 'Loading…');
      return;
    }
    const path = getPath();
    const routes = {
      '/':                          renderHome,
      '/services':                  renderServices,
      '/pricing':                   renderPricing,
      '/is-this-right-for-you':     renderIsThisRight,
      '/about':                     renderAbout,
      '/reviews':                   renderReviews,
      '/faq':                       renderFaq,
      '/careers':                   renderCareers,
      '/contact':                   renderContact,
      '/request-a-quote':           renderRequestQuote,
      '/privacy':                   renderPrivacy,
      '/terms':                     renderTerms,
    };
    const fn = routes[path] || renderNotFound;
    app.innerHTML = fn();
    document.title = titleFor(path);
    bindFadeIns(app);
    afterRender(path);
  }

  function titleFor(path) {
    const site = (state.content && state.content.site) || {};
    const base = site.name || 'Simply the Best House-Sitters';
    const map = {
      '/':                       base + ' — ' + (site.tagline || ''),
      '/services':               'Services · ' + base,
      '/pricing':                'Pricing · ' + base,
      '/is-this-right-for-you':  'Is This Right For You? · ' + base,
      '/about':                  'About · ' + base,
      '/reviews':                'Reviews · ' + base,
      '/faq':                    'FAQ · ' + base,
      '/careers':                'Careers · ' + base,
      '/contact':                'Contact · ' + base,
      '/request-a-quote':        'Request a Quote · ' + base,
    };
    return map[path] || base;
  }

  function renderError(msg) {
    return `
      <section class="section">
        <div class="container">
          <div class="notfound">
            <h1>Something went wrong.</h1>
            <p>${escapeHTML(msg)}</p>
            <a class="btn" href="/" data-link>Return home</a>
          </div>
        </div>
      </section>`;
  }

  function renderNotFound() {
    return `
      <section class="section">
        <div class="container">
          <div class="notfound fade-in">
            <p class="eyebrow">404</p>
            <h1>This page is quiet.</h1>
            <p>The page you're looking for isn't here. It might have moved.</p>
            <a class="btn" href="/" data-link>Return home</a>
          </div>
        </div>
      </section>`;
  }

  // ---------- Page hero ----------
  function pageHero(p) {
    const h = (p && p.hero) || {};
    return `
      <section class="page-hero">
        <div class="container">
          <div class="page-hero__copy fade-in">
            ${h.eyebrow ? `<p class="eyebrow">${escapeHTML(h.eyebrow)}</p>` : ''}
            <h1>${escapeHTML(h.title || '')}</h1>
            ${h.subtitle ? `<p class="lead">${escapeHTML(h.subtitle)}</p>` : ''}
          </div>
        </div>
      </section>`;
  }

  // ==========================================================================
  //   HOME
  // ==========================================================================
  function renderHome() {
    const p = (state.content.pages || {}).home || {};
    const site = state.content.site || {};
    const services = (state.content.pages && state.content.pages.services && state.content.pages.services.items) || [];
    const testimonials = state.content.testimonials || [];
    const faqPreview = firstFaqItems(3);

    const heroImage = p.hero && p.hero.image
      ? `<div class="hero__image hero__image--photo" style="background-image:url('${escapeAttr(p.hero.image)}')"><div class="hero__image-badge">${escapeHTML(site.serviceArea || '')}</div></div>`
      : `<div class="hero__image"><div class="hero__image-badge">${escapeHTML(site.serviceArea || '')}</div></div>`;

    return [
      // Hero
      `<section class="hero">
        <div class="container hero__inner">
          <div class="hero__copy fade-in">
            ${p.hero && p.hero.eyebrow ? `<p class="eyebrow">${escapeHTML(p.hero.eyebrow)}</p>` : ''}
            <h1 class="hero__title">${escapeHTML((p.hero && p.hero.title) || '')}</h1>
            <p class="hero__subtitle">${escapeHTML((p.hero && p.hero.subtitle) || '')}</p>
            <div class="hero__actions">
              ${btn(p.hero && p.hero.primaryCta, 'btn')}
              ${btn(p.hero && p.hero.secondaryCta, 'btn btn--ghost')}
            </div>
          </div>
          <div class="fade-in">${heroImage}</div>
        </div>
      </section>`,

      // Intro
      p.intro ? `
      <section class="section section--tight">
        <div class="container">
          <div class="split fade-in">
            <div class="split__side">
              ${p.intro.eyebrow ? `<p class="eyebrow">${escapeHTML(p.intro.eyebrow)}</p>` : ''}
              <h2>${escapeHTML(p.intro.heading || '')}</h2>
            </div>
            <div class="split__content body-text">${nl2p(p.intro.body || '')}</div>
          </div>
        </div>
      </section>` : '',

      // Benefits
      p.benefits ? `
      <section class="section section--cream">
        <div class="container">
          <div class="section__head fade-in">
            <h2>${escapeHTML(p.benefits.heading || '')}</h2>
          </div>
          <div class="grid-3 fade-in">
            ${(p.benefits.items || []).map(item => `
              <div class="card">
                <div class="card__icon">${icon(item.icon)}</div>
                <h3 class="card__title">${escapeHTML(item.title)}</h3>
                <p class="card__body">${escapeHTML(item.body)}</p>
              </div>
            `).join('')}
          </div>
        </div>
      </section>` : '',

      // Services teaser
      p.servicesTeaser && services.length ? `
      <section class="section">
        <div class="container">
          <div class="section__head section__head--left fade-in">
            <h2>${escapeHTML(p.servicesTeaser.heading || '')}</h2>
            <p>${escapeHTML(p.servicesTeaser.body || '')}</p>
          </div>
          <div class="grid-3 services-grid fade-in">
            ${services.slice(0, 6).map(s => `
              <a class="card service-card" href="/services#${escapeAttr(s.id)}" data-link>
                <div class="card__icon">${icon(s.icon)}</div>
                <h3 class="card__title">${escapeHTML(s.name)}</h3>
                <p class="card__body">${escapeHTML(s.blurb)}</p>
              </a>
            `).join('')}
          </div>
          <p style="margin-top:2rem"><a class="btn btn--ghost" href="/services" data-link>See all services</a></p>
        </div>
      </section>` : '',

      // What's included
      p.included ? `
      <section class="section section--cream">
        <div class="container">
          <div class="split fade-in">
            <div class="split__side">
              <p class="eyebrow">Included</p>
              <h2>${escapeHTML(p.included.heading || '')}</h2>
            </div>
            <div class="split__content">
              <ul class="check-list check-list--large">
                ${(p.included.items || []).map(i => `
                  <li>
                    <div>
                      <span class="check-list__title">${escapeHTML(i.title)}</span>
                      <span class="check-list__body">${escapeHTML(i.body || '')}</span>
                    </div>
                  </li>
                `).join('')}
              </ul>
            </div>
          </div>
        </div>
      </section>` : '',

      // How it works
      p.howItWorks ? `
      <section class="section">
        <div class="container">
          <div class="section__head fade-in">
            <h2>${escapeHTML(p.howItWorks.heading || '')}</h2>
          </div>
          <ol class="steps grid-2 fade-in">
            ${(p.howItWorks.steps || []).map(s => `
              <li class="step">
                <div class="step__number">${escapeHTML(String(s.number || ''))}</div>
                <div>
                  <div class="step__title">${escapeHTML(s.title || '')}</div>
                  <p class="step__body">${escapeHTML(s.body || '')}</p>
                </div>
              </li>
            `).join('')}
          </ol>
        </div>
      </section>` : '',

      // Long-term & Snowbirds
      p.longTerm ? `
      <section class="section section--cream">
        <div class="container">
          <div class="split fade-in">
            <div class="split__side">
              ${p.longTerm.eyebrow ? `<p class="eyebrow">${escapeHTML(p.longTerm.eyebrow)}</p>` : ''}
              <h2>${escapeHTML(p.longTerm.heading || '')}</h2>
            </div>
            <div class="split__content body-text">
              <p>${escapeHTML(p.longTerm.body || '')}</p>
              ${p.longTerm.cta ? `<p style="margin-top:1.75rem">${btn(p.longTerm.cta, 'btn')}</p>` : ''}
            </div>
          </div>
        </div>
      </section>` : '',

      // Testimonials preview
      testimonials.length ? `
      <section class="section section--forest">
        <div class="container">
          <div class="section__head fade-in">
            <p class="eyebrow">Testimonials</p>
            <h2>What clients say.</h2>
          </div>
          <div class="grid-3 fade-in">
            ${testimonials.slice(0, 3).map(renderTestimonialCard).join('')}
          </div>
          <p style="margin-top:2rem"><a class="btn btn--white" href="/reviews" data-link>Read more reviews</a></p>
        </div>
      </section>` : '',

      // Pricing preview
      p.pricingPreview ? `
      <section class="section">
        <div class="container">
          <div class="callout fade-in">
            <div>
              <h2>${escapeHTML(p.pricingPreview.heading || '')}</h2>
              <p>${escapeHTML(p.pricingPreview.body || '')}</p>
            </div>
            <div class="callout__actions">
              ${btn(p.pricingPreview.cta, 'btn btn--gold')}
            </div>
          </div>
        </div>
      </section>` : '',

      // FAQ preview
      faqPreview.length ? `
      <section class="section section--cream">
        <div class="container">
          <div class="section__head fade-in">
            <h2>${escapeHTML((p.faqPreview && p.faqPreview.heading) || 'Common questions')}</h2>
          </div>
          <div class="faq fade-in">
            ${faqPreview.map(q => faqItem(q)).join('')}
          </div>
          <p style="text-align:center;margin-top:2rem"><a class="btn btn--ghost" href="/faq" data-link>See full FAQ</a></p>
        </div>
      </section>` : '',

      // Bottom CTA
      p.cta ? `
      <section class="section section--tight">
        <div class="container">
          <div class="callout fade-in">
            <div>
              <h2>${escapeHTML(p.cta.heading || '')}</h2>
              <p>${escapeHTML(p.cta.body || '')}</p>
            </div>
            <div class="callout__actions">
              ${btn(p.cta.primaryCta, 'btn btn--gold')}
            </div>
          </div>
        </div>
      </section>` : ''
    ].join('');
  }

  function btn(spec, cls) {
    if (!spec || !spec.label || !spec.url) return '';
    return `<a class="${cls || 'btn'}" href="${escapeAttr(spec.url)}" data-link>${escapeHTML(spec.label)}</a>`;
  }

  function renderTestimonialCard(t) {
    const stars = t.rating ? starRow(t.rating) : '';
    return `
      <blockquote class="testimonial">
        <p class="testimonial__quote">${escapeHTML(t.quote)}</p>
        <div>
          ${stars ? `<div class="testimonial__stars" aria-label="${t.rating} out of 5">${stars}</div>` : ''}
          <div class="testimonial__meta">${escapeHTML(t.name || '')}${t.location ? ' · ' + escapeHTML(t.location) : ''}${t.date ? ' · ' + escapeHTML(formatDate(t.date)) : ''}</div>
        </div>
      </blockquote>`;
  }

  // ==========================================================================
  //   SERVICES
  // ==========================================================================
  function renderServices() {
    const p = (state.content.pages || {}).services || {};
    const items = p.items || [];
    return [
      pageHero(p),
      `<section class="section">
        <div class="container">
          ${p.note ? `<p class="lead fade-in" style="margin-bottom:2.5rem">${escapeHTML(p.note)}</p>` : ''}
          <div class="grid-3 services-grid fade-in">
            ${items.map(s => `
              <article class="card service-card" id="${escapeAttr(s.id)}">
                <div class="card__icon">${icon(s.icon)}</div>
                <h3 class="card__title">${escapeHTML(s.name)}</h3>
                <p class="card__body">${escapeHTML(s.blurb)}</p>
              </article>
            `).join('')}
          </div>
        </div>
      </section>`,
      bottomCta()
    ].join('');
  }

  // ==========================================================================
  //   PRICING
  // ==========================================================================
  function renderPricing() {
    const p = (state.content.pages || {}).pricing || {};
    const base = p.base || {}, inc = p.included || {}, add = p.addons || {}, surch = p.surcharges || {}, ex = p.examples || {};
    return [
      pageHero(p),
      `<section class="section section--tight">
        <div class="container">
          <div class="grid-2 fade-in">
            <div class="price-block price-block--dark">
              <p class="eyebrow" style="color:var(--c-gold)">${escapeHTML(base.heading || 'Base rate')}</p>
              <div class="price-line">${escapeHTML(base.priceLine || '')}</div>
              <p style="color:rgba(255,255,255,0.85);margin:0">${escapeHTML(base.body || '')}</p>
            </div>
            <div class="price-block">
              <p class="eyebrow">${escapeHTML(inc.heading || 'Always included')}</p>
              <ul class="check-list" style="margin-top:1rem">
                ${(inc.items || []).map(i => `<li><div>${escapeHTML(i)}</div></li>`).join('')}
              </ul>
            </div>
          </div>
        </div>
      </section>`,
      `<section class="section section--tight section--cream">
        <div class="container">
          <div class="grid-2 fade-in">
            <div>
              <h2>${escapeHTML(add.heading || 'Common add-ons')}</h2>
              <table class="price-table" style="margin-top:1rem">
                <tbody>
                  ${(add.items || []).map(i => `
                    <tr>
                      <td>${escapeHTML(i.name)}</td>
                      <td class="price">${escapeHTML(i.price)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
            <div>
              <h2>${escapeHTML(surch.heading || 'Holiday & short-notice')}</h2>
              <ul class="check-list" style="margin-top:1rem">
                ${(surch.items || []).map(i => `<li><div>${escapeHTML(i)}</div></li>`).join('')}
              </ul>
            </div>
          </div>
        </div>
      </section>`,
      `<section class="section section--tight">
        <div class="container">
          <div class="section__head section__head--left fade-in">
            <h2>${escapeHTML(ex.heading || 'Example quotes')}</h2>
          </div>
          <div class="grid-3 fade-in">
            ${(ex.items || []).map(e => `
              <div class="card">
                <h3 class="card__title">${escapeHTML(e.label)}</h3>
                <p class="card__body">${escapeHTML(e.detail)}</p>
                <p style="font-family:var(--font-heading);font-weight:600;color:var(--c-navy);font-size:1.2rem;margin:1rem 0 0">${escapeHTML(e.price)}</p>
              </div>
            `).join('')}
          </div>
          ${p.note ? `<p class="lead" style="margin-top:2.5rem;font-size:0.95rem;color:var(--c-mute)">${escapeHTML(p.note)}</p>` : ''}
        </div>
      </section>`,
      bottomCta()
    ].join('');
  }

  // ==========================================================================
  //   IS THIS RIGHT FOR YOU
  // ==========================================================================
  function renderIsThisRight() {
    const p = (state.content.pages || {})['isThisRight'] || {};
    return [
      pageHero(p),
      `<section class="section">
        <div class="container">
          <div class="prose fade-in" style="margin:0 auto">
            ${(p.sections || []).map(s => `
              <h2>${escapeHTML(s.heading)}</h2>
              ${nl2p(s.body)}
            `).join('')}
          </div>
        </div>
      </section>`,
      p.cta ? `
      <section class="section section--tight">
        <div class="container">
          <div class="callout fade-in">
            <div><h2>${escapeHTML(p.cta.heading || '')}</h2></div>
            <div class="callout__actions">${btn(p.cta.primaryCta, 'btn btn--gold')}</div>
          </div>
        </div>
      </section>` : ''
    ].join('');
  }

  // ==========================================================================
  //   ABOUT
  // ==========================================================================
  function renderAbout() {
    const p = (state.content.pages || {}).about || {};
    return [
      pageHero(p),
      `<section class="section">
        <div class="container">
          <div class="prose fade-in" style="margin:0 auto">
            ${(p.sections || []).map(s => `
              <h2>${escapeHTML(s.heading)}</h2>
              ${nl2p(s.body)}
            `).join('')}
          </div>
        </div>
      </section>`,
      bottomCta()
    ].join('');
  }

  // ==========================================================================
  //   REVIEWS
  // ==========================================================================
  function renderReviews() {
    const p = (state.content.pages || {}).reviews || {};
    const list = state.content.testimonials || [];
    return [
      pageHero(p),
      `<section class="section">
        <div class="container">
          <div class="grid-3 fade-in">
            ${list.map(renderTestimonialCard).join('')}
          </div>
        </div>
      </section>`,
      p.cta ? `
      <section class="section section--tight">
        <div class="container">
          <div class="callout fade-in">
            <div>
              <h2>${escapeHTML(p.cta.heading || '')}</h2>
              <p>${escapeHTML(p.cta.body || '')}</p>
            </div>
            <div class="callout__actions">
              ${btn(p.cta.primaryCta, 'btn btn--gold')}
            </div>
          </div>
        </div>
      </section>` : ''
    ].join('');
  }

  // ==========================================================================
  //   FAQ
  // ==========================================================================
  function renderFaq() {
    const p = (state.content.pages || {}).faq || {};
    const groups = state.content.faq || [];
    return [
      pageHero(p),
      `<section class="section">
        <div class="container">
          <div class="faq fade-in">
            ${groups.map(g => `
              <div class="faq-group">
                <p class="faq-group__title">${escapeHTML(g.category)}</p>
                ${(g.items || []).map(faqItem).join('')}
              </div>
            `).join('')}
          </div>
        </div>
      </section>`
    ].join('');
  }
  function faqItem(q) {
    return `
      <details class="faq-item">
        <summary>${escapeHTML(q.q)}</summary>
        <div class="faq-item__body">${nl2p(q.a)}</div>
      </details>`;
  }
  function firstFaqItems(n) {
    const out = [];
    const groups = state.content && state.content.faq || [];
    for (const g of groups) for (const it of (g.items || [])) { out.push(it); if (out.length >= n) return out; }
    return out;
  }

  // ==========================================================================
  //   CAREERS
  // ==========================================================================
  function renderCareers() {
    const p = (state.content.pages || {}).careers || {};
    return [
      pageHero(p),
      `<section class="section">
        <div class="container">
          <div class="prose fade-in" style="margin:0 auto">
            ${p.intro ? `<h2>${escapeHTML(p.intro.heading)}</h2>${nl2p(p.intro.body)}` : ''}
            ${p.requirements ? `<h2>${escapeHTML(p.requirements.heading)}</h2><ul>${(p.requirements.items||[]).map(i=>`<li>${escapeHTML(i)}</li>`).join('')}</ul>` : ''}
            ${p.training     ? `<h2>${escapeHTML(p.training.heading)}</h2><ul>${(p.training.items||[]).map(i=>`<li>${escapeHTML(i)}</li>`).join('')}</ul>` : ''}
          </div>
        </div>
      </section>`,
      p.cta ? `
      <section class="section section--tight">
        <div class="container">
          <div class="callout fade-in">
            <div>
              <h2>${escapeHTML(p.cta.heading || '')}</h2>
              <p>${escapeHTML(p.cta.body || '')}</p>
            </div>
            <div class="callout__actions">${btn(p.cta.primaryCta, 'btn btn--gold')}</div>
          </div>
        </div>
      </section>` : ''
    ].join('');
  }

  // ==========================================================================
  //   CONTACT
  // ==========================================================================
  function renderContact() {
    const p = (state.content.pages || {}).contact || {};
    const d = p.details || {};
    return [
      pageHero(p),
      `<section class="section">
        <div class="container">
          <div class="grid-2 fade-in">
            <div class="prose">
              ${d.email ? `<p><strong>Email</strong><br><a href="mailto:${escapeAttr(d.email)}">${escapeHTML(d.email)}</a></p>` : ''}
              ${d.phone ? `<p><strong>Phone</strong><br>${escapeHTML(d.phone)}</p>` : ''}
              ${d.hours ? `<p><strong>Hours</strong><br>${escapeHTML(d.hours)}</p>` : ''}
              ${d.serviceArea ? `<p><strong>Service area</strong><br>${escapeHTML(d.serviceArea)}</p>` : ''}
              ${d.responseNote ? `<p style="color:var(--c-mute)">${escapeHTML(d.responseNote)}</p>` : ''}
            </div>
            <div>
              <div class="price-block price-block--dark">
                <p class="eyebrow" style="color:var(--c-gold)">Fastest way</p>
                <h3 style="color:var(--c-white)">Request a Quote</h3>
                <p style="color:rgba(255,255,255,0.85)">The quote form captures everything we need and gets you a written reply within one business day.</p>
                <p style="margin-top:1.5rem"><a class="btn btn--gold" href="/request-a-quote" data-link>Start a quote</a></p>
              </div>
            </div>
          </div>
        </div>
      </section>`
    ].join('');
  }

  // ==========================================================================
  //   REQUEST A QUOTE
  // ==========================================================================
  function renderRequestQuote() {
    const p = (state.content.pages || {}).requestQuote || {};
    const addons = p.addons || [];
    return [
      pageHero(p),
      `<section class="section">
        <div class="container">
          <div id="quoteContainer" class="fade-in" style="max-width:820px">
            ${p.helperText ? `<p class="lead" style="margin-bottom:2rem">${escapeHTML(p.helperText)}</p>` : ''}
            <form id="quoteForm" class="form" novalidate>
              <div class="form__row">
                <div class="field">
                  <label for="q-name">Your name</label>
                  <input type="text" id="q-name" name="name" autocomplete="name" required />
                </div>
                <div class="field">
                  <label for="q-email">Email</label>
                  <input type="email" id="q-email" name="email" autocomplete="email" required />
                </div>
              </div>
              <div class="form__row">
                <div class="field">
                  <label for="q-phone">Phone (optional)</label>
                  <input type="tel" id="q-phone" name="phone" autocomplete="tel" />
                </div>
                <div class="field">
                  <label for="q-contactPreference">Preferred contact</label>
                  <select id="q-contactPreference" name="contactPreference">
                    <option value="Email">Email</option>
                    <option value="Text">Text</option>
                    <option value="Phone call">Phone call</option>
                  </select>
                </div>
              </div>
              <div class="form__row">
                <div class="field">
                  <label for="q-startDate">Start date</label>
                  <input type="date" id="q-startDate" name="startDate" required />
                </div>
                <div class="field">
                  <label for="q-endDate">End date</label>
                  <input type="date" id="q-endDate" name="endDate" required />
                </div>
              </div>
              <div class="form__row">
                <div class="field">
                  <label for="q-petCount">Number of pets</label>
                  <input type="text" id="q-petCount" name="petCount" placeholder="e.g. 1 dog, 2 cats" />
                </div>
                <div class="field">
                  <label for="q-travelPurpose">Travel purpose (optional)</label>
                  <select id="q-travelPurpose" name="travelPurpose">
                    <option value="">Not specified</option>
                    <option>Vacation</option>
                    <option>Business travel</option>
                    <option>Wedding</option>
                    <option>Family / personal</option>
                    <option>Emergency</option>
                  </select>
                </div>
              </div>
              <div class="field">
                <label for="q-petTypes">Tell us about your pets</label>
                <textarea id="q-petTypes" name="petTypes" placeholder="Names, ages, temperaments, any special needs…"></textarea>
              </div>
              <div class="field">
                <label for="q-address">Home address (neighbourhood is fine)</label>
                <input type="text" id="q-address" name="address" placeholder="e.g. South End, Halifax" />
              </div>
              ${addons.length ? `
                <div class="field">
                  <label>Optional add-ons</label>
                  <div class="chip-list">
                    ${addons.map((a, i) => `
                      <label class="chip">
                        <input type="checkbox" name="addons" value="${escapeAttr(a)}" data-chip />
                        <span>${escapeHTML(a)}</span>
                      </label>
                    `).join('')}
                  </div>
                </div>
              ` : ''}
              <div class="field">
                <label for="q-notes">Anything else we should know?</label>
                <textarea id="q-notes" name="notes" placeholder="Optional"></textarea>
              </div>

              <!-- Honeypot -->
              <div class="field hp" aria-hidden="true">
                <label for="q-website">Leave this field empty</label>
                <input type="text" id="q-website" name="website" tabindex="-1" autocomplete="off" />
              </div>

              <div class="form__footer">
                <div id="quoteStatus" class="form__status"></div>
                <button type="submit" class="btn btn--gold" id="quoteSubmit">Send request</button>
              </div>
            </form>
          </div>
        </div>
      </section>`
    ].join('');
  }

  function afterRender(path) {
    if (path === '/request-a-quote') wireQuoteForm();
    // In-page anchor jumps are disabled in the demo build because
    // location.hash carries the route, not an element id.
  }

  function wireQuoteForm() {
    const form = $('#quoteForm');
    const status = $('#quoteStatus');
    const submit = $('#quoteSubmit');
    if (!form) return;

    // Chip toggle
    form.querySelectorAll('[data-chip]').forEach(cb => {
      const parent = cb.closest('.chip');
      cb.addEventListener('change', () => parent.classList.toggle('is-checked', cb.checked));
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      status.className = 'form__status';
      status.textContent = '';

      const data = new FormData(form);
      const payload = {
        name:              (data.get('name') || '').toString().trim(),
        email:             (data.get('email') || '').toString().trim(),
        phone:             (data.get('phone') || '').toString().trim(),
        startDate:         (data.get('startDate') || '').toString(),
        endDate:           (data.get('endDate') || '').toString(),
        petCount:          (data.get('petCount') || '').toString().trim(),
        petTypes:          (data.get('petTypes') || '').toString().trim(),
        address:           (data.get('address') || '').toString().trim(),
        travelPurpose:     (data.get('travelPurpose') || '').toString(),
        contactPreference: (data.get('contactPreference') || '').toString(),
        notes:             (data.get('notes') || '').toString().trim(),
        website:           (data.get('website') || '').toString(),
        addons:            data.getAll('addons'),
      };

      if (!payload.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
        status.className = 'form__status is-error';
        status.textContent = 'Please enter a valid email address.';
        return;
      }
      if (!payload.name) {
        status.className = 'form__status is-error';
        status.textContent = 'Please tell us your name.';
        return;
      }
      if (!payload.startDate || !payload.endDate) {
        status.className = 'form__status is-error';
        status.textContent = 'Please choose start and end dates.';
        return;
      }

      submit.disabled = true;
      status.className = 'form__status';
      status.textContent = 'Sending…';

      // DEMO BUILD: no server available. Simulate a short delay, then swap in
      // the success panel with a note pointing to the real email address.
      setTimeout(() => {
        const p = (state.content.pages || {}).requestQuote || {};
        const site = state.content.site || {};
        const email = site.email || 'hello@simplythebesthousesitters.com';
        const c = $('#quoteContainer');
        c.innerHTML = `
          <div class="success-panel">
            <h2>${escapeHTML(p.successHeading || 'Request received.')}</h2>
            <p>${escapeHTML(p.successBody || 'Thank you. We will follow up shortly.')}</p>
            <p style="margin-top:1.25rem; padding:1rem; border:1px dashed var(--c-line-strong, #D8CFBE); background:rgba(0,0,0,0.02); font-size:0.95rem;">
              <strong>Portfolio demo notice:</strong> this preview does not send real messages. On the live site the form emails the sitter and stores the request. To reach the real business, email <a href="mailto:${escapeAttr(email)}">${escapeHTML(email)}</a>.
            </p>
            <p style="margin-top:1.25rem"><a class="btn btn--ghost" href="/" data-link>Return home</a></p>
          </div>`;
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 600);
    });
  }

  // ==========================================================================
  //   PRIVACY / TERMS (simple stubs)
  // ==========================================================================
  function renderPrivacy() {
    return [
      pageHero({ hero: { eyebrow: 'Legal', title: 'Privacy', subtitle: 'How we handle information you share with us.' }}),
      `<section class="section"><div class="container">
        <div class="prose fade-in" style="margin:0 auto">
          <p>We collect only what we need to answer your questions and deliver a booking: your name, contact information, dates of travel, pet and home details, and payment records. We do not share this information with third parties, and we do not use it for marketing.</p>
          <p>Quote submissions are stored on our own server for one year and then permanently deleted, unless you become a client — in which case relevant records are retained for as long as your account is active.</p>
          <p>You can request a copy or deletion of your data at any time by emailing us.</p>
        </div>
      </div></section>`
    ].join('');
  }
  function renderTerms() {
    return [
      pageHero({ hero: { eyebrow: 'Legal', title: 'Terms', subtitle: 'The short version of how we operate.' }}),
      `<section class="section"><div class="container">
        <div class="prose fade-in" style="margin:0 auto">
          <p>Requesting a quote does not obligate you to book. A booking is confirmed only when a deposit is paid and both parties have signed a written agreement. Full terms — including cancellation, liability, and emergency procedures — are included in the booking agreement itself.</p>
          <p>This page is a placeholder. A full terms document will be linked here before any client is asked to sign.</p>
        </div>
      </div></section>`
    ].join('');
  }

  // ---------- Shared bottom CTA ----------
  function bottomCta() {
    const site = state.content.site || {};
    const cta = state.content.primaryCta || { label: 'Request a Quote', url: '/request-a-quote' };
    return `
      <section class="section section--tight">
        <div class="container">
          <div class="callout fade-in">
            <div>
              <h2>Have questions? Ready to book?</h2>
              <p>Reach out — the quote form is the fastest way to start a conversation, or email us at ${site.email ? `<a href="mailto:${escapeAttr(site.email)}" style="color:var(--c-gold)">${escapeHTML(site.email)}</a>` : 'our office'}.</p>
            </div>
            <div class="callout__actions">
              <a class="btn btn--gold" href="${escapeAttr(cta.url)}" data-link>${escapeHTML(cta.label)}</a>
            </div>
          </div>
        </div>
      </section>`;
  }

  // ---------- Boot ----------
  document.addEventListener('DOMContentLoaded', init);
})();
