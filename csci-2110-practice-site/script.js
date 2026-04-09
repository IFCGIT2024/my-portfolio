// ============================================
// CSCI 2110 Practice Exam Quiz Application
// ============================================

// Global State Variables
let allQuestions = [];
let filteredQuestions = [];
let shuffledQuestions = [];
let currentQuestionIndex = 0;
let userAnswers = [];
let userAnswerOrder = [];
let wrongAnswers = [];
let selectedModule = 0;
let selectedSections = [];
let immediateFeeback = true;
let quizStarted = false;
let rapidFireMode = false;
let pendingAction = null;
let studentName = '';
let quizStartTime = null;
let quizEndTime = null;
let userQuestionFeedback = {};
let currentTheme = 'light';
let currentColorScheme = 'blue';

// ============================================
// INITIALIZATION
// ============================================

// Load questions from JSON files (module 6-9)
async function loadQuestions() {
    try {
        const [r6, r7, r8, r9] = await Promise.all([
            fetch('data/questions6.json'),
            fetch('data/questions7.json'),
            fetch('data/questions8.json'),
            fetch('data/questions9.json')
        ]);
        if (!r6.ok) throw new Error(`HTTP ${r6.status} loading data/questions6.json`);
        if (!r7.ok) throw new Error(`HTTP ${r7.status} loading data/questions7.json`);
        if (!r8.ok) throw new Error(`HTTP ${r8.status} loading data/questions8.json`);
        if (!r9.ok) throw new Error(`HTTP ${r9.status} loading data/questions9.json`);
        const [d6, d7, d8, d9] = await Promise.all([r6.json(), r7.json(), r8.json(), r9.json()]);

        const q6 = (d6.questions || []).map((q) => ({ ...q, module: 6 }));
        const q7 = (d7.questions || []).map((q) => ({ ...q, module: 7 }));
        const q8 = (d8.questions || []).map((q) => ({ ...q, module: 8 }));
        const q9 = (d9.questions || []).map((q) => ({ ...q, module: 9 }));

        allQuestions = [...q6, ...q7, ...q8, ...q9];
        if (allQuestions.length === 0) throw new Error('No questions found');
        console.log(`✓ Loaded ${allQuestions.length} total questions`);
        initSetup();
    } catch (err) {
        console.error('ERROR: Could not load questions:', err);
        alert('Error: Could not load quiz questions.\n\nDetails: ' + err.message + '\n\nMake sure all data files exist in csci-2110-practice-site/data/.');
    }
}

// Initialize setup screen
function initSetup() {
    console.log(`initSetup called: allQuestions.length = ${allQuestions.length}`);
    renderSectionCheckboxes();
    selectAllSections();
}

// Load theme preferences from localStorage
function loadThemePreferences() {
    const saved = JSON.parse(localStorage.getItem('themeSettings') || '{"theme":"light","colorScheme":"blue"}');
    currentTheme = saved.theme || 'light';
    currentColorScheme = saved.colorScheme || 'blue';
    applyTheme();
}

// Apply theme to the page
function applyTheme() {
    if (currentTheme === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
        const toggle = document.getElementById('dark-mode-toggle');
        if (toggle) toggle.checked = true;
    } else {
        document.body.removeAttribute('data-theme');
        const toggle = document.getElementById('dark-mode-toggle');
        if (toggle) toggle.checked = false;
    }

    // Apply color scheme
    if (currentColorScheme !== 'blue') {
        document.documentElement.classList.add(`scheme-${currentColorScheme}`);
    } else {
        document.documentElement.classList.remove('scheme-green', 'scheme-purple', 'scheme-orange', 'scheme-red', 'scheme-pink');
    }

    updateColorSchemeUI();
}

// Toggle dark mode
function toggleDarkMode() {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme();
    saveThemePreferences();

    // Update both toggles
    const settingsToggle = document.getElementById('dark-mode-toggle');
    const navbarToggle = document.getElementById('navbar-dark-toggle');
    if (settingsToggle) settingsToggle.checked = currentTheme === 'dark';
    if (navbarToggle) navbarToggle.checked = currentTheme === 'dark';
}

// Set color scheme
function setColorScheme(scheme) {
    currentColorScheme = scheme;
    document.documentElement.classList.remove('scheme-green', 'scheme-purple', 'scheme-orange', 'scheme-red', 'scheme-pink');
    if (scheme !== 'blue') {
        document.documentElement.classList.add(`scheme-${scheme}`);
    }
    updateColorSchemeUI();
    saveThemePreferences();
}

// Update color scheme UI
function updateColorSchemeUI() {
    document.querySelectorAll('.color-option').forEach(option => {
        option.classList.remove('active');
    });
    const activeOption = document.getElementById(`scheme-${currentColorScheme}`);
    if (activeOption) {
        activeOption.classList.add('active');
    }
}

// Save theme preferences
function saveThemePreferences() {
    localStorage.setItem('themeSettings', JSON.stringify({
        theme: currentTheme,
        colorScheme: currentColorScheme
    }));
}

// ============================================
// NAVIGATION & SCREENS
// ============================================

// Go to setup from name screen
function goToSetup() {
    const nameInput = document.getElementById('student-name');
    if (!nameInput.value.trim()) {
        alert('Please enter your name');
        return;
    }

    studentName = nameInput.value.trim();
    document.getElementById('name-screen').classList.add('hidden');
    document.getElementById('setup-screen').classList.remove('hidden');
    updateNavbar();
    renderSectionCheckboxes();
}

// View settings
function viewSettings() {
    document.getElementById('setup-screen').classList.add('hidden');
    document.getElementById('settings-screen').classList.remove('hidden');
    updateColorSchemeUI();
    const toggle = document.getElementById('dark-mode-toggle');
    if (toggle) {
        toggle.removeEventListener('change', toggleDarkMode);
        toggle.addEventListener('change', toggleDarkMode);
    }
    toggleProfileMenu();
}

