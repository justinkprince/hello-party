# Phases: index and coverage

**Phases run strictly in order. One agent at a time. Never run agents in parallel.** A phase starts only when the previous phase is tagged done (see `../../PROGRESS.md`).

## Phase table

Day 1 = Fri 9/18. The calendar view is `../timeline.md`. Day 9 (Sat 9/26) is the party and has no phase; use `../runbooks/party-day.md`.

| Phase | Doc | Days | Branch | Tag when done | Goal | Gate |
|---|---|---|---|---|---|---|
| 0 Foundations | [phase-0](phase-0-foundations.md) | Day 1, Fri 9/18 | `phase-0-foundations` | `phase-0-done` | Repo scaffold, Pi setup, contracts confirmed, performance spike | 30-character spike fps recorded with the rendering choice; app runs on Mac and Pi; audio path verified or a fallback chosen |
| 1 Characters | [phase-1](phase-1-characters.md) | Day 2, Sat 9/19 | `phase-1-characters` | `phase-1-done` | Rig, parts, gallery, character JSON, renderer, first clips | A custom character walks and dances on the Pi display |
| 2 Server and Character mode | [phase-2](phase-2-server-and-character-mode.md) | Day 3, Sun 9/20 | `phase-2-server-and-character-mode` | `phase-2-done` | WebSocket server, profiles, strip, create/edit/remove, tablet flow, name filter, pad hardware check | 3+ real phones create characters live; pad recognized on the Pi (else order the keypad) |
| 3 Scene engine | [phase-3](phase-3-scene-engine.md) | Day 4, Mon 9/21 | `phase-3-scene-engine` | `phase-3-done` | Scene config, Chilling scene, autonomy, props, remaining clips, debug panel, minimal bots, depth bands if on track | 15+ bots look alive on the Pi, no stutter |
| 4 Actions | [phase-4](phase-4-actions.md) | Day 5, Tue 9/22 | `phase-4-actions` | `phase-4-done` | Registry, queue, cooldown, fairness, Interact UI, queue overlay, cake script, pad adapter | Spam test passes; cake time runs end to end from the debug panel |
| 5 Admin and moments | [phase-5](phase-5-admin-and-moments.md) | Day 6, Wed 9/23 | `phase-5-admin-and-moments` | `phase-5-done` | Admin panel, timeouts, Game/Gift/Dancing scenes, transition cards, focus mode, broadcast, audio wiring, demo mode | Full run-of-show works from the admin panel, with focus on Cake and Gift and a late-joining phone getting focus |
| 6 Polish and hardening | [phase-6](phase-6-polish-and-hardening.md) | Days 7-8, Thu 9/24 to Fri 9/25 | `phase-6-polish-and-hardening` | `phase-6-done` | PNG download, final audio, pad labels, TV QR, auto-start, fallback, backups, rehearsal | Reboot test passes; rehearsal passes the acceptance criteria; backup taken. Feature freeze Fri midday |

## Git conventions

| Rule | Detail |
|---|---|
| Branch | Work on the phase branch named above. `main` is always deployable. |
| Commits | Small and often: `phaseN: <what>`. |
| Merge | When the gate passes, merge to `main` with `--no-ff`, then tag `phase-N-done`. |
| Fallback | The last good tag is the party fallback. |
| Never | Push, force-push, or rewrite history without asking Justin. |

## Coverage table: requirement IDs

Every requirement ID from `../requirements.md` is listed once, under the phase that completes it (or the backlog). Items that span phases are described in each phase doc under "Requirements covered".

| Phase | Requirement IDs |
|---|---|
| 0 | R-1, D-1, D-9 |
| 1 | D-2, D-8 |
| 2 | G-1, G-2, G-3, G-4, G-6, A-1, A-2, A-3, A-4, A-5, A-6, C-1, C-2, C-3, C-4, C-5, C-6, C-7, C-10, R-4 |
| 3 | D-3, D-5, D-6, D-7, D-16 |
| 4 | Q-1, Q-2, Q-3, Q-4, Q-5, Q-6, Q-7, Q-8, Q-9, Q-10, Q-11, Q-13, Q-14, I-1, I-2, I-3, I-4, I-5, I-6, I-7, I-8, D-4, P-1, P-2, P-3, P-4, P-5, P-6 |
| 5 | Q-12, Q-15, I-9, AD-1, AD-2, AD-3, AD-4, AD-5, AD-6, AD-7, AD-8, AD-9, AD-10, AD-11, T-1, T-2, T-3, T-4, T-5, T-6, T-7, T-8, B-1, B-2, B-3, AU-1, D-10, D-11, D-13, D-14 |
| 6 | C-8, D-12, G-5, R-2, R-3, R-5, AU-2 |
| Backlog | C-9, D-15, T-9 |

## Coverage table: acceptance criteria

From `../requirements.md` section 8.

| # | Criterion (short) | Verified in |
|---|---|---|
| 1 | 10+ real devices, no stutter | Phase 6 |
| 2 | Full run-of-show end to end | Phase 5 |
| 3 | Spam test (20 bots, 60 s) | Phase 4 |
| 4 | Cooldown survives a refresh | Phase 4 |
| 5 | Power-cycle returns to Chilling | Phase 6 |
| 6 | Reset to safe scene clears queue and effects | Phase 5 |
| 7 | Audio swap with no code change | Phase 5 (wired), Phase 6 (final check) |
| 8 | Pad matches the Interact grid | Phase 4 |
| 9 | Two characters on one phone | Phase 4 |
| 10 | TV queue display during and after the spam test | Phase 4 |
| 11 | Admin device timeout | Phase 5 |
| 12 | Gift time locks phones and pad; late joiner too | Phase 5 |
| 13 | Focus ends: release, scene change, failsafe | Phase 5 |
| 14 | Broadcast plays; admin sees reach | Phase 5 |

## Planned code layout (created in Phase 0)

| Folder | Holds | Built in |
|---|---|---|
| `server/` | WebSocket, storage, queue, scene director | 2 (core), 4 (queue), 5 (admin) |
| `web/guest/` | Guest app | 2 (Character mode), 4 (Interact) |
| `web/admin/` | Admin panel | 5 |
| `web/display/` | TV renderer, effects, debug panel | 0 (spike), 1, 3, 4 |
| `pad-service/` | MIDI pad reader | 4 |
| `shared/` | Code and types used by more than one app | 0 onward |
| `assets/` | `audio/{music,sfx,broadcast}`, `icons`, `parts`, `scenes` | 1 (parts), 3 (scenes), 4 (icons), 5 (audio) |
| `config/` | Settings, scenes, action registry | 0 onward |
| `data/` | Runtime data (gitignored) | 2 |
| `scripts/` | Deploy, health check, backup | 0, 6 |
| `tests/` | Tests and the spam test | 0 onward |

## Slip rules

- Phase 3: depth bands move to Phase 5 if Day 4 is behind.
- Phase 4 is the heaviest day. The pad adapter moves to Phase 5 if it slips.
- Phase 5 is heavy. Take-turns, queue display polish, and broadcast move to Phase 6 if it slips.
- Cut list, from the top: MIDI pad station; animated GIF; Cloudflare Tunnel; pair interactions; queue extras (lanes, coalescing); Dancing scene. Must-have items are never cut without asking Justin.
- When something slips, note it in `../../PROGRESS.md` and in the receiving phase doc.
