/** FIX IT — Employee Portal Recovery (Operation Lockdown 2.0)
 * A controlled simulation: the "Northstar Hub" portal below is a JavaScript model, not a real web app.
 * Nothing here is exploitable, no code is executed, and all people and data are fictional.
 *
 * Workstation A: Software Tester — explores the portal as different users, discovers defects, files bug reports.
 * Workstation B: Software Developer — patches restricted code snippets and runs a deterministic test suite.
 * Joint: A loads B's build into the portal and retests it live.
 * Official progress = server sign-offs (fix-investigate, fix-patch, fix-joint, fix-bonus).
 */
import {STORY, $, el, fill, text, wait, toast, localStore, encodeCode, codeInput, codeDisplay, packBits, unpackBits,
  hintPanel, createZone, checkpoint, describeError, notLoggedIn, bindConnectionErrors} from './mission-core.js';

const zone = createZone({zone:'fix', tasks:{a:'fix-investigate', b:'fix-patch', joint:'fix-joint', bonus:'fix-bonus'}});
const store = localStore('fix');
const CODES = {bugs:{type:'FB', label:'bug report', chars:3}, build:{type:'FX', label:'build', chars:3}};
const OTHER = Object.values(CODES);

/* ======================================================================
 * Portal model
 * ==================================================================== */
const STAFF = {
  101:{name:'Ria Chen', team:'People & HR', ext:'2101', role:'hr-admin', hr:{address:'14 Harbour Row, Bristol', emergency:'Tom Chen (partner)', notes:'Leads the HR systems project.', band:'Band 7'}},
  102:{name:'Jordan Carter', team:'Customer Support', ext:'2204', role:'employee', hr:{address:'3 Elm Close, Keynsham', emergency:'A. Carter (parent)', notes:'Flexible-working request approved.', band:'Band 3'}},
  103:{name:'Priya Shah', team:'Security', ext:'2311', role:'employee', hr:{address:'88 Quay Street, Bristol', emergency:'R. Shah (sibling)', notes:'Return-to-work meeting booked.', band:'Band 8'}},
  104:{name:'Sam Lee', team:'Warehouse Operations', ext:'2450', role:'employee', hr:{address:'21 Mill Lane, Avonmouth', emergency:'K. Lee (parent)', notes:'Forklift licence renewal due.', band:'Band 2'}},
};
const USERS = {
  guest:{key:'guest', label:'Guest (not signed in)', isLoggedIn:false, id:null, role:'guest'},
  employee:{key:'employee', label:'Sam Lee · Employee', isLoggedIn:true, id:104, role:'employee'},
  admin:{key:'admin', label:'Ria Chen · HR Admin', isLoggedIn:true, id:101, role:'hr-admin'},
};
const LIVE_BUILD = {access:0, validate:0, errors:0, enumerate:0, cache:0};

const PATCHES = {
  access:{file:'routes/profile.js', label:'Who may see the private HR section?', options:[
    'return true;  // TODO: add a check before go-live',
    'return user.isLoggedIn;',
    "return user.role === 'hr-admin';",
    "return user.isLoggedIn && (user.id === profile.id || user.role === 'hr-admin');",
    'return false;',
  ]},
  validate:{file:'forms/contact.js', label:'How is the phone number checked?', options:[
    '// no validation',
    "if (phone === '') return reject('Phone is required');",
    "if (!/^[0-9]+$/.test(phone)) return reject('Use digits only');",
    "if (!/^\\+?[0-9 ]{7,16}$/.test(phone)) return reject('Enter a phone number using digits, spaces and an optional +');",
  ]},
  errors:{file:'forms/contact.js', label:'What does the user see if saving fails?', options:[
    'res.send(err.stack);',
    "res.send('Saved!');  // hide the problem",
    "log(err); res.send('Sorry, we could not save your details. Reference ' + ref);",
  ]},
  enumerate:{file:'auth/login.js', label:'What does a failed login say?', options:[
    "res.send(user ? 'Wrong password for ' + username : 'No account called ' + username);",
    "res.send('Username or password is incorrect.');",
  ]},
  cache:{file:'routes/profile.js', label:'Permission caching (hotfix #025)', options:[
    '// no caching — check every request',
    'if (cachedDecision !== null) return cachedDecision;  // one answer reused for everyone',
    'const key = user.id + ":" + profile.id;  if (cache.has(key)) return cache.get(key);',
  ]},
};

/** One portal instance. build = patch choices; tools.failSave simulates a database outage. */
function makePortal(build) {
  const memo = {global:null, map:new Map()};
  function canSeeHR(user, profileId) {
    const rule = () => [true, user.isLoggedIn, user.role === 'hr-admin', user.isLoggedIn && (user.id === profileId || user.role === 'hr-admin'), false][build.access];
    if (build.cache === 1) { if (memo.global === null) memo.global = rule(); return memo.global; }
    if (build.cache === 2) { const k = `${user.id}:${profileId}`; if (!memo.map.has(k)) memo.map.set(k, rule()); return memo.map.get(k); }
    return rule();
  }
  const realPhone = p => /^\+?[0-9 ]{7,16}$/.test(p);
  function validate(phone) {
    if (build.validate === 0) return null;
    if (build.validate === 1) return phone === '' ? 'Phone is required' : null;
    if (build.validate === 2) return /^[0-9]+$/.test(phone) ? null : 'Use digits only';
    return realPhone(phone) ? null : 'Enter a phone number using digits, spaces and an optional +';
  }
  function saveContact(user, phone, failSave) {
    if (!user.isLoggedIn) return {kind:'login'};
    const problem = validate(phone);
    if (problem) return {kind:'rejected', message:problem};
    const crash = failSave || !realPhone(phone);
    if (!crash) return {kind:'saved', message:'Your contact details were updated.'};
    const trace = failSave ? 'PDOException: SQLSTATE[HY000] [2002] Connection refused (db-internal-02:3306)\n  at /srv/northstar-hub/app/Repositories/StaffRepository.php:88\n  at /srv/northstar-hub/app/Http/ContactController.php:41'
      : `TypeError: formatPhone(): Argument #1 must be numeric, "${phone.slice(0, 24)}" given\n  at /srv/northstar-hub/app/Support/Phone.php:17\n  at /srv/northstar-hub/app/Http/ContactController.php:39\n  DB_HOST=db-internal-02  APP_DEBUG=true`;
    if (build.errors === 0) return {kind:'trace', message:trace, crashedOnInput:!failSave};
    if (build.errors === 1) return {kind:'fake', message:'Saved!', crashedOnInput:!failSave};
    return {kind:'safe', message:'Sorry, we could not save your details. Reference ERR-4F21.', crashedOnInput:!failSave};
  }
  function login(username, password) {
    const exists = Object.values(STAFF).some(s => s.name.toLowerCase().replace(' ', '.') === username.toLowerCase());
    if (build.enumerate === 0) return exists ? `Wrong password for ${username}` : `No account called ${username}`;
    return 'Username or password is incorrect.';
  }
  return {build, canSeeHR, saveContact, login, validate};
}

