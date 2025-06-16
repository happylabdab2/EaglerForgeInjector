#!/bin/bash
# Test the CLI interface of the script
set -euo pipefail

wget -qO- https://github.com/Eaglercraft-Archive/unminified-eaglercraft-builds/releases/latest/download/EaglercraftX_1.8_Offline_en_US.html > EaglercraftX.html
node ./cli.js EaglercraftX.html output.html /eaglerforge /minify /verbose

if test -f output.html; then
  echo "[Success] File found"
else
  echo "[Error] File not found"
  exit 1
fi

if grep -q "ModAPI" output.html; then
  echo "[Success] ModAPI found in output"
else
  echo "[Error] ModAPI not found in output"
  exit 1
fi
