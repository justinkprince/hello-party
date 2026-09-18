# Prompt: build the hand-off pack for the Hello Kitty Party Display

These are instructions for an AI agent. Working directory: `/Users/jprince/code/projects/hello-party`.
Today is Fri Sep 18, 2026. The party is Sat Sep 26, 2026.

## 1. Your job

You are a documentation and project-setup agent. Build a **hand-off pack** so that a series of coding agents can build this project phase by phase, with no context except the files in this repo. Coding agents run **one at a time, in order. Never in parallel.** State this in `AGENTS.md` and `README.md`.

You write documentation, a `.gitignore`, and git history. You do **not** write application code, install dependencies, or touch the Pi.

Success means a brand-new agent can read three short files (`AGENTS.md`, `PROGRESS.md`, one phase doc), do exactly one phase, and leave the repo ready for the next agent. It also means Justin (the owner) can read `README.md` weeks later and remember how everything fits together.

## 2. The project in brief

- **What:** A Hello Kitty themed "party on the TV" for a 9-year-old's birthday, at home. About 16 kids plus parents. Guests create simple layered SVG characters on their phones or one shared tablet. The characters live in scenes on the living-room TV and have some autonomy. Guests trigger effects and reactions from a 16-button "Interact" grid that mirrors a physical MIDI pad. Two admins (Justin and his wife) run scenes and moderation, and use "focus mode" so attention stays on the birthday girl during cake and gifts.
- **Hardware:** Raspberry Pi 5 (HDMI to a smart TV, audio through the TV to a soundbar), a wired USB MIDI pad controller (arrives Sun 9/20), one tablet, guests' phones on home Wi-Fi. Development on a Mac, deployed to the Pi.
- **Run-of-show:** Chilling (default), then Game time, then Cake time, then Gift time. Dancing is an optional extra scene.
- **Owner:** Justin decides scope. Agents do not change requirements without his approval.

Existing files in the repo (your inputs, read each **once**):

| File | What it is |
|---|---|
| `requirements.md` | v1 requirements with IDs (G-, A-, C-, I-, Q-, P-, D-, T-, B-, AD-, AU-, R-). The source of truth. |
| `timeline.md` | Day-by-day plan (Day 1 = Fri 9/18 through Day 9 = Sat 9/26), gates, cut list, risks, progress log. |
| `notes.md` | Mixed. Contains active design guidance, plus dropped and parked ideas. |

## 3. Ground rules for this job

1. **Do not change the meaning of the requirements.** Move the file and add a header. Never silently drop a requirement or a task.
2. **Dropped and parked ideas must not appear** in `requirements`, `contracts`, `design`, phase docs, runbooks, or `AGENTS.md`. They live only in `docs/archive/` and as "rejected" entries in `docs/decisions.md`. Dropped: camera games and pose tracking, the microphone and all voice/noise reactions, selfie face cutouts. Parked: ESP32 hardware, AI voice / "Ask Kitty", GPIO arcade buttons and floor pads.
3. **Do not invent verified facts.** Shell commands, hardware behavior, and library choices that have not been tested are marked `UNVERIFIED` and left for Phase 0 to confirm.
4. **Resolve inconsistencies conservatively**, log each in `docs/decisions.md` under "Consolidation notes," and mention them in your final report. Known ones are listed in section 8.
5. **Token economy.** Read each source file once. Write each file in one call. Do not paste file contents into chat. Keep your final report short. Keep the files you create small (budgets below).
6. **Style.** Concise. Tables and checklists over prose. Plain language. Straight quotes. Sentence-case headings.
7. **Git is local only.** No push, no force, no history rewriting.
8. If something blocks you and cannot be resolved with a recorded assumption, stop and ask Justin one clear question.

## 4. Target structure

Create exactly this (use `git mv` for moves so history is kept):

