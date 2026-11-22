/** Train It / AI Security Lab — one zone, existing Operation Lockdown API.
 * Workstation A triages events; workstation B tunes a RULE-BASED detector.
 * Official answers are fetched from /api/tasks.php and graded in PHP.
 * The local simulations are practice only, not official scores or machine learning.
 */
import { getSession, getTeamState, getTasks, submitTask, completeZone } from '/assets/js/api.js';

const $ = id => document.getElementById(id);
const TASKS = {a:'train-labels', b:'train-rules', joint:'train-joint', bonus:'train-bonus'};
const TASK_CONTAINER = {a:'train-task-a', b:'train-task-b', joint:'train-task-joint', bonus:'train-task-bonus'};
const KEY = 'AI_DEFENCE_ACTIVATED';
let teamState = null;
let catalogue = new Map();
let currentPanel = 'a';
let lastSync = null;
let keyInFlight = false;
let initialized = false;
// Mutation responses are group snapshots. Preserve the station assigned by login.
function adoptTeamState(next) {
  teamState = {...teamState, ...next, workstation: next.workstation || teamState?.workstation};
}
const pending = new Set();
const clock = () => new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', second:'2-digit'});

function alertMessage(text, kind='info') {
  const el=$('train-alert');
  el.className=`train-alert train-alert-${kind}`;
  el.textContent=text;
}
function formatError(err) {
  if (err?.status===401) return 'Your group session has ended. Return to Mission Hub and sign in again.';
  if (err?.status===419) return 'The security token expired. Reload the page, then try again.';
  return err?.message||'An unexpected error occurred. Ask a facilitator for help.';
}
async function secureCall(fn) {
  try { return await fn(); }
  catch (e) {
    // A rejected token is safe to retry once after fetching a fresh token.
    if(e.status === 419) {await getSession();return fn();}
    throw e;
  }
}
const stationAllowed = zone => ['joint','bonus'].includes(zone) || teamState?.workstation === (zone==='a'?'A':'B');
function selectPanel(panel) {
  if (!['a','b','joint','bonus'].includes(panel)) return;
  currentPanel=panel;
  document.querySelectorAll('[data-panel]').forEach(el => el.hidden=el.dataset.panel!==panel);
  document.querySelectorAll('[data-view]').forEach(btn => {
    const active=btn.dataset.view===panel;
    btn.classList.toggle('is-active',active);
    btn.setAttribute('aria-pressed',String(active));
  });
}
function setNodeText(id,value) { const e=$(id); if(e) e.textContent=String(value); }
function taskDone(view) {return Boolean(teamState?.taskResults?.[TASKS[view]]?.passed);}
function refreshStateUI() {
  if (!teamState) return;
  setNodeText('train-team',teamState.groupName||teamState.team||'Unknown group');
  setNodeText('train-unit',`Working Unit ${teamState.workingUnit||'—'} · Shared team progress`);
  setNodeText('train-station',`Workstation ${teamState.workstation||'—'}`);
  setNodeText('train-score',`${teamState.scores?.train??0} / 100`);
  const z=teamState.zones?.train;
  setNodeText('train-progress',`${z?.completed??0} of ${z?.total??3} required tasks`);
  setNodeText('train-key',z?.keyEarned?'Recovered':'Locked');
  $('train-key-icon').textContent=z?.keyEarned?'✓':'◇';
  $('train-key-icon').classList.toggle('is-earned', Boolean(z?.keyEarned));
  for(const view of Object.keys(TASKS)) {
    const nav=$(`nav-${view}`);
    const done=taskDone(view);
    nav.textContent=done?'✓':'—';
    nav.classList.toggle('is-passed',done);
    const form=document.querySelector(`[data-task="${TASKS[view]}"]`);
    if(form) {
      form.classList.toggle('is-complete',done);
      const button=form.querySelector('button[type=submit]');
      if(button) button.textContent=done?'Improve your previous result':'Submit for server validation';
      const saved=form.querySelector('[data-saved-result]');
      const result=teamState.taskResults?.[TASKS[view]];
      if(saved) saved.textContent=result ? `Saved: ${result.score}% best · ${result.passed?'PASS':'Not yet passed'}` : 'Not yet submitted';
    }
  }
  const gate=$('train-joint-gate');
  if(taskDone('a')&&taskDone('b')) {gate.className='train-alert train-alert-success';gate.textContent='Both workstations have passed. Complete the joint review to recover the AI Defence key.';}
  else {gate.className='train-alert train-alert-info';gate.textContent=`Waiting for ${[!taskDone('a')?'Workstation A':null,!taskDone('b')?'Workstation B':null].filter(Boolean).join(' and ')} to pass its required assessment. You can review evidence while waiting.`;}
  setNodeText('train-sync-label',`Synchronised with mission control ${clock()}`);
  if(z?.keyEarned) alertMessage('AI DEFENCE ACTIVATED — recovery key saved to your group. Check the live leaderboard.','success');
}
async function fetchTeamState() {
  if (pending.size) return;
  const state=await getTeamState();
  teamState=state;
  refreshStateUI();
  if (state.zones?.train?.finished && !state.zones.train.keyEarned && !keyInFlight) {
    keyInFlight=true;
    try {
      const awarded=await secureCall(()=>completeZone('train'));
      adoptTeamState(awarded);
      refreshStateUI();
    } catch(e) {alertMessage('Tasks passed, but the recovery key could not be saved: '+formatError(e),'error');}
    finally {keyInFlight=false;}
  }
}

