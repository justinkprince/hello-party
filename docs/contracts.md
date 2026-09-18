# Contracts: how the pieces talk

The interfaces between the server, the TV display, the guest app, the admin panel, and the pad service. Derived from `requirements.md` (IDs cited in brackets). Anything not stated in the requirements is marked `PROPOSED`, and Phase 0 reviews all of them (open item O-7 in `decisions.md`).

Change protocol: see section 8.

## 1. Components

```
 Guest phones / tablet     Admin phone(s)        TV (Chromium kiosk)      Pad service
 web/guest                 web/admin             web/display              pad-service/
       \                        |                       |                     /
        +--------- WebSocket  /ws  (JSON messages) -----+--------------------+
                                     |
                                  server/   state, queue, scene director, storage
                                     |
                       data/ (JSON on disk)      assets/ (static files)
```

| Component | Connects to | Purpose |
|---|---|---|
| server | everything | Owns all state. Serves static apps, the WebSocket, and a few HTTP endpoints. |
| display | server (WebSocket) | Draws the scene, characters, effects; plays audio. No input. |
| guest app | server (WebSocket) | Character and Interact modes on phones and the tablet. |
| admin panel | server (WebSocket + HTTP login) | Scenes, cues, moderation, focus, broadcast. |
| pad service | server (WebSocket) | Reads the USB MIDI pad and sends `padPress`. |

The server is the only authority. Clients render what the server tells them and never decide cooldowns, queue order, or focus.

## 2. Connections and roles

One WebSocket endpoint, `/ws`. The first message from a client must be `hello` with a `role`.

| Role | Client | Auth |
|---|---|---|
| `guest` | phone or tablet browser | Device token, issued by the server on first `hello` and kept in the browser (G-2). |
| `admin` | admin panel | Shared passphrase from `.env`, sent in `login` (AD-1). The server then marks the connection as admin. |
| `display` | Chromium kiosk | Local-only token: accepted only from the Pi itself, token from `.env`. `PROPOSED` |
| `pad` | pad service | Same local-only token as the display. `PROPOSED` |

Rules:
- Messages are JSON objects with a `type` string. Requests may carry a `reqId` that the reply echoes. `PROPOSED`
- Unknown `type`: ignore and log. Bad fields: reply `rejected` with a reason (guest) or ignore (display, pad).
- Secrets (passphrase, tokens, Wi-Fi password) live only in `.env`, never in git or in messages to guests.

## 3. Message catalog

### 3.1 Guest to server

| type | Fields | Serves |
|---|---|---|
| `hello` | `role:"guest"`, `deviceToken?` | G-2, A-3 |
| `setName` | `name` | G-2, G-4 |
| `newGuest` | none (tablet: fresh profile, new token) | G-3 |
| `createCharacter` | `name`, `parts`, `colors`, `personality?` | C-1, C-3, G-6 |
| `updateCharacter` | `characterId`, `changes` | C-4 |
| `removeCharacter` | `characterId` | C-5 |
| `setActiveCharacter` | `characterId` | A-5, I-7 |
| `setOnStage` | `characterId`, `onStage` | C-7, I-8 |
| `pressAction` | `actionId`, `characterId` | I-2, I-5, Q-* |
| `setSound` | `enabled` | B-3 |
| `ping` | `t` | A-3 |

Take-turns (I-9) is decided in the guest app, which picks the next `characterId` for `setActiveCharacter`. `PROPOSED`

### 3.2 Server to guest