// Clear all leaderboard data
function clearAllData() {
    const confirm = window.confirm('Are you sure you want to clear all leaderboard and quiz data? This cannot be undone. Your theme preferences will be kept.');
    if (confirm) {
        localStorage.removeItem('quizScores');
        localStorage.removeItem('questionFeedback');
        alert('All leaderboard data has been cleared!');
    }
}

// View leaderboard from name screen
function viewLeaderboard() {
    document.getElementById('name-screen').classList.add('hidden');
    document.getElementById('leaderboard-screen').classList.remove('hidden');
    displayLeaderboard();
}

// Back to name screen
function backToName() {
    document.getElementById('leaderboard-screen').classList.add('hidden');
    document.getElementById('name-screen').classList.remove('hidden');
}

// View leaderboard from nav
function viewLeaderboardFromNav() {
    document.getElementById('setup-screen').classList.add('hidden');
    document.getElementById('leaderboard-screen').classList.remove('hidden');
    displayLeaderboard();
    toggleProfileMenu();
}

// View question review
function viewQuestionReview() {
    document.getElementById('setup-screen').classList.add('hidden');
    document.getElementById('review-screen').classList.remove('hidden');
    displayQuestionReview();
    toggleProfileMenu();
}

// Display question review
function displayQuestionReview() {
    const flaggedQuestions = getFlaggedQuestions();
    const reviewStatsDiv = document.getElementById('review-stats');
    const flaggedList = document.getElementById('flagged-questions-list');

    if (flaggedQuestions.length === 0) {
        reviewStatsDiv.innerHTML = '<div class="review-stats-label">No questions flagged yet</div>';
        flaggedList.innerHTML = '<div class="flagged-questions-empty">Great! All questions are working well.</div>';
        return;
    }

    reviewStatsDiv.innerHTML = `
        <div class="review-stats-number">${flaggedQuestions.length}</div>
        <div class="review-stats-label">Questions Flagged for Review</div>
    `;

    let html = '';
    flaggedQuestions.forEach(question => {
        const feedbackTypes = question.flagData.feedbackTypes;
        let feedbackHTML = '';

        if (feedbackTypes.wrong) {
            feedbackHTML += `<span class="feedback-type-badge wrong">👎 Wrong/Error (${feedbackTypes.wrong})</span>`;
        }
        if (feedbackTypes.irrelevant) {
            feedbackHTML += `<span class="feedback-type-badge irrelevant">⚠️ Irrelevant (${feedbackTypes.irrelevant})</span>`;
        }

        html += `
            <div class="flagged-question-item">
                <div class="flagged-question-text">Question #${question.id}</div>
                <div class="flagged-question-details">
                    <strong>Question:</strong> ${question.question}
                </div>
                <div class="flagged-question-details">
                    <strong>Section:</strong> ${question.section}
                </div>
                <div class="flagged-question-details">
                    <strong>Total Flags:</strong> ${question.flagData.flagCount}
                </div>
                <div class="flagged-question-details">
                    <strong>Last flagged:</strong> ${question.flagData.lastFlaggedDate} by ${question.flagData.lastFlaggedBy}
                </div>
                <div>${feedbackHTML}</div>
            </div>
        `;
    });

    flaggedList.innerHTML = html;
}

// Back to setup or name
function backToSetupOrName() {
    document.getElementById('review-screen').classList.add('hidden');
    document.getElementById('settings-screen').classList.add('hidden');
    if (studentName) {
        document.getElementById('setup-screen').classList.remove('hidden');
    } else {
        document.getElementById('name-screen').classList.remove('hidden');
    }
}

// Sign out
function signOut() {
    const confirm = window.confirm('Are you sure you want to sign out? You can always log back in with the same name.');
    if (confirm) {
        studentName = '';
        updateNavbar();
        document.getElementById('setup-screen').classList.add('hidden');
        document.getElementById('leaderboard-screen').classList.add('hidden');
        document.getElementById('review-screen').classList.add('hidden');
        document.getElementById('settings-screen').classList.add('hidden');
        document.getElementById('quiz-container').classList.add('hidden');
        document.getElementById('progress-section').classList.add('hidden');
        document.getElementById('results-container').classList.add('hidden');
        document.getElementById('ordering-screen').classList.add('hidden');
        document.getElementById('name-screen').classList.remove('hidden');
        document.getElementById('student-name').value = '';
        document.getElementById('student-name').focus();
        toggleProfileMenu();
    }
}

// Go to home
function goToHome() {
    if (studentName) {
        document.getElementById('leaderboard-screen').classList.add('hidden');
        document.getElementById('review-screen').classList.add('hidden');
        document.getElementById('settings-screen').classList.add('hidden');
        document.getElementById('quiz-container').classList.add('hidden');
        document.getElementById('progress-section').classList.add('hidden');
        document.getElementById('results-container').classList.add('hidden');
        document.getElementById('ordering-screen').classList.add('hidden');
        document.getElementById('setup-screen').classList.remove('hidden');
        toggleProfileMenu();
    } else {
        document.getElementById('setup-screen').classList.add('hidden');
        document.getElementById('leaderboard-screen').classList.add('hidden');
        document.getElementById('review-screen').classList.add('hidden');
        document.getElementById('settings-screen').classList.add('hidden');
        document.getElementById('ordering-screen').classList.add('hidden');
        document.getElementById('name-screen').classList.remove('hidden');
    }
}

// Back to setup
function backToSetup() {
    document.getElementById('results-container').classList.add('hidden');
    document.getElementById('setup-screen').classList.remove('hidden');
}

// ============================================
// QUIZ SETUP
// ============================================

// Helper: get questions for the currently selected module
function getModuleQuestions() {
    if (selectedModule === 0) {
        return allQuestions;
    }

    return allQuestions.filter(q => Number(q.module) === selectedModule);
}

