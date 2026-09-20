# AGENTS.md: start here

**One agent at a time. Phases run in order. Never run agents in parallel.**

## Read order
1. `AGENTS.md` (this file), then `PROGRESS.md`, then your phase doc in `docs/phases/`.
2. Read `docs/requirements.md` by ID (grep the ID) instead of in full.
3. Read `docs/contracts.md` and `docs/design.md` on demand.
4. Never read `docs/archive/` unless Justin asks.

## Project in 6 lines
- A Hello Kitty themed "party on the TV" for a 9-year-old's home birthday, Sat 9/26/2026, about 16 kids plus parents.
- Guests build simple layered SVG characters on phones or one shared tablet; the characters live in scenes on the TV and act on their own.
- A 16-button Interact grid on phones mirrors a wired USB MIDI pad; one action queue serves both.
- Run-of-show: Chilling (default), Game time, Cake time, Gift time. Dancing is optional.
- Two admins (Justin and his wife) run scenes and moderation, and use focus mode to keep attention on the birthday girl.
- Everything runs on a Raspberry Pi 5 over home Wi-Fi. Develop on a Mac, deploy to the Pi. Justin owns scope.

## Easy to get wrong
- **One character per kid.** Every kid has exactly one character, never more. A phone can hold up to 3 characters only because one parent may have up to 3 kids, each with their own character. The shared tablet holds many kids, one character each. So the number of characters is about the number of kids, not a multiple of it. Size caps, tests, and bots on that basis. (Decision D-30; requirements G-3, G-6, C-3.)

## Stack (approved 2026-09-18, decision D-28)
- Node.js LTS with TypeScript; `ws` for WebSocket. Record the exact Node version in `docs/runbooks/pi-setup.md` when the Pi is set up.
- Vite for the three web apps: React for the guest and admin apps, plain TypeScript for the display. Keep the WebSocket connection and app state in a small store outside the React components, so re-renders never open a second connection.
- Characters as DOM SVG with CSS transforms, one `<svg>` per character inside a positioned wrapper. Effects (confetti, fireworks, stars) go on one canvas overlay unless the Phase 0 spike shows DOM effects are fine. If the spike stutters, fall back to canvas or PixiJS for characters.
- Characters and guests stored as JSON files on disk.
- Pad service reads MIDI on the Pi with Node `easymidi` (decision D-33; `mido` with `python-rtmidi` failed to install on the Pi and stays only as a fallback).
- systemd services on the Pi; a Chromium kiosk for the TV.

## Repo layout (planned; Phase 0 creates the folders)
| Path | Holds | Created or filled in |
|---|---|---|
| `server/` | WebSocket, storage, queue, scene director | Phase 2, 4, 5 |
| `web/guest/` | Guest app (Character and Interact modes) | Phase 2, 4 |
| `web/admin/` | Admin panel | Phase 5 |
| `web/display/` | TV renderer, effects, debug panel | Phase 0 (spike), 1, 3, 4 |
| `pad-service/` | MIDI pad reader | Phase 4 |
| `shared/` | Types and code used by several apps | Phase 0 onward |
| `assets/{audio/{music,sfx,broadcast},icons,parts,scenes}/` | Art and audio, swapped by filename | Phase 1, 3, 4, 5 |
| `config/` | Settings, scenes, action registry | Phase 0 onward |
| `data/` | Runtime data (gitignored) | Phase 2 |
| `scripts/` | Deploy, health check, backup | Phase 0, 6 |
| `tests/` | Tests, spam test | Phase 0 onward |

## How to run and test
Only commands that have been run are listed. Where and when each was verified is in `docs/runbooks/pi-setup.md`. Nothing exists yet for the server, the pad service, or tests (Phase 2 onward); add their commands as those phases verify them.

Mac, from `web/display/` (worked, per Justin):
- `npm run dev` starts the dev server. `npm run typecheck` runs `tsc --noEmit`.

Pi, from `~/hello-party/web/display/` over SSH (verified 2026-09-20):
- `npm run preview` serves the built page on port 4173 and listens on the network (`host: true` in `vite.config.ts`). Stop it with Ctrl+C.

