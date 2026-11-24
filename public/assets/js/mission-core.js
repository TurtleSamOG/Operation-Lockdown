/** Operation Lockdown 2.0 — shared gameplay helpers for the zone pages.
 *
 * Two kinds of state live in the browser and must never be confused:
 *   1. SERVER-AUTHORITATIVE: team state, task results, scores, recovery keys. Read from api.js only.
 *   2. LOCAL SIMULATION: investigations, detector settings, patches, office decisions.
 *      These are educational, saved in sessionStorage on THIS computer only, and never sent as scores.
 *
 * This module never grades official tasks and never contains server answers.
 */
import {getSession, getTeamState, getTasks, submitTask, completeZone, getLeaderboard} from './api.js';

/* ---------- Shared fiction ---------- */
export const STORY = {
  company: 'Northstar Systems',
  incident: 'NS-2611',
  people: {
    security: 'Priya Shah · Head of Security',
    engineering: 'Marcus Bell · Engineering Lead',
    facilities: 'Dana Okafor · Facilities & Operations',
    ceo: 'Helen Ward · Chief Executive',
  },
  keys: {
    train: {code:'AI_DEFENCE_ACTIVATED', name:'AI Defence Activated', zone:'Train It'},
    fix: {code:'PORTAL_SECURED', name:'Portal Secured', zone:'Fix It'},
    defend: {code:'THREAT_CONTAINED', name:'Threat Contained', zone:'Defend It'},
  },
};

/* ---------- DOM helpers ---------- */
export const $ = id => document.getElementById(id);
/** el('div', {class:'x', onclick:fn, dataset:{a:1}}, 'text', childNode, [more]) */
export function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs || {})) {
    if (value === null || value === undefined || value === false) continue;
    if (key === 'class') node.className = value;
    else if (key === 'dataset') Object.assign(node.dataset, value);
    else if (key === 'style' && typeof value === 'object') Object.assign(node.style, value);
    else if (key.startsWith('on') && typeof value === 'function') node.addEventListener(key.slice(2), value);
    else if (value === true) node.setAttribute(key, '');
    else node.setAttribute(key, String(value));
  }
  appendAll(node, children);
  return node;
}
function appendAll(node, children) {
  for (const child of children.flat(Infinity)) {
    if (child === null || child === undefined || child === false) continue;
    node.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
}
export function fill(target, ...children) {
  const node = typeof target === 'string' ? $(target) : target;
  if (!node) return null;
  node.replaceChildren();
  appendAll(node, children);
  return node;
}
export const text = (id, value) => { const node = $(id); if (node) node.textContent = String(value); };
export const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
export const wait = ms => new Promise(resolve => setTimeout(resolve, reducedMotion() ? 0 : ms));
export const clamp = (v, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, v));
export const toast = (message, kind = 'info', title = '') => window.LockdownUI?.notify?.(message, kind, title);

/* ---------- Local simulation storage (this computer only) ---------- */
export function localStore(scope) {
  let prefix = `ol2:${scope}:anon`;
  const read = () => { try { return JSON.parse(sessionStorage.getItem(prefix) || '{}'); } catch { return {}; } };
  return {
    bind(team) { prefix = `ol2:${scope}:${team.group}:${team.workingUnit}:${team.workstation}`; },
    get(key, fallback) { const data = read(); return key in data ? data[key] : fallback; },
    set(key, value) { try { const data = read(); data[key] = value; sessionStorage.setItem(prefix, JSON.stringify(data)); } catch { /* storage unavailable: simulation still works in memory */ } },
    clear() { try { sessionStorage.removeItem(prefix); } catch { /* ignore */ } },
  };
}

/* ---------- Handoff codes ----------
 * Short codes students read aloud between workstations. Encodes an integer into Crockford base32
 * with one check character salted by the code type, so a wrong or mistyped code is rejected.
 * Codes carry simulation findings only — they are never used for scoring.
 */