| type | Fields | Serves |
|---|---|---|
| `state` | `profile`, `characters[]`, `activeCharacterId`, `scene`, `focus`, `settings`, `actions[]` (allowed now), `serverTime` | A-3, T-7 |
| `nameResult` | `ok`, `reason?` ("tooLong", "badChars", "blocked") | G-4 |
| `characterResult` | `reqId`, `ok`, `character?`, `reason?` ("limit", "stageFull", "notFound") | C-1 to C-7 |
| `actionStatus` | `characterId`, `state` (ready, waiting, playing, cooldown), `cooldownEndsAt?` (server time), `next` (bool), `position?` | I-3, I-5, I-7, Q-13 |
| `rejected` | `reason` (cooldown, notAllowed, pending, timeout, focus, flood, unknown), `characterId?`, `actionId?` | I-2, I-4, Q-14 |
| `transitionBanner` | `card` (TransitionCard) | T-2 |
| `focus` | `on`, `message?` | T-3, T-5, T-7 |
| `broadcast` | `broadcast` (BroadcastMessage) | B-1 to B-3 |
| `timeout` | `until` (server time), or `until:null` when it ends | Q-12 |
| `pong` | `t`, `serverTime` | A-3 |

### 3.3 Server to display

| type | Fields | Serves |
|---|---|---|
| `sceneState` | `scene` (SceneConfig id and config), `mood`, `focus`, `phase` (card, running) | 5.8, T-3 |
| `characterList` | `characters[]` with `band` and `x,y` if known | C-6, D-2, D-16 |
| `characterChanged` | `op` (added, updated, removed), `character` | C-4 to C-6 |
| `actionPlay` | `actionId`, `actor` (`characterId`, `name` or null if hidden), `intensity`, `source` | I-6, D-7 |
| `queueSnapshot` | `playing?`, `next?`, `waiting[]`, `waitingCount`, `visible` | D-14, Q-13 |
| `transitionCard` | `card`, `hold` (bool) | T-1, T-8 |
| `effects` | `op` (start, stop, clearAll), `effectId`, `durationMs?` | D-4 |
| `nameHidden` | `characterId`, `hidden` | D-7, AD-6 |
| `cue` | `cueId` | T-8, AD-3 |
| `audio` | `volume`, `muted` | AD-8, AU-1 |

### 3.4 Admin to server

| type | Fields | Serves |
|---|---|---|
| `hello` | `role:"admin"` | AD-1 |
| `login` | `passphrase` | AD-1 |
| `switchScene` | `sceneId` | AD-2 |
| `cue` | `cueId` | AD-3, T-8 |
| `setFocus` | `on`, `message?` | T-5, AD-10 |
| `timeoutDevice` | `deviceId`, `seconds` | Q-12, AD-9 |
| `hideName` | `characterId`, `hidden` | AD-6 |
| `removeCharacter` | `characterId` | AD-4 |
| `resetSafe` | none | AD-5, T-6 |
| `broadcast` | `sound?`, `banner?`, `vibrate?`, `target` (tv, phones, both) | B-1, AD-11 |
| `setCooldown` | `ms` | Q-15, AD-7 |
| `setOnStageCap` | `n` | C-7, AD-7 |
| `showQueueDisplay` | `visible` | AD-7 |
| `setVolume` | `volume`, `muted` | AD-8 |

### 3.5 Server to admin

| type | Fields | Serves |
|---|---|---|
| `adminState` | `scene`, `focus`, `settings`, `devices[]` (DeviceInfo), `characters[]`, `cues[]` | AD-2, AD-9 |
| `broadcastResult` | `reached` (device count) | B-1 |
| `loginResult` | `ok` | AD-1 |

### 3.6 Pad service to server

| type | Fields | Serves |
|---|---|---|
| `hello` | `role:"pad"`, `token` | P-1 |
| `padPress` | `pad` (1 to 16), `velocity` (1 to 127) | P-1, P-3, P-4 |

The pad is one guest identity ("Pad") with its own cooldown (P-5). The debug panel and keyboard keys send the same `padPress` (P-6).

### 3.7 All clients: keepalive and reconnect

| Rule | Detail |
|---|---|
| Keepalive | `ping` every 10 s, server replies `pong`. No pong in 25 s: close and reconnect. `PROPOSED` |
| Reconnect | Retry with backoff from 0.5 s up to 5 s. On every (re)connect, send `hello` again. |
| Full state on connect | The server replies with the full current state, so reconnecting is idempotent. A device that reconnects during focus mode gets `focus` at once (T-7). |
| Display when disconnected | After 3 s without the server, show the looping fallback scene and keep reconnecting (R-3). `PROPOSED` |
| Cooldown after refresh | Cooldown state lives on the server and is included in `state`, so a refresh cannot bypass it (acceptance criterion 4). |

