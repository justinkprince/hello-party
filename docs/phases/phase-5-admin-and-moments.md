# Phase 5: Admin and moments
Kickoff prompt (Justin pastes this): "Read AGENTS.md, then PROGRESS.md, then docs/phases/phase-5-admin-and-moments.md. Do only this phase."
Planned: Day 6, Wed 9/23 | Branch: phase-5-admin-and-moments | Tag when done: phase-5-done | Needs: phase-4-done

## Goal
The full run-of-show works from the admin panel: scene switching, timeouts, transition cards, focus mode, the Game, Gift, and Dancing scenes, broadcast, placeholder audio, and demo mode.

## Requirements covered
- AD-1 to AD-11: admin login, scene buttons, cues, remove, reset to safe scene, hide a name, cooldown and cap and queue-display controls, volume, device timeout, focus toggle, broadcast.
- Q-12 (device timeout), Q-15 (live cooldown change).
- T-1 to T-8: transition cards (TV and phone banner), focus mode and its lifecycle, late-joiner focus screen, held cards.
- B-1 to B-3: broadcast of a sound and banner with reached count, preloaded files, one-tap audio unlock and sound toggle.
- AU-1: music per scene and sound per action through the soundbar (path check was Phase 0).
- AU-2 (placeholders wired): files swapped by filename. Final files arrive in Phase 6.
- I-9 (take-turns), D-14 (queue display polish), D-13 (full demo mode; the minimal spawner came from Phase 3).
- D-16 (depth bands) if they slipped from Phase 3. D-10 and D-11 only if time (D-10 is on the cut list).
- Scenes: Game time, Gift time, Dancing, and Cake time rewired to the admin panel with focus (CN-1).
- Acceptance criteria verified here: 2 (full run-of-show), 6 (reset to safe scene), 11 (timeout), 12 (Gift locks phones and pad), 13 (focus ends 3 ways), 14 (broadcast reach); 7 (audio swap) is wired here and re-checked in Phase 6.

## Tasks
- [ ] Admin panel (shared passphrase): switch scene, trigger cues, remove character, reset to safe scene, time out a device (device list with character names and recent action counts), focus on/off; then hide names, change the cooldown
- [ ] Transition cards (TV) and focus mode (phones lock to a calm screen, the TV goes calm, failsafe auto-release), used by Cake time and Gift time
- [ ] Broadcast a sound and banner to all phones (audio unlock on first tap, sound toggle, preloaded files)
- [ ] Game time scene (an ordinary scene config: a party-game background with a pinata and a pin-the-tail game for show, and props for characters to visit; no game logic and no game choice)
- [ ] Gift time scene (as a config, locked and calm)
- [ ] Dancing scene (kept, not in the run-of-show)
- [ ] Polish the TV queue display (thumbnails, names, +N waiting, hides when empty)
- [ ] Take-turns toggle in Interact mode (auto-advance the active character)
- [ ] Demo/bot mode
- [ ] Placeholder music and sound effects wired in from an assets folder (you supply the final files and swap them by filename)

From requirements and the hand-off pack (CN-1, CN-12):
- [ ] Decision point: if the pad has not arrived or does not work on the Pi, use the keypad backup or drop the station (see `docs/timeline.md`)
- [ ] Move the Cake time cue from the debug panel to the admin panel; add its transition card and focus mode
- [ ] Late-joining phone gets the focus screen at once (T-7); the pad is ignored in focus mode
- [ ] Admin buttons for admin extras: cap, queue display, master volume and mute
- [ ] Admin login is required for every admin action; passphrase comes from `.env` only
- [ ] If the pad adapter slipped from Phase 4, finish it now
- [ ] Update `docs/contracts.md` in the same commit as any message or schema change

## Out of scope
- PNG download, final audio files, pad labels, TV QR corner, reboot test, fallback scene, backups (Phase 6).
- Optional Cloudflare Tunnel (Phase 6, cut-list item).
- New features not in the requirements (go to `docs/backlog.md`).

## Deliverables
- `web/admin/` panel and the server handlers for the admin messages in `docs/contracts.md`.
- Scene configs for Game, Cake, Gift, Dancing in `config/`, with backgrounds in `assets/scenes/`.
- Placeholder audio in `assets/audio/` referenced by name.
- Demo mode, take-turns toggle, broadcast, polished queue display.

## Gate
- The full run-of-show (Chilling, Game time, Cake time, Gift time) works from the admin panel, with focus on Cake time and Gift time.
- A phone that joins late during focus gets the focus screen.
- Evidence to record in `PROGRESS.md`: what was run and observed for each scene, the late-join result, the timeout result, the broadcast reached count, and the reset result.

## How to verify
1. Deploy to the Pi. Log in to the admin panel on a phone.
2. Walk the run-of-show: Chilling, Game time, Cake time (hold the card, then "blow out"), Gift time, then back to Chilling.
3. During Gift time, confirm phones show the calm screen, the TV is calm, and the pad does nothing. Join a new phone and confirm it gets the focus screen.
4. Release focus; confirm phones return. Repeat with the failsafe set short.
5. Time out a bot device and confirm it recovers by itself.
6. Broadcast a sound and confirm the reached count; check a phone with sound on.
7. Press "reset to safe scene" mid-effects and confirm the queue and effects clear.

## Slip rules and cut items
- This day is heavy. If it slips, take-turns, queue display polish, and broadcast move to Phase 6.
- Dancing scene and pair interactions are next on the cut list; must-haves are never cut without asking Justin.
- Depth bands from Phase 3, if they slipped, come before anything on the cut list.

## Needs Justin
- Run the run-of-show yourself from your phone and say what feels wrong.
- Decide the pad: use it, get the keypad, or drop it.
- Decide the queue display style (open item O-4) and whether data is deleted after the party (O-3).

## Hand-off to the next phase
- Phase 6 can rely on: a complete feature set and admin panel, scenes, placeholder audio, and demo mode.
- Deliberately unfinished: final audio, PNG download, pad labels, TV QR corner, hardening, backups, rehearsal.

## End-of-phase checklist
- [ ] `PROGRESS.md` updated (status, Now/Next/Blocked, Needs Justin, session log)
- [ ] Boxes above ticked
- [ ] Decisions logged (focus, timeout, scene details, any slip)
- [ ] Merged to `main` with `--no-ff`
- [ ] Tagged `phase-5-done`
