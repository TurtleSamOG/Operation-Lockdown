import {getSession,loginTeam,logoutTeam,getTeamState} from './api.js';
const $=id=>document.getElementById(id);
const msg=$('loginMessage');
const keyTitles={train:'AI Defence Activated',fix:'Portal Secured',defend:'Threat Contained'};
let poll=null;
function escapeHTML(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function showLogin(){ $('loginCard').classList.remove('hidden');$('teamCard').classList.add('hidden');if(poll)clearInterval(poll);}
function showTeam(){ $('loginCard').classList.add('hidden');$('teamCard').classList.remove('hidden'); }
async function refresh(){
  try{
    const s=await getTeamState();showTeam();
    $('welcome').textContent=s.groupName;
    $('unitLabel').textContent=`Working unit ${s.workingUnit || '—'} · Workstation ${s.workstation || 'A'} · Both PCs share this group's progress`;
    $('totalScore').textContent=s.totalScore;
    $('keysCount').textContent=`${s.keys.length} / 3`;
    $('finaleStatus').textContent=s.finale.completed?'Completed':(s.finaleReady?'Unlocked':'Locked');
    $('finaleStatus').className=`pill ${s.finaleReady?'good':'warn'}`;
    $('zoneProgress').innerHTML=Object.entries(keyTitles).map(([key,title])=>{
      const x=s.zones[key];return `<div class="row" style="margin:.75rem 0"><div><strong>${escapeHTML(title)}</strong><div class="muted small">${x.completed}/${x.total} required tasks • ${s.scores[key]} points</div></div><span class="pill ${x.keyEarned?'good':''}">${x.keyEarned?'Key collected':'In progress'}</span></div>`;
    }).join('');
    if(!poll)poll=setInterval(refresh,5000);
  }catch(e){if(e.status===401){showLogin();}else{msg.textContent=e.message;msg.className='message error';}}
}
$('loginForm').addEventListener('submit',async e=>{
  e.preventDefault();msg.textContent='Checking group code…';msg.className='message';
  try{await loginTeam($('pin').value,$('unit').value,$('group').value,$('workstation').value);$('pin').value='';await refresh();msg.textContent='';}
  catch(err){msg.textContent=err.message;msg.className='message error';}
});
$('logout').addEventListener('click',async()=>{try{await logoutTeam();showLogin();}catch(e){alert(e.message);}});
getSession().then(refresh).catch(e=>{msg.textContent=e.message;msg.className='message error';});
