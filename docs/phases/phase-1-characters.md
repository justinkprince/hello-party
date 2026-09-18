# Phase 1: Characters
Kickoff prompt (Justin pastes this): "Read AGENTS.md, then PROGRESS.md, then docs/phases/phase-1-characters.md. Do only this phase."
Planned: Day 2, Sat 9/19 | Branch: phase-1-characters | Tag when done: phase-1-done | Needs: phase-0-done

## Goal
Build the shared character rig, the first set of original Kitty-inspired parts, a gallery to preview them, the character JSON format, the renderer, and the first animation clips.

## Requirements covered
- D-2: characters render from data on one shared rig (named layers and pivots), so every part combination works with every clip.
- D-8: bold, high-contrast art readable in bright daylight.
- D-3 (v1 clips only): idle, walk, wave, dance A, jump. The remaining clips (cheer, laugh, clap, sleep, spin, more dance variants) are finished in Phase 3.
- C-10 (data format only): the character JSON format. Storage on disk is Phase 2.
- D-9 continues as a rule: no SVG filters, about 50 nodes per character.

## Tasks
- [ ] Define the rig: canvas size, layer names, pivot points
- [ ] Draw the base character (original, Kitty-inspired) plus first parts: 3 ears, 5 bows/hats, 4 hairstyles, 4 outfits, 4 accessories, using color variables
- [ ] Parts gallery page to preview all parts and combinations
- [ ] Character JSON format
- [ ] Animation clips v1: idle, walk, wave, dance A, jump

From requirements and the hand-off pack (CN-12):
- [ ] A renderer in `shared/` (or `web/display/`) that turns a Character JSON into an animated SVG and plays a named clip
- [ ] Face options and attribute options (hair, skin tone, glasses, freckles) exist as parts or variables
- [ ] Keep the JSON identical to the Character schema in `docs/contracts.md`; if it must change, update the contract in the same commit and log a decision
- [ ] Re-run the Phase 0 frame-rate test with real characters and record the result

## Out of scope
- Server, guest app, storage, live character creation (Phase 2).
- Scenes, autonomy, walking to props, remaining clips (Phase 3).
- Actions, queue, effects (Phase 4).
- PNG download (Phase 6). Animated GIF is backlog.
- Official Sanrio art of any kind. Art is original and Kitty-inspired only.

## Deliverables
- `assets/parts/` with the part SVGs and the rig definition (layers, pivots, canvas size).
- A renderer and a clip player, with the 5 v1 clips.
- A gallery page that shows every part and lets you combine them.
- A short note in `docs/design.md` if the rig differs from what it says.
- A sample character JSON that renders on both the Mac and the Pi display.

## Gate
- A custom character walks and dances on the Pi display.
- Evidence to record in `PROGRESS.md`: a description of what was seen on the Pi, the fps with the real character, and the node count per character.

## How to verify
1. Deploy to the Pi with the deploy script.
2. Open the gallery page and pick a combination of parts and colors.
3. Load that character on the display page and play idle, walk, wave, dance A, and jump.
4. Confirm bold colors are readable on the TV in daylight.
5. Check the frame rate with several copies of the character.

## Slip rules and cut items
- Art takes longer than planned: fewer parts, more color variation. Do not add parts late in the day.
- If a clip is not ready, ship it as idle and log it in `PROGRESS.md` for Phase 3.

## Needs Justin
- Look at the character art on the TV or a laptop and say whether the style feels right (a quick yes or no is enough).
- Nothing else. No hardware is needed today.

## Hand-off to the next phase
- Phase 2 can rely on: the Character JSON format, the renderer, and the parts list (for the Character mode picker).
- Deliberately unfinished: server storage, remaining clips, scenes, autonomy, and any live editing.

## End-of-phase checklist
- [ ] `PROGRESS.md` updated (status, Now/Next/Blocked, Needs Justin, session log)
- [ ] Boxes above ticked
- [ ] Decisions logged (rig details, any schema change)
- [ ] Merged to `main` with `--no-ff`
- [ ] Tagged `phase-1-done`
