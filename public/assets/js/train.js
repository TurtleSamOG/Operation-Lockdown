/** TRAIN IT — AI Security Lab (Operation Lockdown 2.0)
 * Workstation A: Security Data Analyst — investigates synthetic login events.
 * Workstation B: Detection Engineer — tunes a transparent, RULE-BASED risk-score detector
 *               and evaluates it against a labelled synthetic test suite.
 * This is not machine learning and uses no real account data.
 *
 * Official progress = server sign-off tasks (train-labels, train-rules, train-joint, train-bonus).
 * Everything else here is a local simulation saved on this computer only.
 */
import {STORY, $, el, fill, text, wait, toast, localStore, encodeCode, decodeCode, codeInput, codeDisplay,
  hintPanel, createZone, checkpoint, describeError, notLoggedIn, bindConnectionErrors} from './mission-core.js';

const zone = createZone({zone:'train', tasks:{a:'train-labels', b:'train-rules', joint:'train-joint', bonus:'train-bonus'}});
const store = localStore('train');
const CODES = {analyst:{type:'TA', label:'analyst handoff', chars:4}, detector:{type:'TD', label:'detector release', chars:5}};
const OTHER = Object.values(CODES);

/* ======================================================================
 * Shared signal model
 * ==================================================================== */
const SIGNALS = [
  {id:'fails', name:'Repeated failed passwords', short:'Failed logins', icon:'⨯'},
  {id:'geo', name:'Unfamiliar country', short:'New country', icon:'⌖'},
  {id:'device', name:'New or unknown device', short:'New device', icon:'▭'},
  {id:'hour', name:'Login between 00:00 and 05:59', short:'Night-time', icon:'◐'},
  {id:'travel', name:'Impossible travel (two far-apart places, minutes apart)', short:'Impossible travel', icon:'⇄'},
  {id:'mfa', name:'Repeated MFA push requests', short:'MFA spam', icon:'⧉'},
  {id:'spray', name:'One source trying many accounts', short:'Spraying', icon:'⁂'},
];
const signalName = id => SIGNALS.find(s => s.id === id)?.short || id;

/* ======================================================================
 * WORKSTATION A — the live login events under investigation
 * truth/acceptable are the local simulation's teaching model, not server answers.
 * ==================================================================== */
const EVENTS = [
  {id:'E-201', account:'j.carter', role:'Customer Support', time:'09:02', where:'Bristol office', usual:'Bristol office', device:'Known laptop NS-LT-0331', fails:0, last:'Yesterday 08:58', mfa:'Approved first time',
    notes:['Same laptop and building as every weekday this month.'], sig:{f:0},
    truth:'normal', ok:['normal'], why:'Matches this employee’s normal pattern on every measure. Treating routine logins as threats wastes analyst time.'},
  {id:'E-202', account:'payroll.admin', role:'Privileged payroll account', time:'02:31', where:'Bucharest, Romania', usual:'Bristol office', device:'Unknown Linux device', fails:14, last:'Yesterday 17:20', mfa:'Not required — legacy account exempt from MFA',
    notes:['14 wrong passwords in 3 minutes, then a success.', 'This account can change bank details for every employee.'], sig:{f:14, geo:1, device:1, hour:1},
    truth:'suspicious', ok:['suspicious'], why:'Many failures followed by success, a new country, an unknown device, night-time, on a privileged account with no MFA. Several strong signals together point to a guessed password.'},
  {id:'E-203', account:'s.patel', role:'Sales Manager', time:'13:40', where:'Madrid, Spain', usual:'Bristol office', device:'Known phone NS-PH-1182', fails:0, last:'Today 07:55 (Madrid)', mfa:'Approved first time',
    notes:['HR system: approved business travel 20–24 Nov (trade visit, Madrid).'], sig:{f:0, geo:1, approved:1},
    truth:'normal', ok:['normal', 'review'], why:'The country is unusual, but approved travel and a known device explain it. A detector that alerts on every traveller creates false alarms.'},
  {id:'E-204', account:'m.okoro', role:'Finance Officer', time:'03:05', where:'Bristol (home internet)', usual:'Bristol office / home', device:'New Windows device', fails:0, last:'Yesterday 16:40', mfa:'7 push requests denied, 8th approved at 03:05',
    notes:['Helpdesk ticket 08:15: “My phone kept buzzing overnight so I pressed approve to make it stop.”'], sig:{f:0, device:1, hour:1, mfa:1},
    truth:'suspicious', ok:['suspicious'], why:'No failed passwords — the attacker already had the password. Repeated MFA prompts until someone gives in is called “MFA fatigue”. Location alone would not catch this.'},
  {id:'E-205', account:'l.nguyen', role:'Warehouse Supervisor', time:'08:55', where:'Bristol office', usual:'Bristol office', device:'Known desktop NS-DT-0090', fails:2, last:'Yesterday 08:51', mfa:'Approved first time',
    notes:['Password was changed yesterday (scheduled 90-day reset).'], sig:{f:2},
    truth:'normal', ok:['normal'], why:'Two mistakes the day after a password change is ordinary human behaviour. Thresholds that are too low punish normal staff.'},
  {id:'E-206', account:'k.ross (+8 others)', role:'Customer Services team', time:'11:14', where:'Netherlands — hosting provider', usual:'Bristol office', device:'Unknown', fails:1, last:'Varies', mfa:'k.ross: approved after 1 prompt',
    notes:['One IP address tried 9 different accounts, 1 password each, within 2 minutes.', 'Only k.ross succeeded.'], sig:{f:1, geo:1, device:1, spray:1},
    truth:'suspicious', ok:['suspicious'], why:'Each account only saw one failure, so a per-account failure rule misses it. Looking across accounts reveals password spraying from one source.'},
  {id:'E-207', account:'r.hughes', role:'New starter (started Monday)', time:'10:17', where:'Bristol office', usual:'No history yet', device:'New laptop NS-LT-0412 — enrolled by IT yesterday', fails:1, last:'Yesterday 16:02', mfa:'Approved first time',
    notes:['IT asset record confirms the laptop was issued to r.hughes.'], sig:{f:1, device:1},
    truth:'normal', ok:['normal', 'review'], why:'“New device” is expected for a new starter, and IT can confirm the asset. Checking is reasonable; blocking would be heavy-handed.'},
  {id:'E-208', account:'t.evans', role:'Operations Analyst', time:'10:20', where:'Singapore', usual:'Manchester depot', device:'Known laptop NS-LT-0277', fails:0, last:'Today 10:02 — Manchester', mfa:'Approved first time',
    notes:['Manchester → Singapore in 18 minutes is physically impossible.', 'No record of t.evans using the company VPN today.'], sig:{f:0, travel:1},
    truth:'review', ok:['review'], why:'Impossible travel is a real warning sign, but a VPN or misreported location can cause it. The right move is to verify with the employee before acting.'},
  {id:'E-209', account:'k.brooks', role:'IT Technician', time:'01:15', where:'Bristol office (server room)', usual:'Bristol office', device:'Known laptop NS-LT-0101', fails:0, last:'Yesterday 17:30', mfa:'Approved first time',
    notes:['Change ticket CHG-4471: overnight server patching 00:30–03:00, assigned to k.brooks.'], sig:{f:0, hour:1, ticket:1},
    truth:'normal', ok:['normal'], why:'Night-time is unusual for most staff, but this login matches a planned maintenance ticket. Context turns a “suspicious” hour into expected activity.'},
  {id:'E-210', account:'a.fraser', role:'Customer Data Analyst', time:'18:50', where:'Bristol (home internet)', usual:'Bristol office / home', device:'Known laptop, new browser', fails:0, last:'15 Nov', mfa:'Approved first time',
    notes:['HR system: a.fraser is on annual leave 18–29 Nov.', 'Session exported 48,000 customer records.'], sig:{f:0},
    truth:'review', ok:['review', 'suspicious'], why:'Nothing about the login itself looks wrong — the password, place and laptop are normal. The risk is what happened next, while they were meant to be on leave. Rules about login signals alone will not see it.'},
];
const LABELS = {normal:'Normal', suspicious:'Suspicious', review:'Needs verification'};
const LABEL_KEYS = ['normal', 'suspicious', 'review'];

