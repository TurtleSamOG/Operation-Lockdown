import {getTeamState,getTasks,submitTask,completeZone} from './api.js';
const $=id=>document.getElementById(id),UI=window.LockdownUI;
function message(text,error=false){UI?.line('message',text,error?'error':'success');UI?.log('testLog',text,error?'error':'success');}
async function identity(){
  try{const s=await getTeamState();UI?.line('identity',`Connected: ${s.groupName} · Working Unit ${s.workingUnit} · ${s.totalScore}/300 points · ${s.keys.length}/3 keys`,'success');return true;}
  catch(e){UI?.line('identity',`Not signed in: ${e.message} Return to the Mission Hub to log in.`,'error');return false;}
}
function createTask(t){
  const card=document.createElement('section');card.className='system-card';
  const heading=document.createElement('div');heading.className='task-heading';
  const h=document.createElement('h2');h.textContent=t.title;
  const pill=document.createElement('span');pill.className='pill';pill.textContent=`Station ${t.station.toUpperCase()}`;heading.append(h,pill);
  const hint=document.createElement('p');hint.className='task-hint';hint.textContent=`Task ID: ${t.taskId} · ${t.required?'Required':'Bonus'} · Passing score ${t.passPercent}%`;
  card.append(heading,hint);
  const form=document.createElement('form');const feedback=document.createElement('p');feedback.className='message';feedback.setAttribute('role','status');feedback.setAttribute('aria-live','polite');
  for(const q of t.questions){
    const field=document.createElement('fieldset');field.className='task-prompt';const legend=document.createElement('legend');legend.textContent=q.text;field.appendChild(legend);
    for(const [key,label] of Object.entries(q.options)){
      const lbl=document.createElement('label');lbl.className='task-option';const radio=document.createElement('input');radio.type='radio';radio.name=q.id;radio.value=key;
      const span=document.createElement('span');span.textContent=label;lbl.append(radio,span);field.appendChild(lbl);
    }form.appendChild(field);
  }
  const button=document.createElement('button');button.type='submit';button.className='action';button.textContent='Submit answers for validation';form.append(button,feedback);
  form.onsubmit=async e=>{
    e.preventDefault();const entries=Object.fromEntries(new FormData(form).entries());
    const answered=Object.keys(entries).length;
    if(answered<t.questions.length){const m=`Select an answer for each question (${answered}/${t.questions.length} completed).`;feedback.textContent=m;feedback.className='message error';UI?.log('testLog',`${t.taskId}: ${m}`,'error');return;}
    UI?.busy(button,true,'Sending to server…');feedback.textContent='Validating your answers and saving the result…';feedback.className='message info';
    try{
      const r=await submitTask(t.zone,t.taskId,{answers:entries});
      const text=`${r.correct}/${r.total} correct · ${r.score}% · ${r.passed?'PASS':'NOT YET PASSED'} · ${r.scored?'Scored attempt':'Practice attempt'}. ${r.message}`;
      feedback.textContent=text;feedback.className=`message ${r.passed?'success':'error'}`;
      UI?.log('testLog',`${t.taskId}: ${text}`,r.passed?'success':'error');
      UI?.notify(`Task ${t.taskId}: ${r.score}%. ${r.message}`,r.passed?'success':'error',r.passed?'Task saved successfully':'Task needs another attempt');
      await identity();
    }catch(err){feedback.textContent=`Submission failed: ${err.message}`;feedback.className='message error';UI?.log('testLog',`${t.taskId} submission failed: ${err.message}`,'error');UI?.notify(err.message,'error','Result not saved');}
    finally{UI?.busy(button,false);}
  };
  card.appendChild(form);return card;
}
async function load(){
  $('tasks').innerHTML='<div class="empty-state">Loading questions from the server…</div>';const button=$('load');UI?.busy(button,true,'Loading…');
  try{const d=await getTasks($('zone').value);$('tasks').replaceChildren();
    for(const t of d.tasks)$('tasks').appendChild(createTask(t));
    message(`Loaded ${d.tasks.length} test tasks for ${$('zone').selectedOptions[0].textContent}.`);
    if(!d.tasks.length)$('tasks').innerHTML='<div class="empty-state">No test tasks returned. Have you run database/seed.php?</div>';
  }catch(e){$('tasks').innerHTML='<div class="empty-state">Tasks could not load. Check the error above.</div>';message(`Task loading failed: ${e.message}`,true);}
  finally{UI?.busy(button,false);}
}
$('zone').addEventListener('change',load);
$('load').addEventListener('click',load);
$('key').addEventListener('click',async()=>{const b=$('key');UI?.busy(b,true,'Checking requirements…');
  try{const r=await completeZone($('zone').value);const text=`Server confirmed zone completion. Group now has ${r.keys.length}/3 recovery keys.`;message(text);UI?.notify(text,'success','Key awarded');await identity();}
  catch(e){message(`Key not awarded: ${e.message}`,true);UI?.notify(e.message,'error','Key requirements not met');}
  finally{UI?.busy(b,false);}
});
identity();load();
