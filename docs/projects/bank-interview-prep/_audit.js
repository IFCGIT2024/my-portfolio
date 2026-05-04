/**
 * DataGuard Academy — Deep Content Audit
 * Checks: tab group/panel pairing, nav chain, quiz structure,
 *         data-goto targets, window.MODULES registrations,
 *         unescaped < > in code blocks, missing CSS classes.
 */
const fs = require('fs');

const files = {
  'data.js':      fs.readFileSync('data.js','utf8'),
  'data-home.js': fs.readFileSync('data-home.js','utf8'),
  'data-m1.js':   fs.readFileSync('data-m1.js','utf8'),
  'data-m2.js':   fs.readFileSync('data-m2.js','utf8'),
  'data-m3.js':   fs.readFileSync('data-m3.js','utf8'),
  'data-m4.js':   fs.readFileSync('data-m4.js','utf8'),
  'data-m5.js':   fs.readFileSync('data-m5.js','utf8'),
  'data-m6.js':   fs.readFileSync('data-m6.js','utf8'),
  'data-m7.js':   fs.readFileSync('data-m7.js','utf8'),
  'data-m8.js':   fs.readFileSync('data-m8.js','utf8'),
  'data-m9.js':   fs.readFileSync('data-m9.js','utf8'),
  'data-m10.js':  fs.readFileSync('data-m10.js','utf8'),
  'app.js':       fs.readFileSync('app.js','utf8'),
  'styles.css':   fs.readFileSync('styles.css','utf8'),
  'index.html':   fs.readFileSync('index.html','utf8'),
};

let issues = [];
function fail(file, msg) { issues.push('[' + file + '] ' + msg); }
function pass(msg) { console.log('  PASS: ' + msg); }

// ── 1. window.MODULES registrations ─────────────────────────────────────────
console.log('\n=== 1. MODULES REGISTERED ===');
const expectedModules = ['home','m1','m2','m3','m4','m5','m6','m7','m8','m9','m10'];
const allJS = Object.entries(files).filter(([k])=>k.endsWith('.js')).map(([,v])=>v).join('\n');
expectedModules.forEach(id => {
  const re = new RegExp('window\\.MODULES\\.' + id + '\\s*=');
  if (re.test(allJS)) pass('window.MODULES.' + id);
  else fail('modules', 'window.MODULES.' + id + ' not found');
});

// ── 2. Sidebar nav items match module IDs ────────────────────────────────────
console.log('\n=== 2. SIDEBAR NAV ITEMS ===');
const html = files['index.html'];
expectedModules.forEach(id => {
  if (html.includes('data-module="' + id + '"')) pass('nav item data-module="' + id + '"');
  else fail('index.html', 'missing nav item data-module="' + id + '"');
});

// ── 3. Script tags in index.html ─────────────────────────────────────────────
console.log('\n=== 3. SCRIPT TAGS IN index.html ===');
const expectedScripts = ['data.js','data-home.js','data-m1.js','data-m2.js','data-m3.js',
  'data-m4.js','data-m5.js','data-m6.js','data-m7.js','data-m8.js','data-m9.js','data-m10.js','app.js'];
expectedScripts.forEach(s => {
  if (html.includes('src="' + s + '"')) pass('script src="' + s + '"');
  else fail('index.html', 'missing <script src="' + s + '">');
});
// Check app.js is last
const lastScript = [...html.matchAll(/src="([^"]+\.js)"/g)].map(m=>m[1]).pop();
if (lastScript === 'app.js') pass('app.js is last script');
else fail('index.html', 'app.js should be last script, found: ' + lastScript);

// ── 4. Navigation chain (_nav calls) ─────────────────────────────────────────
console.log('\n=== 4. NAVIGATION CHAIN ===');
const navChain = [
  { file:'data-m1.js',  expected:"_nav(null, 'm1', 'm2')" },
  { file:'data-m2.js',  expected:"_nav('m1', 'm2', 'm3')" },
  { file:'data-m3.js',  expected:"_nav('m2', 'm3', 'm4')" },
  { file:'data-m4.js',  expected:"_nav('m3', 'm4', 'm5')" },
  { file:'data-m5.js',  expected:"_nav('m4', 'm5', 'm6')" },
  { file:'data-m6.js',  expected:"_nav('m5', 'm6', 'm7')" },
  { file:'data-m7.js',  expected:"_nav('m6', 'm7', 'm8')" },
  { file:'data-m8.js',  expected:"_nav('m7', 'm8', 'm9')" },
  { file:'data-m9.js',  expected:"_nav('m8', 'm9', 'm10')" },
  { file:'data-m10.js', expected:"_nav('m9', 'm10', null)" },
];
navChain.forEach(({file, expected}) => {
  if (files[file].includes(expected)) pass(file + ': ' + expected);
  else fail(file, 'expected ' + expected + ' not found');
});