/* ======================================================================
 * WORKSTATION B — labelled historical test suite and bonus incidents
 * ==================================================================== */
const SUITE = [
  {id:'H1', attack:1, name:'Credential stuffing at 03:12', f:14, geo:1, device:1, hour:1},
  {id:'H2', attack:1, name:'MFA fatigue on finance account', f:0, device:1, hour:1, mfa:1},
  {id:'H3', attack:1, name:'Password spray across 12 accounts', f:1, spray:1},
  {id:'H4', attack:1, name:'Stolen session from abroad', f:0, geo:1, device:1},
  {id:'H5', attack:1, name:'Brute force during office hours', f:9},
  {id:'H6', attack:1, name:'Impossible travel on new laptop', f:0, travel:1, device:1},
  {id:'H7', attack:1, name:'Slow guessing at 04:40', f:4, hour:1},
  {id:'L1', attack:0, name:'Routine office login', f:0},
  {id:'L2', attack:0, name:'Approved trip to Lyon', f:0, geo:1, approved:1},
  {id:'L3', attack:0, name:'Approved trip, laptop replaced abroad', f:0, geo:1, travel:1, device:1, approved:1},
  {id:'L4', attack:0, name:'New starter’s first laptop', f:0, device:1},
  {id:'L5', attack:0, name:'Three typos after a password reset', f:3},
  {id:'L6', attack:0, name:'Technician with change ticket at 02:00', f:0, hour:1, ticket:1},
  {id:'L7', attack:0, name:'New phone, one typo', f:1, device:1},
  {id:'L8', attack:0, name:'Night-shift warehouse supervisor', f:0, hour:1},
  {id:'L9', attack:0, name:'Five tries after two weeks’ holiday', f:5},
];
const BONUS_CASES = [
  {id:'X1', attack:1, name:'NEW: attacker on a stolen company laptop at 02:50', f:2, hour:1, bonus:1,
    story:'A laptop stolen from a car last week is used at 02:50. Its owner is asleep. Two wrong guesses, then success. The device is “known”, so the new-device signal stays silent.'},
  {id:'X2', attack:0, name:'NEW: approved trade fair in Germany, hired laptop', f:0, geo:1, device:1, approved:1, bonus:1,
    story:'The sales director is at a trade fair in Cologne with approved travel. Her laptop broke, so she is using a hired one. Blocking her would cost the company a major contract meeting.'},
];
const START_CONFIG = {th:10, w:{fails:2, geo:2, device:0, hour:2, travel:0, mfa:0, spray:0}, alert:2, ctx:false};
const REQUIRE = {base:{caught:6, of:7, maxFalse:1}, bonus:{caught:7, of:8, maxFalse:1}};

function riskScore(e, c) {
  const parts = [];
  const add = (id, w, why) => { if (w > 0) parts.push({id, w, why}); };
  if ((e.f || 0) >= c.th) add('fails', c.w.fails, `${e.f} failed ≥ ${c.th}`);
  if (e.geo) { if (c.ctx && e.approved) parts.push({id:'geo', w:0, why:'approved travel (ignored)'}); else add('geo', c.w.geo, 'new country'); }
  if (e.device) add('device', c.w.device, 'new device');
  if (e.hour) { if (c.ctx && e.ticket) parts.push({id:'hour', w:0, why:'change ticket (ignored)'}); else add('hour', c.w.hour, 'night-time'); }
  if (e.travel) { if (c.ctx && e.approved) parts.push({id:'travel', w:0, why:'approved travel (ignored)'}); else add('travel', c.w.travel, 'impossible travel'); }
  if (e.mfa) add('mfa', c.w.mfa, 'MFA spam');
  if (e.spray) add('spray', c.w.spray, 'spraying');
  const score = parts.reduce((s, p) => s + p.w, 0);
  return {score, alert: score >= c.alert, parts};
}
function evaluate(c, includeBonus) {
  const cases = includeBonus ? [...SUITE, ...BONUS_CASES] : SUITE;
  const rows = cases.map(e => { const r = riskScore(e, c); return {e, ...r, outcome: e.attack ? (r.alert ? 'TP' : 'FN') : (r.alert ? 'FP' : 'TN')}; });
  const count = k => rows.filter(r => r.outcome === k).length;
  const m = {TP:count('TP'), FN:count('FN'), FP:count('FP'), TN:count('TN')};
  const attacks = m.TP + m.FN, legit = m.FP + m.TN;
  const req = includeBonus ? REQUIRE.bonus : REQUIRE.base;
  const detection = attacks ? m.TP / attacks : 0, specificity = legit ? m.TN / legit : 0;
  return {rows, m, attacks, legit, req, includeBonus,
    quality: Math.round(50 * (detection + specificity)), // balanced accuracy
    meets: m.TP >= req.caught && m.FP <= req.maxFalse};
}

