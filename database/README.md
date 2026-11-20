# Database

- `schema.sql`: import with a database administrator into `operation_lockdown_dev` (local) or `operation_lockdown` (Hetzner).
- `seed.php`: seeds Alpha/Bravo/Charlie, 3 working units per group and demo tasks; prints new team PINs **once**.
- `create-admin.php`: prompts for a facilitator password (minimum 12 characters) and hashes it.
- `reset-group-pin.php alpha`: regenerates a group's PIN if lost.

Never upload the real `.env`, PINs, backups, passwords or personal participant data to GitHub. See `docs/MAIN-SYSTEM-SETUP.md`.
