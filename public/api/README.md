# Public API — Main System (Szymon)

These PHP endpoints are implemented and load backend logic from `main-system/lib/` outside the web root. Each zone should use `public/assets/js/api.js`.

`session.php`, `login.php`, `logout.php`, `team-state.php`, `tasks.php`, `submit-task.php`, `complete-zone.php`, `leaderboard.php`, `finale-questions.php`, `submit-finale.php`, `facilitator-login.php`, `facilitator-state.php`, `facilitator-action.php`.

See `docs/API-CONTRACT.md`. Run `database/schema.sql`, `database/seed.php`, `database/create-admin.php` first.
