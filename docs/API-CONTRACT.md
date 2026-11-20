# Shared agreement — do not rename without telling everyone

## Teams and zones
- Team identifiers: `alpha`, `bravo`, `charlie`
- Zone identifiers: `train`, `fix`, `defend`
- Recovery keys: `AI_DEFENCE_ACTIVATED`, `PORTAL_SECURED`, `THREAT_CONTAINED`
- Every zone has workstation `A` (two students) and `B` (three students).

## Agreed JavaScript functions
See `public/assets/js/api.js`: `loginTeam(teamCode)`, `getTeamState()`, `submitTask(zone, taskId, result)`, `completeZone(zone)`, `getLeaderboard()`.

## Example task submission (format to build to)
```json
{"zone":"train","taskId":"train-labels","result":{"score":75,"completed":true,"data":{"correct":6,"total":8}}}
```

## Example team state (Szymon (Developer 1) to implement)
```json
{"team":"alpha","scores":{"train":75,"fix":0,"defend":0},"keys":[],"completedTasks":["train-labels"]}
```

## Important rules
- Browser sends **work performed**, not a trusted final score. The server validates task answers/results before awarding points and keys.
- Store the **best valid result per task**; define attempt limits before scoring.
- Only the server can mark a zone complete or award a recovery key.
- Zone 3 always uses a baseline detector because team rotation order varies. Zone 1 performance affects the **finale**, not whether Zone 3 loads.
- Team PINs must be verified on the server and represented by server-side sessions; do not accept a team ID from the browser as proof of identity.
- Facilitator-only routes must be protected.
- The code above is a contract/example, **not a working backend**.