## 4. HTTP endpoints

| Method and path | Purpose | Notes |
|---|---|---|
| `GET /` | Redirect to `/guest/` | |
| `GET /guest/`, `/admin/`, `/display/` | Static web apps | Admin page is public but useless without the passphrase. |
| `GET /assets/*` | Icons, parts, scene backgrounds, audio | Files referenced by name from configs (AU-2). |
| `GET /api/health` | `{ ok, version, uptime, connections: {guest, admin, display, pad} }` | Used by the health-check script and the display fallback. |
| `POST /api/admin/login` | Body `{ passphrase }`, returns a short-lived session token | Also required through any tunnel (G-5). `PROPOSED` |
| `GET /api/assets/broadcast` | List of broadcast sound files for phones to preload | B-2. `PROPOSED` |
| PNG download | The guest app renders the character SVG to a canvas and saves a PNG with a transparent background | C-8. `PROPOSED`: client-side; add a server endpoint only if Phase 6 needs one. |

## 5. Data schemas

All ids are strings with a short prefix. Times are milliseconds since the epoch unless noted.

### 5.1 Character (requirements section 7)

```json
{ "id": "c_8f3a", "ownerId": "g_21b7", "name": "Emma",
  "parts": { "ears": "ears_pointy", "bow": "bow_big", "hair": "hair_pigtails",
             "face": "face_dots", "outfit": "outfit_overalls", "accessory": "acc_glasses" },
  "colors": { "skin": "#f6d7b8", "hair": "#5a3a22", "bow": "#e60012", "outfit": "#4a90d9" },
  "options": { "glasses": true, "freckles": false },
  "personality": "bouncy", "onStage": true, "nameHidden": false, "createdAt": 1790000000000 }
```
`options` is `PROPOSED` (attribute options from C-1). Personality is assigned at random at creation (D-5).

### 5.2 Profile and device `PROPOSED`

```json
{ "deviceId": "g_21b7", "token": "<random secret>", "name": "Emma's mom",
  "characterIds": ["c_8f3a", "c_91de"], "activeCharacterId": "c_8f3a",
  "timeoutUntil": null, "createdAt": 1790000000000 }
```
At most 3 characters (C-3). `token` is stored in `data/`, which is gitignored.

### 5.3 ActionDef (registry entry, Q-1)

```json
{ "id": "confetti", "icon": "icons/confetti.svg", "pad": 1, "lane": "effects",
  "durationMs": 3000, "coalesce": true, "groupCooldownMs": 0,
  "sound": "sfx/confetti.mp3", "scenes": ["chilling", "game", "cake", "gifts", "dancing"] }
```

The 16 actions (ids `PROPOSED`, layout from requirements 5.6):

| Pad | Id | Lane | Pad | Id | Lane |
|---|---|---|---|---|---|
| 1 | `confetti` | effects | 9 | `dance` | movement |
| 2 | `hearts` | effects | 10 | `jump` | movement |
| 3 | `fireworks` | effects | 11 | `spin` | movement |
| 4 | `stars` | effects | 12 | `conga` | movement |
| 5 | `cheer` | emotes | 13 | `disco` | mood |
| 6 | `laugh` | emotes | 14 | `rainbow` | mood |
| 7 | `wave` | emotes | 15 | `lightsdown` | mood |
| 8 | `clap` | emotes | 16 | `surprise` | mood |

`surprise` picks a random other action. Mood actions carry a group-wide cooldown (Q-11).

### 5.4 ActionEvent (requirements section 7)

```json
{ "type": "action", "actionId": "confetti", "guestId": "g_21b7",
  "characterId": "c_8f3a", "source": "phone", "intensity": 2, "ts": 1790000000000 }
```
`source`: `phone`, `pad`, `admin`, `script`. Intensity 1 to 3 (P-4). Admin and script events bypass the queue (Q-8).

### 5.5 QueueEntry `PROPOSED`

