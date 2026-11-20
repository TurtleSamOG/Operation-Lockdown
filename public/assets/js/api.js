// Shared Operation Lockdown API: use these exports in Train It, Fix It and Defend It.
// All scores are calculated/validated by PHP. Never send a trusted score from the browser.
const BASE = '/api';
let csrf = null;
export async function getSession() {
  const result = await rawRequest('/session.php');
  csrf = result.csrfToken;
  return result;
}
async function rawRequest(path, options = {}) {
  const response = await fetch(BASE + path, {credentials: 'same-origin', cache:'no-store', ...options});
  const result = await response.json().catch(() => ({ok:false,error:'Unexpected server response.'}));
  if (!response.ok || result.ok === false) {
    const error = new Error(result.error || `API error ${response.status}`);
    error.status = response.status;
    throw error;
  }
  return result;
}
async function request(path, options = {}) {
  if (options.method && options.method !== 'GET') {
    if (!csrf) await getSession();
    options.headers = {'Content-Type':'application/json', 'X-CSRF-Token':csrf, ...(options.headers||{})};
  }
  const result = await rawRequest(path, options);
  if (result.csrfToken) csrf = result.csrfToken;
  return result;
}
const post = (path, body) => request(path,{method:'POST',body:JSON.stringify(body)});
// teamCode = the private team PIN. unitCode is 1, 2 or 3. groupSlug optional.
export const loginTeam = (teamCode, unitCode='1', groupSlug='', workstation='A') => post('/login.php', {teamCode, unitCode, team:groupSlug, workstation});
export const logoutTeam = () => post('/logout.php', {});
export const getTeamState = () => request('/team-state.php');
export const getTasks = (zone) => request(`/tasks.php?zone=${encodeURIComponent(zone)}`);
// result format: { answers: { questionId: 'optionId' } }. Server grades answers.
export const submitTask = (zone, taskId, result) => post('/submit-task.php', {zone, taskId, result});
export const completeZone = (zone) => post('/complete-zone.php', {zone});
export const getLeaderboard = () => request('/leaderboard.php');
export const getFinaleQuestions = () => request('/finale-questions.php');
export const submitFinale = (answers) => post('/submit-finale.php',{answers});
export const loginFacilitator = (username,password) => post('/facilitator-login.php',{username,password});
export const getFacilitatorState = () => request('/facilitator-state.php');
export const facilitatorAction = (action,fields={}) => post('/facilitator-action.php',{action,...fields});
