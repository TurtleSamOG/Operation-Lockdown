/** DEFEND IT — Office Under Pressure (Operation Lockdown 2.0)
 * Workstation A: Incident Intelligence — investigates the town map, collects evidence, writes incident reports.
 * Workstation B: Incident Response — runs the office: a stateful simulation of UPS power, an infected PC,
 *               a suspicious visitor and staff safety, where actions cost time and have knock-on effects.
 * Joint: swap codes, build the combined timeline and agree a safe recovery order.
 * Official progress = server sign-offs (defend-investigate, defend-response, defend-joint, defend-bonus).
 */
import {STORY, $, el, fill, text, toast, clamp, localStore, encodeCode, codeInput, codeDisplay, packBits, unpackBits,
  hintPanel, createZone, checkpoint, describeError, notLoggedIn, bindConnectionErrors, applyRoleTabs, applyBonus, stepify, BONUS_MIN_MINUTES_LEFT} from './mission-core.js';

const zone = createZone({zone:'defend', tasks:{a:'defend-investigate', b:'defend-response', joint:'defend-joint', bonus:'defend-bonus'}});
const store = localStore('defend');
const CODES = {intel:{type:'DI', label:'intelligence', chars:3}, response:{type:'DR', label:'response', chars:3}};
const OTHER = Object.values(CODES);
const clock = m => { const t = 8 * 60 + 47 + m; return `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`; };

/* ======================================================================
 * A — Town investigation
 * ==================================================================== */
const SITES = {
  collision:{name:'Riverside Road · vehicle collision', status:'Emergency services informed', actions:[
    {id:'E1', label:'Examine the scene', cost:3, evidence:'08:31 — a delivery van hit the roadside power cabinet. Driver unhurt but shaken. Police and the network operator informed.'},
    {id:'E2', label:'Speak to the driver', cost:4, evidence:'Driver: “A white van was parked across the loading bay. I had to swerve.” He thinks the van had a “Grid Repairs” logo.'},
  ]},
  power:{name:'Power cabinet · HQ main supply', status:'DAMAGED · supply cut', actions:[
    {id:'E3', label:'Inspect from a safe distance', cost:3, evidence:'Cabinet doors buckled and live cables exposed next to the staff footpath. Main supply to Northstar HQ is cut — the building is on UPS battery.'},
    {id:'E4', label:'Call the network operator (official number)', cost:5, evidence:'Operator: repair crew booked — mains back in about 90 minutes. “We have NOT sent anyone else to your site.”'},
  ]},
  entrance:{name:'Side entrance · access control', status:'ACCESS ALERT', actions:[
    {id:'E5', label:'Check the badge-reader log', cost:4, evidence:'08:52 — side door opened with the badge of D. Moss. HR: D. Moss is on holiday until Monday. The badge may have been copied or stolen.'},
    {id:'E6', label:'Review the door camera', cost:4, evidence:'08:55 — a person in a hi-vis “Grid Repairs” jacket follows a member of staff through the door without badging (tailgating).'},
  ]},
  parking:{name:'Staff car park', status:'Unknown vehicle', actions:[
    {id:'E7', label:'Check the car-park camera', cost:4, evidence:'A white “Grid Repairs” van arrived at 08:24 — seven minutes BEFORE the crash. Its plate is not on today’s visitor list.'},
    {id:'E8', label:'Walk past the van', cost:3, evidence:'Through the window: a laptop and a box of USB drives on the passenger seat. Nobody inside.'},
  ]},
  cafe:{name:'Harbour Café · opposite HQ', status:'Wi-Fi anomaly', actions:[
    {id:'E10', label:'Scan for Wi-Fi networks', cost:4, evidence:'Two networks are called “Northstar-Staff”. One is ours. The other is coming from inside the café — a fake copy (an “evil twin”) that shows a login page asking for staff passwords.'},
    {id:'E11', label:'Ask the café staff', cost:3, evidence:'A man in a hi-vis jacket sat by the window from 08:10 with a laptop and a small antenna. He left at 08:50, walking towards your car park.'},
  ]},
  busstop:{name:'Riverside Road bus stop', status:'Lost property', actions:[
    {id:'E12', label:'Look at the phone a commuter handed in', cost:3, evidence:'A commuter saw a man in hi-vis drop this phone. On screen: a draft email “from Helen Ward (CEO)” to Finance — “Urgent: pay the attached £8,400 invoice before 10:00. I’m in meetings, don’t call me.”'},
    {id:'E13', label:'Compare the email address with the real one', cost:3, evidence:'Real Northstar emails end in @northstarsystems.example. The draft uses @northstar-systems.example — one extra hyphen. A lookalike domain, registered yesterday.'},
  ]},
  office:{name:'Northstar HQ · reception radio', status:'On UPS power', actions:[
    {id:'E9', label:'Radio reception', cost:2, evidence:'Reception: “A Grid Repairs engineer is here asking to check the electrics in the server room. He seems in a hurry.”'},
  ]},
};
const ALL_EVIDENCE = Object.values(SITES).flatMap(s => s.actions);
const N_INTEL = 13;
const INCIDENTS = {
  power:{title:'INC-1 · Power disruption', type:'power', assets:['ups', 'servers', 'footpath'], key:['E3', 'E4'], urgency:['High', 'Critical'],
    good:'The power incident report is accurate: hazard, cause, impact and restoration time are all evidenced.'},
  intrusion:{title:'INC-2 · Suspected intruder', type:'social', assets:['server-room', 'badges'], key:['E5', 'E6', 'E7'], urgency:['High', 'Critical'],
    good:'You connected the dots: a fake engineer, a copied badge and a van that arrived before the crash. This is social engineering exploiting the outage.'},
  fraud:{title:'INC-4 · Fake CEO payment request', type:'fraud', assets:['finance', 'email'], key:['E12', 'E13'], urgency:['High', 'Critical'],
    good:'Exactly: a CEO-impersonation email from a lookalike domain, timed for when everyone is distracted. Finance must verify by phone before paying anything.'},
  wifi:{title:'INC-3 · Fake Wi-Fi network', type:'network', assets:['wifi', 'accounts'], key:['E10', 'E11'], urgency:['High', 'Critical'],
    good:'Spot on: a fake “Northstar-Staff” network run from the café by the same man in hi-vis — designed to steal staff passwords.'},
};
const TYPES = {power:'Physical damage / power outage', social:'Social engineering / unauthorised access', network:'Network attack / fake Wi-Fi', fraud:'Fraud / impersonation email', malware:'Malware infection', weather:'Severe weather'};
const ASSETS = {ups:'UPS battery & building power', servers:'Servers & critical services', footpath:'Staff footpath (exposed cables)', 'server-room':'Server room', badges:'Door badges / access control', wifi:'Staff Wi-Fi & laptops', accounts:'Staff passwords & accounts', finance:'Finance & payments', email:'Email system'};

/* ======================================================================
 * B — Office simulation model
 * ==================================================================== */
