# Operation Lockdown — shared developer contract (implemented)

Maintainer: **Szymon**. All zones import `public/assets/js/api.js`; do not call the database directly or invent duplicate login/scoring APIs. The PHP server is responsible for permission checks, answer validation, scoring and recovery keys.

## Groups, working units and zones

- Rotation groups (big groups, 11–13 students each): `alpha`, `bravo`, `charlie`.
- Each group has smaller working units `1`, `2`, `3`, with two computers per unit (workstation A and B).
- Both computers in Alpha unit 2 log in using the **same Alpha group PIN** and choose unit `2`. The first selects workstation **A**, the other **B**. Each browser gets its own session. All nine unit IDs across the three groups share the same backend.
- Zones: `train`, `fix`, `defend`, playable in **any order**.
- Keys: `AI_DEFENCE_ACTIVATED`, `PORTAL_SECURED`, `THREAT_CONTAINED`.
- Each zone has one required A task, B task and joint task, plus one optional bonus task. Other developers can change the challenge content in `main-system/lib/task-catalog.php` with Szymon, preserving task IDs.

## JavaScript usage

```js
import { loginTeam, getTeamState, getTasks, submitTask, completeZone, getLeaderboard,
         getFinaleQuestions, submitFinale } from '/assets/js/api.js';

// Only the hub normally logs in; this is shown for reference.
await loginTeam('EXAMPLE12345', '2', 'alpha', 'A'); // real PIN provided privately

const state = await getTeamState();
const { tasks } = await getTasks('train');
const result = await submitTask('train', 'train-labels', {
  answers: { t1: 'suspicious', t2: 'normal', t3: 'suspicious' }
});
if (result.passed) console.log('Task complete; group progress saved.');

// Only succeeds when required A, B and joint tasks pass in this zone:
const updated = await completeZone('train');

// Finale is independent of rotation order; unavailable until all 3 keys are earned.
const finale = await getFinaleQuestions();
if (finale.ready) {
  const outcome = await submitFinale({network:'verify',portal:'regression',response:'document'});
}
```

**Note:** Example answer values above are from the built-in placeholder questions. Vanessa/Albert/Alex should design real questions and ask Szymon to replace the placeholder tasks/answers on the backend. Do not embed correct answers in JS.

## Response shapes

`getTeamState()`:

```json
{
  "ok":true,"team":"alpha","group":"alpha","groupName":"Group Alpha","workingUnit":"2",
  "scores":{"train":67,"fix":0,"defend":0},"totalScore":67,
  "keys":["AI_DEFENCE_ACTIVATED"],"completedTasks":["train-labels"],
  "zones":{"train":{"completed":1,"total":3,"keyEarned":true,"finished":false}},
  "taskResults":{"train-labels":{"score":100,"passed":true,"attempts":1,"zone":"train"}},
  "finaleReady":false,"finale":{"bestScore":0,"completed":false,"attempts":0}
}
```

This is only an illustrative partial JSON response; the actual keys are earned only after all required tasks are passed.

`submitTask()` returns `score`, `correct`, `total`, `passed`, `scored`, `scoredAttemptsRemaining` and refreshed `teamState`. Scores are **computed by the server**, not trusted from the browser. The highest scored attempt per task contributes to the group total. Attempts are capped at 3 scored tries **per working unit and task**; further tries can still earn completion but not extra score.

`getLeaderboard()` is read-only and deliberately public for the projector. It shows three main groups and combines the best validated results from their working units. A team's zone score is the mean across three required tasks (0–100), summed across zones (0–300). The finale is tracked separately and used as a tiebreaker.

## What other developers should change (and not change)

- **Vanessa** owns `public/train/`, `public/finale/`, `train-finale/`.
- **Albert** owns `public/fix/`, `fix-it/`.
- **Alex** owns `public/defend/`, `defend-it/`.
- Do not edit `main-system/`, `database/`, or `public/api/` without checking with Szymon.
- To add a new challenge, propose its task ID, zone, station, questions, option IDs, correct answers and pass threshold to Szymon, who updates the server-side catalogue and reruns `php database/seed.php`.
- A-tasks can be submitted only by workstation A; B-tasks only by workstation B. Joint and bonus tasks can be submitted from either device.
- The **Fix It** employee portal must be a safe mock exercise. Never implement an actually exploitable authentication bypass or expose real staff information.
- Zone 3 works with a baseline detector regardless of order; Train It performance matters in the finale.

## Security requirements

Never commit `.env`, group PINs or facilitator passwords. Session cookies and CSRF tokens are handled by `api.js`. Admin endpoints are password protected. When testing use `APP_ENV=local`; on Hetzner use `APP_ENV=production`. Do not link to `/system-demo/` in the event UI; it is disabled in production.