/* ---------- config <-> code (22 bits used of 25) ---------- */
const W_ORDER = ['fails', 'geo', 'device', 'hour', 'travel', 'mfa', 'spray'];
function configToInt(c) {
  let v = 0;
  for (const id of W_ORDER) v = v * 4 + c.w[id];
  v = v * 16 + (c.th - 1); v = v * 8 + (c.alert - 1); v = v * 2 + (c.ctx ? 1 : 0);
  return v;
}
function intToConfig(v) {
  const ctx = Boolean(v % 2); v = Math.floor(v / 2);
  const alert = v % 8 + 1; v = Math.floor(v / 8);
  const th = v % 16 + 1; v = Math.floor(v / 16);
  const w = {};
  for (const id of [...W_ORDER].reverse()) { w[id] = v % 4; v = Math.floor(v / 4); }
  return {th: Math.min(15, th), w, alert, ctx};
}
function labelsToInt(labels) { return EVENTS.reduce((acc, e) => acc * 3 + Math.max(0, LABEL_KEYS.indexOf(labels[e.id] || 'normal')), 0); }
function intToLabels(v) {
  const out = {};
  for (const e of [...EVENTS].reverse()) { out[e.id] = LABEL_KEYS[v % 3]; v = Math.floor(v / 3); }
  return out;
}
const eventAsCase = e => ({...e.sig, f:e.sig.f || 0});

/* ======================================================================
 * Local simulation state (this computer only)
 * ==================================================================== */
const sim = {
  opened:new Set(), labels:{}, signalsUseful:new Set(), reviews:0, lastReview:null, debrief:false, selected:'E-201',
  config:structuredClone(START_CONFIG), runs:[], bestMet:false, bonusMet:false, includeBonus:false,
  partnerAnalyst:null, partnerDetector:null, checklist:new Set(), release:null,
};
function save() {
  store.set('sim', {...sim, opened:[...sim.opened], signalsUseful:[...sim.signalsUseful], checklist:[...sim.checklist]});
}
function restore() {
  const s = store.get('sim', null); if (!s) return;
  Object.assign(sim, s, {opened:new Set(s.opened || []), signalsUseful:new Set(s.signalsUseful || []), checklist:new Set(s.checklist || [])});
}

/* ======================================================================
 * Page chrome
 * ==================================================================== */
let activeTab = 'a';
function banner(message, kind = 'info') { const b = $('tl-banner'); b.textContent = message; b.dataset.kind = kind; }
function selectTab(tab) {
  activeTab = tab;
  document.querySelectorAll('[data-tab]').forEach(b => b.setAttribute('aria-selected', String(b.dataset.tab === tab)));
  document.querySelectorAll('[data-panel]').forEach(p => { p.hidden = p.dataset.panel !== tab; });
  if (tab === 'joint') renderJoint();
  if (tab === 'bonus') renderBonus();
}
function renderStatus(state) {
  text('tl-group', state.groupName || state.team || 'Group');
  text('tl-unit', `Unit ${state.workingUnit || '—'} · group progress is shared`);
  text('tl-station', `Workstation ${zone.workstation}`);
  text('tl-role', zone.workstation === 'A' ? 'Security Data Analyst' : 'Detection Engineer');
  text('tl-score', `${state.scores?.train ?? 0} / 100`);
  const z = zone.zoneStatus();
  text('tl-progress', `${z.completed} of ${z.total} sign-offs passed`);
  text('tl-keytext', z.keyEarned ? 'RECOVERED' : 'LOCKED');
  for (const view of ['a', 'b', 'joint', 'bonus']) {
    const badge = $(`tl-tab-${view}`);
    if (badge) { badge.textContent = zone.passed(view) ? '✓ signed off' : view === 'bonus' ? 'optional' : 'open'; badge.classList.toggle('done', zone.passed(view)); }
  }
  document.querySelectorAll('.ol-you').forEach(n => { n.hidden = n.dataset.for !== zone.workstation; });
  const key = $('tl-key');
  key.classList.toggle('is-earned', z.keyEarned);
  text('tl-key-sub', z.keyEarned ? 'Saved to your group by the server. Check the live leaderboard.' : 'Unlocks when the server confirms A, B and joint sign-offs.');
  text('tl-key-glyph', z.keyEarned ? '✓' : '◇');
}

/* ======================================================================
 * A — Analyst dashboard
 * ==================================================================== */