// Render section checkboxes
function renderSectionCheckboxes() {
    const moduleQuestions = getModuleQuestions();
    const sections = [...new Set(moduleQuestions.map(q => q.section))];

    const container = document.getElementById('section-checkboxes');
    if (!container) {
        console.error('section-checkboxes container not found!');
        return;
    }

    container.innerHTML = '';

    sections.sort().forEach(section => {
        const count = moduleQuestions.filter(q => q.section === section).length;
        const sectionId = section.replace(/[^a-zA-Z0-9-_]/g, '_'); // Sanitize ID
        const div = document.createElement('div');
        div.className = 'checkbox-item';
        div.innerHTML = `
            <input type="checkbox" id="section-${sectionId}" class="section-checkbox"
                   value="${section}" checked onchange="updateSectionCount()">
            <label for="section-${sectionId}">${section} (${count})</label>
        `;
        container.appendChild(div);
    });

    console.log(`Rendered ${sections.length} section checkboxes`);
}

// Update section count display
function updateSectionCount() {
    const checkboxes = document.querySelectorAll('.section-checkbox:checked');
    const count = checkboxes.length;
    const total = document.querySelectorAll('.section-checkbox').length;
    const countSpan = document.getElementById('section-count');

    if (count === total) {
        countSpan.textContent = '(All selected)';
    } else if (count === 0) {
        countSpan.textContent = '(None selected)';
    } else {
        countSpan.textContent = `(${count} selected)`;
    }
}

// Select all sections
function selectAllSections() {
    document.querySelectorAll('.section-checkbox').forEach(cb => cb.checked = true);
    updateSectionCount();
}

// Deselect all sections
function deselectAllSections() {
    document.querySelectorAll('.section-checkbox').forEach(cb => cb.checked = false);
    updateSectionCount();
}

// Select module
function selectModule(moduleNum) {
    selectedModule = moduleNum;
    document.querySelectorAll('.module-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-module="${moduleNum}"]`).classList.add('active');
    renderSectionCheckboxes();
    selectAllSections();
}

// ============================================
// QUIZ EXECUTION
// ============================================

// Start quiz
function startQuiz() {
    const feedbackToggle = document.getElementById('immediate-feedback');
    immediateFeeback = feedbackToggle.checked;

    selectedSections = Array.from(document.querySelectorAll('.section-checkbox:checked'))
        .map(cb => cb.value);

    if (selectedSections.length === 0) {
        alert('Please select at least one section');
        return;
    }

    filteredQuestions = getModuleQuestions().filter(q =>
        q.section && selectedSections.includes(q.section)
    );

    if (filteredQuestions.length === 0) {
        alert('No questions found for selected criteria');
        return;
    }

    // Initialize quiz state
    quizStarted = true;
    currentQuestionIndex = 0;
    userAnswers = new Array(filteredQuestions.length).fill(null);
    userAnswerOrder = new Array(filteredQuestions.length).fill(null);
    wrongAnswers = [];
    userQuestionFeedback = {};
    rapidFireMode = false;
    quizStartTime = Date.now();

    shuffleQuestions();

    document.getElementById('setup-screen').classList.add('hidden');
    document.getElementById('progress-section').classList.remove('hidden');
    document.getElementById('quiz-container').classList.remove('hidden');

    displayQuestion();
}

// Start rapid fire mode
function startRapidFire() {
    const feedbackToggle = document.getElementById('immediate-feedback');
    immediateFeeback = feedbackToggle.checked;
    rapidFireMode = true;

    const moduleQuestions = getModuleQuestions();
    const allSections = [...new Set(moduleQuestions.map(q => q.section))];

    filteredQuestions = [];
    allSections.forEach(section => {
        const sectionQuestions = moduleQuestions.filter(q => q.section === section);
        const randomQuestion = sectionQuestions[Math.floor(Math.random() * sectionQuestions.length)];
        filteredQuestions.push(randomQuestion);
    });

    if (filteredQuestions.length === 0) {
        alert('No questions found');
        return;
    }

    quizStarted = true;
    currentQuestionIndex = 0;
    userAnswers = new Array(filteredQuestions.length).fill(null);
    userAnswerOrder = new Array(filteredQuestions.length).fill(null);
    wrongAnswers = [];
    userQuestionFeedback = {};
    quizStartTime = Date.now();

    shuffleQuestions();

    document.getElementById('setup-screen').classList.add('hidden');
    document.getElementById('progress-section').classList.remove('hidden');
    document.getElementById('quiz-container').classList.remove('hidden');

    displayQuestion();
}

// Fisher-Yates shuffle for questions
function shuffleQuestions() {
    shuffledQuestions = [...filteredQuestions];
    for (let i = shuffledQuestions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledQuestions[i], shuffledQuestions[j]] = [shuffledQuestions[j], shuffledQuestions[i]];
    }
}

// Shuffle answer options
function shuffleAnswers(question) {
    const options = [...question.options];
    const originalIndex = question.correct;

    const indices = Array.from({length: options.length}, (_, i) => i);

    for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
    }

    const newOptions = indices.map(i => options[i]);
    const newCorrectIndex = indices.indexOf(originalIndex);

    return {
        options: newOptions,
        correct: newCorrectIndex
    };
}

