# Hello Kitty Party Display: Requirements (v1 draft)

Date: Fri Sep 18, 2026
Party: Sat Sep 26, 2026
Companion docs: `notes.md` (background and ideas), `timeline.md` (day-by-day plan)

Priority key: **M** = must have, **S** = should have, **X** = stretch.
"(proposed)" marks details added while drafting that still need Justin's confirmation.

## 1. Overview

A Hello Kitty themed "party on the TV." Simple layered SVG characters, created by the guests, live in a scene on the living room TV and have some autonomy. Guests create characters and trigger effects and reactions from their phones or a shared tablet. A physical MIDI pad offers the same actions. The scene follows the party: chilling, game time, cake time, gift time. Everything runs locally on a Raspberry Pi 5.

## 2. Context and assumptions

- Event: Sat Sep 26, 2026, at home, for a 9-year-old. About 16 kids of various ages, plus parents.
- Location: living room. The TV sits on a fireplace mantle in a recess. A soundbar sits directly beneath the TV and plays all party audio. The room is bright with natural daylight.
- Hardware: Raspberry Pi 5 at the TV (HDMI to the TV, audio through the TV to the soundbar), a wired USB MIDI pad controller (expected Sun 9/20), and one tablet for kids without phones.
- Network: home Wi-Fi. The Pi has a static IP. Guests reach the site by QR code.
- Development: on a Mac, deployed to the Pi with git and systemd.
- Audio: Justin supplies the final music and sound effects. Placeholders are used until then.
- Admins: Justin and his wife, sharing one passphrase.

## 3. Roles

| Role | Description |
|---|---|
| Guest | A kid or parent using the guest app on a phone or the shared tablet. |
| Admin | Justin or his wife. Controls scenes and moderates. |
| Display | The TV, showing the party scene. No interaction. |
| Pad station | The physical MIDI pad. Any guest can press it. |

## 4. Components

1. **Server** (Node or Python) on the Pi: WebSocket, character storage, action queue, scene director, admin API, static files.
2. **Display**: Chromium kiosk on the Pi's HDMI output. Renders characters, scenes, effects, and audio.
3. **Guest app**: mobile web app with two modes, Character and Interact.
4. **Pad service**: reads the MIDI pad and sends events to the server.
5. **Admin panel**: mobile web page behind the shared passphrase.

## 5. Functional requirements

### 5.1 Access and identity

| ID | Pri | Requirement |
|---|---|---|
| G-1 | M | Guests join the Wi-Fi with a QR code and open the site with a second QR code. The site works in current iOS Safari, Android Chrome, and the tablet's browser. |
| G-2 | M | No accounts. On first open, the guest enters a display name. A device token in the browser keeps the profile across refreshes. |
| G-3 | M | On the shared tablet, a "New guest" button starts a fresh profile (new name, new token), so many kids can use it one after another. Characters already created stay on the TV. |
| G-4 | S | **Name filter.** A name must be short (about 12 characters), use plain letters, numbers, and spaces, and pass a blocklist of inappropriate words. A name that fails gets a friendly "try another name" on the phone. Names that pass show right away. |
| G-5 | X | Cloudflare Tunnel as a second way in. Admin routes must be protected. |
| G-6 | M | A device profile can hold up to 3 characters that belong to different people. For example, a parent's phone can hold both children's characters, and the parent switches between them. |

### 5.2 Guest app: modes

| ID | Pri | Requirement |
|---|---|---|
| A-1 | M | Two modes with an always-visible switch: **Character mode** and **Interact mode**. |
| A-2 | M | Mobile-first, portrait layout, large tap targets, icons over text so young kids can use it. |
| A-3 | M | The app shows connection status and reconnects automatically. |
| A-4 | M | Opens in Character mode until the guest has a character, then in Interact mode. (proposed) |
| A-5 | M | **Character strip** across the top of both modes: one slot per saved character (up to 3) showing a thumbnail and the name, and a "+" in an empty slot. Tapping a slot makes that character the **active character** (highlighted). In Character mode the active character is the one being edited or removed. In Interact mode it is the one that acts. |
| A-6 | M | The active character is shown clearly near the button grid, so whoever holds the phone can see who is up. (proposed) |

### 5.3 Character mode

