# Decision log

Why things are the way they are. Decision IDs use two digits (`D-01`). Requirement IDs (for example `D-1`, `Q-4`) live in `requirements.md` and are never zero-padded. See consolidation note CN-6.

**How to add one:** append a row to the log with the next ID, today's date, the decision, the why, what was rejected, and the requirement IDs affected. A change to a requirement also needs Justin's approval and a note in `../PROGRESS.md`.

## Log

| ID | Date | Decision | Why | Rejected alternatives | Requirements affected |
|---|---|---|---|---|---|
| D-01 | 2026-09-18 | Everything runs locally on the Pi over the home Wi-Fi. No internet needed at party time. | Reliability and low latency; nothing to break mid-party. | Vercel or other hosting (serverless is poor at WebSockets and adds internet dependence). | R-1, G-1 |
| D-02 | 2026-09-18 | Cloudflare Tunnel is optional, as a second way in. | Fallback if the guest Wi-Fi network isolates clients. Admin routes must stay protected. | Making it the main path. | G-5 |
| D-03 | 2026-09-18 | Camera games and pose tracking are dropped. | The AI HAT+ is too expensive or arrives too late; multi-person pose on the Pi CPU is risky; identity tracking with 16 kids is hard. | Rejected: single-player pose mirror, red light/green light, marker wand. | none (scope dropped) |
| D-04 | 2026-09-18 | The microphone and voice/noise reactions are dropped. | Unreliable in a room of 16 kids; the soundbar under the TV causes feedback; a pad is deterministic. | Rejected: loudness, laughter classification, word spotting, a wireless lavalier mic. | none (scope dropped) |
| D-05 | 2026-09-18 | A wired USB MIDI pad provides 16 special actions. It is read server-side. | Kids like real buttons; avoids browser MIDI permission prompts; wired is more reliable than Bluetooth. | Bluetooth MIDI, browser Web MIDI. | P-1 to P-6, I-1 |
| D-06 | 2026-09-18 | Keyboard keys stand in for the pad during development. A cheap USB keypad is the backup, ordered only if the pad fails the Pi test on 9/20. | Nothing waits on hardware; 6 days of buffer. | Buying a backup up front. | P-6 |
| D-07 | 2026-09-18 | No selfie face cutouts and no photo processing. | Privacy of other people's kids. Characters are simple layered SVGs with attribute options instead. | Rejected: photo cutouts, cloud image generation. | C-1, D-2 |
| D-08 | 2026-09-18 | Characters are data (JSON) on one shared rig; animation clips are written once. | Art volume is the main risk, and any parts combination must work with any clip. | Per-character animation, bitmap sprites. | D-2, D-3, C-10 |
| D-09 | 2026-09-18 | Original Kitty-inspired art only, for private party use. | Sanrio owns the characters. | Tracing or using official art. | Rights (section 6) |
| D-10 | 2026-09-18 | Guest app has two modes (Character, Interact) plus a character strip of up to 3 characters per device. | Lets a parent's phone hold several children's characters. | One character per device. | A-1, A-5, G-6, C-3 |
| D-11 | 2026-09-18 | Fairness, cooldown, and the pending slot are per character, not per device. | Kids without phones must not wait longer than kids with phones. | Per-device seats (unfair to siblings and to tablet users). | Q-3, Q-4, Q-5, I-3, I-7 |
| D-12 | 2026-09-18 | Device timeout by an admin is the main anti-spam enforcement, with a device flood guard of about 1 press per second as a safety net. | Simple, humane, and visible in the admin device list. | Automatic penalties for pressing during cooldown. | Q-12, Q-14, AD-9 |
| D-13 | 2026-09-18 | Queue rules: one pending action per character; expiry about 6 s; cooldown starts when the action plays; least-recently-played character first; the next action is locked. | Bounds the queue, avoids stale actions, keeps the TV queue display stable. | A plain FIFO queue. | Q-4, Q-5, Q-6, Q-7, Q-13 |
| D-14 | 2026-09-18 | Name filter with one-tap hide, not an approval queue. | Approving 16+ names during the party is a chore. | Full approval queue. | G-4, AD-6 |
| D-15 | 2026-09-18 | Focus mode (locked scenes: Cake time and Gift time) with transition cards. Phones show a dark calm screen; the TV goes calm; failsafe auto-release after 30 minutes. | Keep attention on the birthday girl. | Leaving phones interactive during those moments. | T-1 to T-8, AD-10 |
| D-16 | 2026-09-18 | Game time is open (all 16 actions). | Justin: it would not distract from the games. | Limited or locked. | Scenes (section 5.8) |
| D-17 | 2026-09-18 | Shared admin passphrase, no accounts. | Simplicity; two admins. | Separate logins. | AD-1 |
| D-18 | 2026-09-18 | Develop natively on the Mac, deploy to the Pi at least daily, no Docker. | Docker on macOS cannot pass USB through; the real risk is Pi performance, not logic. | Docker-based development. | Development (section 6) |
| D-19 | 2026-09-18 | Depth bands (front, middle, back by recency of acting) start as characters-only. Layered background art is a stretch. | Adds clarity and room for more characters without a large art cost. | Layered art for every scene. | D-16 |
| D-20 | 2026-09-18 | PNG download is the v1 download. Animated GIF is a stretch. | GIF is its own small project. | GIF first. | C-8, C-9 |
| D-21 | 2026-09-18 | Music and sound effects are supplied by Justin. Placeholders until then, swapped by filename. | Keeps code independent of the final audio. | Bundling final audio. | AU-1, AU-2, B-2 |
| D-22 | 2026-09-18 | Parked for after this party: ESP32 devices, AI voice and "Ask Kitty", GPIO arcade buttons and floor pads. | Not enough time. | Parked, not rejected. Details are in `archive/notes-2026-09-18.md`. | none |
| D-23 | 2026-09-18 | Data is deleted after the party (proposed, open). | Privacy. | Keeping it. | Privacy (section 6) |