const B32 = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
const salt = type => [...type].reduce((sum, ch) => sum + ch.charCodeAt(0) * 7, 0);
function check(digits, type) { return digits.reduce((sum, d, i) => sum + d * (i + 3), salt(type)) % 32; }
export function encodeCode(type, value, chars) {
  const digits = [];
  let n = value;
  for (let i = 0; i < chars; i++) { digits.unshift(n % 32); n = Math.floor(n / 32); }
  const raw = digits.map(d => B32[d]).join('') + B32[check(digits, type)];
  return raw.slice(0, 3) + '-' + raw.slice(3);
}
/** Returns {ok, value} or {ok:false, reason}. otherTypes lets us explain "that's the wrong station's code". */
export function decodeCode(type, input, chars, otherTypes = []) {
  const clean = String(input || '').toUpperCase().replace(/[\s-]/g, '').replace(/O/g, '0').replace(/[IL]/g, '1');
  const digits = [...clean].map(ch => B32.indexOf(ch));
  if (digits.some(d => d < 0)) return {ok:false, reason:'That code contains a character that is not used in handoff codes.'};
  if (clean.length !== chars + 1) {
    const other = otherTypes.find(t => t.type !== type && t.chars + 1 === clean.length && check(digits.slice(0, t.chars), t.type) === digits[t.chars]);
    return {ok:false, reason: other ? `That looks like a ${other.label} code. Use it in the matching box.` : `This code should have ${chars + 1} characters, like ${encodeCode(type, 0, chars)}.`};
  }
  const data = digits.slice(0, chars), given = digits[chars];
  if (check(data, type) !== given) {
    const other = otherTypes.find(t => t.type !== type && t.chars === chars && check(data, t.type) === given);
    return {ok:false, reason: other ? `That looks like a ${other.label} code. Use it in the matching box.` : 'Code not recognised. Check each character with your partner and try again.'};
  }
  return {ok:true, value:data.reduce((acc, d) => acc * 32 + d, 0)};
}
export const packBits = flags => flags.reduce((acc, f, i) => acc | ((f ? 1 : 0) << i), 0);
export const unpackBits = (value, count) => Array.from({length:count}, (_, i) => Boolean(value & (1 << i)));

/** A small "type the code your partner reads out" widget. onAccept(value) is called with the decoded integer. */
export function codeInput({type, chars, label, placeholder, otherTypes = [], onAccept, buttonText = 'Load code'}) {
  const input = el('input', {type:'text', class:'ol-code-input', maxlength: chars + 3, autocomplete:'off', spellcheck:'false', placeholder: placeholder || 'e.g. ' + encodeCode(type, 1234, chars), 'aria-label': label});
  const status = el('p', {class:'ol-code-status', role:'status', 'aria-live':'polite'});
  const submit = () => {
    const result = decodeCode(type, input.value, chars, otherTypes);
    if (!result.ok) { status.textContent = result.reason; status.dataset.kind = 'bad'; return; }
    status.textContent = 'Code accepted.'; status.dataset.kind = 'good';
    onAccept(result.value, input.value.toUpperCase());
  };
  input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); submit(); } });
  return el('div', {class:'ol-code-entry'},
    el('label', {class:'ol-code-label'}, label),
    el('div', {class:'ol-code-row'}, input, el('button', {type:'button', class:'ol-btn', onclick:submit}, buttonText)),
    status);
}
/** Large readable code display to read out loud. */
export function codeDisplay(code, caption) {
  return el('div', {class:'ol-code-display'},
    el('span', {class:'ol-code-caption'}, caption),
    el('strong', {class:'ol-code-value', 'aria-label': 'Code ' + code.split('').join(' ')}, code));
}

/* ---------- Staged hints ---------- */
export function hintPanel(container, hints, {title = 'Need a nudge?'} = {}) {
  const node = typeof container === 'string' ? $(container) : container;
  if (!node) return;
  let shown = 0;
  const list = el('ol', {class:'ol-hint-list'});
  const button = el('button', {type:'button', class:'ol-btn ol-btn-quiet'}, 'Show hint 1 of ' + hints.length);
  const render = () => {
    fill(list, hints.slice(0, shown).map((h, i) => el('li', {}, el('b', {}, ['Look here: ', 'Concept: ', 'Strategy: '][i] || `Hint ${i + 1}: `), h)));
    button.hidden = shown >= hints.length;
    button.textContent = `Show hint ${shown + 1} of ${hints.length}`;
  };
  button.addEventListener('click', () => { shown = Math.min(hints.length, shown + 1); render(); });
  fill(node, el('details', {class:'ol-hints'}, el('summary', {}, title), list, button));
  render();
}

