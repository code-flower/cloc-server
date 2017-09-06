#!/usr/bin/env osascript

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