const LOADS = {
  core:{name:'Network, door control & CCTV', kw:2, critical:true},
  orders:{name:'Customer orders database', kw:3, critical:true},
  payroll:{name:'Payroll server', kw:1.5},
  dev:{name:'Developer test servers', kw:4},
  wall:{name:'Lobby video wall', kw:1},
  print:{name:'Print server', kw:0.5},
};
const BATTERY_KWH = 4.5, GENERATOR_DELAY = 35, MAINS_AT = 90;
function freshOffice() {
  return {minute:0, battery:BATTERY_KWH, loads:Object.fromEntries(Object.keys(LOADS).map(k => [k, true])), log:[],
    flags:{}, genRequestedAt:null, visitor:'waiting', fin07:'infected'};
}
const ROOMS = {
  reception:{name:'Reception', x:0, y:0, w:2, h:1},
  workspace:{name:'Open-plan workspace', x:2, y:0, w:2, h:1},
  it:{name:'IT support office', x:0, y:1, w:1, h:1},
  server:{name:'Server room', x:1, y:1, w:1, h:1},
  mgmt:{name:'Management suite', x:2, y:1, w:2, h:1},
};
function kwNow(o) { return Object.entries(o.loads).filter(([, on]) => on).reduce((s, [k]) => s + LOADS[k].kw, 0); }
function powerSource(o) { if (o.minute >= MAINS_AT) return 'mains'; if (o.genRequestedAt !== null && o.minute >= o.genRequestedAt + GENERATOR_DELAY) return 'generator'; return o.battery > 0 ? 'ups' : 'none'; }
function runtimeMin(o) { const kw = kwNow(o); return kw ? Math.floor(o.battery / kw * 60) : 999; }
function bridgeTarget(o) { return o.genRequestedAt !== null ? o.genRequestedAt + GENERATOR_DELAY : MAINS_AT; }
function advance(o, minutes) {
  for (let i = 0; i < minutes; i++) {
    o.minute++;
    const src = powerSource(o);
    if (src === 'ups') { o.battery = Math.max(0, o.battery - kwNow(o) / 60); if (o.battery === 0 && !o.flags.blackout) { o.flags.blackout = true; note(o, 'UPS battery exhausted. Every server lost power without shutting down — data may be corrupted.', 'bad'); } }
    if (src === 'generator' && !o.flags.genOnline) { o.flags.genOnline = true; note(o, 'Generator connected. Critical services now have stable power.', 'good'); }
    if (o.fin07 === 'infected' && o.minute >= 20 && !o.flags.spread) { o.flags.spread = true; o.fin07 = 'spread'; note(o, 'FIN-07 malware has spread: the shared file server is encrypting files.', 'bad'); }
    if (o.minute >= 35 && !o.flags.fraudStopped && !o.flags.fraudBlocked && !o.flags.fraudPaid) { o.flags.fraudPaid = true; note(o, 'Finance paid the “urgent CEO invoice”: £8,400 has gone to a criminal’s bank account.', 'bad'); }
    if (o.minute >= 25 && !o.flags.wifiWarned && !o.flags.wifiBlocked && !o.flags.wifiStolen) { o.flags.wifiStolen = true; note(o, 'Four staff typed their passwords into the fake “Northstar-Staff” Wi-Fi login page. The attacker now has them.', 'bad'); }
    if (o.visitor === 'inside' && o.minute >= o.flags.visitorInAt + 6 && !o.flags.usb) { o.flags.usb = true; note(o, 'Server room: an unknown USB device has been plugged into the core switch.', 'bad'); }
  }
}
function note(o, message, kind = '') { o.log.unshift({t:clock(o.minute), message, kind}); o.log = o.log.slice(0, 30); }
function metrics(o) {
  const f = o.flags;
  let safety = 55 + (f.cordon ? 20 : 0) + (f.staffUpdate ? 10 : 0) + (o.visitor === 'refused' || o.visitor === 'verified' ? 10 : 0) - (o.visitor === 'inside' && !f.usbRemoved ? 15 : 0) + (f.evacuated ? 5 : 0) - (f.touchedCabinet ? 35 : 0);
  let security = 35 + (o.fin07 === 'isolated' ? 20 : 0) + (o.fin07 === 'off' ? 12 : 0) - (o.fin07 === 'spread' ? 25 : 0) + (f.fileServerContained ? 15 : 0)
    + (o.visitor === 'verified' ? 20 : o.visitor === 'refused' ? 12 : o.visitor === 'escorted' ? 4 : 0) - (f.usb && !f.usbRemoved ? 25 : 0) + (f.usbRemoved ? 5 : 0)
    + (f.badgeDisabled ? 10 : 0) + (f.phishWarning ? 8 : 0) + (f.evidence ? 5 : 0)
    + (f.wifiBlocked ? 10 : 0) + (f.wifiWarned ? 5 : 0) - (f.wifiStolen && !f.wifiReset ? 20 : 0) + (f.fraudBlocked ? 6 : 0);
  const src = powerSource(o);
  let ops = 30 + (src === 'mains' || src === 'generator' ? 25 : src === 'ups' ? 15 : -10) + (o.loads.orders && src !== 'none' ? 15 : 0) + (o.loads.core && src !== 'none' ? 10 : 0)
    + (f.ceoBriefed ? 10 : 0) + (f.staffUpdate ? 5 : 0) - (f.fraudPaid ? (f.fraudRecalled ? 5 : 25) : 0) - (f.blackout && !f.integrityChecked ? 30 : 0) - (f.evacuated ? 30 : 0) - (o.fin07 === 'spread' && !f.fileServerContained ? 10 : 0);
  return {safety:clamp(safety), security:clamp(security), ops:clamp(ops)};
}
function objectives(o) {
  const powerOk = o.flags.genOnline || o.minute >= MAINS_AT ? !o.flags.blackout || o.flags.integrityChecked : runtimeMin(o) >= bridgeTarget(o) - o.minute;
  return [
    ['people', 'People are safe from the exposed cables', Boolean(o.flags.cordon)],
    ['malware', 'Infected PC contained (and any spread dealt with)', o.fin07 === 'isolated' || o.fin07 === 'off' || (o.fin07 === 'spread' && o.flags.fileServerContained)],
    ['visitor', 'Visitor kept out of the server room (or damage reversed)', ['refused', 'verified'].includes(o.visitor) || (o.visitor === 'escorted') || Boolean(o.flags.usbRemoved)],
    ['power', 'Critical services will stay powered until supply returns', powerOk],
    ['fraud', 'Fake CEO payment stopped (or recalled)', o.flags.fraudPaid ? Boolean(o.flags.fraudRecalled) : Boolean(o.flags.fraudStopped || o.flags.fraudBlocked)],
    ['wifi', 'Fake Wi-Fi dealt with (and any stolen passwords reset)', Boolean((o.flags.wifiBlocked || o.flags.wifiWarned) && (!o.flags.wifiStolen || o.flags.wifiReset))],
  ];
}
/* Room actions. Each returns a description of what happened. avail(o) decides if it's offered. */
const ACTIONS = {
  reception:[
    {id:'let-in', label:'Let the engineer into the server room — the power is urgent', cost:1, avail:o => o.visitor === 'waiting', run:o => { o.visitor = 'inside'; o.flags.visitorInAt = o.minute; return ['bad', 'The “engineer” goes into the server room alone. Nobody checked who he is.']; }},
    {id:'escort', label:'Escort him while he works, without checking his identity', cost:2, avail:o => o.visitor === 'waiting', run:o => { o.visitor = 'escorted'; return ['warn', 'He works under supervision and leaves quickly when the escort asks questions. Risky — you still don’t know who he was.']; }},
    {id:'verify', label:'Ask him to wait; verify with the network operator using the official number', cost:o => intel('E4') ? 2 : 10, avail:o => o.visitor === 'waiting', run:o => { o.visitor = 'verified'; return ['good', intel('E4') ? 'Field intel already confirmed the operator sent nobody. The “engineer” leaves when security is called. Details passed to police.' : 'After a 10-minute hold, the operator confirms they sent nobody. The man has already left. You have his description for the police.']; }},
    {id:'refuse', label:'Refuse entry and call building security', cost:2, avail:o => o.visitor === 'waiting', run:o => { o.visitor = 'refused'; return ['good', 'Security escort him out. Safe — though you never confirmed who he was.']; }},
    {id:'badge', label:'Disable the D. Moss badge (used while she is on holiday)', cost:2, avail:o => !o.flags.badgeDisabled && (intel('E5') || o.flags.doorLogChecked), run:o => { o.flags.badgeDisabled = true; return ['good', 'Badge disabled. The copied badge no longer opens any door.']; }},
    {id:'doorlog', label:'Read the door-access log yourself', cost:6, avail:o => !o.flags.doorLogChecked && !intel('E5'), run:o => { o.flags.doorLogChecked = true; return ['', 'Log: D. Moss’s badge opened the side door at 08:52 — but HR says she is on holiday.']; }},
  ],
  workspace:[
    {id:'isolate', label:'Isolate FIN-07: unplug its network cable, leave it powered on, call security', cost:2, avail:o => o.fin07 === 'infected', run:o => { o.fin07 = 'isolated'; return ['good', 'FIN-07 can no longer reach other computers. Its memory is preserved for investigators.']; }},
    {id:'poweroff', label:'Switch FIN-07 off at the wall', cost:1, avail:o => o.fin07 === 'infected', run:o => { o.fin07 = 'off'; return ['warn', 'The spread stops, but evidence held in memory is lost. Containment worked — investigation is harder.']; }},
    {id:'ignore', label:'Tell the employee to keep working until power is back', cost:1, avail:o => o.fin07 === 'infected' && !o.flags.ignoredOnce, run:o => { o.flags.ignoredOnce = true; return ['bad', 'The pop-ups keep appearing. The infection is still active and connected to the network.']; }},
    {id:'contain-fs', label:'Disconnect the file server and switch to read-only backups', cost:5, avail:o => o.fin07 === 'spread' && !o.flags.fileServerContained, run:o => { o.flags.fileServerContained = true; o.fin07 = 'isolated'; return ['warn', 'Encryption stopped. Some files are lost and must be restored from backup later. Recovered — but at a cost.']; }},
    {id:'update', label:'Send a staff update: what’s happening, keep away from the cabinet, report odd calls', cost:3, avail:o => !o.flags.staffUpdate, run:o => { o.flags.staffUpdate = true; return ['good', 'Staff know what is going on. Two more people report suspicious “IT” calls.']; }},
  ],
  it:[
    {id:'phish', label:'Warn all staff: IT will never ask for your password', cost:2, avail:o => !o.flags.phishWarning, run:o => { o.flags.phishWarning = true; return ['good', 'Warning sent. One employee admits they shared a password — IT resets it.']; }},
    {id:'evidence', label:'Preserve evidence: export CCTV, door log and FIN-07 alerts', cost:4, avail:o => !o.flags.evidence, run:o => { o.flags.evidence = true; return ['good', 'Evidence saved with timestamps. This will matter for the police and the incident review.']; }},
    {id:'wifi-scan', label:'Scan the airwaves for suspicious Wi-Fi yourself', cost:6, avail:o => !o.flags.wifiKnown && !intel('E10'), run:o => { o.flags.wifiKnown = true; return ['', 'Scan complete: there are two “Northstar-Staff” networks. One of them is not ours.']; }},
    {id:'wifi-warn', label:'Warn staff: don’t join “Northstar-Staff” Wi-Fi or type passwords into Wi-Fi pop-ups — use the wired network', cost:3, avail:o => !o.flags.wifiWarned, run:o => { o.flags.wifiWarned = true; return ['good', 'Warning sent. Staff switch to wired connections; two report a “please log in again” pop-up they ignored.']; }},
    {id:'wifi-block', label:'Get the network team to block the fake network and lock laptops to the real one', cost:4, avail:o => !o.flags.wifiBlocked && (intel('E10') || o.flags.wifiKnown), run:o => { o.flags.wifiBlocked = true; return ['good', 'Company laptops will now only connect to the genuine network. The fake one is useless.']; }},
    {id:'wifi-reset', label:'Reset the passwords of the four staff who typed them into the fake page', cost:4, avail:o => o.flags.wifiStolen && !o.flags.wifiReset, run:o => { o.flags.wifiReset = true; return ['warn', 'Passwords reset and sessions logged out. Recovered — but only after the attacker had them for a while.']; }},
    {id:'usb', label:'Remove the unknown USB device, quarantine it and check the core switch', cost:6, avail:o => o.flags.usb && !o.flags.usbRemoved, run:o => { o.flags.usbRemoved = true; return ['warn', 'Device removed and bagged as evidence. The switch configuration is checked and restored. Recovered.']; }},
  ],
  server:[
    ...Object.entries(LOADS).filter(([, l]) => !l.critical).map(([k, l]) => ({id:'shed-' + k, label:`Safely shut down: ${l.name} (${l.kw} kW)`, cost:2, avail:o => o.loads[k] && powerSource(o) === 'ups',
      run:o => { o.loads[k] = false; return ['good', `${l.name} shut down cleanly. Battery runtime increased.`]; }})),
    {id:'generator', label:'Ask facilities to bring the hire generator (arrives in ~35 min)', cost:2, avail:o => o.genRequestedAt === null && o.minute < MAINS_AT, run:o => { o.genRequestedAt = o.minute; return ['good', `Generator requested. Expected at ${clock(o.minute + GENERATOR_DELAY)}.`]; }},
    {id:'shed-orders', label:'Shut down the customer orders database too', cost:2, avail:o => o.loads.orders && powerSource(o) === 'ups', run:o => { o.loads.orders = false; return ['warn', 'Runtime increases, but customers can no longer place orders. Operations suffer.']; }},
    {id:'restore-orders', label:'Restart the customer orders database', cost:3, avail:o => !o.loads.orders && powerSource(o) !== 'none', run:o => { o.loads.orders = true; return ['good', 'Orders are flowing again.']; }},
    {id:'integrity', label:'Run integrity checks, then restart services in order (network → database → apps)', cost:8, avail:o => o.flags.blackout && !o.flags.integrityChecked && ['mains', 'generator'].includes(powerSource(o)), run:o => { o.flags.integrityChecked = true; o.loads.core = true; o.loads.orders = true; return ['warn', 'Two corrupted tables repaired from logs. Services are back — recovered, but it cost time.']; }},
  ],
  mgmt:[
    {id:'fraud-verify', label:'Phone Helen Ward on her known mobile number to check the “urgent invoice”', cost:3, avail:o => !o.flags.fraudStopped && !o.flags.fraudPaid, run:o => { o.flags.fraudStopped = true; return ['good', 'Helen: “I sent no such email!” Finance cancels the payment. Verifying through a trusted channel just saved £8,400.']; }},
    {id:'fraud-block', label:'Block the lookalike domain and warn Finance about fake CEO emails', cost:3, avail:o => !o.flags.fraudBlocked && (intel('E13') || o.flags.fraudStopped), run:o => { o.flags.fraudBlocked = true; return ['good', 'Emails from @northstar-systems.example are now blocked, and Finance knows what to look for.']; }},
    {id:'fraud-pay', label:'Tell Finance to pay it — the CEO said it’s urgent', cost:1, avail:o => !o.flags.fraudStopped && !o.flags.fraudPaid, run:o => { o.flags.fraudPaid = true; return ['bad', '£8,400 sent. Nobody checked whether the email was really from Helen.']; }},
    {id:'fraud-recall', label:'Call the bank’s fraud line to stop the payment', cost:5, avail:o => o.flags.fraudPaid && !o.flags.fraudRecalled, run:o => { o.flags.fraudRecalled = true; return ['warn', 'The bank freezes the money before it leaves the receiving account. Recovered — just. It will still go in the incident review.']; }},
    {id:'cordon', label:'Cordon off the damaged cabinet and footpath; keep everyone away', cost:2, avail:o => !o.flags.cordon, run:o => { o.flags.cordon = true; return ['good', 'Area taped off; staff redirected to the main entrance.']; }},
    {id:'touch', label:'Send the caretaker to try resetting the cabinet', cost:3, avail:o => !o.flags.touchedCabinet && !o.flags.cordon, run:o => { o.flags.touchedCabinet = true; return ['bad', 'The caretaker gets a shock from exposed cables and is taken to first aid. Only qualified utility staff should go near it. Cordon the area now.']; }},
    {id:'ceo', label:'Brief Helen Ward (CEO): impact, actions taken, next update time', cost:3, avail:o => !o.flags.ceoBriefed, run:o => { o.flags.ceoBriefed = true; return ['good', 'Leadership informed. Customers will be told the orders system may be slow.']; }},
    {id:'evacuate', label:'Evacuate the whole building', cost:4, avail:o => !o.flags.evacuated, run:o => { o.flags.evacuated = true; return ['warn', 'Everyone is outside in the cold. There was no fire, and the business stops. Proportionate response matters.']; }},
  ],
};
const INITIAL_ALERTS = {
  reception:'A man in a hi-vis “Grid Repairs” jacket wants to get into the server room “to check the electrics”.',
  workspace:'FIN-07 (Finance) is showing pop-ups: “Your files are being secured — do not turn off.” The employee is worried.',
  it:'Three staff say someone from “IT” phoned asking for their password “to restore their account after the outage”. Others say the Wi-Fi keeps asking them to “log in again”.',
  server:'Mains power lost. UPS battery supplying everything. Non-critical systems are still drawing power.',
  mgmt:'The CEO wants an update. Staff are walking past the damaged cabinet outside. Finance has an “urgent” email from the CEO asking them to pay an £8,400 invoice before 10:00.',
};

