#!/usr/bin/env bash
# Cron wrapper: trustlessly settle knockout markets as their matches finish.
# Runs the auto-settler and logs to settle-cron.log (rotated at ~1MB).
# Cron has a bare environment, so set PATH/HOME explicitly.
set -u
export HOME=/home/greyat_labs
export PATH=/usr/bin:/bin:/home/greyat_labs/.local/share/solana/install/active_release/bin
export ANCHOR_WALLET="$HOME/.config/solana/id.json"

TXDIR=/home/greyat_labs/Development/worldcup-match-vault/txline
LOG="$TXDIR/settle-cron.log"

# rotate log if it grows past ~1MB
if [ -f "$LOG" ] && [ "$(stat -c%s "$LOG" 2>/dev/null || echo 0)" -gt 1048576 ]; then
  mv -f "$LOG" "$LOG.1"
fi

cd "$TXDIR" || exit 1
{
  echo "===== $(date -Is) ====="
  npx ts-node src/settle-knockout.ts
  echo ""
} >> "$LOG" 2>&1
