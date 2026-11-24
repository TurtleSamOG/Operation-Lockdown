import {getSession,loginFacilitator,getFacilitatorState,facilitatorAction} from './api.js';
import {LIVE_SCENARIOS} from './live-scenarios.js';
const $=id=>document.getElementById(id),UI=window.LockdownUI;
let settings=null,loadedAt=Date.now();
function message(text,error=false){UI?.line('actionMessage',text,error?'error':'success');UI?.log('actionLog',text,error?'error':'success');}
function tick(){if(!settings)return;const elapsed=settings.timerRunning?Math.floor((Date.now()-loadedAt)/1000):0;const seconds=Math.max(0,Number(settings.secondsRemaining)-elapsed);$('currentTimer').textContent=`${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`;}
async function refresh(){
  try{
    const d=await getFacilitatorState();$('authCard').classList.add('hidden');$('controls').classList.remove('hidden');document.dispatchEvent(new Event('ol:staff-ready'));
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

// ---- Projector controls (presentation only). Multi-room sync uses the OPTIONAL /api/projector-cue.php add-on;
// without it, this browser falls back to opening/controlling a projector window on this machine only.
Promise.all([import('./qr.js'),import('./projector-sync.js')]).then(async([{qrSvg},{projectorSync}])=>{
  const KEY='ol2:surveyUrl';
  const local=()=>{try{return localStorage.getItem(KEY)||'';}catch{return '';}};
  let server=null;
  const preview=url=>{const svg=url?qrSvg(url):null;
    $('surveyQr').innerHTML=svg||(url?'Link too long for a QR code':'No link saved');
    $('surveyNote').textContent=url?`Saved: ${url}`:(projectorSync.available?'Paste your survey link. It is shared with every projector.':'Saved on this browser only. Paste your survey link (Google Forms, Microsoft Forms…).');};
  const refreshSync=async()=>{
    server=await projectorSync.detect();
    const on=projectorSync.available;
    $('syncStatus').dataset.on=String(on);
    $('syncStatus').textContent=on?'● Multi-room sync ON — buttons below control every projector signed in as staff.':'○ Multi-room sync not installed (api/projector-cue.php missing) — controls affect this computer only.';
    const url=(on&&server?.survey)||local();$('surveyUrl').value=$('surveyUrl').value||url;preview(url);
  };
  await refreshSync();
  let checked=projectorSync.available;
  document.addEventListener('ol:staff-ready',()=>{if(!checked){checked=true;refreshSync();}});
  $('saveSurvey').onclick=async()=>{
    const url=$('surveyUrl').value.trim();
    if(url&&!/^https?:\/\/\S+$/i.test(url)){UI?.notify('Enter a full link starting with https://','error','Survey link not saved');return;}
    try{url?localStorage.setItem(KEY,url):localStorage.removeItem(KEY);}catch{}
    if(projectorSync.available){try{await projectorSync.survey(url);}catch(e){UI?.notify(e.message,'error','Not shared with projectors');return;}}
    preview(url);UI?.notify(url?'The QR slide will show this link.':'Survey link cleared.','success','Survey link saved');
  };
  $('openProjector').onclick=()=>window.open('/leaderboard/','olProjector');
  $('playBriefing').onclick=async()=>{
    if(!projectorSync.available){window.open('/leaderboard/?briefing=1','olProjector');return;}
    if(!window.confirm('Start the opening briefing on EVERY projector now? The rotation timer starts when it ends.'))return;
    try{await projectorSync.briefing();$('briefingNote').textContent='Briefing starting on all projectors in 5 seconds…';UI?.notify('Every open projector view will start in 5 seconds.','success','Briefing cued');}
    catch(e){UI?.notify(e.message,'error','Briefing not started');}
  };
  document.querySelectorAll('[data-slide-cue]').forEach(b=>b.onclick=async()=>{
    if(!projectorSync.available){UI?.notify('Use the arrows on the projector screen (sync add-on not installed).','info','This computer only');return;}
    try{await projectorSync.slide(Number(b.dataset.slideCue));UI?.notify(`Projectors now showing: ${b.textContent}`,'success','Slide changed');}catch(e){UI?.notify(e.message,'error','Slide not changed');}
  });
});

// ---- Live attacks (OPTIONAL /api/live-attack.php add-on). Server stores and grades everything. ----
(()=>{
  const URL='/api/live-attack.php';let csrf=null,last=null,offset=0,missing=false;
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  async function post(body){
    if(!csrf)csrf=(await getSession()).csrfToken;
    const send=()=>fetch(URL,{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json','X-CSRF-Token':csrf},body:JSON.stringify(body)});
    let r=await send();if(r.status===419){csrf=(await getSession()).csrfToken;r=await send();}
    const d=await r.json().catch(()=>null);if(!r.ok||!d?.ok)throw new Error(d?.error||`HTTP ${r.status}`);return d;
  }
  const grid=$('attackButtons');
  if(grid)grid.innerHTML=Object.entries(LIVE_SCENARIOS).map(([k,v])=>`<button type="button" class="fc-attack" data-attack="${k}"><span>${v.icon}</span><b>${esc(v.title)}</b><small>${esc(v.blurb)}</small><em hidden></em></button>`).join('');
  function render(){
    const box=$('liveStatus');if(!box)return;
    if(missing){box.innerHTML='<p class="note">Live-attack add-on not installed (api/live-attack.php missing). Upload the public folder to enable it.</p>';document.querySelectorAll('[data-attack],#endAttack,#resetLive').forEach(b=>b.disabled=true);return;}
    if(!last)return;
    const any=last.attack,a=any?.active?any:null,left=a?Math.max(0,a.endsAt-(Math.floor(Date.now()/1000)+offset)):0;
    document.querySelectorAll('[data-attack]').forEach(b=>{const used=(last.used||[]).includes(b.dataset.attack),run=a?.type===b.dataset.attack;b.classList.toggle('is-used',used&&!run);b.classList.toggle('is-running',run);const em=b.querySelector('em');em.hidden=!(used||run);em.textContent=run?'● RUNNING NOW':'✓ ALREADY USED';});
    box.classList.toggle('is-live',Boolean(a));$('liveBadge').textContent=a?`LIVE: ${a.title}`:'No attack running';$('liveBadge').classList.toggle('live',Boolean(a));
    $('endAttack').disabled=!a;
    const n=any?.items?.length||0;
    const rows=last.groups.map(g=>{const c=g.current;return `<tr><td><strong>${esc(g.name)}</strong></td><td>${c?`✓ +${Number(c.p)} pts (${Number(c.c)}/${Number(c.n)} right${c.complete?`, ${Number(c.s)}s`:', ran out of time'})`:(a?`<span class="pill warn">${Number(g.answered)||0} / ${n} decided…</span>`:(any?'— no response':'—'))}</td><td>${Number(g.total)} pts</td></tr>`;}).join('');
    box.innerHTML=`<div class="fc-livehead"><span>${a?`⚠ ${esc(a.title)} — in progress`:(any?`Last attack finished: ${esc(any.title)}`:'No attacks triggered yet')}</span>${a?`<strong>${Math.floor(left/60)}:${String(left%60).padStart(2,'0')}</strong>`:''}</div><table class="fc-table"><thead><tr><th>Group</th><th>${a?'This attack':'Last attack'}</th><th>Live total</th></tr></thead><tbody>${rows}</tbody></table>`;
  }
  async function refreshLive(){
    if($('controls').classList.contains('hidden')||missing)return;
    try{const r=await fetch(URL+'?view=staff',{credentials:'same-origin',cache:'no-store'});if(r.status===404){missing=true;render();return;}const d=await r.json();if(d?.ok){last=d;offset=d.serverTime-Math.floor(Date.now()/1000);render();}}catch{}
  }
  document.querySelectorAll('[data-attack]').forEach(b=>b.addEventListener('click',async()=>{
    const name=b.querySelector('b').textContent;
    if((last?.used||[]).includes(b.dataset.attack)&&!(last?.attack?.active)&&!window.confirm(`“${name}” has already been used this session. Students have seen the answers. Run it again anyway?`))return;
    if(!window.confirm(last?.attack?.active?`An attack is already running (${last.attack.title}). Replace it with “${name}” on every student screen now?`:`Launch “${name}” on EVERY signed-in student screen now? They get 5 minutes.`))return;
    try{await post({action:'trigger',type:b.dataset.attack});message(`Live attack launched: ${name}`);refreshLive();}catch(e){message(e.message,true);}
  }));
  $('endAttack').addEventListener('click',async()=>{try{await post({action:'end'});message('Live attack ended.');refreshLive();}catch(e){message(e.message,true);}});
  $('resetLive').addEventListener('click',async()=>{
    if(window.prompt('This erases ALL live-attack points for every group (use it to clear test data before the event). Type RESET to confirm.')!=='RESET')return;
    try{await post({action:'reset',confirm:'RESET'});message('All live-attack points erased.');refreshLive();}catch(e){message(e.message,true);}
  });
  document.addEventListener('ol:staff-ready',refreshLive);
  setInterval(refreshLive,3000);setInterval(render,1000);refreshLive();
})();
