#!/bin/bash
# patch_styles.sh — update .tinder-btn and .tinder-controls dimensions in style.css

CSS="$(dirname "$0")/style.css"

if [ ! -f "$CSS" ]; then
  echo "ERROR: $CSS not found"
  exit 1
fi

# 1. Replace width/height in .tinder-btn
sed -i 's/width: 72px; height: 72px;/width: 52px; height: 52px;/g' "$CSS"

# 2. Replace gap/margin values in .tinder-controls
sed -i 's/gap: 20px; margin-top: 20px; margin-bottom: 80px;/gap: 12px; margin-top: 12px; margin-bottom: 90px;/g' "$CSS"

echo "Done. Patched $CSS"