// Practice event triage. These labels never affect the official score.
const cases=[
  {id:'E-101',name:'Office workstation',time:'09:12',fail:0,location:'Known office',device:'Known',expected:'normal',reason:'Known device and normal location; no signs of unusual activity.'},
  {id:'E-102',name:'Payroll login',time:'02:30',fail:12,location:'Unfamiliar country',device:'New',expected:'investigate',reason:'Many failed attempts, an unfamiliar location and a new device justify investigation.'},
  {id:'E-103',name:'Field engineer abroad',time:'13:10',fail:0,location:'Travel approved',device:'Known',expected:'normal',reason:'Approved travel with a known device is not automatically malicious.'},
  {id:'E-104',name:'Finance access',time:'03:04',fail:1,location:'Unfamiliar country',device:'New',expected:'investigate',reason:'Anomalous location and new device make this suspicious even without many failures.'},
  {id:'E-105',name:'Morning login',time:'08:51',fail:2,location:'Known office',device:'Known',expected:'normal',reason:'A couple of mistyped passwords can be ordinary activity.'},
  {id:'E-106',name:'Administrator account',time:'19:25',fail:9,location:'Known office',device:'Known',expected:'investigate',reason:'Repeated failed access to a privileged account deserves verification.'},
  {id:'E-107',name:'New starter laptop',time:'10:17',fail:0,location:'Known office',device:'New',expected:'normal',reason:'A new device can be legitimate after enrolment; verify rather than assume compromise.'},
  {id:'E-108',name:'Shared-drive access',time:'01:48',fail:3,location:'Unfamiliar country',device:'New',expected:'investigate',reason:'Multiple unusual signals together should trigger investigation.'},
];
const caseAnswers=new Map();
function makeElt(tag, cls='', text='') {const e=document.createElement(tag);if(cls)e.className=cls;if(text)e.textContent=text;return e;}
function renderCases() {
  const list=$('train-case-inbox'); list.replaceChildren();
  for(const c of cases) {
    const card=makeElt('article','train-case');
    const top=makeElt('div','train-case-head');
    const name=makeElt('div');name.append(makeElt('span','train-case-id',c.id),makeElt('strong','',c.name));
    top.append(name,makeElt('span','train-case-time',c.time));
    const signals=makeElt('div','train-case-signals');
    for(const [k,v] of [['Failed attempts',String(c.fail)],['Location',c.location],['Device',c.device]]) {
      const chip=makeElt('span','');chip.append(makeElt('b','',`${k}: `),document.createTextNode(v));signals.append(chip);
    }
    const actions=makeElt('div','train-case-actions');
    for(const [option,label] of [['investigate','Flag for review'],['normal','Likely normal']]) {
      const b=makeElt('button','train-mini-button',label); b.type='button';
      b.addEventListener('click',()=>{caseAnswers.set(c.id,option);renderCases();});
      if(caseAnswers.get(c.id)===option) b.classList.add('is-selected');
      actions.append(b);
    }
    card.append(top,signals,actions);
    if(caseAnswers.has(c.id)){
      const chosen=caseAnswers.get(c.id); const correct=chosen===c.expected;
      const feedback=makeElt('div',`train-case-feedback ${correct?'good':'caution'}`,`${correct?'Good judgement. ':'Review again. '}${c.reason}`);
      card.append(feedback);
    }
    list.append(card);
  }
  const complete=caseAnswers.size;
  const correct=[...cases].filter(c=>caseAnswers.get(c.id)===c.expected).length;
  setNodeText('train-case-count',`${complete} / ${cases.length}`);
  setNodeText('train-case-accuracy',complete?`${Math.round(correct/complete*100)}% practice accuracy`:'—');
}