```
hello-party/
  README.md                  human guide for Justin
  AGENTS.md                  agent entry point (short)
  CLAUDE.md                  one line: @AGENTS.md
  PROGRESS.md                live status, next steps, needs-Justin list
  .gitignore
  docs/
    requirements.md          v1 frozen (moved from repo root)
    contracts.md             interfaces between the pieces
    design.md                active design guidance (extracted from notes.md)
    decisions.md             decision log with the "why"
    timeline.md              calendar, gates, cut list, risks (moved and slimmed)
    backlog.md               stretch and unscheduled items
    phases/
      README.md              phase index and requirement coverage table
      phase-0-foundations.md
      phase-1-characters.md
      phase-2-server-and-character-mode.md
      phase-3-scene-engine.md
      phase-4-actions.md
      phase-5-admin-and-moments.md
      phase-6-polish-and-hardening.md
    runbooks/
      pi-setup.md
      party-day.md
    archive/
      notes-2026-09-18.md    the original notes.md, moved unchanged (plus a 3-line header)
      handoff-prompt.md      this file, moved here when you are done
```

**Planned code layout.** Document it in `AGENTS.md` and `docs/phases/README.md`. Do **not** create it. Phase 0 creates it.

```
server/  web/guest/  web/admin/  web/display/  pad-service/  shared/
assets/{audio/{music,sfx,broadcast},icons,parts,scenes}/
config/  data/ (gitignored)  scripts/ (deploy, health check)  tests/
```

## 5. Steps (in this order)

1. Read `requirements.md`, `timeline.md`, `notes.md`.
2. `git status`. If this is not a repo, run `git init -b main`. Commit the three existing files unchanged as `chore: snapshot planning docs`.
3. Move files: `requirements.md` and `timeline.md` into `docs/`; `notes.md` to `docs/archive/notes-2026-09-18.md`.
4. Create every file in section 6, in this order: `decisions.md`, `contracts.md`, `design.md`, `phases/*`, `timeline.md` (slim), `backlog.md`, `runbooks/*`, `AGENTS.md`, `CLAUDE.md`, `PROGRESS.md`, `README.md`, `.gitignore`. Use the phase definitions in section 8 and the decision log in section 7.
5. Run the verification checklist in section 10 and fix every failure.
6. Commit in two commits: `docs: restructure into docs/ and archive notes`, then `docs: add hand-off pack (README, AGENTS, PROGRESS, contracts, phases, runbooks)`. Tag the last commit `docs-pack-done`.
7. Move this file to `docs/archive/handoff-prompt.md` in a third commit `chore: archive hand-off prompt`.
8. Send the final report (section 11).

## 6. File specifications

### 6.1 `README.md` (for Justin, a human)

Warm, plain language. About 120-160 lines. Sections:

1. **What this is** (3-4 sentences) and the party date.
2. **The map:** the folder tree from section 4 with a one-line explanation for every file and folder. Include the planned code folders, labeled "created in Phase 0."
3. **Which doc answers which question:** a small table (for example "What should the app do?" -> `docs/requirements.md`; "What are we working on now?" -> `PROGRESS.md`; "Why did we decide X?" -> `docs/decisions.md`; "How do the pieces talk?" -> `docs/contracts.md`; "How do I set up or run the party?" -> `docs/runbooks/`).
4. **How work happens:** one agent at a time, one phase at a time, never in parallel. Explain branches, commits, tags, and the "gate" in plain language.
5. **Phases at a glance:** a table (phase, days, goal, gate).
6. **Starting a work session:** the exact kickoff prompt to copy (see section 9) and the session-end checklist.
7. **What agents will ask you for:** point to the "Needs Justin" list in `PROGRESS.md`.
8. **If something goes wrong:** how to roll back to the last tag, and a pointer to `docs/runbooks/party-day.md`.
9. **Glossary:** scene, transition card, focus mode, action, action registry, queue, cooldown, per-character fairness, device timeout, on-stage cap, depth bands, run-of-show, gate, tag.

### 6.2 `AGENTS.md` (agent entry point, 120 lines maximum)