const minutes = t => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
function renderTimeline() {
  const W = 1240, H = 92, x = t => 24 + (minutes(t) / 1440) * (W - 48);
  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.setAttribute('class', 'tl-timeline'); svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', 'Login activity over 24 hours. Select an event in the table for details.');
  const add = (tag, attrs, txt) => { const n = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v); if (txt) n.textContent = txt; svg.append(n); return n; };
  add('rect', {x:x('00:00'), y:14, width:x('06:00') - x('00:00'), height:50, fill:'#1a2a48', rx:6});
  add('text', {x:x('00:00') + 6, y:10, fill:'#7f95c8', 'font-size':9, 'font-family':'monospace'}, 'NIGHT 00:00–05:59');
  add('line', {x1:24, x2:W - 24, y1:64, y2:64, stroke:'#2a4459', 'stroke-width':1});
  for (let h = 0; h <= 24; h += 3) { const xx = 24 + (h / 24) * (W - 48); add('line', {x1:xx, x2:xx, y1:62, y2:67, stroke:'#4b6a80'}); add('text', {x:xx, y:82, fill:'#7c97ab', 'font-size':10, 'text-anchor':'middle', 'font-family':'monospace'}, String(h).padStart(2, '0') + ':00'); }
  EVENTS.forEach((e, i) => {
    const lab = sim.labels[e.id];
    const colour = lab === 'suspicious' ? '#ff8a99' : lab === 'review' ? '#f4c86d' : lab === 'normal' ? '#5fe3b0' : '#7aa7c2';
    const cy = 52 - (i % 3) * 12;
    const g = document.createElementNS(NS, 'g'); g.setAttribute('class', 'tl-dot'); g.setAttribute('tabindex', '0'); g.setAttribute('role', 'button');
    g.setAttribute('aria-label', `${e.id} at ${e.time}, ${e.account}`);
    g.addEventListener('click', () => openEvent(e.id));
    g.addEventListener('keydown', ev => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); openEvent(e.id); } });
    const c = document.createElementNS(NS, 'circle'); c.setAttribute('cx', x(e.time)); c.setAttribute('cy', cy); c.setAttribute('r', sim.selected === e.id ? 8 : 6);
    c.setAttribute('fill', colour); c.setAttribute('stroke', sim.selected === e.id ? '#fff' : '#0a1724'); c.setAttribute('stroke-width', 2);
    g.append(c); svg.append(g);
  });
  fill('tl-timeline', svg);
}
function flagChips(e) {
  const chips = [];
  if (e.fails >= 3) chips.push(el('span', {class:'ol-chip warn'}, `${e.fails} fails`));
  if (e.sig.geo) chips.push(el('span', {class:'ol-chip'}, 'new country'));
  if (e.sig.device) chips.push(el('span', {class:'ol-chip'}, 'new device'));
  if (e.sig.hour) chips.push(el('span', {class:'ol-chip'}, 'night'));
  if (e.sig.travel) chips.push(el('span', {class:'ol-chip warn'}, 'travel'));
  if (e.sig.mfa) chips.push(el('span', {class:'ol-chip warn'}, 'MFA'));
  if (e.sig.spray) chips.push(el('span', {class:'ol-chip warn'}, 'many accounts'));
  return chips;
}
function renderEventTable() {
  const rows = EVENTS.map(e => {
    const lab = sim.labels[e.id];
    return el('tr', {class: `${sim.selected === e.id ? 'is-selected' : ''} ${sim.opened.has(e.id) ? 'is-opened' : ''}`, tabindex:'0', 'aria-selected': String(sim.selected === e.id),
        onclick:() => openEvent(e.id), onkeydown:ev => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); openEvent(e.id); } }},
      el('td', {class:'tl-mono'}, e.id), el('td', {class:'tl-mono'}, e.time),
      el('td', {}, el('strong', {}, e.account), el('small', {}, e.role)),
      el('td', {}, e.where), el('td', {class:'tl-flags'}, flagChips(e)),
      el('td', {}, lab ? el('span', {class:`tl-label tl-label-${lab}`}, LABELS[lab]) : el('span', {class:'tl-label'}, sim.opened.has(e.id) ? 'Unclassified' : 'Not opened')));
  });
  fill('tl-events', rows);
  const done = Object.keys(sim.labels).length;
  text('tl-a-opened', `${sim.opened.size}/10`);
  text('tl-a-classified', `${done}/10`);
  text('tl-a-reviews', String(sim.reviews));
  $('tl-a-review').disabled = done < EVENTS.length;
  text('tl-a-review-hint', done < EVENTS.length ? `Classify all 10 events to request a review (${10 - done} left).` : 'Ready: ask the security lead to review your classifications.');
}
function openEvent(id) {
  sim.selected = id; sim.opened.add(id); save();
  const e = EVENTS.find(x => x.id === id);
  const compare = [
    ['Location', e.where, e.usual], ['Device', e.device, e.usual === 'No history yet' ? 'No history yet' : 'Known company device'],
    ['Failed attempts', String(e.fails), '0–1 typical'], ['Previous login', e.last, '—'], ['MFA', e.mfa, 'Approved once'],
  ];
  const lab = sim.labels[id];
  fill('tl-inspector',
    el('div', {class:'tl-insp-head'}, el('span', {class:'ol-kicker'}, `EVENT ${e.id} · ${e.time}`), el('h3', {}, e.account), el('small', {}, e.role)),
    el('table', {class:'tl-compare'}, el('thead', {}, el('tr', {}, el('th', {}, ''), el('th', {}, 'This event'), el('th', {}, 'Normal for this user'))),
      el('tbody', {}, compare.map(([k, v, n]) => el('tr', {}, el('th', {}, k), el('td', {}, v), el('td', {class:'tl-dim'}, n))))),
    el('div', {class:'tl-notes'}, el('span', {class:'ol-kicker'}, 'CONTEXT & EVIDENCE'), e.notes.map(n => el('p', {}, '› ' + n))),
    el('div', {class:'tl-classify', role:'group', 'aria-label':'Classify this event'},
      LABEL_KEYS.map(k => el('button', {type:'button', class:`ol-btn tl-cls-${k}`, 'aria-pressed': String(lab === k), onclick:() => classify(id, k)}, LABELS[k]))),
    sim.debrief ? el('div', {class:`tl-debrief ${e.ok.includes(lab) ? 'good' : 'warn'}`}, el('strong', {}, `Debrief — best call: ${LABELS[e.truth]}`), el('p', {}, e.why)) : null,
  );
  renderEventTable(); renderTimeline();
}
function classify(id, label) {
  sim.labels[id] = label; save();
  openEvent(id);
  const next = EVENTS.find(e => !sim.labels[e.id]);
  if (next && Object.keys(sim.labels).length < EVENTS.length) text('tl-a-next', `Next unclassified: ${next.id}`); else text('tl-a-next', '');
}
function judge(e, label) {
  if (e.ok.includes(label)) return null;
  if (e.truth === 'suspicious' && label === 'normal') return {sev:'serious', what:'If this is an attack, it goes unnoticed and the attacker keeps their access.'};
  if (e.truth === 'normal' && label === 'suspicious') return {sev:'moderate', what:'If this employee is innocent, they get locked out or wrongly treated as an attacker.'};
  if (e.truth === 'review' && label === 'normal') return {sev:'moderate', what:'There is conflicting evidence here. Calling it normal means nobody checks it.'};
  if (e.truth === 'review' && label === 'suspicious') return {sev:'moderate', what:'There is conflicting evidence here. Treating it as an attack could hurt an innocent employee before anyone has checked.'};
  if (e.truth === 'suspicious' && label === 'review') return {sev:'minor', what:'Verification is cautious, but the evidence is strong — waiting gives the attacker extra time.'};
  return {sev:'minor', what:'Probably fine, but it adds work for an already stretched team.'};
}
const NUDGE = {
  'E-202':'Count the signals. How many are unusual at once — and what can this account do?',
  'E-204':'There were no failed passwords. What did the MFA log and the helpdesk ticket say?',
  'E-206':'Don’t look at one account. Look at what the same source did across the team.',
  'E-203':'Is there anything in the HR system that explains the location?',
  'E-207':'Who issued this device, and when?',
  'E-209':'Is there a ticket that explains why someone is working at this hour?',
  'E-208':'Could a VPN explain it? Do you actually know?',
  'E-210':'The login looks normal — but is the person meant to be working at all?',
  'E-201':'Compare it with the “normal for this user” column.', 'E-205':'Is two typos the day after a password change unusual?',
};
function requestReview() {
  sim.reviews++;
  const issues = EVENTS.map(e => ({e, j:judge(e, sim.labels[e.id])})).filter(x => x.j);
  sim.lastReview = issues.map(x => ({id:x.e.id, sev:x.j.sev}));
  if (sim.reviews >= 2 || issues.length === 0) sim.debrief = true;
  save();
  const serious = issues.filter(x => x.j.sev === 'serious').length, moderate = issues.filter(x => x.j.sev === 'moderate').length;
  const head = issues.length === 0 ? 'Security lead: “Excellent triage. Every call is defensible.”'
    : serious ? `Security lead: “${serious} of your calls could let an attacker through. Take another look before this goes to the detection team.”`
    : `Security lead: “No attacks missed, but ${issues.length} call${issues.length === 1 ? '' : 's'} could be sharper.”`;
  fill('tl-a-feedback',
    el('div', {class:`tl-review ${serious ? 'bad' : issues.length ? 'warn' : 'good'}`}, el('strong', {}, head),
      el('p', {}, `Review ${sim.reviews}: ${serious} serious · ${moderate} moderate · ${issues.length - serious - moderate} minor.`)),
    issues.map(({e, j}) => el('button', {type:'button', class:`tl-issue tl-issue-${j.sev}`, onclick:() => openEvent(e.id)},
      el('span', {class:'tl-mono'}, e.id), el('span', {}, el('b', {}, j.sev.toUpperCase() + ' · '), j.what, el('em', {}, ' Ask yourselves: ' + NUDGE[e.id])))),
    sim.debrief ? el('p', {class:'ol-muted'}, 'The full debrief is now unlocked — open any event to read the reasoning.') : el('p', {class:'ol-muted'}, 'Reconsider the flagged events, then request a second review. The debrief unlocks after review 2.'));
  renderEventTable(); renderFindings(); refreshCheckpoints();
  if (sim.selected) openEvent(sim.selected);
}
function renderSignalNotebook() {
  fill('tl-signals', SIGNALS.map(s => el('label', {class:'tl-signal'},
    el('input', {type:'checkbox', checked: sim.signalsUseful.has(s.id), onchange:ev => { ev.target.checked ? sim.signalsUseful.add(s.id) : sim.signalsUseful.delete(s.id); save(); renderFindings(); }}),
    el('span', {}, el('b', {}, s.icon + ' '), s.name))));
}
function renderFindings() {
  const box = $('tl-findings');
  if (!sim.reviews) { fill(box, el('p', {class:'ol-muted'}, 'Your findings summary and handoff code appear after your first review.')); return; }
  const by = k => EVENTS.filter(e => sim.labels[e.id] === k).map(e => e.id);
  const code = encodeCode(CODES.analyst.type, labelsToInt(sim.labels), CODES.analyst.chars);
  const useful = [...sim.signalsUseful].map(signalName);
  fill(box,
    el('div', {class:'ol-handoff'},
      el('h4', {}, 'Read this to Workstation B (Detection Engineer)'),
      el('p', {}, el('b', {}, 'Suspicious: '), by('suspicious').join(', ') || 'none'),
      el('p', {}, el('b', {}, 'Needs verification: '), by('review').join(', ') || 'none'),
      el('p', {}, el('b', {}, 'Normal: '), `${by('normal').length} events`),
      el('p', {}, el('b', {}, 'Signals we found useful: '), useful.join(', ') || 'none ticked yet — use the signal notebook'),
      el('p', {}, el('b', {}, 'Watch out for: '), 'travel with HR approval, night work with a change ticket, and attacks that never produce failed passwords.'),
      codeDisplay(code, 'ANALYST HANDOFF CODE — B types this into “Analyst cases”'),
      el('p', {class:'ol-muted'}, 'The code holds your 10 classifications. It stays on these two computers; nothing is sent to the server.')));
}

