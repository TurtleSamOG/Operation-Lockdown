/** FINAL RECOVERY MISSION (Operation Lockdown 2.0)
 * Stage 1 keys (server) → 2 crisis review (server scores) → 3 restoration plan (local simulation)
 * → 4 final authorisation (existing server-validated finale questions) → 5 SYSTEM RESTORED (server result only).
 * The server enforces the three-key prerequisite; this page only mirrors it.
 */
import {getSession, getTeamState, getFinaleQuestions, submitFinale} from './api.js';
import {STORY, $, el, fill, text, wait, toast, localStore, describeError} from './mission-core.js';

const KEYS = ['train', 'fix', 'defend'].map(zone => ({...STORY.keys[zone], label:STORY.keys[zone].zone, zone}));
const store = localStore('finale');
const model = {state:null, questions:[], answers:{}, busy:false, polling:false, plan:{order:[], checks:{}}, lastResult:null};

/* ---------- Restoration plan (local simulation, deterministic) ---------- */
const STEPS = {
  safe:'Confirm the building is safe and power is stable',
  network:'Bring up the network core and door control',
  detector:'Switch the login detector back on (alerts go to analysts)',
  portal:'Reopen the staff portal using the retested build',
  data:'Restore files and orders from the tested backup',
  monitor:'Monitor closely and hold the incident review',
};
const ORDER = ['safe', 'network', 'detector', 'portal', 'data', 'monitor'];
const WHY = {
  safe:'Nothing restarts until people are safe and power won’t drop again.',
  network:'Everything else depends on the network — and door control keeps intruders out.',
  detector:'Turn monitoring on before reopening services, so any attacker who returns is seen.',
  portal:'Staff access comes back once monitoring is watching it.',
  data:'Restore data after the systems that protect it are back.',
  monitor:'The review comes last — but it must happen.',
};
const SYSTEMS = {
  detector:{name:'AI login detector', zone:'train', options:{
    tested:'Its test results meet the catch-rate and false-alarm limits', all:'It flags every login from abroad', none:'No check — it worked yesterday'}, right:'tested'},
  portal:{name:'Staff portal', zone:'fix', options:{
    colour:'The login page looks right', both:'A guest is blocked AND a permitted employee still gets in', speed:'Pages load quickly'}, right:'both'},
  office:{name:'Office operations', zone:'defend', options:{
    restore:'A test restore of the backup has worked, and the incident log is complete', lights:'The lights are back on', backup:'The newest backup exists'}, right:'restore'},
};
const PHASES = {
  network:{title:'Threat detection', system:'detector', icon:'◎'},
  portal:{title:'Employee access', system:'portal', icon:'⌘'},
  response:{title:'Office continuity', system:'office', icon:'⬡'},
};
function planComplete() { return model.plan.order.join() === ORDER.join() && Object.entries(SYSTEMS).every(([k, s]) => model.plan.checks[k] === s.right); }