Sections, in this order:
- **Read order:** `AGENTS.md`, then `PROGRESS.md`, then your phase doc. Read `docs/requirements.md` by ID (grep the ID) instead of in full. Read `contracts.md` and `design.md` on demand. **Never read `docs/archive/`** unless asked.
- **Project in 6 lines.**
- **Stack (recommended, confirm in Phase 0 and record in `decisions.md`):** Node.js LTS with TypeScript; `ws` for WebSocket; Vite with vanilla TypeScript (or Preact) for the three web apps (guest, admin, display); characters rendered as DOM SVG with CSS transforms, falling back to canvas or PixiJS if the Phase 0 spike fails; characters and guests stored as JSON files on disk; pad service reads MIDI on the Pi (Python `mido` with `python-rtmidi`, or Node `easymidi`, whichever installs cleanly; decide in Phase 0); systemd services on the Pi; a Chromium kiosk for the TV.
- **Repo layout:** the planned code layout with the phase that creates each part.
- **How to run and test:** a section that says `TBD: Phase 0 fills this in with verified commands`.
- **Rules:** (1) one phase at a time, one agent at a time, never parallel; (2) do only what your phase doc lists, and anything else goes to `docs/backlog.md`; (3) requirements are frozen, and a change needs Justin's approval, a `decisions.md` entry, and a note in `PROGRESS.md`; (4) deploy to the Pi and verify the gate **on the Pi**, not just the Mac; (5) secrets (admin passphrase, Wi-Fi password) never go in git, only in `.env` (gitignored) with an `.env.example`; (6) art is original and Kitty-inspired only, never official Sanrio assets; (7) store only display names and character data, no photos or audio; (8) never run destructive commands (force push, deleting `data/`, wiping the Pi) without asking; (9) do not buy anything or change the network without asking.
- **Session start ritual, session end ritual, gate rule, blocked rule, cut-list rule, slip rules, safe-fallback rule:** paste the text from section 9.
- **Definition of done for a phase:** gate verified on the Pi with evidence recorded, phase-doc checkboxes ticked, `PROGRESS.md` updated, merged to `main`, tagged.

### 6.3 `PROGRESS.md` (live status, keep under 100 lines)

Sections:
1. **Header:** last updated (date and by whom), current phase, schedule status (on track / behind, with what has been cut).
2. **Phase status table:** phase, planned day, status (`Not started` / `In progress` / `Done`), branch, tag, gate result (one line of evidence). Pre-fill: Docs pack = `Done` (tag `docs-pack-done`); Phases 0-6 = `Not started`.
3. **Now / Next / Blocked.** Pre-fill Next = "Phase 0".
4. **Needs Justin** (checklist, with dates): order the MIDI pad now (expected Sun 9/20) and check the box has a USB cable; order a micro-HDMI to HDMI cable and any missing Pi kit items; confirm the tablet is available; test on real phones (an iPhone and an Android) when Phase 2 is ready; provide final music and sound effect files by Thu 9/24 (placeholders until then; files are swapped by filename); print QR signage and label the pads (Thu 9/24); take part in the rehearsal on Fri 9/25 with the birthday girl and friends; decide the open items in `docs/requirements.md` section 9; optionally create a private remote repo for backup; order the USB keypad backup only if the pad fails the Pi test on 9/20.
5. **Known issues** (empty).
6. **Session log:** append-only, newest first, at most 5 lines per entry (date, agent, what changed, gate evidence, next step). Pre-fill one entry for the docs pack.

### 6.4 `docs/requirements.md`

Moved unchanged. Add only a header block: "Version v1, frozen 2026-09-18. Changes need Justin's approval, an entry in `decisions.md`, and a version bump here. New ideas go in `backlog.md`."

### 6.5 `docs/design.md`

Extract from `notes.md` the guidance that is still active. Rewrite tightly, with no dropped or parked content. Sections: character system and shared rig (data not images, layers and pivots, ~35 parts, color variables, clips written once, performance rules such as no SVG filters and about 50 nodes per character); autonomy and smart objects; pair interactions (stretch); scenes as config; scripted beats and cues; depth bands; connectivity (local first, static IP, guest Wi-Fi isolation check, Cloudflare Tunnel as optional fallback, no accounts, device token, shared admin passphrase); dev workflow (Mac native, no Docker because USB passthrough is unavailable on macOS, deploy to the Pi daily, keyboard as fake pad, debug panel, bot mode); pad controller notes (wired USB, read server-side, note-on only, Note Repeat off, LED control unverified, keypad backup); room, TV, and audio notes (mantle recess, bright daylight, TV game mode, disable auto power-off and screensaver, HDMI-CEC, soundbar under the TV, TV readability); rights.

