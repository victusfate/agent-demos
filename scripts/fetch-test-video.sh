#!/usr/bin/env bash
# fetch-test-video.sh — download a video to ./videos/ for local testing.
#
# Why: experiments like beat-prism analyze a video's audio fully client-side,
# which requires a same-origin (local) file — remote URLs such as YouTube are
# CORS-walled. This wraps yt-dlp to fetch a test clip onto disk so it can be
# dropped onto the experiment page.
#
# Usage:   bash scripts/fetch-test-video.sh <url>
# Example: bash scripts/fetch-test-video.sh 'https://www.youtube.com/watch?v=nYG2nvjsH5I'
#
# Requires yt-dlp (https://github.com/yt-dlp/yt-dlp):
#   pip install yt-dlp   |   brew install yt-dlp
#
# Output: prints the downloaded file path on stdout. ./videos/ is gitignored.
# Idempotent: yt-dlp skips files it has already downloaded.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT_DIR="$ROOT/videos"

if [[ $# -ne 1 ]]; then
  echo "usage: bash scripts/fetch-test-video.sh <url>" >&2
  exit 2
fi
URL="$1"

if ! command -v yt-dlp >/dev/null 2>&1; then
  echo "error: yt-dlp not found. Install it: pip install yt-dlp (or brew install yt-dlp)" >&2
  exit 1
fi

mkdir -p "$OUT_DIR"

# Prefer a single-file mp4 (plays in <video> without ffmpeg post-merging);
# fall back to the best available single file.
yt-dlp \
  --no-playlist \
  -f 'b[ext=mp4]/b' \
  -o "$OUT_DIR/%(title)s.%(ext)s" \
  --print after_move:filepath \
  --no-simulate \
  "$URL"