| ID | Pri | Requirement |
|---|---|---|
| C-1 | M | Create a character: choose a part for each slot (ears, bow/hat, hair, face, outfit, accessory), colors, attribute options (hair, skin tone, glasses, freckles), and a name. |
| C-2 | M | Live preview while editing, with an idle animation. |
| C-3 | M | A guest can have at most **3** characters. The UI shows the slots. Creating a fourth is disabled with a clear message. |
| C-4 | M | Edit an existing character. Changes appear on the TV. |
| C-5 | M | Remove a character. It disappears from the TV. |
| C-6 | M | New characters enter the TV scene with a short entrance animation. |
| C-7 | M | Each character has an on-stage toggle. A configurable cap limits the total number of characters on the TV (default set from the Day 1 performance test, target about 30). When the cap is reached, the guest sees "stage is full." (proposed) |
| C-8 | S | Download a character as a PNG with a transparent background. |
| C-9 | X | Download a character as an animated GIF. |
| C-10 | M | Characters are stored on the Pi as data (parts, colors, name, personality), so they survive a restart. |

### 5.4 Interact mode

| ID | Pri | Requirement |
|---|---|---|
| I-1 | M | A 4x4 grid of buttons identical in layout, icons, and meaning to the MIDI pad's 16 actions. One action registry drives both. |
| I-2 | M | Tapping a button sends the action to the server. The server answers with one of: accepted, queued, rejected (cooldown or not allowed in this scene). |
| I-3 | M | After a character's action plays, the buttons are disabled for that character for a short cooldown (default about 3 s, configurable). A fast animation on the buttons and a countdown show this. Switching to another character that is ready re-enables the buttons. |
| I-4 | M | Buttons not allowed in the current scene are dimmed with a look distinct from cooldown. A tap shows a gentle "not now" hint. |
| I-5 | M | Feedback for a queued action: a "you're in line" state, "you're next!" when it is locked as the next one to play, then a "you did it!" moment when it plays. (proposed) |
| I-6 | M | When an action plays, the TV shows the **active character's** name (unless an admin has hidden it) and that character leads the reaction. |
| I-7 | M | Each character has its own cooldown and pending slot, so switching characters on a shared phone gives each child their own turn. The strip shows each character's state (ready, in line, or cooling down) as a small ring on its thumbnail. |
| I-8 | M | Interact mode needs an on-stage active character. Tapping an off-stage character in the strip puts it on stage if the on-stage cap allows. (proposed) |
| I-9 | S | **Take turns** toggle in Interact mode, which the guest can switch on or off at any time. When on, after a character's action plays, the active character advances to the next on-stage character on the strip that is ready (skipping any that are cooling down or in line). |

### 5.5 Action system: buffer, cooldown, priority

Actions from phones, the pad, admin buttons, and scene scripts all flow through one system.

| ID | Pri | Requirement |
|---|---|---|
| Q-1 | M | **Action registry.** Each action is defined once: id, icon, lane (effects, emotes, movement, mood), duration, sound, pad number, allowed scenes, coalescing flag, optional group-wide cooldown. |
| Q-2 | M | **Buffer.** Actions triggered while another is playing are queued and run in order. |
| Q-3 | M | **Cooldown.** Per character, so each child has their own even when several share a phone. Server-authoritative (the phone displays a timer from a server timestamp; the server rejects early presses). The pad has its own per-pad cooldown. Presses during cooldown are ignored without penalty. |
| Q-4 | M | **Fair priority.** When the queue can run the next action, it picks the pending action from the character who has gone the longest without a played action. Characters that have never played go first. Ties go to the earliest press. Fairness is per character, so kids who share a phone or the tablet get the same standing as kids with their own phones. |
| Q-5 | M | **One pending action per character.** While a character has an action waiting, it cannot press again (the phone can still switch to another character). This bounds the queue by the number of characters. (proposed) |
| Q-6 | M | **Expiry.** Pending actions older than about 6 s are dropped, and the phone says so. (proposed) |
| Q-7 | M | **Character state machine:** Ready, Waiting (in line), Playing, Cooldown, back to Ready. The cooldown starts when the action plays, not when it is pressed. (proposed) |
| Q-8 | M | Admin actions and scripted cues bypass the queue. A scene change clears pending guest actions. |
| Q-9 | S | **Lanes.** Each lane (effects, emotes, movement, mood) runs one action at a time. Different lanes run at the same time. (proposed) |
| Q-10 | S | **Coalescing.** The same action from several guests within a short window merges into one play, crediting the names. (proposed) |
| Q-11 | S | **Group-wide cooldown** for mood actions (about 15-20 s) so one guest cannot keep changing the lighting for everyone. (proposed) |
| Q-12 | M | **Device timeout.** An admin can time out a device for a set time (for example 1, 2, or 5 minutes). All characters on that device are ignored, and the phone shows a friendly "taking a break" state with a countdown. This is the main tool against spamming. |
| Q-13 | S | **Locked next.** The next action to play is locked, so later arrivals cannot bump it. This keeps the TV's queue display from reshuffling under people's feet. (proposed) |
| Q-14 | M | **Device flood guard.** A safety net separate from fairness: a device can send at most about one accepted press per second, which normal tapping and switching never hits. (proposed) |
| Q-15 | S | Admin can change the cooldown live. |