### 6.6 `docs/contracts.md` (about 300 lines; tables over prose)

Define the interfaces so that separate agents cannot drift apart. Derive everything from `docs/requirements.md` and cite requirement IDs. Sections:

1. **Component diagram** (ASCII) and who connects to whom: server, display, guest app, admin panel, pad service.
2. **Connections and roles:** one WebSocket endpoint with a `role` in the hello message (`guest`, `display`, `admin`, `pad`). Authentication: guest by device token; admin by the shared passphrase (from `.env`); display and pad by a local-only token.
3. **Message catalog** (JSON, each with a `type` field): a table per direction listing every message type, fields, and the requirement IDs it serves. At minimum:
   - guest to server: hello, setName, createCharacter, updateCharacter, removeCharacter, setActiveCharacter, setOnStage, pressAction, setSound
   - server to guest: state (profile, characters, active character, scene, focus, settings), characterResult, actionStatus (per character: ready / waiting / playing / cooldown, with a server timestamp for the cooldown end, and "next" flag), rejected (reason), transitionBanner, focus (on/off, message), broadcast, timeout (until)
   - server to display: sceneState, characterList and positions/bands, actionPlay (actionId, actor, intensity), queueSnapshot, transitionCard, focus/calm, effects, nameHidden updates
   - admin to server: login, switchScene, cue, setFocus, timeoutDevice, hideName, removeCharacter, resetSafe, broadcast, setCooldown, setOnStageCap, showQueueDisplay, setVolume
   - pad to server: padPress (pad 1-16, velocity)
   - all: ping/pong and reconnect behavior
4. **HTTP endpoints:** static apps, `/api/health`, admin login, character PNG download, asset serving.
5. **Data schemas** with a JSON example each: Character, Profile/Device, ActionDef, ActionEvent, QueueEntry, SceneConfig (background, props with points of interest and offered actions, music and volume, behavior weights, interaction level, TV mood, transition card, allowed actions, cue timeline), TransitionCard, FocusState, BroadcastMessage, DeviceInfo, Settings/config (cooldown, expiry, on-stage cap, focus failsafe, flood guard).
6. **State machines** (tables): character action state (Ready, Waiting, Playing, Cooldown), focus mode lifecycle, scene lifecycle with the transition card, queue selection (least-recently-played character first, never-played first, ties by earliest press; locked next; expiry; one pending per character; device flood guard; lanes as optional).
7. **Assets and storage conventions:** folder layout, naming, how audio files are swapped by filename, where guest and character data lives on disk, backup and cleanup of `data/`.
8. **Change protocol:** any change to a message or schema updates this file in the same commit and gets a line in `decisions.md`.

Mark every design detail not stated in the requirements as `PROPOSED` so Phase 0 can review it.

### 6.7 `docs/decisions.md`

A log. Each entry: `D-NN`, date, decision, why, alternatives rejected, requirement IDs affected. Seed it with the entries in **section 7**. Add a "Consolidation notes" section for anything you changed while restructuring. Add an "Open" section listing the open items from `docs/requirements.md` section 9.

### 6.8 `docs/timeline.md` (moved and slimmed)

This becomes the **calendar view** only: the date-to-phase table, the per-day gates, the cut list, the risks table, and the slip rules. **Remove the per-task checkboxes**, because they move into the phase docs and status lives in `PROGRESS.md`. **No task may be lost:** every checkbox in the old `timeline.md` must appear in exactly one phase doc, verbatim or lightly tightened. Keep the progress log entries by moving them into `PROGRESS.md`'s session log.

### 6.9 `docs/phases/`

