// =====================================================
// DataGuard Academy — App Logic
// =====================================================

const modules = ['home','m1','m2','m3','m4','m5','m6','m7','m8','m9','m10'];
const completedModules = new Set(); // populated by loadUser()

function saveProgress() {
  const u = getCurrentUser();
  if (u) localStorage.setItem('dga_completed_' + u, JSON.stringify([...completedModules]));
  updateProgressBar();
}

// ── USER PROFILE SYSTEM ────────────────────────────────────────────────────
function _esc_name(s) {
  return String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
function getUsers() {
  return JSON.parse(localStorage.getItem('dga_users') || '[]');
}
function saveUsers(arr) {
  localStorage.setItem('dga_users', JSON.stringify(arr));
}
function getCurrentUser() {
  return localStorage.getItem('dga_current_user') || null;
}
function getUserProgress(name) {
  const saved = JSON.parse(localStorage.getItem('dga_completed_' + name) || '[]');
  return Math.round(saved.length / (modules.length - 1) * 100);
}
function loadUser(name) {
  const all = getUsers();
  if (!all.includes(name)) { all.push(name); saveUsers(all); }
  localStorage.setItem('dga_current_user', name);
  completedModules.clear();
  JSON.parse(localStorage.getItem('dga_completed_' + name) || '[]').forEach(m => completedModules.add(m));
  renderProfileBar();
  updateProgressBar();
}
function resetUserProgress(name) {
  localStorage.removeItem('dga_completed_' + name);
  if (name === getCurrentUser()) { completedModules.clear(); updateProgressBar(); }
}
function deleteUserProfile(name) {
  saveUsers(getUsers().filter(u => u !== name));
  localStorage.removeItem('dga_completed_' + name);
  if (name === getCurrentUser()) localStorage.removeItem('dga_current_user');
}
function renderProfileBar() {
  const bar = document.getElementById('user-profile-bar');
  if (!bar) return;
  const name = getCurrentUser();
  bar.innerHTML = name
    ? `<span class="profile-icon">&#128100;</span><span class="profile-name">${_esc_name(name)}</span><button class="profile-manage-btn" id="open-pm">&#9881; Profiles</button>`
    : `<span class="profile-name" style="color:var(--text-muted)">No profile set</span><button class="profile-manage-btn" id="open-pm">&#9881; Set Up</button>`;
  document.getElementById('open-pm').addEventListener('click', openProfileModal);
}
function openProfileModal() {
  document.getElementById('profile-modal').classList.add('show');
  buildProfileModal();
}
function closeProfileModal() {
  document.getElementById('profile-modal').classList.remove('show');
}
function buildProfileModal() {
  const users = getUsers();
  const current = getCurrentUser();
  const canClose = !!current;
  document.getElementById('profile-modal').innerHTML = `
    <div class="pm-box">
      <div class="pm-header">
        <h2 class="pm-title">&#128100; Profiles</h2>
        ${canClose ? '<button class="pm-close" id="pm-close-btn">&#10005;</button>' : ''}
      </div>
      ${!canClose ? '<p class="pm-subtitle">Create a profile to save and track your progress.</p>' : ''}
      <div class="pm-list" id="pm-list">
        ${users.length === 0
          ? '<p class="pm-empty">No profiles yet. Create one below.</p>'
          : users.map(u => `
          <div class="pm-row ${u === current ? 'pm-row-active' : ''}">
            <div class="pm-row-info">
              <span class="pm-row-name">${_esc_name(u)}</span>
              <span class="pm-row-pct">${getUserProgress(u)}% complete</span>
            </div>
            <div class="pm-row-btns">
              ${u !== current
                ? `<button class="btn btn-sm btn-primary" data-switch="${_esc_name(u)}">Switch</button>`
                : '<span class="pm-active-badge">Active</span>'}
              <button class="btn btn-sm btn-secondary" data-reset="${_esc_name(u)}">Reset</button>
              <button class="btn btn-sm btn-danger" data-delete="${_esc_name(u)}">Delete</button>
            </div>
          </div>`).join('')}
      </div>
      <div class="pm-add-row">
        <input class="pm-input" id="pm-name-inp" type="text" placeholder="New profile name…" maxlength="30" />
        <button class="btn btn-primary btn-sm" id="pm-create-btn">Create</button>
      </div>
      <p class="pm-err" id="pm-err"></p>
    </div>`;
  // Close
  document.getElementById('pm-close-btn')?.addEventListener('click', closeProfileModal);
  document.getElementById('profile-modal').onclick = e => {
    if (e.target.id === 'profile-modal' && canClose) closeProfileModal();
  };
  // Create
  const inp = document.getElementById('pm-name-inp');
  const doCreate = () => {
    const name = inp.value.trim();
    const err = document.getElementById('pm-err');
    if (!name) { err.textContent = 'Please enter a name.'; return; }
    if (getUsers().includes(name)) { err.textContent = 'That name already exists.'; return; }
    const all = getUsers(); all.push(name); saveUsers(all);
    loadUser(name);
    closeProfileModal();
    navigate('home');
  };
  document.getElementById('pm-create-btn').addEventListener('click', doCreate);
  inp.addEventListener('keydown', e => { if (e.key === 'Enter') doCreate(); });
  // Switch
  document.querySelectorAll('[data-switch]').forEach(b => b.addEventListener('click', () => {
    loadUser(b.dataset.switch);
    closeProfileModal();
    navigate('home');
  }));
  // Reset
  document.querySelectorAll('[data-reset]').forEach(b => b.addEventListener('click', () => {
    if (confirm(`Reset all progress for "${b.dataset.reset}"?\nThis cannot be undone.`)) {
      resetUserProgress(b.dataset.reset);
      buildProfileModal();
    }
  }));
  // Delete
  document.querySelectorAll('[data-delete]').forEach(b => b.addEventListener('click', () => {
    if (confirm(`Delete profile "${b.dataset.delete}"?\nThis cannot be undone.`)) {
      deleteUserProfile(b.dataset.delete);
      renderProfileBar();
      buildProfileModal();
    }
  }));
}

function updateProgressBar() {
  const pct = Math.round((completedModules.size / (modules.length - 1)) * 100);
  document.getElementById('overall-progress').style.width = pct + '%';
  document.getElementById('progress-pct').textContent = pct + '%';
  document.querySelectorAll('.nav-item[data-module]').forEach(el => {
    const m = el.dataset.module;
    if (m !== 'home' && completedModules.has(m)) {
      el.classList.add('done');
    } else {
      el.classList.remove('done');
    }
  });
}

function navigate(moduleId) {
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  const navEl = document.querySelector(`.nav-item[data-module="${moduleId}"]`);
  if (navEl) navEl.classList.add('active');
  const renderer = window.MODULES[moduleId];
  if (renderer) {
    document.getElementById('content-area').innerHTML = renderer();
    document.getElementById('main').scrollTop = 0;
    window.scrollTo(0, 0);
    attachInteractivity();
  }
}

function attachInteractivity() {
  // Copy buttons
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const code = btn.closest('.code-block').querySelector('pre').textContent;
      navigator.clipboard.writeText(code).then(() => {
        btn.textContent = 'Copied!';
        btn.classList.add('copied');
        setTimeout(() => { btn.textContent = 'Copy'; btn.classList.remove('copied'); }, 2000);
      });
    });
  });

  // Tabs
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const group = btn.dataset.tabGroup;
      const target = btn.dataset.tab;
      document.querySelectorAll(`.tab-btn[data-tab-group="${group}"]`).forEach(b => b.classList.remove('active'));
      document.querySelectorAll(`.tab-panel[data-tab-group="${group}"]`).forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.querySelector(`.tab-panel[data-tab-group="${group}"][data-tab="${target}"]`)?.classList.add('active');
    });
  });

  // Quiz options
  document.querySelectorAll('.quiz-option').forEach(opt => {
    opt.addEventListener('click', () => {
      const quiz = opt.closest('.quiz-card');
      if (quiz.dataset.answered) return;
      quiz.dataset.answered = '1';
      const correct = opt.dataset.correct === 'true';
      const correctFb = quiz.querySelector('.quiz-feedback.correct-fb');
      const wrongFb = quiz.querySelector('.quiz-feedback.wrong-fb');
      const nextBtn = quiz.querySelector('.quiz-next');
      quiz.querySelectorAll('.quiz-option').forEach(o => {
        o.style.pointerEvents = 'none';
        if (o.dataset.correct === 'true') o.classList.add('reveal-correct');
      });
      if (correct) {
        opt.classList.add('correct');
        if (correctFb) correctFb.classList.add('show');
      } else {
        opt.classList.add('wrong');
        if (wrongFb) wrongFb.classList.add('show');
      }
      if (nextBtn) nextBtn.classList.add('show');
    });
  });

  // Q&A accordion
  document.querySelectorAll('.qa-question').forEach(q => {
    q.addEventListener('click', () => {
      const item = q.closest('.qa-item');
      const wasOpen = item.classList.contains('open');
      document.querySelectorAll('.qa-item').forEach(i => i.classList.remove('open'));
      if (!wasOpen) item.classList.add('open');
    });
  });

  // Module nav buttons
  document.querySelectorAll('[data-goto]').forEach(btn => {
    btn.addEventListener('click', () => navigate(btn.dataset.goto));
  });

  // Complete buttons — attach handler and restore saved state
  document.querySelectorAll('[data-complete]').forEach(btn => {
    const m = btn.dataset.complete;
    if (completedModules.has(m)) {
      btn.textContent = '\u2713 Completed!';
      btn.classList.remove('btn-primary');
      btn.classList.add('btn-secondary');
      btn.disabled = true;
    }
    btn.addEventListener('click', () => {
      completedModules.add(m);
      saveProgress();
      btn.textContent = '\u2713 Completed!';
      btn.classList.remove('btn-primary');
      btn.classList.add('btn-secondary');
      btn.disabled = true;
    });
  });

  // Home module cards
  document.querySelectorAll('.home-module-card').forEach(card => {
    card.addEventListener('click', () => navigate(card.dataset.goto));
  });
}

// Nav click handler
document.getElementById('nav-list').addEventListener('click', e => {
  const item = e.target.closest('.nav-item');
  if (item && item.dataset.module) navigate(item.dataset.module);
});

// Init
renderProfileBar();
navigate('home');
const _saved = getCurrentUser();
if (_saved) {
  loadUser(_saved);
} else {
  updateProgressBar();
  openProfileModal();
}
