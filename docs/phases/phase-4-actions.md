# Phase 4: Actions
Kickoff prompt (Justin pastes this): "Read AGENTS.md, then PROGRESS.md, then docs/phases/phase-4-actions.md. Do only this phase."
Planned: Day 5, Tue 9/22 | Branch: phase-4-actions | Tag when done: phase-4-done | Needs: phase-3-done

## Goal
Guests can press buttons and the TV reacts fairly: the action registry, queue, cooldown, per-character fairness, Interact mode, effects, a plain queue overlay, the Cake time script (triggered from the debug panel), and the pad adapter. This is the heaviest day.

## Requirements covered
- Q-1 to Q-11, Q-13, Q-14: registry, buffer, cooldown, fair priority, one pending per character, expiry, state machine, bypass for admin and script, lanes, coalescing, group cooldown for mood actions, locked next, device flood guard. Q-9 and Q-10 come last (cut list).
- I-1 to I-8: 4x4 grid, action replies, cooldown animation, dimmed buttons, queue feedback, TV shows the active character's name, per-character state ring, on-stage requirement.
- D-4: effects (confetti, hearts, fireworks, stars, disco lights, rainbow, lights down).
- D-14 (debug version only): plain queue overlay on the TV. Polish is Phase 5.
- P-1 to P-6: pad service and adapter (may slip to Phase 5). P-1 hardware check was done in Phase 2.
- Event bus and scene director (source-agnostic), and the Cake time script triggered from the debug panel.
- Acceptance criteria verified here: 3 (spam test), 4 (cooldown survives refresh), 8 (pad matches grid, if the pad is in use), 9 (two characters on one phone), 10 (queue display during the spam test).

## Tasks
- [ ] Event bus and scene director (source-agnostic, so phones, pads, and later devices all plug in the same way)
- [ ] Action registry (16 actions: id, icon, lane, duration, sound, allowed scenes) shared by the phone grid, the pad, and the TV
- [ ] Action queue: server-authoritative cooldown per character, one pending action per character, least-recently-played first, 6 s expiry, device flood guard (about 1 press per second), admin actions bypass the queue
- [ ] Interact mode: 4x4 button grid, cooldown animation with countdown, "in line" and "you did it!" states, dimmed buttons for actions not allowed in the scene. The active character's name shows on the TV and that character leads the reaction.
- [ ] Queue overlay on the TV (plain debug version showing who is waiting for what)
- [ ] Cake time script: gather, candles lit, hold the "sing Happy Birthday" card, wait for the admin cue, blow out, fireworks, cheer. In this phase the cue comes from the debug panel (CN-1).
- [ ] Pad input adapter: the same `pad:N` event (with velocity) from MIDI, keyboard keys (for development), and the debug panel
- [ ] Spam test: 20 bot guests mashing for 60 s (screen stays readable, every guest gets served)

From requirements and the hand-off pack (CN-12):
- [ ] Effects for the 7 effect and mood actions, each with a start and stop
- [ ] Per-character state ring on the strip, "you're next!" and "you did it!" states (I-5, I-7)
- [ ] Tapping an off-stage character puts it on stage if the cap allows (I-8)
- [ ] Pad service in `pad-service/` sending `padPress` per `docs/contracts.md`; note-on only, Note Repeat off
- [ ] Queue extras last: lanes (Q-9), coalescing (Q-10)
- [ ] Update `docs/contracts.md` in the same commit as any message or schema change

## Out of scope
- Admin panel, device timeouts, focus mode, transition cards (Phase 5). Cake time uses a plain hold state here.
- Take-turns toggle (Phase 5). Broadcast (Phase 5).
- Game, Gift, and Dancing scenes (Phase 5).
- Audio wiring (Phase 5).
- Queue display polish (Phase 5).

## Deliverables
- Registry config in `config/`, queue and event bus in `server/`, effects in `web/display/`, the Interact grid in `web/guest/`, `pad-service/`.
- A debug panel that can fire the Cake time cues.
- Spam-test script (bots) in `scripts/` or `tests/`.

## Gate
- The spam test passes: 20 bot guests mashing for 60 s, the screen stays readable, and every guest gets at least one action played.
- Cake time runs end to end from the debug panel.
- Evidence to record in `PROGRESS.md`: spam-test numbers (actions played per bot, min and max), fps during the test, a note on the cake run, and whether the pad works.

## How to verify
1. Deploy to the Pi.
2. Run the spam test and read the results; watch the TV for legibility and the queue overlay.
3. Press an action on a phone, refresh, and confirm the cooldown is still enforced.
4. Put two characters on one phone; press as one, switch, press as the other; each shows its own name.
5. From the debug panel, run the Cake time cues in order and watch the whole sequence.
6. Press pads (or keyboard keys) and confirm the same action as the grid button.

## Slip rules and cut items
- The heaviest day. If it slips, the pad adapter moves to Phase 5.
- Cut order if needed: lanes and coalescing first (queue extras), then the pad. Must-haves (queue, cooldown, fairness, Interact mode) are never cut without asking Justin.
- Do not start admin features to catch up.

## Needs Justin
- Test the Interact grid on your phone and say whether it is clear to a 9-year-old.
- If the pad is in use, press it and confirm the labels and actions match.

## Hand-off to the next phase
- Phase 5 can rely on: the registry, queue, cooldown and fairness, Interact mode, effects, the event bus and scene director, and a Cake script that runs from the debug panel.
- Deliberately unfinished: admin, timeouts, focus, transition cards, other scenes, audio, demo mode.

## End-of-phase checklist
- [ ] `PROGRESS.md` updated (status, Now/Next/Blocked, Needs Justin, session log)
- [ ] Boxes above ticked
- [ ] Decisions logged (queue details, any slip)
- [ ] Merged to `main` with `--no-ff`
- [ ] Tagged `phase-4-done`
