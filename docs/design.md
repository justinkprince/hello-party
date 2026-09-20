# Design guidance

Active design guidance, extracted and tightened from the original planning notes. Requirements come first (`requirements.md`); this file says how to build them. Read the section you need, not the whole file.

## Character system and shared rig

| Topic | Guidance |
|---|---|
| Characters are data | JSON (parts, colors, name, personality), never images. Stored on the Pi. Format in `contracts.md`. |
| One shared rig | All parts are drawn on the same canvas with named layers and pivot points. Any combination of parts works with any clip, and each clip is written once for all characters. |
| Layers and pivots | Named layers such as body, head, hair, face, bow, outfit, accessory, arms, legs. Each has a pivot for rotation. Define them in Phase 1 and do not change them later without updating every clip. |
| Art scope | About 35 parts in total (bows/hats, hair, faces, outfits, accessories, held items). The main cost is drawing, not code. Fewer parts with more color variation beats more parts. |
| Color variables | Parts use CSS variables (skin, hair, bow, outfit) so one drawing gives many looks. |
| Clips | About 12: idle, walk, dance (2 to 3 variants), wave, jump, cheer, laugh, clap, sleep, spin. |
| Style | Bold, high-contrast, readable on a TV in bright daylight. Original Kitty-inspired art only. |
| Performance rules | No SVG filters. About 50 nodes per character. Test 20 to 30 characters at once on the Pi. If the spike stutters, fall back to canvas or PixiJS sprite textures. Give each character its own `<svg>` inside a positioned wrapper so moving it is cheap, and draw effects (confetti, fireworks, stars) on one canvas overlay unless the spike shows DOM effects are fine. |
| Attribute options | Hair, skin tone, glasses, freckles, chosen from fixed lists so any character looks like its owner without photos. |

## Autonomy and smart objects

- Each character has mood and energy and a random personality.
- Every few seconds it picks an action, weighted by the scene, its personality, its mood, and nearby characters.
- Scene props (cake table, gift pile, couch, dance floor) are points of interest that advertise actions. Cake table: gather, admire. Gift pile: open, cheer. Dance floor: dance. Couch: chill. Characters choose among nearby advertised actions and walk there.
- Autonomous behavior never counts as a guest action (matters for depth bands and fairness).

## Pair interactions (stretch)

High-five, hug, dance together, conga line, plus icon bubbles or canned-line speech bubbles. On the cut list; build only if the schedule allows.

## Scenes as config

- A scene is a config: background SVG, props with points of interest, music and volume, behavior weights, interaction level, TV mood, transition card, allowed actions, optional cue timeline.
- A new scene means a new config and a background, not new code. Schema in `contracts.md`.
- Game time is an ordinary scene: a party-game background (a pinata and a pin-the-tail game may appear, for show only) with characters interacting with it and each other and reacting to events. There are no game rules, no game choice, no scoreboard, and no timer.

## Scripted beats and cues

Scene timelines have cues. Between cues, autonomy runs. Example, Cake time: gather at the table, candles lit, hold the "sing Happy Birthday" card, wait for the admin's "blow out" cue, candles out, fireworks, everyone cheers. Cues that wait for an admin are the only step that blocks.

## Depth bands

- Three bands: front, middle, back. A band sets scale, vertical position (back is smaller and higher), and draw order.
- Characters rank by their most recent guest-triggered action (or creation): about 3 in front, the next group in the middle, the rest at the back. Moving bands is a quick hop or slide (about 0.6 s).
- Name labels always draw on top.
- Start with characters only. Backgrounds need a floor tall enough for three bands. Layered background art is a stretch (see `backlog.md`).

## Connectivity

| Topic | Guidance |
|---|---|
| Local first | Phones join the party Wi-Fi and open the Pi's site by QR code. No internet needed. |
| Static IP | Give the Pi a static IP so the QR code never changes. |
| Guest Wi-Fi isolation | Guest networks often block phones from reaching other devices. Test a phone on the party network in Phase 2. Fallbacks: put guests on the same network as the Pi, or use the tunnel. |
| Cloudflare Tunnel | Optional second way in, on Justin's own domain. Needs internet. Admin routes must stay protected. |
| No accounts | Guests get a device token. Admins share one passphrase from `.env`. |
| QR codes | Two: one to join Wi-Fi, one for the site. Generate them from `.env` values. Nothing secret goes in git. |

## Dev workflow

- Develop natively on the Mac: the server runs there, a browser is the "TV", phones use the Mac's LAN address.
- No Docker. Docker on macOS cannot pass USB devices through, and the real risk is Pi performance, not logic.
- Deploy to the Pi at least daily and check performance there.
- Keyboard keys stand in for the pad until the controller works on the Pi.
- Build a debug panel that fires fake events (pad presses, actions, scene changes) and a bot mode that spawns fake characters and actions, for stress tests and the pre-guest demo.

## Pad controller notes

- Candidate: M-VAVE 4x4 RGB velocity-sensitive pad with USB and Bluetooth MIDI. Not verified on a Pi. Use wired USB.
- Read MIDI server-side in a small pad service and send `padPress` with velocity. This avoids browser permission prompts in the kiosk.
- Note-on only. Ignore aftertouch and note-off. Note Repeat off.
- Pad meanings are fixed so labels never change. The scene decides which pads are enabled. Per-pad cooldown plus the device flood guard.
- Velocity sets intensity (bigger confetti).
- LED color control from the host is device-specific and `UNVERIFIED`. Do not depend on it.
- Labels: icons, not words, under clear tape, or a cardboard faceplate with larger icons around the pads.
- On arrival (expected Sun 9/20): run `amidi -l` and `aseqdump` on the Pi.
- Backup: a cheap USB numeric keypad, ordered only if the pad fails the Pi test.

## Room, TV, and audio notes

| Topic | Guidance |
|---|---|
| Location | The TV sits on a fireplace mantle in a recess, with cabinets on both sides. Put the Pi behind, beside, or on top of the TV. Do not run the fireplace, and keep the Pi ventilated. |
| Light | Bright daylight. Set TV brightness high, use bold high-contrast art, and check at party time of day. Blinds can close the side window if needed. |
| TV settings | Game or low-latency mode. Disable auto power-off and screensaver. Check HDMI-CEC input switching. Disable screen blanking on the Pi. |
| Audio | All party audio goes Pi to TV over HDMI to the soundbar under the TV. Test the path in Phase 0. Fallback: 3.5 mm or USB audio, or Bluetooth. |
| Readability | Text on the TV (names, queue display, cards) must be readable from across the room. |

## Rights and privacy

- Original Kitty-inspired art for private party use only. Sanrio owns the characters.
- Store only display names and character data. No photos, no audio recordings.
- Fallback for a crash: the TV loops a fallback scene and reconnects on its own.
