import {getLeaderboard} from './api.js';
const $=id=>document.getElementById(id);
let settings=null,lastFetch=0;
function htmlEscape(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function tick(){if(!settings)return;const elapsed=settings.timerRunning?Math.floor((Date.now()-lastFetch)/1000):0;const s=Math.max(0,settings.secondsRemaining-elapsed);$('timer').textContent=`${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;}
async function refresh(){
 try{
  const data=await getLeaderboard();settings=data.settings;lastFetch=Date.now();
  $('round').textContent=`Rotation ${settings.activeRound} of 3`;
  $('status').textContent=settings.timerRunning?'Timer running':'Timer paused';tick();
  $('board').innerHTML=data.teams.map(row=>{
   const pct=Math.max(0,Math.min(100,row.totalScore/3));
   const keys=row.keys.map(key=>`<span class="key">${htmlEscape(key.replaceAll('_',' '))}</span>`).join('') || '<span class="muted small">No recovery keys yet</span>';
   return `<div class="board-row"><div class="row"><div><span class="pill">#${row.rank}</span> <h3 style="display:inline;margin-left:.45rem">${htmlEscape(row.name)}</h3><div class="muted small">${row.keyCount}/3 keys collected</div></div><div class="score">${row.totalScore}<span class="muted tiny"> / 300</span></div></div><div class="progress" style="margin:.85rem 0"><span style="width:${pct}%"></span></div><div class="details"><span>AI ${row.scores.train}</span><span>Portal ${row.scores.fix}</span><span>Defence ${row.scores.defend}</span><span>Finale ${row.finale.completed?'Complete':'Pending'}</span></div><div class="badges">${keys}</div></div>`;
  }).join('');
 }catch(e){$('status').textContent=`Cannot load live results: ${e.message}`;}
}
refresh();setInterval(refresh,5000);setInterval(tick,1000);
