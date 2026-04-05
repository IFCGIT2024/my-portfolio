#!/usr/bin/env node
/**
 * Build script: converts course Markdown files → HTML site
 * Usage: node build.js
 */

const fs = require('fs');
const path = require('path');

const COURSE_DIR = path.join(__dirname, '..', 'course');
const SITE_DIR = path.join(__dirname);

// -------- MARKDOWN → HTML CONVERTER --------

function mdToHtml(md) {
  // Normalize line endings
  let html = md.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // Protect code blocks from other transformations
  const codeBlocks = [];
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
    const idx = codeBlocks.length;
    const escaped = escapeHtml(code.trimEnd());
    codeBlocks.push(`<pre><code class="language-${lang || 'text'}">${escaped}</code></pre>`);
    return `%%CODEBLOCK_${idx}%%`;
  });

  // Protect inline code
  const inlineCodes = [];
  html = html.replace(/`([^`\n]+?)`/g, (_, code) => {
    const idx = inlineCodes.length;
    inlineCodes.push(`<code>${escapeHtml(code)}</code>`);
    return `%%INLINECODE_${idx}%%`;
  });

  // Protect math blocks ($$...$$)
  const mathBlocks = [];
  html = html.replace(/\$\$([\s\S]*?)\$\$/g, (_, math) => {
    const idx = mathBlocks.length;
    mathBlocks.push(`<div class="katex-block">$$${math}$$</div>`);
    return `%%MATHBLOCK_${idx}%%`;
  });

  // Protect inline math ($...$) — but not dollar amounts
  const inlineMaths = [];
  html = html.replace(/\$([^\$\n]+?)\$/g, (_, math) => {
    const idx = inlineMaths.length;
    inlineMaths.push(`$${math}$`);
    return `%%INLINEMATH_${idx}%%`;
  });

  // Process line by line
  const lines = html.split('\n');
  let result = [];
  let inTable = false;
  let inList = false;
  let listType = '';
  let inBlockquote = false;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // Horizontal rule
    if (/^---+\s*$/.test(line)) {
      closeOpenBlocks();
      result.push('<hr>');
      continue;
    }

    // Headers (make into slides for h2)
    const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headerMatch) {
      closeOpenBlocks();
      const level = headerMatch[1].length;
      const text = processInline(headerMatch[2]);

      if (level === 2) {
        // Close previous slide if any
        if (result.length > 0 && result[result.length - 1] !== '</section>') {
          // Find if there's an open slide
          const lastSlideOpen = result.lastIndexOf('<section class="slide">');
          const lastSlideClose = result.lastIndexOf('</section>');
          if (lastSlideOpen > lastSlideClose) {
            result.push('</section>');
          }
        }
        const id = text.replace(/<[^>]+>/g, '').replace(/[^\w]+/g, '-').toLowerCase().replace(/^-|-$/g, '');
        result.push(`<section class="slide" id="${id}">`);
        result.push(`<h${level}>${text}</h${level}>`);
      } else {
        if (level === 1) {
          // Close any open slide before h1
          const lastSlideOpen = result.lastIndexOf('<section class="slide">');
          const lastSlideClose = result.lastIndexOf('</section>');
          if (lastSlideOpen > lastSlideClose) {
            result.push('</section>');
          }
        }
        const id = level <= 3 ? ` id="${text.replace(/<[^>]+>/g, '').replace(/[^\w]+/g, '-').toLowerCase().replace(/^-|-$/g, '')}"` : '';
        result.push(`<h${level}${id}>${text}</h${level}>`);
      }
      continue;
    }

    // Table
    if (line.includes('|') && line.trim().startsWith('|')) {
      if (!inTable) {
        // Check if next line is separator
        const nextLine = lines[i + 1] || '';
        if (nextLine.match(/^\|[\s-:|]+\|?\s*$/)) {
          inTable = true;
          result.push('<table>');
          // Header row
          const cells = parseCells(line);
          result.push('<thead><tr>');
          cells.forEach(c => result.push(`<th>${processInline(c)}</th>`));
          result.push('</tr></thead><tbody>');
          i++; // skip separator line
          continue;
        }
      }
      if (inTable) {
        const cells = parseCells(line);
        result.push('<tr>');
        cells.forEach(c => result.push(`<td>${processInline(c)}</td>`));
        result.push('</tr>');
        // Check if next line is still a table
        const nextLine = lines[i + 1] || '';
        if (!nextLine.includes('|') || !nextLine.trim().startsWith('|')) {
          inTable = false;
          result.push('</tbody></table>');
        }
        continue;
      }
    }

    // Blockquote
    if (line.startsWith('> ')) {
      if (!inBlockquote) {
        closeList();
        inBlockquote = true;
        result.push('<blockquote>');
      }
      result.push(`<p>${processInline(line.substring(2))}</p>`);
      const nextLine = lines[i + 1] || '';
      if (!nextLine.startsWith('> ')) {
        inBlockquote = false;
        result.push('</blockquote>');
      }
      continue;
    }

    // Unordered list
    if (line.match(/^(\s*)[-*]\s+(.+)$/)) {
      const match = line.match(/^(\s*)[-*]\s+(.+)$/);
      if (!inList || listType !== 'ul') {
        closeList();
        inList = true;
        listType = 'ul';
        result.push('<ul>');
      }
      result.push(`<li>${processInline(match[2])}</li>`);
      const nextLine = lines[i + 1] || '';
      if (!nextLine.match(/^(\s*)[-*]\s+/) && !nextLine.match(/^\s+\S/)) {
        closeList();
      }
      continue;
    }

    // Ordered list
    if (line.match(/^(\s*)\d+\.\s+(.+)$/)) {
      const match = line.match(/^(\s*)\d+\.\s+(.+)$/);
      if (!inList || listType !== 'ol') {
        closeList();
        inList = true;
        listType = 'ol';
        result.push('<ol>');
      }
      result.push(`<li>${processInline(match[2])}</li>`);
      const nextLine = lines[i + 1] || '';
      if (!nextLine.match(/^(\s*)\d+\.\s+/) && !nextLine.match(/^\s+\S/)) {
        closeList();
      }
      continue;
    }

    // Code block placeholder
    if (line.match(/^%%CODEBLOCK_\d+%%$/)) {
      closeOpenBlocks();
      result.push(line);
      continue;
    }

    // Math block placeholder
    if (line.match(/^%%MATHBLOCK_\d+%%$/)) {
      result.push(line);
      continue;
    }

    // Empty line
    if (line.trim() === '') {
      closeList();
      result.push('');
      continue;
    }

    // Paragraph
    closeList();
    result.push(`<p>${processInline(line)}</p>`);
  }

  // Close any remaining open blocks
  closeOpenBlocks();

  // Close last slide section if open
  const lastSlideOpen = result.lastIndexOf('<section class="slide">');
  const lastSlideClose = result.lastIndexOf('</section>');
  if (lastSlideOpen > lastSlideClose) {
    result.push('</section>');
  }

  html = result.join('\n');

  // Restore placeholders
  codeBlocks.forEach((block, i) => {
    html = html.replace(`%%CODEBLOCK_${i}%%`, block);
  });
  inlineCodes.forEach((code, i) => {
    html = html.replace(`%%INLINECODE_${i}%%`, code);
  });
  mathBlocks.forEach((block, i) => {
    html = html.replace(`%%MATHBLOCK_${i}%%`, block);
  });
  inlineMaths.forEach((m, i) => {
    html = html.replace(`%%INLINEMATH_${i}%%`, m);
  });

  return html;

  // Helper functions
  function closeOpenBlocks() {
    closeList();
    if (inBlockquote) {
      result.push('</blockquote>');
      inBlockquote = false;
    }
  }

  function closeList() {
    if (inList) {
      result.push(listType === 'ul' ? '</ul>' : '</ol>');
      inList = false;
      listType = '';
    }
  }
}

function processInline(text) {
  // Bold+italic
  text = text.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  // Bold
  text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  // Italic
  text = text.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>');
  // Links
  text = text.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>');
  // Checkboxes
  text = text.replace(/\[ \]/g, '☐');
  text = text.replace(/\[x\]/gi, '☑');
  return text;
}

function parseCells(line) {
  return line.split('|').filter((_, i, arr) => i > 0 && i < arr.length - 1).map(c => c.trim());
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// -------- HTML TEMPLATE --------

function htmlTemplate(title, bodyContent, pageId) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} — Discrete Math for CS</title>
  <link rel="stylesheet" href="style.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.9.0/build/styles/atom-one-dark.min.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Fira+Code:wght@400;500&display=swap" rel="stylesheet">
</head>
<body data-page="${pageId}">
  <button id="nav-toggle" aria-label="Toggle navigation">☰</button>
  <nav id="sidebar"></nav>
  <main id="main">
    <div class="page-content">
${bodyContent}
    </div>
  </main>
  <button id="view-toggle">🖥️ Slide View</button>
  <div class="slide-controls">
    <button onclick="prevSlide()">◀ Prev</button>
    <span id="slide-counter">1 / 1</span>
    <button onclick="nextSlide()">Next ▶</button>
  </div>
  <script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js"></script>
  <script src="https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.9.0/build/highlight.min.js"></script>
  <script src="https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.9.0/build/languages/java.min.js"></script>
  <script src="app.js"></script>
</body>
</html>`;
}

