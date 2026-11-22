import {getSession,loginTeam,logoutTeam,getTeamState} from './api.js';
const $=id=>document.getElementById(id);
const UI=window.LockdownUI;
const keyTitles={train:'AI Defence Activated',fix:'Portal Secured',defend:'Threat Contained'};
const escapeHTML=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let poll=null;let lastScore=null;let firstLoad=true;
function showLogin(){
  $('loginCard').classList.remove('hidden');$('teamCard').classList.add('hidden');
  if(poll){clearInterval(poll);poll=null;}
  renderMissions(null);
}
// Mission cards, key chips and finale link mirror the server's team state only.
function renderMissions(s){
  for(const zone of Object.keys(keyTitles)){
    const tag=document.querySelector(`[data-state="${zone}"]`);if(!tag)continue;
    const z=s?.zones?.[zone];
    tag.className='hb-card-state'+(z?.keyEarned?' done':z?.completed?' progress':'');
    tag.textContent=!s?`Key: ${keyTitles[zone]}`:z?.keyEarned?`✓ ${keyTitles[zone]} recovered`:z?.completed?`${z.completed}/${z.total} sign-offs · ${Number(s.scores?.[zone])||0} pts`:`Not started · key: ${keyTitles[zone]}`;
  }
  const keys=$('hb-keys');
  if(keys) keys.innerHTML=s?Object.entries(keyTitles).map(([zone,title])=>{const on=Boolean(s.zones?.[zone]?.keyEarned);return `<span class="hb-key ${on?'on':''}">${on?'✓':'◇'} ${escapeHTML(title)}</span>`;}).join(''):'';
  const finale=$('hb-finale');if(!finale)return;
  const done=Boolean(s?.finale?.completed),ready=Boolean(s?.finaleReady);
  finale.classList.toggle('is-ready',ready&&!done);finale.classList.toggle('is-done',done);
  $('hb-finale-title').textContent=done?'SYSTEM RESTORED — mission complete':ready?'Unlocked — restore Northstar now':'Locked until all three keys are recovered';
  $('hb-finale-sub').textContent=!s?'Sign in to see your group\'s keys.':done?`Final mission score: ${Number(s.finale.bestScore)||0}/100`:`${s.keys.length} of 3 recovery keys collected by your group.`;
}
function showTeam(){ $('loginCard').classList.add('hidden');$('teamCard').classList.remove('hidden'); }
async function refresh(){
  try{
    const s=await getTeamState();showTeam();
    $('welcome').textContent=s.groupName;
    $('unitLabel').textContent=`Working Unit ${s.workingUnit||'—'} · Workstation ${s.workstation||'A'} · Synced with your group`;
    $('totalScore').textContent=s.totalScore;
    $('keysCount').textContent=`${s.keys.length} / 3`;
    $('finaleStatus').textContent=s.finale?.completed?'Completed':(s.finaleReady?'Unlocked':'Locked');
    $('finaleStatus').className=`pill ${s.finale?.completed||s.finaleReady?'good':'warn'}`;
    $('zoneProgress').innerHTML=Object.entries(keyTitles).map(([key,title])=>{
      const stage=s.zones?.[key]||{completed:0,total:0,keyEarned:false};
      const pct=stage.total ? Math.round(stage.completed/stage.total*100):0;
      return `<div class="zone-progress-row"><div class="row"><div><strong>${escapeHTML(title)}</strong><div class="muted">${stage.completed}/${stage.total} required tasks · ${Number(s.scores?.[key])||0} points</div></div><span class="pill ${stage.keyEarned?'good':'warn'}">${stage.keyEarned?'✓ Key recovered':'In progress'}</span></div><div class="progress"><span style="width:${pct}%"></span></div></div>`;
    }).join('');
    renderMissions(s);
    if(!firstLoad && lastScore!==null && s.totalScore>lastScore){
      const gain=s.totalScore-lastScore;UI?.notify(`Your group gained ${gain} point${gain!==1?'s':''}. The shared dashboard is updated.`,'success','Progress synced');
    }
    firstLoad=false;lastScore=s.totalScore;
    if(!poll) poll=setInterval(refresh,5000);
    return true;
  }catch(error){
    if(error.status===401){showLogin();}
    else UI?.line('teamMessage',`Progress could not load: ${error.message}`,'error');
    return false;
  }
}
$('loginForm').addEventListener('submit',async e=>{
  e.preventDefault();const button=$('loginSubmit');
  UI?.busy(button,true,'Authenticating…');
  UI?.line('loginMessage','Contacting the server and checking your group code…','info');
  try{
    const result=await loginTeam($('pin').value.trim(),$('unit').value,$('group').value,$('workstation').value);
    $('pin').value='';
    firstLoad=true;lastScore=null;
    const synced=await refresh();
    if(!synced) throw new Error('Your group was recognised, but its progress could not be loaded. Refresh and try again.');
    UI?.line('loginMessage','','info');
    UI?.line('teamMessage',`Login successful. ${result.groupName} — Unit ${result.workingUnit}, Workstation ${result.workstation}. Progress is connected.`,'success');
    UI?.notify(`${result.groupName}, Unit ${result.workingUnit}, Workstation ${result.workstation} is connected.`,'success','Login successful');
  }catch(error){
    UI?.line('loginMessage',`Login failed: ${error.message}`,'error');
    UI?.notify(error.message,'error','Could not sign in');
  }finally{UI?.busy(button,false);}
});
$('logout').addEventListener('click',async()=>{
  const button=$('logout');UI?.busy(button,true,'Switching…');
  try{await logoutTeam();showLogin();UI?.line('loginMessage','Signed out. Choose a group to continue.','success');UI?.notify('This workstation has signed out of the group.','success','Session ended');}
  catch(error){UI?.line('teamMessage',error.message,'error');UI?.notify(error.message,'error','Sign-out failed');}
  finally{UI?.busy(button,false);}
});
getSession().then(refresh).catch(error=>UI?.line('loginMessage',`Connection error: ${error.message}`,'error'));
