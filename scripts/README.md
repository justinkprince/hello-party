# scripts/

Helper scripts, run from the repo root.

- `deploy.sh <tag-or-branch>`: run on the Mac; checks the ref out on the Pi over SSH and builds it (D-29, D-34). Verified in Phase 0.
- `health-check.sh`: run on the Mac; prints OK or FAIL for the server's URL. Verified in Phase 0 against the preview server only; `/api/health` arrives in Phase 2.
- `kiosk.sh`: runs on the Pi; opens the display in Chromium once the server answers (started by the labwc autostart).
- Backup script: Phase 6.

The Mac-side scripts read `PI_HOST` and `PI_USER` from `.env` or the environment; see `.env.example`. No secrets go in these scripts.