/* ======================================================================
 * Local state
 * ==================================================================== */
const sim = {found:[], minuteA:0, site:null, reports:{}, office:freshOffice(), room:'server', partnerIntel:null, partnerResponse:null, order:[], bonus:{step:0, choices:{}, tested:[]}};
function save() { store.set('sim', sim); }
function restore() { const s = store.get('sim', null); if (s) Object.assign(sim, s); }
/** Intel known on this computer: A's own evidence, or decoded from A's code on B. */
function intel(id) { if (sim.found.includes(id)) return true; if (sim.partnerIntel === null) return false; return unpackBits(sim.partnerIntel, N_INTEL)[Number(id.slice(1)) - 1]; }

/* ======================================================================
 * A rendering
 * ==================================================================== */
function selectSite(id) {
  sim.site = id; save();
  document.querySelectorAll('[data-site]').forEach(n => n.classList.toggle('is-active', n.dataset.site === id));
  renderSite();
}
function renderSite() {
  const s = SITES[sim.site];
  if (!s) { fill('dt-site', el('p', {class:'ol-muted'}, 'Select a location on the map. Pulsing markers have active alerts — but not every clue is where you expect.')); return; }
  fill('dt-site', el('span', {class:'ol-kicker'}, s.status), el('h3', {}, s.name),
    s.actions.map(a => sim.found.includes(a.id)
      ? el('div', {class:'dt-evidence'}, el('b', {class:'tl-mono'}, a.id), el('span', {}, a.evidence))
      : el('button', {type:'button', class:'ol-btn dt-action', onclick:() => investigate(a)}, a.label, el('small', {}, `+${a.cost} min`))));
}
function investigate(a) {
  sim.found.push(a.id); sim.minuteA += a.cost; save();
  renderSite(); renderBoard(); renderReports(); renderIntelCode(); refreshCheckpoints();
  if (sim.minuteA >= 18 && !sim.escalated) { sim.escalated = true; save(); text('dt-a-alert', `${clock(sim.minuteA)} · Reception reports the “engineer” is getting impatient. Get your findings to the response team.`); }
}
function renderBoard() {
  text('dt-a-clock', clock(sim.minuteA));
  text('dt-a-count', `${sim.found.length}/${ALL_EVIDENCE.length}`);
  fill('dt-board', sim.found.length ? sim.found.map(id => { const e = ALL_EVIDENCE.find(x => x.id === id);
    return el('li', {}, el('b', {class:'tl-mono'}, id), e.evidence); }) : el('li', {class:'ol-muted'}, 'Evidence you collect appears here.'));
  document.querySelectorAll('[data-site]').forEach(n => { const done = SITES[n.dataset.site].actions.every(a => sim.found.includes(a.id)); n.classList.toggle('is-done', done); });
}
function reportForm(key) {
  const inc = INCIDENTS[key], saved = sim.reports[key] || {};
  const form = el('form', {class:'dt-report', onsubmit:e => { e.preventDefault(); submitReport(key, form); }},
    el('h4', {}, inc.title),
    el('label', {}, 'Incident type', el('select', {name:'type'}, Object.entries(TYPES).map(([v, l]) => el('option', {value:v, selected:saved.type === v}, l)))),
    el('fieldset', {}, el('legend', {}, 'Affected assets'), Object.entries(ASSETS).map(([v, l]) => el('label', {class:'dt-check'}, el('input', {type:'checkbox', name:'assets', value:v, checked:saved.assets?.includes(v)}), l))),
    el('div', {class:'dt-row'},
      el('label', {}, 'Impact', el('select', {name:'impact'}, ['Minor', 'Significant', 'Severe'].map(v => el('option', {selected:saved.impact === v}, v)))),
      el('label', {}, 'Urgency', el('select', {name:'urgency'}, ['Low', 'Medium', 'High', 'Critical'].map(v => el('option', {selected:(saved.urgency || 'Medium') === v}, v))))),
    el('fieldset', {}, el('legend', {}, 'Supporting evidence (from your board)'), sim.found.length ? sim.found.map(id => el('label', {class:'dt-check'}, el('input', {type:'checkbox', name:'ev', value:id, checked:saved.ev?.includes(id)}), id + ' · ' + ALL_EVIDENCE.find(x => x.id === id).evidence.slice(0, 60) + '…')) : el('p', {class:'ol-muted'}, 'Collect evidence on the map first.')),
    el('button', {type:'submit', class:'ol-btn ol-btn-primary'}, 'File report'),
    saved.feedback ? el('div', {class:`tl-review ${saved.ok ? 'good' : 'warn'}`}, saved.ok ? inc.good : el('ul', {}, saved.feedback.map(f => el('li', {}, f)))) : null);
  return form;
}
function submitReport(key, form) {
  const fd = new FormData(form), inc = INCIDENTS[key];
  const r = {type:fd.get('type'), assets:fd.getAll('assets'), impact:fd.get('impact'), urgency:fd.get('urgency'), ev:fd.getAll('ev')};
  const fb = [];
  if (r.type !== inc.type) fb.push('Duty manager: “Is that the right kind of incident? Read your evidence again.”');
  const missingAssets = inc.assets.filter(a => !r.assets.includes(a)), extra = r.assets.filter(a => !inc.assets.includes(a));
  if (missingAssets.length) fb.push(`“What else is affected? You haven’t listed: ${missingAssets.map(a => ASSETS[a]).join(', ')}.”`);
  if (extra.length) fb.push(`“Is ${extra.map(a => ASSETS[a]).join(', ')} really affected by this incident? Keep reports precise.”`);
  const support = inc.key.filter(k => r.ev.includes(k)).length;
  if (support < 2) fb.push('“What’s your evidence? I need at least two pieces that prove this — have you found them yet?”');
  if (!inc.urgency.includes(r.urgency)) fb.push('“Is the urgency right? Think about people’s safety and what could happen in the next hour.”');
  if (r.impact === 'Minor') fb.push('“Minor? The building is on battery and someone may be inside who shouldn’t be.”');
  sim.reports[key] = {...r, ok:fb.length === 0, feedback:fb}; save();
  renderReports(); renderIntelCode(); refreshCheckpoints();
}
function renderReports() { fill('dt-reports', reportForm('power'), reportForm('intrusion'), reportForm('wifi'), reportForm('fraud')); }
function renderIntelCode() {
  const box = $('dt-intel');
  if (!sim.found.length) { fill(box, el('p', {class:'ol-muted'}, 'Your intelligence code appears once you collect evidence.')); return; }
  const bits = Array.from({length:N_INTEL}, (_, i) => sim.found.includes('E' + (i + 1)));
  const key = ['E4', 'E5', 'E6', 'E7', 'E10', 'E13'].filter(id => sim.found.includes(id));
  fill(box, el('div', {class:'ol-handoff'}, el('h4', {}, 'Read this to Workstation B (Incident Response)'),
    key.length ? key.map(id => el('p', {}, '› ' + ALL_EVIDENCE.find(x => x.id === id).evidence)) : el('p', {}, 'You have not found the most useful facts yet — keep investigating.'),
    codeDisplay(encodeCode(CODES.intel.type, packBits(bits), CODES.intel.chars), 'INTEL CODE — B types this into “Field intelligence”'),
    el('p', {class:'ol-muted'}, 'Some of your facts unlock faster, safer options for the response team.')));
}

