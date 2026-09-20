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
- 2026-09-18, Chromium on the TV, launched from a terminal on the Pi (VERIFIED, works): `WAYLAND_DISPLAY=wayland-0 XDG_RUNTIME_DIR=/run/user/$(id -u) chromium --ozone-platform=wayland --kiosk --noerrdialogs --disable-infobars --no-first-run --password-store=basic "<url>"`. Without `--ozone-platform=wayland` it exits with `Missing X server or $DISPLAY`. Kiosk auto-start (step 6) is still UNVERIFIED.
- 2026-09-18, spike run 1 (production build via `npm run preview`, Chromium kiosk, 1920x1080 at devicePixelRatio 1): 30 characters at 26 nodes each, 300 canvas particles, JS movement on, 60 s. Average 59.9 fps, worst 1-second 58 fps, p99 frame 16.8 ms, worst frame 33.4 ms, 4 frames over 20 ms, 1 frame over 33 ms. The user agent string reports `X11; Linux x86_64` because Chromium reduces it; the Pi is aarch64. `get_throttled` after the run: not recorded yet. 60 fps is the display refresh, so this shows the load fits but not how much headroom is left.
- 2026-09-18, spike run 2 (same setup and settings as run 1, Chromium left running, test run again): average 60 fps, worst 1-second 60 fps, p99 16.8 ms, worst frame 17.3 ms, 0 frames over 20 ms. Run 1's slow frames were probably warm-up. `vcgencmd get_throttled` gave `0x0` and `measure_temp` gave 58.2 C, checked between the runs (not tied to one run).
- 2026-09-18, spike runs 3 to 5 (same setup, 26 nodes per character, JS movement on, 60 s each, started by URL parameters over SSH because there is no local keyboard): 45 characters and 300 particles: average 50.4 fps, worst second 44, p99 34 ms, worst 66.7 ms, 571 frames over 20 ms, 169 over 33 ms. 60 characters and 300 particles: average 32.6 fps, worst second 30, p99 50 ms, worst 50.7 ms, 1610 over 20 ms, 450 over 33 ms. 60 characters and 800 particles: average 31.7 fps, worst second 29, p99 50 ms, worst 50.6 ms, 1665 over 20 ms, 439 over 33 ms. `get_throttled` `0x0` and `measure_temp` 58.7 C right after the last run. Reading (not measured): the characters are the cost, since 500 extra particles at 60 characters cost about 1 fps; 30 characters is fine and 45 is not.
- 2026-09-18, spike runs 6 and 7 (same setup, 60 s each, 26 nodes per character): 38 characters and 300 particles: average 58.6 fps, worst second 55, p99 33.3 ms, worst 34.1 ms, 83 frames over 20 ms, 21 over 33 ms. 30 characters and 1200 particles: average 59.8 fps, worst second 55, p99 17.3 ms, worst 34 ms, 11 frames over 20 ms, 5 over 33 ms. `get_throttled` `0x0` and `measure_temp` 59.8 C after the last run.
- 2026-09-18, audio (step 7 still UNVERIFIED), dev TV with no soundbar, Pi on the TV's ARC input: `/proc/asound/cards` lists `vc4hdmi0` and `vc4hdmi1`; `aplay -l` lists both; `speaker-test -t wav -c 2 -l 1` is audible (voice says "front left, front right"); but `wpctl status` shows only `Dummy Output` as a sink (two `Built-in Audio` devices, IDs 48 and 49, with no sinks; profiles offered were only `off` and `pro-audio`). After `systemctl --user restart pipewire pipewire-pulse wireplumber`, PipeWire created the sink `Built-in Audio Digital Stereo (HDMI)` (ID 57, node `alsa_output.platform-107c701400.hdmi.hdmi-stereo`, on `vc4-hdmi-0`, the port the TV is on), and `pw-play /usr/share/sounds/alsa/Front_Center.wav` is audible at sink volume 1.00. Cause of the first failure unknown (WirePlumber logged `Failed to create alsa_output.platform-107c701400.hdmi.pro-output-0: Object activation aborted`). The first Chromium tone tests were INVALID: the `data:` URL contained `#fff`, which cuts the URL at the fragment, so the script never ran. With `background:white` instead, the Chromium tone (`AudioContext` oscillator, `--autoplay-policy=no-user-gesture-required`) was audible on the dev TV, and `wpctl status` showed a `Chromium` stream (ID 80) playing to `MAI PCM i2s-hifi-0` (both channels active). Still to test: the soundbar on the target TV. After a reboot (no audio services restarted, checked at uptime 1 min) `wpctl status` shows the sink `Built-in Audio Digital Stereo (HDMI)` (ID 56) as default at volume 1.00, so the fix survives a reboot; the reason for the first failure is still unknown.
- OS choice (recommendation, `UNVERIFIED`): Raspberry Pi OS 64-bit, the standard image with the desktop. As of April 2026 that image is based on Debian 13 (Trixie). Not Lite, because the Chromium kiosk needs a desktop session; not Full, because the extra apps are not needed. Use a good-quality microSD card of 32 GB or more, and keep the spare card for the SD image copy (R-5).