### 5.6 MIDI pad station

| ID | Pri | Requirement |
|---|---|---|
| P-1 | S | A wired USB MIDI pad controller is read by a pad service on the Pi. Each press becomes a `pad:N` action with velocity. |
| P-2 | S | The 16 pads have fixed meanings (table below) and icon labels. |
| P-3 | S | Only note-on messages are used. Aftertouch and note-off are ignored. Note Repeat is off. |
| P-4 | S | Velocity sets intensity (soft, medium, hard map to small, medium, large effects). |
| P-5 | S | The pad is one guest identity ("Pad") in the action system, with its own per-pad cooldown. |
| P-6 | S | For development, keyboard keys and the debug panel produce the same `pad:N` events. |

Pad and Interact grid layout (also the action registry):

| | 1 | 2 | 3 | 4 |
|---|---|---|---|---|
| Row 1: effects | Confetti | Hearts | Fireworks | Stars |
| Row 2: group emotes | Cheer | Laugh | Wave | Clap |
| Row 3: movement | Dance | Jump | Spin | Conga line |
| Row 4: mood | Disco lights | Rainbow | Lights down | Surprise (random) |

### 5.7 Display (TV)

| ID | Pri | Requirement |
|---|---|---|
| D-1 | M | Chromium kiosk, full-screen at 1080p, starts on boot, hides the cursor, never blanks. |
| D-2 | M | Renders characters from their data on one shared rig (named layers and pivot points), so every combination of parts works with every animation. |
| D-3 | M | Animation clips: idle, walk, dance (2-3 variants), wave, jump, cheer, laugh, clap, sleep, spin. |
| D-4 | M | Effects: confetti, hearts, fireworks, stars, disco lights, rainbow, lights down. |
| D-5 | M | **Autonomy.** Each character has energy/mood and a random personality. Every few seconds it chooses an action weighted by scene, personality, mood, and nearby characters. |
| D-6 | M | **Scene props advertise actions** (cake table, gift pile, couch, dance floor). Characters walk to nearby props and use them. |
| D-7 | M | Names show above characters unless an admin has hidden them. |
| D-8 | M | Art is bold and high-contrast so the TV is readable in bright daylight. |
| D-9 | M | Avoid expensive rendering (SVG filters, many nodes per character) to hold frame rate. |
| D-10 | S | Pair and group interactions: high-five, hug, dance together, conga line. |
| D-11 | S | Icon bubbles (hearts, stars, and so on) over characters. |
| D-12 | S | The Wi-Fi and site QR codes show in a corner of the TV in the Chilling scene. |
| D-13 | S | Demo/bot mode: generated characters and actions fill the screen before guests arrive. |
| D-14 | S | **Queue display.** While actions are waiting, a compact panel on the TV shows what is playing now, who is up next, and "+N waiting". Each entry shows the character's thumbnail, the name (unless hidden), and the action icon. Text is large enough to read from across the room. It hides when the queue is empty and stays clear of the QR code corner. (proposed) |
| D-15 | X | Characters with a waiting action raise a small hand over their heads, and the acting character steps forward when its turn comes. (proposed) |
| D-16 | S | **Depth bands.** Characters live in one of three bands: front, middle, back. A band is drawn as a scale, a vertical position (back is smaller and higher on screen), and a draw order. Characters are ranked by their most recent guest-triggered action (or creation): the last few actors are in front (about 3), the next group in the middle, the rest in the back. Moving between bands is a quick hop or slide (about 0.6 s). Name labels are always drawn on top. Autonomous behavior does not count as acting and stays within a band. Backgrounds need a floor area tall enough for three bands. Scripted scenes can arrange characters in three rows. (proposed) |

### 5.8 Scenes

The default scene is **Chilling**. Run-of-show, advanced manually by an admin: Chilling, then Game time, then Cake time, then Gift time.