// -------- LANDING PAGE --------

function buildLandingPage() {
  const modules = [
    { num: 1, title: 'Integers, Definitions & Proofs', desc: 'Parity, divisibility, primes, GCD, direct proof and counterexample.' },
    { num: 2, title: 'Remainders & Modular Arithmetic', desc: 'Quotient-remainder theorem, congruences, CRT, prime factorization.' },
    { num: 3, title: 'Logic, Quantifiers & Programs', desc: 'Propositional logic, implication, quantifiers, Design by Contract.' },
    { num: 4, title: 'Sets & Data Collections', desc: 'Set operations, power sets, partitions, De Morgan\'s laws for sets.' },
    { num: 5, title: 'Functions, Relations & Mappings', desc: 'Domains, composition, injection, surjection, equivalence relations.' },
    { num: 6, title: 'Induction & Recursion', desc: 'Weak, strong, and structural induction. Recursive definitions.' },
    { num: 7, title: 'Counting & Finite Reasoning', desc: 'Counting principles, binomial coefficients, pigeonhole, probability.' },
    { num: 8, title: 'Algorithms & Correctness', desc: 'Specifications, loop invariants, Hoare logic, termination proofs.' },
    { num: 9, title: 'Trees, Complexity & Verification', desc: 'BSTs, heaps, Big-O, structural induction on trees, formal verification.' },
  ];

  let body = `
      <div class="hero">
        <h1>Discrete Math for CS</h1>
        <p class="subtitle">by Mizel Cluett</p>
        <p style="max-width:600px;margin:0 auto 2rem;color:var(--text-muted)">
          A complete 30-class course bridging discrete mathematics, formal proof,
          and Java programming. Every concept is presented with rigorous proofs
          <em>and</em> runnable Java code.
        </p>
      </div>
      <h2 style="text-align:center;border:none">Course Modules</h2>
      <div class="module-grid">`;

  modules.forEach(m => {
    const pad = String(m.num).padStart(2, '0');
    body += `
        <a class="module-card" href="module-${pad}.html">
          <div class="module-num">Module ${m.num}</div>
          <h3>${m.title}</h3>
          <p>${m.desc}</p>
        </a>`;
  });

  body += `
      </div>`;

  return htmlTemplate('Home', body, 'index');
}

