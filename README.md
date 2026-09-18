# Hello Kitty Party on the TV

A guide for Justin, written so it still makes sense weeks from now.

## 1. What this is

A Hello Kitty themed "party on the TV" for a 9-year-old's birthday at home, with about 16 kids plus parents. Guests build little cartoon characters on their phones (or one shared tablet), and the characters wander around a scene on the living-room TV, doing their own thing. Guests can also press buttons to make things happen: confetti, dances, cheers. You and your wife run the scenes from your phones.

**The party is Saturday, September 26, 2026.** Everything runs on a Raspberry Pi 5 plugged into the TV, over your home Wi-Fi, with no internet needed.

## 2. The map

Everything is in this folder. Folders marked "created in Phase 0" do not exist yet; the first coding agent makes them.

```
hello-party/
  README.md              this guide
  AGENTS.md              the short instruction sheet every coding agent reads first
  CLAUDE.md              one line that points Claude at AGENTS.md
  PROGRESS.md            live status: what is done, what is next, what needs you
  .gitignore             files git should never save (secrets, runtime data)
  docs/
    requirements.md      what the party display must do (frozen "v1")
    contracts.md         how the pieces talk to each other (messages, data formats)
    design.md            how to build it: art, animation, scenes, room and TV notes
    decisions.md         every decision and why, plus open questions
    timeline.md          the calendar: which day is which phase, cut list, risks
    backlog.md           nice-to-have ideas that are not scheduled
    phases/
      README.md          phase list and the table proving every requirement has a home
      phase-0-foundations.md ... phase-6-polish-and-hardening.md
                         one work order per phase for a coding agent
    runbooks/
      pi-setup.md        checklist to set up the Pi (filled in with tested steps)
      party-day.md       rehearsal, morning setup, run-of-show, emergencies
    archive/
      notes-2026-09-18.md   the original idea notes, kept as they were
      handoff-prompt.md     the instructions that created this pack
  server/                (created in Phase 0) the program on the Pi that keeps track of everything
  web/guest/             (created in Phase 0) the page guests use on their phones
  web/admin/             (created in Phase 0) the control page for you and your wife
  web/display/           (created in Phase 0) the page the TV shows
  pad-service/           (created in Phase 0) reads the physical button pad
  shared/                (created in Phase 0) code used by more than one of the above
  assets/                (created in Phase 0) art, icons, music, sound effects
  config/                (created in Phase 0) settings, scene setups, the list of actions
  data/                  (created in Phase 0) saved guests and characters; never goes into git
  scripts/               (created in Phase 0) helper scripts: deploy, health check, backup
  tests/                 (created in Phase 0) automated checks, including the spam test
```

## 3. Which doc answers which question

| Question | Read |
|---|---|
| What should the app do? | `docs/requirements.md` |
| What are we working on now? | `PROGRESS.md` |
| Why did we decide X? | `docs/decisions.md` |
| How do the pieces talk? | `docs/contracts.md` |
| How do I set up or run the party? | `docs/runbooks/` |
| Which day is which phase, and what gets cut if we run late? | `docs/timeline.md` |
| What does a coding agent do in one session? | `docs/phases/` |
| How should it look and behave? | `docs/design.md` |
| What ideas are waiting? | `docs/backlog.md` |

## 4. How work happens

- **One agent at a time, one phase at a time, never in parallel.** Each agent reads three short files, does exactly one phase, and leaves things ready for the next.
- **Branches.** Each phase gets its own branch (a separate line of work). `main` always holds something that works.
- **Commits.** Small saved steps with a short message, like `phase2: add name filter`.
- **The gate.** Every phase ends with one test that must pass **on the Pi**, not just on the Mac. The agent writes down what it saw. No gate, no "done."
- **Tags.** When the gate passes, the work is merged into `main` and labeled with a tag like `phase-2-done`. A tag is a bookmark on a known-good version. The latest tag is your safety net for the party.
- **Nothing gets pushed, deleted, bought, or changed on your network without asking you first.**

