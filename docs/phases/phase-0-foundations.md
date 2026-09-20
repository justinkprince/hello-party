# Phase 0: Foundations
Kickoff prompt (Justin pastes this): "Read AGENTS.md, then PROGRESS.md, then docs/phases/phase-0-foundations.md. Do only this phase."
Planned: Day 1, Fri 9/18 | Branch: phase-0-foundations | Tag when done: phase-0-done | Needs: docs-pack-done

## Goal
Scaffold the repo, get the Pi ready (OS, Node, kiosk, static IP, audio), review the contracts, and run the performance spike that decides the rendering approach and the on-stage cap.

## Requirements covered
- R-1 (everything runs locally with no internet), D-1 (kiosk starts on boot, full-screen 1080p, cursor hidden, no blanking), D-9 (the spike: avoid expensive rendering), AU-1 (audio path check only; wiring is Phase 5).
- Initial systemd and kiosk services are set up here and hardened in Phase 6 (R-2, R-3).
- Open items resolved here: O-1 (on-stage cap), O-6 (review `PROPOSED` contract details), O-7 (confirm the stack).

## Tasks
Lead-time orders (from the old "Order today" list):
- [x] MIDI pad controller (ordered; on its way, expected to arrive Sun 9/20). Check that the box has a USB cable (get a USB-C to USB-A cable or adapter if not).
- [x] Micro-HDMI to HDMI cable for the Pi 5 (have it)
- [x] Anything missing from the Pi kit: 27W power supply, active cooler (have it), spare microSD card (Justin confirmed a good supply and a good spare card; no undervoltage with the current supply)
- [x] Tablet for character creation (confirmed: there will be one)
- [ ] Paper/cardstock for QR signage

Day 1 tasks:
- [x] Confirm the party date (Sat 9/26 confirmed)
- [x] Review `docs/requirements.md` and confirm the open items at the end of it (answered 2026-09-18, D-27 and D-23; the on-stage cap waits for the spike and the cooldown tuning for the rehearsal)
- [ ] Order hardware (the list above)
- [x] microSD flashed with Raspberry Pi OS (Justin does this; see `docs/runbooks/pi-setup.md` steps 0a and 0b) and the Pi boots to the desktop on the TV with SSH reachable from the Mac
- [ ] Pi: OS updated, Node installed, Chromium kiosk auto-start, static IP (done except: watch that the screen never blanks, and switch the kiosk to the real display URL once Phase 2 exists)
- [x] Test audio: Pi to TV to soundbar over HDMI (verified to the dev TV's own speakers; soundbar carried forward as a known risk, D-32)
- [x] Performance spike on the Pi: 30 simple animated SVG characters at 1080p, one `<svg>` per character. Also try a canvas overlay with a few hundred particles (the effects layer). Record the frame rate.
- [x] Repo initialized in this folder. Dev server runs on the Mac and on the Pi. (Mac: `npm run dev` and `npm run typecheck` in `web/display/` worked, per Justin; Pi: `npm run preview` served the spike page.)

From requirements and the hand-off pack (CN-12):
- [x] Create the planned code layout (folders below) with a one-line README or `.gitkeep` in each, plus `.env.example` with placeholder names only
- [x] Confirm the stack in `AGENTS.md` (Node LTS with TypeScript, `ws`, Vite with React for guest and admin, DOM SVG) and record it in `docs/decisions.md` (approved 2026-09-18, decision D-28)
- [x] Choose the pad service language (`mido` with `python-rtmidi`, or `easymidi`) by seeing which installs cleanly on the Pi (`easymidi`, D-33)
- [x] Review every `PROPOSED` item in `docs/contracts.md`; fix or approve each and update the file (all 19 approved 2026-09-18, decision D-26)
- [x] Choose how code gets to the Pi (for example, the built files copied over SSH, or a bare git repo on the Pi) and record it in `docs/decisions.md`. Nothing is pushed to any remote without asking.
- [x] Deploy script and health-check script in `scripts/`, tested Mac to Pi (2026-09-20, D-34; the health check was tested against the preview server, since `/api/health` needs Phase 2)
- [x] Fill in `AGENTS.md` "How to run and test" and `docs/runbooks/pi-setup.md` with commands that actually worked; clear the `UNVERIFIED` labels only for those
- [x] Set the on-stage cap default from the spike and record it in `docs/decisions.md` (30, D-31)

## Out of scope
- Any real character art, animation clips, or rig (Phase 1).
- WebSocket server logic, guest app, storage (Phase 2).
- Scenes, autonomy, actions, queue, admin panel, audio wiring (Phases 3 to 5).
- Hardening services, fallback scene, reboot test (Phase 6).
- Pad hardware (arrives 9/20; Phase 2 tests it).

## Deliverables
- Folders: `server/ web/guest/ web/admin/ web/display/ pad-service/ shared/ assets/{audio/{music,sfx,broadcast},icons,parts,scenes}/ config/ data/ scripts/ tests/`
- A minimal dev server that serves a static page on the Mac and on the Pi.
- The spike page in `web/display/` (throwaway is fine) and the recorded numbers.
- `scripts/` deploy and health-check scripts, `.env.example`.
- Updated `AGENTS.md` (run and test commands), `docs/runbooks/pi-setup.md`, `docs/contracts.md`, `docs/decisions.md`.

## Gate
- The 30-character spike frame rate is recorded, with the rendering choice (DOM SVG, or canvas/PixiJS).
- The dev server runs on the Mac and on the Pi.
- Audio path (Pi to TV to soundbar) is verified, or a fallback path is chosen and recorded.
- Evidence to record in `PROGRESS.md`: fps numbers and conditions, the rendering choice, the audio result.
- If the spike stutters: switch rendering to canvas/PixiJS or cut the node count before building anything else.

## How to verify
1. On the Pi, open the spike page in Chromium at 1080p and read the fps counter for at least 60 s with 30 animated characters.
2. Record the average and the low, and the number of nodes per character.
3. Play a test sound from the Pi and confirm it comes from the soundbar.
4. Start the dev server on the Mac; load the page on the Mac and on the Pi.
5. Run the health-check script against the Pi and confirm it reports OK.

## Slip rules and cut items
- Nothing in this phase is cut. If the Pi setup is slow, finish the spike first (it decides the rest) and move service tidy-up to Phase 6.
- If audio does not reach the soundbar, try 3.5 mm or USB audio, or Bluetooth, and record the choice.

## Needs Justin
- Pi access (SSH or keyboard), the TV on, and approval of the static IP (network change: ask first).
- TV settings: game mode, auto power-off and screensaver off.
- Place the orders above and confirm the open items in `docs/requirements.md` section 9.
- Wi-Fi details are entered only into `.env` on the Pi, never into git.

## Hand-off to the next phase
- Phase 1 can rely on: the folder layout, a dev server on both machines, a known rendering approach and character budget, and a working deploy script.
- Deliberately unfinished: art, rig, server logic, and service hardening.

## End-of-phase checklist
- [x] `PROGRESS.md` updated (status, Now/Next/Blocked, Needs Justin, session log)
- [x] Boxes above ticked (three stay open and are carried forward; see PROGRESS.md: cardstock and the hardware-order box, and the Pi kiosk item for screen blanking and the real display URL)
- [x] Decisions logged (stack, rendering choice, on-stage cap, pad service language)
- [x] Merged to `main` with `--no-ff` (`f9aa938`)
- [x] Tagged `phase-0-done`
