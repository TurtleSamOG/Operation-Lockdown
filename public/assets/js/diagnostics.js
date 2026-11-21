import {getSession,getLeaderboard} from './api.js';
const $=id=>document.getElementById(id);
const button=$('runDiagnostics');
const UI=window.LockdownUI;
function set(id,status,msg){const el=$(id);if(!el)return;el.className=`diagnostic-value ${status}`;el.textContent=msg;}
async function check(){
  if(!button)return;
  UI?.busy(button,true,'Checking…');
  set('apiTestStatus','pending','Checking…');set('dbTestStatus','pending','Checking…');set('sessionTestStatus','pending','Checking…');
  let api=false, db=false, session=false;
  try{
    const info=await getSession();
    api=true;session=!!info.loggedIn;
    set('apiTestStatus','pass','PASS · PHP responding');
    set('sessionTestStatus',session?'pass':'neutral',session?'Logged in':'No group logged in');
  }catch(err){set('apiTestStatus','fail','FAIL · API unavailable');set('sessionTestStatus','fail','Unavailable');UI?.line('diagnosticMessage',`API check failed: ${err.message}`,'error');}
  try{
    const data=await getLeaderboard();db=Array.isArray(data.teams);
    set('dbTestStatus',db?'pass':'fail',db?'PASS · Database responding':'FAIL · Invalid response');
  }catch(err){set('dbTestStatus','fail','FAIL · Database or API error');UI?.line('diagnosticMessage',`Leaderboard check failed: ${err.message}`,'error');}
  if(api&&db){UI?.line('diagnosticMessage',`Checks passed. PHP responded and the leaderboard returned valid group data. ${session?'This browser has an active group session.':'Sign in above to test team progress.'}`,'success');UI?.notify('PHP and database checks passed.','success','Connection verified');}
  else{UI?.notify('At least one check failed. Review the results below.','error','Diagnostics incomplete');}
  $('diagnosticTime').textContent='Last checked: '+new Intl.DateTimeFormat('en-GB',{hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).format(new Date());
  UI?.busy(button,false);
}
button?.addEventListener('click',check);
const toggle=$('togglePin'), pin=$('pin');
toggle?.addEventListener('click',()=>{const show=pin.type==='password';pin.type=show?'text':'password';toggle.textContent=show?'Hide':'Show';toggle.setAttribute('aria-label',show?'Hide access code':'Show access code');});
check();