/* ---------- Rendering ---------- */
function notice(message, kind = 'info') { const n = $('fn-banner'); n.textContent = message; n.dataset.kind = kind; }
function keyCount() { return KEYS.filter(k => model.state?.keys?.includes(k.code)).length; }
function renderKeys() {
  const s = model.state;
  fill('fn-keys', KEYS.map(k => { const have = Boolean(s?.keys?.includes(k.code));
    return el('article', {class:`fn-key ${have ? 'is-on' : ''}`}, el('span', {class:'ol-kicker'}, k.zone.toUpperCase()), el('div', {class:'fn-key-glyph', 'aria-hidden':'true'}, have ? '✓' : '◇'),
      el('strong', {}, k.name), el('small', {}, have ? 'Server verified' : 'Missing — complete ' + k.label)); }));
  text('fn-keycount', `${keyCount()} / 3 verified`);
  text('fn-group', s?.groupName || '—'); text('fn-unit', s ? `Unit ${s.workingUnit ?? '—'} · Workstation ${s.workstation || '—'}` : 'Sign in at the Mission Hub');
  text('fn-zones', `${Number(s?.totalScore) || 0} / 300`);
  text('fn-final', s?.finale?.attempts ? `${s.finale.bestScore} / 100` : '— / 100');
  text('fn-final-sub', s?.finale?.completed ? 'Restoration complete' : `${s?.finale?.attempts || 0} submission(s) recorded`);
}
function renderBriefing() {
  const s = model.state;
  const line = k => {
    const z = s.zones?.[k.zone] || {}, score = s.scores?.[k.zone] || 0;
    const tone = score >= 90 ? 'Strong result' : score >= 67 ? 'Solid result' : 'Recovered, with gaps';
    const msg = {train:'The login detector is tuned and validated. Some legitimate staff may still trigger alerts — analysts must verify, not ban.',
      fix:'The portal patch passed its retest. Access checks protect HR data without locking out staff.',
      defend:'The office survived the outage. The fake engineer was dealt with and the infected PC contained.'}[k.zone];
    return el('div', {class:'fn-brief'}, el('span', {class:'ol-kicker'}, `${k.zone} · ${score}/100 · ${z.completed || 0}/${z.total || 3} sign-offs`), el('strong', {}, `${tone}: ${k.name}`), el('p', {}, msg));
  };
  fill('fn-briefing', el('p', {class:'fn-ceo'}, el('b', {}, STORY.people.ceo + ': '), `“${s.groupName}, your work today gave us all three recovery keys. Before I switch anything back on, I need a restoration plan I can trust.”`), KEYS.map(line));
}
function renderPlan() {
  const p = model.plan;
  fill('fn-steps-pick', Object.entries(STEPS).map(([k, l]) => el('button', {type:'button', class:'ol-btn fn-pick', disabled:p.order.includes(k) || model.busy, onclick:() => { p.order.push(k); savePlan(); renderPlan(); }}, l)));
  fill('fn-steps', p.order.length ? p.order.map((k, i) => el('li', {class:ORDER[i] === k ? 'ok' : p.order.length === ORDER.length ? 'bad' : ''}, el('b', {}, i + 1), STEPS[k])) : el('li', {class:'ol-muted'}, 'Click the steps in the order you want to run them.'));
  const fb = $('fn-order-fb');
  if (p.order.length === ORDER.length) {
    const wrong = p.order.findIndex((k, i) => k !== ORDER[i]);
    fb.dataset.kind = wrong < 0 ? 'good' : 'warn';
    fb.textContent = wrong < 0 ? 'Sequence approved: every step only runs once the things it depends on are ready.' : `Step ${wrong + 1} would fail. ${WHY[ORDER[wrong]]} Reset and try again.`;
  } else { fb.textContent = ''; fb.removeAttribute('data-kind'); }
  fill('fn-checks', Object.entries(SYSTEMS).map(([k, sys]) => el('label', {class:'fn-check'}, el('span', {}, el('b', {}, sys.name), ' — what proves it is safe?'),
    el('select', {onchange:e => { p.checks[k] = e.target.value; savePlan(); renderPlan(); }, disabled:model.busy},
      el('option', {value:''}, '— choose a verification check —'), Object.entries(sys.options).map(([v, l]) => el('option', {value:v, selected:p.checks[k] === v}, l))),
    p.checks[k] ? el('small', {class:p.checks[k] === sys.right ? 'ok' : 'bad'}, p.checks[k] === sys.right ? '✓ That is real evidence.' : '✗ That doesn’t prove it is safe. What did you test in that zone?') : null)));
  const ready = planComplete();
  text('fn-plan-status', ready ? 'Restoration plan approved. Proceed to final authorisation.' : 'Complete the sequence and choose a real verification check for every system.');
  $('fn-plan-status').dataset.kind = ready ? 'good' : 'warn';
  $('fn-stage4').classList.toggle('is-locked', !ready);
  renderAuth();
}
function savePlan() { store.set('plan', model.plan); }
function renderAuth() {
  const ready = planComplete();
  fill('fn-auth', model.questions.map((q, i) => {
    const ph = PHASES[q.id] || {title:`Decision ${i + 1}`, icon:'◇'};
    return el('fieldset', {class:`fn-gate ${model.answers[q.id] ? 'is-set' : ''}`, disabled:!ready || model.busy},
      el('legend', {}, el('span', {class:'fn-gate-icon', 'aria-hidden':'true'}, ph.icon), el('span', {}, el('small', {}, `GATE ${i + 1} · ${ph.title.toUpperCase()}`), q.text)),
      Object.entries(q.options).map(([v, l]) => el('label', {class:'ol-check-opt'},
        el('input', {type:'radio', name:'fn-' + q.id, value:v, checked:model.answers[q.id] === v, onchange:() => { model.answers[q.id] = v; renderAuth(); }}), el('span', {}, l))));
  }));
  const all = model.questions.length > 0 && model.questions.every(q => model.answers[q.id]);
  const agreed = $('fn-agree').checked;
  $('fn-agree').disabled = !ready || !all || model.busy;
  $('fn-submit').disabled = !ready || !all || !agreed || model.busy;
  text('fn-submit-hint', !ready ? 'Approve the restoration plan first.' : !all ? 'Decide every authorisation gate.' : !agreed ? 'Confirm that both workstations agree.' : 'Ready. One submission is recorded for your whole group.');
}
function show(stage) {
  for (const id of ['fn-gate-locked', 'fn-mission', 'fn-outcome']) $(id).hidden = id !== stage;
}
async function playRestore(result) {
  show('fn-outcome');
  const s = model.state;
  text('fn-out-group', s.groupName);
  text('fn-out-score', `${s.finale.bestScore}/100`);
  text('fn-out-zones', `${s.totalScore}/300`);
  fill('fn-out-scores', KEYS.map(k => el('div', {}, el('small', {}, k.name.toUpperCase()), el('strong', {}, `${s.scores?.[k.zone] ?? 0}/100`))));
  text('fn-out-note', result && result.scored === false ? 'This was a practice submission; your recorded best finale score is unchanged.' : 'Result recorded by the server. It now appears on the live leaderboard.');
  const systems = [...document.querySelectorAll('.fn-sys')];
  systems.forEach(n => n.classList.remove('is-on'));
  document.body.classList.remove('fn-restored');
  for (const n of systems) { await wait(450); n.classList.add('is-on'); n.querySelector('b').textContent = 'ONLINE'; }
  await wait(300);
  document.body.classList.add('fn-restored');
  $('fn-outcome').scrollIntoView({behavior:'smooth', block:'start'});
}