```json
{ "entryId": "q_77", "characterId": "c_8f3a", "deviceId": "g_21b7", "actionId": "confetti",
  "source": "phone", "intensity": 2, "pressedAt": 1790000000000,
  "expiresAt": 1790000006000, "locked": false }
```

### 5.6 SceneConfig `PROPOSED`

```json
{ "id": "cake", "name": "Cake time", "background": "scenes/cake_bg.svg",
  "props": [ { "id": "cake_table", "x": 0.5, "y": 0.72, "offers": ["gather", "admire"], "capacity": 16 } ],
  "music": { "file": "music/cake.mp3", "volume": 0.3 },
  "behaviorWeights": { "wander": 0.1, "gather": 0.8, "dance": 0.0 },
  "interaction": "locked", "tvMood": "calm",
  "transitionCard": { "id": "card_cake", "title": "Cake time!", "icon": "icons/cake.svg",
                      "sound": "sfx/card.mp3", "mode": "auto", "durationMs": 4000 },
  "allowedActions": [],
  "cues": [ { "id": "gather", "at": "start", "do": "gatherAtProp", "prop": "cake_table" },
            { "id": "candles", "afterMs": 3000, "do": "lightCandles" },
            { "id": "sing", "afterCue": "candles", "do": "holdCard", "card": "card_sing" },
            { "id": "blowout", "trigger": "admin", "do": ["candlesOut", "effect:fireworks", "allCheer"] } ] }
```
`interaction`: `open`, `limited`, `locked` (T-4). `allowedActions`: list of action ids; `"all"` for open scenes. Scene ids: `chilling`, `game`, `cake`, `gifts`, `dancing`. The Game time config also names the chosen game (musical chairs, pin the tail, pinata).

### 5.7 TransitionCard `PROPOSED`

```json
{ "id": "card_sing", "title": "Time to sing Happy Birthday!", "icon": "icons/cake.svg",
  "sound": "sfx/card.mp3", "mode": "hold", "durationMs": null }
```
`mode`: `auto` (dismisses after `durationMs`) or `hold` (until an admin cue or release) (T-1, T-8).

### 5.8 FocusState `PROPOSED`

```json
{ "on": true, "message": "Listen up!", "reason": "scene", "since": 1790000000000,
  "failsafeAt": 1790001800000 }
```
`reason`: `scene` or `admin`.

### 5.9 BroadcastMessage `PROPOSED`

```json
{ "id": "b_12", "sound": "broadcast/cheer.mp3", "banner": { "title": "Cake soon!", "icon": "icons/cake.svg" },
  "vibrate": true, "target": "both" }
```

### 5.10 DeviceInfo (admin list, AD-9) `PROPOSED`

```json
{ "deviceId": "g_21b7", "characterNames": ["Emma", "Noah"], "connected": true,
  "pressesLastMinute": 4, "timeoutUntil": null }
```

### 5.11 Settings and config `PROPOSED`

```json
{ "cooldownMs": 3000, "expiryMs": 6000, "moodGroupCooldownMs": 15000, "onStageCap": 30,
  "maxCharactersPerDevice": 3, "focusFailsafeMin": 30, "floodGuardPerSec": 1,
  "padCooldownMs": 3000, "queueDisplay": true, "volume": 0.8, "muted": false }
```
Stored in `config/` as defaults; live changes from the admin panel are saved to `data/settings.json`. The starting `onStageCap` is set from the Phase 0 spike.

## 6. State machines

### 6.1 Character action state (per character; Q-3, Q-5, Q-7)

| From | Event | To | Notes |
|---|---|---|---|
| Ready | `pressAction` accepted, nothing playing | Playing | Cooldown timer starts now. |
| Ready | `pressAction` accepted, something playing | Waiting | One pending entry per character. |
| Waiting | selected by the queue | Playing | Cooldown timer starts now. |
| Waiting | 6 s expiry, scene change, focus on, or timeout | Ready | Phone says the action expired. |
| Playing | action duration ends | Cooldown | If the cooldown already passed, go to Ready. |
| Cooldown | cooldown ends | Ready | Timestamp comes from the server. |
| any | `pressAction` while not Ready | same | Reply `rejected` (cooldown or pending). No penalty. |