/* ======================================================================
 * B — Detection engineering console
 * ==================================================================== */
function weightControl(id) {
  const value = sim.config.w[id];
  return el('div', {class:'tl-weight', role:'group', 'aria-label':`Weight for ${signalName(id)}`},
    ['Off', '+1', '+2', '+3'].map((lab, i) => el('button', {type:'button', class:'tl-wbtn', 'aria-pressed': String(value === i),
      onclick:() => { sim.config.w[id] = i; configChanged(); }}, lab)));
}
function renderRules() {
  const c = sim.config;
  fill('tl-rules',
    el('div', {class:'tl-rule'},
      el('div', {class:'tl-rule-name'}, el('b', {}, '⨯ Repeated failed passwords'), el('small', {}, 'Counts as a signal when failures for one account reach the threshold.')),
      el('label', {class:'tl-slider'}, el('span', {}, 'Threshold: ', el('output', {id:'tl-th-out'}, `${c.th}+ failures`)),
        el('input', {type:'range', min:1, max:15, value:c.th, 'aria-label':'Failed password threshold', oninput:ev => { c.th = Number(ev.target.value); text('tl-th-out', `${c.th}+ failures`); configChanged(false); }})),
      weightControl('fails')),
    SIGNALS.filter(s => s.id !== 'fails').map(s => el('div', {class:'tl-rule'},
      el('div', {class:'tl-rule-name'}, el('b', {}, `${s.icon} ${s.name}`)), weightControl(s.id))),
    el('div', {class:'tl-rule tl-rule-alert'},
      el('div', {class:'tl-rule-name'}, el('b', {}, 'Raise an alert when the risk score reaches'), el('small', {}, 'Add up the weights of every signal present. At or above this number → alert.')),
      el('label', {class:'tl-slider'}, el('span', {}, 'Alert at score ≥ ', el('output', {id:'tl-al-out'}, String(c.alert))),
        el('input', {type:'range', min:1, max:8, value:c.alert, 'aria-label':'Alert threshold', oninput:ev => { c.alert = Number(ev.target.value); text('tl-al-out', String(c.alert)); configChanged(false); }}))),
    el('label', {class:'tl-rule tl-ctx'}, el('input', {type:'checkbox', checked:c.ctx, onchange:ev => { c.ctx = ev.target.checked; configChanged(); }}),
      el('span', {}, el('b', {}, 'Use business context'), el('small', {}, 'Ignore country/travel signals when HR has approved travel, and night-time when IT has a change ticket.'))));
}
function configChanged(rerender = true) {
  save();
  if (rerender) renderRules();
  const stale = $('tl-eval-stale'); if (stale) stale.hidden = !sim.runs.length;
  renderAnalystCases();
}
let running = false;
async function runEvaluation() {
  if (running) return;
  running = true; $('tl-run').disabled = true;
  const result = evaluate(sim.config, sim.includeBonus);
  const tbody = $('tl-results'); tbody.replaceChildren();
  $('tl-eval-stale').hidden = true;
  text('tl-run-status', `Evaluating ${result.rows.length} labelled logins…`);
  for (const r of result.rows) {
    tbody.append(resultRow(r));
    await wait(55);
  }
  sim.runs.unshift({n:(sim.runs[0]?.n || 0) + 1, cfg:structuredClone(sim.config), m:result.m, q:result.quality, meets:result.meets, bonus:result.includeBonus});
  sim.runs = sim.runs.slice(0, 8);
  if (result.meets && !result.includeBonus) sim.bestMet = true;
  if (result.meets && result.includeBonus) sim.bonusMet = true;
  save();
  renderMetrics(result); renderHistory(); renderRelease(); refreshCheckpoints();
  text('tl-run-status', `Run ${sim.runs[0].n} complete.`);
  running = false; $('tl-run').disabled = false;
}
function resultRow(r) {
  const label = {TP:'Caught', FN:'MISSED', FP:'FALSE ALARM', TN:'Correctly allowed'}[r.outcome];
  return el('tr', {class:`tl-out-${r.outcome}`},
    el('td', {class:'tl-mono'}, r.e.id), el('td', {}, r.e.name),
    el('td', {}, r.parts.length ? r.parts.map(p => el('span', {class:`ol-chip ${p.w ? '' : 'good'}`}, `${signalName(p.id)} ${p.w ? '+' + p.w : '0'}`)) : el('span', {class:'tl-dim'}, 'no signals')),
    el('td', {class:'tl-mono'}, `${r.score} / ${sim.config.alert}`),
    el('td', {}, r.e.attack ? 'Attack' : 'Legitimate'),
    el('td', {}, el('b', {class:'tl-outcome'}, label)));
}
function renderMetrics(result) {
  const {m, req} = result;
  fill('tl-metrics',
    el('div', {class:'tl-matrix', role:'table', 'aria-label':'Confusion matrix'},
      el('div', {class:'tl-mx-h'}, ''), el('div', {class:'tl-mx-h'}, 'Detector: ALERT'), el('div', {class:'tl-mx-h'}, 'Detector: ALLOW'),
      el('div', {class:'tl-mx-h tl-mx-side'}, 'Real attack'), el('div', {class:'tl-mx tp'}, el('b', {}, m.TP), el('small', {}, 'correct detections')), el('div', {class:'tl-mx fn'}, el('b', {}, m.FN), el('small', {}, 'false negatives (missed)')),
      el('div', {class:'tl-mx-h tl-mx-side'}, 'Legitimate staff'), el('div', {class:'tl-mx fp'}, el('b', {}, m.FP), el('small', {}, 'false positives (false alarms)')), el('div', {class:'tl-mx tn'}, el('b', {}, m.TN), el('small', {}, 'correctly allowed'))),
    el('div', {class:'tl-reqs'},
      el('span', {class:'ol-kicker'}, 'OPERATIONAL REQUIREMENTS · ' + (result.includeBonus ? 'WITH NEW INCIDENTS' : 'STANDARD SUITE')),
      el('p', {class: m.TP >= req.caught ? 'ok' : 'no'}, `${m.TP >= req.caught ? '✓' : '✗'} Catch at least ${req.caught} of ${req.of} attacks — caught ${m.TP}`),
      el('p', {class: m.FP <= req.maxFalse ? 'ok' : 'no'}, `${m.FP <= req.maxFalse ? '✓' : '✗'} No more than ${req.maxFalse} false alarm on legitimate staff — ${m.FP}`),
      el('p', {}, `Evaluation quality (balanced accuracy): `, el('b', {}, result.quality + '%')),
      el('p', {class:`tl-verdict ${result.meets ? 'ok' : 'no'}`}, result.meets ? 'Meets the release requirements. Discuss what it still misses.' : verdictAdvice(result))));
}
function verdictAdvice(r) {
  const tips = [];
  const missed = r.rows.filter(x => x.outcome === 'FN'), noisy = r.rows.filter(x => x.outcome === 'FP');
  if (missed.length) tips.push(`Missed: ${missed.map(x => x.e.id).join(', ')} — which signals do those attacks have, and are they weighted?`);
  if (noisy.length) tips.push(`False alarms: ${noisy.map(x => x.e.id).join(', ')} — what makes them look risky, and is that evidence trustworthy on its own?`);
  return tips.join(' ');
}
function renderHistory() {
  fill('tl-history', sim.runs.length ? sim.runs.map(run => el('tr', {class: run.meets ? 'ok' : ''},
    el('td', {class:'tl-mono'}, '#' + run.n + (run.bonus ? '+' : '')),
    el('td', {class:'tl-mono'}, `${run.cfg.th}+ · ${W_ORDER.map(id => run.cfg.w[id]).join('')} · ≥${run.cfg.alert}${run.cfg.ctx ? ' · ctx' : ''}`),
    el('td', {}, `${run.m.TP}/${run.m.TP + run.m.FN}`), el('td', {}, String(run.m.FP)), el('td', {}, run.q + '%'),
    el('td', {}, run.meets ? '✓' : '—'))) : el('tr', {}, el('td', {colspan:6, class:'tl-dim'}, 'No runs yet. Press “Run evaluation”.')));
}
function renderAnalystCases() {
  const box = $('tl-analyst-cases'); if (!box) return;
  if (!sim.partnerAnalyst) { fill(box, el('p', {class:'ol-muted'}, 'No analyst code loaded yet. Ask Workstation A for their handoff code once they have had a review.')); return; }
  const labels = intToLabels(sim.partnerAnalyst);
  let agree = 0;
  const rows = EVENTS.map(e => {
    const r = riskScore(eventAsCase(e), sim.config); const a = labels[e.id];
    const match = (a === 'normal' && !r.alert) || (a !== 'normal' && r.alert); if (match) agree++;
    return el('tr', {class: match ? '' : 'tl-disagree'}, el('td', {class:'tl-mono'}, e.id), el('td', {}, e.account),
      el('td', {}, el('span', {class:`tl-label tl-label-${a}`}, LABELS[a])), el('td', {}, r.alert ? `ALERT (${r.score})` : `allow (${r.score})`),
      el('td', {}, match ? 'agree' : 'DISCUSS'));
  });
  fill(box, el('p', {}, `Your detector agrees with the analyst on `, el('b', {}, `${agree} of 10`), ' live events. Disagreements are discussion points, not automatically mistakes.'),
    el('table', {class:'tl-table tl-small'}, el('thead', {}, el('tr', {}, ['Event', 'Account', 'Analyst said', 'Your detector', ''].map(h => el('th', {}, h)))), el('tbody', {}, rows)));
}
function renderRelease() {
  const box = $('tl-release');
  if (!sim.bestMet) { fill(box, el('p', {class:'ol-muted'}, 'A release code appears once one of your evaluation runs meets the operational requirements.')); return; }
  const code = encodeCode(CODES.detector.type, configToInt(sim.config), CODES.detector.chars);
  const live = evaluate(sim.config, false);
  fill(box, el('div', {class:'ol-handoff'},
    el('h4', {}, 'Read this to Workstation A (Security Analyst)'),
    el('p', {}, `Current rules: ${live.m.TP}/7 attacks caught, ${live.m.FP} false alarm${live.m.FP === 1 ? '' : 's'} on the test suite${live.meets ? '' : ' — NOTE: your current settings no longer meet requirements'}.`),
    el('p', {}, 'Trade-off we accepted: ' + (verdictAdvice(live) || 'none on the test suite — but the live events may still disagree.')),
    codeDisplay(code, 'DETECTOR RELEASE CODE — A types this into the joint review'),
    el('p', {class:'ol-muted'}, 'The code holds your current rule settings. It changes whenever you change a rule.')));
}

