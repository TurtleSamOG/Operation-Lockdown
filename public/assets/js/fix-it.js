/** Operation Lockdown 2.0 / Fix It
 * Safe simulation only. No code execution, no real vulnerable application.
 * Official graded tasks use the shared PHP scoring API and its server-side answer key.
 * Workstation A investigates; B patches; either may submit the joint assessment.
 */
import {getSession, getTeamState, getTasks, submitTask, completeZone} from '/assets/js/api.js';

const $ = id => document.getElementById(id);
const taskIds = {a:'fix-investigate', b:'fix-patch', joint:'fix-joint', bonus:'fix-bonus'};
const catalog = new Map();
const seen = new Set();
const logs = [];
let identity = null;
let state = null;
let activeScreen = 'a';
let busy = false;
let keyPending = false;
let lastKeyTry = 0;
let portal = {role:'guest',section:'profiles'};
const now = () => new Date().toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
const passed = view => Boolean(state?.taskResults?.[taskIds[view]]?.passed);
const stationOk = view => view==='joint'||view==='bonus'||identity?.workstation===(view==='a'?'A':'B');
const msgOf = err => err?.status===401 ? 'Please return to the Mission Hub and sign in again.' : err?.status===403 ? err.message : err?.status===419 ? 'Your security token expired. Reload the page or retry.' : (err?.message || 'The request did not finish. Ask a facilitator to check the connection.');
const write = (id,text) => {const el=$(id);if(el)el.textContent=String(text);};
function log(message,kind='info'){
  const line = document.createElement('span');line.textContent=`${now()} · ${message}`;line.className=kind;
  const board=$('fix-log');board.prepend(line);
  while(board.childElementCount>7) board.lastElementChild.remove();
}
function notice(message,kind='info'){
  const target=$('fix-notice');target.textContent=message;target.className=`fix-notice ${kind}`;
  if(kind==='bad')log(message,'error');
}
function taskMessage(view,message,kind='info'){
  const box=$(`fix-result-${view}`);if(!box)return;
  box.textContent=message;box.className=`fix-message ${kind}`;
}
async function safeMutation(action){
  try{return await action();}
  catch(error){
    if(error?.status!==419)throw error;
    await getSession();
    return action(); // New CSRF token, same official API; retry once only.
  }
}
function selectScreen(name){
  if(!['a','b','joint','bonus'].includes(name))return;
  activeScreen=name;
  document.querySelectorAll('[data-screen-panel]').forEach(panel=>panel.hidden=panel.dataset.screenPanel!==name);
  document.querySelectorAll('[data-screen]').forEach(button=>{
    const active=button.dataset.screen===name;button.classList.toggle('active',active);
    button.setAttribute('aria-pressed',String(active));
  });
}
function badgeState(view){
  const p=passed(view);
  const nav=$(`fix-nav-${view}`);if(nav)nav.textContent=p?'✓':'—';
  if(view!=='bonus'){
    const stage=$(`fix-stage-${view}`);if(stage)stage.classList.toggle('done',p);
    write(`fix-progress-${view}`,p?'Passed':view==='joint'&&!(passed('a')&&passed('b'))?'Waiting for both':'In progress');
  }
  const form=document.querySelector(`[data-task-id="${taskIds[view]}"]`);
  if(form){
    const button=form.querySelector('button[type="submit"]');
    const allowed=stationOk(view)&&(view!=='joint'||(passed('a')&&passed('b')))&&(view!=='bonus'||passed('joint'));
    if(button){button.disabled=!allowed||busy;button.textContent=p?'Improve saved result':`Submit ${view==='bonus'?'bonus':'assessment'} to Mission Control`;}
    const status=form.querySelector('.fix-form-status');
    if(status){const saved=state?.taskResults?.[taskIds[view]];
      status.textContent=saved ? `Best result: ${saved.score}% · ${saved.passed?'PASS':'Not passed'} · ${saved.attempts} attempt(s)` : view==='joint'&&!allowed?'Locked until both workstations pass':!stationOk(view)?`This assessment must be submitted from Workstation ${view.toUpperCase()}.`:'Not yet submitted';
    }
  }
}
function showState(){
  if(!state)return;
  write('fix-group',state.groupName||identity?.groupName||'Team');
  write('fix-unit',`Working Unit ${state.workingUnit||identity?.workingUnit||'—'} · shared results`);
  write('fix-station',identity?.workstation ? `STATION ${identity.workstation}`:'—');
  write('fix-score',`${state.scores?.fix??0} / 100`);
  const zone=state.zones?.fix;
  write('fix-completed',`${zone?.completed??0} / ${zone?.total??3} required tasks`);
  write('fix-key',zone?.keyEarned?'RECOVERED':'LOCKED');
  for(const view of Object.keys(taskIds))badgeState(view);
  write('fix-gate-a',passed('a')?'Passed':'Waiting');
  write('fix-gate-b',passed('b')?'Passed':'Waiting');
  write('fix-gate-joint',passed('joint')?'Passed':'Locked');
  for(const [view,id] of [['a','fix-gate-a'],['b','fix-gate-b'],['joint','fix-gate-joint']]) $(id).classList.toggle('ready',passed(view));
  const gate=$('fix-joint-gate');
  if(passed('a')&&passed('b')){gate.textContent='Both teams have passed. Either workstation may now complete joint verification.';gate.className='fix-notice fix-notice-embedded good';}
  else {gate.textContent=`Waiting for ${[!passed('a')?'Station A':null,!passed('b')?'Station B':null].filter(Boolean).join(' and ')}. Continue work independently or review the evidence together.`;gate.className='fix-notice fix-notice-embedded';}
  $('fix-reward').hidden=!zone?.keyEarned;
  const report=$('fix-b-report');
  if(passed('a')){
    report.className='fix-report ready';
    report.innerHTML='<strong>✓ Investigation report received</strong><p>Station A confirmed the portal has missing permission checks, unsafe error reporting and an unauthorised-access incident. Verify each repair in your local simulation.</p>';
  }else{report.className='fix-report';report.innerHTML='<strong>Waiting for investigator report</strong><p>Station A is investigating independently. Continue preparing code changes while waiting.</p>';}
  write('fix-sync',`Latest group update ${now()} · results are shared across workstations.`);
  if(zone?.keyEarned){$('fix-key').style.color='#9affd2';}
}
async function maybeAwardKey(){
  if(!state?.zones?.fix?.finished || state.zones.fix.keyEarned || keyPending)return;
  if(Date.now()-lastKeyTry < 15000)return;
  lastKeyTry=Date.now(); keyPending=true;
  try{
    const response=await safeMutation(()=>completeZone('fix'));
    state=response;
    showState();notice('PORTAL SECURED. Your recovery key has been saved to the shared group leaderboard.','good');
    log('PORTAL SECURED recovery key awarded','success');
  }catch(e){notice('All tasks passed, but recovery key could not be saved: '+msgOf(e),'bad');}
  finally{keyPending=false;}
}
async function sync(){
  if(busy)return;
  try{
    const refreshed=await getTeamState();const previous=state?.zones?.fix?.completed??0;
    state=refreshed;showState();
    if((refreshed.zones?.fix?.completed??0)>previous)log('Shared group task progress updated','success');
    await maybeAwardKey();
  }catch(e){notice('Unable to synchronise team progress: '+msgOf(e),'bad');}
}
function make(tag,cls,text){const node=document.createElement(tag);if(cls)node.className=cls;if(text!==undefined)node.textContent=text;return node;}
function makeQuestionForm(view){
  const task=catalog.get(taskIds[view]);const target=$(`fix-task-${view}`);target.replaceChildren();
  if(!task){target.append(make('p','fix-muted','The required server task was not found. Check database/seed.php and task-catalog.php.'));return;}
  const form=make('form','fix-assessment');form.dataset.taskId=task.taskId;
  for(const [ix,q] of task.questions.entries()){
    const field=make('fieldset');field.dataset.questionId=q.id;
    field.append(make('legend','',`${ix+1}. ${q.text}`));
    const options=make('div','fix-options');
    for(const [value,label] of Object.entries(q.options)){
      const option=make('label','fix-option');const input=make('input');input.type='radio';input.name=`${task.taskId}-${q.id}`;input.value=value;
      option.append(input,make('span','',label)); options.append(option);
      if(view==='b')input.addEventListener('change',renderCode);
    }
    field.append(options);form.append(field);
  }
  const message=make('div','fix-form-status',`Required score: ${task.passPercent}% · ${view==='a'?'Station A':view==='b'?'Station B':'Either workstation'}`);
  const button=make('button','fix-btn','Submit assessment');button.type='submit';
  form.append(message,button);target.append(form);
  form.addEventListener('submit',event=>{event.preventDefault();submitOfficial(view,form);});
}
function formAnswers(form){
  const answers={};
  form.querySelectorAll('fieldset[data-question-id]').forEach(field=>{
    const picked=field.querySelector('input[type="radio"]:checked');if(picked)answers[field.dataset.questionId]=picked.value;
  });
  return answers;
}
async function submitOfficial(view,form){
  if(busy)return;
  if(!stationOk(view)){taskMessage(view,`This task belongs on Workstation ${view.toUpperCase()}. Switch to the correct workstation.`, 'bad');return;}
  if(view==='a'&&seen.size<3){taskMessage(view,'Inspect and record evidence from all three portal areas before submitting.','warn');return;}
  if(view==='joint'&&!(passed('a')&&passed('b'))){taskMessage(view,'Wait until both workstations have passed their tasks.','warn');return;}
  if(view==='bonus'&&!passed('joint')){taskMessage(view,'Complete joint verification before the optional bonus.','warn');return;}
  const answers=formAnswers(form);const total=catalog.get(taskIds[view])?.questions?.length||0;
  if(Object.keys(answers).length!==total){taskMessage(view,'Select an answer for every question before submitting.','warn');return;}
  busy=true; showState();taskMessage(view,'Submitting answers for server validation…');
  try{
    const response=await safeMutation(()=>submitTask('fix',taskIds[view],{answers}));
    state=response.teamState;
    const kind=response.passed?'good':'warn';
    const scoreText=`${response.correct}/${response.total} correct · ${response.score}% · ${response.passed?'PASS':'REVIEW'}${response.scored?' · Scored attempt':' · Practice attempt'}`;
    taskMessage(view,scoreText,kind);
    notice(response.passed?'Official assessment passed. Your group score has been updated.':'Submission saved. Review the result, discuss the options and try again.',kind);
    log(`${view.toUpperCase()} assessment saved: ${response.score}% ${response.passed?'PASS':'REVIEW'}`,response.passed?'success':'info');
    showState();await maybeAwardKey();
  }catch(e){taskMessage(view,'Submission failed: '+msgOf(e),'bad');notice('Result was not saved: '+msgOf(e),'bad');}
  finally{busy=false;showState();}
}
const evidence={
  profiles:{title:'Private profile information exposed',body:'As a guest you can see an internal staff desk location and extension. A public directory should not reveal private details without permission.'},
  errors:{title:'Unsafe diagnostic error shown',body:'The simulated support form displays an internal path and debugging details. Users should receive a safe error without internal diagnostics.'},
  access:{title:'Unauthorised access to staff tools',body:'The mock staff dashboard displays protected management tools to a guest. Reproduce the finding and report the missing access control.'}
};
function renderPortal(){
  document.querySelectorAll('[data-role]').forEach(button=>{const yes=button.dataset.role===portal.role;button.classList.toggle('active',yes);button.setAttribute('aria-pressed',String(yes));});
  document.querySelectorAll('[data-portal]').forEach(button=>{const yes=button.dataset.portal===portal.section;button.classList.toggle('active',yes);button.setAttribute('aria-pressed',String(yes));});
  write('fix-visitor-status',portal.role==='guest'?'GUEST SESSION':'EMPLOYEE SESSION');
  const body=$('fix-portal-body');body.replaceChildren();
  const role=portal.role;const section=portal.section;
  if(section==='profiles'){
    body.append(make('h4','','Employee directory'),make('p','',role==='guest'?'Public visitor preview of a fictional employee record.':'Signed-in employee preview.'));
    const card=make('div','fix-portal-mini');const person=make('div');person.append(make('strong','','Jordan Carter'),make('p','','Support Team · Northstar Office'));
    const privateData=make('span','',role==='guest'?'Desk 4B · ext. 204 (EXPOSED)':'Desk 4B · ext. 204 (authorised view)');card.append(person,privateData);body.append(card);
    body.append(make('p',role==='guest'?'fix-portal-alert':'fix-portal-success',role==='guest'?'⚠ Private staff information is visible to a guest.':'Private details shown to a signed-in employee.'));
  }else if(section==='errors'){
    body.append(make('h4','','Request support'),make('p','','A deliberately malformed request triggers a diagnostic message in this fake portal.'));
    body.append(make('div','fix-portal-error','SimulationError: ProfileService failed at /srv/demo/portal/employee.php:42\nDebug mode enabled: internal implementation details disclosed.'));
    body.append(make('p','fix-portal-alert','⚠ A public-facing error response is leaking internal information.'));
  }else{
    body.append(make('h4','','Staff-only dashboard'),make('p','','Restricted internal tools used by the fictional helpdesk.'));
    const card=make('div','fix-portal-mini');const content=make('div');content.append(make('strong','','Manage staff access'),make('p','','Reset requests / permissions / staff tools'));card.append(content,make('span','',role==='guest'?'VISIBLE TO GUEST':'VISIBLE TO STAFF'));body.append(card);
    body.append(make('p',role==='guest'?'fix-portal-alert':'fix-portal-success',role==='guest'?'⚠ The guest session can see controls intended for authorised employees.':'An authenticated user may see authorised controls.'));
  }
}
function recordEvidence(){
  const id=portal.section;if(!seen.has(id)){seen.add(id);log(`Evidence recorded: ${evidence[id].title}`);}
  const box=$('fix-evidence');box.replaceChildren();
  for(const section of ['profiles','errors','access']){
    if(!seen.has(section))continue;
    const item=make('div','fix-evidence-item');item.append(make('strong','',evidence[section].title),make('p','',evidence[section].body));box.append(item);
  }
  write('fix-evidence-count',`${seen.size} of 3 areas inspected`);
  if(seen.size===3){notice('Investigation complete. File your assessment from Station A when ready.','good');}
}
function patchAnswers(){
  const form=document.querySelector(`[data-task-id="${taskIds.b}"]`);
  return form ? formAnswers(form) : {};
}
function renderCode(){
  const a=patchAnswers();
  const access=a.p1==='both'?'isLoggedIn && hasProfilePermission':a.p1==='name'?'userName !== ""':'true /* INSECURE DEFAULT */';
  const storage=a.p2==='hash'?'password_hash(password)':'password /* WARNING: NOT HASHED */';
  const test=a.p3==='guest'?'testGuestDenied(); testAuthorisedStaffAllowed();':'checkBackgroundColour();';
  $('fix-code-preview').textContent=[
    '// Mock code preview — nothing here is executed',
    `if (${access}) {`,
    '  showPrivateEmployeeProfile();',
    '}',
    '',
    `const storedPassword = ${storage};`,
    '',
    `// Regression test plan`,
    test,
  ].join('\n');
}
function runSimulatedTests(){
  const a=patchAnswers();
  const checks=[
    ['Guest cannot view private profiles',a.p1==='both'],
    ['Authorised employee retains access',a.p1==='both'],
    ['Passwords are not stored as plain text',a.p2==='hash'],
    ['Access fix has appropriate regression tests',a.p3==='guest'],
  ];
  const box=$('fix-test-results');box.replaceChildren();
  const count=checks.filter(x=>x[1]).length;
  for(const [name,pass] of checks){
    const row=make('div',`fix-test-row ${pass?'passed':'failed'}`);row.append(make('span','',name),make('strong','',pass?'PASS':'FAIL'));box.append(row);
  }
  log(`Mock patch tests: ${count} of ${checks.length} passing`,count===4?'success':'info');
  notice(`${count}/${checks.length} simulated checks passed. These checks are practice only; submit to Mission Control to save your score.`,count===4?'good':'warn');
}
async function initialize(){
  for(const button of document.querySelectorAll('[data-screen]'))button.addEventListener('click',()=>selectScreen(button.dataset.screen));
  for(const button of document.querySelectorAll('[data-role]'))button.addEventListener('click',()=>{portal.role=button.dataset.role;renderPortal();});
  for(const button of document.querySelectorAll('[data-portal]'))button.addEventListener('click',()=>{portal.section=button.dataset.portal;renderPortal();});
  $('fix-inspect').addEventListener('click',recordEvidence);
  $('fix-run-tests').addEventListener('click',runSimulatedTests);
  renderPortal();renderCode();
  try{
    await getSession();
    const who=await fetch('/fix/whoami.php',{credentials:'same-origin',cache:'no-store'});
    const result=await who.json();
    if(!who.ok||!result.ok){const e=new Error(result.error||'Please log in at the Mission Hub first.');e.status=who.status;throw e;}
    identity=result;
    const [loaded,state0]=await Promise.all([getTasks('fix'),getTeamState()]);
    state=state0;
    for(const task of loaded.tasks||[])catalog.set(task.taskId,task);
    for(const view of Object.keys(taskIds))makeQuestionForm(view);
    if(identity.workstation==='B')selectScreen('b');
    else selectScreen('a');
    showState();notice(`Connected: ${identity.groupName}, Unit ${identity.workingUnit}, Workstation ${identity.workstation}. Your progress is shared with your group.`,'good');
    log(`Connected to ${identity.groupName} / Station ${identity.workstation}`,'success');
    await maybeAwardKey();
    window.setInterval(sync,5000);
  }catch(e){
    notice('Unable to start Fix It: '+msgOf(e)+' Open the Mission Hub, log in, then reload this page.','bad');
    for(const button of document.querySelectorAll('.fix-assessment button[type="submit"]'))button.disabled=true;
  }
}
initialize();
