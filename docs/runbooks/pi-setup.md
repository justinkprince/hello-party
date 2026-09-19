# Runbook: Raspberry Pi setup

Skeleton for Phase 0 to complete. Every item is `UNVERIFIED` until an agent has run it on the actual Pi and ticked it here with the exact command that worked. Do not copy commands from memory into this file; record only what was tested. No Wi-Fi names or passwords in this file (they go in `.env` on the Pi).

Ask Justin before changing the network, buying anything, or wiping anything.

| # | Step | Status | Verified command or result |
|---|---|---|---|
| 0a | microSD flashed with Raspberry Pi OS (64-bit, standard image with desktop) using Raspberry Pi Imager. Imager settings: hostname, user account, SSH on, locale and time zone, Wi-Fi (entered in the Imager, never in git). Recommendation, not yet tried on this Pi. | VERIFIED 2026-09-18 | On the Pi: `hostname` gives `hello-party`; `PRETTY_NAME="Debian GNU/Linux 13 (trixie)"`; `uname -m` gives `aarch64`. |
| 0b | First boot works: the Pi boots to the desktop on the TV and is reachable by SSH from the Mac | VERIFIED 2026-09-18 | TV shows the desktop (Justin). `ssh jprince@hello-party.local` works from the Mac. `pgrep -a labwc` gives `1316 /usr/bin/labwc -m`. |
| 1 | OS updated | VERIFIED 2026-09-18 | `apt list --upgradable` (piped to `wc -l`, header line removed) gives `0`; rebooted afterwards, kernel `6.18.50+rpt-rpi-2712`, `throttled=0x0`. |
| 2 | Node LTS installed (version recorded) | VERIFIED 2026-09-18 | `node -v` gives `v24.21.0`; `npm -v` gives `11.19.0`; `/usr/bin/node` from the apt package `nodejs`. NodeSource apt source is `https://deb.nodesource.com/node_24.x`, so `apt upgrade` stays on Node 24. |
| 3 | Static IP set (address recorded, with Justin's approval) | UNVERIFIED | |
| 4 | Repo cloned on the Pi; `.env` created from `.env.example` | UNVERIFIED | Clone exists at `~/hello-party`: `git status -sb` clean on `phase-0-foundations`, HEAD `8c893a5` (matches the Mac). `.env` not created yet. |
| 5 | Server runs as a systemd service, restarts on failure, starts on boot | UNVERIFIED | |
| 6 | Chromium kiosk auto-starts after the server is ready: full-screen 1080p, cursor hidden, screen blanking off | UNVERIFIED | |
| 7 | HDMI audio through the TV to the soundbar (test sound heard) | UNVERIFIED | |
| 8 | MIDI device check with `amidi -l` and `aseqdump` (needs the pad, Phase 2) | UNVERIFIED | |
| 9 | Pad service runs as a systemd service (Phase 4) | UNVERIFIED | |
| 10 | Deploy script from the Mac works | UNVERIFIED | |
| 11 | Health check script reports OK (`/api/health`) | UNVERIFIED | |
| 12 | Power-cycle test: Pi returns to the Chilling scene by itself (Phase 6) | UNVERIFIED | |
| 13 | SD card image copy taken (Phase 6) | UNVERIFIED | |

## TV settings (done by hand)

- [ ] Game or low-latency mode on
- [ ] Auto power-off and screensaver off
- [ ] HDMI-CEC input switching checked
- [ ] Brightness high for daylight

## Notes

- Keep the Pi ventilated if it sits behind the TV. Do not run the fireplace.
- Record anything surprising here, so the party-day runbook can use it.
- 2026-09-18: `vcgencmd get_throttled` returned `0x50000` (under-voltage and throttling have occurred since boot; neither was active at the time). The power supply is unconfirmed. `dmesg` shows repeated `Undervoltage detected!` events, each lasting about 2 s, roughly every 200 s (uptime about 2676 s and 2885 s, checked at about 2940 s), so it is recurring, not a one-off. Swap the supply, reboot, and recheck (expect `0x0` and no undervoltage lines in `dmesg`) before the OS update and the spike; throttling would distort the fps numbers. After the swap (5 min uptime): `get_throttled` gives `0x0` and `dmesg` shows no undervoltage lines. Only a short sample; recheck during the spike.
- OS choice (recommendation, `UNVERIFIED`): Raspberry Pi OS 64-bit, the standard image with the desktop. As of April 2026 that image is based on Debian 13 (Trixie). Not Lite, because the Chromium kiosk needs a desktop session; not Full, because the extra apps are not needed. Use a good-quality microSD card of 32 GB or more, and keep the spare card for the SD image copy (R-5).