### 6.2 Focus mode lifecycle (T-3 to T-7)

| State | Trigger | Result |
|---|---|---|
| Off | Scene with `interaction:"locked"` starts, or admin `setFocus on` | On. Pending actions cleared. Phones show the calm screen. TV goes calm. Pad ignored. |
| On | Admin `setFocus off` or release | Off. |
| On | Scene changes to one that is not locked | Off. |
| On | Failsafe timer (default 30 min) | Off. |
| On | `resetSafe` | Off, and scene becomes Chilling. |
| On | A device connects or reconnects | That device gets `focus` immediately (T-7). |

### 6.3 Scene lifecycle (T-1, T-4, T-8, Q-8)

| Step | What happens |
|---|---|
| 1 | Admin `switchScene`. Pending guest actions are cleared and running effects stop. |
| 2 | If the new scene is `locked`, focus turns on; otherwise it turns off. |
| 3 | Display shows the transition card; phones get `transitionBanner`. Card either dismisses itself (`auto`) or holds (`hold`). |
| 4 | Scene runs: music starts, autonomy runs, cues play. Cues marked `trigger:"admin"` wait for an admin `cue`. |
| 5 | Held cards (for example "Time to sing Happy Birthday!") release on the admin `cue`, then the celebration plays. |

### 6.4 Queue selection (Q-2, Q-4 to Q-6, Q-8, Q-13, Q-14)

| Rule | Detail |
|---|---|
| Intake | `pressAction` is checked in order: device timeout, focus, flood guard (about 1 accepted press per second per device), scene allows the action, character is Ready. Then it becomes a QueueEntry. |
| One pending per character | A second press from the same character is rejected (`pending`). |
| Pick order | Never-played characters first; then the character whose last played action is oldest; ties go to the earliest press. Fairness is per character, not per device. |
| Locked next | When the queue can run something, the picked entry is locked as `next` and cannot be bumped by later arrivals. |
| Expiry | Entries older than 6 s are dropped and the phone is told. |
| Bypass | Admin and script events skip the queue (Q-8). |
| Pad | The pad is one identity with its own cooldown, and enters the same queue. |
| Lanes (optional, Q-9) | Each lane runs one action at a time; different lanes run together. Without lanes, one action plays at a time. |
| Coalescing (optional, Q-10) | Same action from several guests inside a short window merges into one play and credits all names. |
| Group cooldown (Q-11) | Mood actions share a 15-20 s cooldown across all guests. |

## 7. Assets and storage conventions

```
assets/
  audio/music/<sceneId>.mp3        scene music
  audio/sfx/<actionId>.mp3         action sounds (also card and effect sounds)
  audio/broadcast/<name>.mp3       broadcast sounds, preloaded on phones
  icons/<name>.svg                 action and card icons
  parts/<slot>_<name>.svg          character parts (ears_, bow_, hair_, face_, outfit_, acc_)
  scenes/<sceneId>_bg.svg          scene backgrounds
config/                            defaults (settings, scene configs, action registry)
data/                              runtime data, gitignored
  characters/<id>.json
  profiles/<deviceId>.json
  settings.json
```

| Convention | Detail |
|---|---|
| Swap audio | Replace the file with the same name. Configs reference files by name, so no code changes (AU-2, acceptance criterion 7). |
| Placeholders | Short royalty-free or generated placeholders until Justin supplies files. |
| Data on disk | JSON files, written atomically (write a temp file, then rename). Survives restarts (C-10, R-4). |
| Backup | A script copies `data/` to a timestamped folder outside the repo. Run before the party and before any risky change. |
| Cleanup | Deleting guest and character data after the party is open item O-3. Never delete `data/` without asking Justin. |
| Art | Original and Kitty-inspired only. No official assets. |

## 8. Change protocol

Any change to a message or schema updates this file in the same commit and adds a line to `decisions.md`. Remove the `PROPOSED` tag from a detail once a phase has built it and checked it against the requirement.
