# Hello Kitty Party Display: Timeline

Last updated: Fri Sep 18, 2026 (Day 1)
Party date: **Sat Sep 26, 2026** (confirmed)
Companion docs: `requirements.md` (what to build), `notes.md` (ideas and design approach)
Assumes: evenings on weekdays, longer sessions on the weekend. If you have less time, use the cut list instead of squeezing days.

## Goal
A "party on the TV." Guests make characters on phones or tablets, the characters have some autonomy, and scenes (chilling, game time, cake time, gift time) run on the TV, in that order. You and your wife control scenes and moderate.

## Scope tiers

Full details are in `requirements.md`. This is the short version.

**Must have (the party works with only this):**
- Pi kiosk shows the scene and starts automatically on boot
- Guest app with Character mode (create, edit, remove, up to 3 characters per guest) and Interact mode (16 action buttons)
- Character strip across the top: switch the active character, and its name shows on the TV with each action
- Action queue: per-character cooldown, one pending action per character, fair priority, expiry
- Characters act on their own in the Chilling scene
- Run-of-show scenes: Chilling (default), Game time, Cake time (the admin triggers the blow-out), Gift time
- Transition cards and focus mode: Cake time and Gift time lock the app and calm the TV, so attention stays on the birthday girl
- Admin (shared passphrase): switch scenes, trigger cues, remove a character, reset to safe scene, time out a device
- Placeholder audio that is swappable by filename
- Wi-Fi QR and site QR signage

**Should have:**
- MIDI pad station: 16 labeled special-action pads
- Queue extras: lanes, coalescing, group cooldown for mood actions
- Name filter and one-tap hide
- Queue display on the TV (who is up next)
- PNG download of a character
- Admin extras: change the cooldown
- Broadcast a sound and banner to all phones (admin)
- Take-turns toggle in Interact mode
- Depth bands: characters step between front, middle, and back by recency of acting
- Dancing scene (optional, not in the run-of-show)
- Demo/bot mode that fills the screen before guests arrive

**Cut list (cut from the top first):**
1. MIDI pad station (Interact mode on phones covers the same actions)
2. Animated GIF download (PNG stays)
3. Cloudflare Tunnel
4. Pair interactions (high-five, conga line)
5. Queue extras (lanes, coalescing)
6. Dancing scene

Dropped: the microphone, room-noise reactions, and voice word triggers.

## Order today (lead time)
- [ ] MIDI pad controller (order today; expected to arrive Sun 9/20). Check that the box has a USB cable (get a USB-C to USB-A cable or adapter if not).
- [ ] Backup USB numeric keypad (about $10): only order it if the pad fails the Pi test on 9/20, since there are 6 days of buffer
- [ ] Micro-HDMI to HDMI cable for the Pi 5, if you do not have one
- [ ] Anything missing from the Pi kit: 27W power supply, active cooler, spare microSD card
- [x] Tablet for character creation (confirmed: there will be one)
- [ ] Paper/cardstock for QR signage

## Day-by-day

### Day 1: Fri 9/18 (today). Decisions, Pi setup, performance spike
- [x] Confirm the party date (Sat 9/26 confirmed)
- [ ] Review `requirements.md` and confirm the open items at the end of it
- [ ] Order hardware
- [ ] Pi: OS updated, Node installed, Chromium kiosk auto-start, static IP
- [ ] Test audio: Pi to TV to soundbar over HDMI
- [ ] Performance spike on the Pi: 30 simple animated SVG characters at 1080p. Record the frame rate.
- [ ] Repo initialized in this folder. Dev server runs on the Mac and on the Pi.
- **Gate:** if the spike stutters, switch rendering to canvas/PixiJS or cut the node count before building anything else.

### Day 2: Sat 9/19. Rig, parts, clips (long day)
- [ ] Define the rig: canvas size, layer names, pivot points
- [ ] Draw the base character (original, Kitty-inspired) plus first parts: 3 ears, 5 bows/hats, 4 hairstyles, 4 outfits, 4 accessories, using color variables
- [ ] Parts gallery page to preview all parts and combinations
- [ ] Character JSON format
- [ ] Animation clips v1: idle, walk, wave, dance A, jump
- **Gate:** one custom character walking and dancing on the Pi display.

### Day 3: Sun 9/20. Server, Character Studio, remote
- [ ] Server: WebSocket, character storage (JSON on disk), guest profile (name + device token)
- [ ] Guest app shell with the Character / Interact mode switch and the character strip (up to 3 names/thumbnails, tap to switch the active character)
- [ ] Character mode: create, edit, remove (max 3 per guest), name, live preview, and the character appears on the TV
- [ ] Shared tablet: a "New guest" button starts a fresh profile
- [ ] Test on real phones over Wi-Fi, including the guest network isolation check
- [ ] Scan the Wi-Fi and site QR codes from an iPhone and an Android phone
- [ ] Pad controller arrives (expected Sun 9/20): plug it into the Pi, confirm it shows up (`amidi -l`), and that pad presses appear as note-on messages (`aseqdump`)
- **Gate:** 3 or more real phones create characters live, and the pad is recognized on the Pi (if not, order the keypad backup).

