/* Assignment 2 browser interface. Grading and review scheduling live in A2Recall. */
(function () {
  'use strict';

  const STORAGE_KEY = 'csci2122-a2-recall-v1';
  const BANK_URL = 'data/2122-a2-recall.json';
  const MAX_DRAFT = 12000;
  const STAGES = ['Facts', 'Syntax', 'Connections', 'Methods'];
  const $ = id => document.getElementById(id);
  let bank;
  let db;
  let core;
  let storageOkay = true;
  let view = 'setup';
  let suppressReferenceEvent = false;

  function text(id, value) { $(id).textContent = value == null ? '' : String(value); }
  function show(id, visible) { $(id).hidden = !visible; }
  function list(id, values) {
    const target = $(id);
    target.replaceChildren();
    values.forEach(value => {
      const li = document.createElement('li');
      li.textContent = value;
      target.append(li);
    });
  }
  function topicFor(question) { return bank.topics.find(topic => topic.id === question.topic); }
  function session() { return db && db.session; }
  function currentQuestion() {
    const round = session();
    return round && round.items[round.index] ? core.findQuestion(bank, round.items[round.index].questionId) : null;
  }
  function phase() { return session().ui ? session().ui.phase : (session().feedback ? 'done' : 'answer'); }
  function storageNotice(message) { show('storage-notice', true); text('storage-notice', message); }
  function persist() {
    if (!db || !core) return;
    try {
      localStorage.setItem(STORAGE_KEY, core.serialize(db));
      if (!storageOkay) {
        storageOkay = true;
        storageNotice('Browser saving is available again. Your current progress has been saved.');
      }
    } catch (error) {
      storageOkay = false;
      storageNotice('This browser cannot save progress right now. Your round still works in this tab. Export a backup before closing it.');
    }
  }
  function settings() {
    return {topic: $('topic').value, mode: $('mode').value, stage: Number($('stage').value), length: Number($('round-length').value)};
  }
  function applySettings(value) {
    if (!value || typeof value !== 'object') return;
    ['topic', 'mode', 'stage'].forEach(key => {
      if (Array.from($(key).options).some(option => option.value === String(value[key]))) $(key).value = String(value[key]);
    });
    if ([10, 20, 40].includes(value.length)) $('round-length').value = String(value.length);
  }
  function selectionDescription() {
    const choice = settings();
    const topic = bank.topics.find(item => item.id === choice.topic);
    const textParts = [topic ? topic.description : 'All topics used in the Assignment 2 decoder, from C rules to complete helper methods.'];
    if (choice.mode === 'focus') textParts.push('Topic labels and an optional reference support your first attempts.');
    if (choice.mode === 'mixed') textParts.push('Topic labels stay hidden until you check your answer.');
    if (choice.mode === 'due') textParts.push('Review skills whose scheduled time has arrived, using a different cue when available.');
    text('selection-description', textParts.join(' '));
  }
  function renderSources() {
    const sourceList = $('sources-list');
    sourceList.replaceChildren();
    bank.sources.forEach(source => {
      const li = document.createElement('li');
      const strong = document.createElement('strong');
      strong.textContent = source.title;
      li.append(strong, document.createTextNode(' — ' + source.detail));
      sourceList.append(li);
    });
  }
  function renderDashboard() {
    const rows = core.topicStats(bank, db, Date.now());
    $('topic-progress').replaceChildren();
    rows.forEach(topic => {
      const tr = document.createElement('tr');
      const name = document.createElement('td');
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = topic.title;
      button.title = 'Choose ' + topic.title + ' for practice';
      button.addEventListener('click', () => {
        if (view === 'study') pause();
        else setView('setup');
        $('topic').value = topic.id;
        $('mode').value = 'focus';
        selectionDescription();
        $('topic').focus();
        $('setup-panel').scrollIntoView({block: 'start', behavior: 'smooth'});
      });
      name.append(button);
      tr.append(name);
      [Math.max(0, topic.total - topic.seen), topic.due, topic.needsWork, topic.delayed].forEach(value => {
        const td = document.createElement('td');
        td.textContent = String(value || 0);
        tr.append(td);
      });
      $('topic-progress').append(tr);
    });
    const totals = core.counts(db, Date.now());
    text('dashboard-total', totals.attempts + ' recorded attempts · ' + totals.due + ' due');
  }
  function renderResume() {
    const round = session();
    const active = round && round.index < round.items.length;
    show('resume-panel', view === 'setup' && active);
    text('start-session', active ? 'Start a new round →' : 'Start recall round →');
    if (active) text('resume-description', round.results.length + ' of ' + round.items.length + ' answers recorded. Your draft and hints are saved. Starting a new round replaces this saved round.');
  }
  function setView(nextView) {
    view = nextView;
    show('setup-panel', nextView === 'setup');
    show('study-panel', nextView === 'study');
    show('summary-panel', nextView === 'summary');
    show('dashboard-panel', nextView !== 'study');
    renderResume();
  }
  function resetQuestionUI() {
    show('feedback-panel', false);
    show('hint-panel', false);
    show('self-rating', false);
    show('alternate-check', false);
    show('next-question', false);
    show('assistance-note', false);
    text('answer-error', '');
    text('review-timing', '');
    text('answer-record-note', '');
    $('question-reference').open = false;
    document.querySelectorAll('[data-rating]').forEach(button => {
      button.disabled = false;
      button.removeAttribute('aria-pressed');
    });
  }
  function renderQuestion(focus) {
    const round = session();
    const question = currentQuestion();
    if (!question) { finish(); return; }
    if (!round.ui) round.ui = {phase: round.feedback ? 'done' : 'answer', referenceUsed: false};
    suppressReferenceEvent = true;
    resetQuestionUI();
    setView('study');
    const answered = round.results.length;
    const currentPhase = phase();
    const locked = currentPhase !== 'answer';
    text('round-progress', 'Question ' + (round.index + 1) + ' of ' + round.items.length + ' · ' + answered + ' answered');
    $('round-progress-bar').max = round.items.length;
    $('round-progress-bar').value = answered;
    text('question-stage', 'Stage ' + question.stage + ' · ' + STAGES[question.stage - 1]);
    const topic = topicFor(question);
    text('question-topic', round.settings.mode === 'focus' || locked ? topic.title : 'Identify the concept');
    text('question-prompt', question.prompt);
    list('assumptions-list', bank.assumptions);
    show('question-code', Boolean(question.code));
    $('question-code').firstElementChild.textContent = question.code || '';
    const isLong = question.type === 'self';
    const answer = isLong ? $('answer-long') : $('answer-short');
    show('answer-short', !isLong);
    show('answer-long', isLong);
    $('answer-label').htmlFor = answer.id;
    text('answer-label', isLong ? 'Your original attempt' : 'Your answer');
    $('answer-short').value = isLong ? '' : round.draft;
    $('answer-long').value = isLong ? round.draft : '';
    $('answer-short').disabled = locked || isLong;
    $('answer-long').disabled = locked || !isLong;
    $('confidence').value = round.confidence || '';
    $('confidence').disabled = locked;
    text('answer-help', isLong ? 'Write your attempt before comparing with the model. Ctrl/Cmd + Enter to compare; Enter adds a line.' : question.type === 'number' ? 'Enter the integer in the format requested. Press Enter to check.' : 'Recall the exact token or form requested. A different valid form can be self-checked. Enter to check.');
    text('check-answer', isLong ? 'Compare with model' : 'Check answer');
    show('answer-actions', !locked);
    $('check-answer').disabled = locked;
    $('show-answer').disabled = locked;
    $('show-hint').disabled = locked || Boolean(round.ui.hintShown);
    if (round.hintUsed && round.ui.hintShown) {
      show('hint-panel', true);
      text('hint-text', question.hint);
    }
    show('question-reference', round.settings.mode === 'focus');
    const reference = $('question-reference-content');
    reference.replaceChildren();
    const referenceHeading = document.createElement('h3');
    referenceHeading.textContent = topic.title;
    reference.append(referenceHeading);
    const noteList = document.createElement('ul');
    topic.notes.forEach(note => { const li = document.createElement('li'); li.textContent = note; noteList.append(li); });
    reference.append(noteList);
    $('question-reference').open = Boolean(round.ui.referenceOpen);
    if (round.hintUsed) {
      show('assistance-note', true);
      text('assistance-note', 'Assistance recorded for this attempt' + (round.ui.referenceUsed ? ' · topic reference opened.' : ' · hint used.'));
    }
    if (locked) renderFeedback();
    setTimeout(() => { suppressReferenceEvent = false; }, 0);
    if (focus) $('question-prompt').focus({preventScroll: true});
  }
  function dueDescription(timestamp) {
    const difference = timestamp - Date.now();
    if (difference <= 0) return 'Ready for due review now.';
    const minutes = Math.ceil(difference / 60000);
    if (minutes < 60) return 'Returns to due review in about ' + minutes + ' minute' + (minutes === 1 ? '' : 's') + '.';
    return 'Next due review: ' + new Date(timestamp).toLocaleString(undefined, {month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'}) + '.';
  }
  function renderFeedback() {
    const round = session();
    const question = currentQuestion();
    const result = round.feedback;
    const currentPhase = phase();
    show('feedback-panel', true);
    text('question-topic', topicFor(question).title);
    text('model-answer', question.answer);
    text('feedback-explanation', question.explanation);
    text('feedback-source', 'Source: ' + question.source);
    list('rubric-list', question.rubric || []);
    show('rubric-block', Boolean(question.rubric && question.rubric.length));
    let heading;
    let message;
    let kind;
    if (currentPhase === 'self') {
      kind = 'Rubric comparison · not an automatic grade';
      heading = 'Check your original attempt.';
      message = 'Compare the attempt above with each requirement. Rate the answer you wrote before seeing this model.';
      show('self-rating', true);
    } else if (currentPhase === 'exact-pending') {
      kind = 'Exact answer comparison';
      heading = 'Your answer did not match the accepted form.';
      message = 'Read the explanation. Continue to record this for more practice, or self-check if your original answer is a valid alternative.';
      show('alternate-check', true);
      show('next-question', true);
      text('answer-record-note', 'Continue to record a missed exact match.');
    } else if (result) {
      const feedback = {
        independent: ['Independent recall', 'Correct from memory.', 'Your answer matched without hints or a revealed answer.'],
        assisted: result.kind === 'self' ? ['Self-checked with support', 'You rated this attempt as meeting the rubric.', 'A hint or reference was used. This self-check is separate from automatic correctness; return later and try without support.'] : ['Assisted recall', 'Correct with support.', 'The hint or reference helped this attempt. Return later and try without support.'],
        'self-pass': ['Self-checked · meets rubric', 'Your attempt meets the rubric.', 'This is your assessment of the original attempt, recorded separately from automatic correctness.'],
        partial: ['Self-checked · partly', 'Keep the missing steps in view.', 'Some of your original attempt was right. Use the model to identify the exact gap before returning later.'],
        miss: [result.kind === 'self' ? 'Self-checked · needs practice' : 'More practice', 'This needs another recall attempt.', 'Compare the original attempt with the model, then try again when it returns to due review.'],
        revealed: ['Answer revealed', 'Read it, then rebuild it later.', 'This answer was shown before a completed recall attempt. It is scheduled for review, without recall credit.']
      }[result.outcome] || ['Attempt recorded', 'Your attempt is saved.', result.feedback];
      [kind, heading, message] = feedback;
      if (round.ui.rating) {
        show('self-rating', true);
        document.querySelectorAll('[data-rating]').forEach(button => {
          button.disabled = true;
          button.setAttribute('aria-pressed', String(['needs', 'partial', 'pass'][Number(button.dataset.rating)] === round.ui.rating));
        });
      }
      text('review-timing', dueDescription(result.dueAt));
      text('answer-record-note', 'Original attempt saved.');
      show('next-question', true);
    }
    text('feedback-kind', kind);
    text('feedback-heading', heading);
    text('feedback-message', message);
    $('feedback-panel').dataset.result = result && result.outcome === 'independent' ? 'correct' : 'practice';
    text('next-question', round.index + 1 >= round.items.length ? 'Finish round →' : 'Next question →');
  }
  function captureDraft() {
    const question = currentQuestion();
    if (!question || phase() !== 'answer') return;
    session().draft = $(question.type === 'self' ? 'answer-long' : 'answer-short').value.slice(0, MAX_DRAFT);
    session().confidence = $('confidence').value;
    persist();
  }
  function record(rating) {
    const round = session();
    if (round.feedback) return round.feedback;
    const item = round.items[round.index];
    const result = core.recordAttempt(bank, db, {
      questionId: item.questionId,
      reviewOf: item.reviewOf || null,
      answer: round.draft,
      confidence: round.confidence || '',
      hintUsed: Boolean(round.hintUsed),
      revealed: Boolean(round.revealed),
      rating: rating || null
    }, Date.now());
    round.feedback = result;
    round.results.push(result);
    round.ui.phase = 'done';
    round.ui.rating = rating || null;
    persist();
    return result;
  }
  function submitAnswer(event) {
    event.preventDefault();
    if (!currentQuestion() || phase() !== 'answer') return;
    captureDraft();
    const round = session();
    const question = currentQuestion();
    const grade = core.grade(question, round.draft);
    if (!grade.valid) {
      text('answer-error', grade.message || 'Write an answer first.');
      $(question.type === 'self' ? 'answer-long' : 'answer-short').focus();
      return;
    }
    if (grade.kind === 'self') round.ui.phase = 'self';
    else if (question.type === 'exact' && !grade.correct) round.ui.phase = 'exact-pending';
    else record(null);
    persist();
    renderQuestion(false);
    $('feedback-heading').focus({preventScroll: true});
    $('feedback-panel').scrollIntoView({block: 'nearest', behavior: 'smooth'});
  }
  function revealAnswer() {
    if (!currentQuestion() || phase() !== 'answer') return;
    captureDraft();
    session().revealed = true;
    record(null);
    renderQuestion(false);
    $('feedback-heading').focus({preventScroll: true});
  }
  function hint() {
    if (!currentQuestion() || phase() !== 'answer') return;
    captureDraft();
    session().hintUsed = true;
    session().ui.hintShown = true;
    persist();
    renderQuestion(false);
    $('hint-panel').scrollIntoView({block: 'nearest', behavior: 'smooth'});
  }
  function nextQuestion() {
    if (!currentQuestion()) return;
    if (phase() === 'exact-pending') record(null);
    if (!session().feedback) return;
    core.advanceSession(session());
    session().ui = {phase: 'answer', referenceUsed: false, referenceOpen: false};
    persist();
    if (session().index >= session().items.length) finish();
    else {
      renderQuestion(true);
      $('study-panel').scrollIntoView({block: 'start', behavior: 'smooth'});
    }
  }
  function startRound(event) {
    if (event) event.preventDefault();
    const choice = settings();
    const round = core.selectSession(bank, db, choice, Date.now(), Math.random);
    db.settings = choice;
    if (!round.items.length) {
      text('setup-message', choice.mode === 'due' ? 'Nothing is due for these topics and stages yet. Your saved round is unchanged. Choose another topic or return after the next review time.' : 'There are no questions for this selection. Try another topic or include a later stage.');
      persist();
      return;
    }
    round.ui = {phase: 'answer', referenceUsed: false, referenceOpen: false};
    db.session = round;
    text('setup-message', '');
    persist();
    renderQuestion(true);
    $('study-panel').scrollIntoView({block: 'start', behavior: 'smooth'});
  }
  function pause() {
    if (view === 'study' && currentQuestion() && phase() === 'answer') captureDraft();
    persist();
    setView('setup');
    renderDashboard();
    $('resume-session').focus({preventScroll: true});
  }
  function metric(value, label) {
    const item = document.createElement('div');
    item.className = 'a2-metric';
    const strong = document.createElement('strong');
    strong.textContent = String(value);
    const span = document.createElement('span');
    span.textContent = label;
    item.append(strong, span);
    return item;
  }
  function finish(early) {
    const round = session();
    if (!round) { setView('setup'); return; }
    if (early && round.ui && round.ui.phase === 'exact-pending') record(null);
    if (early) round.index = round.items.length;
    const results = round.results;
    const count = outcome => results.filter(result => result.outcome === outcome).length;
    const selfChecks = results.filter(result => result.kind === 'self' && result.outcome !== 'revealed').length;
    text('summary-heading', early ? 'Round ended. Your recorded attempts are saved.' : 'Recall recorded. Let it settle.');
    text('summary-description', results.length + ' of ' + round.items.length + ' questions recorded. ' + count('revealed') + ' answer' + (count('revealed') === 1 ? '' : 's') + ' revealed before a completed attempt.');
    $('summary-stats').replaceChildren(
      metric(count('independent'), 'Independent automatic successes'),
      metric(results.filter(result => result.outcome === 'assisted' && result.kind === 'auto').length, 'Automatic successes with assistance'),
      metric(selfChecks, 'Rubric or alternate-form self-checks'),
      metric(count('miss') + count('partial') + count('revealed'), 'Attempts to revisit')
    );
    text('summary-next', 'Use the recall map to choose a topic, or return when due review is ready. Self-checks and same-session success do not establish delayed recall.');
    persist();
    setView('summary');
    renderDashboard();
    $('summary-heading').focus({preventScroll: true});
  }
  function goToSetup() {
    if (session() && session().index >= session().items.length) db.session = null;
    persist();
    setView('setup');
    renderDashboard();
    $('start-session').focus({preventScroll: true});
  }
  function exportProgress() {
    if (view === 'study' && currentQuestion() && phase() === 'answer') captureDraft();
    const blob = new Blob([core.serialize(db)], {type: 'application/json'});
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = 'csci2122-a2-recall-' + new Date().toISOString().slice(0, 10) + '.json';
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    text('backup-message', 'Backup exported. It includes your current review history and saved round.');
  }
  async function importProgress(event) {
    const file = event.target.files[0];
    if (!file) return;
    try {
      if (file.size > 5 * 1024 * 1024) throw new Error('This file is too large to be an A2 progress backup.');
      const imported = core.restore(bank, await file.text());
      if (!window.confirm('Replace this page’s current A2 progress with the validated backup? Export first if you want to keep both.')) return;
      db = imported;
      applySettings(db.settings);
      selectionDescription();
      persist();
      setView('setup');
      renderDashboard();
      text('backup-message', 'Backup imported. Review history and any saved round are ready.');
    } catch (error) {
      text('backup-message', 'Could not import this backup: ' + (error.message || 'invalid file') + ' Your current progress has not changed.');
    } finally {
      event.target.value = '';
    }
  }
  function resetProgress() {
    if (!window.confirm('Reset only Assignment 2 recall progress in this browser, including its saved round? This cannot be undone without an exported backup.')) return;
    db = core.createProgress(bank, Date.now());
    persist();
    setView('setup');
    renderDashboard();
    text('backup-message', 'Assignment 2 recall progress reset. Other review pages were not changed.');
  }
  function bindEvents() {
    $('setup-form').addEventListener('submit', startRound);
    ['topic', 'mode', 'stage', 'round-length'].forEach(id => $(id).addEventListener('change', () => {
      db.settings = settings();
      selectionDescription();
      text('setup-message', '');
      persist();
    }));
    $('answer-form').addEventListener('submit', submitAnswer);
    ['answer-short', 'answer-long'].forEach(id => {
      $(id).maxLength = MAX_DRAFT;
      $(id).addEventListener('input', captureDraft);
    });
    $('answer-long').addEventListener('keydown', event => {
      if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) submitAnswer(event);
    });
    $('confidence').addEventListener('change', captureDraft);
    $('show-answer').addEventListener('click', revealAnswer);
    $('show-hint').addEventListener('click', hint);
    $('next-question').addEventListener('click', nextQuestion);
    $('pause-session').addEventListener('click', pause);
    $('resume-session').addEventListener('click', () => renderQuestion(true));
    $('discard-session').addEventListener('click', () => finish(true));
    $('another-round').addEventListener('click', goToSetup);
    $('review-due').addEventListener('click', () => {
      goToSetup();
      $('mode').value = 'due';
      selectionDescription();
      startRound();
    });
    $('open-self-check').addEventListener('click', () => {
      if (phase() !== 'exact-pending') return;
      session().ui.phase = 'self';
      persist();
      renderQuestion(false);
      $('self-rating').querySelector('button').focus();
    });
    document.querySelectorAll('[data-rating]').forEach(button => button.addEventListener('click', () => {
      if (phase() !== 'self' || session().feedback) return;
      record(['needs', 'partial', 'pass'][Number(button.dataset.rating)]);
      renderQuestion(false);
      $('next-question').focus({preventScroll: true});
    }));
    $('question-reference').addEventListener('toggle', () => {
      if (suppressReferenceEvent || view !== 'study' || !currentQuestion()) return;
      session().ui.referenceOpen = $('question-reference').open;
      if ($('question-reference').open && phase() === 'answer') {
        session().hintUsed = true;
        session().ui.referenceUsed = true;
        show('assistance-note', true);
        text('assistance-note', 'Assistance recorded for this attempt · topic reference opened.');
      }
      persist();
    });
    $('export-progress').addEventListener('click', exportProgress);
    $('import-progress').addEventListener('change', importProgress);
    $('reset-progress').addEventListener('click', resetProgress);
    window.addEventListener('pagehide', () => { if (db) persist(); });
  }
  async function load() {
    show('retry-load', false);
    text('loading-message', 'Loading the Assignment 2 practice bank…');
    try {
      core = window.A2Recall;
      if (!core) throw new Error('The recall engine did not load. Reload the page to try again.');
      const response = await fetch(BANK_URL, {cache: 'no-cache'});
      if (!response.ok) throw new Error('The question bank could not be loaded (HTTP ' + response.status + ').');
      bank = await response.json();
      const errors = core.validateBank(bank);
      if (errors.length) throw new Error('The question bank needs repair: ' + errors[0]);
      db = core.createProgress(bank, Date.now());
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) db = core.restore(bank, saved);
      } catch (error) {
        storageNotice('Saved progress could not be read. This page has opened a fresh session; you can import a valid backup below.');
      }
      bank.topics.forEach(topic => {
        const option = document.createElement('option');
        option.value = topic.id;
        option.textContent = topic.title;
        $('topic').append(option);
      });
      applySettings(db.settings);
      selectionDescription();
      text('bank-count', bank.questions.length + ' recall prompts · ' + bank.topics.length + ' topics');
      renderSources();
      renderDashboard();
      bindEvents();
      show('loading-panel', false);
      show('app', true);
      if (session() && session().index >= session().items.length) finish();
      else setView('setup');
    } catch (error) {
      text('loading-message', (error.message || 'The practice page could not load.') + ' Check your connection and try again. If the page was just updated, reload it to fetch the matching files.');
      show('retry-load', true);
    }
  }
  $('retry-load').addEventListener('click', () => window.location.reload());
  load();
}());