## Consolidation notes

Changes and resolutions made while building the hand-off pack on 2026-09-18.

| # | Note |
|---|---|
| CN-1 | The old Day 5 gate said cake time runs "from the admin cue," but the admin panel is built on Day 6. Resolution: in Phase 4 the cake script is triggered from the debug panel. Phase 5 rewires it to the admin panel and adds the transition card and focus mode. |
| CN-2 | Several requirement IDs were never scheduled in the old timeline: D-10, D-11, D-12, Q-9, Q-10, Q-11, Q-13, G-5. They are now assigned (see `phases/README.md`). Unlisted IDs were assigned by judgment: D-8 to Phase 1 (art style), D-12 to Phase 6, D-4 to Phase 4, D-1 to Phase 0, C-2 to Phase 2. |
| CN-3 | Bot mode appeared on Day 4 (gate) and Day 6 (demo). Resolution: Phase 3 builds a minimal spawner used by tests and gates; Phase 5 builds the demo mode. |
| CN-4 | Phase 0 sets up initial systemd and kiosk services; Phase 6 hardens them (R-2, R-3). |
| CN-5 | The old Day 4 clip list omitted "clap," but D-3 lists it. Added "clap" to Phase 3. |
| CN-6 | Decision IDs (`D-01` to `D-23`) share a letter with requirement IDs (`D-1` to `D-16`). Kept as specified; decisions are always two-digit. Decision D-15 (focus mode) is not requirement D-15 (raised hands), and decision D-16 (Game time open) is not requirement D-16 (depth bands). |
| CN-7 | Requirement IDs that span phases have one owning phase in the coverage table (the phase that completes them). Partial work is listed in each phase doc under "Requirements covered". |
| CN-8 | The old "Order today" checkboxes moved into Phase 0, except the conditional USB keypad order, which moved to Phase 2 where the pad test happens. |
| CN-9 | The two Day 9 checkboxes (morning setup, reset to starting scene) have no phase, because Day 9 is the party. They live in `runbooks/party-day.md`. The "every checkbox in exactly one phase doc" check counts 60 of 62 old checkboxes in phase docs; the other 2 are in that runbook. |
| CN-10 | The old timeline's "Dropped:" line and scope tiers were removed from `timeline.md`. Dropped scope lives in decisions D-03, D-04, D-07; priorities live in `requirements.md`. |
| CN-11 | `requirements.md` was moved unchanged plus a header. Its "Companion docs" line still names `notes.md` and `timeline.md` at the old root paths. Left as is because the file is frozen. |
| CN-12 | Task lists in phase docs include a few tasks not in the old timeline, marked "(from requirements)", so that every requirement assigned to a phase has a task. |
| CN-13 | The agent that built this pack had file access but no shell, so it could not run git or script-based checks. Git history was left for Justin to create from a short command list (see `../PROGRESS.md`). The old root `timeline.md` stays until that step removes it. |

## Open

Items from `requirements.md` section 9, plus two added by the pack.

| # | Open item | Decide by | Requirement IDs |
|---|---|---|---|
| O-1 | On-stage cap value: set after the Phase 0 performance spike. | Phase 0 | C-7 |
| O-2 | Default cooldown (3 s), expiry (6 s), and mood group cooldown (15-20 s): tune at the rehearsal. | Fri 9/25 | I-3, Q-6, Q-11 |
| O-3 | Delete all guest and character data after the party? (Decision D-23 proposes yes.) | Before 9/26 | Privacy |
| O-4 | Queue display style: list only, or also the raised hands? | Phase 5 | D-14, D-15 |
| O-5 | Depth bands: how many characters per band, and whether backgrounds get layered art or just a floor for the bands. | Phase 3 | D-16 |
| O-6 | Review every design detail marked `PROPOSED` in `contracts.md`. | Phase 0 | all |
| O-7 | Confirm the recommended stack in `../AGENTS.md` and record it as a new decision. | Phase 0 | R-1, D-1, D-9 |
