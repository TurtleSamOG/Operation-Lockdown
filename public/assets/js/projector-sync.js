/** Projector sync client (facilitator only).
 * Talks to the OPTIONAL add-on endpoint /api/projector-cue.php. If that file is not deployed (404),
 * `available` stays false and the pages behave exactly like single-machine mode.
 */
import {getSession} from './api.js';

const URL = '/api/projector-cue.php';
let csrf = null;
async function call(method, body) {
  if (method === 'POST' && !csrf) csrf = (await getSession()).csrfToken;
  const send = () => fetch(URL, {method, credentials:'same-origin', cache:'no-store',
    headers: method === 'POST' ? {'Content-Type':'application/json', 'X-CSRF-Token':csrf} : {}, body: body ? JSON.stringify(body) : undefined});
  let res = await send();
  if (res.status === 419 && method === 'POST') { csrf = (await getSession()).csrfToken; res = await send(); }
  let data = null; try { data = await res.json(); } catch { /* non-JSON (e.g. 404 page) */ }
  if (!res.ok || !data?.ok) throw Object.assign(new Error(data?.error || `HTTP ${res.status}`), {status:res.status});
  return data;
}

export const projectorSync = {
  available: false,
  /** Check once whether the add-on endpoint exists and this browser is a facilitator. */
  async detect() {
    try { const d = await call('GET'); this.available = true; return d; }
    catch { this.available = false; return null; }
  },
  read: () => call('GET'),
  briefing: () => call('POST', {action:'briefing'}),
  slide: n => call('POST', {action:'slide', slide:n}),
  stop: () => call('POST', {action:'stop'}),
  survey: url => call('POST', {action:'survey', url}),
};
