const MODULES = [
  { id: 6, label: "Module 6 - Binary Trees", file: "data/questions6.json" },
  { id: 7, label: "Module 7 - Binary Search Trees", file: "data/questions7.json" },
  { id: 8, label: "Module 8 - Heaps", file: "data/questions8.json" },
  { id: 9, label: "Module 9 - Hashing and Hash Tables", file: "data/questions9.json" }
];

const state = {
  datasets: new Map(),
  moduleId: 6,
  selectedSections: new Set(),
  name: "",
  quiz: [],
  answers: [],
  index: 0
};

function cleanText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function normalizeQuestionBank(moduleId, questions) {
  const normalized = [];
  const seenIds = new Set();

  questions.forEach((q, index) => {
    const id = Number(q.id);
    const options = Array.isArray(q.options) ? q.options.map((o) => cleanText(o)) : [];
    const correct = Number(q.correct);
    const question = cleanText(q.question);
    const section = cleanText(q.section) || "General";

    if (!Number.isInteger(id) || seenIds.has(id)) return;
    if (!question) return;
    if (options.length !== 4 || options.some((o) => !o)) return;
    if (!Number.isInteger(correct) || correct < 0 || correct > 3) return;

    normalized.push({
      id,
      module: Number(q.module) || moduleId,
      question,
      options,
      correct,
      section
    });

    seenIds.add(id);
  });

  return normalized;
}

function buildSectionBalancedQuiz(pool) {
  const bySection = new Map();

  pool.forEach((q) => {
    if (!bySection.has(q.section)) bySection.set(q.section, []);
    bySection.get(q.section).push(q);
  });

  bySection.forEach((items, key) => {
    bySection.set(key, shuffle(items));
  });

  const orderedSections = [...bySection.keys()].sort();
  const out = [];
  let added = true;

  while (added) {
    added = false;
    orderedSections.forEach((section) => {
      const items = bySection.get(section);
      if (items && items.length > 0) {
        out.push(items.pop());
        added = true;
      }
    });
  }

  return out;
}

const el = {
  setup: document.getElementById("setup-screen"),
  quiz: document.getElementById("quiz-screen"),
  result: document.getElementById("result-screen"),
  name: document.getElementById("student-name"),
  module: document.getElementById("module-select"),
  sections: document.getElementById("sections"),
  counter: document.getElementById("counter"),
  sectionPill: document.getElementById("section-pill"),
  question: document.getElementById("question-text"),
  options: document.getElementById("options"),
  score: document.getElementById("score-line"),
  breakdown: document.getElementById("breakdown")
};

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getModuleQuestions() {
  const data = state.datasets.get(state.moduleId);
  return data ? data.questions : [];
}

function renderModules() {
  el.module.innerHTML = "";
  MODULES.forEach((m) => {
    const opt = document.createElement("option");
    opt.value = String(m.id);
    opt.textContent = m.label;
    el.module.appendChild(opt);
  });
  el.module.value = String(state.moduleId);
}

function renderSections() {
  const questions = getModuleQuestions();
  const counts = new Map();
  questions.forEach((q) => counts.set(q.section, (counts.get(q.section) || 0) + 1));

  const sections = [...counts.keys()].sort();
  state.selectedSections = new Set(sections);

  el.sections.innerHTML = "";
  sections.forEach((sec) => {
    const row = document.createElement("label");
    row.className = "section-item";
    row.innerHTML = `<input type="checkbox" checked /><span>${sec} (${counts.get(sec)})</span>`;
    const cb = row.querySelector("input");
    cb.addEventListener("change", () => {
      if (cb.checked) state.selectedSections.add(sec);
      else state.selectedSections.delete(sec);
    });
    el.sections.appendChild(row);
  });
}

function renderQuestion() {
  const q = state.quiz[state.index];
  el.counter.textContent = `Question ${state.index + 1} of ${state.quiz.length}`;
  el.sectionPill.textContent = q.section;
  el.question.textContent = q.question;

  el.options.innerHTML = "";
  q.options.forEach((opt, i) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "option" + (state.answers[state.index] === i ? " selected" : "");
    btn.textContent = `${String.fromCharCode(65 + i)}. ${opt}`;
    btn.addEventListener("click", () => {
      state.answers[state.index] = i;
      renderQuestion();
    });
    el.options.appendChild(btn);
  });
}