/* ======================================================================
 * B rendering
 * ==================================================================== */
function renderFloor() {
  const o = sim.office;
  fill('dt-floor', Object.entries(ROOMS).map(([id, r]) => {
    const pending = (ACTIONS[id] || []).some(a => a.avail(o)) && roomAlert(id);
    return el('button', {type:'button', class:`dt-room ${sim.room === id ? 'is-active' : ''} ${pending ? 'has-alert' : ''}`, style:{gridColumn:`${r.x + 1} / span ${r.w}`, gridRow:`${r.y + 1} / span ${r.h}`},
      'aria-pressed':String(sim.room === id), onclick:() => { sim.room = id; save(); renderFloor(); renderRoom(); }},
      el('span', {class:'dt-room-name'}, r.name), el('span', {class:'dt-room-state'}, roomState(id)));
  }));
}
function roomAlert(id) {
  const o = sim.office;
  return {reception:o.visitor === 'waiting', workspace:o.fin07 === 'infected' || (o.fin07 === 'spread' && !o.flags.fileServerContained), it:!o.flags.phishWarning || (o.flags.usb && !o.flags.usbRemoved) || !(o.flags.wifiBlocked || o.flags.wifiWarned) || (o.flags.wifiStolen && !o.flags.wifiReset),
    mgmt:!o.flags.cordon || (!o.flags.fraudStopped && !o.flags.fraudBlocked && !o.flags.fraudPaid) || (o.flags.fraudPaid && !o.flags.fraudRecalled),
    server:powerSource(o) === 'ups' && runtimeMin(o) < bridgeTarget(o) - o.minute || (o.flags.blackout && !o.flags.integrityChecked)}[id];
}
function roomState(id) {
  const o = sim.office;
  if (id === 'reception') return o.visitor === 'inside' && o.flags.usbRemoved ? 'Visitor gone · device removed' : {waiting:'Visitor waiting', inside:'Visitor INSIDE server room', escorted:'Visitor escorted', verified:'Visitor turned away', refused:'Visitor refused'}[o.visitor];
  if (id === 'workspace') return {infected:'FIN-07 infected', isolated:'FIN-07 isolated', off:'FIN-07 powered off', spread:'Malware spreading!'}[o.fin07];
  if (id === 'server') { const src = powerSource(o); return src === 'ups' ? `UPS · ${kwNow(o)} kW · ${runtimeMin(o)} min left` : src === 'none' ? 'NO POWER' : src === 'generator' ? 'On generator' : 'Mains restored'; }
  if (id === 'it') return o.flags.usb && !o.flags.usbRemoved ? 'Unknown USB on switch!' : o.flags.wifiStolen && !o.flags.wifiReset ? 'Passwords stolen!' : o.flags.phishWarning && (o.flags.wifiBlocked || o.flags.wifiWarned) ? 'Warnings sent' : 'Calls & Wi-Fi problems';
  return o.flags.fraudPaid && !o.flags.fraudRecalled ? '£8,400 paid to fraudsters!' : o.flags.cordon && (o.flags.fraudStopped || o.flags.fraudBlocked || o.flags.fraudRecalled) ? 'Under control' : 'Decisions waiting';
}
function renderRoom() {
  const o = sim.office, id = sim.room;
  const actions = (ACTIONS[id] || []).filter(a => a.avail(o));
  const intelNotes = [];
  if (id === 'reception' && intel('E4')) intelNotes.push('Field intel: the network operator says they sent NOBODY.');
  if (id === 'reception' && intel('E5')) intel('E5') && intelNotes.push('Field intel: D. Moss’s badge was used at 08:52 — she is on holiday.');
  if (id === 'server' && intel('E4')) intelNotes.push('Field intel: mains power back in about 90 minutes (at 10:17).');
  if (id === 'mgmt' && intel('E13')) intelNotes.push('Field intel: the “CEO” email comes from a lookalike domain (@northstar-systems.example).');
  if (id === 'it' && intel('E10')) intelNotes.push('Field intel: a fake “Northstar-Staff” Wi-Fi network is running from the café opposite.');
  fill('dt-room',
    el('span', {class:'ol-kicker'}, ROOMS[id].name.toUpperCase()),
    el('p', {class:'dt-room-alert'}, roomAlert(id) ? INITIAL_ALERTS[id] : 'Nothing urgent here right now.'),
    intelNotes.map(n => el('p', {class:'dt-intel-note'}, '📡 ' + n)),
    id === 'server' ? powerPanel() : null,
    actions.length ? el('div', {class:'dt-actions'}, actions.map(a => { const cost = typeof a.cost === 'function' ? a.cost(o) : a.cost;
      return el('button', {type:'button', class:'ol-btn dt-action', onclick:() => act(id, a)}, a.label, el('small', {}, `+${cost} min`)); })) : el('p', {class:'ol-muted'}, 'No actions available here at the moment.'),
    el('button', {type:'button', class:'ol-btn ol-btn-quiet', onclick:() => { advance(o, 5); note(o, 'Waited 5 minutes and monitored the situation.'); afterAction(); }}, 'Wait and monitor (+5 min)'));
}
function powerPanel() {
  const o = sim.office, src = powerSource(o), need = bridgeTarget(o) - o.minute, rt = runtimeMin(o);
  return el('div', {class:'dt-power'},
    el('div', {class:'dt-power-row'}, el('span', {}, 'Source'), el('b', {}, src.toUpperCase())),
    el('div', {class:'dt-power-row'}, el('span', {}, 'Load'), el('b', {}, `${kwNow(o)} kW`)),
    el('div', {class:'dt-power-row'}, el('span', {}, 'Battery'), el('b', {}, `${Math.round(o.battery / BATTERY_KWH * 100)}%`)),
    el('div', {class:`ol-meter ${o.battery / BATTERY_KWH < .3 ? 'bad' : o.battery / BATTERY_KWH < .6 ? 'warn' : ''}`}, el('i', {style:{width:`${o.battery / BATTERY_KWH * 100}%`}})),
    src === 'ups' ? el('p', {class:rt >= need ? 'dt-ok' : 'dt-bad'}, `Runtime at this load: ${rt} min. Power needed until ${o.genRequestedAt !== null ? 'generator arrives' : intel('E4') ? 'mains returns' : 'mains returns (time unknown — ask field intel)'}: ${o.genRequestedAt !== null || intel('E4') ? need + ' min' : '?'}.`) : null,
    el('ul', {class:'dt-loads'}, Object.entries(LOADS).map(([k, l]) => el('li', {class:o.loads[k] ? 'on' : 'off'}, el('span', {}, l.name + (l.critical ? ' ★' : '')), el('b', {}, o.loads[k] ? `${l.kw} kW` : 'off')))));
}
function act(room, a) {
  const o = sim.office; const cost = typeof a.cost === 'function' ? a.cost(o) : a.cost;
  const [kind, message] = a.run(o);
  note(o, `${ROOMS[room].name}: ${message}`, kind);
  advance(o, cost);
  afterAction();
}
function afterAction() { save(); renderFloor(); renderRoom(); renderOfficeStatus(); renderResponseCode(); refreshCheckpoints(); }
function renderOfficeStatus() {
  const o = sim.office, m = metrics(o);
  text('dt-b-clock', clock(o.minute));
  for (const [k, v] of Object.entries(m)) { text(`dt-m-${k}`, `${v}%`); const bar = $(`dt-mb-${k}`); bar.firstElementChild.style.width = v + '%'; bar.className = `ol-meter ${v < 40 ? 'bad' : v < 60 ? 'warn' : ''}`; }
  fill('dt-objectives', objectives(o).map(([, label, ok]) => el('li', {class:ok ? 'ok' : ''}, el('b', {}, ok ? '✓' : '○'), label)));
  fill('dt-log', o.log.length ? o.log.map(l => el('div', {class:l.kind}, el('time', {}, l.t), l.message)) : el('div', {}, el('time', {}, '08:47'), 'Response team assembled. Choose a room to start.'));
  const stable = isStable();
  text('dt-b-verdict', stable ? 'Situation stabilised. Every objective is met — you can still improve the meters.' : 'Not yet stable. Work through the objectives; mistakes can be recovered.');
  $('dt-b-verdict').dataset.kind = stable ? 'good' : 'warn';
}
function isStable() { const o = sim.office, m = metrics(o); return objectives(o).every(x => x[2]) && Object.values(m).every(v => v >= 50); }
function responseBits() { const o = sim.office; return [o.fin07 === 'isolated' || o.fin07 === 'off', ['refused', 'verified'].includes(o.visitor), Boolean(o.flags.badgeDisabled), o.genRequestedAt !== null, Boolean(o.flags.blackout), Boolean(o.flags.evidence), Boolean(o.flags.cordon), o.visitor === 'inside', o.fin07 === 'spread' || Boolean(o.flags.fileServerContained), Boolean(o.flags.wifiBlocked), Boolean(o.flags.wifiStolen), Boolean(o.flags.fraudStopped || o.flags.fraudBlocked), Boolean(o.flags.fraudPaid)]; }
const RESPONSE_TEXT = ['Infected PC contained', 'Visitor kept out', 'Copied badge disabled', 'Generator requested', 'UPS ran flat (blackout)', 'Evidence preserved', 'Danger area cordoned', 'Visitor was let in', 'Malware spread to file server', 'Fake Wi-Fi blocked', 'Passwords stolen via fake Wi-Fi', 'Fake CEO payment stopped', 'Fraudulent £8,400 payment sent'];
const N_RESPONSE = RESPONSE_TEXT.length;
function renderResponseCode() {
  const box = $('dt-response'); const o = sim.office;
  if (!o.log.length) { fill(box, el('p', {class:'ol-muted'}, 'Your response code appears once you take action.')); return; }
  fill(box, el('div', {class:'ol-handoff'}, el('h4', {}, 'Read this to Workstation A (Intelligence)'),
    el('p', {}, `Time now ${clock(o.minute)}. ${responseBits().map((b, i) => b ? RESPONSE_TEXT[i] : null).filter(Boolean).join(' · ') || 'No major actions yet.'}`),
    codeDisplay(encodeCode(CODES.response.type, packBits(responseBits()), CODES.response.chars), 'RESPONSE CODE — for the joint review')));
}