// Display current question (FIXED - only shuffle once)
function displayQuestion() {
    const question = shuffledQuestions[currentQuestionIndex];
    const quizContainer = document.getElementById('quiz-container');

    updateProgress();

    // Handle input-type (fill-in) questions
    if (question.type === 'input') {
        if (!userAnswerOrder[currentQuestionIndex]) {
            userAnswerOrder[currentQuestionIndex] = { type: 'input' };
        }
        const answered = userAnswers[currentQuestionIndex] !== null;
        const savedAnswer = answered ? userAnswers[currentQuestionIndex] : '';
        const isCorrect = answered
            ? savedAnswer.trim().toLowerCase() === question.answer.trim().toLowerCase()
            : null;

        let feedbackHTML = '';
        if (answered && immediateFeeback) {
            feedbackHTML = isCorrect
                ? `<div class="input-feedback input-feedback-correct">✓ Correct! The answer is <strong>${question.answer}</strong></div>`
                : `<div class="input-feedback input-feedback-incorrect">✗ Incorrect. The correct answer is <strong>${question.answer}</strong></div>`;
        } else if (answered && !immediateFeeback) {
            feedbackHTML = `<div class="input-feedback input-feedback-neutral">Answer recorded: <strong>${savedAnswer}</strong></div>`;
        }

        const inputHTML = `
            <div class="question-card">
                <div class="question-text" style="white-space: pre-line;">${question.question}</div>
                <div class="question-feedback-buttons">
                    <button class="btn-feedback-thumbs ${userQuestionFeedback[question.id] ? 'flagged' : ''}"
                            onclick="flagQuestion(${question.id}, 'wrong')" title="Flag as wrong or has errors">👎 Wrong/Error</button>
                    <button class="btn-feedback-thumbs ${userQuestionFeedback[question.id] ? 'flagged' : ''}"
                            onclick="flagQuestion(${question.id}, 'irrelevant')" title="Flag as irrelevant">⚠️ Irrelevant</button>
                </div>
                <div class="input-answer-container">
                    <input type="text" id="text-answer-input"
                           class="text-answer-input${answered ? (isCorrect ? ' input-correct' : ' input-incorrect') : ''}"
                           placeholder="Type your answer here..."
                           value="${answered ? savedAnswer : ''}"
                           ${answered ? 'readonly' : ''}
                           onkeypress="if(event.key==='Enter')submitTextAnswer()">
                    ${!answered ? '<button class="btn btn-primary" onclick="submitTextAnswer()">Submit Answer</button>' : ''}
                </div>
                ${feedbackHTML}
                <div class="button-group">
                    <button class="btn btn-secondary" onclick="previousQuestion()" ${currentQuestionIndex === 0 ? 'disabled' : ''}>← Previous</button>
                    <button class="btn btn-secondary" onclick="skipQuestion()">Skip</button>
                    <button class="btn btn-secondary" onclick="confirmGoHome()">Home</button>
                    <button class="btn btn-primary" onclick="nextQuestion()" ${!answered ? 'disabled' : ''}>
                        ${currentQuestionIndex === shuffledQuestions.length - 1 ? 'Submit Quiz' : 'Next →'}
                    </button>
                </div>
            </div>
        `;
        quizContainer.innerHTML = inputHTML;
        if (!answered) {
            const inp = document.getElementById('text-answer-input');
            if (inp) inp.focus();
        }
        return;
    }

    // Only shuffle once per question - reuse existing shuffle if it exists
    let displayedOptions, correctIndex;

    if (!userAnswerOrder[currentQuestionIndex]) {
        // First time displaying this question - shuffle and store
        const shuffled = shuffleAnswers(question);
        displayedOptions = shuffled.options;
        correctIndex = shuffled.correct;

        // Store the shuffled order for this question
        userAnswerOrder[currentQuestionIndex] = {
            original: question.correct,
            shuffled: correctIndex,
            mapping: displayedOptions.map((opt, idx) => question.options.indexOf(opt))
        };
    } else {
        // Already shuffled - reuse the existing shuffle
        const stored = userAnswerOrder[currentQuestionIndex];
        correctIndex = stored.shuffled;
        // Reconstruct the displayed options using the stored mapping
        displayedOptions = stored.mapping.map(idx => question.options[idx]);
    }

    const letters = ['A', 'B', 'C', 'D'];
    const optionsHTML = displayedOptions.map((option, index) => {
        const isSelected = userAnswers[currentQuestionIndex] === index;
        let classes = 'option';
        let feedback = '';

        if (isSelected) {
            classes += ' selected';
        }

        if (immediateFeeback && userAnswers[currentQuestionIndex] !== null) {
            classes += isSelected ? (index === correctIndex ? ' correct' : ' incorrect') : '';
            if (index === correctIndex && userAnswers[currentQuestionIndex] !== null) {
                feedback = '<span class="feedback-badge">✓ Correct</span>';
            } else if (isSelected && index !== correctIndex) {
                feedback = '<span class="feedback-badge">✗ Wrong</span>';
            }
        }

        if (userAnswers[currentQuestionIndex] !== null && immediateFeeback) {
            classes += ' disabled';
        }

        return `
            <div class="${classes}"
                 onclick="selectAnswer(${index})" ${userAnswers[currentQuestionIndex] !== null && immediateFeeback ? 'style="cursor: not-allowed;"' : ''}>
                <span class="option-letter">${letters[index]}.</span>
                <span>${option}</span>
                ${feedback}
            </div>
        `;
    }).join('');

    const questionHTML = `
        <div class="question-card">
            <div class="question-text">
                ${question.question}
            </div>
            <div class="question-feedback-buttons">
                <button class="btn-feedback-thumbs ${userQuestionFeedback[question.id] ? 'flagged' : ''}"
                        onclick="flagQuestion(${question.id}, 'wrong')"
                        title="Flag this question as wrong or has errors">
                    👎 Wrong/Error
                </button>
                <button class="btn-feedback-thumbs ${userQuestionFeedback[question.id] ? 'flagged' : ''}"
                        onclick="flagQuestion(${question.id}, 'irrelevant')"
                        title="Flag this question as irrelevant">
                    ⚠️ Irrelevant
                </button>
            </div>
            <div class="options">
                ${optionsHTML}
            </div>
            <div class="button-group">
                <button class="btn btn-secondary" onclick="previousQuestion()" ${currentQuestionIndex === 0 ? 'disabled' : ''}>
                    ← Previous
                </button>
                <button class="btn btn-secondary" onclick="skipQuestion()">
                    Skip
                </button>
                <button class="btn btn-secondary" onclick="confirmGoHome()">
                    Home
                </button>
                <button class="btn btn-primary" onclick="nextQuestion()" ${userAnswers[currentQuestionIndex] === null ? 'disabled' : ''}>
                    ${currentQuestionIndex === shuffledQuestions.length - 1 ? 'Submit Quiz' : 'Next →'}
                </button>
            </div>
        </div>
    `;

    quizContainer.innerHTML = questionHTML;
}