/* ======================================================================
 * Local simulation state
 * ==================================================================== */
const sim = {
  user:'guest', path:'/', history:[], observed:[], reports:[], tools:{failSave:false},
  stagingBuild:null, useStaging:false, retest:[],
  build:{...LIVE_BUILD}, runs:[], buildNo:23, partnerBugs:null, hotfix:false, decision:null,
};
let portal = makePortal(LIVE_BUILD);
function activeBuild() { return sim.useStaging && sim.stagingBuild ? sim.stagingBuild : LIVE_BUILD; }
function save() { store.set('sim', sim); }
function restore() { const s = store.get('sim', null); if (s) Object.assign(sim, s); portal = makePortal(activeBuild()); }

/* ---------- observations (things the tester has actually triggered) ---------- */
const OBS = {
  'guest-hr':{text:'A guest (not signed in) can read private HR details on a staff profile', defect:'access', role:'guest'},
  'emp-other-hr':{text:'A signed-in employee can read ANOTHER employee’s private HR details', defect:'access', role:'employee'},
  'trace':{text:'The contact form shows an internal error with file paths and server names', defect:'errors'},
  'no-validation':{text:'The contact form sends obviously invalid phone numbers to the server', defect:'errors'},
  'fake-success':{text:'The contact form says “Saved!” when the save actually failed', defect:'errors'},
  'enum':{text:'The login error reveals whether a username exists', defect:'enumerate'},
  'digits-only':{text:'A real phone number with spaces or + is rejected', defect:'validate-regression'},
};
const RETEST = {
  'guest-blocked':'Guest cannot see HR details', 'emp-own':'Employee can see their own HR details', 'emp-other-blocked':'Employee cannot see another employee’s HR details',
  'admin-ok':'HR admin can see HR details', 'bad-rejected':'Invalid phone rejected with a helpful message', 'good-saved':'Valid phone number saved', 'error-safe':'Save failure shows a safe message',
};
function observe(id) {
  if (sim.useStaging) return; // on the staging build we record retest results instead
  if (!sim.observed.includes(id)) { sim.observed.push(id); feed(`New finding: ${OBS[id].text}`, 'warn'); save(); renderReportForm(); }
}
function retestMark(id, pass) {
  if (!sim.useStaging) return;
  const existing = sim.retest.find(r => r.id === id);
  if (existing) existing.pass = pass; else sim.retest.push({id, pass});
  feed(`Retest: ${RETEST[id]} — ${pass ? 'PASS' : 'FAIL'}`, pass ? 'good' : 'bad'); save(); renderRetest();
}
function feed(message, kind = '') {
  const box = $('fx-feed'); if (!box) return;
  box.prepend(el('div', {class:kind}, el('time', {}, new Date().toLocaleTimeString('en-GB', {hour:'2-digit', minute:'2-digit'})), message));
  while (box.childElementCount > 12) box.lastElementChild.remove();
}

/* ======================================================================
 * Portal rendering (light intranet theme — visually distinct)
 * ==================================================================== */