/* ---------- Server interaction ---------- */
async function refresh({quiet = false} = {}) {
  if (model.polling || model.busy) return;
  model.polling = true;
  try {
    model.state = await getTeamState();
    renderKeys();
    if (model.state.finale?.completed) { if ($('fn-outcome').hidden) await playRestore(null); return; }
    if (!model.state.finaleReady) {
      show('fn-gate-locked');
      const missing = KEYS.filter(k => !model.state.keys?.includes(k.code));
      text('fn-locked-text', `${missing.length} key${missing.length === 1 ? '' : 's'} missing: ${missing.map(k => `${k.name} (${k.label})`).join(', ')}. Zones can be completed in any order. This console checks again automatically.`);
      if (!quiet) notice(`Restoration protocol sealed — ${keyCount()} of 3 keys verified by the server.`, 'warn');
      return;
    }
    if (!model.questions.length) {
      const packet = await getFinaleQuestions();
      if (!packet.ready) return;
      model.questions = packet.questions || [];
      show('fn-mission'); renderBriefing(); renderPlan();
      notice('All three recovery keys verified. Restoration console unlocked.', 'good');
    }
  } catch (error) {
    if (!quiet) {
      show('fn-gate-locked');
      text('fn-locked-text', error.status === 401 ? 'This computer is not signed in. Sign in at the Mission Hub, then return here.' : describeError(error));
      notice(describeError(error), 'bad');
    }
  } finally { model.polling = false; }
}
async function submit() {
  if (model.busy) return;
  model.busy = true; renderPlan();
  $('fn-submit').textContent = 'AUTHORISING…';
  try {
    let result;
    try { result = await submitFinale({...model.answers}); }
    catch (e) { if (e.status !== 419) throw e; await getSession(); result = await submitFinale({...model.answers}); }
    model.lastResult = result;
    model.state = await getTeamState(); renderKeys();
    if (result.completed || model.state.finale?.completed) {
      toast('All restoration gates passed. Northstar Systems is back online.', 'success', 'SYSTEM RESTORED');
      notice('SYSTEM RESTORED — confirmed by the server.', 'good');
      model.busy = false;
      await playRestore(result);
      return;
    }
    const remaining = Math.max(0, 3 - (model.state.finale?.attempts || 0));
    fill('fn-fail', el('strong', {}, `Restoration halted: ${result.correct} of ${result.total} authorisation gates accepted.`),
      el('p', {}, 'At least one decision would put the company at risk again. Look at each gate and ask: does this verify before acting, test both sides, and leave a record? Discuss it as a team, then try again.'),
      el('p', {class:'ol-muted'}, remaining ? `${remaining} scored submission${remaining === 1 ? '' : 's'} left; after that, attempts still count for completion.` : 'Further submissions still count for completion but not for extra score.'));
    $('fn-fail').hidden = false;
    $('fn-agree').checked = false;
    notice('Restoration not authorised. Review the gates and resubmit.', 'warn');
  } catch (error) {
    notice('Submission failed: ' + describeError(error), 'bad');
    toast(describeError(error), 'error', 'Not submitted');
  } finally {
    model.busy = false;
    $('fn-submit').textContent = '⏻ AUTHORISE RESTORATION';
    if (!$('fn-mission').hidden) renderPlan();
  }
}
function wire() {
  $('fn-reset-order').addEventListener('click', () => { model.plan.order = []; savePlan(); renderPlan(); });
  $('fn-agree').addEventListener('change', renderAuth);
  $('fn-submit').addEventListener('click', submit);
  $('fn-refresh').addEventListener('click', () => refresh());
  $('fn-replay').addEventListener('click', () => playRestore(null));
  setInterval(() => { if (!document.hidden) refresh({quiet:true}); }, 8000);
}
(async () => {
  wire();
  try {
    await getSession();
    const s = await getTeamState().catch(() => null);
    if (s) { store.bind({group:s.group, workingUnit:s.workingUnit, workstation:s.workstation}); model.plan = store.get('plan', model.plan); }
  } catch (error) { notice(describeError(error), 'bad'); }
  await refresh();
})();
