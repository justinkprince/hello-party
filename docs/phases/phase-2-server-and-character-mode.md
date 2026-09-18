# Phase 2: Server and Character mode
Kickoff prompt (Justin pastes this): "Read AGENTS.md, then PROGRESS.md, then docs/phases/phase-2-server-and-character-mode.md. Do only this phase."
Planned: Day 3, Sun 9/20 | Branch: phase-2-server-and-character-mode | Tag when done: phase-2-done | Needs: phase-1-done

## Goal
A real server and a working guest app in Character mode: guests join by QR, enter a name, create and edit up to 3 characters, and see them appear on the TV. Also check the pad hardware the day it arrives.

## Requirements covered
- G-1, G-2, G-3, G-4, G-6: QR access, device-token profiles, the shared tablet profile ("Add my character", no "New guest"), name filter, up to 3 characters per phone.
- A-1 to A-6: two-mode shell with the character strip. Interact mode is only a placeholder here (built in Phase 4).
- C-1 to C-7: create, live preview with idle animation, 3-character limit, edit, remove, entrance animation, on-stage toggle and cap (C-7 uses the cap from Phase 0).
- C-10 (storage): characters saved as JSON on disk. The format came from Phase 1.
- R-4: guest and character data saved to disk.
- P-1 (hardware check only): pad recognized on the Pi. The pad service itself is Phase 4.

## Tasks
- [ ] Server: WebSocket, character storage (JSON on disk), guest profile (name + device token)
- [ ] Guest app shell with the Character / Interact mode switch and the character strip (up to 3 names/thumbnails, tap to switch the active character)
- [ ] Character mode: create, edit, remove (max 3 per guest), name, live preview, and the character appears on the TV
- [ ] Shared tablet: one shared profile (`kind: shared`, opened from a private URL with `SHARED_TABLET_KEY`) holding every kid's character, capped by `maxCharactersShared` (default 20). A kid taps "Add my character"; the strip scrolls; in Interact mode, characters that are waiting or cooling down are dimmed and cannot be selected.
- [ ] Test on real phones over Wi-Fi, including the guest network isolation check
- [ ] Scan the Wi-Fi and site QR codes from an iPhone and an Android phone
- [ ] Pad controller arrives (expected Sun 9/20): plug it into the Pi, confirm it shows up (`amidi -l`), and that pad presses appear as note-on messages (`aseqdump`)
- [ ] Backup USB numeric keypad (about $10): only order it if the pad fails the Pi test on 9/20, since there are 6 days of buffer

From requirements and the hand-off pack (CN-12):
- [ ] Name filter (about 12 characters, plain letters, numbers, spaces, blocklist) with a friendly "try another name" (G-4)
- [ ] Opens in Character mode until the guest has a character, then Interact mode (A-4); active character shown clearly (A-6)
- [ ] On-stage toggle and cap with a "stage is full" message (C-7)
- [ ] Mobile-first, portrait, large tap targets, icons over text, connection status, auto-reconnect (A-2, A-3)
- [ ] Implement the guest-facing and display-facing messages from `docs/contracts.md`; update the contract in the same commit if anything changes
- [ ] Generate the two QR codes from `.env` values (nothing secret in git) for the TV and for testing

## Out of scope
- Interact mode buttons, actions, queue, cooldown (Phase 4).
- Admin panel and timeouts (Phase 5).
- Scenes, autonomy, remaining clips (Phase 3).
- The pad service and pad-to-action mapping (Phase 4).
- PNG download (Phase 6).

## Deliverables
- `server/` with WebSocket, `/api/health`, static serving, and character/profile storage in `data/`.
- `web/guest/` Character mode and the strip; `web/display/` showing live characters with an entrance animation.
- A recorded result of the pad hardware check and of the Wi-Fi isolation test.
- Updated `docs/contracts.md` for anything that changed.

## Gate
- 3 or more real phones create characters live, and they appear on the Pi display.
- The pad is recognized on the Pi. If not, order the keypad backup.
- Evidence to record in `PROGRESS.md`: phone models and browsers used, the guest-Wi-Fi isolation result, the output of `amidi -l` and `aseqdump` (or the failure), and the keypad order decision.

## How to verify
1. Deploy to the Pi and open the display page.
2. On 3 or more real phones (include one iPhone and one Android), scan the QR codes and enter names.
3. Create characters, including two on one phone, edit one, remove one; confirm the TV follows.
4. Try a fourth character on one phone and confirm the clear message.
5. Refresh a phone and confirm the profile and characters persist; restart the server and confirm characters persist.
6. On the tablet, add several characters with "Add my character" and confirm they all stay on the TV, and that a character in cooldown is dimmed in Interact mode.
7. Plug in the pad; run `amidi -l` and `aseqdump`; press pads and record what appears.

## Slip rules and cut items
- If Character mode runs long, cut attribute options to skin tone and hair first; keep the 3-character limit and the strip.
- If the guest network blocks phones, put guests on the Pi's network or plan the tunnel (cut-list item) and tell Justin.
- The pad check is 15 minutes; do it even if everything else slips.

## Needs Justin
- Be here with an iPhone and an Android phone and 1 or 2 more devices for the live test.
- Plug in the pad when it arrives (expected today) and place the keypad order only if it fails.
- Approve any network change needed for the isolation fix (ask first).

## Hand-off to the next phase
- Phase 3 can rely on: characters stored and shown on the display, the WebSocket, guest profiles, and a tested QR path.
- Deliberately unfinished: Interact mode, actions and queue, admin panel, scenes and autonomy.

## End-of-phase checklist
- [ ] `PROGRESS.md` updated (status, Now/Next/Blocked, Needs Justin, session log)
- [ ] Boxes above ticked
- [ ] Decisions logged (name filter rules, isolation result, pad result)
- [ ] Merged to `main` with `--no-ff`
- [ ] Tagged `phase-2-done`