/* ======================================================================
 * Joint release review
 * ==================================================================== */
const CHECKLIST = [
  ['a-explained', 'Workstation A explained which live events look suspicious and which ones were misleading.'],
  ['b-explained', 'Workstation B explained the detector’s trade-off: what it catches, what it misses and its false alarms.'],
  ['disagree', 'We looked at every event where the detector and the analyst disagreed.'],
  ['human', 'We agreed that an alert triggers human verification — it does not automatically ban an employee.'],
];
function renderJoint() {
  const mine = zone.workstation === 'A'
    ? (sim.reviews ? {label:'Your analyst code', code:encodeCode(CODES.analyst.type, labelsToInt(sim.labels), CODES.analyst.chars)} : null)
    : (sim.bestMet ? {label:'Your detector code', code:encodeCode(CODES.detector.type, configToInt(sim.config), CODES.detector.chars)} : null);
  const analyst = zone.workstation === 'A' ? (sim.reviews ? labelsToInt(sim.labels) : null) : sim.partnerAnalyst;
  const detector = zone.workstation === 'B' ? (sim.bestMet ? configToInt(sim.config) : null) : sim.partnerDetector;
  const wantType = zone.workstation === 'A' ? CODES.detector : CODES.analyst;
  fill('tl-joint-codes',
    el('div', {class:'ol-grid2'},
      el('div', {class:'ol-panel'}, el('span', {class:'ol-kicker'}, 'THIS COMPUTER'),
        mine ? codeDisplay(mine.code, mine.label.toUpperCase()) : el('p', {class:'ol-muted'}, zone.workstation === 'A' ? 'Finish an analyst review to get your code.' : 'Get an evaluation run that meets requirements to get your code.')),
      el('div', {class:'ol-panel'}, el('span', {class:'ol-kicker'}, 'YOUR PARTNER'),
        codeInput({...wantType, label:`Type the ${wantType.label} code your partner reads out`, otherTypes:OTHER,
          onAccept:value => { if (zone.workstation === 'A') sim.partnerDetector = value; else sim.partnerAnalyst = value; save(); renderJoint(); renderAnalystCases(); }}),
        (zone.workstation === 'A' ? sim.partnerDetector : sim.partnerAnalyst) !== null ? el('p', {class:'ol-chip good'}, 'Partner code loaded') : null)));
  const combined = $('tl-joint-combined');
  if (analyst === null || detector === null) {
    fill(combined, el('p', {class:'ol-muted'}, 'Swap codes to see the combined view: your detector’s decisions on the analyst’s live events.'));
  } else {
    const labels = intToLabels(analyst), cfg = intToConfig(detector), suite = evaluate(cfg, false);
    let missedSusp = [], falseOnNormal = [];
    const rows = EVENTS.map(e => {
      const r = riskScore(eventAsCase(e), cfg), a = labels[e.id];
      if (a === 'suspicious' && !r.alert) missedSusp.push(e.id);
      if (a === 'normal' && r.alert) falseOnNormal.push(e.id);
      return el('tr', {class:(a === 'normal') === !r.alert ? '' : 'tl-disagree'}, el('td', {class:'tl-mono'}, e.id), el('td', {}, e.account),
        el('td', {}, el('span', {class:`tl-label tl-label-${a}`}, LABELS[a])), el('td', {}, r.alert ? `ALERT (${r.score})` : `allow (${r.score})`));
    });
    fill(combined,
      el('div', {class:'tl-combined-sum'},
        el('div', {}, el('small', {}, 'TEST SUITE'), el('strong', {}, `${suite.m.TP}/7 caught · ${suite.m.FP} false`), el('span', {}, suite.meets ? 'meets requirements' : 'does NOT meet requirements')),
        el('div', {}, el('small', {}, 'ANALYST “SUSPICIOUS” NOT ALERTED'), el('strong', {}, missedSusp.join(', ') || 'none')),
        el('div', {}, el('small', {}, 'ANALYST “NORMAL” BUT ALERTED'), el('strong', {}, falseOnNormal.join(', ') || 'none'))),
      el('table', {class:'tl-table tl-small'}, el('thead', {}, el('tr', {}, ['Event', 'Account', 'Analyst', 'Detector'].map(h => el('th', {}, h)))), el('tbody', {}, rows)));
  }
  fill('tl-checklist', CHECKLIST.map(([id, label]) => el('label', {class:'tl-signal'},
    el('input', {type:'checkbox', checked:sim.checklist.has(id), onchange:ev => { ev.target.checked ? sim.checklist.add(id) : sim.checklist.delete(id); save(); renderReleaseDecision(); refreshCheckpoints(); }}), el('span', {}, label))));
  renderReleaseDecision();
}
function renderReleaseDecision() {
  const ready = sim.checklist.size === CHECKLIST.length;
  const detector = zone.workstation === 'B' ? (sim.bestMet ? configToInt(sim.config) : null) : sim.partnerDetector;
  const suite = detector !== null ? evaluate(intToConfig(detector), false) : null;
  const consequences = {
    release: suite?.meets ? 'Released. Alerts now go to the security team for verification. Expect a small number of false alarms — the team knows which ones and why.'
      : suite ? 'Released without meeting requirements. Within an hour the security team is flooded with alerts or misses an attack. Go back and tune it — that is what testing is for.'
      : 'You are releasing without having seen the evaluation results. Swap codes first so both of you know what you are approving.',
    hold: 'Held for more tuning. Safe, but the company stays unprotected while you wait. Holding is right if requirements are not met — otherwise you need a reason.',
  };
  fill('tl-decision',
    el('div', {class:'tl-classify'},
      el('button', {type:'button', class:'ol-btn', 'aria-pressed':String(sim.release === 'release'), disabled:!ready, onclick:() => { sim.release = 'release'; save(); renderReleaseDecision(); }}, 'Approve release'),
      el('button', {type:'button', class:'ol-btn', 'aria-pressed':String(sim.release === 'hold'), disabled:!ready, onclick:() => { sim.release = 'hold'; save(); renderReleaseDecision(); }}, 'Hold for more tuning')),
    !ready ? el('p', {class:'ol-muted'}, 'Tick every review point together before deciding.') : null,
    sim.release ? el('p', {class:`tl-review ${sim.release === 'release' && suite?.meets ? 'good' : 'warn'}`}, consequences[sim.release]) : null);
}

