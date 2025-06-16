#!/bin/bash
# Test the CLI interface of the script
set -euo pipefail

wget -qO- https://github.com/Eaglercraft-Archive/unminified-eaglercraft-builds-1.12/releases/latest/download/Eaglercraft_1.12_Offline_en_US.html > Eaglercraft1.12.html
node ./efi Eaglercraft1.12.html output.html /eaglerforge /minify /verbose

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