// -------- BUILD --------

function build() {
  console.log('Building Discrete Math for CS site...\n');

  // Landing page
  fs.writeFileSync(path.join(SITE_DIR, 'index.html'), buildLandingPage());
  console.log('  ✓ index.html');

  // Process each module
  for (let m = 1; m <= 9; m++) {
    const pad = String(m).padStart(2, '0');
    const moduleDir = path.join(COURSE_DIR, `module-${pad}`);

    // Module page (combine classes 1-3)
    let moduleBody = '';
    for (let c = 1; c <= 3; c++) {
      const classFile = path.join(moduleDir, `class-${pad2(c)}.md`);
      if (fs.existsSync(classFile)) {
        const md = fs.readFileSync(classFile, 'utf-8');
        moduleBody += `<div id="class-${c}" class="class-section">\n`;
        moduleBody += mdToHtml(md);
        moduleBody += `\n</div>\n<hr>\n`;
      }
    }
    const moduleHtml = htmlTemplate(`Module ${m}`, moduleBody, `module-${pad}`);
    fs.writeFileSync(path.join(SITE_DIR, `module-${pad}.html`), moduleHtml);
    console.log(`  ✓ module-${pad}.html`);

    // Lab
    const labFile = path.join(moduleDir, 'lab.md');
    if (fs.existsSync(labFile)) {
      const labMd = fs.readFileSync(labFile, 'utf-8');
      const labHtml = htmlTemplate(`Module ${m} Lab`, mdToHtml(labMd), `lab-${pad}`);
      fs.writeFileSync(path.join(SITE_DIR, `lab-${pad}.html`), labHtml);
      console.log(`  ✓ lab-${pad}.html`);
    }

    // Assignment
    const assignFile = path.join(moduleDir, 'assignment.md');
    if (fs.existsSync(assignFile)) {
      const assignMd = fs.readFileSync(assignFile, 'utf-8');
      const assignHtml = htmlTemplate(`Module ${m} Assignment`, mdToHtml(assignMd), `assignment-${pad}`);
      fs.writeFileSync(path.join(SITE_DIR, `assignment-${pad}.html`), assignHtml);
      console.log(`  ✓ assignment-${pad}.html`);
    }
  }

  console.log('\n✅ Build complete!');
  const files = fs.readdirSync(SITE_DIR).filter(f => f.endsWith('.html'));
  console.log(`   ${files.length} HTML files generated in site/`);
}

function pad2(n) {
  return String(n).padStart(2, '0');
}

build();