/* ======================================================================
 * Joint review
 * ==================================================================== */
const RECOVERY = {
  people:'Protect people: cordon the hazard, account for staff', contain:'Contain threats: isolate infected systems, remove the intruder, disable the badge',
  power:'Keep critical services powered (shed load, generator)', restore:'Restore mains and bring services back in order, with integrity checks', review:'Document evidence and hold the incident review',
};
const RIGHT_ORDER = ['people', 'contain', 'power', 'restore', 'review'];
function renderJoint() {
  const isA = zone.workstation === 'A';
  const mine = isA ? (sim.found.length ? encodeCode(CODES.intel.type, packBits(Array.from({length:N_INTEL}, (_, i) => sim.found.includes('E' + (i + 1)))), 3) : null)
    : (sim.office.log.length ? encodeCode(CODES.response.type, packBits(responseBits()), 3) : null);
  const want = isA ? CODES.response : CODES.intel;
  fill('dt-joint-codes', el('div', {class:'ol-grid2'},
    el('div', {class:'ol-panel'}, el('span', {class:'ol-kicker'}, 'THIS COMPUTER'), mine ? codeDisplay(mine, isA ? 'YOUR INTEL CODE' : 'YOUR RESPONSE CODE') : el('p', {class:'ol-muted'}, 'Do some of your own station’s work first.')),
    el('div', {class:'ol-panel'}, el('span', {class:'ol-kicker'}, 'YOUR PARTNER'), codeInput({...want, label:`Type the ${want.label} code your partner reads out`, otherTypes:OTHER,
      onAccept:v => { if (isA) sim.partnerResponse = v; else sim.partnerIntel = v; save(); renderJoint(); renderRoom(); }}))));
  const intelBits = isA ? Array.from({length:N_INTEL}, (_, i) => sim.found.includes('E' + (i + 1))) : (sim.partnerIntel !== null ? unpackBits(sim.partnerIntel, N_INTEL) : null);
  const respBits = isA ? (sim.partnerResponse !== null ? unpackBits(sim.partnerResponse, N_RESPONSE) : null) : (sim.office.log.length ? responseBits() : null);
  const items = [];
  if (intelBits) intelBits.forEach((b, i) => b && items.push(['A', ALL_EVIDENCE[i].evidence]));
  if (respBits) respBits.forEach((b, i) => b && items.push(['B', RESPONSE_TEXT[i]]));
  fill('dt-joint-timeline', items.length ? el('ul', {class:'dt-combined'}, items.map(([who, t]) => el('li', {class:'from-' + who}, el('b', {}, who === 'A' ? 'INTEL' : 'RESPONSE'), t)))
    : el('p', {class:'ol-muted'}, 'Swap codes to merge what each of you found and did.'));
  const gaps = [];
  if (intelBits && respBits) {
    if (intelBits[4] && !respBits[2]) gaps.push('Intel found the copied D. Moss badge, but it was never disabled.');
    if (respBits[7]) gaps.push('The visitor was let in — was the USB device found and removed?');
    if (respBits[4]) gaps.push('The UPS ran flat. Could earlier load-shedding or the generator have prevented it?');
    if (!intelBits[3]) gaps.push('Nobody confirmed with the network operator — the fake engineer could have been spotted sooner.');
    if (!respBits[5]) gaps.push('Evidence was not preserved — the police and the review will have less to work with.');
    if (intelBits[9] && !respBits[9]) gaps.push('Intel found the fake Wi-Fi network, but it was never blocked.');
    if (respBits[10]) gaps.push('Staff passwords were stolen through the fake Wi-Fi. How could intel and response have stopped it sooner?');
    if (!intelBits[9]) gaps.push('Nobody checked the café — the fake Wi-Fi was running in plain sight.');
    if (respBits[12]) gaps.push('Finance paid the fake CEO invoice. What single phone call would have stopped it?');
    if (intelBits[12] && !respBits[11]) gaps.push('Intel spotted the lookalike email domain, but it was never blocked or reported to Finance.');
  }
  fill('dt-joint-gaps', gaps.length ? el('ul', {}, gaps.map(g => el('li', {}, g))) : el('p', {class:'ol-muted'}, intelBits && respBits ? 'No major gaps found. Talk through what you would do differently anyway.' : 'Gaps appear once both codes are loaded.'));
  renderOrder();
}
function renderOrder() {
  const complete = sim.order.length === RIGHT_ORDER.length;
  $('dt-order-reset').hidden = complete || !sim.order.length;
  fill('dt-order-pick', complete ? el('p', {class:'ol-locked'}, '🔒 Recovery order locked in.') : Object.entries(RECOVERY).map(([k, l]) => el('button', {type:'button', class:'ol-btn dt-orderbtn', disabled:sim.order.includes(k), onclick:() => { sim.order.push(k); save(); renderOrder(); refreshCheckpoints(); }}, l)));
  fill('dt-order-list', sim.order.length ? sim.order.map((k, i) => el('li', {}, el('b', {}, i + 1), RECOVERY[k])) : el('li', {class:'ol-muted'}, 'Click the steps in the order your team agrees.'));
  const fb = $('dt-order-fb');
  if (sim.order.length < RIGHT_ORDER.length) { fb.textContent = ''; fb.removeAttribute('data-kind'); return; }
  const wrong = sim.order.findIndex((k, i) => k !== RIGHT_ORDER[i]);
  if (wrong < 0) { fb.textContent = 'Agreed recovery order: people first, then contain, keep critical services alive, restore carefully, and learn from it.'; fb.dataset.kind = 'good'; }
  else {
    const why = {people:'People’s safety always comes before systems.', contain:'Stop the threat spreading before you restore anything, or you restore onto a compromised network.',
      power:'Critical services need power before you can restore them in order.', restore:'Restore with integrity checks after containment.', review:'Documentation finishes the incident; it doesn’t come first.'}[RIGHT_ORDER[wrong]];
    fb.textContent = `Your order is locked in — but step ${wrong + 1} was in the wrong place. ${why} In a real incident, that mistake would have cost time. Discuss it before you sign off.`; fb.dataset.kind = 'warn';
  }
}

