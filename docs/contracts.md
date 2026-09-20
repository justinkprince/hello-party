# Contracts: how the pieces talk

The interfaces between the server, the TV display, the guest app, the admin panel, and the pad service. Derived from `requirements.md` (IDs cited in brackets). Anything not stated in the requirements is marked `PROPOSED`, and Phase 0 reviews all of them (open item O-6 in `decisions.md`). `APPROVED` means Justin approved the detail during the Phase 0 review; it still needs to be built and checked by a later phase before the tag is removed (section 8).

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
| `admin` | admin panel | Shared passphrase from `.env` (AD-1). The passphrase is sent only to `POST /api/admin/login`, which returns a signed session token. The WebSocket `login` message carries that token, and the server then marks the connection as admin. |
| `display` | Chromium kiosk | Local-only token: accepted only from the Pi itself, token from `.env`. `APPROVED` |
| `pad` | pad service | Same local-only token as the display. `APPROVED` The debug panel and keyboard keys also connect with the `pad` role (a second connection using the same token), so `display` stays receive-only. |

Rules:
- Messages are JSON objects with a `type` string. Requests may carry a `reqId` that the reply echoes. `APPROVED`
- Unknown `type`: ignore and log. Bad fields: reply `rejected` with a reason (guest) or ignore (display, pad).
- Secrets (passphrase, tokens, Wi-Fi password) live only in `.env`, never in git or in messages to guests.

## 3. Message catalog

### 3.1 Guest to server

| type | Fields | Serves |
|---|---|---|
| `hello` | `role:"guest"`, `deviceToken?`, `sharedKey?` (only the shared tablet sends it) | G-2, A-3 |
| `setName` | `name` | G-2, G-4 |
| `createCharacter` | `name`, `parts`, `colors`, `personality?` | C-1, C-3, G-6 |
| `updateCharacter` | `characterId`, `changes` | C-4 |
| `removeCharacter` | `characterId` | C-5 |
| `setActiveCharacter` | `characterId` | A-5, I-7 |
| `setOnStage` | `characterId`, `onStage` | C-7, I-8 |
| `pressAction` | `actionId`, `characterId` | I-2, I-5, Q-* |
| `setSound` | `enabled` | B-3 |
| `ping` | `t` | A-3 |

Take-turns (I-9) is decided in the guest app, which picks the next `characterId` for `setActiveCharacter`. `APPROVED` The toggle itself is kept in the phone's browser storage, not on the server.

### 3.2 Server to guest

| type | Fields | Serves |
|---|---|---|
| `state` | `profile`, `characters[]`, `activeCharacterId`, `scene`, `focus`, `settings`, `actions[]` (allowed now), `serverTime` | A-3, T-7 |
| `nameResult` | `reqId?`, `ok`, `reason?` ("tooLong", "badChars", "blocked") | G-4 |
| `characterResult` | `reqId`, `ok`, `character?`, `reason?` ("limit", "stageFull", "notFound", "badName"), `nameReason?` ("tooLong", "badChars", "blocked", set with `badName`) | C-1 to C-7, G-4 |
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
| `broadcast` | `broadcast` (BroadcastMessage) | B-1, B-2 |

### 3.4 Admin to server

| type | Fields | Serves |
|---|---|---|
| `hello` | `role:"admin"` | AD-1 |
| `login` | `token` (session token from `POST /api/admin/login`) | AD-1 |
| `switchScene` | `sceneId` | AD-2 |
| `cue` | `cueId` | AD-3, T-8 |
| `setFocus` | `on`, `message?` | T-5, AD-10 |
| `timeoutDevice` | `deviceId`, `seconds` (0 cancels a timeout) | Q-12, AD-9 |
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
| `broadcastResult` | `reached` (number of phones the message was sent to), `tv` (bool: sent to the TV) | B-1 |
| `loginResult` | `ok` | AD-1 |

### 3.6 Pad service to server

