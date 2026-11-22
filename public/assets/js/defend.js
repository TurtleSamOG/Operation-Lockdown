/** Operation Lockdown / Defend It - office incident simulation.
 * Official answers/scoring remain server-side in existing task-catalog.php.
 * Interactive map, floor plan and response practice do not award points.
 */
import {getSession,getTeamState,getTasks,submitTask,completeZone} from '/assets/js/api.js';

const $=id=>document.getElementById(id);
const taskIds={a:'defend-investigate',b:'defend-response',joint:'defend-joint',bonus:'defend-bonus'};
const catalog=new Map();
const seenTown=new Set();
const seenRooms=new Set();
const responses=new Map();
const timeline=[];
let identity=null,groupState=null,currentStage='a',currentSite=null,currentRoom=null,currentFloor='ground',working=false,keyPending=false,lastKeyTry=0;
let lastSyncError=0;
const now=()=>new Date().toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
const passed=view=>Boolean(groupState?.taskResults?.[taskIds[view]]?.passed);
const stationAllowed=view=>['joint','bonus'].includes(view)||identity?.workstation===(view==='a'?'A':'B');
const retryMessage=error=>error?.status===401?'Your team session has expired. Sign in again from the Mission Hub.':error?.status===403?error.message:error?.status===419?'Security token needs refreshing; reload the page and retry.':error?.message||'Request failed. Please contact a facilitator.';
const clamp=x=>Math.max(0,Math.min(100,x));
function txt(id,value){if($(id))$(id).textContent=String(value);}
function element(tag,className='',text){const el=document.createElement(tag);if(className)el.className=className;if(text!==undefined)el.textContent=text;return el;}
function flash(message,kind='info'){const item=$('def-alert');item.textContent=message;item.className='def-alert '+(kind==='bad'?'def-error':kind==='good'?'def-success':'def-pending');if(kind==='bad')activity(message,'bad');}
function activity(text,kind=''){const target=$('def-log');if(!target)return;const row=element('span',kind==='good'?'is-good':kind==='bad'?'is-bad':'',`${now()}  ·  ${text}`);target.prepend(row);while(target.childElementCount>8)target.lastElementChild.remove();}
function result(view,message,kind=''){const output=$(`def-result-${view}`);if(output){output.textContent=message;output.className='def-result '+kind;}}
async function mutate(operation){try{return await operation();}catch(error){if(error?.status!==419)throw error;await getSession();return operation();}}
function chooseStage(view){if(!taskIds[view])return;currentStage=view;document.querySelectorAll('[data-stage-panel]').forEach(panel=>panel.hidden=panel.dataset.stagePanel!==view);document.querySelectorAll('[data-stage]').forEach(button=>{const active=button.dataset.stage===view;button.classList.toggle('is-selected',active);button.setAttribute('aria-pressed',String(active));});}
function updateState(){if(!groupState)return;
  txt('def-group',groupState.groupName||identity?.groupName||'GROUP');txt('def-unit',`Working Unit ${groupState.workingUnit||identity?.workingUnit||'—'} · Group-shared results`);
  txt('def-station',identity?.workstation?`WORKSTATION ${identity.workstation}`:'—');txt('def-score',`${groupState.scores?.defend||0} / 100`);
  const zone=groupState.zones?.defend;
  txt('def-completed',`${zone?.completed||0} / ${zone?.total||3} required challenges`);txt('def-key',zone?.keyEarned?'RECOVERED':'LOCKED');
  if($('def-key'))$('def-key').style.color=zone?.keyEarned?'#8cffc7':'';
  for(const view of Object.keys(taskIds)){
    txt(`def-nav-${view}`,passed(view)?'✓':'—');
    const form=$(`def-form-${view}`);
    if(!form)continue;
    const button=form.querySelector('button[type="submit"]');
    const allowed=stationAllowed(view)&&(view!=='joint'||(passed('a')&&passed('b')))&&(view!=='bonus'||passed('joint'));
    if(button){button.disabled=!allowed||working;button.textContent=passed(view)?'Improve saved score':view==='bonus'?'Submit optional assessment':'Submit official report';}
    const status=form.querySelector('.def-form-status');const saved=groupState.taskResults?.[taskIds[view]];
    if(status)status.textContent=saved?`Best saved: ${saved.score}% · ${saved.passed?'PASS':'Needs review'} · ${saved.attempts} attempt(s)`:
      !stationAllowed(view)?`Official assessment belongs on Workstation ${view.toUpperCase()}.`:
      view==='joint'&&!allowed?'Waiting for both A and B official reports.':
      view==='bonus'&&!allowed?'Unlocks after the shared mission.':'Not yet submitted. Server will validate your answers.';
  }
  for(const [view,id] of [['a','def-gate-a'],['b','def-gate-b'],['joint','def-gate-joint']]){txt(id,passed(view)?'PASSED':'WAITING');$(id)?.classList.toggle('is-pass',passed(view));}
  if(!passed('a')||!passed('b'))txt('def-joint-gate',`Awaiting ${[!passed('a')?'the exterior investigation':null,!passed('b')?'the interior response':null].filter(Boolean).join(' and ')}. Both workstations can continue independently.`);
  else txt('def-joint-gate','Both reports have passed. Meet up, reconstruct the response timeline and complete the joint review from either workstation.');
  $('def-joint-gate').classList.toggle('ready',passed('a')&&passed('b'));
  $('def-key-award').hidden=!zone?.keyEarned;
  txt('def-sync-text',`Latest shared update ${now()}`);
}
async function maybeKey(){const zone=groupState?.zones?.defend;if(!zone?.finished||zone.keyEarned||keyPending||Date.now()-lastKeyTry<15000)return;
  keyPending=true;lastKeyTry=Date.now();
  try{groupState=await mutate(()=>completeZone('defend'));updateState();flash('THREAT CONTAINED key recovered! Your result is now saved on the main leaderboard.','good');activity('THREAT CONTAINED recovery key saved','good');}
  catch(error){flash('Tasks passed, but key not saved: '+retryMessage(error),'bad');}
  finally{keyPending=false;}
}
async function sync(){if(working)return;try{const latest=await getTeamState();const old=groupState?.zones?.defend?.completed||0;groupState=latest;updateState();if((latest.zones?.defend?.completed||0)>old)activity('New group progress received from another computer','good');await maybeKey();lastSyncError=0;}catch(error){if(Date.now()-lastSyncError>20000){flash('Unable to update shared progress: '+retryMessage(error),'bad');lastSyncError=Date.now();}}}
function createAssessment(view){const task=catalog.get(taskIds[view]),slot=$(`def-task-${view}`);slot.replaceChildren();if(!task){slot.append(element('p','def-muted','Task missing from server. Ask Szymon to check that database/seed.php has been run.'));return;}
  const form=element('form');form.id=`def-form-${view}`;form.dataset.taskId=task.taskId;
  for(const [i,q] of task.questions.entries()){
    const field=element('fieldset');field.dataset.questionId=q.id;
    field.append(element('legend','',`${i+1}. ${q.text}`));const options=element('div','def-options');
    for(const [value,label] of Object.entries(q.options)){
      const choice=element('label','def-choice');const input=element('input');input.type='radio';input.name=`${task.taskId}-${q.id}`;input.value=value;choice.append(input,element('span','',label));options.append(choice);
    }
    field.append(options);form.append(field);
  }
  const status=element('div','def-form-status',`Required score: ${task.passPercent}%`);
  const button=element('button','def-btn def-btn-primary','Submit official report');button.type='submit';form.append(status,button);slot.append(form);
  form.addEventListener('submit',event=>{event.preventDefault();submitOfficial(view,form);});
}
function answerObject(form){const answers={};form.querySelectorAll('fieldset[data-question-id]').forEach(f=>{const chosen=f.querySelector('input:checked');if(chosen)answers[f.dataset.questionId]=chosen.value;});return answers;}
async function submitOfficial(view,form){if(working)return;
  if(!stationAllowed(view)){result(view,`This official report belongs on Workstation ${view.toUpperCase()}.`,'bad');return;}
  if(view==='a'&&['power','entrance','parking'].some(s=>!seenTown.has(s))){result(view,'Record the three required exterior observations first: power, entrance and parking.','warn');return;}
  if(view==='b'&&['server','it','workers'].some(s=>!seenRooms.has(s))){result(view,'Inspect the server room, IT support and employee workspace before submitting.','warn');return;}
  if(view==='joint'&&!(passed('a')&&passed('b'))){result(view,'The joint report unlocks after both workstation reports pass.','warn');return;}
  if(view==='joint'&&!timelineDone){result(view,'Complete the response-timeline exercise before submitting your final review.','warn');return;}
  if(view==='bonus'&&!passed('joint')){result(view,'Complete the joint response first.','warn');return;}
  const answers=answerObject(form);if(Object.keys(answers).length!==(catalog.get(taskIds[view])?.questions.length||0)){result(view,'Select an answer for each official question.','warn');return;}
  working=true;updateState();result(view,'Submitting to the PHP server for validation…');
  try{const reply=await mutate(()=>submitTask('defend',taskIds[view],{answers}));groupState=reply.teamState;
    const line=`${reply.correct}/${reply.total} correct · ${reply.score}% · ${reply.passed?'PASSED':'REVIEW REQUIRED'} · ${reply.scored?'Scored':'Practice'} attempt`;
    result(view,line,reply.passed?'good':'warn');flash(reply.passed?'Official assessment passed and saved for your group.':'Your answers were saved. Review the evidence and try again.',reply.passed?'good':'info');
    activity(`${view.toUpperCase()} official report: ${reply.score}% ${reply.passed?'PASS':'REVIEW'}`,reply.passed?'good':'');updateState();await maybeKey();
  }catch(error){result(view,'Report was not saved: '+retryMessage(error),'bad');flash('Submission failed: '+retryMessage(error),'bad');}
  finally{working=false;updateState();}
}
const town={
  power:{title:'External power cabinet damaged',description:'A delivery vehicle struck a cabinet near the office. Power is unstable and exposed equipment may be hazardous.',details:['Utility contractor must make the area safe before repairs.','Critical office systems have switched to limited backup power.','Staff safety comes before resuming services.']},
  entrance:{title:'Unverified visitor at reception',description:'A person in a high-visibility vest claims to be an emergency engineer but cannot provide an approved work order.',details:['Reception should confirm identity and authorisation.','An emergency does not remove visitor access-control requirements.','Suspicious access must be recorded and escalated.']},
  parking:{title:'Suspicious vehicle near staff entrance',description:'Security noticed a vehicle repeatedly circling the staff car park while employees were distracted by the outage.',details:['Security cameras recorded the vehicle at 09:42.','No confirmed intrusion yet: preserve evidence and verify.','Avoid confronting a potentially dangerous visitor.']},
  collision:{title:'Road collision confirmed',description:'Traffic has been diverted around a damaged roadside installation. Some emergency access routes may be obstructed.',details:['Emergency responders control the collision scene.','Do not send staff to inspect live electrical equipment.','Confirm safe access routes with building management.']},
  office:{title:'Office building / interior available',description:'The building has multiple affected systems. Workstation B can inspect rooms and prepare containment steps.',details:['Visit the interior tab to open the office floor plan.','The team can explore in parallel.','Report findings to one another before the joint review.']},
};
function selectSite(id){if(!town[id])return;currentSite=id;const record=$('def-record');record.disabled=id==='office';
  txt('def-evidence-title',town[id].title);txt('def-evidence-body',town[id].description);
  $('def-evidence-details').replaceChildren(...town[id].details.map(t=>element('span','',t)));
  record.textContent=seenTown.has(id)?'Observation recorded':id==='office'?'Open office from the response tab':'Record observation';
  activity(`Exterior alert inspected: ${town[id].title}`);
  if(id==='office'){record.disabled=false;record.textContent='Open office interior';}
}
function recordSite(){if(!currentSite)return;if(currentSite==='office'){chooseStage('b');return;}seenTown.add(currentSite);document.querySelectorAll(`[data-site="${currentSite}"]`).forEach(el=>el.classList.add('is-recorded'));
  const marker=document.querySelector(`[data-clue="${currentSite}"]`);if(marker)marker.classList.add('done');
  const count=['power','entrance','parking'].filter(id=>seenTown.has(id)).length;txt('def-evidence-count',`${count} / 3 required clues`);
  txt('def-evidence-count',`${count} / 3 required clues`);$('def-record').textContent='Observation recorded';activity(`Observation filed: ${town[currentSite].title}`,'good');
  if(count===3)flash('Exterior evidence collected. Workstation A may now submit its official report.','good');
}
const floors={
 ground:[
   {id:'reception',name:'Reception',icon:'▤',status:'ACCESS ALERT',alert:true,description:'Reception staff have reported a visitor claiming to be a contractor.',details:['Verify ID and appointment through building security.','Protect visitor access while emergency teams operate.']},
   {id:'workers',name:'Employee workspace',icon:'▦',status:'SECURITY ALERT',alert:true,description:'Employees report a suspicious caller requesting passwords to "restore" their systems.',details:['A caller asking for passwords is not normal IT procedure.','Refuse the request; verify via the official support channel.']},
   {id:'facilities',name:'Facilities office',icon:'▥',status:'UTILITY WARNING',alert:true,description:'The building manager is coordinating power and staff safety.',details:['Keep staff away from electrical hazards.','Confirm building safety checks with the authorised contractor.']},
   {id:'security',name:'Security office',icon:'◎',status:'MONITORING',alert:false,description:'Building security is monitoring access logs and camera reports.',details:['Preserve video and access records.','Report unverified visitors through approved procedures.']},
 ],
 first:[
   {id:'server',name:'Server room',icon:'▣',status:'POWER WARNING',alert:true,description:'The uninterruptible power supply (UPS) is running but has limited battery capacity.',details:['Prioritise the most important services.','Prepare an orderly shutdown if power will not return soon.']},
   {id:'it',name:'IT support',icon:'⌘',status:'MALWARE ALERT',alert:true,description:'A workstation is displaying suspicious processes and security warnings.',details:['Isolate the affected device from the network.','Notify IT security and preserve relevant evidence.']},
   {id:'meeting',name:'Meeting room',icon:'▤',status:'AVAILABLE',alert:false,description:'A safe location for communicating recovery plans and assigning roles.',details:['Use approved channels for staff updates.','Avoid speculation before findings are confirmed.']},
   {id:'archive',name:'Records archive',icon:'▥',status:'CHECK REQUIRED',alert:false,description:'The archive hosts important company documents with separate backups.',details:['Review verified recovery points.','Test backup restore before declaring systems recovered.']},
 ]
};
function renderFloor(){const rooms=floors[currentFloor];const container=$('def-rooms');container.replaceChildren();
  for(const r of rooms){const button=element('button','def-room'+(r.alert?' alerted':'')+(seenRooms.has(r.id)?' is-logged':'')+(r.id===currentRoom?' is-selected':''));button.type='button';button.dataset.room=r.id;
    const top=element('div','def-room-top');top.append(element('span','def-room-icon',r.icon),element('span','def-room-state',seenRooms.has(r.id)?'LOGGED':r.status));button.append(top,element('strong','',r.name),element('small','',r.alert?'Inspection requested':'Available for inspection'));button.onclick=()=>selectRoom(r.id);container.append(button);}
  document.querySelectorAll('[data-floor]').forEach(b=>b.classList.toggle('is-current',b.dataset.floor===currentFloor));
}
function selectRoom(id){const room=Object.values(floors).flat().find(r=>r.id===id);if(!room)return;currentRoom=id;txt('def-room-title',room.name);txt('def-room-body',room.description);
  $('def-room-details').replaceChildren(...room.details.map(t=>element('span','',t)));
  $('def-room-record').disabled=false;$('def-room-record').textContent=seenRooms.has(id)?'Inspection logged':'Log room inspection';renderFloor();activity(`Office room inspected: ${room.name}`);
}
function recordRoom(){if(!currentRoom)return;seenRooms.add(currentRoom);const node=document.querySelector(`[data-room-needed="${currentRoom}"]`);if(node)node.classList.add('done');
  const count=['server','it','workers'].filter(s=>seenRooms.has(s)).length;txt('def-room-count',`${count} / 3 required rooms`);$('def-room-record').textContent='Inspection logged';renderFloor();activity(`Inspection recorded: ${currentRoom}`,'good');
  if(count===3)flash('Required rooms inspected. Workstation B can submit its official response assessment.','good');
}
const decisionSet=[
  {id:'power',title:'01 / Backup power crisis',text:'The UPS is running out. Which response does your team recommend?',choices:[
    {label:'Keep every device online until the battery fails',delta:{safety:-5,security:-5,operations:-15},explain:'This risks an uncontrolled outage and potential data loss.',good:false},
    {label:'Prioritise critical services and plan a controlled shutdown',delta:{safety:10,security:8,operations:13},explain:'Critical systems are protected and recovery can proceed in a controlled way.',good:true},
    {label:'Enter the damaged power cabinet to reset it',delta:{safety:-25,security:-3,operations:-12},explain:'Unsafe. Only qualified utility responders should work on damaged electrical infrastructure.',good:false},
  ]},
  {id:'phone',title:'02 / Suspicious IT caller',text:'An employee says somebody claiming to be IT asked for their password.',choices:[
    {label:'Share the password to speed up recovery',delta:{safety:0,security:-22,operations:-6},explain:'Credential sharing may allow an attacker into company systems.',good:false},
    {label:'Refuse, verify with official IT, and report the call',delta:{safety:2,security:15,operations:2},explain:'The request is contained without assuming the caller was legitimate.',good:true},
  ]},
  {id:'malware',title:'03 / Compromised workstation',text:'IT support notices suspicious software on an employee computer.',choices:[
    {label:'Isolate it, preserve evidence and notify security',delta:{safety:1,security:16,operations:1},explain:'Isolation reduces the chance of spread while the incident is investigated.',good:true},
    {label:'Ignore the alert until the power comes back',delta:{safety:0,security:-15,operations:-7},explain:'Ignoring a potentially compromised workstation increases the risk of spread.',good:false},
  ]},
];
function renderResponses(){const target=$('def-responses');target.replaceChildren();for(const d of decisionSet){const card=element('div','def-response-card');card.append(element('div','def-panel-kicker','SIMULATED DECISION'),element('h3','',d.title),element('p','',d.text));
  const options=element('div','def-response-options');d.choices.forEach((c,i)=>{const button=element('button','def-response-choice'+(responses.get(d.id)===i?' is-picked':''),c.label);button.type='button';button.addEventListener('click',()=>{responses.set(d.id,i);renderResponses();updateMeters();activity(`Practice response selected for ${d.title}`,c.good?'good':'');});options.append(button);});card.append(options);
  const chosen=responses.has(d.id)?d.choices[responses.get(d.id)]:null;if(chosen)card.append(element('div','def-response-outcome '+(chosen.good?'good':'warn'),chosen.explain));target.append(card);
 }updateMeters();}
