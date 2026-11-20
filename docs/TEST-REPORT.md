# Main System — test report (20 November 2026)

## Automated checks completed in this build environment

- PHP syntax checked across all PHP files: **PASS** (PHP 8.4 CLI).
- JavaScript syntax checked across all main-system JavaScript files: **PASS** (Node 22).
- Quiz catalogue test with all 12 sample tasks, including pass/fail grading: **PASS**.
- PHP local server smoke test: main page returned HTTP 200 and `/api/session.php` returned a valid session + CSRF token.
- `/system-demo/` returned HTTP 404 without `APP_ENV=local`, as intended for public environments.

## Important tests still required on Szymon's PC / Hetzner

This build environment does not have the project's MariaDB database or Laragon credentials, so **database integration is not yet verified**. Before merging or deploying:

1. Import `database/schema.sql` into the local `operation_lockdown_dev` database.
2. Configure the local `.env`, then run `php database/seed.php` and `php database/create-admin.php szymon`.
3. Log into Alpha on two separate browser sessions (workstation A and B); make a task submission on one, verify it appears on the other.
4. Collect all three recovery keys, verify the scoreboard and the finale submission.
5. Test Bravo and Charlie data separation; test multiple working units with the same big group.
6. Test facilitator login, timer, manual key and reset using fake results.
7. Repeat the essential tests against Hetzner after deployment, with `APP_ENV=production` and HTTPS.

## Integration handoff

Zone pages in `public/train/`, `public/fix/`, `public/defend/` and `public/finale/` were deliberately **not modified**. They remain the other developers' responsibility. The main system's built-in question bank contains demonstration content and needs real activity questions before the event.