/* ======================================================================
 * Bonus: backup restore test
 * ==================================================================== */
const BACKUPS = [
  {id:'b1', name:'Tonight 02:00 (most recent)', verify:'FAILED — checksum mismatch on 312 files', test:'Restore fails: the files are unreadable. This backup cannot be trusted.'},
  {id:'b2', name:'Yesterday 02:00', verify:'Not yet tested', test:'Test restore to an isolated server: all files open, no malware found. One day of changes would be lost.'},
  {id:'b3', name:'Sunday 02:00', verify:'Tested OK last week', test:'Test restore works, but three days of changes would be lost.'},
];
function renderBonus() {
  const b = sim.bonus, c = b.choices;
  const out = {
    d1:{use:['warn', 'You restored the corrupted backup. Half the files won’t open and IT loses an hour finding out why. IT security now takes over the restore — and your choice is in the incident log.'],
      escalate:['good', 'Correct. A failed backup is an incident in itself — it might be linked to the malware. IT security investigates.'],
      delete:['warn', 'You deleted it. That destroyed evidence of when the malware arrived. IT security takes over — and your choice is in the incident log.']},
    d2:{b1:['warn', 'That backup failed its test. The restore crashes halfway and staff wait another 40 minutes for a second attempt.'],
      b2:['good', 'The newest backup that passed a test restore. You lose one day of work, not three.'],
      b3:['warn', 'It works, but you lose two extra days of work when a newer tested backup existed. Teams will have to redo it.']},
    d3:{nobody:['warn', 'Teams keep working without knowing yesterday’s changes are gone. On Thursday, an order is shipped twice.'],
      owners:['good', 'Recovery decision documented. That closes the secondary incident.'],
      everyone:['warn', 'Customers panic about a data loss that never affected them. The phones don’t stop ringing.']},
  };
  const result = key => c[key] ? [el('p', {class:`tl-review ${out[key][c[key]][0]}`}, out[key][c[key]][1]), el('p', {class:'ol-locked'}, '🔒 Final.')] : null;
  const steps = [
    el('div', {class:'dt-bstep'}, el('span', {class:'ol-kicker'}, 'DECISION 1 · FINAL'), el('h4', {}, 'Tonight’s backup failed verification. What now?'),
      choice('d1', [['use', 'Restore it anyway — it’s the newest'], ['escalate', 'Escalate to IT security and treat it as unusable until investigated'], ['delete', 'Delete it to tidy up']]), result('d1')),
    c.d1 ? el('div', {class:'dt-bstep'}, el('span', {class:'ol-kicker'}, 'DECISION 2 · FINAL'), el('h4', {}, 'Choose a recovery point — test before you trust'),
      el('ul', {class:'dt-backups'}, BACKUPS.map(x => el('li', {}, el('b', {}, x.name), el('span', {}, x.verify),
        b.tested.includes(x.id) ? el('em', {}, x.test) : el('button', {type:'button', class:'ol-btn ol-btn-quiet', disabled:Boolean(c.d2), onclick:() => { b.tested.push(x.id); save(); renderBonus(); }}, 'Run test restore')))),
      choice('d2', BACKUPS.map(x => [x.id, 'Use ' + x.name])), result('d2')) : null,
    c.d2 ? el('div', {class:'dt-bstep'}, el('span', {class:'ol-kicker'}, 'DECISION 3 · FINAL'), el('h4', {}, 'Who needs to know?'),
      choice('d3', [['nobody', 'Nobody — it’s an IT matter'], ['owners', 'Tell data owners which day of changes must be re-entered, and record the decision'], ['everyone', 'Email all customers immediately']]), result('d3')) : null,
    c.d3 ? el('div', {class:'dt-bstep dt-outcome'}, el('span', {class:'ol-kicker'}, 'OUTCOME'),
      el('h4', {}, ['d1', 'd2', 'd3'].filter(k => out[k][c[k]][0] === 'good').length === 3 ? 'Clean recovery. Every call was the right one.' : `${['d1', 'd2', 'd3'].filter(k => out[k][c[k]][0] === 'good').length} of 3 calls were the best option.`),
      el('p', {}, 'Your choices are locked in — this is the recovery your team delivered.')) : null,
  ];
  fill('dt-bonus', steps);
}
function choice(key, options) {
  const made = sim.bonus.choices[key];
  return el('div', {class:'tl-classify'}, options.map(([v, l]) => el('button', {type:'button', class:'ol-btn', 'aria-pressed':String(made === v), disabled:Boolean(made),
    onclick:() => { if (sim.bonus.choices[key]) return; sim.bonus.choices[key] = v; save(); renderBonus(); refreshCheckpoints(); }}, l)));
}