**`README.md`** contains: the phase table (section 8), the rule "phases run strictly in order," the git conventions, the coverage table mapping **every** requirement ID and every acceptance criterion (requirements section 8) to exactly one phase or to `backlog.md`, and the slip rules.

**Each phase doc** (80-120 lines) uses this template:

```
# Phase N: <name>
Kickoff prompt (Justin pastes this): "Read AGENTS.md, then PROGRESS.md, then docs/phases/phase-N-<slug>.md. Do only this phase."
Planned: <day and date> | Branch: phase-N-<slug> | Tag when done: phase-N-done | Needs: phase-(N-1)-done
## Goal
## Requirements covered   (IDs, and acceptance criteria verified here)
## Tasks                  (checkboxes)
## Out of scope           (explicit; what the next phases own)
## Deliverables           (files, folders, interfaces created or changed)
## Gate                   (testable, verified on the Pi, with the evidence to record)
## How to verify          (numbered steps)
## Slip rules and cut items
## Needs Justin
## Hand-off to the next phase   (what it can rely on, what is deliberately unfinished)
## End-of-phase checklist       (PROGRESS.md updated, boxes ticked, decisions logged, merged with --no-ff, tagged)
```

### 6.10 `docs/backlog.md`

A short list of unscheduled items, each with a one-line pointer: animated GIF download (C-9), raised-hand queue indicator (D-15), birthday star (T-9), layered background art, and anything an agent adds later. Parked ideas are **not** listed here; they stay in the archive.

### 6.11 `docs/runbooks/`

- **`pi-setup.md`:** a skeleton checklist for Phase 0 to complete with verified commands: OS updated; Node installed; static IP; Chromium kiosk auto-start with the cursor hidden and screen blanking off; services under systemd with restart on failure; HDMI audio through the TV to the soundbar; MIDI device check (`amidi -l`, `aseqdump`); deploy script; health check. Label everything `UNVERIFIED` until Phase 0 ticks it.
- **`party-day.md`:** fully written from the requirements and timeline. Sections: Friday rehearsal checklist; Saturday morning setup; run-of-show with the admin action for each step (Chilling, Game time, Cake time with the "blow out" cue, Gift time, then back to Chilling or Dancing); admin cheat sheet (switch scene, focus on/off, time out a device, hide a name, broadcast, reset to safe scene); emergency steps (reset to safe scene; server down, so power-cycle the Pi and it should recover alone; roll back to the last tag); teardown (delete guest and character data if Justin decides so).

### 6.12 `.gitignore`

`node_modules/`, `dist/`, `data/`, `.env`, `*.log`, `.DS_Store`, Python caches, editor folders.

## 7. Seed decision log (record each with its "why")