// Submit text answer for input-type questions
function submitTextAnswer() {
    const input = document.getElementById('text-answer-input');
    if (!input || !input.value.trim()) return;
    userAnswers[currentQuestionIndex] = input.value.trim();
    displayQuestion();
}

// Select answer
function selectAnswer(answerIndex) {
    if (immediateFeeback && userAnswers[currentQuestionIndex] !== null) {
        return;
    }

    userAnswers[currentQuestionIndex] = answerIndex;

    const nextButton = document.querySelector('.btn-primary');
    if (nextButton) {
        nextButton.disabled = userAnswers[currentQuestionIndex] === null;
    }

    displayQuestion();
}

// Next question
function nextQuestion() {
    if (userAnswers[currentQuestionIndex] === null) {
        alert('Please select an answer before continuing.');
        return;
    }

    if (currentQuestionIndex < shuffledQuestions.length - 1) {
        currentQuestionIndex++;
        displayQuestion();
        window.scrollTo(0, 0);
    } else {
        submitQuiz();
    }
}

// Previous question
function previousQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        displayQuestion();
        window.scrollTo(0, 0);
    }
}

// Skip question
function skipQuestion() {
    if (currentQuestionIndex < shuffledQuestions.length - 1) {
        currentQuestionIndex++;
        displayQuestion();
        window.scrollTo(0, 0);
    } else {
        submitQuiz();
    }
}

// Confirm go home
function confirmGoHome() {
    pendingAction = () => {
        quizStarted = false;
        document.getElementById('quiz-container').classList.add('hidden');
        document.getElementById('progress-section').classList.add('hidden');
        document.getElementById('results-container').classList.add('hidden');
        document.getElementById('setup-screen').classList.remove('hidden');
    };

    document.getElementById('modal-message').textContent = 'Are you sure you want to go back to setup? Your current progress will be lost.';
    document.getElementById('confirmation-modal').classList.remove('hidden');
}

// Close modal
function closeModal() {
    document.getElementById('confirmation-modal').classList.add('hidden');
    pendingAction = null;
}

// Confirm action
function confirmAction() {
    if (pendingAction) {
        pendingAction();
    }
    closeModal();
}

// Submit quiz
function submitQuiz() {
    let correctCount = 0;
    const resultsBySection = {};
    wrongAnswers = [];

    shuffledQuestions.forEach((question, index) => {
        let isCorrect;
        let userAnswerDisplay;
        let correctAnswerDisplay;

        if (question.type === 'input') {
            const userText = (userAnswers[index] !== null && userAnswers[index] !== undefined)
                ? userAnswers[index] : '';
            isCorrect = userText.trim().toLowerCase() === question.answer.trim().toLowerCase();
            userAnswerDisplay = userText || 'Not answered';
            correctAnswerDisplay = question.answer;
        } else {
            const userAnswerIndex = userAnswers[index];
            const mapping = userAnswerOrder[index] ? userAnswerOrder[index].mapping : null;
            const actualAnswerIndex = (mapping && userAnswerIndex !== null) ? mapping[userAnswerIndex] : null;
            isCorrect = actualAnswerIndex === question.correct;
            userAnswerDisplay = (question.options && actualAnswerIndex !== null)
                ? (question.options[actualAnswerIndex] || 'Not answered') : 'Not answered';
            correctAnswerDisplay = question.options ? question.options[question.correct] : '';
        }

        if (isCorrect) {
            correctCount++;
        } else {
            wrongAnswers.push({
                question: question.question,
                userAnswer: userAnswerDisplay,
                correctAnswer: correctAnswerDisplay,
                section: question.section
            });
        }

        if (!resultsBySection[question.section]) {
            resultsBySection[question.section] = { correct: 0, total: 0 };
        }
        resultsBySection[question.section].total++;
        if (isCorrect) {
            resultsBySection[question.section].correct++;
        }
    });

    quizEndTime = Date.now();
    const timeTaken = Math.round((quizEndTime - quizStartTime) / 1000);
    saveQuizResult(correctCount, shuffledQuestions.length, timeTaken);
    displayResults(correctCount, resultsBySection, timeTaken);
}

// ============================================
// RESULTS & DATA
// ============================================

// Save quiz result
function saveQuizResult(score, total, timeTaken) {
    const data = JSON.parse(localStorage.getItem('quizScores') || '{}');

    if (!data[studentName]) {
        data[studentName] = { attempts: [] };
    }

    data[studentName].attempts.push({
        score,
        total,
        percentage: Math.round((score / total) * 100),
        time: timeTaken,
        date: new Date().toLocaleDateString(),
        mode: rapidFireMode ? 'rapid-fire' : 'standard'
    });

    localStorage.setItem('quizScores', JSON.stringify(data));
}

// Get student stats
function getStudentStats() {
    const data = JSON.parse(localStorage.getItem('quizScores') || '{}');
    const studentData = data[studentName];

    if (!studentData || !studentData.attempts || studentData.attempts.length === 0) {
        return null;
    }

    const attempts = studentData.attempts;
    const avgScore = Math.round(attempts.reduce((sum, a) => sum + a.percentage, 0) / attempts.length);
    const bestScore = Math.max(...attempts.map(a => a.percentage));
    const totalAttempts = attempts.length;

    return { totalAttempts, avgScore, bestScore };
}