// ── 5. Tab group consistency ─────────────────────────────────────────────────
console.log('\n=== 5. TAB GROUP CONSISTENCY ===');
const moduleFiles = Object.entries(files).filter(([k])=>k.startsWith('data-m'));
moduleFiles.forEach(([fname, src]) => {
  // Extract all data-tab-group values from buttons
  const btnGroups   = [...src.matchAll(/class="tab-btn[^"]*"[^>]*data-tab-group="([^"]+)"/g)].map(m=>m[1]);
  const panelGroups = [...src.matchAll(/class="tab-panel[^"]*"[^>]*data-tab-group="([^"]+)"/g)].map(m=>m[1]);
  
  if (btnGroups.length === 0 && panelGroups.length === 0) { pass(fname + ': no tabs (ok)'); return; }
  
  const btnSet   = [...new Set(btnGroups)];
  const panelSet = [...new Set(panelGroups)];
  
  btnSet.forEach(g => {
    if (!panelSet.includes(g)) fail(fname, 'tab-group "' + g + '" has buttons but no panels');
    else pass(fname + ': group "' + g + '" buttons+panels match');
  });
  panelSet.forEach(g => {
    if (!btnSet.includes(g)) fail(fname, 'tab-group "' + g + '" has panels but no buttons');
  });

  // Check each group: btn data-tab values match panel data-tab values
  const uniqueGroups = [...new Set([...btnGroups, ...panelGroups])];
  uniqueGroups.forEach(grp => {
    const btnTabs   = [...src.matchAll(new RegExp('data-tab-group="' + grp + '"[^>]*data-tab="([^"]+)"','g'))].map(m=>m[1]);
    const panelTabs = [...src.matchAll(new RegExp('class="tab-panel[^"]*"\\s+data-tab-group="' + grp + '"\\s+data-tab="([^"]+)"','g'))].map(m=>m[1]);
    const btnOnly   = btnTabs.filter(t=>!panelTabs.includes(t));
    const panelOnly = panelTabs.filter(t=>!btnTabs.includes(t));
    if (btnOnly.length)   fail(fname, 'group "'+grp+'": btn tabs with no panel: '+btnOnly.join(', '));
    if (panelOnly.length) fail(fname, 'group "'+grp+'": panels with no btn: '+panelOnly.join(', '));
    if (!btnOnly.length && !panelOnly.length) pass(fname + ': group "' + grp + '" tab IDs all matched');
  });
});

// ── 6. data-goto targets all valid ──────────────────────────────────────────
console.log('\n=== 6. DATA-GOTO TARGETS ===');
const validTargets = new Set(['home','m1','m2','m3','m4','m5','m6','m7','m8','m9','m10']);
const allContent = Object.values(files).join('\n');
const gotoMatches = [...allContent.matchAll(/data-goto="([^"]+)"/g)].map(m=>m[1]);
const badGotos = [...new Set(gotoMatches.filter(t=>!validTargets.has(t)))];
if (badGotos.length) badGotos.forEach(t => fail('*', 'invalid data-goto="'+t+'"'));
else pass('all ' + gotoMatches.length + ' data-goto targets are valid module IDs');

// ── 7. Quiz structures ───────────────────────────────────────────────────────
console.log('\n=== 7. QUIZ STRUCTURES ===');
moduleFiles.forEach(([fname, src]) => {
  const quizBlocks = [...src.matchAll(/_quiz\(\[([\s\S]*?)\]\)/g)];
  if (quizBlocks.length === 0) { pass(fname + ': no quiz'); return; }
  quizBlocks.forEach((block, bi) => {
    // Count {q: markers
    const qCount = (block[1].match(/\bq:/g)||[]).length;
    const correctCount = (block[1].match(/\bcorrect:/g)||[]).length;
    const optionsCount = (block[1].match(/\boptions:/g)||[]).length;
    const explCount = (block[1].match(/\bexplanation:/g)||[]).length;
    if (qCount !== correctCount || qCount !== optionsCount || qCount !== explCount) {
      fail(fname, 'quiz block ' + (bi+1) + ': q='+qCount+' options='+optionsCount+' correct='+correctCount+' explanation='+explCount);
    } else {
      pass(fname + ': quiz block ' + (bi+1) + ' — ' + qCount + ' questions, all fields present');
    }
  });
});

// ── 8. Unescaped < or > inside _cb() code strings ───────────────────────────
console.log('\n=== 8. RAW HTML IN CODE BLOCKS ===');
// Look for _cb( calls — check if any use template literals with < or > directly
// (they should use _esc or const variables)
// We flag any _cb() call where the second arg appears to contain a raw < or >
moduleFiles.forEach(([fname, src]) => {
  // Find lines with _cb that also appear to have < or > in them (not in HTML attr)
  // This is a heuristic — look for _cb('...', `...`) with < inside the template
  const cbInlineRe = /_cb\(['"`][a-z]+['"`],\s*`([^`]*)`\)/g;
  let m;
  while ((m = cbInlineRe.exec(src)) !== null) {
    if (m[1].includes('<') || m[1].includes('>')) {
      fail(fname, '_cb() with inline template literal containing unescaped < or > — use a const variable instead');
    }
  }
  pass(fname + ': no inline unescaped HTML in _cb()');
});

// ── 9. CSS class presence for all used component classes ────────────────────
console.log('\n=== 9. CSS CLASSES PRESENT ===');
const css = files['styles.css'];
const requiredClasses = [
  'page-hero','module-badge','hero-meta','card-grid','card',
  'callout','callout-info','callout-warning','callout-success',
  'code-block','code-header','code-lang','copy-btn',
  'tabs','tab-headers','tab-btn','tab-panel',
  'quiz-card','quiz-q','quiz-options','quiz-option','quiz-feedback','correct-fb','wrong-fb',
  'qa-item','qa-question','qa-q-text','qa-level','basic','mid','senior','qa-chevron','qa-answer','qa-star-answer','qa-star-label',
  'section-nav','btn','btn-primary','btn-secondary','btn-sm',
  'pipeline','pipeline-step',
  'compare-grid','compare-card',
  'stakeholder-grid','stakeholder-card',
  'project-card','project-header','project-title','project-time','project-steps','tag-row','tag',
  'data-table','week-plan',
  'home-modules','home-module-card',
  'nav-item','nav-section','nav-icon','nav-list','done',
  'progress-bar','progress-fill','progress-pct',
];
requiredClasses.forEach(cls => {
  // Check for .cls or cls { in CSS
  const re = new RegExp('\\.' + cls.replace('-','\\-').replace('.','\\.') + '[\\s{:,]');
  if (re.test(css)) pass('.'+cls+' defined');
  else fail('styles.css', 'missing CSS class: .' + cls);
});

// ── 10. Home module cards: m1–m10 all present ────────────────────────────────
console.log('\n=== 10. HOME MODULE CARDS ===');
const homeSrc = files['data-home.js'];
['m1','m2','m3','m4','m5','m6','m7','m8','m9','m10'].forEach(id => {
  if (homeSrc.includes('data-goto="'+id+'"')) pass('home card data-goto="'+id+'" present');
  else fail('data-home.js', 'missing home card for ' + id);
});

// ── 11. QA items in m9 — check structure ────────────────────────────────────
console.log('\n=== 11. Q&A STRUCTURE IN M9 ===');
const m9 = files['data-m9.js'];
const qaItems   = (m9.match(/class="qa-item"/g)||[]).length;
const qaQ       = (m9.match(/class="qa-question"/g)||[]).length;
const qaAnswer  = (m9.match(/class="qa-answer"/g)||[]).length;
const qaChevron = (m9.match(/class="qa-chevron"/g)||[]).length;
console.log('  qa-item: '+qaItems+', qa-question: '+qaQ+', qa-answer: '+qaAnswer+', qa-chevron: '+qaChevron);
if (qaItems === qaQ && qaQ === qaAnswer && qaAnswer === qaChevron) {
  pass('all QA structural elements balanced (' + qaItems + ' questions)');
} else {
  fail('data-m9.js', 'QA element counts mismatched: item='+qaItems+' question='+qaQ+' answer='+qaAnswer+' chevron='+qaChevron);
}
// Check level tags
const basicCount  = (m9.match(/class="qa-level basic"/g)||[]).length;
const midCount    = (m9.match(/class="qa-level mid"/g)||[]).length;
const seniorCount = (m9.match(/class="qa-level senior"/g)||[]).length;
pass('qa-level counts — basic:'+basicCount+' mid:'+midCount+' senior:'+seniorCount+' total:'+(basicCount+midCount+seniorCount)+'/'+qaItems);

// ── Summary ──────────────────────────────────────────────────────────────────
console.log('\n=============================');
if (issues.length === 0) {
  console.log('ALL CHECKS PASSED — no issues found.');
} else {
  console.log(issues.length + ' ISSUE(S) FOUND:');
  issues.forEach(i => console.log('  !! ' + i));
}
