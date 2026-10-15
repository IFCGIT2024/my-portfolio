/* Pure selection and scoring logic shared by the browser and Node checks. */
(function (root) {
  'use strict';
  const shuffle = (items, random = Math.random) => {
    const result = items.slice();
    for (let i = result.length - 1; i > 0; --i) {
      const j = Math.floor(random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  };
  function generate(bank, { source = 'variants', groups, previous = [], shuffleChoices = true } = {}, random = Math.random) {
    if (!['variants', 'mixed', 'originals'].includes(source)) throw new Error('Unknown question source');
    const wanted = groups || bank.groups.map(g => g.id);
    const selected = bank.groups.filter(g => wanted.includes(g.id)).map(g => {
      let pool = bank.questions.filter(q => q.group === g.id &&
        (source === 'mixed' || q.origin === (source === 'originals' ? 'original' : 'variant')));
      const fresh = pool.filter(q => !previous.includes(q.id));
      if (fresh.length) pool = fresh;
      if (!pool.length) throw new Error('No questions for ' + g.id);
      const q = pool[Math.floor(random() * pool.length)];
      const order = q.type === 'mcq' ? q.options.map((_, i) => i) : [];
      return { id: q.id, order: shuffleChoices && q.origin !== 'original' ? shuffle(order, random) : order };
    });
    if (!selected.length) throw new Error('Select at least one question type');
    return { version: 1, source, selected, answers: {}, ratings: {}, position: 0, submitted: false };
  }
  function answered(question, answer) {
    if (question.type === 'mcq') return Number.isInteger(answer) && answer >= 0 && answer < 4;
    if (question.type === 'trace') return Array.isArray(answer) && answer.length === question.parts.length && answer.every(a => typeof a === 'string' && a.trim());
    return typeof answer === 'string' && !!answer.trim();
  }
  function status(question, session) {
    if (!answered(question, session.answers[question.id])) return 'unanswered';
    if (question.type === 'mcq') return session.answers[question.id] === question.correct ? 'correct' : 'incorrect';
    return ['needs', 'partial', 'confident'].includes(session.ratings[question.id]) ? session.ratings[question.id] : 'pending';
  }
  function summary(bank, session) {
    const byId = new Map(bank.questions.map(q => [q.id, q]));
    const questions = session.selected.map(s => byId.get(s.id));
    const mcq = questions.filter(q => q.type === 'mcq');
    const written = questions.filter(q => q.type !== 'mcq');
    return {
      total: questions.length, answered: questions.filter(q => answered(q, session.answers[q.id])).length,
      mcqTotal: mcq.length, correct: mcq.filter(q => status(q, session) === 'correct').length,
      writtenTotal: written.length, writtenReviewed: written.filter(q => ['needs', 'partial', 'confident'].includes(status(q, session))).length,
      rows: questions.map(q => ({ group: q.group, id: q.id, status: status(q, session) }))
    };
  }
  function restore(bank, raw) {
    try {
      const s = JSON.parse(raw);
      if (!s || s.version !== 1 || !Array.isArray(s.selected) || !s.selected.length || s.selected.length > bank.groups.length) return null;
      if (!Number.isInteger(s.position) || s.position < 0 || s.position >= s.selected.length || typeof s.submitted !== 'boolean') return null;
      if (!s.answers || typeof s.answers !== 'object' || Array.isArray(s.answers) || !s.ratings || typeof s.ratings !== 'object') return null;
      const groups = new Set();
      for (const item of s.selected) {
        const q = bank.questions.find(q => q.id === item.id);
        if (!q || groups.has(q.group)) return null;
        groups.add(q.group);
        if (!Array.isArray(item.order) || (q.type === 'mcq' ? item.order.slice().sort().join(',') !== '0,1,2,3' : item.order.length !== 0)) return null;
        const a = s.answers[q.id];
        if (a !== undefined && !(q.type === 'mcq' ? Number.isInteger(a) && a >= 0 && a < 4 : q.type === 'trace' ? Array.isArray(a) && a.length === q.parts.length && a.every(t => typeof t === 'string') : typeof a === 'string')) return null;
      }
      return s;
    } catch (_) { return null; }
  }
  const api = { shuffle, generate, answered, status, summary, restore };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.MidtermCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