| type | Fields | Serves |
|---|---|---|
| `hello` | `role:"pad"`, `token` | P-1 |
| `padPress` | `pad` (1 to 16), `velocity` (1 to 127) | P-1, P-3, P-4 |

The pad is one guest identity ("Pad") with its own cooldown (P-5). The debug panel and keyboard keys send the same `padPress` (P-6) over their own `pad`-role connection, not over the display's connection.

### 3.7 All clients: keepalive and reconnect

| Rule | Detail |
|---|---|
| Keepalive | `ping` every 10 s, server replies `pong`. No pong in 25 s: close and reconnect. The server also closes any connection that has sent nothing for about 30 s. `APPROVED` |
| Reconnect | Retry with backoff from 0.5 s up to 5 s. On every (re)connect, send `hello` again. |
| Full state on connect | The server replies with the full current state, so reconnecting is idempotent. A device that reconnects during focus mode gets `focus` at once (T-7). |
| Display when disconnected | After 3 s without the server (timer starts when the socket closes), show the looping fallback scene and keep reconnecting (R-3). The fallback scene is bundled or preloaded with the display page, never fetched on demand. The display uses a 10 s pong timeout instead of 25 s, since it is on localhost. `APPROVED` |
| Cooldown after refresh | Cooldown state lives on the server and is included in `state`, so a refresh cannot bypass it (acceptance criterion 4). |

## 4. HTTP endpoints

| Method and path | Purpose | Notes |
|---|---|---|
| `GET /` | Redirect to `/guest/` | |
| `GET /guest/`, `/admin/`, `/display/` | Static web apps | Admin page is public but useless without the passphrase. |
| `GET /assets/*` | Icons, parts, scene backgrounds, audio | Files referenced by name from configs (AU-2). |
| `GET /api/health` | `{ ok, version, uptime, connections: {guest, admin, display, pad} }` | Used by the health-check script and the display fallback. |
| `POST /api/admin/login` | Body `{ passphrase }`, returns a session token | The only place the passphrase is sent. Token is signed with a secret from `.env` (so it survives a server restart) and lasts 12 h. Failed attempts are throttled globally (about 5 wrong tries, then a 30 s lockout). Also required through any tunnel (G-5). `APPROVED` |
| `GET /api/assets/broadcast` | List of broadcast sound files for phones and the admin panel to use | B-2, AD-11. Returns `{ sounds: [{ file, v }] }`, where `v` is the file's modified time. Clients request `file?v=<v>` so a swapped file is refetched. Keep the set small (about 8 files, each under about 100 KB). `APPROVED` |
| PNG download | The guest app renders the character SVG to a canvas and saves a PNG with a transparent background | C-8. `APPROVED`: client-side, rendered at about 1024 px on the long side, without the name label unless Justin asks for it. Where the browser supports sharing files, use the share sheet; otherwise show the PNG in an overlay with "press and hold to save" (iOS Safari may open a download in a new tab). Add a server endpoint only if the real-phone test or Phase 6 needs one. |

## 5. Data schemas

All ids are strings with a short prefix. Times are milliseconds since the epoch unless noted.

### 5.1 Character (requirements section 7)

```json
{ "id": "c_8f3a", "ownerId": "g_21b7", "name": "Emma",
  "parts": { "bow": "bow_big", "hair": "hair_pigtails", "face": "face_smile",
             "outfit": "outfit_overalls", "accessory": "acc_scarf" },
  "colors": { "skin": "#f6d7b8", "hair": "#5a3a22", "bow": "#e60012", "outfit": "#4a90d9" },
  "options": { "glasses": true, "freckles": false },
  "personality": "bouncy", "onStage": true, "nameHidden": false, "createdAt": 1790000000000 }
```
`parts` has exactly five keys: `bow`, `hair`, `face`, `outfit`, `accessory`. There is no ears slot (D-47). Each value is a part id from D-44 (`<slot>_<name>`, the file name in `assets/parts/` without `.svg`). `bow_none` and `acc_none` mean nothing is worn; hair, face, and outfit have no none. The server rejects other keys and unknown ids.