## 5. Phases at a glance

| Phase | Days | Goal | Gate |
|---|---|---|---|
| 0 Foundations | Fri 9/18 | Folders, Pi setup, speed test | Speed test recorded; runs on Mac and Pi; audio works |
| 1 Characters | Sat 9/19 | Character parts, animations | A custom character walks and dances on the TV |
| 2 Server and Character mode | Sun 9/20 | Guests make characters on phones | 3+ real phones create characters; button pad recognized |
| 3 Scene engine | Mon 9/21 | Scenes, characters act on their own | 15+ fake characters look alive, no stutter |
| 4 Actions | Tue 9/22 | Buttons, fair queue, effects | Spam test (fake guests mashing buttons) passes; cake time runs end to end |
| 5 Admin and moments | Wed 9/23 | Admin page, scenes, focus mode (calm screens) | Whole run-of-show works from the admin page |
| 6 Polish and hardening | Thu 9/24 to Fri 9/25 | Final audio, backups, rehearsal | Reboot test and rehearsal pass; backup taken |

Saturday 9/26 is the party. Use `docs/runbooks/party-day.md`. If we run behind, `docs/timeline.md` says what gets cut first.

## 6. Starting a work session

Paste this to the coding agent:

> Read AGENTS.md, then PROGRESS.md, then the phase doc for the next phase. Do only that phase. Verify the gate on the Pi. Update PROGRESS.md, merge, and tag when done.

Before you close the session, check that the agent:
- [ ] updated `PROGRESS.md` (status, next steps, what it needs from you)
- [ ] ticked the boxes in its phase doc
- [ ] recorded any decision in `docs/decisions.md`
- [ ] committed, and, if the gate passed, merged and tagged
- [ ] wrote down exactly where it stopped, if it did not finish

## 7. What agents will ask you for

Look at "Needs Justin" in `PROGRESS.md`. It has dates: ordering the button pad and cables, testing on real phones, final music and sound effects by Thu 9/24, printing signs and labeling pads on Thu 9/24, the rehearsal on Fri 9/25, and the open questions in `docs/decisions.md`.

## 8. If something goes wrong

- **Something broke after a recent phase.** List the bookmarks with `git tag --list 'phase-*-done'`, then ask an agent to put the last good one on the Pi. Never delete the `data/` folder to fix a problem.
- **During the party.** Use `docs/runbooks/party-day.md`. The short version: press "Reset to safe scene" in the admin page. If the TV is stuck, power-cycle the Pi; it should recover on its own.
- **Not sure what state things are in.** Read `PROGRESS.md`, then its "Known issues."

## 9. Glossary

| Word | Plain meaning |
|---|---|
| Scene | A setting on the TV, such as Chilling, Game time, Cake time, Gift time, or Dancing. |
| Transition card | A big full-screen title with a sound (for example "Cake time!") shown when the scene changes. |
| Focus mode | Phones show a calm dark screen and the TV goes quiet so everyone watches the birthday girl. |
| Action | One thing a guest can trigger, like confetti or a dance. There are 16. |
| Action registry | The single list that defines all 16 actions, used by phones, the pad, and the TV. |
| Queue | The waiting line of actions when several people press at once. |
| Cooldown | A short pause after an action before the same character can press again. |
| Per-character fairness | Each character has its own turn and its own cooldown, so a kid sharing a phone waits no longer than anyone else. |
| Device timeout | An admin can pause one phone for a few minutes if it is spamming. |
| On-stage cap | The most characters allowed on the TV at once. |
| Depth bands | Front, middle, and back rows on the TV; whoever acted most recently steps to the front. |
| Run-of-show | The order of the party: Chilling, Game time, Cake time, Gift time. |
| Gate | The test a phase must pass on the Pi before it counts as done. |
| Tag | A bookmark on a known-good version of the project. |
