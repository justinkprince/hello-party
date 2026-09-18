# Runbook: party day

For Justin and his wife. Party: Sat Sep 26, 2026. Admin button names below follow `../contracts.md` and may differ slightly once the admin panel is built; the panel is the truth. Pi commands are in `pi-setup.md`.

## Friday rehearsal checklist (Fri 9/25)

- [ ] Feature freeze by midday. Bug fixes only after that.
- [ ] Rehearsal with the birthday girl and friends or family on their own devices (aim for 10 or more)
- [ ] Run the whole run-of-show, including focus mode and a phone that joins late
- [ ] Spam test with bots running at the same time
- [ ] Try a fourth character on one phone; two characters on one phone; tablet "New guest"
- [ ] Time out a device; hide a name; broadcast a sound and read the reached count
- [ ] Press "Reset to safe scene" while effects are running
- [ ] Swap one audio file by name and hear the change
- [ ] Power-cycle the Pi and confirm it returns to Chilling on its own
- [ ] Tune cooldown, expiry, and mood cooldown; write the final values in `../decisions.md`
- [ ] Back up: git push (if a remote exists) and a copy of the Pi's SD card image
- [ ] Charge devices, set out signage and stations

## Saturday morning setup (Day 9)

- [ ] Morning setup: power on, verify Wi-Fi, tunnel (if used), signage, stations, volume, admin logged in on your phone
- [ ] Reset to the starting scene
- [ ] TV brightness high; check the picture in daylight; blinds as needed
- [ ] Scan both QR codes with one phone to be sure they work
- [ ] Tablet charged, on the guest page, near the door
- [ ] Pad plugged in, labeled, and pressed once (if in use)
- [ ] Demo mode on until the first guests arrive, then off

## Run-of-show

Advance each scene from the admin panel. Chilling is the default.

| Step | Scene | Admin action | What guests see |
|---|---|---|---|
| 1 | Chilling (default) | Reset to the starting scene. Optional: demo mode until guests arrive. | Characters mingle around the couch and table. All 16 actions are open. |
| 2 | Game time | Switch scene, then pick the game (musical chairs, pin the tail, or pinata). | Transition card, then characters play their version. All 16 actions are open. |
| 3 | Cake time (focus on) | Switch scene. The card "Time to sing Happy Birthday!" holds while the room sings. Press the "blow out" cue when the song ends. | Phones show the calm screen, and the pad is ignored. Candles go out, fireworks, everyone cheers. |
| 4 | Gift time (focus on) | Switch scene. Release focus if it needs to end early. | Calm scene, characters sit around the gift pile. Phones stay on the calm screen. |
| 5 | Back to Chilling, or Dancing | Switch scene (focus ends when the scene is not locked). | Everything opens again. Dancing is optional. |

## Admin cheat sheet

| I want to... | Do this |
|---|---|
| Switch scene | Scene buttons in run-of-show order. |
| Focus on or off | Focus toggle, with an optional message (for example "Listen up!"). The release button ends it. Failsafe ends it after 30 minutes. |
| Time out a device | Open the device list, pick the device (it shows character names and recent presses), choose 1, 2, or 5 minutes. |
| Hide a name | Tap hide next to the character. Tap again to show. |
| Remove a character | Pick the character and remove it. |
| Broadcast | Pick a sound and a banner; check the reached count. |
| Change the cooldown | Cooldown control (live). |
| Volume or mute | Master volume and mute. |
| Panic button | **Reset to safe scene**: goes to Chilling, clears the queue, stops all effects, releases focus. |

## Emergency steps

| Problem | Do this |
|---|---|
| Screen is chaotic or stuck | Reset to safe scene. |
| Someone is spamming | Time out their device. |
| Server is down, TV shows the fallback loop | Wait 30 seconds (it restarts by itself). If nothing changes, power-cycle the Pi. It should come back on its own. |
| Phones cannot reach the site | Check the phone is on the party Wi-Fi; re-scan the QR code. If the network blocks phones, use the tunnel link if set up. |
| Something new is broken and the current build is bad | Roll back to the last good tag (see `../../README.md`, "If something goes wrong"), then reboot the Pi. |
| No sound on the TV | Check the TV volume and the soundbar input; check the mute toggle in the admin panel. |

## Teardown

- [ ] Power down the Pi cleanly
- [ ] Decide whether to delete guest and character data (open item O-3 in `../decisions.md`; decision D-23 proposes yes). Do not delete anything until Justin says so.
- [ ] Take a final copy of `data/` first if any characters should be kept as a keepsake
- [ ] Update `../../PROGRESS.md` with how it went and anything to fix for next time
