# Hello Kitty Party Display: Timeline (calendar view)

Party date: **Sat Sep 26, 2026** (confirmed). Day 1 = Fri 9/18.
This file is the calendar only. Tasks live in the phase docs (`phases/`). Live status lives in `../PROGRESS.md`. Requirements and priorities live in `requirements.md`.
Assumes: evenings on weekdays, longer sessions on the weekend. If time is short, use the cut list instead of squeezing days.

## Goal

A "party on the TV." Guests make characters on phones or tablets, the characters have some autonomy, and scenes (chilling, game time, cake time, gift time) run on the TV in that order. Justin and his wife control scenes and moderate.

## Date to phase, with gates

| Day | Date | Phase | Gate |
|---|---|---|---|
| 1 | Fri 9/18 | [0 Foundations](phases/phase-0-foundations.md) | 30-character spike fps recorded with the rendering choice. If the spike stutters, switch rendering to canvas/PixiJS or cut the node count before building anything else. |
| 2 | Sat 9/19 (long day) | [1 Characters](phases/phase-1-characters.md) | One custom character walking and dancing on the Pi display. |
| 3 | Sun 9/20 | [2 Server and Character mode](phases/phase-2-server-and-character-mode.md) | 3 or more real phones create characters live, and the pad is recognized on the Pi (if not, order the keypad backup). |
| 4 | Mon 9/21 | [3 Scene engine](phases/phase-3-scene-engine.md) | 15 or more bot characters look alive with no stutter on the Pi. |
| 5 | Tue 9/22 | [4 Actions](phases/phase-4-actions.md) | Cake time runs end to end (from the debug panel; the admin panel comes in Phase 5), and the spam test passes. |
| 6 | Wed 9/23 | [5 Admin and moments](phases/phase-5-admin-and-moments.md) | Full run-of-show from the admin panel, with focus on Cake time and Gift time and a late-joining phone getting focus. |
| 7 | Thu 9/24 | [6 Polish and hardening](phases/phase-6-polish-and-hardening.md) | Reboot test passes. |
| 8 | Fri 9/25 | [6 Polish and hardening](phases/phase-6-polish-and-hardening.md) | Feature freeze by midday. Rehearsal passes the acceptance criteria. Backup taken. |
| 9 | Sat 9/26 | none: party day | Use [the party-day runbook](runbooks/party-day.md). |

Decision points:
- Day 6: if the pad controller has not arrived or does not work on the Pi, use the keypad backup or drop the station.
- Day 3: the pad arrives (expected Sun 9/20). If it fails the Pi test, order the USB keypad the same day (6 days of buffer).

## Cut list (cut from the top first)

1. MIDI pad station (Interact mode on phones covers the same actions)
2. Animated GIF download (PNG stays)
3. Cloudflare Tunnel
4. Pair interactions (high-five, conga line)
5. Queue extras (lanes, coalescing)
6. Dancing scene

Must-have items are never cut without asking Justin.

## Slip rules

- Phase 3: depth bands move to Phase 5 if Day 4 is behind.
- Phase 4 is the heaviest day. The pad adapter moves to Phase 5 if it slips.
- Phase 5 is heavy. Take-turns, queue display polish, and broadcast move to Phase 6 if it slips.
- Then follow the cut list. Feature freeze is Fri 9/25 midday; after that, bug fixes only.

## Risks and fallbacks

| Risk | When to check | Fallback |
|---|---|---|
| Pi cannot render many animated characters | Day 1 spike | Fewer nodes per character, canvas/PixiJS, cap at about 12 characters |
| Guest Wi-Fi blocks access to the Pi | Day 3 | Put guests on the same network as the Pi, or use the tunnel |
| Art takes longer than planned | Day 2 | Fewer parts, more color variation |
| Pi audio not reaching the soundbar | Day 1 | Alternate audio path (3.5 mm/USB audio or Bluetooth) |
| Pad controller not recognized on the Pi | Sun 9/20 (arrival) | Order the USB keypad backup, or use phone actions only |
| Action spam overwhelms the screen | Day 5 spam test | Longer cooldown, shorter expiry, admin pause or device timeout |
| Phones do not play the broadcast sound (silent mode, app in background, audio not unlocked) | Day 6 | Rely on the banner and vibration. The TV plays the sound. |
| Crash mid-party | Day 7 | Auto-restart, admin reset, safe fallback scene |
| Running out of time | Any day | Follow the cut list |
