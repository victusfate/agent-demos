#!/usr/bin/env bash
# fetch-test-video.sh — download a short sample of a video to ./videos/.
#
# Why: experiments like beat-prism analyze a video's audio fully client-side,
# which requires a same-origin (local) file — remote URLs such as YouTube are
# CORS-walled. This wraps yt-dlp to fetch a test clip onto disk so it can be
# dropped onto the experiment page. Source videos can be feature-length, so
# by default only a 3-minute sample is downloaded.
#
# Usage:   bash scripts/fetch-test-video.sh [--hq] <url> [start] [duration|full]
#   bash scripts/fetch-test-video.sh <url>              # first 3 minutes
#   bash scripts/fetch-test-video.sh <url> 45:00        # 3 min from 45:00
#   bash scripts/fetch-test-video.sh <url> 45:00 5:00   # 5 min from 45:00
#   bash scripts/fetch-test-video.sh <url> full         # entire video
#   bash scripts/fetch-test-video.sh --hq <url> full    # highest quality, whole video
#
# --hq merges the best separate video+audio streams (4K/8K where offered)
# instead of the best single-file mp4 (~720p on YouTube). Above 1080p
# YouTube serves VP9/AV1, so the result is usually .webm/.mkv — fine for
# Chrome/Edge. Note: without a JS runtime (deno) yt-dlp may not see the
# very top formats.
#
# Requires yt-dlp (pip install yt-dlp | brew install yt-dlp); sampling and
# --hq also require ffmpeg (section cutting / stream muxing).
#
# Output: prints the downloaded file path on stdout. ./videos/ is gitignored.
# Idempotent: yt-dlp skips files it has already downloaded.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUT_DIR="$ROOT/videos"

HQ=0
if [[ "${1:-}" == "--hq" ]]; then
  HQ=1
  shift
fi

if [[ $# -lt 1 || $# -gt 3 ]]; then
  echo "usage: bash scripts/fetch-test-video.sh [--hq] <url> [start] [duration|full]" >&2
  exit 2
fi
URL="$1"
START="${2:-0:00}"
DURATION="${3:-3:00}"

if ! command -v yt-dlp >/dev/null 2>&1; then
  echo "error: yt-dlp not found. Install it: pip install yt-dlp (or brew install yt-dlp)" >&2
  exit 1
fi

# Best single-file mp4 plays anywhere without muxing; --hq merges the best
# separate streams (needs ffmpeg) for the highest available resolution.
FMT='b[ext=mp4]/b'
if [[ $HQ -eq 1 ]]; then
  if ! command -v ffmpeg >/dev/null 2>&1; then
    echo "error: ffmpeg not found (required by --hq to mux video+audio)." >&2
    exit 1
  fi
  FMT='bv*+ba/b'
fi

# "1:23:45" / "23:45" / "45" -> seconds
to_seconds() {
  awk -F: '{ s = 0; for (i = 1; i <= NF; i++) s = s * 60 + $i; print s }' <<<"$1"
}

EXTRA_ARGS=()
if [[ "$START" != "full" ]]; then
  if ! command -v ffmpeg >/dev/null 2>&1; then
    echo "error: ffmpeg not found (required to cut a sample). Install it, or pass 'full' to download the whole video." >&2
    exit 1
  fi
  START_S="$(to_seconds "$START")"
  END_S="$(( START_S + $(to_seconds "$DURATION") ))"
  EXTRA_ARGS+=(--download-sections "*${START_S}-${END_S}" --force-keyframes-at-cuts
               -o "$OUT_DIR/%(title)s [${START_S}s-${END_S}s].%(ext)s")
else
  EXTRA_ARGS+=(-o "$OUT_DIR/%(title)s.%(ext)s")
fi

mkdir -p "$OUT_DIR"

yt-dlp \
  --no-playlist \
  -f "$FMT" \
  --print after_move:filepath \
  --no-simulate \
  "${EXTRA_ARGS[@]}" \
  "$URL"
