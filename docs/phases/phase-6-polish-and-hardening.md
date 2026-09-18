# Phase 6: Polish and hardening
Kickoff prompt (Justin pastes this): "Read AGENTS.md, then PROGRESS.md, then docs/phases/phase-6-polish-and-hardening.md. Do only this phase."
Planned: Days 7-8, Thu 9/24 to Fri 9/25 | Branch: phase-6-polish-and-hardening | Tag when done: phase-6-done | Needs: phase-5-done

## Goal
Make it party-ready: PNG download, final audio, labeled pads, TV QR codes, auto-start and recovery, a fallback scene, backups, and a full rehearsal. Feature freeze is Fri 9/25 midday; after that, bug fixes only.

## Requirements covered
- C-8: download a character as a transparent PNG.
- D-12: Wi-Fi and site QR codes in a TV corner in the Chilling scene.
- G-5 (optional): Cloudflare Tunnel, with admin routes protected. It is third on the cut list (see `docs/timeline.md`).
- R-2, R-3: services start on boot and restart on crash, the Pi recovers after power loss, and the TV shows a looping fallback scene if the server is unreachable. Initial services came from Phase 0.
- R-5: backups (git push if a remote exists, and a copy of the Pi's SD card image).
- AU-2 (final files): Justin's final music and sound effects swapped in by filename.
- Any items that slipped from Phases 3 to 5 (depth bands, take-turns, queue display polish, broadcast, pad adapter).
- Acceptance criteria verified here: 1 (10 or more real devices, no stutter), 5 (power-cycle returns to Chilling), 7 (audio swap with no code change), and the full list at rehearsal.

## Tasks
Thu 9/24 (Day 7):
- [ ] PNG download
- [ ] Label the pads (icon stickers under clear tape, or a cardboard faceplate) and test with the real controller on the Pi
- [ ] Optional: Cloudflare Tunnel
- [ ] Swap in your final audio files, and set music and sound levels through the soundbar
- [ ] Print QR signage (Wi-Fi and site)
- [ ] Auto-start on boot, recover after power loss, safe fallback scene if the server crashes
- [ ] Check TV readability in bright daylight (brightness, high-contrast art)

Fri 9/25 (Day 8):
- [ ] Feature freeze by midday. Bug fixes only after that.
- [ ] Rehearsal with the birthday girl and friends or family on their own devices. Run the whole run-of-show, including focus mode and a phone that joins late.
- [ ] Back up: git push and a copy of the Pi's SD card image
- [ ] Charge devices, set out signage and stations

From requirements and the hand-off pack (CN-4, CN-12):
- [ ] QR codes in the TV corner in Chilling (D-12), clear of the queue display area
- [ ] Harden the systemd services from Phase 0: restart on failure, start on boot, kiosk after server is ready
- [ ] Reboot test: power-cycle the Pi and confirm it returns to Chilling on its own
- [ ] Tune cooldown, expiry, and mood group cooldown at the rehearsal and record the final values (open item O-2)
- [ ] Take a copy of `data/` and record the backup location in `docs/runbooks/party-day.md`
- [ ] Walk every acceptance criterion in `docs/requirements.md` section 8 at the rehearsal and record each result
- [ ] Update `docs/runbooks/party-day.md` and `docs/runbooks/pi-setup.md` with anything that differed from the plan

## Out of scope
- New features. Anything not on the list goes to `docs/backlog.md`, especially after freeze.
- Animated GIF, raised-hand indicator, birthday star (backlog).
- Changing requirements (needs Justin's approval).

## Deliverables
- PNG download in the guest app. Final audio in `assets/audio/`.
- Hardened services, a working fallback scene, and a reboot test result.
- Signage printed by Justin; QR codes in the TV corner.
- A rehearsal report in `PROGRESS.md` covering all 14 acceptance criteria.
- A backup of the Pi and of `data/`, and the tag `phase-6-done`.

## Gate
- The reboot test passes.
- The rehearsal passes the acceptance criteria in `docs/requirements.md` section 8.
- A backup is taken.
- Evidence to record in `PROGRESS.md`: the reboot test result, one line per acceptance criterion, the devices used, the backup location, and the final tuned values.

## How to verify
1. Power-cycle the Pi; confirm the TV comes back to Chilling with no keyboard or mouse.
2. Stop the server process; confirm the TV shows the fallback scene, then recovers after restart.
3. Replace one audio file by name; confirm the sound changes with no code change.
4. Run the rehearsal with 10 or more real devices; walk the run-of-show; run the spam test with bots at the same time.
5. Download a PNG from a phone and check the transparent background.
6. Take the backups and confirm the files exist.

## Slip rules and cut items
- Phase 6 absorbs anything that slipped from Phase 5: take-turns, queue display polish, and broadcast, in that order of cut if time runs out.
- Cut list, from the top: MIDI pad station; animated GIF; Cloudflare Tunnel; pair interactions; queue extras (lanes, coalescing); Dancing scene. Must-have items are never cut without asking Justin.
- After the freeze, do not start new work; fix bugs and re-run the affected checks.

## Needs Justin
- Provide the final music and sound effect files by Thu 9/24 (placeholders until then).
- Print QR signage and label the pads on Thu 9/24.
- Join the rehearsal on Fri 9/25 with the birthday girl and friends or family.
- Optionally create a private remote repo for the backup push.
- Charge devices and set out stations on Fri 9/25.

## Hand-off to the next phase
- There is no next phase. Day 9 (Sat 9/26) is the party; use `docs/runbooks/party-day.md`. The last good tag is the fallback.
- Deliberately unfinished: anything on the backlog.

## End-of-phase checklist
- [ ] `PROGRESS.md` updated (status, Now/Next/Blocked, Needs Justin, session log)
- [ ] Boxes above ticked
- [ ] Decisions logged (final tuned values, anything cut)
- [ ] Merged to `main` with `--no-ff`
- [ ] Tagged `phase-6-done`
