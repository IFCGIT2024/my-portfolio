/* ============================================================
   MCQ Quiz Engine — client-side interactive quiz
   ============================================================ */

(function () {
  'use strict';

  const quizContainer = document.getElementById('quiz-container');
  if (!quizContainer) return;

  const questions = JSON.parse(quizContainer.dataset.questions || '[]');
  if (questions.length === 0) return;

  let currentQ = 0;
  let score = 0;
  let answered = new Array(questions.length).fill(null);

  function render() {
    const q = questions[currentQ];
    const total = questions.length;
    const progress = answered.filter(a => a !== null).length;

    let html = `
      <div class="quiz-progress">
        <div class="quiz-progress-bar">
          <div class="quiz-progress-fill" style="width: ${(progress / total) * 100}%"></div>
        </div>
        <span class="quiz-progress-text">${progress} / ${total} answered</span>
      </div>
      <div class="quiz-question-card">
        <div class="quiz-q-number">Question ${currentQ + 1} of ${total}</div>
        <div class="quiz-q-text">${q.q}</div>
        <div class="quiz-choices">`;

    q.choices.forEach((choice, idx) => {
      const selected = answered[currentQ] === idx;
      const isCorrect = idx === q.answer;
      const wasAnswered = answered[currentQ] !== null;

      let cls = 'quiz-choice';
      if (wasAnswered) {
        if (isCorrect) cls += ' correct';
        else if (selected && !isCorrect) cls += ' incorrect';
        else cls += ' disabled';
      }

      html += `<button class="${cls}" data-idx="${idx}" ${wasAnswered ? 'disabled' : ''}>
        <span class="quiz-choice-letter">${'ABCD'[idx]}</span>
        <span class="quiz-choice-text">${choice}</span>
      </button>`;
    });

    html += `</div>`;

    if (answered[currentQ] !== null) {
      const correct = answered[currentQ] === q.answer;
      html += `<div class="quiz-explanation ${correct ? 'correct' : 'incorrect'}">
        <strong>${correct ? '✓ Correct!' : '✗ Incorrect.'}</strong> ${q.explanation}
      </div>`;
    }

    html += `</div>
      <div class="quiz-nav">
        <button class="quiz-nav-btn" id="quiz-prev" ${currentQ === 0 ? 'disabled' : ''}>◀ Previous</button>
        <span class="quiz-nav-pos">${currentQ + 1} / ${total}</span>
        <button class="quiz-nav-btn" id="quiz-next" ${currentQ === total - 1 ? 'disabled' : ''}>Next ▶</button>
      </div>`;

    if (progress === total) {
      score = answered.reduce((s, a, i) => s + (a === questions[i].answer ? 1 : 0), 0);
      const pct = Math.round((score / total) * 100);
      let grade = pct >= 90 ? 'Excellent!' : pct >= 70 ? 'Good job!' : pct >= 50 ? 'Keep studying!' : 'Review the material and try again.';
      html += `
        <div class="quiz-results">
          <h3>Results: ${score} / ${total} (${pct}%)</h3>
          <p>${grade}</p>
          <button class="quiz-nav-btn" id="quiz-retry">🔄 Retry Quiz</button>
        </div>`;
    }

    quizContainer.innerHTML = html;

    // Event listeners
    quizContainer.querySelectorAll('.quiz-choice:not([disabled])').forEach(btn => {
      btn.addEventListener('click', () => {
        answered[currentQ] = parseInt(btn.dataset.idx);
        render();
      });
    });

    const prevBtn = document.getElementById('quiz-prev');
    const nextBtn = document.getElementById('quiz-next');
    const retryBtn = document.getElementById('quiz-retry');

    if (prevBtn) prevBtn.addEventListener('click', () => { currentQ--; render(); });
    if (nextBtn) nextBtn.addEventListener('click', () => { currentQ++; render(); });
    if (retryBtn) retryBtn.addEventListener('click', () => {
      currentQ = 0; score = 0; answered = new Array(questions.length).fill(null); render();
    });
  }

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!quizContainer) return;
    if (e.key === 'ArrowRight') { const b = document.getElementById('quiz-next'); if (b && !b.disabled) { currentQ++; render(); } }
    if (e.key === 'ArrowLeft') { const b = document.getElementById('quiz-prev'); if (b && !b.disabled) { currentQ--; render(); } }
    if (['1','2','3','4','a','b','c','d'].includes(e.key.toLowerCase()) && answered[currentQ] === null) {
      const idx = '1234'.includes(e.key) ? parseInt(e.key) - 1 : 'abcd'.indexOf(e.key.toLowerCase());
      if (idx >= 0 && idx < questions[currentQ].choices.length) {
        answered[currentQ] = idx;
        render();
      }
    }
  });

  render();
})();
