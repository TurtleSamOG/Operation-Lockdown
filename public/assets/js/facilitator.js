import {getSession,loginFacilitator,getFacilitatorState,facilitatorAction} from './api.js';
const $=id=>document.getElementById(id),UI=window.LockdownUI;
let settings=null,loadedAt=Date.now();
function message(text,error=false){UI?.line('actionMessage',text,error?'error':'success');UI?.log('actionLog',text,error?'error':'success');}
function tick(){if(!settings)return;const elapsed=settings.timerRunning?Math.floor((Date.now()-loadedAt)/1000):0;const seconds=Math.max(0,Number(settings.secondsRemaining)-elapsed);$('currentTimer').textContent=`${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`;}
async function refresh(){
  try{
    const d=await getFacilitatorState();$('authCard').classList.add('hidden');$('controls').classList.remove('hidden');
    settings=d.settings;loadedAt=Date.now();tick();
    $('roundLabel').textContent=`Rotation ${settings.activeRound} of 3`;
    // Don't replace the duration while the facilitator is typing.
    if(document.activeElement!==$('minutes'))$('minutes').value=settings.roundMinutes;
    // Overview table built with textContent only (no HTML injection from server data).
    const table=document.createElement('table');table.className='fc-table';
    const head=table.createTHead().insertRow();
    for(const h of ['Rank','Group','Train It','Fix It','Defend It','Total','Finale'])head.appendChild(Object.assign(document.createElement('th'),{textContent:h}));
    const body=table.createTBody();
    for(const row of d.teams){
      const tr=body.insertRow();
      tr.insertCell().textContent=String(row.rank);
      const name=tr.insertCell();name.appendChild(Object.assign(document.createElement('strong'),{textContent:row.name}));
      for(const zone of ['train','fix','defend']){
        const z=row.zones?.[zone]||{completed:0,total:3,keyEarned:false};
        const chip=document.createElement('span');chip.className='fc-z '+(z.keyEarned?'on':z.completed?'mid':'');
        chip.textContent=z.keyEarned?`✓ key · ${row.scores[zone]}`:`${z.completed}/${z.total} · ${row.scores[zone]} pts`;
        tr.insertCell().appendChild(chip);
      }
      tr.insertCell().textContent=`${row.totalScore}/300`;
      tr.insertCell().textContent=row.finale?.completed?`Restored (${row.finale.bestScore})`:row.finaleReady?'Unlocked':`${row.keyCount}/3 keys`;
    }
    $('groupInfo').replaceChildren(table);
    $('refreshLabel').textContent=`Updated ${UI?.stamp?.()||'now'}`;
  }catch(e){
    if(e.status===403){$('controls').classList.add('hidden');$('authCard').classList.remove('hidden');}
    else message(`Unable to load facilitator dashboard: ${e.message}`,true);
  }
}
$('authForm').addEventListener('submit',async e=>{
  e.preventDefault();const b=$('authSubmit');UI?.busy(b,true,'Checking staff login…');UI?.line('authMessage','Verifying credentials…','info');
  try{
    await loginFacilitator($('username').value,$('password').value);$('password').value='';UI?.line('authMessage','','info');
    await refresh();UI?.notify('Facilitator controls are now available.','success','Staff login successful');UI?.log('actionLog','Facilitator signed in','success');
  }catch(error){UI?.line('authMessage',`Login failed: ${error.message}`,'error');UI?.notify(error.message,'error','Staff login failed');}
  finally{UI?.busy(b,false);}
});
async function action(name,fields={},button=null,successText='Changes saved successfully.'){
  UI?.busy(button,true,'Saving…');
  try{
    await facilitatorAction(name,fields);message(successText);UI?.notify(successText,'success','Server confirmed');await refresh();
  }catch(error){message(`Failed to save changes: ${error.message}`,true);UI?.notify(error.message,'error','Server rejected action');}
  finally{UI?.busy(button,false);}
}
$('startTimer').onclick=()=>action('start_timer',{},$('startTimer'),'Timer started / resumed.');
$('pauseTimer').onclick=()=>action('pause_timer',{},$('pauseTimer'),'Timer paused.');
$('resetTimer').onclick=()=>{if(confirm('Reset this rotation timer?'))action('reset_timer',{},$('resetTimer'),'Current rotation timer reset.');};
$('nextRound').onclick=()=>{if(confirm('Move to the next rotation?'))action('next_round',{},$('nextRound'),'Moved to next rotation.');};
$('resetRounds').onclick=()=>{if(confirm('Return to rotation 1 and clear the timer? Scores are preserved.'))action('reset_rounds',{},$('resetRounds'),'Rotations restarted; team scores preserved.');};
$('setMinutes').onclick=()=>action('set_minutes',{minutes:Number($('minutes').value)},$('setMinutes'),`Rotation duration updated to ${$('minutes').value} minutes.`);
$('awardKey').onclick=()=>{if(confirm('Award this recovery key manually?'))action('award_key',{team:$('targetGroup').value,zone:$('keyZone').value,reason:$('overrideReason').value},$('awardKey'),'Recovery key awarded to the chosen group.');};
$('resetGroup').onclick=()=>{const team=$('targetGroup').value;const check=prompt(`To permanently erase ALL results for ${team}, type RESET`);if(check==='RESET')action('reset_group',{team,confirm:'RESET'},$('resetGroup'),`Group ${team} results cleared.`);};
getSession().then(refresh).catch(error=>UI?.line('authMessage',`Server check failed: ${error.message}`,'error'));
setInterval(()=>{if(!$('controls').classList.contains('hidden'))refresh();},7000);setInterval(tick,1000);

// ---- Projector controls (presentation only; the briefing starts the timer via the same start_timer action) ----
import('./qr.js').then(({qrSvg})=>{
  const KEY='ol2:surveyUrl';
  const read=()=>{try{return localStorage.getItem(KEY)||'';}catch{return '';}};
  const preview=()=>{const url=read();$('surveyUrl').value=$('surveyUrl').value||url;const svg=url?qrSvg(url):null;
    $('surveyQr').innerHTML=svg||(url?'Link too long for a QR code':'No link saved');
    $('surveyNote').textContent=url?`Saved: ${url}`:'Saved on this browser only. Paste your survey link (Google Forms, Microsoft Forms…).';};
  $('saveSurvey').onclick=()=>{
    const url=$('surveyUrl').value.trim();
    if(url&&!/^https?:\/\/\S+$/i.test(url)){UI?.notify('Enter a full link starting with https://','error','Survey link not saved');return;}
    try{url?localStorage.setItem(KEY,url):localStorage.removeItem(KEY);}catch{UI?.notify('This browser blocked local storage.','error','Not saved');return;}
    preview();UI?.notify(url?'The projector QR slide will show this link.':'Survey link cleared.','success','Survey link saved');
  };
  $('openProjector').onclick=()=>window.open('/leaderboard/','olProjector');
  $('playBriefing').onclick=()=>window.open('/leaderboard/?briefing=1','olProjector');
  preview();
});
