import {getSession,loginFacilitator,getFacilitatorState,facilitatorAction} from './api.js';
const $=id=>document.getElementById(id);
let settings=null,loadedAt=Date.now();
function message(text,error=false){$('actionMessage').textContent=text;$('actionMessage').className=`message ${error?'error':'success'}`;}
function tick(){if(!settings)return;const d=settings.timerRunning?Math.floor((Date.now()-loadedAt)/1000):0;const seconds=Math.max(0,settings.secondsRemaining-d);$('currentTimer').textContent=`${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`;}
async function refresh(){
  try{const d=await getFacilitatorState();$('authCard').classList.add('hidden');$('controls').classList.remove('hidden');
    settings=d.settings;loadedAt=Date.now();tick();$('roundLabel').textContent=`Rotation ${settings.activeRound} of 3`; $('minutes').value=settings.roundMinutes;
    $('groupInfo').textContent='';
    for(const row of d.teams){const div=document.createElement('div');div.className='board-row';div.textContent=`${row.name}: ${row.totalScore}/300 points, ${row.keyCount}/3 keys. Train ${row.scores.train}, Fix ${row.scores.fix}, Defend ${row.scores.defend}.`;$('groupInfo').appendChild(div);}
  }catch(e){if(e.status===403){$('controls').classList.add('hidden');$('authCard').classList.remove('hidden');}else{message(e.message,true);}}
}
$('authForm').addEventListener('submit',async e=>{e.preventDefault();$('authMessage').textContent='Checking…';try{await loginFacilitator($('username').value,$('password').value);$('password').value='';$('authMessage').textContent='';await refresh();}catch(error){$('authMessage').textContent=error.message;$('authMessage').className='message error';}});
async function action(name,fields={}){try{await facilitatorAction(name,fields);message('Changes saved.');await refresh();}catch(error){message(error.message,true);}}
$('startTimer').onclick=()=>action('start_timer');
$('pauseTimer').onclick=()=>action('pause_timer');
$('resetTimer').onclick=()=>{if(confirm('Reset this rotation timer?'))action('reset_timer');};
$('nextRound').onclick=()=>{if(confirm('Move to the next rotation?'))action('next_round');};
$('resetRounds').onclick=()=>{if(confirm('Return to rotation 1 and clear the timer? Scores are preserved.'))action('reset_rounds');};
$('setMinutes').onclick=()=>action('set_minutes',{minutes:Number($('minutes').value)});
$('awardKey').onclick=()=>{if(confirm('Award this key manually?'))action('award_key',{team:$('targetGroup').value,zone:$('keyZone').value,reason:$('overrideReason').value});};
$('resetGroup').onclick=()=>{const team=$('targetGroup').value;const check=prompt(`To delete ALL progress for ${team}, type RESET`);if(check==='RESET')action('reset_group',{team,confirm:'RESET'});};
getSession().then(refresh).catch(e=>{$('authMessage').textContent=e.message;});setInterval(()=>{if(!$('controls').classList.contains('hidden'))refresh();},7000);setInterval(tick,1000);
