import {getTeamState,getTasks,submitTask,completeZone} from './api.js';
const $=id=>document.getElementById(id);
function message(text,error=false){$('message').textContent=text;$('message').className=`message ${error?'error':'success'}`;}
async function identity(){try{const s=await getTeamState();$('identity').textContent=`Signed in: ${s.groupName} — working unit ${s.workingUnit}. ${s.totalScore}/300 points, ${s.keys.length}/3 keys.`;}catch(e){$('identity').textContent=`${e.message} Go to the Mission Hub first.`;}}
async function load(){
  $('tasks').replaceChildren();try{
    const data=await getTasks($('zone').value);
    for(const t of data.tasks){
      const card=document.createElement('section');card.className='system-card';
      const h=document.createElement('h2');h.textContent=`${t.station.toUpperCase()}: ${t.title}`;card.appendChild(h);
      const hint=document.createElement('p');hint.className='muted';hint.textContent=`Task ID: ${t.taskId} | ${t.required?'Required':'Bonus'} | Pass: ${t.passPercent}%`;card.appendChild(hint);
      const form=document.createElement('form');
      for(const q of t.questions){const field=document.createElement('fieldset');field.className='task-prompt';const legend=document.createElement('legend');legend.textContent=q.text;field.appendChild(legend);
        for(const [key,label] of Object.entries(q.options)){const lbl=document.createElement('label');lbl.className='task-option';const radio=document.createElement('input');radio.type='radio';radio.name=q.id;radio.value=key;const span=document.createElement('span');span.textContent=label;lbl.append(radio,span);field.appendChild(lbl);}form.appendChild(field);}
      const btn=document.createElement('button');btn.type='submit';btn.className='action';btn.textContent='Check answers';const feedback=document.createElement('p');feedback.className='message';form.append(btn,feedback);
      form.onsubmit=async e=>{e.preventDefault();const formData=new FormData(form);const answers={};for(const [k,v] of formData.entries())answers[k]=v;try{const r=await submitTask(t.zone,t.taskId,{answers});feedback.textContent=`${r.correct}/${r.total} correct — ${r.score}%. ${r.message}`;feedback.className=`message ${r.passed?'success':'error'}`;identity();}catch(err){feedback.textContent=err.message;feedback.className='message error';}};
      card.appendChild(form);$('tasks').appendChild(card);
    }
  }catch(e){message(e.message,true);}
}
$('zone').onchange=load;$('load').onclick=load;$('key').onclick=async()=>{try{const r=await completeZone($('zone').value);message(`Saved. Current keys: ${r.keys.join(', ')}`);identity();}catch(e){message(e.message,true);}};
identity();load();