| Scene | Pri | Description |
|---|---|---|
| Chilling (default) | M | Characters mingle, wander, and hang out around a couch and table. |
| Game time | M | Characters play their own versions of party games. The admin picks the game: musical chairs, pin the tail, or pinata. No scoreboard or timer. |
| Cake time | M | Scripted moment, in focus mode. Characters gather at the cake table and candles are lit while the room sings. The scene waits for the admin's "blow out" cue, then candles go out, fireworks, and everyone cheers. |
| Gift time | M | Focus mode. A calm scene: characters sit in a circle around a gift pile with quiet or no music, so everyone's attention stays on the birthday girl. |
| Dancing | S | Dance floor scene. Kept, but not in the run-of-show. The admin can switch to it any time. |

Each scene is a configuration: background SVG, props with points of interest and the actions they offer, music file and volume (or none), behavior weights, interaction level (open, limited, or locked), TV mood (normal or calm), a transition card, allowed Interact actions, and an optional timeline of cues. Adding a scene means adding a config and a background, not new code.

Scene interaction defaults: Chilling, Game time, and Dancing are open (all 16 actions). Cake time and Gift time are locked (focus mode). After Gift time, the admin returns to Chilling or switches to Dancing.

### 5.9 Transitions, focus mode, and broadcast

Scene changes are also how the app signals real-life events, such as "time to open gifts" or "sing Happy Birthday." During some of those moments the app steps out of the way, so the birthday girl gets everyone's attention.

| ID | Pri | Requirement |
|---|---|---|
| T-1 | M | **Transition card.** A scene change first shows a full-screen card on the TV: a big title and icon (for example "Cake time!") with a sound. It either dismisses itself after a set time or holds until an admin releases it. |
| T-2 | S | The same card appears as a banner on phones. |
| T-3 | M | **Focus mode.** While on, phones show a calm full-screen message with a dark, low-brightness look, and both modes are locked. The pad is ignored. The TV goes calm: music lowered or off (per scene), no autonomous flourishes, and no guest-triggered effects. Pending actions are cleared. |
| T-4 | M | A scene's config sets its interaction level (**open**, **limited**, or **locked**) and its TV mood (**normal** or **calm**). Entering a locked scene turns focus mode on. |
| T-5 | M | An admin can turn focus mode on or off at any time, from any scene, with an optional message (for example "Listen up!"). This replaces a plain "pause Interact." |
| T-6 | M | Focus mode ends when an admin releases it or moves to a scene that is not locked. A failsafe releases it automatically after a configurable time (default 30 min). "Reset to safe scene" also releases it. |
| T-7 | M | A device that connects or reconnects during focus mode gets the focus screen right away. |
| T-8 | M | Scripted moments can hold a card. Example: at Cake time the card "Time to sing Happy Birthday!" holds while the room sings. The admin's "blow out" cue then plays the celebration on the TV. |
| T-9 | X | **Birthday star.** An admin can mark one character as the birthday star. It wears a crown and takes center stage in Cake time and Gift time. (proposed) |
| B-1 | S | **Broadcast.** An admin can broadcast to all connected devices: a sound from a list of preloaded files, an optional banner with an icon, and vibration where the phone supports it. The target is the TV, the phones, or both (default both). The admin sees how many devices were reached. |
| B-2 | S | Broadcast sounds are short files in the assets folder, preloaded on each phone when it connects and swappable by replacing the files. |
| B-3 | S | Phones need one tap before they can play sound (the first tap in the app counts), and the app has a sound on/off toggle. Sound only reaches phones with the app open and in the foreground, and a phone on silent may stay silent, so the banner and vibration are the dependable parts. |

### 5.10 Admin panel

| ID | Pri | Requirement |
|---|---|---|
| AD-1 | M | Shared passphrase login, usable on a phone. |
| AD-2 | M | Switch scenes, with buttons for the run-of-show order. |
| AD-3 | M | Trigger scene cues (for example the cake "blow out"). |
| AD-4 | M | Remove any character or guest. |
| AD-5 | M | **Reset to safe scene:** go to Chilling, clear the queue, and stop all effects. |
| AD-6 | S | **Hide a name** with one tap. The character stays on the TV without a name label. It can be shown again. |
| AD-7 | S | Change the cooldown, change the on-stage cap, and show or hide the queue display. |
| AD-8 | S | Master volume and mute. |
| AD-9 | M | **Time out a device** (see Q-12): pick a device from a list that shows its characters' names and how many actions it sent in the last minute, then choose a duration. |
| AD-10 | M | **Focus mode** toggle with an optional message, and a release button (see T-5, T-6). |
| AD-11 | S | **Broadcast** buttons for sounds and banners (see B-1). |