/* ---------- Server-authoritative zone controller ---------- */
export function describeError(error) {
  if (error?.status === 401) return 'Your group session has ended. Return to the Mission Hub and sign in again.';
  if (error?.status === 403) return error.message;
  if (error?.status === 419) return 'The security token expired. Reload the page and try again.';
  if (error?.status === 0) return 'Cannot reach the server. Check the network or Laragon, then retry.';
  return error?.message || 'The request did not finish. Ask a facilitator for help.';
}
async function withFreshToken(action) {
  try { return await action(); }
  catch (error) {
    if (error?.status !== 419) throw error;
    await getSession();
    return action(); // one retry with a new CSRF token, same request
  }
}

/**
 * createZone({zone:'train', tasks:{a:'train-labels', ...}})
 * ctrl.on(fn) is called with the latest server state whenever it changes.
 */
export function createZone({zone, tasks, pollMs = 5000}) {
  const listeners = new Set();
  const inFlight = new Set();
  const ctrl = {
    zone, tasks, state:null, workstation:null, catalog:new Map(), ready:false, keyBusy:false, lastError:null,
    on(fn) { listeners.add(fn); if (ctrl.state) fn(ctrl.state); return ctrl; },
    result(view) { return ctrl.state?.taskResults?.[tasks[view]] || null; },
    passed(view) { return Boolean(ctrl.result(view)?.passed); },
    stationFor(view) { const t = ctrl.catalog.get(tasks[view]); return t?.station || (view === 'a' ? 'A' : view === 'b' ? 'B' : view); },
    canSubmit(view) { const station = ctrl.stationFor(view); return !['A', 'B'].includes(station) || station === ctrl.workstation; },
    busy() { return inFlight.size > 0 || ctrl.keyBusy; },
    zoneStatus() { return ctrl.state?.zones?.[zone] || {completed:0, total:3, keyEarned:false, finished:false}; },
    timer:null,
    /** Seconds left in the current rotation from the facilitator timer, or null if unknown. */
    secondsLeft() {
      if (!ctrl.timer) return null;
      const elapsed = ctrl.timer.timerRunning ? (Date.now() - ctrl.timer.at) / 1000 : 0;
      return Math.max(0, ctrl.timer.secondsRemaining - elapsed);
    },
  };
  async function readTimer() {
    try { const d = await getLeaderboard(); ctrl.timer = {...d.settings, at:Date.now()}; } catch { /* timer unknown: bonus rule fails open */ }
  }
  let lastSignature = '';
  function adopt(next) {
    // Mutation responses are group snapshots without the login's workstation; keep ours.
    ctrl.state = {...ctrl.state, ...next, workstation: next.workstation || ctrl.workstation};
    const sig = JSON.stringify([ctrl.state.taskResults, ctrl.state.keys, ctrl.state.scores]);
    const changed = sig !== lastSignature;
    lastSignature = sig;
    listeners.forEach(fn => fn(ctrl.state, changed));
  }
  async function maybeAwardKey() {
    const status = ctrl.zoneStatus();
    if (!status.finished || status.keyEarned || ctrl.keyBusy) return null;
    ctrl.keyBusy = true;
    try {
      const updated = await withFreshToken(() => completeZone(zone));
      adopt(updated);
      document.dispatchEvent(new CustomEvent('ol:key', {detail:{zone}}));
      return updated;
    } catch (error) {
      // 409 means another computer has not finished yet or the server disagrees: the server decides.
      if (error.status !== 409) document.dispatchEvent(new CustomEvent('ol:error', {detail:{message:'All tasks passed, but the key could not be saved yet: ' + describeError(error)}}));
      return null;
    } finally { ctrl.keyBusy = false; }
  }
  ctrl.refresh = async () => {
    if (ctrl.busy()) return;
    const latest = await getTeamState();
    ctrl.workstation = latest.workstation || ctrl.workstation;
    adopt(latest);
    await maybeAwardKey();
  };
  ctrl.submit = async (view, answers) => {
    const taskId = tasks[view];
    if (inFlight.has(taskId)) throw Object.assign(new Error('This answer is already being sent.'), {status:-1});
    inFlight.add(taskId);
    try {
      const response = await withFreshToken(() => submitTask(zone, taskId, {answers}));
      adopt(response.teamState);
      const awarded = await maybeAwardKey();
      return {...response, keyAwarded: Boolean(awarded)};
    } finally { inFlight.delete(taskId); }
  };
  ctrl.start = async () => {
    await getSession();
    const [state, loaded] = await Promise.all([getTeamState(), getTasks(zone), readTimer()]);
    ctrl.workstation = state.workstation || 'A';
    for (const task of loaded.tasks || []) ctrl.catalog.set(task.taskId, task);
    ctrl.ready = true;
    adopt(state);
    await maybeAwardKey();
    let failures = 0;
    const timer = setInterval(async () => {
      if (document.hidden) return;
      try { await ctrl.refresh(); failures = 0; ctrl.lastError = null; }
      catch (error) {
        failures++; ctrl.lastError = error;
        if (error.status === 401 || failures === 3) document.dispatchEvent(new CustomEvent('ol:error', {detail:{message:describeError(error), status:error.status}}));
        if (error.status === 401) clearInterval(timer);
      }
    }, pollMs);
    const timerPoll = setInterval(() => { if (!document.hidden) readTimer().then(() => listeners.forEach(fn => fn(ctrl.state, false))); }, 15000);
    window.addEventListener('pagehide', () => { clearInterval(timer); clearInterval(timerPoll); });
    return ctrl.state;
  };
  return ctrl;
}

