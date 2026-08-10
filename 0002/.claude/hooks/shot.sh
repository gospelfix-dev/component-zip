#!/usr/bin/env bash
#
# 뷰포트별 스크린샷을 찍는다. 폰트 로드가 끝난 뒤 캡처되도록 충분한 가상 시간을 준다.
#
#   .claude/hooks/shot.sh                      # 기본 뷰포트 전체
#   .claude/hooks/shot.sh 1440x828 1280x720
#   SCALE=3 .claude/hooks/shot.sh 1920x1080    # 아웃라인 획을 확대해서 볼 때
#   OUT_DIR=/tmp/shots .claude/hooks/shot.sh
#
# 저장된 파일 경로를 한 줄씩 출력한다.
set -euo pipefail

HOOKS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$HOOKS_DIR/../.." && pwd)"
CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
PORT="${PORT:-8901}"
BASE="http://localhost:$PORT"
OUT_DIR="${OUT_DIR:-$HOOKS_DIR/out}"
SCALE="${SCALE:-1}"

DEFAULT_VIEWPORTS="1920 1080
1440 828
1280 720
430 932"

if [ ! -x "$CHROME" ]; then
  echo "Chrome 을 찾을 수 없습니다: $CHROME (CHROME 환경변수로 경로 지정)" >&2
  exit 127
fi

mkdir -p "$OUT_DIR"

SERVER_PID=""
cleanup() { [ -n "$SERVER_PID" ] && kill "$SERVER_PID" 2>/dev/null || true; }
trap cleanup EXIT

if ! curl -s -o /dev/null --max-time 2 "$BASE/index.html"; then
  python3 -m http.server "$PORT" --directory "$ROOT_DIR" >/dev/null 2>&1 &
  SERVER_PID=$!
  for _ in $(seq 1 40); do
    curl -s -o /dev/null --max-time 1 "$BASE/index.html" && break
    sleep 0.25
  done
  if ! curl -s -o /dev/null --max-time 1 "$BASE/index.html"; then
    echo "로컬 서버를 띄우지 못했습니다 (포트 $PORT)" >&2
    exit 1
  fi
fi

if [ "$#" -gt 0 ]; then
  VIEWPORTS=""
  for arg in "$@"; do
    VIEWPORTS+="${arg%x*} ${arg#*x}"$'\n'
  done
else
  VIEWPORTS="$DEFAULT_VIEWPORTS"
fi

suffix=""
[ "$SCALE" != "1" ] && suffix="@${SCALE}x"

while read -r w h; do
  [ -z "$w" ] && continue
  out="$OUT_DIR/shot_${w}x${h}${suffix}.png"
  "$CHROME" --headless=new --disable-gpu --hide-scrollbars \
    --force-device-scale-factor="$SCALE" \
    --window-size="$w,$h" --virtual-time-budget=15000 \
    --screenshot="$out" "$BASE/index.html" >/dev/null 2>&1 </dev/null
  if [ -s "$out" ]; then
    echo "$out"
  else
    echo "캡처 실패: ${w}x${h}" >&2
  fi
done <<< "$VIEWPORTS"
