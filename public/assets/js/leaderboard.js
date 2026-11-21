import {getLeaderboard} from './api.js';
const $=id=>document.getElementById(id);const UI=window.LockdownUI;
let settings=null,lastFetch=0;
function htmlEscape(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function tick(){if(!settings)return;const elapsed=settings.timerRunning?Math.floor((Date.now()-lastFetch)/1000):0;const s=Math.max(0,Number(settings.secondsRemaining)-elapsed);$('timer').textContent=`${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;}
async function refresh(){
  try{
    const d=await getLeaderboard();settings=d.settings;lastFetch=Date.now();
    $('round').textContent=`Rotation ${settings.activeRound} of 3`;
    UI?.line('status',settings.timerRunning?'Live rotation in progress':'Timer is paused or not yet started','info');
    $('lastUpdated').textContent=`Updated at ${UI?.stamp?.()||'now'}`;tick();
    if(!d.teams?.length){$('board').innerHTML='<div class="empty-state">No groups are available yet. Run the database seed script.</div>';return;}
    $('board').innerHTML=d.teams.map(row=>{
      const score=Number(row.totalScore)||0;const pct=Math.max(0,Math.min(100,score/3));
      const keys=(row.keys||[]).map(key=>`<span class="key">✓ ${htmlEscape(String(key).replaceAll('_',' '))}</span>`).join('')||'<span class="muted small">No recovery keys collected yet</span>';
      const r=Number(row.rank)||0;
      return `<article class="board-row ${r===1&&score>0?'is-leader':''}"><div class="row"><div><span class="rank">POSITION ${r}</span><div class="group-name">${htmlEscape(row.name)}</div><div class="muted small">${Number(row.keyCount)||0} of 3 recovery keys</div></div><div class="score">${score}<span class="muted tiny"> / 300</span></div></div><div class="progress" style="margin-top:16px"><span style="width:${pct}%"></span></div><div class="details"><span>AI · ${Number(row.scores?.train)||0}</span><span>Portal · ${Number(row.scores?.fix)||0}</span><span>Defence · ${Number(row.scores?.defend)||0}</span><span>Finale · ${row.finale?.completed?'Complete':'Pending'}</span></div><div class="badges">${keys}</div></article>`;
    }).join('');
  }catch(e){
    UI?.line('status',`Leaderboard update failed: ${e.message}`,'error');
    $('lastUpdated').textContent='Last update failed';
    if(!$('board').querySelector('.board-row'))$('board').innerHTML='<div class="empty-state">Unable to load the leaderboard. Check the application server and database.</div>';
  }
}
refresh();setInterval(refresh,5000);setInterval(tick,1000);