/* ======================================================================
 * Bonus — new incidents
 * ==================================================================== */
function renderBonus() {
  fill('tl-bonus-cases', BONUS_CASES.map(c => el('article', {class:'tl-bonus-card'},
    el('span', {class:'ol-kicker'}, c.attack ? 'NEW INCIDENT · CONFIRMED ATTACK' : 'NEW INCIDENT · LEGITIMATE'),
    el('h3', {}, c.name.replace('NEW: ', '')), el('p', {}, c.story),
    el('p', {}, 'Signals: ', Object.keys(c).filter(k => ['geo', 'device', 'hour', 'travel', 'mfa', 'spray'].includes(k)).map(k => el('span', {class:'ol-chip'}, signalName(k))), c.f ? el('span', {class:'ol-chip'}, `${c.f} fails`) : null, c.approved ? el('span', {class:'ol-chip good'}, 'approved travel') : null))));
  const r = evaluate(sim.config, true);
  fill('tl-bonus-status', el('p', {}, 'With your current rules: ', el('b', {}, `${r.m.TP}/8 attacks caught, ${r.m.FP} false alarm${r.m.FP === 1 ? '' : 's'}`), r.meets ? ' — meets the extended requirements.' : ' — does not meet the extended requirements yet (≥7 of 8, ≤1 false alarm).'),
    sim.bonusMet ? el('p', {class:'ol-chip good'}, '✓ An extended evaluation run met requirements') : null);
}