const dataset=[
  {name:'Morning staff',fails:0,geo:false,device:false,late:false,threat:false},
  {name:'Unknown overseas login',fails:12,geo:true,device:true,late:true,threat:true},
  {name:'Approved traveller',fails:0,geo:true,device:false,late:false,threat:false},
  {name:'New-device takeover',fails:1,geo:false,device:true,late:true,threat:true},
  {name:'Mistyped password',fails:2,geo:false,device:false,late:false,threat:false},
  {name:'Password spraying',fails:8,geo:false,device:false,late:false,threat:true},
  {name:'New starter laptop',fails:0,geo:false,device:true,late:false,threat:false},
  {name:'Remote access attempt',fails:0,geo:true,device:true,late:true,threat:true},
  {name:'Overnight maintenance',fails:0,geo:false,device:false,late:true,threat:false},
  {name:'Routine work from home',fails:0,geo:false,device:false,late:false,threat:false},
  {name:'Compromised old account',fails:3,geo:false,device:true,late:true,threat:true},
  {name:'Late approved support',fails:1,geo:false,device:false,late:true,threat:false},
];
function runRuleSimulation() {
  const threshold=Number($('rule-fail').value);
  const geo=$('rule-geo').checked, device=$('rule-device').checked, late=$('rule-time').checked;
  setNodeText('rule-fail-value',threshold+'+');
  let hits=0, alarms=0, matches=0, threats=0;
  const table=$('train-samples');table.replaceChildren();
  for(const entry of dataset){
    const flagged=entry.fails>=threshold || (geo&&entry.geo) || (device&&entry.device) || (late&&entry.late);
    if(entry.threat) threats++;
    if(entry.threat&&flagged) hits++;
    if(!entry.threat&&flagged) alarms++;
    if(entry.threat===flagged) matches++;
    const tr=makeElt('tr');
    tr.append(makeElt('td','',entry.name),makeElt('td','',String(entry.fails)));
    const signal=makeElt('td','');signal.textContent=[entry.geo?'New region':null,entry.device?'New device':null,entry.late?'Late hour':null].filter(Boolean).join(' · ')||'Routine';
    tr.append(signal,makeElt('td',flagged?'train-mark train-mark-flag':'train-mark train-mark-safe',flagged?'Investigate':'Allow'));
    table.append(tr);
  }
  setNodeText('sim-detected',`${hits}/${threats}`);
  setNodeText('sim-false',String(alarms));
  setNodeText('sim-accuracy',`${Math.round(matches/dataset.length*100)}%`);
  const status=$('train-rule-status');
  const good=hits>=4&&alarms<=2;
  status.className=`train-rule-status ${good?'good':'caution'}`;
  status.textContent=good?'Strong trade-off: at least 4 of 5 suspicious events found, with no more than 2 false alarms. Discuss the remaining missed event.':`Tune your rules: currently ${hits}/5 suspicious events found and ${alarms} false alarms. Aim for at least 4 threats detected and no more than 2 false alarms.`;
}

