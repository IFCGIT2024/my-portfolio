const MODULE_FILES = [
  { module: 4, label: "Module 4", file: "data/questions.json" },
  { module: 5, label: "Module 5", file: "data/questions5.json" }
];

const state = {
  moduleMap: new Map(),
  activeModule: 4,
  selectedSections: new Set(),
  studentName: "",
  quizQuestions: [],
  answers: [],
  index: 0
};

const el = {
  setup: document.getElementById("setup-screen"),
  quiz: document.getElementById("quiz-screen"),
  results: document.getElementById("results-screen"),
  moduleSelect: document.getElementById("module-select"),
  sectionsList: document.getElementById("sections-list"),
  studentName: document.getElementById("student-name"),
  questionText: document.getElementById("question-text"),
  optionsList: document.getElementById("options-list"),
  quizMeta: document.getElementById("quiz-meta"),
  quizSection: document.getElementById("quiz-section"),
  resultsSummary: document.getElementById("results-summary")
};

async function loadModuleData() {
  const datasets = await Promise.all(
    MODULE_FILES.map(async (entry) => {
      const response = await fetch(entry.file);
      if (!response.ok) {
        throw new Error(`Failed loading ${entry.file}: HTTP ${response.status}`);
      }
      const data = await response.json();
      const questions = Array.isArray(data.questions) ? data.questions : [];
      return { ...entry, questions };
    })
  );

  datasets.forEach((set) => state.moduleMap.set(set.module, set));
  renderModuleSelect();
  renderSections();
}

function renderModuleSelect() {
  el.moduleSelect.innerHTML = "";
  MODULE_FILES.forEach((entry) => {
    const opt = document.createElement("option");
    opt.value = String(entry.module);
    opt.textContent = entry.label;
    el.moduleSelect.appendChild(opt);
  });
  el.moduleSelect.value = String(state.activeModule);
}

function getActiveQuestions() {
  const moduleData = state.moduleMap.get(state.activeModule);
  if (!moduleData) return [];

  return moduleData.questions.filter((q) => {
    if (typeof q.module !== "number") return state.activeModule === 4;
    return q.module === state.activeModule;
  });
}

function renderSections() {
  const activeQuestions = getActiveQuestions();
  const sectionCounts = new Map();
  activeQuestions.forEach((q) => {
    const key = q.section || "General";
    sectionCounts.set(key, (sectionCounts.get(key) || 0) + 1);
  });

  const sections = [...sectionCounts.keys()].sort();
  state.selectedSections = new Set(sections);

  el.sectionsList.innerHTML = "";
  sections.forEach((section) => {
    const row = document.createElement("label");
    row.className = "section-item";
    row.innerHTML = `
      <input type="checkbox" checked value="${escapeHtml(section)}" />
      <span>${escapeHtml(section)} (${sectionCounts.get(section)})</span>
    `;
    const cb = row.querySelector("input");
    cb.addEventListener("change", () => {
      if (cb.checked) state.selectedSections.add(section);
      else state.selectedSections.delete(section);
    });
    el.sectionsList.appendChild(row);
  });
}

function startQuiz() {
  const name = el.studentName.value.trim();
  if (!name) {
    alert("Please enter your name.");
    return;
  }

  const selected = [...state.selectedSections];
  if (selected.length === 0) {
    alert("Please select at least one section.");
    return;
  }

  state.studentName = name;
  const active = getActiveQuestions();
  state.quizQuestions = active.filter((q) => selected.includes(q.section || "General"));

  if (state.quizQuestions.length === 0) {
    alert("No questions found for selected module/sections.");
    return;
  }

  state.quizQuestions = shuffle([...state.quizQuestions]);
  state.answers = new Array(state.quizQuestions.length).fill(null);
  state.index = 0;

  el.setup.classList.add("hidden");
  el.results.classList.add("hidden");
  el.quiz.classList.remove("hidden");
  renderQuestion();
}

function renderQuestion() {
  const q = state.quizQuestions[state.index];
  const questionNum = state.index + 1;
  el.quizMeta.textContent = `Question ${questionNum} of ${state.quizQuestions.length}`;
  el.quizSection.textContent = q.section || "General";
  el.questionText.textContent = q.question;
  el.optionsList.innerHTML = "";

  q.options.forEach((opt, idx) => {
    const div = document.createElement("button");
    div.type = "button";
    div.className = "option" + (state.answers[state.index] === idx ? " selected" : "");
    div.textContent = `${String.fromCharCode(65 + idx)}. ${opt}`;
    div.addEventListener("click", () => {
      state.answers[state.index] = idx;
      renderQuestion();
    });
    el.optionsList.appendChild(div);
  });
}

function nextQuestion() {
  if (state.answers[state.index] === null) {
    alert("Select an answer before continuing.");
    return;
  }

  if (state.index < state.quizQuestions.length - 1) {
    state.index += 1;
    renderQuestion();
    return;
  }

  showResults();
}

function prevQuestion() {
  if (state.index === 0) return;
  state.index -= 1;
  renderQuestion();
}

function showResults() {
  let score = 0;
  state.quizQuestions.forEach((q, i) => {
    if (state.answers[i] === q.correct) score += 1;
  });

  const pct = Math.round((score / state.quizQuestions.length) * 100);
  el.resultsSummary.textContent = `${state.studentName}, you scored ${score}/${state.quizQuestions.length} (${pct}%).`;

  el.quiz.classList.add("hidden");
  el.results.classList.remove("hidden");
}

function restartToSetup() {
  el.results.classList.add("hidden");
  el.quiz.classList.add("hidden");
  el.setup.classList.remove("hidden");
}

function setAllSections(checked) {
  state.selectedSections.clear();
  el.sectionsList.querySelectorAll("input[type=checkbox]").forEach((cb) => {
    cb.checked = checked;
    if (checked) state.selectedSections.add(cb.value);
  });
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function wireEvents() {
  el.moduleSelect.addEventListener("change", () => {
    state.activeModule = Number(el.moduleSelect.value);
    renderSections();
  });

  document.getElementById("btn-start").addEventListener("click", startQuiz);
  document.getElementById("btn-prev").addEventListener("click", prevQuestion);
  document.getElementById("btn-next").addEventListener("click", nextQuestion);
  document.getElementById("btn-restart").addEventListener("click", restartToSetup);
  document.getElementById("btn-select-all").addEventListener("click", () => setAllSections(true));
  document.getElementById("btn-clear-all").addEventListener("click", () => setAllSections(false));
}

async function init() {
  try {
    await loadModuleData();
    wireEvents();
  } catch (err) {
    console.error(err);
    alert(`Failed to initialize isolated site: ${err.message}`);
  }
}

init();
