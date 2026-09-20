# PROGRESS

Last updated: 2026-09-20 by the Phase 0 agent (Claude, file access only; Justin ran the commands)
Current phase: Phase 0, gate met on 2026-09-20; merge to `main` and tag `phase-0-done` wait for Justin's OK.
Schedule: BEHIND by about 2 days. On Sun 9/20 Phase 0 is still not tagged; Phase 1 was planned for Sat 9/19 and Phase 2 for Sun 9/20. Justin decided on Sun 9/20 to absorb it, with no limit on hours. Nothing cut.

## Phase status
| Phase | Planned | Status | Branch | Tag | Gate result |
|---|---|---|---|---|---|
| Docs pack | Day 1, Fri 9/18 | Done | `main` | `docs-pack-done` | Files written and cross-checked by reading. Git commits and the tag are created by Justin (see Needs Justin). |
| 0 Foundations | Day 1, Fri 9/18 | Gate met 2026-09-20; merge and tag pending Justin's OK | `phase-0-foundations` (on origin up to `294d45e`) | `phase-0-done` | Met on the Pi. Evidence in "Phase 0 gate evidence" below. Carried forward: see Known issues. |
| 1 Characters | Day 2, Sat 9/19 | Not started | `phase-1-characters` | `phase-1-done` | |
| 2 Server and Character mode | Day 3, Sun 9/20 | Not started | `phase-2-server-and-character-mode` | `phase-2-done` | |
| 3 Scene engine | Day 4, Mon 9/21 | Not started | `phase-3-scene-engine` | `phase-3-done` | |
| 4 Actions | Day 5, Tue 9/22 | Not started | `phase-4-actions` | `phase-4-done` | |
| 5 Admin and moments | Day 6, Wed 9/23 | Not started | `phase-5-admin-and-moments` | `phase-5-done` | |
| 6 Polish and hardening | Days 7-8, Thu 9/24 to Fri 9/25 | Not started | `phase-6-polish-and-hardening` | `phase-6-done` | |

## Now / Next / Blocked
- **Now:** Phase 0 gate met (evidence below). Waiting for Justin's OK to commit, merge to `main` with `--no-ff`, and tag `phase-0-done`; then deploy the tag to the Pi (pushing needs Justin's OK). Details in `docs/runbooks/pi-setup.md`.
- **Next:** Phase 1 (Characters) on `phase-1-characters` once `phase-0-done` exists. Also check the MIDI pad on the Pi when it arrives (runbook step 8); it does not block the tag.
- **Blocked:** nothing. Every command is run by Justin (the agent so far has had file access only); guest URLs and QR codes must use the IP, not `hello-party.local`.

## Phase 0 gate evidence (2026-09-20)
- **Spike and rendering choice:** DOM SVG, one `<svg>` per character, with a canvas overlay for effects (D-31). Pi 5, Chromium kiosk, 1920x1080, 26-node placeholder characters, 300 particles, 60 s runs: 30 characters averaged 59.9 and 60 fps (p99 16.8 ms); 38 characters 58.6 fps; 45 characters 50.4 fps; 60 characters 32.6 fps. 30 characters with 1200 particles: 59.8 fps (p99 17.3 ms). `get_throttled` `0x0`, 59.8 C at the end. On-stage cap 30. Full numbers in `docs/runbooks/pi-setup.md`.
- **Dev server on the Mac and the Pi:** on the Mac, `npm run dev` and `npm run typecheck` in `web/display/` worked (per Justin). On the Pi, `npm run preview` served the page, and the health check reached it from the Mac.
- **Audio:** Pi to TV over HDMI verified on the dev TV's own speakers; it survived a reboot, an HDMI replug, and a power pull. The soundbar was not tested (target TV not available). Fallback: the TV's own speakers (D-32).
- **Deploy and health check, Mac to Pi:** `bash scripts/deploy.sh phase-0-foundations` left the Pi detached at `294d45e` (`npm ci` 17 packages, build 64 ms, 2.4 s in total). `HEALTH_URL=http://192.168.1.203:4173/ bash scripts/health-check.sh` printed FAIL (exit 1) with nothing listening and `OK ... answered 200` (exit 0) with `npm run preview` running on the Pi. `/api/health` is untested until Phase 2; deploying a tag is untested until `phase-0-done` exists.