`options` is `APPROVED` (attribute options from C-1): independent on/off toggles for overlay layers that fit every face part. The known keys are `glasses` and `freckles`, and the server rejects any other key. Glasses are not an accessory part, so a character can wear glasses and an accessory together. Personality is assigned at random at creation (D-5).

### 5.2 Profile and device `APPROVED`

```json
{ "deviceId": "g_21b7", "kind": "personal", "token": "<random secret>", "name": "Emma's mom",
  "characterIds": ["c_8f3a", "c_91de"], "activeCharacterId": "c_8f3a",
  "timeoutUntil": null, "createdAt": 1790000000000 }
```
`kind` is `personal` (a phone: at most 3 characters, C-3, for the children of one family) or `shared` (the communal tablet: one profile holding every kid's character, one character per kid by convention, capped by `maxCharactersShared`, default 20). The tablet gets `shared` only if its `hello` carries `sharedKey` matching the key in `.env`; the tablet opens a private URL that includes it. The tablet has no "New guest" flow: a kid taps "Add my character". On a shared device in Interact mode, characters that are waiting, playing, or cooling down are dimmed and cannot be selected; in Character mode every character stays selectable. A device timeout applies to the whole device.

One id, three names: `deviceId` here, `ownerId` on a Character, and `guestId` in an ActionEvent are the same `g_...` id. The profile `name` is the guest's own name; it is stored and never shown on the TV. Character names go through the same name filter as G-4 (see `characterResult`).

`token` is stored in `data/`, which is gitignored.

### 5.3 ActionDef (registry entry, Q-1)

```json
{ "id": "confetti", "icon": "icons/confetti.svg", "pad": 1, "lane": "effects",
  "durationMs": 3000, "coalesce": true, "groupCooldownMs": 0,
  "sound": "sfx/confetti.mp3", "scenes": ["chilling", "game", "cake", "gifts", "dancing"] }
```

The 16 actions (ids `APPROVED`, layout from requirements 5.6):

| Pad | Id | Lane | Pad | Id | Lane |
|---|---|---|---|---|---|
| 1 | `confetti` | effects | 9 | `dance` | movement |
| 2 | `hearts` | effects | 10 | `jump` | movement |
| 3 | `fireworks` | effects | 11 | `spin` | movement |
| 4 | `stars` | effects | 12 | `conga` | movement |
| 5 | `cheer` | emotes | 13 | `disco` | mood |
| 6 | `laugh` | emotes | 14 | `rainbow` | mood |
| 7 | `wave` | emotes | 15 | `lights_down` | mood |
| 8 | `clap` | emotes | 16 | `surprise` | mood |

`surprise` has no group cooldown of its own. It picks at random from the other 15 actions that are allowed in the current scene, skipping any mood action that is on its group cooldown. The picked action then behaves normally (its own lane, duration, sound, and, for a mood action, its group cooldown), and the presser's character is still credited. Mood actions otherwise carry a group-wide cooldown (Q-11).

### 5.4 ActionEvent (requirements section 7)

```json
{ "type": "action", "actionId": "confetti", "guestId": "g_21b7",
  "characterId": "c_8f3a", "source": "phone", "intensity": 2, "ts": 1790000000000 }
```
`source`: `phone`, `pad`, `admin`, `script`. Intensity 1 to 3 (P-4). Admin and script events bypass the queue (Q-8).

### 5.5 QueueEntry `APPROVED`

```json
{ "entryId": "q_77", "characterId": "c_8f3a", "deviceId": "g_21b7", "actionId": "confetti",
  "source": "phone", "intensity": 2, "pressedAt": 1790000000000,
  "expiresAt": 1790000006000, "locked": false }
```
`entryId` is a counter that only increases; it is the final tie-break after `pressedAt`. Pad presses use the reserved value `pad` for both `characterId` and `deviceId`; the pad is treated like any character for fairness, and the TV labels it "Pad". The queue is held in memory only and is not saved to disk (entries expire in about 6 s). Coalescing (Q-10) would add a list of extra credited characters, only if it is built.

### 5.6 SceneConfig `APPROVED`

```json
{ "id": "cake", "name": "Cake time", "background": "scenes/cake_bg.svg",
  "props": [ { "id": "cake_table", "x": 0.5, "y": 0.72, "offers": ["gather", "admire"], "capacity": 16 } ],
  "music": { "file": "music/cake.mp3", "volume": 0.3 },
  "behaviorWeights": { "wander": 0.1, "gather": 0.8, "dance": 0.0 },
  "interaction": "locked", "tvMood": "calm",
  "transitionCard": "card_cake",
  "allowedActions": [],
  "cues": [ { "id": "gather", "at": "start", "do": "gatherAtProp", "prop": "cake_table" },
            { "id": "candles", "afterMs": 3000, "do": "lightCandles" },
            { "id": "sing", "afterCue": "candles", "do": "holdCard", "card": "card_sing" },
            { "id": "blowout", "trigger": "admin", "do": ["candlesOut", "effect:fireworks", "allCheer"] } ] }
```
`interaction`: `open`, `limited`, `locked` (T-4). `allowedActions`: list of action ids; `"all"` for open scenes. Scene ids: `chilling`, `game`, `cake`, `gifts`, `dancing`.

Approved details:
- **Cards by id.** Every transition card lives in `config/cards.json` (schema in 5.7). A scene's `transitionCard` and a cue's `card` are card ids, never inline objects.
- **Closed cue vocabulary, checked at startup.** The cue verbs (`do` values) are a fixed list, defined when the scene director is built (Phases 3 to 5). At startup the server validates every scene, cue, prop, card, action, and file reference and fails loudly on anything unknown, so a typo is caught before the party.
- **Silent scenes.** `music` may be `null`.
- **Depth bands.** Phase 3 (open items O-5 and D-16) may add band and floor fields to the scene config without another review.
- **Game time is one ordinary scene** (`game`) with no game logic and no game choice. Its background may show a pinata and a pin-the-tail game for show. Characters interact with the scene and each other and react to events like in any other scene.

### 5.7 TransitionCard `APPROVED`

```json
{ "id": "card_sing", "title": "Time to sing Happy Birthday!", "icon": "icons/cake.svg",
  "sound": "sfx/card.mp3", "mode": "hold", "durationMs": null }
```
`mode`: `auto` (dismisses after `durationMs`) or `hold` (until released) (T-1, T-8).

Approved details:
- **Where cards live.** All cards are in `config/cards.json`; scenes and cues refer to them by id (see 5.6).
- **Phones.** Phones get the title and icon as a banner (`transitionBanner`). The `sound` plays on the TV only, because phone sound is unreliable (B-3).
- **Ending a `hold` card.** A held card ends on the scene's next admin cue, on a scene change, on Reset to safe scene, or when the focus failsafe fires. It needs no separate release message.

### 5.8 FocusState `APPROVED`

```json
{ "on": true, "message": "Listen up!", "reason": "scene", "since": 1790000000000,
  "failsafeAt": 1790001800000 }
```
`reason`: `scene` or `admin`.

Approved details:
- **`reason`** is for display and the admin panel only. It does not change behavior: moving to a scene that is not locked ends focus either way (6.2).
- **Failsafe.** `failsafeAt` is set when focus turns on (from `focusFailsafeMin`). Sending `setFocus on` while focus is already on updates the message and restarts the timer. The failsafe also dismisses any held transition card.
- **Message length.** The message is capped at about 60 characters.
- **Restarts.** Focus state and the current scene are held in memory, not saved to disk. After a server restart the scene is Chilling with focus off, and phones reconnect and unlock. Characters, profiles, and settings still survive a restart.

### 5.9 BroadcastMessage `APPROVED`

```json
{ "id": "b_12", "sound": "broadcast/cheer.mp3", "banner": { "title": "Cake soon!", "icon": "icons/cake.svg" },
  "vibrate": true, "target": "both" }
```
Approved details:
- **TV delivery.** The display gets `broadcast` (3.3) with the same record. It plays the sound and shows the banner.
- **Optional parts.** `sound`, `banner`, and `vibrate` are each optional, but at least one must be present. The server checks `sound` against the list from `GET /api/assets/broadcast`.
- **During focus.** Broadcasts are still delivered while focus is on. The banner shows over the calm screen.
- **Reach.** `reached` counts phones the message was sent to, not who heard it. `tv` says whether it went to the TV.
- **Duplicates and late joiners.** The `id` lets phones ignore a duplicate. A device that connects later does not get earlier broadcasts.

### 5.10 DeviceInfo (admin list, AD-9) `APPROVED`

```json
{ "deviceId": "g_21b7", "kind": "personal", "name": "Emma's mom", "characterNames": ["Emma", "Noah"],
  "connected": true, "pressesLastMinute": 4, "timeoutUntil": null }
```
Approved details:
- **`name` and `kind`.** `name` is the profile name (admin only, never on the TV), so a phone with no characters yet is still identifiable. `kind` (`personal` or `shared`) shows which row is the shared tablet, since a timeout pauses everyone on it.
- **`pressesLastMinute`** counts every `pressAction` the device sent in the last 60 s, including rejected ones.
- **Delivery.** `devices[]` is sent at most about once a second while an admin is connected, sorted by `pressesLastMinute`, highest first.
- **Ending a timeout.** `timeoutDevice` with `seconds: 0` cancels it.

### 5.11 Settings and config `APPROVED`

```json
{ "cooldownMs": 3000, "expiryMs": 6000, "moodGroupCooldownMs": 15000, "onStageCap": 30, "onStageCapMax": 30,
  "maxCharactersPerDevice": 3, "maxCharactersShared": 20, "focusFailsafeMin": 30, "floodGuardPerSec": 1,
  "padCooldownMs": 3000, "queueDisplay": true, "volume": 0.8, "muted": false }
```
Stored in `config/` as defaults; live changes from the admin panel are saved to `data/settings.json`. The starting `onStageCap` and the ceiling `onStageCapMax` are set from the Phase 0 spike.

Approved details:
- **Live vs file-only.** The admin panel changes only the cooldown, the on-stage cap, the queue display, and volume/mute (AD-7, AD-8). Everything else (expiry, mood cooldown, pad cooldown, limits, failsafe, flood guard) is edited in `config/` and applies after a server restart. `setCooldown` changes the guest cooldown only; `padCooldownMs` stays in the file.
- **Precedence.** Values in `data/settings.json` override the `config/` defaults. At startup the server logs every key that is overridden this way. Final tuned values are also recorded in `decisions.md`.
- **Limits.** The server rejects or clamps out-of-range live changes: cooldown about 500 to 30000 ms, volume 0 to 1, and an on-stage cap between 1 and `onStageCapMax`.
- **What phones receive.** The `settings` sent to guests holds only what phones need (character limits and the sound setting). The admin gets the full record in `adminState`.

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
  parts/<slot>_<name>.svg          character parts (bow_, hair_, face_, outfit_, acc_; base.svg is the body)
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
| Cleanup | Guest and character data is deleted after the party (decision D-23), after an optional keepsake copy. Never delete `data/` without asking Justin on the day. |
| Art | Original and Kitty-inspired only. No official assets. |

## 8. Change protocol

Any change to a message or schema updates this file in the same commit and adds a line to `decisions.md`. Remove the `APPROVED` tag from a detail once a phase has built it and checked it against the requirement. (Details marked `APPROVED` were reviewed and approved by Justin in Phase 0; see decision D-26.)