function buildTask(view,spec) {
  const slot=$(TASK_CONTAINER[view]); slot.replaceChildren();
  const form=makeElt('form','train-task-form');form.dataset.task=TASKS[view];
  const status=makeElt('p','train-task-status','Not yet submitted');status.dataset.savedResult='';
  const intro=makeElt('div','train-assessment-head');
  intro.append(makeElt('strong','',spec.title),makeElt('span','train-chip',`${spec.passPercent}% to pass · ${spec.questions.length} questions`));
  form.append(intro,status);
  for(let i=0;i<spec.questions.length;i++) {
    const q=spec.questions[i];
    const field=makeElt('fieldset','train-question');
    const legend=makeElt('legend','',`${i+1}. ${q.text}`);field.append(legend);
    for(const [key,label] of Object.entries(q.options)) {
      const opt=makeElt('label','train-answer');
      const input=document.createElement('input');input.type='radio';input.name=q.id;input.value=key;input.required=true;
      opt.append(input,makeElt('span','',label));field.append(opt);
    }
    form.append(field);
  }
  const controls=makeElt('div','train-form-footer');
  const button=makeElt('button','action','Submit for server validation');button.type='submit';
  const note=makeElt('small','',view==='a'?'Station A submission only':view==='b'?'Station B submission only':'Either workstation can submit');
  controls.append(button,note);
  const feedback=makeElt('div','train-feedback');feedback.setAttribute('role','status');feedback.setAttribute('aria-live','polite');
  form.append(controls,feedback);
  form.addEventListener('submit',async ev=>{
    ev.preventDefault();
    if(!stationAllowed(view)) {setFeedback(feedback,'error',`This assessment belongs to Workstation ${view==='a'?'A':'B'}. Use that computer to submit.`);return;}
    if(view==='joint'&&(!taskDone('a')||!taskDone('b'))) {setFeedback(feedback,'error','Both stations must pass their required tasks before the joint submission.');return;}
    const answers={};
    for(const q of spec.questions){const selected=form.querySelector(`input[name="${CSS.escape(q.id)}"]:checked`);if(!selected){setFeedback(feedback,'error','Choose one answer for each question.');return;}answers[q.id]=selected.value;}
    button.disabled=true;button.textContent='Submitting to mission control…';pending.add(TASKS[view]);
    try {
      const res=await secureCall(()=>submitTask('train',TASKS[view],{answers}));
      adoptTeamState(res.teamState);
      refreshStateUI();
      setFeedback(feedback,res.passed?'success':'error',`${res.correct}/${res.total} correct · ${res.score}% · ${res.passed?'PASS':'TRY AGAIN'}. ${res.message||''} ${res.scored?'':'Practice only: no additional points.'}`);
      alertMessage(`${spec.title}: ${res.passed?'passed':'review needed'} (${res.score}%). Your result was saved by the server.`,res.passed?'success':'info');
      if(res.teamState?.zones?.train?.finished&&!res.teamState.zones.train.keyEarned){
        try{const final=await secureCall(()=>completeZone('train'));adoptTeamState(final);refreshStateUI();}
        catch(e){alertMessage('All required tasks passed; recovery key pending. '+formatError(e),'error');}
      }
    }catch(e){setFeedback(feedback,'error','Result not saved. '+formatError(e));alertMessage('Submission failed: '+formatError(e),'error');}
    finally {pending.delete(TASKS[view]);button.disabled=false;button.textContent='Submit / improve result';}
  });
  slot.append(form);
}
function setFeedback(element,kind,text){element.textContent=text;element.className=`train-feedback ${kind}`;}
async function init() {
  if(initialized) return;initialized=true;
  document.querySelectorAll('[data-view]').forEach(button=>button.addEventListener('click',()=>selectPanel(button.dataset.view)));
  $('train-reset-cases').addEventListener('click',()=>{caseAnswers.clear();renderCases();});
  for(const id of ['rule-fail','rule-geo','rule-device','rule-time']) $(id).addEventListener('input',runRuleSimulation);
  renderCases();runRuleSimulation();
  try {
    await getSession();
    const [state,result]=await Promise.all([getTeamState(),getTasks('train')]);
    teamState=state;
    catalogue=new Map(result.tasks.map(task=>[task.taskId,task]));
    for(const view of Object.keys(TASKS)){
      const task=catalogue.get(TASKS[view]);
      if(task) buildTask(view,task);
      else $(TASK_CONTAINER[view]).textContent='This task has not been installed on the server. Ask a facilitator to run the database seed script.';
    }
    refreshStateUI();
    selectPanel(teamState.workstation==='B'?'b':'a');
    alertMessage(`Connected to ${teamState.groupName}. Workstation ${teamState.workstation} is ready. Your official results will be saved to the shared database.`,'success');
    await fetchTeamState();
    lastSync=setInterval(()=>fetchTeamState().catch(e=>{if(e.status!==401) setNodeText('train-sync-label','Connection interrupted · trying again');}),6500);
  }catch(e){
    alertMessage(`${formatError(e)} Visit the Mission Hub to log in.`, 'error');
    const box=makeElt('div','train-not-logged');
    const link=makeElt('a','action','Return to Mission Hub →');link.href='/';box.append(link);
    $('train-task-a').append(box);
  }
}
window.addEventListener('pagehide',()=>{if(lastSync)clearInterval(lastSync);});
init();