// Get all scores for leaderboard
function getAllScores() {
    const data = JSON.parse(localStorage.getItem('quizScores') || '{}');
    const leaderboard = [];

    Object.keys(data).forEach(name => {
        const studentData = data[name];
        const scores = studentData.attempts || [];

        if (scores.length > 0) {
            const avgScore = Math.round(scores.reduce((sum, s) => sum + s.percentage, 0) / scores.length);
            const bestScore = Math.max(...scores.map(s => s.percentage));

            leaderboard.push({
                name,
                attempts: scores.length,
                avgScore,
                bestScore,
                lastDate: scores[scores.length - 1].date
            });
        }
    });

    return leaderboard.sort((a, b) => {
        if (b.bestScore !== a.bestScore) {
            return b.bestScore - a.bestScore;
        }
        return b.avgScore - a.avgScore;
    });
}

// Display results
function displayResults(correctCount, resultsBySection, timeTaken) {
    const percentage = Math.round((correctCount / shuffledQuestions.length) * 100);
    let percentageClass = 'high';
    if (percentage < 60) percentageClass = 'low';
    else if (percentage < 80) percentageClass = 'medium';

    const stats = getStudentStats();
    let statsHTML = '';
    if (stats) {
        const leaderboard = getAllScores().map((s, i) => ({ ...s, rank: i + 1 }));
        const studentRank = leaderboard.find(s => s.name === studentName)?.rank || leaderboard.length + 1;

        statsHTML = `
            <div class="student-stats">
                <h4>Your Statistics</h4>
                <div class="stats-grid">
                    <div class="stat-box">
                        <div class="stat-value">${stats.totalAttempts}</div>
                        <div class="stat-label">Attempts</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-value">${stats.avgScore}%</div>
                        <div class="stat-label">Average</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-value">${stats.bestScore}%</div>
                        <div class="stat-label">Best Score</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-value">#${studentRank}</div>
                        <div class="stat-label">Leaderboard Rank</div>
                    </div>
                </div>
            </div>
        `;
    }

    let summaryHTML = '<div class="summary-stats"><h4>Section Breakdown</h4><div class="section-breakdown">';
    Object.keys(resultsBySection).forEach(section => {
        const result = resultsBySection[section];
        const sectionPercentage = Math.round((result.correct / result.total) * 100);
        summaryHTML += `
            <div class="section-result">
                <span class="section-name">${section}</span>
                <span class="section-score">${result.correct}/${result.total} (${sectionPercentage}%)</span>
            </div>
        `;
    });
    summaryHTML += '</div></div>';

    let wrongAnswersHTML = '';
    if (wrongAnswers.length > 0) {
        wrongAnswersHTML = '<div class="wrong-answers-section">';
        wrongAnswersHTML += `<h3>Questions You Got Wrong <span id="wrong-count">(${wrongAnswers.length})</span></h3>`;
        wrongAnswersHTML += '<div class="wrong-answers-list">';
        wrongAnswers.forEach(answer => {
            wrongAnswersHTML += `
                <div class="wrong-answer-item">
                    <div class="section-badge">${answer.section}</div>
                    <div class="question-text">${answer.question}</div>
                    <div class="your-answer">Your answer: ${answer.userAnswer}</div>
                    <div class="correct-answer">Correct answer: ${answer.correctAnswer}</div>
                </div>
            `;
        });
        wrongAnswersHTML += '</div></div>';
    }

    document.getElementById('final-score').textContent = correctCount;
    document.getElementById('final-total').textContent = `/ ${shuffledQuestions.length}`;
    document.getElementById('percentage-display').innerHTML = `
        <div class="percentage ${percentageClass}">${percentage}%</div>
    `;
    document.getElementById('student-stats').innerHTML = statsHTML;
    document.getElementById('summary-stats').innerHTML = summaryHTML;
    document.getElementById('wrong-answers-section').innerHTML = wrongAnswersHTML;

    document.getElementById('quiz-container').classList.add('hidden');
    document.getElementById('progress-section').classList.add('hidden');
    document.getElementById('results-container').classList.remove('hidden');
    window.scrollTo(0, 0);
}

// Display leaderboard
function displayLeaderboard() {
    const leaderboard = getAllScores();
    const leaderboardList = document.getElementById('leaderboard-list');

    if (leaderboard.length === 0) {
        leaderboardList.innerHTML = '<div class="leaderboard-empty">No scores yet. Be the first!</div>';
        return;
    }

    let html = '';
    leaderboard.slice(0, 20).forEach((entry, index) => {
        const rank = index + 1;
        let rankClass = '';
        let medal = '';

        if (rank === 1) {
            rankClass = 'gold';
            medal = '🥇 ';
        } else if (rank === 2) {
            rankClass = 'silver';
            medal = '🥈 ';
        } else if (rank === 3) {
            rankClass = 'bronze';
            medal = '🥉 ';
        }

        html += `
            <div class="leaderboard-item">
                <div class="leaderboard-rank ${rankClass}">${rank}${medal ? '' : '.'}</div>
                <div class="leaderboard-info">
                    <div class="leaderboard-name">${medal}${entry.name}</div>
                    <div class="leaderboard-details">
                        Avg: ${entry.avgScore}% | Attempts: ${entry.attempts} | Last: ${entry.lastDate}
                    </div>
                </div>
                <div class="leaderboard-score">
                    <div class="leaderboard-score-big">${entry.bestScore}%</div>
                    <div class="leaderboard-score-small">Best Score</div>
                </div>
            </div>
        `;
    });

    leaderboardList.innerHTML = html;
}

// ============================================
// PROGRESS & NAVBAR
// ============================================