function updateMeters(){const scores={safety:65,security:55,operations:42};for(const d of decisionSet){if(responses.has(d.id)){const delta=d.choices[responses.get(d.id)].delta;for(const k of Object.keys(scores))scores[k]=clamp(scores[k]+(delta[k]||0));}}
  for(const [id,value] of Object.entries(scores)){txt(`def-${id}`,`${value}%`);$(`def-${id}-meter`).value=value;}
}
const timelineSteps={protect:'Protect people and assess immediate hazards',contain:'Contain affected systems and preserve critical services',record:'Document evidence and confirm recovery'};
let timelineDone=false;
function updateTimeline(){const text=timeline.length?timeline.map((id,i)=>`${i+1}. ${timelineSteps[id]}`).join('\n'):'Select the first response step…';$('def-timeline-preview').textContent=text;document.querySelectorAll('[data-step]').forEach(b=>{b.disabled=timeline.includes(b.dataset.step);});}
function checkTimeline(){if(timeline.length!==3){resultTimeline('Select all three steps before checking.','warn');return;}
  const good=timeline.join(',')==='protect,contain,record';timelineDone=good;resultTimeline(good?'Good sequence. You are ready to answer the server-scored joint review.':'Not quite. Start with immediate safety, then containment, then documentation. Try again.',good?'good':'warn');updateState();}