/* ---------- Mission Control sign-off checkpoint ----------
 * Renders the server's existing questions (text/options come from GET /api/tasks.php).
 * lockReason() returns a string while the station's simulation objective is incomplete.
 */
export function checkpoint(container, ctrl, view, {intro, lockReason = () => null, onResult} = {}) {
  const node = typeof container === 'string' ? $(container) : container;
  const task = ctrl.catalog.get(ctrl.tasks[view]);
  if (!task) { fill(node, el('p', {class:'ol-muted'}, 'This sign-off task is not installed on the server. Ask a facilitator to run database/seed.php.')); return {update(){}}; }
  const form = el('form', {class:'ol-check-form', novalidate:true});
  const status = el('p', {class:'ol-check-status'});
  const lockNote = el('p', {class:'ol-check-lock', role:'status'});
  const feedback = el('div', {class:'ol-check-feedback', role:'status', 'aria-live':'polite'});
  const button = el('button', {type:'submit', class:'ol-btn ol-btn-primary'}, 'Send to Mission Control');
  task.questions.forEach((q, i) => {
    form.append(el('fieldset', {class:'ol-check-q', dataset:{q:q.id}},
      el('legend', {}, el('span', {class:'ol-check-n'}, String(i + 1).padStart(2, '0')), q.text),
      Object.entries(q.options).map(([value, label]) => el('label', {class:'ol-check-opt'},
        el('input', {type:'radio', name:`${task.taskId}__${q.id}`, value}), el('span', {}, label)))));
  });
  form.append(el('div', {class:'ol-check-foot'}, button, status), feedback);
  fill(node, el('div', {class:'ol-check-head'},
      el('span', {class:'ol-kicker'}, 'MISSION CONTROL SIGN-OFF · SERVER-VALIDATED'),
      el('strong', {}, task.title),
      el('small', {}, `${task.passPercent}% to pass · ${task.station === 'joint' ? 'either workstation' : task.station === 'bonus' ? 'optional · either workstation' : 'Workstation ' + task.station + ' only'}`)),
    intro ? el('p', {class:'ol-check-intro'}, intro) : null, lockNote, form);
  let sending = false;
  const lockedNote = el('div', {class:'ol-check-final', hidden:true});
  node.append(lockedNote);
  function update() {
    const saved = ctrl.result(view);
    if (saved?.passed) {
      form.hidden = true; lockNote.hidden = true;
      lockedNote.hidden = false;
      fill(lockedNote, el('strong', {}, `🔒 Signed off · ${saved.score}%`),
        el('p', {}, saved.score === 100 ? 'Mission Control accepted every answer. This decision is final.'
          : 'Mission Control accepted this sign-off. Some answers weren’t the best call — that is now part of your record and can’t be changed. Like real incidents, you live with your decisions.'));
      node.classList.add('is-passed');
      return;
    }
    const reason = !ctrl.canSubmit(view) ? `This sign-off is submitted from Workstation ${ctrl.stationFor(view)}. Talk your partner through it.` : lockReason();
    lockNote.textContent = reason || '';
    lockNote.hidden = !reason;
    form.classList.toggle('is-locked', Boolean(reason));
    button.disabled = Boolean(reason) || sending;
    button.textContent = sending ? 'Validating…' : 'Send to Mission Control';
    status.textContent = saved ? `Not passed yet · ${saved.attempts} attempt${saved.attempts === 1 ? '' : 's'} so far` : 'Once you pass, your answers are final — choose carefully.';
    node.classList.toggle('is-passed', Boolean(saved?.passed));
  }
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (sending) return;
    const reason = !ctrl.canSubmit(view) ? 'Wrong workstation.' : lockReason();
    if (reason) { update(); return; }
    const answers = {};
    for (const q of task.questions) {
      const picked = form.querySelector(`input[name="${CSS.escape(task.taskId + '__' + q.id)}"]:checked`);
      if (!picked) { showFeedback('warn', 'Answer every question before sending. Agree each answer with your teammates.'); return; }
      answers[q.id] = picked.value;
    }
    sending = true; update(); showFeedback('info', 'Sending to Mission Control for validation…');
    try {
      const r = await ctrl.submit(view, answers);
      const attemptsNote = r.scored ? `${r.scoredAttemptsRemaining} scored attempt${r.scoredAttemptsRemaining === 1 ? '' : 's'} left for this unit.` : 'Practice attempt: no extra points, but it still counts for completion.';
      if (r.passed) showFeedback('good', `Validated: ${r.correct}/${r.total} correct (${r.score}%).`);
      else showFeedback('warn', `${r.correct}/${r.total} correct (${r.score}%) — not passed yet. Go back to your evidence, compare it with what the question asks, and discuss any answer you disagreed on. ${attemptsNote}`);
      onResult?.(r);
    } catch (error) {
      showFeedback('bad', 'Not saved: ' + describeError(error));
    } finally { sending = false; update(); }
  });
  function showFeedback(kind, message) { feedback.dataset.kind = kind; feedback.textContent = message; }
  ctrl.on(update);
  update();
  return {update};
}

