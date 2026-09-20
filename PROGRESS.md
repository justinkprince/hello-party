# PROGRESS

Last updated: 2026-09-20 by the Phase 0 agent (Claude, file access only; Justin ran the commands)
Current phase: Phase 0, in progress (gate not yet met).
Schedule: BEHIND by about 2 days. On Sun 9/20 Phase 0 is still not tagged; Phase 1 was planned for Sat 9/19 and Phase 2 for Sun 9/20. Nothing cut yet; Justin decides (see Needs Justin).

## Phase status
| Phase | Planned | Status | Branch | Tag | Gate result |
|---|---|---|---|---|---|
| Docs pack | Day 1, Fri 9/18 | Done | `main` | `docs-pack-done` | Files written and cross-checked by reading. Git commits and the tag are created by Justin (see Needs Justin). |
| 0 Foundations | Day 1, Fri 9/18 | In progress | `phase-0-foundations` (to be created from `main`; the first Phase 0 commit is already on `main`) | `phase-0-done` | Not met. No spike, Pi, or audio evidence yet. |
| 1 Characters | Day 2, Sat 9/19 | Not started | `phase-1-characters` | `phase-1-done` | |
| 2 Server and Character mode | Day 3, Sun 9/20 | Not started | `phase-2-server-and-character-mode` | `phase-2-done` | |
| 3 Scene engine | Day 4, Mon 9/21 | Not started | `phase-3-scene-engine` | `phase-3-done` | |
| 4 Actions | Day 5, Tue 9/22 | Not started | `phase-4-actions` | `phase-4-done` | |
| 5 Admin and moments | Day 6, Wed 9/23 | Not started | `phase-5-admin-and-moments` | `phase-5-done` | |
| 6 Polish and hardening | Days 7-8, Thu 9/24 to Fri 9/25 | Not started | `phase-6-polish-and-hardening` | `phase-6-done` | |

## Now / Next / Blocked
- **Now:** Phase 0 paused. Folder scaffold, `.env.example`, and the contracts review (all 19 `PROPOSED` items approved, D-26) are committed (on `main`; the `phase-0-foundations` branch was renamed to `main` before the push).
- **Next:** an agent with a shell (and Pi access) does the rest of Phase 0: dev server, spike, Pi setup, scripts, audio test, pad service language, then records the evidence.
- **Blocked:** everything that needs a shell or the Pi (see Needs Justin). This session had file access only. The `docs-pack-done` tag exists (checked in `.git/refs/tags`).

## Needs Justin
- [ ] Decide how to handle the 2-day slip (see the timeline slip rules and cut list). Tell the agent how many hours you have each day until Fri 9/25 midday (feature freeze). (Sun 9/20)
- [ ] Phase 0 remainder needs a session with a shell and Pi access (SSH or keyboard), the TV on, and approval of the static IP. (Fri 9/18)
- [x] Stack approved (D-28): Node LTS, TypeScript, `ws`, Vite, React for guest and admin, DOM SVG (one `<svg>` per character) with effects on a canvas overlay (O-7)
- [ ] Run the git setup commands from the hand-off report (init, snapshot, two docs commits, tag `docs-pack-done`, archive commit). Then delete the old root `timeline.md` if it is still there. (Fri 9/18)
- [x] Order the MIDI pad now (ordered, expected Sun 9/20); still check the box has a USB cable (Fri 9/18)
- [x] Micro-HDMI to HDMI cable: have it. Pi has active cooling. Power supply and spare microSD still unconfirmed (Fri 9/18)
- [ ] Confirm the tablet is available (by Sun 9/20)
- [x] Open items from requirements section 9 answered (D-27, D-23): cooldown starting values, delete data after the party, queue display list only, depth bands start at 6 / 6 / 4, floor-only backgrounds. Still open: on-stage cap (after the spike) and final cooldown tuning (rehearsal).
- [ ] Test on real phones, an iPhone and an Android, when Phase 2 is ready (Sun 9/20). Include PNG download (iPhone save behavior) and the shared tablet flow.
- [ ] Order the USB keypad backup only if the pad fails the Pi test (Sun 9/20)
- [ ] Provide final music and sound effect files (Thu 9/24; placeholders until then, swapped by filename)
- [ ] Print QR signage and label the pads (Thu 9/24)
- [ ] Take part in the rehearsal with the birthday girl and friends (Fri 9/25)
- [ ] Optional: create a private remote repo for backup (by Fri 9/25)

## Known issues
- Soundbar path untested (target TV not available). Fallback: the TV's own speakers (D-32). Test on the target TV when Justin has access.

## Session log
Newest first. At most 5 lines per entry.

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
