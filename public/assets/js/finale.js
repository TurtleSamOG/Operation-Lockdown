/** Operation Lockdown final mission. All question text/options and scoring come from PHP. */
import { getSession, getTeamState, getFinaleQuestions, submitFinale } from '/assets/js/api.js';

const $ = id => document.getElementById(id);
const KEYS = [
  { zone: 'train', code: 'AI_DEFENCE_ACTIVATED', name: 'AI Defence Activated' },
  { zone: 'fix', code: 'PORTAL_SECURED', name: 'Portal Secured' },
  { zone: 'defend', code: 'THREAT_CONTAINED', name: 'Threat Contained' }
];
const STORY = {
  network: { code: 'PHASE 01 / NETWORK DEFENCE', title: 'Re-enable the security perimeter.',
    subtitle: 'The AI detector is ready, but activating the wrong response could lock out innocent employees.',
    intel: 'Train It taught you to look for unusual login patterns and balance security with false alarms. The SOC needs your final call.', icon: '◎', service: 'ai' },
  portal: { code: 'PHASE 02 / EMPLOYEE ACCESS', title: 'Bring the portal back online.',
    subtitle: 'The staff portal has been patched. Employees need access, but unauthorised visitors must remain outside.',
    intel: 'Fix It revealed why both permission checks and regression testing matter. Decide whether this release is truly safe.', icon: '⌘', service: 'portal' },
  response: { code: 'PHASE 03 / INCIDENT CLOSURE', title: 'Verify the office is operational.',
    subtitle: 'Power has returned and responders report that the incident is contained. One last check stands between the team and a successful recovery.',
    intel: 'Defend It required evidence, a safe response and a business continuity plan. The recovery needs a controlled handover.', icon: '⬡', service: 'response' }
};
const FALLBACK = { code: 'RECOVERY PHASE', title: 'Review the recovery decision.', subtitle: 'Review the evidence and coordinate a safe next step with the other workstation.', intel: 'All answers are validated by the server.', icon: '◇', service: null };
const model = { state:null, questions:[], answers:{}, step:0, busy:false, fetching:false, ready:false, outcome:null };
const safeNum = value => Number.isFinite(Number(value)) ? Number(value) : 0;
function text(id, value) { const element = $(id); if (element) element.textContent = String(value); }
function hide(id, yes) { const element = $(id); if (element) element.hidden = !!yes; }
function notice(message, mode='info') {
  const el = $('finale-notice'); el.textContent=message; el.className = `finale-notice finale-${mode}`;
}
function toast(message, mode='info') { window.LockdownUI?.notify?.(message,mode); }
function completed() { return Boolean(model.state?.finale?.completed); }
function keyCount() { return KEYS.filter(k => model.state?.keys?.includes(k.code)).length; }
function setCore(restored) {
  document.body.classList.toggle('finale-restored', !!restored);
  text('finale-core-icon', restored ? '✓' : '⏻');
  $('finale-core-label').innerHTML = restored ? 'SYSTEM<br>RESTORED' : 'AWAITING<br>AUTHORISATION';
  text('finale-system-indicator', restored ? 'ONLINE' : 'OFFLINE');
}
function updateStatus() {
  const s = model.state;
  text('finale-group', s?.groupName || '—');
  text('finale-unit', s ? `Working unit ${s.workingUnit ?? '—'}` : 'Log in from Mission Hub');
  text('finale-workstation', s?.workstation || '—');
  $('finale-zone-score').replaceChildren(document.createTextNode(String(safeNum(s?.totalScore))+' '));
  const zonesMax=document.createElement('em');zonesMax.textContent='/ 300';$('finale-zone-score').append(zonesMax);
  const finalScore = s?.finale?.attempts ? String(safeNum(s.finale.bestScore)) : '—';
  $('finale-final-score').replaceChildren(document.createTextNode(finalScore+' '));
  const finalMax=document.createElement('em');finalMax.textContent='/ 100';$('finale-final-score').append(finalMax);
  text('finale-final-progress', completed() ? 'RESTORATION COMPLETE' : `${safeNum(s?.finale?.attempts)} submission(s) recorded`);
  const count=keyCount();text('finale-key-count', `${count} / 3 VERIFIED`);
  KEYS.forEach(k=>{
    const present=Boolean(s?.keys?.includes(k.code));
    $(`finale-key-${k.zone}`).classList.toggle('is-unlocked',present);
    text(`finale-key-label-${k.zone}`,present?'✓ SERVER VERIFIED':'NOT YET RECOVERED');
  });
  setCore(completed());
}
function renderAccess() {
  if (!model.state) { hide('finale-gate',false);hide('finale-command',true);hide('finale-outcome',true);return; }
  if (completed()) { renderSuccess();return; }
  if (!model.ready) {
    hide('finale-gate',false);hide('finale-command',true);hide('finale-outcome',true);
    const missing=KEYS.filter(k=>!model.state.keys?.includes(k.code));
    text('finale-gate-title', 'Restoration protocol sealed.');
    text('finale-gate-description', `${missing.length} key${missing.length===1?' remains':'s remain'}: ${missing.map(k=>k.name).join(', ')}. Complete the corresponding zones, then refresh. The console also checks automatically.`);
    notice(`Access pending: ${keyCount()} of 3 recovery keys verified.`, 'warn');return;
  }
  hide('finale-gate',true);hide('finale-command',false);hide('finale-outcome',true);
  notice('All three recovery keys verified. The final command console is unlocked.','good');
  renderSteps();renderQuestion();
}
function node(tag, className, content) {
  const n = document.createElement(tag); if (className) n.className=className;
  if (content!==undefined) n.textContent=String(content);return n;
}
function phase(question,index) {return STORY[question.id] || {...FALLBACK,code:`RECOVERY PHASE ${index+1}`};}
function renderSteps() {
  const steps=$('finale-steps');steps.replaceChildren();
  model.questions.forEach((q,i)=>{
    const meta=phase(q,i), answered=Boolean(model.answers[q.id]);
    const b=node('button',`finale-step${i===model.step?' is-active':''}${answered?' is-decided':''}`);
    b.type='button';b.setAttribute('aria-current', i===model.step?'step':'false');
    b.append(node('span','finale-step-index',answered?'✓':String(i+1).padStart(2,'0')));
    const wrap=node('span','finale-step-copy');wrap.append(node('small','',meta.code));wrap.append(node('strong','',meta.title));b.append(wrap);
    b.addEventListener('click',()=>{if(model.busy)return;model.step=i;renderSteps();renderQuestion();});steps.append(b);
  });
  const answered=model.questions.filter(q=>Boolean(model.answers[q.id])).length;
  text('finale-decisions-count',`${answered} / ${model.questions.length} decisions ready`);
  const all=answered===model.questions.length && model.questions.length>0;
  $('finale-submit').disabled=!all||model.busy;
  text('finale-submit-hint',all?'All decisions ready. Confirm with your group before authorising.':`Choose ${model.questions.length-answered} more response${model.questions.length-answered===1?'':'s'} to continue.`);
  ['ai','portal','response'].forEach(service=>text(`finale-service-${service}`,'STANDBY'));
  model.questions.forEach((q,i)=>{const service=phase(q,i).service;if(service)text(`finale-service-${service}`,model.answers[q.id]?'DECIDED':'STANDBY');});
}
function renderQuestion() {
  const q=model.questions[model.step];if(!q)return;
  const meta=phase(q,model.step);
  text('finale-stage-code',meta.code);text('finale-stage-counter',`${model.step+1} OF ${model.questions.length}`);
  text('finale-stage-icon',meta.icon);text('finale-stage-title',meta.title);
  text('finale-stage-description',meta.subtitle);text('finale-stage-evidence',meta.intel);
  text('finale-stage-question',q.text);
  const options=$('finale-options');options.replaceChildren();
  Object.entries(q.options||{}).forEach(([value,label],i)=>{
    const line=node('label','finale-option');
    const radio=node('input');radio.type='radio';radio.name=`finale-answer-${q.id}`;radio.value=value;
    radio.checked=model.answers[q.id]===value;radio.disabled=model.busy;
    const mark=node('span','finale-option-mark',String.fromCharCode(65+i));mark.setAttribute('aria-hidden','true');
    line.append(radio,mark,node('span','finale-option-label',label));
    radio.addEventListener('change',()=>{model.answers[q.id]=value;renderSteps();renderQuestion();});
    options.append(line);
  });
  const prev=$('finale-prev'),next=$('finale-next');prev.disabled=model.step===0||model.busy;
  next.disabled=model.step===model.questions.length-1||model.busy;
  text('finale-next',model.step===model.questions.length-2?'Final decision →':'Next decision →');
}
function renderSuccess(result=null) {
  hide('finale-gate',true);hide('finale-command',true);hide('finale-outcome',false);
  setCore(true);
  const score=safeNum(model.state?.finale?.bestScore);
  text('finale-outcome-zones',`${safeNum(model.state?.totalScore)}/300`);
  text('finale-outcome-score',`${score}/100`);
  text('finale-outcome-title', 'Company systems restored.');
  text('finale-outcome-copy',`Mission complete, ${model.state?.groupName||'team'}. Your decisions brought the AI detector, staff portal and office operations back online.`);
  text('finale-outcome-note',result?.scored===false?'Mission complete. This submission was a practice attempt; the recorded best score remains unchanged.':'Your completion is saved in MariaDB. The leaderboard will show your group’s recorded finale result.');
  notice('SYSTEM RESTORED · Final mission complete and confirmed by the server.','good');
  if (result) window.scrollTo({top:$('finale-outcome').getBoundingClientRect().top+window.scrollY-35,behavior:'smooth'});
}
async function refresh({silent=false}={}) {
  if (model.fetching||model.busy)return;
  model.fetching=true;
  try {
    const state=await getTeamState();model.state=state;
    updateStatus();
    if(completed()){renderSuccess();return;}
    const hadAccess=model.ready;
    if(state.finaleReady){
      if(!model.questions.length){
        const packet=await getFinaleQuestions();
        model.ready=Boolean(packet.ready)&&Array.isArray(packet.questions)&&packet.questions.length>0;
        model.questions=packet.questions||[];
      } else model.ready=true;
    } else model.ready=false;
    if(!silent||hadAccess!==model.ready) renderAccess();
  } catch (error) {
    if(!silent){
      hide('finale-command',true);hide('finale-outcome',true);hide('finale-gate',false);
      if(error.status===401){text('finale-gate-title','Team login required.');text('finale-gate-description','Return to the Mission Hub and sign in using your group PIN. Then open the Final Mission again.');}
      else{text('finale-gate-title','Mission control is unavailable.');text('finale-gate-description','Check the PHP server and Laragon MySQL, then try again.');}
      notice(error.message,'error');
    }
  } finally { model.fetching=false; }
}
async function submit() {
  if(model.busy||!model.ready||completed())return;
  const unanswered=model.questions.filter(q=>!model.answers[q.id]);
  if(unanswered.length){toast('Please select a response for all three restoration phases.','error');return;}
  if(!window.confirm('Submit one final recovery assessment for your group? Make sure both workstations agree.'))return;
  model.busy=true;$('finale-submit').disabled=true;text('finale-submit','AUTHORISING…');
  try{
    const result=await submitFinale({...model.answers});
    model.outcome=result;
    model.state=await getTeamState();updateStatus();
    if(result.completed||completed()){
      renderSuccess(result);
      toast('All restoration checks passed. The company is back online.','success');
    } else {
      notice(`Restoration not authorised: ${result.correct} of ${result.total} recovery decisions passed. Review your choices and try again.`,'warn');
      toast(`Server verified ${result.correct}/${result.total} correct decisions. Review the response plan.`,'error');
      const remaining= Math.max(0,3-safeNum(model.state?.finale?.attempts));
      text('finale-submit-hint',remaining?`System still offline. ${remaining} scored submission${remaining===1?'':'s'} remain.`:'System still offline. Further attempts are practice only.');
      window.scrollTo({top:$('finale-command').getBoundingClientRect().top+window.scrollY-20,behavior:'smooth'});
    }
  }catch(error){notice(`Recovery submission failed: ${error.message}`,'error');toast(error.message,'error');}
  finally{
    model.busy=false;const btn=$('finale-submit');btn.replaceChildren(node('span','', '⏻'),document.createTextNode(' AUTHORISE RESTORATION'));
    if(!completed()){renderSteps();renderQuestion();}
  }
}
function setup(){
  $('finale-refresh').addEventListener('click',()=>refresh());
  $('finale-prev').addEventListener('click',()=>{if(model.step>0&&!model.busy){model.step--;renderSteps();renderQuestion();}});
  $('finale-next').addEventListener('click',()=>{if(model.step<model.questions.length-1&&!model.busy){model.step++;renderSteps();renderQuestion();}});
  $('finale-submit').addEventListener('click',submit);
  window.setInterval(()=>{if(!document.hidden)refresh({silent:true});},9000);
}
setup();
(async()=>{try{await getSession();await refresh();}catch(error){notice(error.message,'error');}})();
