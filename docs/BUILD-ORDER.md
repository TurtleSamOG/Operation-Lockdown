# Build in this order

## Everyone — before programming
1. Agree task IDs, result formats and which files each developer owns.
2. Work on your own `dev/...` branch created from the shared `main` starter.
3. Do not change shared API names without notifying the group.

## Szymon (Developer 1) — Main System (code provided; test and integrate)
1. Make `/` home screen with team choice, PIN field and Start button.
2. Set up local database and `database/schema.sql` (teams, tasks, attempts, keys).
3. Build database connector using local environment config.
4. Make team-code login endpoint and PHP session.
5. Make `getTeamState()` endpoint. Test login in two browsers.
6. Make task submission endpoint; validate server-side and save best result.
7. Make zone completion + recovery key awarding.
8. Make public leaderboard that polls every few seconds.
9. Make protected facilitator reset/skip controls.

## Vanessa (Developer 2) — Train It and Finale
1. Make Train It page with workstation A/B selection.
2. A: Label simulated login events and save results.
3. B: Adjust detection rules and test a separate set.
4. Joint: Show final evaluation and complete zone.
5. Add a short optional fast-finisher challenge.
6. Make Final Mission page pulling all three zone results; allow any zone order.

## Albert (Developer 3) — Fix It
1. Make employee portal with safe mock staff data.
2. A: Discover security issues and file bug reports.
3. B: Apply simulated code fixes and run tests.
4. Joint: Retest and complete zone.
5. Add optional extension task.
6. Important: The exercise must not contain a genuine exploitable endpoint or real personal data.

## Alex (Developer 4) — Defend It
1. Make clickable town map.
2. Add office floor/room view.
3. A: Investigate alerts and share findings.
4. B: Select defensive actions and view consequences.
5. Joint: Resolve incident and complete zone.
6. Add optional secondary incident.

## Integration tests
- Two PCs log in with the same team and see shared progress.
- Different teams do not see or change one another's progress.
- All three zones can be played in any order.
- All keys appear on the leaderboard and unlock the finale.
- A full 25-minute run of each zone and the 9-minute finale works with first-time testers.

## State of the supplied build
The main system implementation is present. Your next steps: (1) create/import the local database, (2) configure `.env`, (3) seed team PINs and facilitator account, (4) test `/system-demo/`, (5) open a Pull Request into `main`. Vanessa, Albert and Alex continue independently with their assigned pages using `api.js`.