| ID | Decision | Why | Rejected alternatives |
|---|---|---|---|
| D-01 | Everything runs locally on the Pi over the home Wi-Fi. No internet needed at party time. | Reliability and low latency; nothing to break mid-party. | Vercel or other hosting (serverless is poor at WebSockets and adds internet dependence). |
| D-02 | Cloudflare Tunnel is optional, as a second way in. | Fallback if the guest Wi-Fi network isolates clients. Admin routes must stay protected. | Making it the main path. |
| D-03 | Camera games and pose tracking are dropped. | The AI HAT+ is too expensive or arrives too late; multi-person pose on the Pi CPU is risky; identity tracking with 16 kids is hard. | Single-player pose mirror, red light/green light, marker wand. |
| D-04 | The microphone and voice/noise reactions are dropped. | Unreliable in a room of 16 kids; the soundbar under the TV causes feedback; a pad is deterministic. | Loudness, laughter classification, word spotting, a wireless lavalier mic. |
| D-05 | A wired USB MIDI pad provides 16 special actions. It is read server-side. | Kids like real buttons; avoids browser MIDI permission prompts; wired is more reliable than Bluetooth. | Bluetooth MIDI, browser Web MIDI. |
| D-06 | Keyboard keys stand in for the pad during development. A cheap USB keypad is the backup, ordered only if the pad fails the Pi test on 9/20. | Nothing waits on hardware; 6 days of buffer. | Buying a backup up front. |
| D-07 | No selfie face cutouts and no photo processing. | Privacy of other people's kids. Characters are simple layered SVGs with attribute options instead. | Photo cutouts, cloud image generation. |
| D-08 | Characters are data (JSON) on one shared rig; animation clips are written once. | Art volume is the main risk, and any parts combination must work with any clip. | Per-character animation, bitmap sprites. |
| D-09 | Original Kitty-inspired art only, for private party use. | Sanrio owns the characters. | Tracing or using official art. |
| D-10 | Guest app has two modes (Character, Interact) plus a character strip of up to 3 characters per device. | Lets a parent's phone hold several children's characters. | One character per device. |
| D-11 | Fairness, cooldown, and the pending slot are **per character**, not per device. | Kids without phones must not wait longer than kids with phones. | Per-device seats (rejected as unfair to siblings and to tablet users). |
| D-12 | Device timeout by an admin is the main anti-spam enforcement, with a device flood guard of about 1 press per second as a safety net. | Simple, humane, and visible in the admin device list. | Automatic penalties for pressing during cooldown. |
| D-13 | Queue rules: one pending action per character; expiry about 6 s; cooldown starts when the action plays; least-recently-played character goes first; the next action is locked. | Bounds the queue, avoids stale actions, keeps the TV queue display stable. | A plain FIFO queue. |
| D-14 | Name filter with one-tap hide, not an approval queue. | Approving 16+ names during the party is a chore. | Full approval queue. |
| D-15 | Focus mode (locked scenes: Cake time and Gift time) with transition cards. Phones show a dark calm screen; the TV goes calm; a failsafe auto-release after 30 minutes. | Keep attention on the birthday girl. | Leaving phones interactive during those moments. |
| D-16 | Game time is open (all 16 actions). | Justin: it would not distract from the games. | Limited or locked. |
| D-17 | Shared admin passphrase, no accounts. | Simplicity; two admins. | Separate logins. |
| D-18 | Develop natively on the Mac, deploy to the Pi at least daily, no Docker. | Docker on macOS cannot pass USB through; the real risk is Pi performance, not logic. | Docker-based development. |
| D-19 | Depth bands (front, middle, back by recency of acting) start as characters-only. Layered background art is a stretch. | Adds clarity and room for more characters without a large art cost. | Layered art for every scene. |
| D-20 | PNG download is the v1 download. Animated GIF is a stretch. | GIF is its own small project. | GIF first. |
| D-21 | Music and sound effects are supplied by Justin. Placeholders until then, swapped by filename. | Keeps code independent of the final audio. | Bundling final audio. |
| D-22 | Parked for after this party: ESP32 devices, AI voice and "Ask Kitty", GPIO arcade buttons and floor pads. | Not enough time. | (see archive) |
| D-23 | Data is deleted after the party (proposed, open). | Privacy. | Keeping it. |

## 8. Phase definitions

Phases run in order. Day 1 = Fri 9/18. The calendar view lives in `docs/timeline.md`.

| Phase | Days | Goal | Gate |
|---|---|---|---|
| 0 Foundations | Day 1, Fri 9/18 | Repo scaffold, Pi setup, contracts confirmed, performance spike | 30-character spike fps recorded with the rendering choice; app runs on Mac and Pi; audio path verified or a fallback chosen |
| 1 Characters | Day 2, Sat 9/19 | Rig, parts, gallery, character JSON, renderer, first clips | A custom character walks and dances on the Pi display |
| 2 Server and Character mode | Day 3, Sun 9/20 | WebSocket server, profiles, strip, create/edit/remove, tablet flow, name filter, pad hardware check | 3+ real phones create characters live; pad recognized on the Pi (else order the keypad) |
| 3 Scene engine | Day 4, Mon 9/21 | Scene config, Chilling scene, autonomy, props, remaining clips, debug panel, minimal bots, depth bands if on track | 15+ bots look alive on the Pi, no stutter |
| 4 Actions | Day 5, Tue 9/22 | Registry, queue, cooldown, fairness, Interact UI, queue overlay, cake script, pad adapter | Spam test passes; cake time runs end to end from the debug panel |
| 5 Admin and moments | Day 6, Wed 9/23 | Admin panel, timeouts, Game/Gift/Dancing scenes, transition cards, focus mode, broadcast, audio wiring, demo mode | Full run-of-show works from the admin panel, with focus on Cake and Gift and a late-joining phone getting focus |
| 6 Polish and hardening | Days 7-8, Thu 9/24-Fri 9/25 | PNG download, final audio, pad labels, TV QR, auto-start, fallback, backups, rehearsal | Reboot test passes; rehearsal passes the requirements acceptance criteria; backup taken. Feature freeze Fri midday. |

