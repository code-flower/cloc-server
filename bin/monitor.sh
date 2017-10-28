#!/usr/bin/env osascript

# THIS IS A WORK IN PROGRESS.
# The idea was to open a terminal window running the connection monitor (see bin/pm2/conn-monitor)
# on every DO machine that is running the app.

-- tell application "iTerm2"
--   tell current session of current window
--     split vertically with default profile command "ssh root@api.codeflower.la -t 'PATH=\"/root/.nvm/versions/node/v8.4.0/bin:$PATH\"; cd /root/cloc-server; npm run monit; bash -l'"
--     split vertically with default profile command "ssh root@api.codeflower.la -t 'PATH=\"/root/.nvm/versions/node/v8.4.0/bin:$PATH\"; cd /root/cloc-server; npm run monit; bash -l'"
--   end tell
-- end tell

tell application "iTerm2"
  tell current session of current window
    split vertically with default profile command "bash --login"
    set foreground color to {32193, 0, 0, 0}
  end tell
end tell