### Day 4: Mon 9/21. Scene engine and autonomy
- [ ] Scene config format (background, props with points of interest, music, behavior weights, allowed actions)
- [ ] "Hanging out" scene
- [ ] Autonomy: pick an action every few seconds, weighted by scene, personality, and mood. Walk to points of interest.
- [ ] Depth bands for characters (front, middle, back by recency of acting): scale, vertical position, draw order, hop between bands. Only if Day 4 is on track, otherwise Day 6.
- [ ] More clips: cheer, laugh, sleep, spin
- [ ] Debug panel that fires fake events (pad presses, emotes, scene changes) for testing
- **Gate:** 15 or more bot characters look alive with no stutter on the Pi.

### Day 5: Tue 9/22. Cake time and events
- [ ] Event bus and scene director (source-agnostic, so phones, pads, and later devices all plug in the same way)
- [ ] Action registry (16 actions: id, icon, lane, duration, sound, allowed scenes) shared by the phone grid, the pad, and the TV
- [ ] Action queue: server-authoritative cooldown per character, one pending action per character, least-recently-played first, 6 s expiry, device flood guard (about 1 press per second), admin actions bypass the queue
- [ ] Interact mode: 4x4 button grid, cooldown animation with countdown, "in line" and "you did it!" states, dimmed buttons for actions not allowed in the scene. The active character's name shows on the TV and that character leads the reaction.
- [ ] Queue overlay on the TV (plain debug version showing who is waiting for what)
- [ ] Cake time script: gather, candles lit, hold the "sing Happy Birthday" card, wait for the admin cue, blow out, fireworks, cheer
- [ ] Pad input adapter: the same `pad:N` event (with velocity) from MIDI, keyboard keys (for development), and the debug panel
- [ ] Spam test: 20 bot guests mashing for 60 s (screen stays readable, every guest gets served)
- **Gate:** cake time runs end to end from the admin cue, and the spam test passes.
- Note: this is the heaviest day. If it slips, the pad adapter moves to Day 6.

### Day 6: Wed 9/23. Admin and remaining scenes
- [ ] Admin panel (shared passphrase): switch scene, trigger cues, remove character, reset to safe scene, time out a device (device list with character names and recent action counts), focus on/off; then hide names, change the cooldown
- [ ] Transition cards (TV) and focus mode (phones lock to a calm screen, the TV goes calm, failsafe auto-release), used by Cake time and Gift time
- [ ] Broadcast a sound and banner to all phones (audio unlock on first tap, sound toggle, preloaded files)
- [ ] Game time scene (musical chairs, pin the tail, pinata variations)
- [ ] Gift time scene (as a config, locked and calm)
- [ ] Dancing scene (kept, not in the run-of-show)
- [ ] Polish the TV queue display (thumbnails, names, +N waiting, hides when empty)
- [ ] Take-turns toggle in Interact mode (auto-advance the active character)
- [ ] Demo/bot mode
- [ ] Placeholder music and sound effects wired in from an assets folder (you supply the final files and swap them by filename)
- **Decision point:** if the pad controller has not arrived or does not work on the Pi, use the keypad backup or drop the station.
- Note: this day is heavy. If it slips, the take-turns toggle, the queue display polish, and broadcast move to Day 7.

### Day 7: Thu 9/24. Polish and optional features
- [ ] PNG download
- [ ] Label the pads (icon stickers under clear tape, or a cardboard faceplate) and test with the real controller on the Pi
- [ ] Optional: Cloudflare Tunnel
- [ ] Swap in your final audio files, and set music and sound levels through the soundbar
- [ ] Print QR signage (Wi-Fi and site)
- [ ] Auto-start on boot, recover after power loss, safe fallback scene if the server crashes
- [ ] Check TV readability in bright daylight (brightness, high-contrast art)

### Day 8: Fri 9/25. Freeze and dress rehearsal
- [ ] Feature freeze by midday. Bug fixes only after that.
- [ ] Rehearsal with the birthday girl and friends or family on their own devices. Run the whole run-of-show, including focus mode and a phone that joins late.
- [ ] Back up: git push and a copy of the Pi's SD card image
- [ ] Charge devices, set out signage and stations

### Day 9: Sat 9/26. Party day
- [ ] Morning setup: power on, verify Wi-Fi, tunnel (if used), signage, stations, volume, admin logged in on your phone
- [ ] Reset to the starting scene
- Run-of-show: Chilling (default), then Game time, then Cake time, then Gift time. Advance each scene from the admin panel.
- Emergency: "Reset to safe scene". If the server is down, power-cycle the Pi. It should come back up on its own.

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

## Progress log
- 9/18: Plan agreed (see `notes.md`). Pad controller to be ordered, expected delivery Sun 9/20.
- 9/18: `requirements.md` drafted. Open questions answered. Guest app modes and action queue added.
- 9/18: Dancing scene kept. Character strip (switch the active character) and the TV queue display added.
- 9/18: Fairness changed to per character (kids sharing a phone get their own cooldown and place in line). Device timeout is now a must-have. Take-turns toggle and depth bands added.
- 9/18: Name approval replaced by a name filter with one-tap hide. Transition cards, focus mode (Cake time and Gift time), and broadcast added.
