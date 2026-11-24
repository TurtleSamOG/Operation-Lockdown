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
  hintPanel, createZone, checkpoint, describeError, notLoggedIn, bindConnectionErrors, applyRoleTabs, applyBonus, stepify, BONUS_MIN_MINUTES_LEFT} from './mission-core.js';

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
const LIVE_BUILD = {access:0, validate:0, errors:0, enumerate:0, cache:0, board:0, pw:0};

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
  board:{file:'views/noticeboard.js', label:'How is each post put on the page?', options:[
    "html += post.message;  // show exactly what was typed",
    "html += post.message.replace('<script>', '');  // block scripts",
    "html += escapeHtml(post.message);  // turn < > \" ' & into plain characters",
    "html += post.message.replace(/[^a-z0-9 ]/gi, '');  // remove every symbol",
  ]},
  pw:{file:'auth/password.js', label:'What makes a new password acceptable?', options:[
    "if (pw.length < 1) return reject('Enter a password');",
    "if (pw.length < 8 || !/[A-Z]/.test(pw) || !/[0-9]/.test(pw) || !/[^A-Za-z0-9]/.test(pw)) return reject('Use 8+ characters with a capital, a number and a symbol');",
    "if (pw.length < 6 || pw.length > 8) return reject('Use 6 to 8 characters');",
    "if (pw.length < 12 || COMMON.includes(pw.toLowerCase())) return reject('Use 12+ characters — three random words works well — and nothing common');",
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
  /** Simulated rendering of a noticeboard post. Nothing is ever executed — we only decide what WOULD happen. */
  function renderPost(message) {
    const runsCode = m => /<\s*script|\bon\w+\s*=|javascript:/i.test(m);
    if (build.board === 0 || build.board === undefined) return runsCode(message) ? {kind:'ran', shown:message} : {kind:'shown', shown:message};
    if (build.board === 1) { const after = message.replace('<script>', ''); return runsCode(after) ? {kind:'ran', shown:after} : {kind:'shown', shown:after}; }
    if (build.board === 2) return {kind:'shown', shown:message, escaped:true};
    return {kind:'shown', shown:message.replace(/[^a-z0-9 ]/gi, ''), mangled:/[^a-z0-9 ]/i.test(message)};
  }
  const COMMON = ['password', 'password1', 'password1!', 'password123', 'qwerty123', 'letmein', 'welcome1', 'northstar1', 'northstar2026', 'summer2026!', 'iloveyou', '123456789'];
  /** Returns null if the new password is accepted, or the rejection message. */
  function checkPassword(pw) {
    const v = build.pw || 0;
    if (v === 0) return pw.length < 1 ? 'Enter a password' : null;
    if (v === 1) return pw.length < 8 || !/[A-Z]/.test(pw) || !/[0-9]/.test(pw) || !/[^A-Za-z0-9]/.test(pw) ? 'Use 8+ characters with a capital, a number and a symbol' : null;
    if (v === 2) return pw.length < 6 || pw.length > 8 ? 'Use 6 to 8 characters' : null;
    return pw.length < 12 || COMMON.includes(pw.toLowerCase()) ? 'Use 12+ characters — three random words works well — and nothing common' : null;
  }
  const isWeak = pw => pw.length < 8 || COMMON.includes(pw.toLowerCase());
  return {build, canSeeHR, saveContact, login, validate, renderPost, checkPassword, isWeak};
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
  'weak-pw':{text:'The Change password page accepts very weak passwords like “abc” or “password”', defect:'pw'},
  'script-ran':{text:'Code typed into a noticeboard post runs in the browser of everyone who views it', defect:'board'},
};
const RETEST = {
  'guest-blocked':'Guest cannot see HR details', 'emp-own':'Employee can see their own HR details', 'emp-other-blocked':'Employee cannot see another employee’s HR details',
  'admin-ok':'HR admin can see HR details', 'bad-rejected':'Invalid phone rejected with a helpful message', 'good-saved':'Valid phone number saved', 'error-safe':'Save failure shows a safe message',
  'pw-weak':'Weak passwords (“password”, “abc”) are rejected', 'pw-phrase':'A long passphrase (three random words) is accepted',
  'board-safe':'Code in a noticeboard post is shown as text, not run', 'board-ok':'Normal posts with symbols (’ % ! <3) still read correctly',
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
  const nav = el('nav', {class:'nh-nav'}, [['/', 'Home'], ['/staff', 'Staff directory'], ['/noticeboard', 'Noticeboard'], ['/account/contact', 'My contact details'], ['/account/password', 'Change password'], ['/login', 'Sign in']].map(([href, lab]) =>
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
  else if (p === '/noticeboard') body = noticeboardPage(user);
  else if (p === '/account/password') body = passwordPage(user);
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
const SEED_POSTS = [
  {author:'Ria Chen', message:'Fire drill on Thursday at 10:00. Please leave by the nearest exit.'},
  {author:'Jordan Carter', message:'Cake in the kitchen — it’s Sam’s birthday! 50% chance there’s some left after 11.'},
];
function postNode(post) {
  const r = portal.renderPost(post.message);
  if (r.kind === 'ran') return el('div', {class:'nh-post nh-post-ran'}, el('b', {}, post.author + ': '),
    el('div', {class:'nh-xss'}, el('strong', {}, '⚠ A script just ran in YOUR browser'), el('span', {}, '(simulated) Sending your login session to attacker.example… Every colleague who opens this page would be hit too.')));
  return el('div', {class:'nh-post'}, el('b', {}, post.author + ': '), el('span', {class:r.escaped ? 'nh-mono' : ''}, r.shown || '(empty)'));
}
function noticeboardPage(user) {
  const posts = [...SEED_POSTS, ...(sim.posts || [])];
  const list = el('div', {class:'nh-posts'}, posts.map(postNode));
  posts.forEach(post => { if (portal.renderPost(post.message).kind === 'ran') observe('script-ran'); });
  if (!user.isLoggedIn) return el('div', {}, el('h2', {}, 'Staff noticeboard'), list, el('p', {class:'nh-muted'}, 'Sign in to post a message.'));
  const input = el('input', {type:'text', id:'nh-post', 'aria-label':'Message', placeholder:'Write a message for everyone…', autocomplete:'off', maxlength:200});
  const post = () => {
    const message = input.value.trim(); if (!message) return;
    sim.posts = [...(sim.posts || []), {author:USERS[sim.user].label.split(' ·')[0], message}].slice(-6);
    step(`posted "${message.slice(0, 40)}" on the noticeboard`); save();
    const r = portal.renderPost(message);
    if (r.kind === 'ran') observe('script-ran');
    if (sim.useStaging) {
      if (/<|>/.test(message) && /script|on\w+=/i.test(message)) retestMark('board-safe', r.kind !== 'ran');
      else if (/[^a-z0-9 ]/i.test(message)) retestMark('board-ok', r.kind === 'shown' && !r.mangled);
    }
    renderPortal();
  };
  input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); post(); } });
  return el('div', {}, el('h2', {}, 'Staff noticeboard'), el('p', {class:'nh-muted'}, 'Messages are shown to every member of staff who opens this page.'), list,
    el('div', {class:'nh-row'}, input, el('button', {type:'button', class:'nh-btn', onclick:post}, 'Post')),
    el('p', {class:'nh-muted nh-small'}, 'Testers: posts are just text… aren’t they? Try a normal message, then one containing HTML or code, such as <b>hi</b> or <script>alert(1)</script>.'));
}
function passwordPage(user) {
  if (!user.isLoggedIn) return el('div', {}, el('h2', {}, 'Change password'), el('p', {}, 'Please sign in first.'));
  const input = el('input', {type:'text', id:'nh-newpw', 'aria-label':'New password', placeholder:'New password', autocomplete:'off', maxlength:64});
  const out = el('div', {role:'status', 'aria-live':'polite'});
  const save = () => {
    const pw = input.value; if (!pw) return;
    step(`tried new password "${pw.replace(/./g, '•').slice(0, 20)}" (${pw.length} chars)`);
    const problem = portal.checkPassword(pw);
    fill(out, problem ? el('p', {class:'nh-warn'}, problem) : el('p', {class:'nh-ok'}, '✓ Password changed.'));
    if (!problem && portal.isWeak(pw)) observe('weak-pw');
    if (sim.useStaging) {
      if (portal.isWeak(pw)) retestMark('pw-weak', Boolean(problem));
      else if (pw.length >= 16 && pw.includes(' ')) retestMark('pw-phrase', !problem);
    }
  };
  input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); save(); } });
  return el('div', {}, el('h2', {}, 'Change password'), el('p', {class:'nh-muted'}, `Signed in as ${user.label}. (Simulation: the password is shown so testers can see what they typed. Never use a real password here.)`),
    el('label', {class:'nh-label', for:'nh-newpw'}, 'New password'), el('div', {class:'nh-row'}, input, el('button', {type:'button', class:'nh-btn', onclick:save}, 'Change password')), out,
    el('p', {class:'nh-muted nh-small'}, 'Testers: what does the site accept? Try something weak like “abc” or “password”, then a strong passphrase like “purple tractor ocean biscuit”.'));
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
const FEATURES = {profiles:'Staff profile pages', contact:'Contact details form', board:'Staff noticeboard', password:'Change password page', login:'Sign-in page', directory:'Staff directory'};
const EXPECTED = {
  'hr-owner':'Private HR details are visible only to that employee and to HR admins',
  'hr-nobody':'Remove HR details from the portal for everyone',
  'hr-login':'Anyone who is signed in can see HR details',
  'safe-error':'Invalid input is rejected with a helpful message, and failures show a safe message with no internal details',
  'hide-form':'Disable the contact form',
  'same-login':'Wrong username and wrong password give the same message',
  'pw-length':'Require long passwords (12+ characters, e.g. three random words) and block common ones',
  'pw-complex':'Require a capital letter, a number and a symbol',
  'pw-short':'Limit passwords to 8 characters so they are easier to remember',
  'show-as-text':'Every post is shown exactly as plain text — code inside a message is displayed, never run',
  'block-script':'Remove the word <script> from posts',
  'close-board':'Turn the noticeboard off permanently',
  'colour':'Make the error message red so users notice it',
};
const DEFECTS = {
  access:{feature:'profiles', expected:'hr-owner', roles:['guest', 'employee'], sev:['High', 'Critical'], title:'Private HR data exposed on profile pages'},
  errors:{feature:'contact', expected:'safe-error', roles:['employee'], sev:['Medium', 'High'], title:'Contact form leaks internals and accepts invalid input'},
  enumerate:{feature:'login', expected:'same-login', roles:['guest'], sev:['Low', 'Medium'], title:'Login error reveals valid usernames'},
  pw:{feature:'password', expected:'pw-length', roles:['employee', 'hr-admin'], sev:['Medium', 'High'], title:'Weak passwords are accepted'},
  board:{feature:'board', expected:'show-as-text', roles:['guest', 'employee', 'hr-admin'], sev:['High', 'Critical'], title:'Noticeboard runs code from posts'},
};
function triage(report) {
  const o = OBS[report.observed]; if (!o) return {ok:false, notes:['Pick an observation you actually triggered in the portal.']};
  const d = DEFECTS[o.defect]; if (!d) return {ok:false, notes:['That behaviour is real, but it was caused by a patch, not the live site. Report it to the developer directly.']};
  const notes = [];
  if (report.feature !== d.feature) notes.push(`Engineering lead: “Which part of the portal is this? The observation doesn’t match ‘${FEATURES[report.feature]}’.”`);
  const missing = d.roles.filter(r => !report.roles.includes(r));
  if (missing.length && o.defect === 'board') notes.push('“Who sees the noticeboard? Everyone who opens it — guests, employees and HR. Tick everyone who would run that code.”');
  else if (missing.length) notes.push(`“Who is affected? Did you check what ${missing.map(r => r === 'guest' ? 'a guest' : r === 'employee' ? 'a signed-in employee' : 'an HR admin').join(' and ')} can see?”`);
  if (o.defect === 'access' && !(sim.observed.includes('guest-hr') && sim.observed.includes('emp-other-hr'))) notes.push('“Reproduce it as both a guest and an employee before we call it confirmed.”');
  if (report.expected !== d.expected && report.expected === 'pw-complex') notes.push('“Complexity rules sound strong, but people just write Password1! — which meets every rule and is one of the most guessed passwords. What does the NCSC actually recommend?”');
  else if (report.expected !== d.expected) notes.push(report.expected === 'block-script' ? '“Blocking one word is a blocklist — attackers just use a different trick. What should happen to ANY code in a post?”' : '“The expected behaviour doesn’t fix the real problem — or it breaks things legitimate users need.”');
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
  const value = packBits([acc.has('access'), acc.has('errors'), acc.has('enumerate'), acc.has('board'), acc.has('pw')]) + 32 * Math.min(31, sim.reports.length);
  fill(box, el('div', {class:'ol-handoff'}, el('h4', {}, 'Read this to Workstation B (Developer)'),
    [...acc].map(d => el('p', {}, el('b', {}, DEFECTS[d].title + ': '), d === 'access' ? 'guests AND employees can read other people’s HR records.' : d === 'errors' ? 'bad input reaches the server and the error page shows file paths and server names.' : d === 'board' ? 'code typed into a post runs in everyone’s browser when they open the noticeboard.' : d === 'pw' ? 'the Change password page accepts passwords like “abc” and “password”.' : 'the login error tells you which usernames exist.')),
    codeDisplay(encodeCode(CODES.bugs.type, value, CODES.bugs.chars), 'BUG REPORT CODE — B types this into “Tickets”')));
}