// Update progress bar
function updateProgress() {
    const progress = ((currentQuestionIndex + 1) / shuffledQuestions.length) * 100;
    document.getElementById('progress-fill').style.width = progress + '%';
    document.getElementById('question-counter').textContent = `Question ${currentQuestionIndex + 1} of ${shuffledQuestions.length}`;
    document.getElementById('student-name-display').textContent = studentName;
    document.getElementById('section-name').textContent = shuffledQuestions[currentQuestionIndex].section;
}

// Update navbar
function updateNavbar() {
    const profileBtn = document.getElementById('profile-btn');
    const dropdownName = document.getElementById('dropdown-name');
    const navStudentName = document.getElementById('nav-student-name');

    if (studentName) {
        profileBtn.style.display = 'flex';
        navStudentName.textContent = studentName;
        dropdownName.textContent = studentName;
    } else {
        profileBtn.style.display = 'none';
    }
}

// Toggle profile menu
function toggleProfileMenu() {
    const dropdown = document.getElementById('profile-dropdown');
    dropdown.classList.toggle('hidden');

    if (!dropdown.classList.contains('hidden')) {
        document.addEventListener('click', closeProfileMenuOutside);
    } else {
        document.removeEventListener('click', closeProfileMenuOutside);
    }
}

// Close profile menu on outside click
function closeProfileMenuOutside(e) {
    const dropdown = document.getElementById('profile-dropdown');
    const profileBtn = document.getElementById('profile-btn');

    if (!dropdown.contains(e.target) && !profileBtn.contains(e.target)) {
        dropdown.classList.add('hidden');
        document.removeEventListener('click', closeProfileMenuOutside);
    }
}

// View student stats
function viewStudentStats() {
    const stats = getStudentStats();
    const leaderboard = getAllScores().map((s, i) => ({ ...s, rank: i + 1 }));
    const studentRank = leaderboard.find(s => s.name === studentName)?.rank || 'Not ranked';

    if (stats) {
        alert(`📊 Your Statistics\n\nAttempts: ${stats.totalAttempts}\nAverage Score: ${stats.avgScore}%\nBest Score: ${stats.bestScore}%\n\nLeaderboard Rank: #${studentRank}`);
    } else {
        alert('No quiz attempts yet. Complete a quiz to see your statistics!');
    }
    toggleProfileMenu();
}

// ============================================
// QUESTION FEEDBACK
// ============================================

// Flag a question
function flagQuestion(questionId, feedbackType) {
    const feedback = JSON.parse(localStorage.getItem('questionFeedback') || '{}');

    if (!feedback[questionId]) {
        feedback[questionId] = {
            id: questionId,
            flagCount: 0,
            feedbackTypes: {}
        };
    }

    feedback[questionId].flagCount++;
    feedback[questionId].feedbackTypes[feedbackType] = (feedback[questionId].feedbackTypes[feedbackType] || 0) + 1;
    feedback[questionId].lastFlaggedDate = new Date().toLocaleDateString();
    feedback[questionId].lastFlaggedBy = studentName;

    localStorage.setItem('questionFeedback', JSON.stringify(feedback));
    userQuestionFeedback[questionId] = feedbackType;
    displayQuestion();
}

// Get flagged questions
function getFlaggedQuestions() {
    const feedback = JSON.parse(localStorage.getItem('questionFeedback') || '{}');
    const flaggedList = [];

    Object.keys(feedback).forEach(qId => {
        const qNum = parseInt(qId);
        const question = allQuestions.find(q => q.id === qNum);
        if (question) {
            flaggedList.push({
                ...question,
                flagData: feedback[qId]
            });
        }
    });

    return flaggedList.sort((a, b) => b.flagData.flagCount - a.flagData.flagCount);
}

// ============================================
// PAGE INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('✓ Page loaded, initializing quiz app...');

    // Load theme first
    loadThemePreferences();
    console.log('✓ Theme preferences loaded');

    // Load questions
    loadQuestions();

    // Initialize navbar
    updateNavbar();
    console.log('✓ Navbar initialized');

    // Setup feedback toggle
    const feedbackToggle = document.getElementById('immediate-feedback');
    if (feedbackToggle) {
        feedbackToggle.addEventListener('change', function() {
            const note = document.getElementById('feedback-note');
            if (this.checked) {
                note.textContent = "You'll see if you're correct right away";
            } else {
                note.textContent = "You'll see all results after completing the quiz";
            }
        });
    }

    // Setup navbar dark mode toggle
    const navbarDarkToggle = document.getElementById('navbar-dark-toggle');
    if (navbarDarkToggle) {
        navbarDarkToggle.checked = currentTheme === 'dark';
        navbarDarkToggle.addEventListener('change', toggleDarkMode);
    }

    // Close modal on outside click
    const modal = document.getElementById('confirmation-modal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal();
            }
        });
    }

    console.log('✓ Quiz app initialization complete!');
});

// ============================================
// ARRANGE STEPS (ORDERING) MODE
// ============================================

let orderingCurrentType = null;
let orderingCurrentDifficulty = 'all';
let orderingCurrentPool = [];
let orderingCurrentChallenge = null;
let orderingScrambledSteps = [];
let orderingUserSteps = [];

function openOrderingMode() {
    document.getElementById('setup-screen').classList.add('hidden');
    document.getElementById('quiz-container').classList.add('hidden');
    document.getElementById('results-container').classList.add('hidden');
    document.getElementById('progress-section').classList.add('hidden');
    document.getElementById('ordering-screen').classList.remove('hidden');
    orderingCurrentType = null;
    orderingCurrentDifficulty = 'all';
    orderingCurrentPool = [];
    orderingCurrentChallenge = null;
    renderOrderingTypeButtons();
    document.getElementById('ordering-difficulty-selector').classList.add('hidden');
    document.getElementById('ordering-problem-card').classList.add('hidden');
    document.getElementById('ordering-columns').classList.add('hidden');
    document.getElementById('ordering-action-row').classList.add('hidden');
    document.getElementById('ordering-result').classList.add('hidden');
    document.getElementById('ordering-solution-box').classList.add('hidden');
}

