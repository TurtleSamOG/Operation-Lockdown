# Szymon — Main System setup and review guide

This package completes the main-system foundation, based on the **team-updated starter**. It does **not** modify Vanessa's, Albert's or Alex's zone pages.

## 1. Add code to GitHub correctly

1. In VS Code, switch to `dev/main-system` and check for uncommitted changes (`git status`).
2. Extract the **main-system patch ZIP** into your repository's root. Keep its folders and filenames. Don't extract directly into `public/`.
3. Check `git diff` and read `docs/API-CONTRACT.md`. Do not overwrite colleagues' changes to shared files without discussing them.
4. Commit and push on your branch. Open a Pull Request into `main` when tested. Merge sooner rather than waiting until Wednesday.

## 2. Prepare local Laragon database

1. Start Laragon's web server and MySQL/MariaDB.
2. Create `operation_lockdown_dev` using HeidiSQL or another local database tool:

```sql
CREATE DATABASE operation_lockdown_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

3. Select that database and import `database/schema.sql`. This creates groups, working units, tasks, results, keys, facilitator accounts and the event timer.
4. Copy `.env.example` to `.env` in the **repository root**. Set `DB_USER`, `DB_PASSWORD` and `DB_NAME` to your actual local database credentials. Laragon's root account may have an empty password; if yours differs, change it. `.env` is ignored by Git.
5. From the project root in Laragon Terminal run:

```sh
php database/seed.php
php database/create-admin.php szymon
```

6. `seed.php` prints **three new group PINs once**. Store them privately. They are not kept in plaintext. If you forget one, regenerate only that group:

```sh
php database/reset-group-pin.php alpha
```

## 3. Run and test locally

Use your working Laragon local site, or from the repository root:

```sh
php -S localhost:8080 -t public
```

1. Open the main page. Select Group Alpha, Unit 1, workstation A and its generated PIN; click **Join mission**.
2. Open a second private/incognito browser, log in as Alpha Unit 1, workstation B with the same PIN. Both should see the same group score (each browser has its own cookie).
3. On **local only**, visit `/system-demo/`. Select Train It and complete A on workstation A, B on workstation B and the joint demo task from either browser. Submit answers and click **Collect completed zone key**.
4. Refresh the other browser and `/leaderboard/`. The task completion, score and key should match.
5. Repeat for Fix It and Defend It; the three keys should set `finaleReady: true`.
6. Visit `/facilitator/`, sign in with your admin account, test start/pause/extend timer, manual key, and *only with fake data* group reset.
7. Verify that Alpha's tasks do **not** change Bravo or Charlie.

## 4. What's implemented

- Team PINs hashed with PHP password hashing, server sessions, team/unit separation.
- Three rotation groups and 3 working units per group; group scores use each task's best valid submitted score.
- Server-side quiz/rubric validation, 3 scored attempts per unit per task; additional practice attempts can still pass.
- Required A/B/joint tasks and optional bonus tasks in all zones; completion awards a recovery key.
- Shared JavaScript API that zone developers can import.
- Projector leaderboard polling every 5 seconds, no individual student information.
- Protected facilitator login, reset, manual key award, round duration and timer controls.
- Server-scored final mission endpoint for Vanessa.
- Local-only test bench at `/system-demo/`.

## 5. Deploy to Hetzner later (after local tests)

1. Keep `test.ratiolearn.com` and AI1 unchanged. Caddy already serves `lockdown.ratiolearn.com` from `/var/www/lockdown/public` using PHP-FPM.
2. Deploy the repository such that `main-system/` and `.env` are **outside** the `public` directory. The exact project root must be `/var/www/lockdown` for this layout, or update Caddy's document root accordingly.
3. Copy `.env.example` to `.env` privately on the server. Change to `APP_ENV=production`, `DB_NAME=operation_lockdown`, and the dedicated MariaDB account. Do not commit the real credentials.
4. Import `database/schema.sql` into the existing Hetzner `operation_lockdown` database **as a database administrator**, since your restricted app user is only granted data permissions.
5. Run `php database/seed.php` and `php database/create-admin.php szymon` from `/var/www/lockdown`. The app user needs SELECT/INSERT/UPDATE/DELETE on the application database for this seed.
6. Ensure the Caddy/PHP-FPM user can read the project files and `.env`. Do not make `.env` publicly served; it is outside `public/`.
7. Confirm the live HTTPS site, both browser sessions, leaderboard and facilitator controls on at least two student computers.

**Warning:** The demo quiz content in `main-system/lib/task-catalog.php` and `main-system/lib/finale.php` is sample material. Developers must replace the questions/answers with the actual zone content before the event. Perform a full rehearsal with students and a backup plan for internet outages.
