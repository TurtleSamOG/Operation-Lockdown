// Operation Lockdown shared API. Keep all exports and request formats stable for zone developers.
// Task answers are graded server-side; browser results are not trusted scores.
const BASE = '/api';
let csrf = null;
const report = status => document.dispatchEvent(new CustomEvent('lockdown:connection',{detail:{status}}));

async function rawRequest(path, options = {}) {
  let response;
  try {
    response = await fetch(BASE + path, {credentials:'same-origin',cache:'no-store', ...options});
    report('online'); // Even 401 / 403 proves the server responded.
  } catch (cause) {
    report('offline');
    const error = new Error('Cannot reach the application server. Check Laragon is running, then reload the page.');
    error.status = 0;
    error.cause = cause;
    throw error;
  }
  let result;
  try {result = await response.json();}
  catch {const error = new Error(`Server returned an unexpected response (HTTP ${response.status}). Check your PHP error log.`);error.status=response.status;throw error;}
  if (!response.ok || result?.ok === false) {
    const error = new Error(result?.error || `Request failed (HTTP ${response.status})`);
    error.status = response.status;
    throw error;
  }
  return result;
}

export async function getSession() {
  const result = await rawRequest('/session.php');
  csrf = result.csrfToken;
  return result;
}
async function request(path, options = {}) {
  if(options.method && options.method !== 'GET') {
    if(!csrf) await getSession();
    options.headers = {'Content-Type':'application/json', 'X-CSRF-Token':csrf, ...(options.headers||{})};
  }
  const result = await rawRequest(path, options);
  if(result.csrfToken) csrf=result.csrfToken;
  return result;
}
const post = (path, body) => request(path,{method:'POST',body:JSON.stringify(body)});
export const loginTeam = (teamCode, unitCode='1', groupSlug='', workstation='A') => post('/login.php', {teamCode,unitCode,team:groupSlug,workstation});
export const logoutTeam = () => post('/logout.php', {});
export const getTeamState = () => request('/team-state.php');
export const getTasks = zone => request(`/tasks.php?zone=${encodeURIComponent(zone)}`);
export const submitTask = (zone,taskId,result) => post('/submit-task.php',{zone,taskId,result});
export const completeZone = zone => post('/complete-zone.php',{zone});
export const getLeaderboard = () => request('/leaderboard.php');
export const getFinaleQuestions = () => request('/finale-questions.php');
export const submitFinale = answers => post('/submit-finale.php',{answers});
export const loginFacilitator = (username,password) => post('/facilitator-login.php',{username,password});
export const getFacilitatorState = () => request('/facilitator-state.php');
export const facilitatorAction = (action,fields={}) => post('/facilitator-action.php',{action,...fields});