function showResults() {
  let score = 0;
  const bySection = new Map();

  state.quiz.forEach((q, i) => {
    const ok = state.answers[i] === q.correct;
    if (ok) score += 1;

    if (!bySection.has(q.section)) bySection.set(q.section, { hit: 0, total: 0 });
    bySection.get(q.section).total += 1;
    if (ok) bySection.get(q.section).hit += 1;
  });

  const pct = Math.round((score / state.quiz.length) * 100);
  el.score.textContent = `${state.name} scored ${score}/${state.quiz.length} (${pct}%).`;

  el.breakdown.innerHTML = "";
  [...bySection.entries()].forEach(([section, data]) => {
    const row = document.createElement("div");
    row.className = "break-item";
    row.innerHTML = `<span>${section}</span><strong>${data.hit}/${data.total}</strong>`;
    el.breakdown.appendChild(row);
  });

  el.quiz.classList.add("hidden");
  el.result.classList.remove("hidden");
}

function startQuiz() {
  const name = el.name.value.trim();
  if (!name) {
    alert("Please enter your name.");
    return;
  }

  if (state.selectedSections.size === 0) {
    alert("Please select at least one section.");
    return;
  }

  state.name = name;
  const pool = getModuleQuestions().filter((q) => state.selectedSections.has(q.section));
  if (pool.length === 0) {
    alert("No questions found for selected sections.");
    return;
  }

  state.quiz = buildSectionBalancedQuiz(pool);
  state.answers = new Array(state.quiz.length).fill(null);
  state.index = 0;

  el.setup.classList.add("hidden");
  el.result.classList.add("hidden");
  el.quiz.classList.remove("hidden");
  renderQuestion();
}

function initActions() {
  document.getElementById("btn-start").addEventListener("click", startQuiz);
  document.getElementById("btn-prev").addEventListener("click", () => {
    if (state.index > 0) {
      state.index -= 1;
      renderQuestion();
    }
  });
  document.getElementById("btn-next").addEventListener("click", () => {
    if (state.answers[state.index] === null) {
      alert("Choose an answer before continuing.");
      return;
    }
    if (state.index < state.quiz.length - 1) {
      state.index += 1;
      renderQuestion();
    } else {
      showResults();
    }
  });
  document.getElementById("btn-restart").addEventListener("click", () => {
    el.result.classList.add("hidden");
    el.quiz.classList.add("hidden");
    el.setup.classList.remove("hidden");
  });

  document.getElementById("btn-all").addEventListener("click", () => {
    state.selectedSections.clear();
    el.sections.querySelectorAll("input[type='checkbox']").forEach((cb) => {
      cb.checked = true;
      const txt = cb.parentElement.querySelector("span").textContent;
      state.selectedSections.add(txt.replace(/ \(\d+\)$/, ""));
    });
  });

  document.getElementById("btn-none").addEventListener("click", () => {
    state.selectedSections.clear();
    el.sections.querySelectorAll("input[type='checkbox']").forEach((cb) => {
      cb.checked = false;
    });
  });

  el.module.addEventListener("change", () => {
    state.moduleId = Number(el.module.value);
    renderSections();
  });
}

async function init() {
  try {
    const loaded = await Promise.all(
      MODULES.map(async (m) => {
        const res = await fetch(m.file);
        if (!res.ok) throw new Error(`${m.file} failed: HTTP ${res.status}`);
        const data = await res.json();
        const questions = normalizeQuestionBank(m.id, data.questions || []);
        return { id: m.id, questions };
      })
    );

    loaded.forEach((d) => state.datasets.set(d.id, d));
    renderModules();
    renderSections();
    initActions();
  } catch (err) {
    console.error(err);
    alert(`Initialization failed: ${err.message}`);
  }
}

init();
