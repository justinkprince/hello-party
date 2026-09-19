   #!/bin/bash
   # Start the TV display in Chromium kiosk mode.
   URL="http://localhost:3000/"   # replace with the real display URL once the server exists

   # Wait up to about 2 minutes for the server, then start regardless.
   for i in $(seq 1 60); do
     curl -fs http://localhost:3000/api/health >/dev/null && break
     sleep 2
   done

   exec chromium "$URL" --kiosk --noerrdialogs --disable-infobars --no-first-run \
     --password-store=basic --disable-features=CrashRecoveryBubble
