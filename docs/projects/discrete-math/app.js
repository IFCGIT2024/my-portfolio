/* ============================================================
   Discrete Math for CS — Navigation & Slide Mode
   ============================================================ */

(function () {
  'use strict';

  // ---- NAV DATA ----
  const modules = [
    { num: 1, title: 'Integers, Definitions & Proofs', classes: ['Parity, Variables & Direct Proof', 'Divisibility Relations', 'Primes & the Euclidean Algorithm'] },
    { num: 2, title: 'Remainders, Modular Arithmetic & Primes', classes: ['Quotient-Remainder Theorem', 'Modular Arithmetic & Congruence', 'Primes, Factorization & CRT'] },
    { num: 3, title: 'Logic, Quantifiers & Program Reasoning', classes: ['Propositional Logic & Truth Tables', 'Implication, Contraposition & Quantifiers', 'Logical Reasoning in Programs'] },
    { num: 4, title: 'Sets, Set Operations & Data Collections', classes: ['Sets and Membership', 'Set Operations & Distributive Laws', 'Power Sets, Indexed Families & Partitions'] },
    { num: 5, title: 'Functions, Relations & Mappings', classes: ['Functions and Domains', 'Relations and Properties', 'Injective, Surjective & Bijective Functions'] },
    { num: 6, title: 'Induction, Recursion & Recursive Definitions', classes: ['Principle of Mathematical Induction', 'Strong Induction & Recursive Definitions', 'Recursive Sets & Structural Induction'] },
    { num: 7, title: 'Counting, Growth & Finite Reasoning', classes: ['Sum and Product Principles', 'Binomial Coefficients & Combinations', 'Pigeonhole Principle & Probability'] },
    { num: 8, title: 'Algorithms, Loop Invariants & Correctness', classes: ['Specifications, Pre/Postconditions', 'Loop Invariants in Sorting & Searching', 'Termination & Variant Functions'] },
    { num: 9, title: 'Trees, Complexity & Verification', classes: ['Binary Trees and Recursion', 'Full & Balanced Binary Trees', 'Applications, Complexity & Verification'] },
  ];

  // ---- BUILD NAV ----
  function buildNav() {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;

    const currentPage = location.pathname.split('/').pop() || 'index.html';

    let html = `
      <div class="nav-header">
        <h1>Discrete Math for CS</h1>
        <div class="author">by Mizel Cluett</div>
      </div>
      <div class="nav-body">
        <div class="nav-section">
          <a class="nav-section-title" href="index.html" style="cursor:pointer">
            🏠 Home
          </a>
        </div>`;

    // Modules
    modules.forEach(m => {
      const pad = String(m.num).padStart(2, '0');
      const moduleFile = `module-${pad}.html`;
      const labFile = `lab-${pad}.html`;
      const assignFile = `assignment-${pad}.html`;
      const quizFile = `quiz-${pad}.html`;
      const isOpen = currentPage === moduleFile || currentPage === labFile || currentPage === assignFile || currentPage === quizFile;

      html += `
        <div class="nav-section${isOpen ? ' open' : ''}">
          <button class="nav-section-title" onclick="this.parentElement.classList.toggle('open')">
            <span>Module ${m.num}: ${m.title}</span>
            <span class="chevron">▶</span>
          </button>
          <div class="nav-children">`;

      m.classes.forEach((c, i) => {
        html += `<a class="nav-link${currentPage === moduleFile ? ' active' : ''}" href="${moduleFile}#class-${i + 1}">Class ${i + 1}: ${c}</a>`;
      });

      html += `<a class="nav-link${currentPage === labFile ? ' active' : ''}" href="${labFile}">Lab</a>`;
      html += `<a class="nav-link${currentPage === assignFile ? ' active' : ''}" href="${assignFile}">Assignment</a>`;
      html += `<a class="nav-link${currentPage === quizFile ? ' active' : ''}" href="${quizFile}">Practice Quiz</a>`;
      html += `</div></div>`;
    });

    // Labs dropdown
    html += `
      <div class="nav-dropdown">
        <div class="nav-section">
          <button class="nav-section-title" onclick="this.parentElement.classList.toggle('open')">
            <span>🔬 All Labs</span>
            <span class="chevron">▶</span>
          </button>
          <div class="nav-children">`;
    modules.forEach(m => {
      const pad = String(m.num).padStart(2, '0');
      html += `<a class="nav-link" href="lab-${pad}.html">Lab ${m.num}: ${m.title}</a>`;
    });
    html += `</div></div></div>`;

    // Assignments dropdown
    html += `
      <div class="nav-dropdown">
        <div class="nav-section">
          <button class="nav-section-title" onclick="this.parentElement.classList.toggle('open')">
            <span>📝 All Assignments</span>
            <span class="chevron">▶</span>
          </button>
          <div class="nav-children">`;
    modules.forEach(m => {
      const pad = String(m.num).padStart(2, '0');
      html += `<a class="nav-link" href="assignment-${pad}.html">Assignment ${m.num}: ${m.title}</a>`;
    });
    html += `</div></div></div>`;

    // Quizzes dropdown
    html += `
      <div class="nav-dropdown">
        <div class="nav-section">
          <button class="nav-section-title" onclick="this.parentElement.classList.toggle('open')">
            <span>✅ All Quizzes</span>
            <span class="chevron">▶</span>
          </button>
          <div class="nav-children">`;
    modules.forEach(m => {
      const pad = String(m.num).padStart(2, '0');
      html += `<a class="nav-link" href="quiz-${pad}.html">Quiz ${m.num}: ${m.title}</a>`;
    });
    html += `</div></div></div>`;

    html += `</div>`; // end nav-body
    sidebar.innerHTML = html;
  }

  // ---- MOBILE NAV TOGGLE ----
  function setupMobileNav() {
    const toggle = document.getElementById('nav-toggle');
    const sidebar = document.getElementById('sidebar');
    if (!toggle || !sidebar) return;

    toggle.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });

    // Close nav on link click (mobile)
    sidebar.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 700) sidebar.classList.remove('open');
      });
    });
  }

  // ---- SLIDE MODE ----
  let slideIndex = 0;
  let slides = [];

  function initSlideMode() {
    const viewToggle = document.getElementById('view-toggle');
    if (!viewToggle) return;

    viewToggle.addEventListener('click', () => {
      document.body.classList.toggle('slide-mode');
      if (document.body.classList.contains('slide-mode')) {
        viewToggle.textContent = '📄 Scroll View';
        enterSlideMode();
      } else {
        viewToggle.textContent = '🖥️ Slide View';
        exitSlideMode();
      }
    });

    // Keyboard nav
    document.addEventListener('keydown', (e) => {
      if (!document.body.classList.contains('slide-mode')) return;
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); nextSlide(); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); prevSlide(); }
      if (e.key === 'Escape') {
        document.body.classList.remove('slide-mode');
        document.getElementById('view-toggle').textContent = '🖥️ Slide View';
        exitSlideMode();
      }
    });
  }

  function enterSlideMode() {
    slides = document.querySelectorAll('.slide');
    slideIndex = 0;
    if (slides.length > 0) showSlide(0);
    updateSlideCounter();
  }

  function exitSlideMode() {
    slides.forEach(s => s.classList.remove('active-slide'));
  }

  function showSlide(idx) {
    slides.forEach(s => s.classList.remove('active-slide'));
    if (slides[idx]) {
      slides[idx].classList.add('active-slide');
      slideIndex = idx;
    }
    updateSlideCounter();
  }

  function nextSlide() {
    if (slideIndex < slides.length - 1) showSlide(slideIndex + 1);
  }

  function prevSlide() {
    if (slideIndex > 0) showSlide(slideIndex - 1);
  }

  function updateSlideCounter() {
    const counter = document.getElementById('slide-counter');
    if (counter) counter.textContent = `${slideIndex + 1} / ${slides.length}`;
  }

  // ---- Expose slide nav for buttons ----
  window.nextSlide = nextSlide;
  window.prevSlide = prevSlide;

  // ---- INIT ----
  document.addEventListener('DOMContentLoaded', () => {
    buildNav();
    setupMobileNav();
    initSlideMode();

    // KaTeX auto-render
    if (typeof renderMathInElement === 'function') {
      renderMathInElement(document.body, {
        delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '$', right: '$', display: false },
        ],
        throwOnError: false
      });
    }

    // highlight.js
    if (typeof hljs !== 'undefined') {
      document.querySelectorAll('pre code').forEach(block => {
        hljs.highlightElement(block);
      });
    }
  });

})();
