/** LIVE ATTACK takeover (student pages). Uses the OPTIONAL /api/live-attack.php add-on.
 * When a facilitator triggers an attack, every signed-in student computer shows a full-screen incident.
 * The page underneath is untouched, so no progress is lost.
 * Every click is sent to the server straight away and LOCKED for the whole group (first click wins).
 * The server tallies the score once every question is answered; explanations only arrive after the
 * attack window closes. If the add-on is missing (404), this script does nothing.
 */
import {getSession} from './api.js';
import {LIVE_SCENARIOS} from './live-scenarios.js';

const URL = '/api/live-attack.php';
const $ = id => document.getElementById(id);
const h = (tag, attrs = {}, ...kids) => {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) { if (v == null || v === false) continue; if (k === 'class') n.className = v; else if (k.startsWith('on')) n.addEventListener(k.slice(2), v); else n.setAttribute(k, v === true ? '' : v); }
  for (const k of kids.flat()) if (k != null && k !== false) n.append(k instanceof Node ? k : document.createTextNode(String(k)));
  return n;
};

const state = {csrf:null, attack:null, answers:{}, result:null, feedback:null, mine:new Set(), pending:new Set(), errors:{}, view:null, timer:null, offset:0, disabled:false};
const flag = (k, set) => { try { if (set) sessionStorage.setItem('ol2:live:' + k, '1'); return sessionStorage.getItem('ol2:live:' + k) === '1'; } catch { return false; } };
const now = () => Math.floor(Date.now() / 1000) + state.offset;
const optLabel = (sc, it, v) => it.opts.find(o => o[0] === v)?.[1] || v;

async function get() {
  const r = await fetch(URL, {credentials:'same-origin', cache:'no-store'});
  if (r.status === 404) { state.disabled = true; return null; }
  if (!r.ok) return null;
  return r.json();
}
async function post(body) {
  if (!state.csrf) state.csrf = (await getSession()).csrfToken;
  const send = () => fetch(URL, {method:'POST', credentials:'same-origin', headers:{'Content-Type':'application/json', 'X-CSRF-Token':state.csrf}, body:JSON.stringify(body)});
  let r = await send();
  if (r.status === 419) { state.csrf = (await getSession()).csrfToken; r = await send(); }
  const d = await r.json().catch(() => null);
  if (!r.ok || !d?.ok) { const e = new Error(d?.error || `HTTP ${r.status}`); e.status = r.status; throw e; }
  return d;
}

