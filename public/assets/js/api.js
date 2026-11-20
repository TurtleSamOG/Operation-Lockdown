// Shared API contract — placeholders only. Szymon (Developer 1) implements endpoints.
// Other developers should import/use these functions, not invent their own API URLs.
const BASE = '/api';
async function request(path, options = {}) {
  const response = await fetch(BASE + path, {
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  });
  if (!response.ok) throw new Error(`API error ${response.status}`);
  return response.json();
}
export const loginTeam = (teamCode) => request('/login.php', { method: 'POST', body: JSON.stringify({ teamCode }) });
export const getTeamState = () => request('/team-state.php');
export const submitTask = (zone, taskId, result) => request('/submit-task.php', { method: 'POST', body: JSON.stringify({ zone, taskId, result }) });
export const completeZone = (zone) => request('/complete-zone.php', { method: 'POST', body: JSON.stringify({ zone }) });
export const getLeaderboard = () => request('/leaderboard.php');
