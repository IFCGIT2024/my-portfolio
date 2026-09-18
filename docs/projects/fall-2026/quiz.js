(() => {
  "use strict";

  const allowedCourses = new Set(["2115", "2122", "2134", "2141"]);
  const params = new URLSearchParams(window.location.search);
  const course = params.get("course");
  const state = { bank: null, questions: [], index: 0, score: 0, stats: {} };
  const $ = (id) => document.getElementById(id);

  const shuffle = (items) => {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  };

  const show = (id) => {
    ["loading", "setup", "quiz", "results", "error"].forEach((name) => {
      $(name).classList.toggle("hidden", name !== id);
    });
  };

  const fail = (message) => {
    $("error-message").textContent = message;
    show("error");
  };

  async function loadBank() {
    if (!allowedCourses.has(course)) {
      fail("Choose one of the four courses from the Fall 2026 hub.");
      return;
    }
    try {
      const response = await fetch(`data/${course}.json`, { cache: "no-store" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      state.bank = await response.json();
      if (!Array.isArray(state.bank.questions) || state.bank.questions.length === 0) {
        throw new Error("The question list is empty.");
      }
      renderSetup();
    } catch (error) {
      fail(`The ${course} question bank could not be loaded (${error.message}).`);
    }
  }

  function renderSetup() {
    const { code, title, description, questions } = state.bank;
    document.title = `${code} Practice Test`;
    $("nav-course").textContent = code;
    $("course-code").textContent = code;
    $("course-title").textContent = title;
    $("course-description").textContent = `${description} ${questions.length} starter questions available.`;

    const sections = [...new Set(questions.map((q) => q.section))];
    $("section-options").innerHTML = sections.map((section) => `
      <label class="section-chip">
        <input type="checkbox" value="${escapeHtml(section)}" checked>
        ${escapeHtml(section)}
      </label>
    `).join("");
    updateCountOptions();
    $("section-options").addEventListener("change", updateCountOptions);
    show("setup");
  }

  function selectedSections() {
    return [...document.querySelectorAll("#section-options input:checked")].map((input) => input.value);
  }

  function eligibleQuestions() {
    const sections = new Set(selectedSections());
    return state.bank.questions.filter((q) => sections.has(q.section));
  }

  function updateCountOptions() {
    const available = eligibleQuestions().length;
    const choices = [...new Set([5, 10, 15, available].filter((n) => n > 0 && n <= available))].sort((a, b) => a - b);
    $("question-count").innerHTML = choices.map((n) => `<option value="${n}">${n === available ? `All ${n}` : n}</option>`).join("");
    if (choices.length) $("question-count").value = String(choices[Math.min(1, choices.length - 1)]);
  }

  function startQuiz() {
    const pool = eligibleQuestions();
    if (!pool.length) {
      $("setup-message").textContent = "Select at least one topic before starting.";
      return;
    }
    const count = Math.min(Number($("question-count").value), pool.length);
    state.questions = shuffle(pool).slice(0, count);
    state.index = 0;
    state.score = 0;
    state.stats = {};
    state.questions.forEach((q) => { state.stats[q.section] ??= { correct: 0, total: 0 }; });
    show("quiz");
    renderQuestion();
  }

  function renderQuestion() {
    const question = state.questions[state.index];
    const shouldShuffle = $("shuffle-options").checked;
    let options = question.options.map((text, originalIndex) => ({ text, originalIndex }));
    if (shouldShuffle) options = shuffle(options);

    $("progress-text").textContent = `Question ${state.index + 1} of ${state.questions.length}`;
    $("topic-text").textContent = question.section;
    $("progress-fill").style.width = `${((state.index + 1) / state.questions.length) * 100}%`;
    $("question-text").textContent = question.question;
    $("feedback").className = "feedback hidden";
    $("feedback").textContent = "";
    $("next-button").classList.add("hidden");
    $("answer-options").innerHTML = "";

    options.forEach((option, displayIndex) => {
      const button = document.createElement("button");
      button.className = "answer-button";
      button.type = "button";
      button.dataset.originalIndex = option.originalIndex;
      button.innerHTML = `<span class="option-letter">${String.fromCharCode(65 + displayIndex)}</span>${escapeHtml(option.text)}`;
      button.addEventListener("click", () => answerQuestion(button, question));
      $("answer-options").appendChild(button);
    });
  }

  function answerQuestion(selectedButton, question) {
    const selected = Number(selectedButton.dataset.originalIndex);
    const isCorrect = selected === question.correct;
    state.stats[question.section].total += 1;
    if (isCorrect) {
      state.score += 1;
      state.stats[question.section].correct += 1;
    }

    document.querySelectorAll(".answer-button").forEach((button) => {
      button.disabled = true;
      if (Number(button.dataset.originalIndex) === question.correct) button.classList.add("correct");
    });
    if (!isCorrect) selectedButton.classList.add("wrong");

    const feedback = $("feedback");
    feedback.className = `feedback ${isCorrect ? "correct" : "wrong"}`;
    feedback.innerHTML = `<strong>${isCorrect ? "Correct." : "Not quite."}</strong> ${escapeHtml(question.explanation || "Review this topic and try it again.")}`;
    $("next-button").textContent = state.index === state.questions.length - 1 ? "See results" : "Next question";
    $("next-button").classList.remove("hidden");
  }

  function nextQuestion() {
    state.index += 1;
    if (state.index < state.questions.length) renderQuestion();
    else renderResults();
  }

  function renderResults() {
    const total = state.questions.length;
    const percent = Math.round((state.score / total) * 100);
    $("result-heading").textContent = percent >= 90 ? "Excellent exam-level accuracy." : percent >= 70 ? "Solid start—target the weak topics next." : "This bank found useful review targets.";
    $("score-percent").textContent = `${percent}%`;
    $("score-fraction").textContent = `${state.score} of ${total} correct`;
    $("breakdown").innerHTML = Object.entries(state.stats).map(([section, score]) => `
      <div class="breakdown-row">
        <span>${escapeHtml(section)}</span>
        <strong>${score.correct}/${score.total}</strong>
      </div>
    `).join("");
    show("results");
  }

  function toggleAllSections() {
    const inputs = [...document.querySelectorAll("#section-options input")];
    const allChecked = inputs.every((input) => input.checked);
    inputs.forEach((input) => { input.checked = !allChecked; });
    $("toggle-all").textContent = allChecked ? "Select all" : "Deselect all";
    updateCountOptions();
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
  }

  $("start-button").addEventListener("click", startQuiz);
  $("next-button").addEventListener("click", nextQuestion);
  $("retry-button").addEventListener("click", () => show("setup"));
  $("toggle-all").addEventListener("click", toggleAllSections);
  loadBank();
})();