function resultTimeline(text,kind){const el=$('def-timeline-feedback');el.textContent=text;el.className='def-result '+kind;}
async function boot(){for(const button of document.querySelectorAll('[data-stage]'))button.addEventListener('click',()=>chooseStage(button.dataset.stage));
  for(const hotspot of document.querySelectorAll('[data-site]')){hotspot.addEventListener('click',()=>selectSite(hotspot.dataset.site));hotspot.addEventListener('keydown',e=>{if(['Enter',' '].includes(e.key)){e.preventDefault();selectSite(hotspot.dataset.site);}});}
  $('def-record').onclick=recordSite;$('def-room-record').onclick=recordRoom;document.querySelectorAll('[data-floor]').forEach(b=>b.addEventListener('click',()=>{currentFloor=b.dataset.floor;currentRoom=null;$('def-room-record').disabled=true;txt('def-room-title','Select a room');txt('def-room-body','Select a room to inspect the incident evidence on this floor.');$('def-room-details').replaceChildren();renderFloor();}));
  document.querySelectorAll('[data-step]').forEach(b=>b.onclick=()=>{if(!timeline.includes(b.dataset.step)){timeline.push(b.dataset.step);timelineDone=false;updateTimeline();resultTimeline('');}});
  $('def-timeline-check').onclick=checkTimeline;$('def-timeline-clear').onclick=()=>{timeline.splice(0,timeline.length);timelineDone=false;updateTimeline();resultTimeline('');};
  renderFloor();renderResponses();updateTimeline();chooseStage('a');
  try{
    await getSession();const who=await fetch('/defend/whoami.php',{credentials:'same-origin',cache:'no-store'});const data=await who.json();if(!who.ok||data.ok===false)throw Object.assign(new Error(data.error||'Please log in to your group.'),{status:who.status});identity=data;
    const [state,catalogue]=await Promise.all([getTeamState(),getTasks('defend')]);groupState=state;
    for(const task of catalogue.tasks||[])catalog.set(task.taskId,task);
    for(const view of Object.keys(taskIds))createAssessment(view);
    updateState();chooseStage(identity.workstation==='B'?'b':'a');flash('Connected to Mission Control. Your responses will be validated by the shared PHP server.','good');activity(`Signed in as ${identity.groupName} / Unit ${identity.workingUnit} / Station ${identity.workstation}`,'good');await maybeKey();
    setInterval(sync,5000);
  }catch(error){flash('Could not load your working group: '+retryMessage(error),'bad');activity('Open the Mission Hub to log into a group, then return to Defend It.','bad');}
}
boot();
