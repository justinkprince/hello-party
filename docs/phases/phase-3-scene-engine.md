# Phase 3: Scene engine
Kickoff prompt (Justin pastes this): "Read AGENTS.md, then PROGRESS.md, then docs/phases/phase-3-scene-engine.md. Do only this phase."
Planned: Day 4, Mon 9/21 | Branch: phase-3-scene-engine | Tag when done: phase-3-done | Needs: phase-2-done

## Goal
Make the TV feel alive: scenes as config, the Chilling scene with props, character autonomy, all remaining animation clips, a debug panel, and a minimal bot spawner for tests.

## Requirements covered
- D-3: the remaining clips (cheer, laugh, clap, sleep, spin, extra dance variants). The v1 clips came from Phase 1.
- D-5: autonomy (mood, energy, personality, weighted choice every few seconds).
- D-6: props advertise actions; characters walk to nearby props and use them.
- D-7: names above characters unless hidden.
- D-16 (depth bands): only if Day 4 is on track; otherwise it moves to Phase 5 (slip rule).
- D-13 (minimal bot spawner only): used by tests and gates. Demo mode is Phase 5.
- Open item O-5 (characters per band, background floor) is decided here if bands are built.

## Tasks
- [ ] Scene config format (background, props with points of interest, music, behavior weights, allowed actions)
- [ ] "Hanging out" scene
- [ ] Autonomy: pick an action every few seconds, weighted by scene, personality, and mood. Walk to points of interest.
- [ ] Depth bands for characters (front, middle, back by recency of acting): scale, vertical position, draw order, hop between bands. Only if Day 4 is on track, otherwise Day 6.
- [ ] More clips: cheer, laugh, sleep, spin
- [ ] Debug panel that fires fake events (pad presses, emotes, scene changes) for testing

From requirements and the hand-off pack (CN-5, CN-12):
- [ ] Add the "clap" clip (missing from the old list)
- [ ] Name labels above characters, hidden when `nameHidden` is true (D-7)
- [ ] Minimal bot spawner: create N fake characters and fake events from the debug panel or a script
- [ ] Autonomous behavior never counts as a guest action and stays within a band (see `docs/design.md`)
- [ ] Scene config matches the SceneConfig schema in `docs/contracts.md`; update it in the same commit if it changes
- [ ] Record the frame rate with 15+ bots on the Pi

## Out of scope
- Guest-triggered actions, the queue, cooldowns, Interact mode (Phase 4).
- Effects such as confetti and fireworks (Phase 4).
- Admin panel, transition cards, focus mode, Cake, Gift, Game, and Dancing scenes (Phase 5).
- Music and sound (Phase 5). Demo mode (Phase 5).
- Pair interactions (Phase 5, if time).

## Deliverables
- Scene loader that reads a config from `config/` and applies its background, props, and weights.
- The Chilling scene (couch and table props) with autonomy running.
- The full clip set from the requirements (all 12 or so, with clap).
- A debug panel (`web/display/` or its own route) and a bot spawner.
- Depth bands (if built) with the band settings in config.

## Gate
- 15 or more bot characters look alive on the Pi with no stutter.
- Evidence to record in `PROGRESS.md`: bot count, average and low fps on the Pi, and a short description of what the characters were doing.

## How to verify
1. Deploy to the Pi.
2. From the debug panel, spawn 15 or more bots.
3. Watch for 2 minutes: characters wander, visit the couch and table, and use clips; no freezes.
4. Read the fps overlay and record the average and the low.
5. Change a scene config value (for example a weight) and confirm behavior changes without code changes.

## Slip rules and cut items
- If Day 4 is behind, depth bands move to Phase 5. Say so in `PROGRESS.md`.
- If autonomy is thin, ship fewer behaviors (idle, wander, visit prop) before adding more clips.
- Pair interactions are not part of this phase.

## Needs Justin
- Look at the Chilling scene on the TV and say if the background and props feel right.
- Answer the depth-band question (open item O-5) if bands are built.

## Hand-off to the next phase
- Phase 4 can rely on: a running scene with autonomous characters, the full clip set, a debug panel, and a bot spawner.
- Deliberately unfinished: actions, queue, effects, and every scene except Chilling.

## End-of-phase checklist
- [ ] `PROGRESS.md` updated (status, Now/Next/Blocked, Needs Justin, session log)
- [ ] Boxes above ticked
- [ ] Decisions logged (scene format changes, band settings)
- [ ] Merged to `main` with `--no-ff`
- [ ] Tagged `phase-3-done`
