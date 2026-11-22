import {getSession, getLeaderboard, facilitatorAction} from './api.js';
import {qrSvg} from './qr.js';
// Public projector view. Read-only for everyone: server-ranked results, no PINs, answers or student details.
// When a FACILITATOR is signed in on this browser, extra projector controls appear:
//   ← / → slides (leaderboard → "Is this a real job?" → survey QR) and the opening briefing,
//   which starts the rotation timer through the existing facilitator API when it finishes.
const $=id=>document.getElementById(id);const UI=window.LockdownUI;
const ZONES=[['train','Train It','AI Defence Activated','AI_DEFENCE_ACTIVATED'],['fix','Fix It','Portal Secured','PORTAL_SECURED'],['defend','Defend It','Threat Contained','THREAT_CONTAINED']];
const SURVEY_KEY='ol2:surveyUrl';
let settings=null,lastFetch=0,previous=new Map(),isFacilitator=false;
function htmlEscape(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function tick(){if(!settings)return;const elapsed=settings.timerRunning?Math.floor((Date.now()-lastFetch)/1000):0;const s=Math.max(0,Number(settings.secondsRemaining)-elapsed);$('timer').textContent=`${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;$('timer').classList.toggle('lb-low',settings.timerRunning&&s<=120);}
function zoneTile(row,[zone,label,keyName,code]){
  const z=row.zones?.[zone]||{completed:0,total:3};const has=(row.keys||[]).includes(code);const score=Number(row.scores?.[zone])||0;
  return `<div class="lb-zone ${has?'on':z.completed?'mid':''}"><span class="lb-zone-name">${label}</span><strong>${score}</strong><span class="lb-zone-key">${has?'✓ '+keyName:`${Number(z.completed)||0}/${Number(z.total)||3} sign-offs`}</span></div>`;
}
async function refresh(){
  try{
    const d=await getLeaderboard();settings=d.settings;lastFetch=Date.now();
    $('round').textContent=`Rotation ${settings.activeRound} of 3`;
    UI?.line('status',settings.timerRunning?'Live rotation in progress':'Timer paused or not yet started','info');
    $('lastUpdated').textContent=`Updated at ${UI?.stamp?.()||'now'}`;tick();
    if(!d.teams?.length){$('board').innerHTML='<div class="empty-state">No groups are available yet. Run the database seed script.</div>';return;}
    const restored=d.teams.filter(t=>t.finale?.completed).length;
    $('lb-restored').textContent=`${restored} / ${d.teams.length}`;
    $('lb-keys').textContent=`${d.teams.reduce((n,t)=>n+(Number(t.keyCount)||0),0)} / ${d.teams.length*3}`;
    $('board').innerHTML=d.teams.map(row=>{
      const score=Number(row.totalScore)||0;const pct=Math.max(0,Math.min(100,score/3));const r=Number(row.rank)||0;
      const gained=previous.has(row.team)&&score>previous.get(row.team);previous.set(row.team,score);
      const finale=row.finale?.completed?`<span class="lb-finale done">SYSTEM RESTORED · ${Number(row.finale.bestScore)||0}</span>`:row.finaleReady?'<span class="lb-finale ready">FINAL MISSION UNLOCKED</span>':`<span class="lb-finale">${Number(row.keyCount)||0}/3 keys</span>`;
      return `<article class="lb-row ${r===1&&score>0?'is-leader':''} ${row.finale?.completed?'is-restored':''} ${gained?'lb-gain':''}"><div class="lb-rank">${r}</div><div class="lb-main"><div class="lb-name">${htmlEscape(row.name)}</div>${finale}<div class="lb-bar"><span style="width:${pct}%"></span></div></div><div class="lb-zones">${ZONES.map(z=>zoneTile(row,z)).join('')}</div><div class="lb-score">${score}<small>/ 300</small></div></article>`;
    }).join('');
  }catch(e){
    UI?.line('status',`Leaderboard update failed: ${e.message}`,'error');
    $('lastUpdated').textContent='Last update failed';
    if(!$('board').querySelector('.lb-row'))$('board').innerHTML='<div class="empty-state">Unable to load the leaderboard. Check the application server and database.</div>';
  }
}

/* ---------- Facilitator-only slides ---------- */
const SLIDES=['board','jobs','survey'];let slide=0;
function readSurvey(){try{return localStorage.getItem(SURVEY_KEY)||'';}catch{return '';}}
function renderSurvey(){
  const url=readSurvey();const box=$('lb-qr');
  const svg=url?qrSvg(url):null;
  box.innerHTML=svg||'<p class="lb-qr-missing">No survey link set yet.<br><small>Staff control → Projector → Survey link</small></p>';
  $('lb-survey-url').textContent=url?url.replace(/^https?:\/\//,''):'';
}
function showSlide(i){
  slide=(i+SLIDES.length)%SLIDES.length;
  document.querySelectorAll('[data-slide]').forEach(s=>{s.hidden=s.dataset.slide!==SLIDES[slide];});
  $('lb-slide-count').textContent=`${slide+1} / ${SLIDES.length}`;
  if(SLIDES[slide]==='survey')renderSurvey();
  window.scrollTo({top:0});
}

/* ---------- Opening briefing (about 2 minutes) ---------- */
const BEATS=[
  {ms:5000,cls:'alarm',html:'<div class="br-alarm">⚠</div><p class="br-kicker">INCOMING ALERT</p>'},
  {ms:6000,html:'<p class="br-kicker">NORTHSTAR SYSTEMS · MONDAY · 08:31</p><h1 class="br-big">Something has gone<br><span>very wrong.</span></h1>'},
  {ms:7000,feed:[['08:31','A van has crashed into the power cabinet outside HQ. The building is running on battery.','bad']]},
  {ms:7000,feed:[['08:41','Overnight: hundreds of failed logins. Someone is trying to break into staff accounts.','warn']]},
  {ms:7000,feed:[['08:39','Helpdesk: “I could see someone’s home address on the staff portal??”','warn']]},
  {ms:7000,feed:[['08:52','A badge belonging to someone on holiday just opened the side door.','bad']]},
  {ms:7000,feed:[['08:55','Reception: an “engineer” nobody booked wants to get into the server room.','bad']]},
  {ms:7000,html:'<p class="br-kicker">08:47 · EMERGENCY RESPONSE REQUESTED</p><h1 class="br-big">Northstar needs a<br><span>response team.</span></h1><p class="br-sub">That’s you.</p>'},
  {ms:11000,html:'<p class="br-kicker">THREE CRISES · THREE RECOVERY KEYS</p><div class="br-zones"><div class="br-z train"><b>◎ TRAIN IT</b><span>Find the attackers in the login data and rebuild the detector.</span></div><div class="br-z fix"><b>{ } FIX IT</b><span>Break the staff portal, report the bugs, patch it and prove it.</span></div><div class="br-z defend"><b>⬡ DEFEND IT</b><span>Run the office on battery power and stop the intruder.</span></div></div>'},
  {ms:11000,html:'<p class="br-kicker">HOW YOU WORK</p><div class="br-how"><div><b>A</b><span>investigates &amp; discovers</span></div><div><b>B</b><span>builds, tests &amp; responds</span></div><div><b>A + B</b><span>share codes, decide together, sign off with Mission Control</span></div></div>'},
  {ms:7000,html:'<p class="br-kicker">YOUR OBJECTIVE</p><h1 class="br-big">Collect all three keys.<br><span>Restore Northstar.</span></h1>'},
  {ms:6000,countdown:5},
];
const brief={i:0,timer:null,paused:false,running:false};
function beatHtml(b){
  if(b.feed)return `<p class="br-kicker">INCIDENT FEED · NS-2611</p><div class="br-feed">${b.feed.map(([t,m,k])=>`<div class="br-msg ${k}"><time>${t}</time>${htmlEscape(m)}</div>`).join('')}</div>`;
  if(b.countdown)return '<p class="br-kicker">DEPLOYING RESPONSE TEAMS IN</p><div class="br-count" id="br-count">5</div>';
  return b.html;
}
function playBeat(){
  clearTimeout(brief.timer);
  const b=BEATS[brief.i];if(!b){finishBriefing(true);return;}
  const stage=$('br-stage');stage.className='br-stage'+(b.cls?' br-mode-'+b.cls:'');stage.innerHTML=beatHtml(b);
  stage.classList.remove('br-in');void stage.offsetWidth;stage.classList.add('br-in');
  $('br-progress').style.width=`${(brief.i/BEATS.length)*100}%`;
  if(b.countdown){let n=b.countdown;const step=()=>{if(brief.paused){brief.timer=setTimeout(step,250);return;}const c=$('br-count');if(c)c.textContent=String(n);if(n<=0){finishBriefing(true);return;}n--;brief.timer=setTimeout(step,1000);};step();return;}
  const wait=()=>{if(brief.paused){brief.timer=setTimeout(wait,250);return;}brief.i++;playBeat();};
  brief.timer=setTimeout(wait,b.ms);
}
async function finishBriefing(deploy){
  clearTimeout(brief.timer);brief.running=false;
  const stage=$('br-stage');
  if(deploy){
    stage.className='br-stage br-in';stage.innerHTML='<h1 class="br-big"><span>TEAMS DEPLOYED</span></h1><p class="br-sub" id="br-timer-msg">Starting the rotation timer…</p>';
    $('br-progress').style.width='100%';
    try{await facilitatorAction('start_timer');$('br-timer-msg').textContent='Rotation timer started. Good luck.';}
    catch(e){$('br-timer-msg').textContent=`Timer NOT started (${e.message}). Start it from Staff control.`;}
    await refresh();
    await new Promise(r=>setTimeout(r,2600));
  }
  $('lb-brief').hidden=true;showSlide(0);
  try{if(document.fullscreenElement)await document.exitFullscreen();}catch{}
}
async function startBriefing(){
  $('lb-brief').hidden=false;$('br-start').hidden=true;$('br-controls').hidden=false;
  try{await document.documentElement.requestFullscreen?.();}catch{}
  brief.i=0;brief.paused=false;brief.running=true;playBeat();
}
function openBriefing(){
  $('lb-brief').hidden=false;$('br-start').hidden=false;$('br-controls').hidden=true;
  $('br-stage').className='br-stage';$('br-stage').innerHTML='<p class="br-kicker">OPENING BRIEFING · ABOUT 2 MINUTES</p><h1 class="br-big">Ready when you are.</h1><p class="br-sub">When it finishes, the leaderboard appears and the rotation timer starts automatically.</p>';
  $('br-progress').style.width='0%';
}
function wireFacilitator(){
  document.body.classList.add('lb-is-staff');document.body.append($('lb-brief'),$('lb-nav'));$('lb-nav').hidden=false;
  $('lb-prev').onclick=()=>showSlide(slide-1);$('lb-next').onclick=()=>showSlide(slide+1);
  $('lb-play-brief').onclick=openBriefing;$('br-start').onclick=startBriefing;
  $('br-pause').onclick=()=>{brief.paused=!brief.paused;$('br-pause').textContent=brief.paused?'▶ Resume':'❚❚ Pause';};
  $('br-skip').onclick=()=>{if(!brief.running)return;brief.i=BEATS.length-1;brief.paused=false;$('br-pause').textContent='❚❚ Pause';playBeat();};
  $('br-cancel').onclick=()=>{brief.running=false;finishBriefing(false);};
  document.addEventListener('keydown',e=>{
    if(['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName))return;
    if(!$('lb-brief').hidden){if(e.key===' '&&brief.running){e.preventDefault();$('br-pause').click();}if(e.key==='Escape')$('br-cancel').click();return;}
    if(e.key==='ArrowRight'||e.key==='PageDown'){e.preventDefault();showSlide(slide+1);}
    if(e.key==='ArrowLeft'||e.key==='PageUp'){e.preventDefault();showSlide(slide-1);}
  });
  window.addEventListener('storage',e=>{if(e.key===SURVEY_KEY&&SLIDES[slide]==='survey')renderSurvey();});
  if(new URLSearchParams(location.search).get('briefing')==='1')openBriefing();
}
getSession().then(s=>{isFacilitator=Boolean(s.facilitator);if(isFacilitator)wireFacilitator();}).catch(()=>{});
refresh();setInterval(refresh,5000);setInterval(tick,1000);
