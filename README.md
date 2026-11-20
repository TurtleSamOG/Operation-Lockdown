# Operation Lockdown 2.0 — Team starter

One PHP website, three zones, two computers per zone, one shared database, one live leaderboard. This is a **starter structure**, not a completed application.

## Team branches and owners
- **Szymon:** `dev/main-system` — project lead and main system.
- **Vanessa:** `dev/train-finale` — AI lab and final mission.
- **Albert:** `dev/fix-it` — portal and security fixes.
- **Alex:** `dev/defend-it` — map and incident response.

## Owners
- **Szymon (Developer 1):** `main-system/`, `database/`, `public/index.php`, `public/leaderboard/`, shared API implementation.
- **Vanessa (Developer 2):** `train-finale/`, `public/train/`, `public/finale/`.
- **Albert (Developer 3):** `fix-it/`, `public/fix/`.
- **Alex (Developer 4):** `defend-it/`, `public/defend/`.
- **Shared (agree before editing):** `shared/`, `public/assets/`, `docs/`.

## How to run locally
Install PHP; open a terminal in this repository and run:

```bash
php -S localhost:8080 -t public
```

Browse to http://localhost:8080. This only shows placeholder pages; database/API integration is not yet implemented. Use Laragon or a separate local MariaDB for backend testing.

## Deployment notes
Hetzner/Caddy serves the `public/` directory. **Do not put database credentials, `.env`, SQL dumps or private files in `public/`.** The backend lives in `main-system/` (outside the web root). Deployment will require the correct `public` path and read permissions.

## Working together
1. Commit the structure on `main`.
2. Update each existing developer branch from `main` BEFORE work begins.
3. Edit only your owned folders and the agreed entry page.
4. Make small commits and open pull requests into `main`.
5. Merge/test regularly; don't leave all integration until Wednesday.

See `docs/API-CONTRACT.md` and `docs/BUILD-ORDER.md`.
