# Runbook: Raspberry Pi setup

Skeleton for Phase 0 to complete. Every item is `UNVERIFIED` until an agent has run it on the actual Pi and ticked it here with the exact command that worked. Do not copy commands from memory into this file; record only what was tested. No Wi-Fi names or passwords in this file (they go in `.env` on the Pi).

Ask Justin before changing the network, buying anything, or wiping anything.

| # | Step | Status | Verified command or result |
|---|---|---|---|
| 0a | microSD flashed with Raspberry Pi OS (64-bit, standard image with desktop) using Raspberry Pi Imager. Imager settings: hostname, user account, SSH on, locale and time zone, Wi-Fi (entered in the Imager, never in git). Recommendation, not yet tried on this Pi. | UNVERIFIED | |
| 0b | First boot works: the Pi boots to the desktop on the TV and is reachable by SSH from the Mac | UNVERIFIED | |
| 1 | OS updated | UNVERIFIED | |
| 2 | Node LTS installed (version recorded) | UNVERIFIED | |
| 3 | Static IP set (address recorded, with Justin's approval) | UNVERIFIED | |
| 4 | Repo cloned on the Pi; `.env` created from `.env.example` | UNVERIFIED | |
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
- OS choice (recommendation, `UNVERIFIED`): Raspberry Pi OS 64-bit, the standard image with the desktop. As of April 2026 that image is based on Debian 13 (Trixie). Not Lite, because the Chromium kiosk needs a desktop session; not Full, because the extra apps are not needed. Use a good-quality microSD card of 32 GB or more, and keep the spare card for the SD image copy (R-5).