/* ---------- Role lock: each workstation only sees its own station, the joint task and (when unlocked) the bonus ---------- */
export function applyRoleTabs(workstation) {
  const hide = workstation === 'A' ? 'b' : 'a';
  document.querySelectorAll(`[data-tab="${hide}"], [data-panel="${hide}"]`).forEach(n => { n.hidden = true; n.setAttribute('aria-hidden', 'true'); });
}

/* ---------- Optional challenge: appears only if the zone is finished with enough of the rotation left ---------- */
export const BONUS_MIN_MINUTES_LEFT = 8;
/** 'open' | 'locked' (zone not finished) | 'late' (finished with < BONUS_MIN_MINUTES_LEFT minutes left). Once open, stays open. */
export function bonusStatus(ctrl, store) {
  if (ctrl.passed('bonus') || store.get('bonusUnlocked', false)) return 'open';
  if (!ctrl.zoneStatus().keyEarned) return 'locked';
  if (store.get('bonusLate', false)) return 'late';
  const left = ctrl.secondsLeft();
  if (left === null || left >= BONUS_MIN_MINUTES_LEFT * 60) { store.set('bonusUnlocked', true); return 'open'; }
  store.set('bonusLate', true);
  return 'late';
}
export function applyBonus(ctrl, store, {onUnlock} = {}) {
  const status = bonusStatus(ctrl, store);
  const tab = document.querySelector('[data-tab="bonus"]');
  const wasHidden = tab?.hidden;
  if (tab) tab.hidden = status !== 'open';
  if (status === 'open' && wasHidden && ctrl.ready) { toast('You finished early — an optional challenge is now open.', 'success', 'Bonus unlocked'); onUnlock?.(); }
  return status;
}