function overlay() {
  let o = $('la-overlay');
  if (!o) { o = h('div', {id:'la-overlay', class:'la-overlay', role:'alertdialog', 'aria-modal':'true', 'aria-labelledby':'la-title'}); document.body.append(o); }
  return o;
}
function close() {
  clearInterval(state.timer); state.view = null;
  $('la-overlay')?.remove(); document.body.classList.remove('la-locked');
}
function banner(b) {
  if (!b) return null;
  if (b.kind === 'ransom') return h('div', {class:'la-ransom'}, h('strong', {}, b.head), h('span', {}, b.body));
  if (b.kind === 'graph') return h('div', {class:'la-graph', 'aria-hidden':'true'}, ...Array.from({length:24}, (_, i) => h('i', {style:`height:${i < 15 ? 8 + (i % 4) * 3 : 70 + (i * 7) % 28}%`})));
  return h('div', {class:'la-ransom la-note'}, h('strong', {}, b.head), h('span', {}, b.body));
}
function countdown() {
  const a = state.attack; if (!a) return;
  const left = Math.max(0, a.endsAt - now());
  const t = $('la-time'); if (t) t.textContent = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`;
  const bar = $('la-timebar'); if (bar) bar.style.width = `${(left / Math.max(1, a.endsAt - a.startedAt)) * 100}%`;
  const fast = $('la-speed'); if (fast) { const e = now() - a.startedAt; fast.textContent = state.result ? 'All answers in' : e <= 60 ? `Full speed bonus for ${60 - e}s more` : 'Speed bonus shrinking — decide!'; }
  if (left <= 0 && state.view === 'live') poll();
}

async function choose(it, value) {
  const a = state.attack;
  if (!a || state.answers[it.id] || state.pending.has(it.id)) return;
  state.pending.add(it.id); state.mine.add(it.id); delete state.errors[it.id]; render();
  try {
    const d = await post({action:'answer', seq:a.seq, item:it.id, value});
    if (!d.locked) state.mine.delete(it.id);
    state.answers = d.answers || {}; state.result = d.result || null;
  } catch (e) {
    state.mine.delete(it.id);
    if (e.status === 409) { state.pending.delete(it.id); return poll(); }
    state.errors[it.id] = `Not recorded (${e.message}). Tap again.`;
  } finally { state.pending.delete(it.id); }
  render();
}

function itemView(sc, it) {
  const got = state.answers[it.id];
  const who = got ? (state.mine.has(it.id) ? 'you' : `Workstation ${got.w}`) : '';
  return h('fieldset', {class:`la-item ${got ? 'is-locked' : ''}`, 'data-item':it.id},
    it.mail ? h('legend', {class:'la-mail'}, h('small', {}, it.mail[0]), h('strong', {}, it.mail[1]), h('span', {}, it.mail[2])) : h('legend', {}, it.q),
    h('div', {class:'la-opts'}, it.opts.map(([v, label]) => h('button', {type:'button', class:`la-opt ${got?.v === v ? 'is-chosen' : ''} ${state.pending.has(it.id) ? 'is-wait' : ''}`,
      disabled:!!got || state.pending.has(it.id), 'aria-pressed':got?.v === v ? 'true' : 'false', 'data-value':v, onclick:() => choose(it, v)}, label))),
    got ? h('p', {class:'la-lock'}, `🔒 Locked in by ${who}`) : state.pending.has(it.id) ? h('p', {class:'la-lock'}, 'Sending…') : null,
    state.errors[it.id] ? h('p', {class:'la-err'}, state.errors[it.id]) : null);
}

function render() {
  const a = state.attack, sc = a && LIVE_SCENARIOS[a.type];
  if (!sc) return close();
  document.body.classList.add('la-locked');
  const o = overlay(), r = state.result;
  const answered = sc.items.filter(it => state.answers[it.id]).length;

  if (a.active && !r) {
    state.view = 'live';
    o.replaceChildren(h('div', {class:'la-panel'},
      h('div', {class:'la-head'}, h('span', {class:'la-pulse', 'aria-hidden':'true'}, sc.icon), h('div', {}, h('p', {class:'la-kicker'}, 'LIVE ATTACK · ALL TEAMS · YOUR MISSION IS PAUSED (NOTHING IS LOST)'), h('h2', {id:'la-title'}, sc.title)),
        h('div', {class:'la-clock'}, h('strong', {id:'la-time'}, '5:00'), h('small', {id:'la-speed'}))),
      h('div', {class:'la-timebar'}, h('i', {id:'la-timebar'})),
      h('p', {class:'la-intro'}, sc.intro), banner(sc.banner),
      h('p', {class:'la-rule'}, '⚡ Every choice locks instantly for your whole group — there’s no undo. Agree with your partner before you tap.'),
      h('div', {class:'la-items'}, sc.items.map(it => itemView(sc, it))),
      h('div', {class:'la-foot'}, h('span', {}, `Up to ${a.maxPoints} bonus points: right decisions + speed.`), h('strong', {class:'la-count'}, `${answered} / ${sc.items.length} decided`))));
    clearInterval(state.timer); countdown(); state.timer = setInterval(countdown, 1000);
    return;
  }

  clearInterval(state.timer);
  const back = h('button', {type:'button', class:'la-submit', onclick:() => { flag(`${a.seq}:${a.active ? 'score' : 'final'}`, true); if (!a.active) flag(`${a.seq}:score`, true); close(); }}, 'Back to your mission →');
  const label = it => it.q || it.mail?.[1] || it.id;
  let body;
  if (a.active) {
    state.view = 'score';
    body = [h('p', {class:'la-kicker'}, 'ALL DECISIONS LOCKED · SCORED BY MISSION CONTROL'), h('h2', {id:'la-title'}, `+${r.p} bonus points`),
      h('p', {class:'la-intro'}, `${r.c} of ${r.n} decisions right (+${r.d}) · speed bonus +${r.sp} (finished after ${r.s}s)`),
      h('p', {class:'la-intro'}, 'The explanations appear when the attack window closes — other groups are still deciding, so keep your answers to yourselves!')];
  } else {
    state.view = 'final';
    const fb = state.feedback || [];
    body = [h('p', {class:'la-kicker'}, `ATTACK OVER · ${sc.title.toUpperCase()}`),
      r ? h('h2', {id:'la-title'}, `+${r.p} bonus points`) : h('h2', {id:'la-title'}, '⏱ Attack window closed'),
      h('p', {class:'la-intro'}, r ? `${r.c} of ${r.n} decisions right (+${r.d}) · speed bonus +${r.sp}${r.complete ? '' : ' (not every question was answered in time, so no speed bonus)'}`
        : 'Your group didn’t answer in time: 0 bonus points. In a real incident, hesitation is expensive.'),
      fb.length ? h('ul', {class:'la-feedback'}, fb.map(f => { const it = sc.items.find(x => x.id === f.id) || {id:f.id, opts:[]};
        return h('li', {class:f.ok ? 'ok' : 'no'}, h('b', {}, f.ok ? '✓ ' : '✗ '), h('strong', {}, label(it)), h('br'),
          f.ok ? '' : `You chose: ${f.answer ? optLabel(sc, it, f.answer) : '— no answer —'} · Best: ${optLabel(sc, it, f.correct)}. `, f.why); })) : null];
  }
  o.replaceChildren(h('div', {class:`la-panel la-done ${!r ? 'la-late' : ''}`}, ...body,
    h('div', {class:'la-foot'}, h('span', {}, 'Your simulation progress is exactly where you left it.'), back)));
  back.focus();
}

let pollTimer = null;
async function poll() {
  clearTimeout(pollTimer);
  if (state.disabled) return;
  pollTimer = setTimeout(poll, state.view === 'live' ? 2500 : 4000);
  // Never poll while the sign-in form is showing: a request racing the login would replace the new session cookie.
  const loginCard = document.getElementById('loginCard');
  if (loginCard && !loginCard.classList.contains('hidden')) return;
  try {
    const d = await get(); if (!d) return;
    state.offset = d.serverTime - Math.floor(Date.now() / 1000);
    const a = d.attack;
    if (!a || !LIVE_SCENARIOS[a.type]) { if (state.view) close(); state.attack = null; return; }
    if (state.attack?.seq !== a.seq) { state.mine = new Set(); state.errors = {}; }
    state.attack = a; state.answers = d.answers || {}; state.result = d.result || null; state.feedback = d.feedback || null;
    let want = null;
    if (a.active) want = state.result ? (flag(`${a.seq}:score`) ? null : 'score') : 'live';
    else if (now() - a.endsAt < 180 && !flag(`${a.seq}:final`) && (state.view || state.result)) want = 'final';
    if (!want) { if (state.view) close(); return; }
    // Re-render on changes only (keeps focus steady while a group is deciding).
    const sig = JSON.stringify([want, a.seq, state.answers, state.result, !!state.feedback]);
    if (want !== state.view || sig !== state.sig) { state.sig = sig; render(); }
  } catch { /* network blip: try again next poll */ }
}
poll();
