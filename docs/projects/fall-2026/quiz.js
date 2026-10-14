(() => {
  "use strict";

  const allowedCourses = new Set(["2115", "2122", "2134", "2141"]);
  const params = new URLSearchParams(window.location.search);
  const course = params.get("course");
  const quiz = params.get("quiz");
  const isA1 = course === "2122" && quiz === "a1";
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

  function normalize2115Question(q, topicMap) {
    if (!q || typeof q !== "object" || !Array.isArray(q.options) || q.options.length !== 4) {
      throw new Error("Invalid CSCI 2115 question record.");
    }
    const letters = q.options.map((option) => option.value);
    if (letters.join("") !== "ABCD") {
      throw new Error(`${q.id}: expected original A–D answer choices.`);
    }
    const correct = q.options.findIndex((option) => option.value === q.answer);
    if (correct < 0) throw new Error(`${q.id}: correct answer is absent from the choices.`);
    const meta = topicMap.get(q.topic);
    if (q.part === "Core" && !meta) throw new Error(`${q.id}: missing core topic.`);
    const section = q.part === "Core"
      ? `Core — ${meta.section}`
      : `Assignment — ${q.topic}: ${q.title}`;
    return {
      id: q.id,
      section,
      question: q.question,
      options: q.options.map((option) => option.label),
      correct,
      explanation: q.explanation,
      sources: q.sources,
      table: q.table || null,
      workedSolution: q.worked_solution || null,
      optionFeedback: q.option_feedback || null,
      difficulty: q.difficulty
    };
  }

  async function load2115Questions(bank) {
    if (!Array.isArray(bank.questionFiles) || bank.questionFiles.length === 0) {
      throw new Error("Missing CSCI 2115 question files.");
    }
    const sets = await Promise.all(bank.questionFiles.map(async (filename) => {
      if (!/^2115-module1-part-\d{2}\.json$/.test(filename)) {
        throw new Error(`Unexpected 2115 file: ${filename}`);
      }
      const response = await fetch(`data/${filename}`, { cache: "no-store" });
      if (!response.ok) throw new Error(`${filename}: HTTP ${response.status}`);
      const payload = await response.json();
      if (!Array.isArray(payload.questions)) throw new Error(`${filename}: invalid question list.`);
      return payload.questions;
    }));
    const rawQuestions = sets.flat();
    if (rawQuestions.length !== bank.expectedCount) {
      throw new Error(`Expected ${bank.expectedCount} questions, received ${rawQuestions.length}.`);
    }
    const topicMap = new Map((bank.topics || []).map((topic) => [topic.code, topic]));
    const ids = new Set();
    for (const q of rawQuestions) {
      if (!q.id || ids.has(q.id)) throw new Error(`Missing or repeated question ID: ${q.id}`);
      ids.add(q.id);
    }
    return rawQuestions.map((q) => normalize2115Question(q, topicMap));
  }

  function renderStudyTable(table) {
    if (!table || !Array.isArray(table.headers) || !Array.isArray(table.rows)) return "";
    const head = table.headers.map((cell) => `<th scope="col">${escapeHtml(cell)}</th>`).join("");
    const body = table.rows.map((row) => {
      const cells = table.headers.map((_, index) => `<td>${escapeHtml(Array.isArray(row) ? (row[index] ?? "") : "")}</td>`).join("");
      return `<tr>${cells}</tr>`;
    }).join("");
    return `<div class="study-table-wrap"><table class="study-table"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>`;
  }

  function renderWorkedSolution(steps) {
    if (!Array.isArray(steps) || steps.length === 0) return "";
    const content = steps.map((step) => {
      if (typeof step === "string") return `<p>${escapeHtml(step)}</p>`;
      return renderStudyTable(step);
    }).join("");
    return `<details class="worked-solution"><summary>Show the full worked solution</summary><div>${content}</div></details>`;
  }

  async function loadBank() {
    if (!allowedCourses.has(course)) {
      fail("Choose one of the four courses from the Fall 2026 hub.");
      return;
    }
    if (quiz && !isA1) {
      fail("This quiz is not available for the selected course. Choose a quiz from the Fall 2026 hub.");
      return;
    }
    try {
      const response = await fetch(`data/${course}${isA1 ? "-a1" : ""}.json`, { cache: "no-store" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      state.bank = await response.json();
      if (course === "2115" && Array.isArray(state.bank.questionFiles)) {
        state.bank.questions = await load2115Questions(state.bank);
      }
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
    $("shuffle-options").checked = course !== "2115";
    $("quiz-context").querySelector("summary").textContent = isA1
      ? "A1 background and assumptions"
      : course === "2115" ? "Module 1 source scope" : "Practice notes";
    document.title = `${code} Practice Test`;
    $("nav-course").textContent = code;
    $("course-code").textContent = code;
    $("course-title").textContent = title;
    $("course-description").textContent = `${description} ${questions.length} questions available.`;
    $("course-quizzes").classList.toggle("hidden", course !== "2122");
    document.querySelectorAll("#course-quizzes a").forEach((link) => {
      const active = link.dataset.quiz === (isA1 ? "a1" : "general");
      if (active) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
    const context = state.bank.context || [];
    $("quiz-context").classList.toggle("hidden", context.length === 0);
    $("context-content").innerHTML = context.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("");

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
    const sizes = course === "2115" ? [5, 10, 15, 25, 50, 100, available] : [5, 10, 15, available];
    const choices = [...new Set(sizes.filter((n) => n > 0 && n <= available))].sort((a, b) => a - b);
    $("question-count").innerHTML = choices.map((n) => `<option value="${n}">${n === available ? `All ${n}` : n}</option>`).join("");
    if (choices.length) $("question-count").value = String(choices[Math.min(1, choices.length - 1)]);
    $("setup-message").textContent = "";
    $("toggle-all").textContent = selectedSections().length === document.querySelectorAll("#section-options input").length ? "Deselect all" : "Select all";
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

  function getCorrectIndices(question) {
    return Array.isArray(question.correct) ? question.correct : [question.correct];
  }

  function sameAnswerSet(selected, correct) {
    if (selected.length !== correct.length) return false;
    const selectedSet = new Set(selected);
    return correct.every((index) => selectedSet.has(index));
  }

  function renderQuestion() {
    const question = state.questions[state.index];
    const shouldShuffle = $("shuffle-options").checked;
    const correctIndices = getCorrectIndices(question);
    const isMulti = correctIndices.length > 1;
    let options = question.options.map((text, originalIndex) => ({ text, originalIndex }));
    if (shouldShuffle) options = shuffle(options);

    $("progress-text").textContent = `Question ${state.index + 1} of ${state.questions.length}${course === "2115" ? ` · ${question.id}` : ""}`;
    $("topic-text").textContent = question.section;
    $("progress-fill").style.width = `${((state.index + 1) / state.questions.length) * 100}%`;
    $("question-text").textContent = question.question;
    const support = $("question-support");
    support.innerHTML = question.table ? renderStudyTable(question.table) : "";
    support.classList.toggle("hidden", !question.table);
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

      if (isMulti) {
        button.setAttribute("aria-pressed", "false");
        button.addEventListener("click", () => {
          const selected = button.classList.toggle("selected");
          button.setAttribute("aria-pressed", selected ? "true" : "false");
        });
      } else {
        button.addEventListener("click", () => submitAnswer(question, [option.originalIndex]));
      }

      $("answer-options").appendChild(button);
    });

    if (isMulti) {
      const checkButton = document.createElement("button");
      checkButton.className = "primary-button multi-check-button";
      checkButton.type = "button";
      checkButton.textContent = "Check selected answers";
      checkButton.addEventListener("click", () => {
        const selected = [...document.querySelectorAll(".answer-button.selected")]
          .map((button) => Number(button.dataset.originalIndex));

        if (selected.length === 0) {
          const feedback = $("feedback");
          feedback.className = "feedback wrong";
          feedback.textContent = "Select at least one answer before checking.";
          return;
        }

        submitAnswer(question, selected);
      });
      $("answer-options").appendChild(checkButton);
    }
  }

  function submitAnswer(question, selectedIndices) {
    const correctIndices = getCorrectIndices(question);
    const isCorrect = sameAnswerSet(selectedIndices, correctIndices);
    const selectedSet = new Set(selectedIndices);
    const correctSet = new Set(correctIndices);

    state.stats[question.section].total += 1;
    if (isCorrect) {
      state.score += 1;
      state.stats[question.section].correct += 1;
    }

    document.querySelectorAll(".answer-button").forEach((button) => {
      const originalIndex = Number(button.dataset.originalIndex);
      button.disabled = true;
      button.classList.remove("selected");
      button.setAttribute("aria-pressed", "false");

      if (correctSet.has(originalIndex)) button.classList.add("correct");
      else if (selectedSet.has(originalIndex)) button.classList.add("wrong");
    });

    const checkButton = document.querySelector(".multi-check-button");
    if (checkButton) checkButton.disabled = true;

    const feedback = $("feedback");
    feedback.className = `feedback ${isCorrect ? "correct" : "wrong"}`;
    let extra = "";
    if (!isCorrect && question.optionFeedback && selectedIndices.length === 1) {
      const originalLetter = String.fromCharCode(65 + selectedIndices[0]);
      const detail = question.optionFeedback[originalLetter];
      if (detail) extra += `<p class="option-detail">${escapeHtml(detail)}</p>`;
    }
    if (question.workedSolution) extra += renderWorkedSolution(question.workedSolution);
    if (question.sources) extra += `<p class="source-note">Source: ${escapeHtml(question.sources)}</p>`;
    feedback.innerHTML = `<strong>${isCorrect ? "Correct." : "Not quite."}</strong> ${escapeHtml(question.explanation || "Review this topic and try it again.")}${extra}`;
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