/* ---------- Guided steps: one step on screen at a time with clear Back / Next ----------
 * Splits a panel at each .ol-step header. The header's <strong> is the step name and <small> is the instruction.
 */
export function stepify(panel, {key, isDone = () => false} = {}) {
  if (!panel || panel.dataset.stepified) return null;
  panel.dataset.stepified = '1';
  const groups = [];
  for (const child of [...panel.children]) {
    if (child.classList.contains('ol-step') || !groups.length) groups.push({head:child.classList.contains('ol-step') ? child : null, nodes:[]});
    groups[groups.length - 1].nodes.push(child);
  }
  const steps = groups.map((g, i) => ({title:g.head?.querySelector('strong')?.textContent || `Step ${i + 1}`, wrap:el('div', {class:'ol-stepgroup', dataset:{step:i}}, g.nodes)}));
  const nav = el('ol', {class:'ol-stepnav'});
  const back = el('button', {type:'button', class:'ol-btn ol-btn-quiet'}, '← Back');
  const next = el('button', {type:'button', class:'ol-btn ol-btn-primary ol-next'});
  const count = el('span', {class:'ol-stepcount'});
  const foot = el('div', {class:'ol-stepfoot'}, back, count, next);
  panel.replaceChildren(el('div', {class:'ol-stepper'}, nav), ...steps.map(s => s.wrap), foot);
  let current = 0;
  try { current = Math.min(steps.length - 1, Number(sessionStorage.getItem('ol2:step:' + key)) || 0); } catch { /* ignore */ }
  const visited = new Set([current]);
  function render(scroll) {
    steps.forEach((s, i) => { s.wrap.hidden = i !== current; });
    fill(nav, steps.map((s, i) => el('li', {}, el('button', {type:'button', class:`ol-stepbtn ${i === current ? 'is-current' : ''} ${isDone(i) ? 'is-done' : visited.has(i) && i !== current ? 'is-seen' : ''}`,
      'aria-current':i === current ? 'step' : null, onclick:() => go(i)}, el('b', {}, isDone(i) ? '✓' : i + 1), el('span', {}, s.title)))));
    back.hidden = current === 0;
    next.hidden = current === steps.length - 1;
    next.textContent = current < steps.length - 1 ? `Next: ${steps[current + 1].title} →` : '';
    count.textContent = `Step ${current + 1} of ${steps.length}`;
    if (scroll) panel.scrollIntoView({behavior:reducedMotion() ? 'auto' : 'smooth', block:'start'});
  }
  function go(i) { current = Math.max(0, Math.min(steps.length - 1, i)); visited.add(current); try { sessionStorage.setItem('ol2:step:' + key, String(current)); } catch { /* ignore */ } render(true); }
  back.addEventListener('click', () => go(current - 1));
  next.addEventListener('click', () => go(current + 1));
  render(false);
  return {go, refresh:() => render(false), get current() { return current; }, count:steps.length};
}

/* ---------- Page chrome helpers ---------- */
export function bindConnectionErrors(showBanner) {
  document.addEventListener('ol:error', e => showBanner(e.detail.message, 'bad'));
}
export function notLoggedIn(container, message) {
  fill(container, el('div', {class:'ol-login-needed'},
    el('strong', {}, 'Sign in required'),
    el('p', {}, message),
    el('a', {class:'ol-btn ol-btn-primary', href:'/'}, 'Go to the Mission Hub →')));
}