/* ======================================================================
 * Developer workspace (B)
 * ==================================================================== */
const FILES = {
  'routes/profile.js':['access', 'cache'], 'forms/contact.js':['validate', 'errors'], 'views/noticeboard.js':['board'], 'auth/password.js':['pw'], 'auth/login.js':['enumerate'],
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
  if (file === 'auth/password.js') return [
    L(1, '// POST /account/password — choose a new password'), L(2, "const COMMON = loadList('common-passwords.txt');  // most-guessed passwords"),
    L(3, 'function changePassword(user, pw, res) {'),
    el('div', {class:'fx-line fx-patchline'}, el('span', {class:'fx-ln'}, 4), el('code', {}, '  ', patchSelect('pw'))),
    L(5, '  user.passwordHash = hash(pw);   // never store the password itself'), L(6, "  res.send('Password changed.');"), L(7, '}')];
  if (file === 'views/noticeboard.js') return [
    L(1, '// GET /noticeboard — show every post'), L(2, 'function showPosts(posts) {'), L(3, "  let html = '';"), L(4, '  for (const post of posts) {'),
    L(5, "    html += '<div class=\"post\"><b>' + escapeHtml(post.author) + '</b>: ';"),
    el('div', {class:'fx-line fx-patchline'}, el('span', {class:'fx-ln'}, 6), el('code', {}, '    ', patchSelect('board'))),
    L(7, "    html += '</div>';"), L(8, '  }'), L(9, '  page.render(html);  // the browser turns this text into the page'), L(10, '}')];
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
  const post = m => fresh().renderPost(m);
  T.push({id:'N1', group:'Output encoding', name:'A normal post “Cake in the kitchen” is shown', run:() => { const r = post('Cake in the kitchen'); return [r.kind === 'shown' && r.shown === 'Cake in the kitchen', 'shown as typed', r.shown]; }});
  T.push({id:'N2', group:'Output encoding', name:'A post containing <script>alert(1)</script> does not run', run:() => { const r = post('<script>alert(1)</script>'); return [r.kind !== 'ran', 'shown as text', r.kind === 'ran' ? 'the script RAN' : 'shown as text']; }});
  T.push({id:'N3', group:'Output encoding', name:'A post containing <img src=x onerror=alert(1)> does not run', run:() => { const r = post('<img src=x onerror=alert(1)>'); return [r.kind !== 'ran', 'shown as text', r.kind === 'ran' ? 'the code RAN — blocking one word didn’t stop it' : 'shown as text']; }});
  T.push({id:'N4', group:'Output encoding', name:'Symbols stay readable: “Sam’s cake — 50% off! <3”', run:() => { const m = 'Sam’s cake — 50% off! <3'; const r = post(m); return [r.kind === 'shown' && r.shown === m, m, r.kind === 'ran' ? 'ran as code' : `“${r.shown}”`]; }});
  const pwc = pw => fresh().checkPassword(pw);
  T.push({id:'P1', group:'Password rules', name:'“abc” is rejected', run:() => { const r = pwc('abc'); return [Boolean(r), 'rejected', r ? 'rejected' : 'accepted']; }});
  T.push({id:'P2', group:'Password rules', name:'“password” is rejected', run:() => { const r = pwc('password'); return [Boolean(r), 'rejected', r ? 'rejected' : 'accepted']; }});
  T.push({id:'P3', group:'Password rules', name:'“Password1!” is rejected (meets complexity rules, but very common)', run:() => { const r = pwc('Password1!'); return [Boolean(r), 'rejected', r ? 'rejected' : 'accepted — attackers try this one early']; }});
  T.push({id:'P4', group:'Password rules', name:'Passphrase “purple tractor ocean biscuit” is accepted', run:() => { const r = pwc('purple tractor ocean biscuit'); return [!r, 'accepted', r ? `rejected: “${r}”` : 'accepted']; }});
  T.push({id:'P5', group:'Password rules', name:'Long random password “x7#Lq9!vR2&mK4” is accepted', run:() => { const r = pwc('x7#Lq9!vR2&mK4'); return [!r, 'accepted', r ? `rejected: “${r}”` : 'accepted']; }});
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
const buildToInt = b => b.access + 5 * (b.validate + 4 * (b.errors + 3 * (b.enumerate + 2 * (b.cache + 3 * ((b.board || 0) + 4 * (b.pw || 0))))));
const intToBuild = v => ({access:v % 5, validate:Math.floor(v / 5) % 4, errors:Math.floor(v / 20) % 3, enumerate:Math.floor(v / 60) % 2, cache:Math.floor(v / 120) % 3, board:Math.floor(v / 360) % 4, pw:Math.floor(v / 1440) % 4});
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
  const [access, errors, enumerate, board, pw] = unpackBits(sim.partnerBugs, 5);
  const list = [access && ['routes/profile.js', DEFECTS.access.title, 'Guests and employees can read other people’s HR records.'],
    errors && ['forms/contact.js', DEFECTS.errors.title, 'Bad input crashes the save; the error page shows server internals.'],
    pw && ['auth/password.js', DEFECTS.pw.title, 'The Change password page accepts “abc” and “password”.'],
    board && ['views/noticeboard.js', DEFECTS.board.title, 'Code typed into a post runs in everyone’s browser.'],
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
  const decide = d => { if (sim.decision) return; sim.decision = d; sim.decisionDone = done; sim.decisionAllPass = allPass; save(); renderDecision(); };
  const wasDone = sim.decision ? sim.decisionDone : done, wasPass = sim.decision ? sim.decisionAllPass : allPass;
  const finalMsg = {
    yes: wasPass ? msg.yes : wasDone ? 'Returned to service with failing retests. Within the hour, a complaint arrives: the defect is still there (or real users are blocked). It goes on your incident record.' : 'You reopened without finishing the retest. That is how regressions reach real users — and it is now on your record.',
    no: wasPass ? msg.no : 'Kept offline until the failing retests are fixed. Correct call.',
  };
  fill('fx-decision', el('div', {class:'tl-classify'},
    el('button', {type:'button', class:'ol-btn', 'aria-pressed':String(sim.decision === 'yes'), disabled:Boolean(sim.decision), onclick:() => decide('yes')}, 'Return portal to service'),
    el('button', {type:'button', class:'ol-btn', 'aria-pressed':String(sim.decision === 'no'), disabled:Boolean(sim.decision), onclick:() => decide('no')}, 'Keep it offline')),
    sim.decision ? [el('p', {class:`tl-review ${(sim.decision === 'yes') === wasPass ? 'good' : 'warn'}`}, finalMsg[sim.decision]), el('p', {class:'ol-locked'}, '🔒 Decision locked — this is now part of your incident record.')]
      : el('p', {class:'ol-muted'}, 'Finish the retest first, then decide together. 🔒 Once you choose, the decision is final.'));
}

/* ======================================================================
 * Chrome, checkpoints, boot
 * ==================================================================== */
function banner(message, kind = 'info') { const b = $('fx-banner'); b.hidden = false; b.textContent = message; b.dataset.kind = kind; }
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
    if (sim.hotfix || zone.workstation !== 'B') return;
    sim.hotfix = true; sim.build.cache = 1; save();
    openFile = 'routes/profile.js'; renderEditor(); selectTab('b'); steppers.b?.go(0);
    banner('Hotfix #025 deployed by another developer to speed up profile pages. HR is already complaining. Run the tests.', 'warn');
  });
  $('fx-reset-sim').addEventListener('click', staffReset);
  $('fx-ticket-entry').append(codeInput({...CODES.bugs, label:'Bug report code from Workstation A', otherTypes:OTHER, onAccept:v => { sim.partnerBugs = v % 32; save(); renderTickets(); }}));
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
  setupGuides();
  zone.on(state => { renderStatus(state); refreshCheckpoints(); updateGuides(); });
  selectTab(zone.workstation === 'B' ? 'b' : 'a');
  $('fx-banner').hidden = true;
}
/* ---------- Guided steps, role lock and timed bonus ---------- */
const steppers = {};
function setupGuides() {
  applyRoleTabs(zone.workstation);
  $('fx-hotfix').hidden = zone.workstation !== 'B';
  text('fx-bonus-role', zone.workstation === 'B' ? 'Deploy the hotfix into your workspace, run the tests and repair it.' : 'Ask the developer for their newest build code, load it in the Retest tab, and try opening a profile as HR admin then guest — order matters with a bad cache.');
  for (const view of ['a', 'b', 'joint', 'bonus']) {
    const panel = document.querySelector(`[data-panel="${view}"]`);
    if (!panel || panel.getAttribute('aria-hidden') === 'true') continue;
    const last = panel.querySelectorAll(':scope > .ol-step').length - 1;
    steppers[view] = stepify(panel, {key:`fix-${zone.state.group}-${zone.state.workingUnit}-${view}`, isDone:i => i === last && zone.passed(view)});
  }
}
function updateGuides() {
  Object.values(steppers).forEach(s => s?.refresh());
  const status = applyBonus(zone, store, {onUnlock:() => { const b = $('fx-key-sub'); if (b) b.textContent = 'Saved to your group by the server. You finished early — the optional challenge tab is now open.'; }});
  if (status === 'late' && zone.zoneStatus().keyEarned) text('fx-key-sub', `Saved to your group by the server. Zone complete — well done. (The optional challenge only opens if you finish with ${BONUS_MIN_MINUTES_LEFT}+ minutes left.)`);
}
function staffReset() {
  if (window.prompt('Staff only: type RESET to clear the simulation on this computer. Official server results are not affected.') !== 'RESET') return;
  store.clear(); try { Object.keys(sessionStorage).filter(k => k.startsWith('ol2:step:')).forEach(k => sessionStorage.removeItem(k)); } catch {} location.reload();
}

boot();