/* ======================================================================
 * Checkpoints and boot
 * ==================================================================== */
const checks = {};
function refreshCheckpoints() { Object.values(checks).forEach(c => c.update()); }
function buildCheckpoints() {
  checks.a = checkpoint('tl-check-a', zone, 'a', {
    intro:'Report your conclusions to Mission Control. Use what you learned from the events, not guesses.',
    lockReason:() => sim.reviews ? null : 'Classify every event and request at least one review from the security lead first.'});
  checks.b = checkpoint('tl-check-b', zone, 'b', {
    intro:'Explain your detector design decisions to Mission Control.',
    lockReason:() => sim.runs.length >= 2 ? null : `Run the evaluation at least twice — change something between runs and compare (${sim.runs.length}/2).`});
  checks.joint = checkpoint('tl-check-joint', zone, 'joint', {
    intro:'Final release authorisation. Both workstations should agree every answer.',
    lockReason:() => !(zone.passed('a') && zone.passed('b')) ? `Waiting for ${[!zone.passed('a') ? 'Workstation A' : null, !zone.passed('b') ? 'Workstation B' : null].filter(Boolean).join(' and ')} to pass their sign-off. Use the time to swap codes.`
      : sim.checklist.size < CHECKLIST.length ? 'Complete the release review checklist together first.' : null});
  checks.bonus = checkpoint('tl-check-bonus', zone, 'bonus', {
    intro:'Optional: explain the trade-off you just faced.',
    lockReason:() => sim.runs.some(r => r.bonus) ? null : 'Run at least one evaluation with the new incidents included.'});
}
function wire() {
  document.querySelectorAll('[data-tab]').forEach(b => b.addEventListener('click', () => selectTab(b.dataset.tab)));
  $('tl-a-review').addEventListener('click', requestReview);
  $('tl-run').addEventListener('click', runEvaluation);
  $('tl-reset-rules').addEventListener('click', () => { sim.config = structuredClone(START_CONFIG); configChanged(); });
  $('tl-include-bonus').addEventListener('change', e => { sim.includeBonus = e.target.checked; save(); $('tl-eval-stale').hidden = !sim.runs.length; });
  $('tl-bonus-open').addEventListener('click', () => { sim.includeBonus = true; $('tl-include-bonus').checked = true; save(); selectTab('b'); $('tl-run').focus(); });
  $('tl-reset-sim').addEventListener('click', () => {
    if (!window.confirm('Clear the simulation on this computer? Official server results are not affected.')) return;
    store.clear(); location.reload();
  });
  $('tl-analyst-entry').append(codeInput({...CODES.analyst, label:'Analyst handoff code from Workstation A', otherTypes:OTHER,
    onAccept:value => { sim.partnerAnalyst = value; save(); renderAnalystCases(); }}));
  hintPanel('tl-hints-a', [
    'Open each event and compare the “This event” column with “Normal for this user”. Read the context notes — they matter.',
    'One unusual signal is rarely proof. Analysts weigh several signals together and look for context (travel approval, change tickets) that explains them.',
    'Three events have no innocent explanation. Two have conflicting evidence where the honest answer is “check with the person first”.']);
  hintPanel('tl-hints-b', [
    'Look at the MISSED rows. Which signals do those attacks have? Are those signals switched on?',
    'False positives annoy and block real staff; false negatives let attackers in. Every rule is a trade-off between them.',
    'Lower the failed-password threshold, give MFA spam and spraying their own weight, and try the business-context option. Then change one thing at a time and re-run.']);
}
function renderAll() { renderEventTable(); renderTimeline(); renderSignalNotebook(); renderFindings(); renderRules(); renderHistory(); renderAnalystCases(); renderRelease(); if (sim.selected) openEvent(sim.selected); }

async function boot() {
  wire();
  bindConnectionErrors(banner);
  document.addEventListener('ol:key', () => { toast('AI DEFENCE ACTIVATED — recovery key saved for your group.', 'success', 'Recovery key earned'); banner('AI DEFENCE ACTIVATED. The server has saved this recovery key for your group.', 'good'); });
  try {
    await zone.start();
  } catch (error) {
    banner(describeError(error), 'bad');
    notLoggedIn($('tl-main'), error.status === 401 ? 'This computer is not signed in to a group. Sign in at the Mission Hub, then come back to Train It.' : describeError(error));
    return;
  }
  store.bind({group:zone.state.group, workingUnit:zone.state.workingUnit, workstation:zone.workstation});
  restore();
  $('tl-include-bonus').checked = sim.includeBonus;
  renderAll();
  if (sim.lastReview && sim.reviews) { /* keep feedback visible after refresh */ requestReviewSummaryOnly(); }
  buildCheckpoints();
  zone.on(state => { renderStatus(state); refreshCheckpoints(); });
  selectTab(zone.workstation === 'B' ? 'b' : 'a');
  banner(`${zone.state.groupName}, Unit ${zone.state.workingUnit}: you are Workstation ${zone.workstation} — the ${zone.workstation === 'A' ? 'Security Data Analyst' : 'Detection Engineer'}. Detector rules were switched off overnight after too many false alarms. ${STORY.people.security.split(' ·')[0]} needs them back today.`, 'info');
}
function requestReviewSummaryOnly() {
  const flagged = (sim.lastReview || []).length;
  fill('tl-a-feedback', el('p', {class:'ol-muted'}, `Last review (${sim.reviews}): ${flagged} event${flagged === 1 ? '' : 's'} flagged. Request another review after changes.`));
}
boot();