### 5.11 Audio

| ID | Pri | Requirement |
|---|---|---|
| AU-1 | M | Music per scene and sound effects per action, played by the display and heard through the soundbar. |
| AU-2 | M | Placeholder audio until Justin supplies the final files. Files live in an assets folder and are swapped by replacing the files, with no code changes. Scene and action configs reference files by name. |

### 5.12 Reliability and operations

| ID | Pri | Requirement |
|---|---|---|
| R-1 | M | Everything the party needs runs on the Pi and local network, with no internet. |
| R-2 | M | Services start on boot and restart on crash (systemd). The Pi recovers unattended after a power loss. |
| R-3 | M | If the server is unreachable, the TV shows a looping fallback scene and reconnects on its own. |
| R-4 | M | Guest and character data is saved to disk. |
| R-5 | S | Backups: a git push and a copy of the Pi's SD card image before the party. |

## 6. Non-functional requirements

- **Performance:** display holds about 30 fps with the on-stage cap. Press-to-reaction under 1 s when the queue is empty. Handles at least 25 devices at once.
- **Usability:** icons over text, large tap targets, portrait layout, no reading required for the main actions.
- **Privacy and safety:** only display names and character data are stored, locally on the Pi. Data is deleted after the party. (proposed) The only free text guests enter is a name, which can be moderated.
- **Security:** admin routes require the passphrase, including through any tunnel.
- **Rights:** original Kitty-inspired art, for private party use only.
- **Development:** Mac-first development, deployed to the Pi at least daily. Debug panel and bot mode for testing.

## 7. Data definitions

Character:

```json
{
  "id": "c_8f3a",
  "ownerId": "g_21b7",
  "name": "Emma",
  "parts": { "ears": "ears_pointy", "bow": "bow_big", "hair": "hair_pigtails",
             "face": "face_dots", "outfit": "outfit_overalls", "accessory": "acc_glasses" },
  "colors": { "skin": "#f6d7b8", "hair": "#5a3a22", "bow": "#e60012", "outfit": "#4a90d9" },
  "personality": "bouncy",
  "onStage": true,
  "nameHidden": false
}
```

Action registry entry:

```json
{
  "id": "confetti",
  "icon": "icons/confetti.svg",
  "pad": 1,
  "lane": "effects",
  "durationMs": 3000,
  "coalesce": true,
  "groupCooldownMs": 0,
  "sound": "sfx/confetti.mp3",
  "scenes": ["chilling", "game", "cake", "gifts", "dancing"]
}
```

Action event:

```json
{ "type": "action", "actionId": "confetti", "guestId": "g_21b7",
  "characterId": "c_8f3a", "source": "phone", "intensity": 2, "ts": 1790000000000 }
```

## 8. Acceptance criteria (party-ready)

1. At least 10 real devices, on party Wi-Fi, create characters and use Interact mode with no display stutter on the Pi.
2. The full run-of-show (Chilling, Game time, Cake time, Gift time) runs end to end in the rehearsal.
3. **Spam test:** 20 bot guests mashing buttons for 60 seconds. The screen stays readable, and every guest gets at least one action played in that time.
4. Cooldown cannot be bypassed by refreshing the page.
5. Power-cycling the Pi returns the TV to the Chilling scene on its own.
6. "Reset to safe scene" clears the queue and effects.
7. Swapping an audio file in the assets folder changes the sound with no code change.
8. The pad triggers the same actions as the Interact grid (if the pad is in use).
9. Two characters on one phone: a press as one child, a switch, and a press as the other child both work without waiting on each other's cooldown, and each shows its own name on the TV.
10. The TV queue display shows waiting characters during the spam test and clears when the queue is empty.
11. An admin can time out a device. It is ignored for the chosen time and recovers on its own.
12. Entering Gift time locks all phones and the pad to the focus screen and calms the TV. A phone that joins late also gets the focus screen.
13. Focus mode ends when the admin releases it, when the scene changes to one that is not locked, or after the failsafe time.
14. A broadcast sound plays on phones that have the app open and sound enabled, and the admin sees how many devices were reached.

## 9. Open items

- On-stage cap value: set after the Day 1 performance test.
- Default cooldown (3 s), expiry (6 s), and mood group cooldown (15-20 s): tune at the rehearsal.
- Delete all guest and character data after the party? (6)
- Queue display style: list only, or also the raised hands? (D-14, D-15)
- Depth bands (D-16): how many characters per band, and whether backgrounds get layered art or just a floor for the bands.