## Needs Justin
- [x] Slip: absorb it, no limit on hours (Justin, Sun 9/20)
- [ ] Say OK to merge to `main` and tag `phase-0-done`, and OK to push `main`, the branch, and the tag so the tag can be deployed to the Pi (Sun 9/20)
- [ ] Test the soundbar on the target TV when you have access (fallback: the TV's own speakers, D-32)
- [ ] When the pad arrives (expected Sun 9/20): plug it into the Pi and check it (runbook step 8)
- [ ] Target TV settings: game mode, auto power-off and screensaver off, HDMI-CEC checked, brightness high (see the runbook)
- [x] Phase 0 remainder needs a session with a shell and Pi access (SSH or keyboard), the TV on, and approval of the static IP. (Fri 9/18)
- [x] Stack approved (D-28): Node LTS, TypeScript, `ws`, Vite, React for guest and admin, DOM SVG (one `<svg>` per character) with effects on a canvas overlay (O-7)
- [ ] Run the git setup commands from the hand-off report (init, snapshot, two docs commits, tag `docs-pack-done`, archive commit). Then delete the old root `timeline.md` if it is still there. (Fri 9/18)
- [x] Order the MIDI pad now (ordered, expected Sun 9/20); still check the box has a USB cable (Fri 9/18)
- [x] Micro-HDMI to HDMI cable: have it. Pi has active cooling. Power supply and spare microSD confirmed good by Justin (Sun 9/20). (Fri 9/18)
- [ ] Confirm the tablet is available (by Sun 9/20)
- [x] Open items from requirements section 9 answered (D-27, D-23): cooldown starting values, delete data after the party, queue display list only, depth bands start at 6 / 6 / 4, floor-only backgrounds. Still open: on-stage cap (after the spike) and final cooldown tuning (rehearsal).
- [ ] Test on real phones, an iPhone and an Android, when Phase 2 is ready (Sun 9/20). Include PNG download (iPhone save behavior) and the shared tablet flow.
- [ ] Order the USB keypad backup only if the pad fails the Pi test (Sun 9/20)
- [ ] Provide final music and sound effect files (Thu 9/24; placeholders until then, swapped by filename)
- [ ] Buy paper or cardstock, then print QR signage and label the pads (Thu 9/24)
- [ ] Take part in the rehearsal with the birthday girl and friends (Fri 9/25)
- [ ] Optional: create a private remote repo for backup (by Fri 9/25)

## Known issues
- Soundbar path untested (target TV not available). Fallback: the TV's own speakers (D-32). Test on the target TV when Justin has access.
- Screen blanking over time not observed (D-1). No `swayidle` is running, but `raspi-config nonint get_blanking` printed `1`, which does not confirm it. Phase 6.
- The kiosk autostart was verified with a test page. Point it at the real display URL when the server exists. Phase 2.
- `.env` is not created on the Pi. Phase 2, when the server exists.
- Untested: `/api/health` (Phase 2), deploying a tag, the deploy refusal on local changes on the Pi, and deploying to a Pi without internet.
- The MIDI pad is untested. `easymidi` only listed `Midi Through` on the Pi (D-33). Runbook step 8 when the pad arrives.

## Session log
Newest first. At most 5 lines per entry.

- **2026-09-20, Phase 0 agent (Claude, file access only; Justin ran every command).** Wrote `scripts/deploy.sh` and `scripts/health-check.sh` (D-34) and tested them Mac to Pi: deploying `phase-0-foundations` left the Pi at `294d45e`; the health check printed FAIL, then OK, against the preview server on port 4173.
  Filled in "How to run and test" in `AGENTS.md` and `pi-setup.md` rows 4, 10, 11 with commands that ran. `.env.example` now has blank Pi placeholders.
  Gate: met (evidence above). Carried forward: screen blanking over time, real kiosk URL, soundbar, cardstock, pad check, Pi `.env`.
  Next: Justin commits and gives the OK to merge and tag; deploy the tag to the Pi; pad check when the pad arrives; then Phase 1.

- **2026-09-19 to 09-20, Phase 0 agent (Claude, file access only; Justin ran every command).** Pi verified: Trixie, Node 24.21.0, spike at 30 characters 60 fps (cap 30, D-31), HDMI audio to the dev TV (soundbar carried forward, D-32), kiosk autostart, HDMI replug, power pull, static IP, `easymidi` (D-33).
  Found: one character per kid (D-30); QR codes must use the IP, not `.local` (Android does not resolve it).
  Gate: not met. Left: deploy and health-check scripts, run-and-test docs, then the gate steps.
  Next: deploy script, health-check script, how-to-run docs, gate.

- **2026-09-18, Phase 0 agent (Claude, file access only).** Created the planned folders and `.env.example`. Reviewed all 19 `PROPOSED` contract items with Justin; all approved (D-26).
  Requirements amended to v1.2: Game time is an ordinary scene (D-24); shared tablet profile (D-25). Stack approved (D-28). Docs updated to match.
  Gate: not met; nothing run on the Mac or Pi (no shell, no Pi). Committed on `main` (branch renamed).
  Next: agent with shell and Pi does the dev server, spike, Pi setup, scripts, audio, pad service language.

- **2026-09-18, docs-pack agent (Claude).** Built the hand-off pack: README, AGENTS, PROGRESS, `docs/` (contracts, design, decisions, timeline, backlog, phases 0-6, runbooks). Moved requirements and notes; slimmed the timeline.
  Gate: n/a. Checks were done by reading, since there was no shell (see `docs/decisions.md`, CN-13).
  Next: Justin runs the git commands, then Phase 0.
- **2026-09-18.** Name approval replaced by a name filter with one-tap hide. Transition cards, focus mode (Cake time and Gift time), and broadcast added.
- **2026-09-18.** Fairness changed to per character (kids sharing a phone get their own cooldown and place in line). Device timeout is now a must-have. Take-turns toggle and depth bands added.
- **2026-09-18.** Dancing scene kept. Character strip (switch the active character) and the TV queue display added.
- **2026-09-18.** `requirements.md` drafted. Open questions answered. Guest app modes and action queue added.
- **2026-09-18.** Plan agreed (see `docs/archive/notes-2026-09-18.md`). Pad controller to be ordered, expected delivery Sun 9/20.