Deploy and health check, run on the Mac from the repo root. They need `PI_HOST` and `PI_USER` in `.env` or the environment (see `.env.example`):
- `bash scripts/deploy.sh <tag-or-branch>` checks the ref out on the Pi (detached) and runs `npm ci` and `npm run build` in each app folder. The ref must already be on GitHub. It restarts nothing: stop any running server first and start it again by hand. Example: `bash scripts/deploy.sh phase-0-foundations`.
- `bash scripts/health-check.sh` prints `OK` (exit 0) or `FAIL` (exit 1). Its default URL is `http://$PI_HOST:$PORT/api/health`, which does not exist until Phase 2. Until then, with the preview server running on the Pi: `HEALTH_URL=http://192.168.1.203:4173/ bash scripts/health-check.sh`.

## Rules
1. One phase at a time, one agent at a time, never in parallel.
2. Do only what your phase doc lists. Anything else goes to `docs/backlog.md`.
3. Requirements are frozen. A change needs Justin's approval, a `docs/decisions.md` entry, and a note in `PROGRESS.md`.
4. Deploy to the Pi and verify the gate on the Pi, not just the Mac.
5. Secrets (admin passphrase, Wi-Fi password) never go in git. Only in `.env` (gitignored) with an `.env.example`.
6. Art is original and Kitty-inspired only, never official Sanrio assets.
7. Store only display names and character data. No photos or audio.
8. Never run destructive commands (force push, deleting `data/`, wiping the Pi) without asking.
9. Do not buy anything or change the network without asking.
10. Do not guess about hardware behavior. Mark untested commands and choices `UNVERIFIED`.

## Git
- `main` is always deployable. Work on `phase-N-<slug>`. Commit small and often: `phaseN: <what>`.
- When the gate passes: merge to `main` with `--no-ff`, tag `phase-N-done`. The last good tag is the fallback for the party.
- Never push, force-push, or rewrite history without asking.

## Session start ritual
1. Read `AGENTS.md`, `PROGRESS.md`, and the phase doc.
2. Run `git status`; check the branch and the latest tag.
3. Run the app locally. From Phase 1 onward, also confirm the Pi still runs the last tag.
4. Confirm the phase is next in order. If the previous phase is not tagged done, stop and tell Justin.

## During the session
- Do only what the phase doc lists. Look up requirements by ID.
- Record any decision that is not in the docs in `docs/decisions.md`.
- Update `docs/contracts.md` in the same commit as any message or schema change.
- Deploy to the Pi at least once per session. Verify the gate on the Pi and record the evidence (numbers, test output, what was seen).

## Session end ritual
1. Update `PROGRESS.md`: status table, Now/Next/Blocked, Needs Justin, Known issues, and a session log entry of 5 lines or fewer.
2. Tick the phase-doc checkboxes.
3. Commit. If the gate passed, merge and tag.
4. If unfinished, write exactly where you stopped and what comes next.

## Gate, blocked, cut-list, slip, and fallback rules
- **Gate rule.** A phase is not done until its gate is verified on the Pi and the evidence is written in `PROGRESS.md`.
- **Blocked rule.** If you need something only Justin can do (hardware, a real-phone test, audio files, a decision), add it to "Needs Justin" and stop that thread.
- **Cut-list rule.** Compare progress to `docs/timeline.md` every session. If behind, follow the slip rules, then the cut list, and ask Justin before cutting anything marked must-have. Feature freeze is Fri 9/25 midday; after that, bug fixes only.
- **Slip rules.** Phase 3: depth bands move to Phase 5 if Day 4 is behind. Phase 4 is the heaviest day; the pad adapter moves to Phase 5 if it slips. Phase 5 is heavy; take-turns, queue display polish, and broadcast move to Phase 6.
- **Cut list, from the top.** MIDI pad station; animated GIF; Cloudflare Tunnel; pair interactions; queue extras (lanes, coalescing); Dancing scene.
- **Safe-fallback rule.** The Pi always runs a tagged, tested build. If a session ends mid-work, the Pi stays on the last `phase-N-done` tag.

## Definition of done for a phase
Gate verified on the Pi with evidence recorded, phase-doc checkboxes ticked, `PROGRESS.md` updated, merged to `main`, tagged.

## Kickoff prompt (Justin pastes this to start any session)
> Read AGENTS.md, then PROGRESS.md, then the phase doc for the next phase. Do only that phase. Verify the gate on the Pi. Update PROGRESS.md, merge, and tag when done.