Day 9 (Sat 9/26) is the party. It has no phase; use `docs/runbooks/party-day.md`.

**Requirement assignments** (use these; assign any ID not listed by judgment and record it):

- **Phase 0:** R-1, D-1, D-9 (as the spike), AU-1 (audio path check only)
- **Phase 1:** D-2, D-3 (v1 clips: idle, walk, wave, dance A, jump), D-8, C-10 (data format)
- **Phase 2:** G-1, G-2, G-3, G-4, G-6, A-1 to A-6, C-1 to C-7, C-10 (storage), R-4; P-1 (hardware check only)
- **Phase 3:** D-3 (remaining clips: cheer, laugh, clap, sleep, spin), D-5, D-6, D-7, D-16 (if on track), D-13 (minimal bot spawner only)
- **Phase 4:** Q-1 to Q-11, Q-13, Q-14, I-1 to I-8, D-4, D-14 (debug overlay), P-1 to P-6 (may slip), event bus and scene director, cake time script triggered from the debug panel; Q-9 and Q-10 last (cut list)
- **Phase 5:** Q-12, Q-15, I-9, AD-1 to AD-11, T-1 to T-8, B-1 to B-3, AU-1, AU-2 (placeholders wired), D-13 (full demo mode), D-14 (polish), D-16 (if slipped), scenes Game time, Gift time, Dancing, and Cake time wired to the admin panel with focus; D-10 and D-11 only if time (D-10 is on the cut list)
- **Phase 6:** C-8, D-12, G-5 (optional), R-2, R-3, R-5, AU-2 (final files), rehearsal
- **Backlog:** C-9, D-15, T-9

**Acceptance criteria** (requirements section 8) map to: #1 Phase 6; #2 Phase 5; #3, #4, #9, #10 Phase 4; #5 Phase 6; #6, #11, #12, #13, #14 Phase 5; #7 Phase 5 and 6; #8 Phase 4.

**Slip rules** (preserve exactly):
- Phase 3: depth bands move to Phase 5 if Day 4 is behind.
- Phase 4 is the heaviest day. The pad adapter moves to Phase 5 if it slips.
- Phase 5 is heavy. Take-turns (I-9), queue display polish, and broadcast move to Phase 6 if it slips.
- Cut list, from the top: MIDI pad station; animated GIF; Cloudflare Tunnel; pair interactions; queue extras (lanes, coalescing); Dancing scene. Must-have items are never cut without asking Justin.

**Known inconsistencies to resolve (log each under "Consolidation notes"):**
1. The old Day 5 gate says cake time runs "from the admin cue," but the admin panel is built on Day 6. Resolution: in Phase 4 the cake script is triggered from the debug panel; Phase 5 rewires it to the admin panel and adds the transition card and focus mode.
2. Several requirement IDs (D-10, D-11, D-12, Q-9, Q-10, Q-11, Q-13, G-5) were never scheduled in the old timeline. The assignments above fix this.
3. Bot mode appears on both Day 4 (gate) and Day 6 (demo). Resolution: Phase 3 builds a minimal spawner used by tests and gates; Phase 5 builds the demo mode.
4. Phase 0 sets up initial systemd/kiosk services; Phase 6 hardens them (R-2, R-3).

## 9. Handoff habits (put this text in `AGENTS.md`, and summarize it in `README.md`)

**One agent at a time. Phases run in order. Never run agents in parallel.**