function closeOrderingMode() {
    document.getElementById('ordering-screen').classList.add('hidden');
    document.getElementById('setup-screen').classList.remove('hidden');
}

function renderOrderingTypeButtons() {
    const container = document.getElementById('ordering-type-buttons');
    container.innerHTML = '';
    Object.keys(orderingChallengeBank).forEach(type => {
        const bank = orderingChallengeBank[type];
        const btn = document.createElement('button');
        btn.className = 'ordering-type-btn' + (type === orderingCurrentType ? ' active' : '');
        btn.textContent = bank.label;
        btn.onclick = () => selectOrderingType(type);
        container.appendChild(btn);
    });
}

function selectOrderingType(type) {
    orderingCurrentType = type;
    orderingCurrentDifficulty = 'all';
    renderOrderingTypeButtons();
    document.getElementById('ordering-difficulty-selector').classList.remove('hidden');
    loadOrderingPool();
    loadOrderingChallenge();
}

function setOrderingDifficulty(d) {
    orderingCurrentDifficulty = d;
    loadOrderingPool();
    loadOrderingChallenge();
}

function loadOrderingPool() {
    if (!orderingCurrentType) return;
    const items = orderingChallengeBank[orderingCurrentType].items;
    if (orderingCurrentDifficulty === 'all') {
        orderingCurrentPool = [...items];
    } else {
        orderingCurrentPool = items.filter(it => it.difficulty === orderingCurrentDifficulty);
        if (orderingCurrentPool.length === 0) orderingCurrentPool = [...items];
    }
}

function loadOrderingChallenge() {
    if (orderingCurrentPool.length === 0) return;
    const idx = Math.floor(Math.random() * orderingCurrentPool.length);
    orderingCurrentChallenge = orderingCurrentPool[idx];
    orderingScrambledSteps = shuffleArray([...orderingCurrentChallenge.steps]);
    orderingUserSteps = [];
    renderOrderingProblem();
}

function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function renderOrderingProblem() {
    document.getElementById('ordering-problem-card').classList.remove('hidden');
    document.getElementById('ordering-problem-title').textContent = orderingCurrentChallenge.title;
    const badge = document.getElementById('ordering-difficulty-badge');
    badge.textContent = orderingCurrentChallenge.difficulty.toUpperCase();
    badge.className = 'ordering-difficulty-badge difficulty-' + orderingCurrentChallenge.difficulty;
    document.getElementById('ordering-columns').classList.remove('hidden');
    document.getElementById('ordering-action-row').classList.remove('hidden');
    document.getElementById('ordering-result').classList.add('hidden');
    document.getElementById('ordering-solution-box').classList.add('hidden');
    renderOrderingColumns();
    updateOrderingCheckBtn();
}

function renderOrderingColumns() {
    const scrambledDiv = document.getElementById('ordering-scrambled');
    scrambledDiv.innerHTML = '';
    orderingScrambledSteps.forEach((step, i) => {
        const el = document.createElement('div');
        el.className = 'ordering-step';
        el.textContent = step;
        el.onclick = () => selectOrderingStep(i);
        scrambledDiv.appendChild(el);
    });

    const userDiv = document.getElementById('ordering-user');
    userDiv.innerHTML = '';
    orderingUserSteps.forEach((step, i) => {
        const el = document.createElement('div');
        el.className = 'ordering-step ordering-step-placed';
        el.textContent = step;
        el.onclick = () => removeOrderingStep(i);
        userDiv.appendChild(el);
    });
}

function selectOrderingStep(i) {
    const step = orderingScrambledSteps.splice(i, 1)[0];
    orderingUserSteps.push(step);
    renderOrderingColumns();
    updateOrderingCheckBtn();
}

function removeOrderingStep(i) {
    const step = orderingUserSteps.splice(i, 1)[0];
    orderingScrambledSteps.push(step);
    renderOrderingColumns();
    updateOrderingCheckBtn();
}

function updateOrderingCheckBtn() {
    const btn = document.getElementById('ordering-check-btn');
    btn.disabled = !orderingCurrentChallenge || orderingUserSteps.length !== orderingCurrentChallenge.steps.length;
}

function checkOrderingAnswer() {
    if (!orderingCurrentChallenge) return;
    const correct = orderingCurrentChallenge.steps;
    const isCorrect = orderingUserSteps.every((step, i) => step === correct[i]);
    const resultDiv = document.getElementById('ordering-result');
    resultDiv.classList.remove('hidden', 'ordering-result-correct', 'ordering-result-wrong');
    if (isCorrect) {
        resultDiv.textContent = '✅ Correct! Great job!';
        resultDiv.classList.add('ordering-result-correct');
        document.getElementById('ordering-solution-box').classList.add('hidden');
    } else {
        resultDiv.textContent = '❌ Not quite — see the correct order below.';
        resultDiv.classList.add('ordering-result-wrong');
        const solBox = document.getElementById('ordering-solution-box');
        solBox.classList.remove('hidden');
        const solSteps = document.getElementById('ordering-solution-steps');
        solSteps.innerHTML = '';
        correct.forEach((step, i) => {
            const el = document.createElement('div');
            el.className = 'ordering-step ordering-step-solution';
            el.textContent = (i + 1) + '. ' + step;
            solSteps.appendChild(el);
        });
    }
}

function resetOrderingAnswer() {
    if (!orderingCurrentChallenge) return;
    orderingScrambledSteps = shuffleArray([...orderingCurrentChallenge.steps]);
    orderingUserSteps = [];
    document.getElementById('ordering-result').classList.add('hidden');
    document.getElementById('ordering-solution-box').classList.add('hidden');
    renderOrderingColumns();
    updateOrderingCheckBtn();
}

function nextOrderingChallenge() {
    loadOrderingChallenge();
}