function step(note) { sim.history.push(`As ${USERS[sim.user].label}: ${note}`); sim.history = sim.history.slice(-8); save(); }
function navigate(path) {
  sim.path = path; step(`opened ${path}`); renderPortal();
}
function renderPortal() {
  const user = USERS[sim.user];
  text('fx-url', 'https://hub.northstar.example' + sim.path);
  $('fx-urlbox').value = sim.path;
  document.querySelectorAll('[data-user]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.user === sim.user)));
  text('fx-build-label', sim.useStaging ? `STAGING BUILD from Workstation B` : 'LIVE BUILD · v2.4.0 (emergency release)');
  $('fx-browser').classList.toggle('is-staging', sim.useStaging);
  const page = $('fx-page');
  const p = sim.path;
  const m = /^\/staff\/(\d+)$/.exec(p);
  const nav = el('nav', {class:'nh-nav'}, [['/', 'Home'], ['/staff', 'Staff directory'], ['/account/contact', 'My contact details'], ['/login', 'Sign in']].map(([href, lab]) =>
    el('a', {href:'#', class:p === href ? 'on' : '', onclick:e => { e.preventDefault(); navigate(href); }}, lab)));
  const head = el('div', {class:'nh-head'}, el('div', {class:'nh-logo'}, el('b', {}, 'N'), el('span', {}, 'Northstar ', el('strong', {}, 'Hub'))),
    el('span', {class:'nh-who'}, user.isLoggedIn ? `Signed in: ${user.label}` : 'Not signed in'));
  let body;
  if (p === '/') body = el('div', {}, el('h2', {}, 'Good morning'), el('div', {class:'nh-notice'}, el('b', {}, 'Emergency release v2.4.0'), ' went live last night to add HR details to staff profiles. Please report anything odd to Engineering.'),
    el('p', {}, 'Use the staff directory to find colleagues, or update your contact details.'));
  else if (p === '/staff') body = el('div', {}, el('h2', {}, 'Staff directory'), el('p', {class:'nh-muted'}, 'Public information about colleagues.'),
    el('ul', {class:'nh-list'}, Object.entries(STAFF).map(([id, s]) => el('li', {}, el('a', {href:'#', onclick:e => { e.preventDefault(); navigate('/staff/' + id); }}, s.name), el('span', {}, `${s.team} · ext. ${s.ext}`)))));
  else if (m && STAFF[m[1]]) body = profilePage(Number(m[1]), user);
  else if (p === '/account/contact') body = contactPage(user);
  else if (p === '/login') body = loginPage();
  else if (p === '/admin') body = el('div', {}, el('h2', {}, '403 · Forbidden'), el('p', {}, user.role === 'hr-admin' ? 'Admin tools are being rebuilt.' : 'You do not have permission to view this page.'));
  else body = el('div', {}, el('h2', {}, '404 · Page not found'), el('p', {}, 'Try /staff or /staff/101 to /staff/104.'));
  fill(page, head, nav, el('div', {class:'nh-body'}, body));
}
function profilePage(id, user) {
  const s = STAFF[id];
  const shows = portal.canSeeHR(user, id);
  const allowed = user.isLoggedIn && (user.id === id || user.role === 'hr-admin');
  if (shows && !allowed) observe(user.isLoggedIn ? 'emp-other-hr' : 'guest-hr');
  if (sim.useStaging) {
    if (!user.isLoggedIn) retestMark('guest-blocked', !shows);
    else if (user.role === 'hr-admin') retestMark('admin-ok', shows);
    else if (user.id === id) retestMark('emp-own', shows);
    else retestMark('emp-other-blocked', !shows);
  }
  return el('div', {}, el('h2', {}, s.name), el('p', {class:'nh-muted'}, `${s.team} · ext. ${s.ext}`),
    shows ? el('section', {class:'nh-private'}, el('h3', {}, '🔒 HR record — confidential'),
      el('dl', {}, el('dt', {}, 'Home address'), el('dd', {}, s.hr.address), el('dt', {}, 'Emergency contact'), el('dd', {}, s.hr.emergency),
        el('dt', {}, 'Pay band'), el('dd', {}, s.hr.band), el('dt', {}, 'HR notes'), el('dd', {}, s.hr.notes)))
      : el('p', {class:'nh-locked'}, user.isLoggedIn ? 'HR details are only visible to this employee and HR.' : 'Sign in to see more.'));
}
function contactPage(user) {
  if (!user.isLoggedIn) return el('div', {}, el('h2', {}, 'My contact details'), el('p', {}, 'Please sign in to update your details.'));
  const input = el('input', {type:'text', id:'nh-phone', value:'+44 117 496 0123', 'aria-label':'Phone number', autocomplete:'off'});
  const out = el('div', {id:'nh-result', role:'status', 'aria-live':'polite'});
  const submit = () => {
    const phone = input.value;
    step(`submitted phone "${phone}"${sim.tools.failSave ? ' (database outage simulated)' : ''}`);
    const r = portal.saveContact(user, phone, sim.tools.failSave);
    if (r.kind === 'saved') fill(out, el('p', {class:'nh-ok'}, '✓ ' + r.message));
    else if (r.kind === 'rejected') fill(out, el('p', {class:'nh-warn'}, r.message));
    else if (r.kind === 'trace') fill(out, el('pre', {class:'nh-trace'}, 'Whoops! Something went wrong.\n\n' + r.message));
    else if (r.kind === 'fake') fill(out, el('p', {class:'nh-ok'}, '✓ ' + r.message));
    else fill(out, el('p', {class:'nh-warn'}, r.message));
    const realPhone = /^\+?[0-9 ]{7,16}$/.test(phone);
    if (r.kind === 'trace') observe('trace');
    if (r.crashedOnInput) observe('no-validation');
    if (r.kind === 'fake' && (sim.tools.failSave || !realPhone)) observe('fake-success');
    if (r.kind === 'rejected' && realPhone) observe('digits-only');
    if (sim.useStaging) {
      if (!realPhone && !sim.tools.failSave) retestMark('bad-rejected', r.kind === 'rejected');
      if (realPhone && !sim.tools.failSave) retestMark('good-saved', r.kind === 'saved');
      if (sim.tools.failSave && realPhone) retestMark('error-safe', r.kind === 'safe');
    }
  };
  return el('div', {}, el('h2', {}, 'My contact details'), el('p', {class:'nh-muted'}, `Signed in as ${user.label}. Update the phone number HR uses to reach you.`),
    el('label', {class:'nh-label', for:'nh-phone'}, 'Mobile phone number'), el('div', {class:'nh-row'}, input, el('button', {type:'button', class:'nh-btn', onclick:submit}, 'Save details')),
    el('p', {class:'nh-muted nh-small'}, 'Testers: try normal input and the kind of thing a careless or malicious user might type.'), out);
}
function loginPage() {
  const u = el('input', {type:'text', 'aria-label':'Username', placeholder:'firstname.lastname', autocomplete:'off'});
  const pw = el('input', {type:'password', 'aria-label':'Password', placeholder:'password', autocomplete:'off'});
  const out = el('p', {class:'nh-warn', role:'status'});
  const tried = new Set(store.get('loginTried', []));
  return el('div', {}, el('h2', {}, 'Sign in'), el('p', {class:'nh-muted nh-small'}, 'In this simulation every password is wrong — watch what the error message tells you.'),
    el('div', {class:'nh-row'}, u, pw, el('button', {type:'button', class:'nh-btn', onclick:() => {
      const name = u.value.trim(); if (!name) return;
      const msg = portal.login(name, pw.value); out.textContent = msg; step(`tried to sign in as "${name}"`);
      tried.add(msg.startsWith('Wrong') ? 'exists' : msg.startsWith('No account') ? 'missing' : 'same'); store.set('loginTried', [...tried]);
      if (tried.has('exists') && tried.has('missing')) observe('enum');
    }}, 'Sign in')), out, el('p', {class:'nh-muted nh-small'}, 'Staff usernames look like ria.chen or sam.lee.'));
}

/* ======================================================================
 * Bug reports (A)
 * ==================================================================== */
const FEATURES = {profiles:'Staff profile pages', contact:'Contact details form', login:'Sign-in page', directory:'Staff directory'};
const EXPECTED = {
  'hr-owner':'Private HR details are visible only to that employee and to HR admins',
  'hr-nobody':'Remove HR details from the portal for everyone',
  'hr-login':'Anyone who is signed in can see HR details',
  'safe-error':'Invalid input is rejected with a helpful message, and failures show a safe message with no internal details',
  'hide-form':'Disable the contact form',
  'same-login':'Wrong username and wrong password give the same message',
  'colour':'Make the error message red so users notice it',
};
const DEFECTS = {
  access:{feature:'profiles', expected:'hr-owner', roles:['guest', 'employee'], sev:['High', 'Critical'], title:'Private HR data exposed on profile pages'},
  errors:{feature:'contact', expected:'safe-error', roles:['employee'], sev:['Medium', 'High'], title:'Contact form leaks internals and accepts invalid input'},
  enumerate:{feature:'login', expected:'same-login', roles:['guest'], sev:['Low', 'Medium'], title:'Login error reveals valid usernames'},
};
function triage(report) {
  const o = OBS[report.observed]; if (!o) return {ok:false, notes:['Pick an observation you actually triggered in the portal.']};
  const d = DEFECTS[o.defect]; if (!d) return {ok:false, notes:['That behaviour is real, but it was caused by a patch, not the live site. Report it to the developer directly.']};
  const notes = [];
  if (report.feature !== d.feature) notes.push(`Engineering lead: “Which part of the portal is this? The observation doesn’t match ‘${FEATURES[report.feature]}’.”`);
  const missing = d.roles.filter(r => !report.roles.includes(r));
  if (missing.length) notes.push(`“Who is affected? Did you check what ${missing.map(r => r === 'guest' ? 'a guest' : r === 'employee' ? 'a signed-in employee' : 'an HR admin').join(' and ')} can see?”`);
  if (o.defect === 'access' && !(sim.observed.includes('guest-hr') && sim.observed.includes('emp-other-hr'))) notes.push('“Reproduce it as both a guest and an employee before we call it confirmed.”');
  if (report.expected !== d.expected) notes.push('“The expected behaviour doesn’t fix the real problem — or it breaks things legitimate users need.”');
  if (!d.sev.includes(report.severity)) notes.push(`“Is ${report.severity} the right severity? Think about who could be harmed, and how badly.”`);
  if ((report.title || '').trim().length < 6) notes.push('“Give it a short, specific title.”');
  return {ok:notes.length === 0, defect:o.defect, notes};
}
function renderReportForm() {
  const form = $('fx-report-form'); if (!form) return;
  const obsSel = $('fx-r-observed');
  const current = obsSel.value;
  fill(obsSel, el('option', {value:''}, sim.observed.length ? '— choose something you saw —' : '— nothing triggered yet: explore the portal —'),
    sim.observed.filter(id => OBS[id].defect !== 'validate-regression').map(id => el('option', {value:id, selected:id === current}, OBS[id].text)));
  text('fx-found', `${sim.observed.filter(id => OBS[id].defect !== 'validate-regression').length} findings`);
  fill('fx-steps', sim.history.length ? sim.history.slice(-5).map(h => el('li', {}, h)) : el('li', {class:'ol-muted'}, 'Your actions in the portal are recorded here automatically.'));
}
function fileReport(e) {
  e.preventDefault();
  const roles = [...document.querySelectorAll('input[name="fx-r-role"]:checked')].map(i => i.value);
  const report = {title:$('fx-r-title').value.trim(), feature:$('fx-r-feature').value, observed:$('fx-r-observed').value, roles,
    expected:$('fx-r-expected').value, severity:$('fx-r-sev').value, steps:sim.history.slice(-5)};
  if (!report.observed) { text('fx-r-msg', 'Choose an observation — trigger the problem in the portal first.'); return; }
  const t = triage(report);
  report.status = t.ok ? 'accepted' : 'needs-info'; report.defect = t.defect; report.notes = t.notes; report.n = sim.reports.length + 1;
  // replace an older report about the same defect
  sim.reports = sim.reports.filter(r => !(r.defect === report.defect && r.status !== 'accepted') || !report.defect);
  sim.reports.push(report); save();
  text('fx-r-msg', t.ok ? `Ticket BUG-${100 + report.n} accepted by triage.` : `Ticket BUG-${100 + report.n} returned: needs more information.`);
  feed(t.ok ? `BUG-${100 + report.n} accepted: ${report.title}` : `BUG-${100 + report.n} needs more info`, t.ok ? 'good' : 'warn');
  renderReports(); refreshCheckpoints();
}
function acceptedDefects() { return new Set(sim.reports.filter(r => r.status === 'accepted').map(r => r.defect)); }
function renderReports() {
  fill('fx-reports', sim.reports.length ? [...sim.reports].reverse().map(r => el('article', {class:`fx-ticket ${r.status}`},
    el('div', {class:'fx-ticket-head'}, el('b', {class:'tl-mono'}, `BUG-${100 + r.n}`), el('span', {class:`ol-chip ${r.status === 'accepted' ? 'good' : 'warn'}`}, r.status === 'accepted' ? 'ACCEPTED' : 'NEEDS INFO'), el('span', {class:'ol-chip'}, r.severity)),
    el('strong', {}, r.title || '(no title)'), el('small', {}, `${FEATURES[r.feature]} · affects: ${r.roles.join(', ') || 'nobody selected'}`),
    r.notes.length ? el('ul', {}, r.notes.map(n => el('li', {}, n))) : el('p', {class:'fx-ok'}, 'Clear, reproducible and correctly prioritised. Ready for a developer.'))) : el('p', {class:'ol-muted'}, 'No reports filed yet.'));
  const acc = acceptedDefects();
  const box = $('fx-handoff-a');
  if (!acc.size) { fill(box, el('p', {class:'ol-muted'}, 'When triage accepts a report, a bug code for Workstation B appears here.')); return; }
  const value = packBits([acc.has('access'), acc.has('errors'), acc.has('enumerate')]) + 8 * Math.min(31, sim.reports.length);
  fill(box, el('div', {class:'ol-handoff'}, el('h4', {}, 'Read this to Workstation B (Developer)'),
    [...acc].map(d => el('p', {}, el('b', {}, DEFECTS[d].title + ': '), d === 'access' ? 'guests AND employees can read other people’s HR records.' : d === 'errors' ? 'bad input reaches the server and the error page shows file paths and server names.' : 'the login error tells you which usernames exist.')),
    codeDisplay(encodeCode(CODES.bugs.type, value, CODES.bugs.chars), 'BUG REPORT CODE — B types this into “Tickets”')));
}

/* ======================================================================
 * Developer workspace (B)
 * ==================================================================== */
const FILES = {
  'routes/profile.js':['access', 'cache'], 'forms/contact.js':['validate', 'errors'], 'auth/login.js':['enumerate'],
};
let openFile = 'routes/profile.js';
function patchSelect(key) {
  const p = PATCHES[key];
  return el('select', {class:'fx-patch', 'aria-label':p.label, onchange:e => { sim.build[key] = Number(e.target.value); save(); renderDiff(); text('fx-stale', 'Unsaved changes — apply & run tests'); }},
    p.options.map((o, i) => el('option', {value:i, selected:sim.build[key] === i}, o)));
}
function codeLines(file) {
  const L = (n, ...parts) => el('div', {class:'fx-line'}, el('span', {class:'fx-ln'}, n), el('code', {}, ...parts));
  if (file === 'routes/profile.js') return [
    L(1, '// GET /staff/:id — show a staff profile'), L(2, 'function showProfile(user, profile) {'),
    L(3, '  render(profile.publicInfo);   // name, team, extension'),
    L(4, '  if (canViewHR(user, profile)) render(profile.hrRecord);'), L(5, '}'), L(6, ''),
    L(7, 'function canViewHR(user, profile) {'),
    sim.hotfix ? el('div', {class:'fx-line fx-patchline fx-hot'}, el('span', {class:'fx-ln'}, 8), el('code', {}, '  ', patchSelect('cache'))) : null,
    el('div', {class:'fx-line fx-patchline'}, el('span', {class:'fx-ln'}, sim.hotfix ? 9 : 8), el('code', {}, '  ', patchSelect('access'))), L(sim.hotfix ? 10 : 9, '}')];
  if (file === 'forms/contact.js') return [
    L(1, '// POST /account/contact'), L(2, 'async function saveContact(user, phone, res) {'),
    el('div', {class:'fx-line fx-patchline'}, el('span', {class:'fx-ln'}, 3), el('code', {}, '  ', patchSelect('validate'))),
    L(4, '  try {'), L(5, '    await staff.update(user.id, { phone: formatPhone(phone) });'), L(6, "    res.send('Your contact details were updated.');"), L(7, '  } catch (err) {'),
    el('div', {class:'fx-line fx-patchline'}, el('span', {class:'fx-ln'}, 8), el('code', {}, '    ', patchSelect('errors'))), L(9, '  }'), L(10, '}')];
  return [L(1, '// POST /login'), L(2, 'function failedLogin(username, user, res) {'),
    el('div', {class:'fx-line fx-patchline'}, el('span', {class:'fx-ln'}, 3), el('code', {}, '  ', patchSelect('enumerate'))), L(4, '}')];
}
function renderEditor() {
  document.querySelectorAll('[data-file]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.file === openFile)));
  text('fx-filename', openFile);
  fill('fx-code', codeLines(openFile));
  renderDiff();
}
function renderDiff() {
  const changes = Object.keys(PATCHES).filter(k => sim.build[k] !== LIVE_BUILD[k] && (k !== 'cache' || sim.hotfix));
  fill('fx-diff', changes.length ? changes.map(k => el('div', {class:'fx-diffitem'}, el('small', {}, PATCHES[k].file + ' · ' + PATCHES[k].label),
    el('code', {class:'fx-minus'}, '- ' + PATCHES[k].options[LIVE_BUILD[k]]), el('code', {class:'fx-plus'}, '+ ' + PATCHES[k].options[sim.build[k]]))) : el('p', {class:'ol-muted'}, 'No changes from the live build yet.'));
}
/* ---------- deterministic test suite ---------- */
function testSuite() {
  const T = [];
  const fresh = () => makePortal(sim.build);
  const G = USERS.guest, E = USERS.employee, A = USERS.admin;
  T.push({id:'T1', group:'Access control', name:'Guest cannot see HR details (/staff/102)', run:() => { const v = fresh().canSeeHR(G, 102); return [!v, 'hidden', v ? 'HR record visible' : 'hidden']; }});
  T.push({id:'T2', group:'Access control', name:'Employee can see their own HR details', run:() => { const v = fresh().canSeeHR(E, 104); return [v, 'visible', v ? 'visible' : 'blocked — legitimate use is broken']; }});
  T.push({id:'T3', group:'Access control', name:'Employee cannot see another employee’s HR details', run:() => { const v = fresh().canSeeHR(E, 102); return [!v, 'hidden', v ? 'HR record visible' : 'hidden']; }});
  T.push({id:'T4', group:'Access control', name:'HR admin can see any HR record', run:() => { const v = fresh().canSeeHR(A, 102); return [v, 'visible', v ? 'visible' : 'blocked — HR can’t do their job']; }});
  const form = (phone, fail = false) => fresh().saveContact(E, phone, fail);
  T.push({id:'T5', group:'Validation', name:'Valid UK number “+44 117 496 0123” is saved', run:() => { const r = form('+44 117 496 0123'); return [r.kind === 'saved', 'saved', r.kind === 'rejected' ? `rejected: “${r.message}”` : r.kind]; }});
  T.push({id:'T6', group:'Validation', name:'“call me maybe” is rejected with a helpful message', run:() => { const r = form('call me maybe'); return [r.kind === 'rejected', 'rejected', r.kind === 'trace' ? 'crashed and showed a stack trace' : r.kind === 'fake' ? 'claimed “Saved!”' : r.kind]; }});
  T.push({id:'T7', group:'Validation', name:'Empty phone number is rejected', run:() => { const r = form(''); return [r.kind === 'rejected', 'rejected', r.kind === 'trace' ? 'crashed and showed a stack trace' : r.kind]; }});
  T.push({id:'T8', group:'Error handling', name:'Database outage shows a safe message (no paths, no server names)', run:() => { const r = form('+44 117 496 0123', true); return [r.kind === 'safe', 'safe message', r.kind === 'trace' ? 'stack trace with DB_HOST shown' : r.kind === 'fake' ? '“Saved!” (lie)' : r.kind]; }});
  T.push({id:'T9', group:'Error handling', name:'Database outage is not reported as success', run:() => { const r = form('+44 117 496 0123', true); return [r.kind !== 'fake', 'not “Saved!”', r.kind === 'fake' ? 'said “Saved!”' : r.kind]; }});
  T.push({id:'T10', group:'Extra', name:'Unknown user and wrong password give the same message', extra:true, run:() => { const p = fresh(); const a = p.login('ria.chen', 'x'), b = p.login('no.body', 'x'); return [a === b, 'identical', a === b ? 'identical' : `“${a}” vs “${b}”`]; }});
  if (sim.hotfix) {
    T.push({id:'R1', group:'Regression (#025)', name:'HR admin still allowed after a guest views the page', run:() => { const p = fresh(); p.canSeeHR(G, 102); const v = p.canSeeHR(A, 102); return [v, 'visible', v ? 'visible' : 'blocked — cached guest decision reused']; }});
    T.push({id:'R2', group:'Regression (#025)', name:'Guest still blocked after an HR admin views the page', run:() => { const p = fresh(); p.canSeeHR(A, 103); const v = p.canSeeHR(G, 103); return [!v, 'hidden', v ? 'HR record visible — cached admin decision reused' : 'hidden']; }});
    T.push({id:'R3', group:'Regression (#025)', name:'Repeat visits by the same user are cached (performance)', run:() => [sim.build.cache !== 0, 'cached', sim.build.cache === 0 ? 'no cache — page is slow again' : 'cached']});
  }
  return T;
}
let testing = false;
async function runTests() {
  if (testing) return; testing = true; $('fx-run').disabled = true;
  sim.buildNo++; const tests = testSuite(); const results = [];
  const box = $('fx-results'); box.replaceChildren();
  text('fx-stale', `Build #${String(sim.buildNo).padStart(3, '0')} · running ${tests.length} tests…`);
  let group = '';
  for (const t of tests) {
    if (t.group !== group) { group = t.group; box.append(el('div', {class:'fx-tgroup'}, group)); }
    const [pass, expected, actual] = t.run(); results.push({id:t.id, pass, extra:t.extra});
    box.append(el('div', {class:`fx-test ${pass ? 'pass' : 'fail'} ${t.extra ? 'extra' : ''}`},
      el('b', {}, pass ? 'PASS' : 'FAIL'), el('span', {}, el('span', {class:'tl-mono'}, t.id + ' '), t.name, !pass ? el('small', {}, `expected: ${expected} · actual: ${actual}`) : null)));
    await wait(70);
  }
  const core = results.filter(r => !r.extra), passCount = core.filter(r => r.pass).length;
  sim.runs.unshift({no:sim.buildNo, pass:passCount, total:core.length, build:{...sim.build}, hotfix:sim.hotfix}); sim.runs = sim.runs.slice(0, 8); save();
  text('fx-stale', `Build #${String(sim.buildNo).padStart(3, '0')}: ${passCount}/${core.length} required tests passing${results.some(r => r.extra) ? ` · extra ${results.filter(r => r.extra && r.pass).length}/1` : ''}`);
  fill('fx-summary', passCount === core.length ? el('div', {class:'tl-review good'}, el('strong', {}, 'All required tests pass.'), el('p', {}, 'Give the build code to Workstation A so they can retest it in the real portal.'))
    : el('div', {class:'tl-review warn'}, el('strong', {}, `${core.length - passCount} failing.`), el('p', {}, 'Read the expected vs actual lines. A fix that blocks everyone, or crashes, is not a fix.')));
  renderHistoryB(); renderBuildCode(); refreshCheckpoints();
  testing = false; $('fx-run').disabled = false;
}
function renderHistoryB() {
  fill('fx-history', sim.runs.length ? sim.runs.map(r => el('tr', {}, el('td', {class:'tl-mono'}, '#' + String(r.no).padStart(3, '0')), el('td', {}, `${r.pass}/${r.total}`), el('td', {}, r.pass === r.total ? '✓' : '—'))) : el('tr', {}, el('td', {colspan:3, class:'ol-muted'}, 'No builds tested yet.')));
}
const buildToInt = b => b.access + 5 * (b.validate + 4 * (b.errors + 3 * (b.enumerate + 2 * b.cache)));
const intToBuild = v => ({access:v % 5, validate:Math.floor(v / 5) % 4, errors:Math.floor(v / 20) % 3, enumerate:Math.floor(v / 60) % 2, cache:Math.floor(v / 120) % 3});
function renderBuildCode() {
  const box = $('fx-handoff-b');
  if (!sim.runs.length) { fill(box, el('p', {class:'ol-muted'}, 'Run the tests to produce a build code.')); return; }
  fill(box, el('div', {class:'ol-handoff'}, el('h4', {}, 'Read this to Workstation A (Tester)'),
    el('p', {}, `Build #${String(sim.runs[0].no).padStart(3, '0')}: ${sim.runs[0].pass}/${sim.runs[0].total} required tests passing.`),
    codeDisplay(encodeCode(CODES.build.type, buildToInt(sim.build), CODES.build.chars), 'BUILD CODE — A loads this into the portal to retest'),
    el('p', {class:'ol-muted'}, 'The code holds your current patch choices. Change a patch → new code.')));
}
function renderTickets() {
  const box = $('fx-tickets');
  if (sim.partnerBugs === null) { fill(box, el('p', {class:'ol-muted'}, 'No tickets imported. The tester’s code tells you which bugs are confirmed — you can still explore the files meanwhile.')); return; }
  const [access, errors, enumerate] = unpackBits(sim.partnerBugs, 3);
  const list = [access && ['routes/profile.js', DEFECTS.access.title, 'Guests and employees can read other people’s HR records.'],
    errors && ['forms/contact.js', DEFECTS.errors.title, 'Bad input crashes the save; the error page shows server internals.'],
    enumerate && ['auth/login.js', DEFECTS.enumerate.title, 'Login errors reveal which usernames exist.']].filter(Boolean);
  fill(box, list.length ? list.map(([file, title, d]) => el('button', {type:'button', class:'fx-ticket accepted fx-ticket-btn', onclick:() => { openFile = file; renderEditor(); }},
    el('strong', {}, title), el('small', {}, d), el('span', {class:'ol-chip'}, 'Open ' + file))) : el('p', {class:'ol-muted'}, 'The code contains no confirmed bugs yet.'));
}

/* ======================================================================
 * Joint: staging build retest
 * ==================================================================== */
function loadStaging(value) {
  sim.stagingBuild = intToBuild(value); sim.useStaging = true; sim.retest = []; save();
  portal = makePortal(sim.stagingBuild); renderPortal(); renderRetest();
  feed('Staging build loaded into the portal. Retest every original defect.', 'good');
}
function renderRetest() {
  const box = $('fx-retest'); if (!box) return;
  fill(box, Object.entries(RETEST).map(([id, label]) => { const r = sim.retest.find(x => x.id === id);
    return el('li', {class:r ? (r.pass ? 'pass' : 'fail') : ''}, el('b', {}, r ? (r.pass ? 'PASS' : 'FAIL') : '—'), label); }));
  const toggle = $('fx-staging-toggle');
  toggle.hidden = !sim.stagingBuild;
  toggle.textContent = sim.useStaging ? 'Switch portal back to LIVE build' : 'Switch portal to STAGING build';
  const done = Object.keys(RETEST).every(id => sim.retest.some(r => r.id === id));
  const fails = sim.retest.filter(r => !r.pass).length;
  text('fx-retest-sum', !sim.stagingBuild ? 'Load the developer’s build code to start retesting.' : done ? (fails ? `${fails} retest${fails === 1 ? '' : 's'} failed — send it back to the developer.` : 'Every retest passed on the staging build.') : `${sim.retest.length}/${Object.keys(RETEST).length} checks retested. Use guest, employee and HR admin; try good and bad phone numbers and the outage switch.`);
  renderDecision();
}
function renderDecision() {
  const done = Object.keys(RETEST).every(id => sim.retest.some(r => r.id === id));
  const allPass = done && sim.retest.every(r => r.pass);
  const msg = {
    yes: allPass ? 'Portal returned to service. Staff can update their details, HR can work, and private records stay private.' : done ? 'Returned to service with failing retests. Within the hour, a complaint arrives: the defect is still there (or real users are blocked). Roll back and fix.' : 'You are reopening without finishing the retest. That is how regressions reach real users.',
    no: allPass ? 'Kept offline — but every retest passed. Staff can’t reach HR services while it stays down. You need a reason to hold.' : 'Kept offline until the failing retests are fixed. Correct call.',
  };
  fill('fx-decision', el('div', {class:'tl-classify'},
    el('button', {type:'button', class:'ol-btn', 'aria-pressed':String(sim.decision === 'yes'), onclick:() => { sim.decision = 'yes'; save(); renderDecision(); }}, 'Return portal to service'),
    el('button', {type:'button', class:'ol-btn', 'aria-pressed':String(sim.decision === 'no'), onclick:() => { sim.decision = 'no'; save(); renderDecision(); }}, 'Keep it offline')),
    sim.decision ? el('p', {class:`tl-review ${(sim.decision === 'yes') === allPass ? 'good' : 'warn'}`}, msg[sim.decision]) : el('p', {class:'ol-muted'}, 'Decide together once the retest is done.'));
}

/* ======================================================================
 * Chrome, checkpoints, boot
 * ==================================================================== */
function banner(message, kind = 'info') { const b = $('fx-banner'); b.textContent = message; b.dataset.kind = kind; }
function selectTab(tab) {
  document.querySelectorAll('[data-tab]').forEach(b => b.setAttribute('aria-selected', String(b.dataset.tab === tab)));
  document.querySelectorAll('[data-panel]').forEach(p => { p.hidden = p.dataset.panel !== tab; });
  // the portal lives in A's panel; in the joint tab we move it so A can retest there
  const host = tab === 'joint' ? $('fx-portal-joint') : $('fx-portal-a');
  if (host && $('fx-browser').parentElement !== host) host.append($('fx-browser'));
}
function renderStatus(state) {
  text('fx-group', state.groupName || 'Group');
  text('fx-unit', `Unit ${state.workingUnit || '—'} · group progress is shared`);
  text('fx-station', `Workstation ${zone.workstation}`);
  text('fx-role', zone.workstation === 'A' ? 'Software Tester' : 'Software Developer');
  text('fx-score', `${state.scores?.fix ?? 0} / 100`);
  const z = zone.zoneStatus();
  text('fx-progress', `${z.completed} of ${z.total} sign-offs passed`);
  text('fx-keytext', z.keyEarned ? 'RECOVERED' : 'LOCKED');
  for (const view of ['a', 'b', 'joint', 'bonus']) { const b = $(`fx-tab-${view}`); if (b) { b.textContent = zone.passed(view) ? '✓ signed off' : view === 'bonus' ? 'optional' : 'open'; b.classList.toggle('done', zone.passed(view)); } }
  document.querySelectorAll('.ol-you').forEach(n => { n.hidden = n.dataset.for !== zone.workstation; });
  $('fx-key').classList.toggle('is-earned', z.keyEarned);
  text('fx-key-glyph', z.keyEarned ? '✓' : '◇');
  text('fx-key-sub', z.keyEarned ? 'Saved to your group by the server.' : 'Unlocks when the server confirms A, B and joint sign-offs.');
}
const checks = {};
function refreshCheckpoints() { Object.values(checks).forEach(c => c.update()); }
function buildCheckpoints() {
  checks.a = checkpoint('fx-check-a', zone, 'a', {intro:'Report your testing conclusions to Mission Control.',
    lockReason:() => acceptedDefects().size ? null : 'Get at least one bug report accepted by triage first (ideally both the access-control and the error-handling bugs).'});
  checks.b = checkpoint('fx-check-b', zone, 'b', {intro:'Explain your repair decisions to Mission Control.',
    lockReason:() => sim.runs.length >= 2 ? null : `Apply a patch and run the tests at least twice (${sim.runs.length}/2) — fix, test, adjust, retest.`});
  checks.joint = checkpoint('fx-check-joint', zone, 'joint', {intro:'Release authorisation. Agree every answer together.',
    lockReason:() => !(zone.passed('a') && zone.passed('b')) ? `Waiting for ${[!zone.passed('a') ? 'Workstation A' : null, !zone.passed('b') ? 'Workstation B' : null].filter(Boolean).join(' and ')} to pass their sign-off. Start the retest meanwhile.` : null});
  checks.bonus = checkpoint('fx-check-bonus', zone, 'bonus', {intro:'Optional: how should a team respond to a regression?',
    lockReason:() => sim.runs.some(r => r.hotfix) ? null : 'Deploy hotfix #025 and run the tests at least once.'});
}
function wire() {
  document.querySelectorAll('[data-tab]').forEach(b => b.addEventListener('click', () => selectTab(b.dataset.tab)));
  document.querySelectorAll('[data-user]').forEach(b => b.addEventListener('click', () => { sim.user = b.dataset.user; step('switched user'); renderPortal(); }));
  $('fx-go').addEventListener('click', () => navigate(($('fx-urlbox').value.trim() || '/').replace(/^https?:\/\/[^/]+/, '')));
  $('fx-urlbox').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); $('fx-go').click(); } });
  $('fx-fail').addEventListener('change', e => { sim.tools.failSave = e.target.checked; save(); feed(e.target.checked ? 'Test tool: database outage ON for saves' : 'Test tool: database outage OFF'); });
  $('fx-report-form').addEventListener('submit', fileReport);
  $('fx-run').addEventListener('click', runTests);
  document.querySelectorAll('[data-file]').forEach(b => b.addEventListener('click', () => { openFile = b.dataset.file; renderEditor(); }));
  $('fx-staging-toggle').addEventListener('click', () => { sim.useStaging = !sim.useStaging; save(); portal = makePortal(activeBuild()); renderPortal(); renderRetest(); });
  $('fx-hotfix').addEventListener('click', () => {
    if (sim.hotfix) return;
    sim.hotfix = true; sim.build.cache = 1; save();
    openFile = 'routes/profile.js'; renderEditor(); selectTab('b');
    banner('Hotfix #025 deployed by another developer to speed up profile pages. HR is already complaining. Run the tests.', 'warn');
  });
  $('fx-reset-sim').addEventListener('click', () => { if (window.confirm('Clear the simulation on this computer? Official server results are not affected.')) { store.clear(); location.reload(); } });
  $('fx-ticket-entry').append(codeInput({...CODES.bugs, label:'Bug report code from Workstation A', otherTypes:OTHER, onAccept:v => { sim.partnerBugs = v % 8; save(); renderTickets(); }}));
  $('fx-staging-entry').append(codeInput({...CODES.build, label:'Build code from Workstation B', otherTypes:OTHER, buttonText:'Load into portal', onAccept:loadStaging}));
  hintPanel('fx-hints-a', [
    'Open a staff profile as a Guest. Then sign in as Sam Lee and open someone else’s profile. Then try Sam’s own profile (/staff/104).',
    'Authentication = who you are. Authorisation = what you’re allowed to see. A system can get one right and the other wrong.',
    'On the contact form, type letters, leave it empty, and turn on the database-outage test tool. Read the error page like an attacker would: what does it give away?']);
  hintPanel('fx-hints-b', [
    'Start with the failing tests: read “expected” vs “actual”. Each one points at a line in a file.',
    'A good access check needs BOTH: is the user signed in, AND are they allowed to see THIS record? Blocking everyone fails other tests.',
    'Validation should accept real phone formats (spaces, +44). Error handlers should log the detail for developers but show users a safe message — never “Saved!” when it wasn’t.']);
}
async function boot() {
  wire(); bindConnectionErrors(banner);
  document.addEventListener('ol:key', () => { toast('PORTAL SECURED — recovery key saved for your group.', 'success', 'Recovery key earned'); banner('PORTAL SECURED. The server has saved this recovery key for your group.', 'good'); });
  try { await zone.start(); }
  catch (error) {
    banner(describeError(error), 'bad');
    notLoggedIn($('fx-main'), error.status === 401 ? 'This computer is not signed in to a group. Sign in at the Mission Hub, then come back to Fix It.' : describeError(error));
    return;
  }
  store.bind({group:zone.state.group, workingUnit:zone.state.workingUnit, workstation:zone.workstation});
  restore();
  $('fx-fail').checked = sim.tools.failSave;
  renderPortal(); renderReportForm(); renderReports(); renderEditor(); renderHistoryB(); renderBuildCode(); renderTickets(); renderRetest();
  buildCheckpoints();
  zone.on(state => { renderStatus(state); refreshCheckpoints(); });
  selectTab(zone.workstation === 'B' ? 'b' : 'a');
  banner(`${zone.state.groupName}, Unit ${zone.state.workingUnit}: you are Workstation ${zone.workstation} — the ${zone.workstation === 'A' ? 'Software Tester' : 'Software Developer'}. Last night’s emergency portal release went wrong. ${STORY.people.engineering.split(' ·')[0]} wants it safe to reopen.`);
}
boot();