/* ======================================================================
 * Chrome, checkpoints, boot
 * ==================================================================== */
function banner(message, kind = 'info') { const b = $('dt-banner'); b.hidden = false; b.textContent = message; b.dataset.kind = kind; }
function selectTab(tab) {
  document.querySelectorAll('[data-tab]').forEach(b => b.setAttribute('aria-selected', String(b.dataset.tab === tab)));
  document.querySelectorAll('[data-panel]').forEach(p => { p.hidden = p.dataset.panel !== tab; });
  if (tab === 'joint') renderJoint();
  if (tab === 'bonus') renderBonus();
}
function renderStatus(state) {
  text('dt-group', state.groupName || 'Group'); text('dt-unit', `Unit ${state.workingUnit || '—'} · group progress is shared`);
  text('dt-station', `Workstation ${zone.workstation}`); text('dt-role', zone.workstation === 'A' ? 'Incident Intelligence' : 'Incident Response');
  text('dt-score', `${state.scores?.defend ?? 0} / 100`);
  const z = zone.zoneStatus();
  text('dt-progress', `${z.completed} of ${z.total} sign-offs passed`); text('dt-keytext', z.keyEarned ? 'RECOVERED' : 'LOCKED');
  for (const v of ['a', 'b', 'joint', 'bonus']) { const b = $(`dt-tab-${v}`); if (b) { b.textContent = zone.passed(v) ? '✓ signed off' : v === 'bonus' ? 'optional' : 'open'; b.classList.toggle('done', zone.passed(v)); } }
  document.querySelectorAll('.ol-you').forEach(n => { n.hidden = n.dataset.for !== zone.workstation; });
  $('dt-key').classList.toggle('is-earned', z.keyEarned); text('dt-key-glyph', z.keyEarned ? '✓' : '◇');
  text('dt-key-sub', z.keyEarned ? 'Saved to your group by the server.' : 'Unlocks when the server confirms A, B and joint sign-offs.');
}
const checks = {};
function refreshCheckpoints() { Object.values(checks).forEach(c => c.update()); }
function buildCheckpoints() {
  checks.a = checkpoint('dt-check-a', zone, 'a', {intro:'Send your intelligence assessment to Mission Control.',
    lockReason:() => Object.values(sim.reports).some(r => r.ok) ? null : 'File at least one incident report that the duty manager accepts (ideally both).'});
  checks.b = checkpoint('dt-check-b', zone, 'b', {intro:'Explain your response decisions to Mission Control.',
    lockReason:() => isStable() ? null : 'Stabilise the office first: meet all four objectives with every meter at 50% or more.'});
  checks.joint = checkpoint('dt-check-joint', zone, 'joint', {intro:'Final incident review. Agree every answer together.',
    lockReason:() => !(zone.passed('a') && zone.passed('b')) ? `Waiting for ${[!zone.passed('a') ? 'Workstation A' : null, !zone.passed('b') ? 'Workstation B' : null].filter(Boolean).join(' and ')} to pass their sign-off. Swap codes meanwhile.`
      : sim.order.length < RIGHT_ORDER.length ? 'Agree the recovery order together first.' : null});
  checks.bonus = checkpoint('dt-check-bonus', zone, 'bonus', {intro:'Optional: record your escalation decision.',
    lockReason:() => sim.bonus.choices.d3 ? null : 'Work through the backup decisions first.'});
}
function wire() {
  document.querySelectorAll('[data-tab]').forEach(b => b.addEventListener('click', () => selectTab(b.dataset.tab)));
  document.querySelectorAll('[data-site]').forEach(n => {
    n.addEventListener('click', () => selectSite(n.dataset.site));
    n.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectSite(n.dataset.site); } });
  });
  $('dt-order-reset').addEventListener('click', () => { sim.order = []; save(); renderOrder(); refreshCheckpoints(); });
  $('dt-reset-sim').addEventListener('click', staffReset);
  $('dt-intel-entry').append(codeInput({...CODES.intel, label:'Intel code from Workstation A', otherTypes:OTHER, onAccept:v => { sim.partnerIntel = v; save(); renderRoom(); renderFloor(); }}));
  hintPanel('dt-hints-a', ['Visit every marker — including the café across the road — and try more than one action at each. The car park and entrance clues only make sense together.',
    'Social engineering means tricking people rather than hacking computers. An emergency is the perfect cover for it.',
    'Compare the times: when did the van arrive, when was the crash, when was the badge used? Then ask the operator who they actually sent.']);
  hintPanel('dt-hints-b', ['Start in the server room: compare battery runtime with how long power is needed. Then visit every room with a pulsing alert.',
    'Priorities in an incident: people first, then stop the threat spreading, then keep critical services running.',
    'Shut down non-critical servers and request the generator early. Isolate (don’t ignore) the infected PC. Don’t let anyone unverified into the server room.']);
}
async function boot() {
  wire(); bindConnectionErrors(banner);
  document.addEventListener('ol:key', () => { toast('THREAT CONTAINED — recovery key saved for your group.', 'success', 'Recovery key earned'); banner('THREAT CONTAINED. The server has saved this recovery key for your group.', 'good'); });
  try { await zone.start(); }
  catch (error) {
    banner(describeError(error), 'bad');
    notLoggedIn($('dt-main'), error.status === 401 ? 'This computer is not signed in to a group. Sign in at the Mission Hub, then come back to Defend It.' : describeError(error));
    return;
  }
  store.bind({group:zone.state.group, workingUnit:zone.state.workingUnit, workstation:zone.workstation});
  restore();
  if (sim.site) selectSite(sim.site); else renderSite();
  renderBoard(); renderReports(); renderIntelCode(); renderFloor(); renderRoom(); renderOfficeStatus(); renderResponseCode();
  buildCheckpoints();
  setupGuides();
  zone.on(state => { renderStatus(state); refreshCheckpoints(); updateGuides(); });
  selectTab(zone.workstation === 'B' ? 'b' : 'a');
  $('dt-banner').hidden = true;
}
/* ---------- Guided steps, role lock and timed bonus ---------- */
const steppers = {};
function setupGuides() {
  applyRoleTabs(zone.workstation);
  for (const view of ['a', 'b', 'joint', 'bonus']) {
    const panel = document.querySelector(`[data-panel="${view}"]`);
    if (!panel || panel.getAttribute('aria-hidden') === 'true') continue;
    const last = panel.querySelectorAll(':scope > .ol-step').length - 1;
    steppers[view] = stepify(panel, {key:`defend-${zone.state.group}-${zone.state.workingUnit}-${view}`, isDone:i => i === last && zone.passed(view)});
  }
}
function updateGuides() {
  Object.values(steppers).forEach(s => s?.refresh());
  const status = applyBonus(zone, store, {onUnlock:() => { const b = $('dt-key-sub'); if (b) b.textContent = 'Saved to your group by the server. You finished early — the optional challenge tab is now open.'; }});
  if (status === 'late' && zone.zoneStatus().keyEarned) text('dt-key-sub', `Saved to your group by the server. Zone complete — well done. (The optional challenge only opens if you finish with ${BONUS_MIN_MINUTES_LEFT}+ minutes left.)`);
}
function staffReset() {
  if (window.prompt('Staff only: type RESET to clear the simulation on this computer. Official server results are not affected.') !== 'RESET') return;
  store.clear(); try { Object.keys(sessionStorage).filter(k => k.startsWith('ol2:step:')).forEach(k => sessionStorage.removeItem(k)); } catch {} location.reload();
}

boot();