**Git**
- `main` is always deployable. Work happens on `phase-N-<slug>`. Commit small and often with messages like `phaseN: <what>`.
- When the gate passes: merge to `main` with `--no-ff`, tag `phase-N-done`. The last good tag is the fallback for the party.
- Never push, force-push, or rewrite history without asking.

**Session start ritual**
1. Read `AGENTS.md`, `PROGRESS.md`, and the phase doc.
2. Run `git status`, check the branch and the latest tag.
3. Run the app locally. On Phase 1 onward, also confirm the Pi still runs the last tag.
4. Confirm the phase is next in order. If the previous phase is not tagged done, stop and tell Justin.

**During the session**
- Do only what the phase doc lists. Anything else goes to `docs/backlog.md`.
- Look up requirements by ID instead of reading the whole file.
- Record any decision that is not in the docs in `docs/decisions.md`. Update `docs/contracts.md` in the same commit as any message or schema change.
- Deploy to the Pi at least once per session. Verify the gate on the Pi and record the evidence (numbers, test output, what was seen).

**Session end ritual**
1. Update `PROGRESS.md`: status table, Now/Next/Blocked, Needs Justin, Known issues, and a session log entry of 5 lines or fewer.
2. Tick the phase-doc checkboxes.
3. Commit. If the gate passed, merge and tag.
4. If unfinished, write exactly where you stopped and what comes next.

**Gate rule.** A phase is not done until its gate is verified on the Pi and the evidence is written in `PROGRESS.md`.

**Blocked rule.** If you need something only Justin can do (hardware, a real-phone test, audio files, a decision), add it to "Needs Justin" and stop that thread. Do not guess about hardware behavior.

**Schedule rule.** Compare progress to `docs/timeline.md` every session. If behind, follow the slip rules, then the cut list, and ask Justin before cutting anything marked must-have. **Feature freeze is Fri 9/25 midday.** After that, bug fixes only.

**Requirements rule.** Requirements are frozen v1. A change needs Justin's approval, a `decisions.md` entry, and a note in `PROGRESS.md`.

**Kickoff prompt (Justin pastes this to start any session):**
> Read AGENTS.md, then PROGRESS.md, then the phase doc for the next phase. Do only that phase. Verify the gate on the Pi. Update PROGRESS.md, merge, and tag when done.

## 10. Verification checklist (do all of these before committing)

1. Every requirement ID in `docs/requirements.md` (G-, A-, C-, I-, Q-, P-, D-, T-, B-, AD-, AU-, R-) appears exactly once in the coverage table in `docs/phases/README.md`, assigned to a phase or to `backlog.md`. Check this with a script or grep, not by eye.
2. Every acceptance criterion (requirements section 8) is assigned to a phase.
3. Every checkbox from the old `timeline.md` appears in exactly one phase doc.
4. Every open item in requirements section 9 appears in `decisions.md` ("Open") or in `PROGRESS.md` ("Needs Justin").
5. No dropped or parked idea appears in `docs/requirements.md`, `contracts.md`, `design.md`, phase docs, runbooks, `AGENTS.md`, or `PROGRESS.md`. Search for: camera, webcam, pose, microphone, mic, voice, selfie, ESP32, arcade, GPIO, "Ask Kitty". They may appear only in `docs/archive/` and in "rejected alternatives" or "parked" rows of `docs/decisions.md`.
6. All relative links between files resolve. `AGENTS.md` is 120 lines or fewer. Each phase doc is 120 lines or fewer. `PROGRESS.md` is under 100 lines.
7. `README.md` is readable by someone who has forgotten the project: no jargon before the glossary, every folder explained.
8. No secrets, Wi-Fi names, or passwords anywhere.
9. Each phase doc starts with its kickoff prompt, and its branch and tag names match `docs/phases/README.md`.
10. The words "parallel agents" appear only in rules that forbid them.

## 11. Final report (short)

Reply to Justin with:
- The tree you created (one screen).
- The consolidation notes you logged (one line each).
- Anything you assumed or that needs his decision.
- The exact kickoff prompt to start Phase 0.

Do not paste file contents.
