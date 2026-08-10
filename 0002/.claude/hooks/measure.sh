#!/usr/bin/env bash
#
# HISTORY 슬라이드의 실제 렌더링 값을 재서 레이아웃 규칙 위반을 찾는다.
#
#   .claude/hooks/measure.sh              # 아래 INVARIANTS 의 모든 뷰포트
#   .claude/hooks/measure.sh 1440x828     # 특정 뷰포트만
#
# stdout 에 JSON 을 출력하고, 위반이 하나라도 있으면 exit 1.
# 의존성은 python3 와 Chrome 뿐이다. Chrome 경로가 다르면 CHROME 환경변수로 지정한다.
set -euo pipefail

HOOKS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$HOOKS_DIR/../.." && pwd)"
CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
PORT="${PORT:-8901}"
BASE="http://localhost:$PORT"

# ─────────────────────────────────────────────────────────────────────────────
# 지켜야 할 규칙 = 이 프로젝트의 테스트 명세. 레이아웃 구조를 의도적으로 바꿨다면
# 여기도 함께 고친다. 단, 통과시키려고 느슨하게 만드는 건 회귀를 덮는 것과 같다.
# ─────────────────────────────────────────────────────────────────────────────
read -r -d '' INVARIANTS <<'JSON' || true
{
  "target": "/index.html",
  "viewports": [
    { "w": 1920, "h": 1080, "mode": "pc" },
    { "w": 1440, "h": 828, "mode": "pc" },
    { "w": 1280, "h": 720, "mode": "pc" },
    { "w": 430, "h": 932, "mode": "mo" }
  ],
  "rules": {
    "text_fits_slide_height": {
      "enabled": true, "mode": "pc", "tolerancePx": 0,
      "why": "칸 높이(컨테이너 70vh / slidesPerView 7 = 10vh)를 넘으면 위아래 슬라이드와 겹친다."
    },
    "text_fits_slide_width": {
      "enabled": true, "mode": "pc", "tolerancePx": 0,
      "why": "슬라이드 폭(40vw의 62% = 24.8vw)을 넘으면 가운데 구분선을 침범한다."
    },
    "single_line": {
      "enabled": true, "mode": "pc", "maxLineHeightRatio": 1.5,
      "why": "월 이름과 연도가 갈라져 2줄이 되면 칸 높이의 2배가 되어 겹친다."
    },
    "no_left_clipping": {
      "enabled": true, "mode": "pc", "minLeftRatio": 0.03,
      "why": "슬라이드 폭을 키우면 flex-end 정렬 때문에 텍스트가 화면 왼쪽으로 밀려 잘린다."
    },
    "activetxt_visible": {
      "enabled": true, "mode": "pc",
      "why": "썸네일 슬라이드에 overflow:hidden 을 주면 top:-29% 인 .activetxt 가 잘려 사라진다."
    },
    "active_slide_filled": {
      "enabled": true, "mode": "pc", "expect": "rgb(255, 255, 255)",
      "why": "활성 슬라이드는 흰색으로 꽉 차야 한다. -webkit-text-fill-color 를 건드리면 깨진다."
    },
    "no_horizontal_overflow": {
      "enabled": true, "mode": "any",
      "why": "가로 스크롤이 생기면 레이아웃이 넘친 것이다."
    },
    "breakpoint_layout": {
      "enabled": true, "mode": "any", "breakpoint": 1080,
      "why": "1080px 초과는 history_pc, 이하는 history_mo 만 보여야 한다."
    }
  }
}
JSON

if [ ! -x "$CHROME" ]; then
  echo "Chrome 을 찾을 수 없습니다: $CHROME (CHROME 환경변수로 경로 지정)" >&2
  exit 127
fi

# index.html 을 같은 오리진 iframe 으로 띄워야 해서 계측 페이지도 프로젝트 안에 둔다.
# 실행 중에만 만들고 끝나면 지운다.
HARNESS="$HOOKS_DIR/.harness.html"
CFG_FILE="$HOOKS_DIR/.invariants.json"
TMP_DIR="$(mktemp -d)"
SERVER_PID=""

cleanup() {
  rm -f "$HARNESS" "$CFG_FILE"
  rm -rf "$TMP_DIR"
  [ -n "$SERVER_PID" ] && kill "$SERVER_PID" 2>/dev/null || true
}
trap cleanup EXIT

printf '%s\n' "$INVARIANTS" > "$CFG_FILE"

cat > "$HARNESS" <<'HTML'
<!DOCTYPE html>
<html lang="ko"><head><meta charset="UTF-8"><title>measure harness</title>
<style>html,body{margin:0;padding:0;overflow:hidden;background:#000}
#frame{border:0;display:block}#result{position:fixed;left:0;top:0;width:1px;height:1px;overflow:hidden;opacity:0}</style>
</head><body>
<iframe id="frame"></iframe><pre id="result"></pre>
<script>
var OUT = document.getElementById('result');
function emit(obj){
  var json = JSON.stringify(obj);
  OUT.textContent = btoa(String.fromCharCode.apply(null, new TextEncoder().encode(json)));
  document.title = 'done';
}
function px(v){ return Math.round(v * 10) / 10; }
function lineHeightOf(el){
  var cs = getComputedStyle(el), lh = parseFloat(cs.lineHeight);
  return isNaN(lh) ? parseFloat(cs.fontSize) * 1.2 : lh;
}
function ruleOf(cfg, name, mode){
  var r = cfg.rules[name];
  if (!r || !r.enabled) return null;
  if (r.mode !== 'any' && r.mode !== mode) return null;
  return r;
}
function measure(d, cfg, w, h, mode){
  var out = { viewport: w + 'x' + h, mode: mode, violations: [], metrics: {} };
  function add(rule, item, detail){
    detail.rule = rule; detail.item = item; out.violations.push(detail);
  }
  var slides = [].slice.call(d.querySelectorAll('.history_pc .select-swiper .swiper-slide'));
  var rH = ruleOf(cfg, 'text_fits_slide_height', mode);
  var rW = ruleOf(cfg, 'text_fits_slide_width', mode);
  var rL = ruleOf(cfg, 'single_line', mode);
  var rX = ruleOf(cfg, 'no_left_clipping', mode);

  if (mode === 'pc' && slides.length) {
    var seen = {}, items = [];
    for (var i = 0; i < slides.length; i++) {
      var s = slides[i], p = s.querySelector('p');
      if (!p) continue;
      var label = p.textContent.trim().replace(/\s+/g, ' ');
      if (seen[label]) continue;   // swiper loop 이 만든 복제 슬라이드는 한 번만 본다
      seen[label] = true;

      var sr = s.getBoundingClientRect(), pr = p.getBoundingClientRect(), lh = lineHeightOf(p);
      items.push({ label: label, slideH: px(sr.height), slideW: px(sr.width),
        textH: px(pr.height), textW: px(pr.width), textLeft: px(pr.left), lineHeight: px(lh) });

      if (rH && pr.height > sr.height + rH.tolerancePx)
        add('text_fits_slide_height', label, { actual: px(pr.height), limit: px(sr.height), overBy: px(pr.height - sr.height) });
      if (rW && pr.width > sr.width + rW.tolerancePx)
        add('text_fits_slide_width', label, { actual: px(pr.width), limit: px(sr.width), overBy: px(pr.width - sr.width) });
      if (rL && pr.height > lh * rL.maxLineHeightRatio)
        add('single_line', label, { actual: px(pr.height), limit: px(lh * rL.maxLineHeightRatio), note: '줄바꿈 발생 추정' });
      if (rX && pr.left < w * rX.minLeftRatio)
        add('no_left_clipping', label, { actual: px(pr.left), limit: px(w * rX.minLeftRatio) });
    }
    out.metrics.slides = items;
  }

  var rA = ruleOf(cfg, 'activetxt_visible', mode);
  if (rA) {
    var at = d.querySelector('.history_pc .thumbs-swiper .swiper-slide-active .activetxt');
    var visible = !!at && getComputedStyle(at).display !== 'none' && at.getBoundingClientRect().width > 0;
    out.metrics.activetxt = { found: !!at, visible: visible, text: at ? at.textContent.trim().replace(/\s+/g, ' ') : null };
    if (!visible) add('activetxt_visible', '.activetxt', { actual: at ? 'hidden' : 'not found', limit: 'visible' });
  }

  var rF = ruleOf(cfg, 'active_slide_filled', mode);
  if (rF) {
    var ap = d.querySelector('.history_pc .select-swiper .swiper-slide-active p');
    var fill = ap ? getComputedStyle(ap).webkitTextFillColor : null;
    out.metrics.activeSlideFill = fill;
    if (fill !== rF.expect) add('active_slide_filled', 'swiper-slide-active p', { actual: fill, limit: rF.expect });
  }

  var rO = ruleOf(cfg, 'no_horizontal_overflow', mode);
  if (rO) {
    var sw = d.documentElement.scrollWidth;
    out.metrics.scrollWidth = sw;
    if (sw > w + 1) add('no_horizontal_overflow', 'document', { actual: sw, limit: w });
  }

  var rB = ruleOf(cfg, 'breakpoint_layout', mode);
  if (rB) {
    var pc = d.querySelector('.history .history_pc'), mo = d.querySelector('.history .history_mo');
    var pcShown = !!(pc && getComputedStyle(pc).display !== 'none');
    var moShown = !!(mo && getComputedStyle(mo).display !== 'none');
    out.metrics.layout = { pcShown: pcShown, moShown: moShown };
    var expectPc = w > rB.breakpoint;
    if (pcShown !== expectPc || moShown === expectPc)
      add('breakpoint_layout', 'history', { actual: 'pc=' + pcShown + ' mo=' + moShown, limit: 'pc=' + expectPc + ' mo=' + !expectPc });
  }
  return out;
}

function main(cfg){
  var params = new URLSearchParams(location.search);
  var mode = params.get('mode') || 'pc';
  var frame = document.getElementById('frame');

  // 창 크기에 기대면 안 된다. 헤드리스 Chrome 은 최소 창 크기(약 500px)와 창 장식 때문에
  // --window-size 를 그대로 주지 않는다. 측정 뷰포트는 iframe 크기로 직접 못박는다.
  var w = parseInt(params.get('w'), 10) || window.innerWidth;
  var h = parseInt(params.get('h'), 10) || window.innerHeight;
  frame.style.width = w + 'px';
  frame.style.height = h + 'px';
  frame.src = params.get('target') || cfg.target;

  var tries = 0;
  var timer = setInterval(function(){
    tries++;
    var d = null;
    try { d = frame.contentDocument; } catch (e) {}
    var ready = d && d.readyState === 'complete' && d.fonts && d.fonts.status === 'loaded' &&
      (mode !== 'pc' || (d.querySelector('.history_pc .select-swiper .swiper-slide-active') &&
                         d.querySelector('.history_pc .thumbs-swiper .swiper-slide-active')));
    if (ready) {
      clearInterval(timer);
      try { emit(measure(d, cfg, w, h, mode)); }
      catch (e) { emit({ viewport: w + 'x' + h, mode: mode, error: String(e && e.stack || e) }); }
      return;
    }
    if (tries > 400) {
      clearInterval(timer);
      emit({ viewport: w + 'x' + h, mode: mode, error: 'timeout: 페이지 준비 실패', detail: {
        readyState: d ? d.readyState : 'no document',
        fonts: d && d.fonts ? d.fonts.status : null,
        slides: d ? d.querySelectorAll('.history_pc .select-swiper .swiper-slide').length : 0 } });
    }
  }, 50);
}

fetch('./.invariants.json').then(function(r){ return r.json(); }).then(main);
</script>
</body></html>
HTML

# ── 로컬 서버 (이미 떠 있으면 재사용) ────────────────────────────────────────
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

# ── 측정할 뷰포트 목록 ──────────────────────────────────────────────────────
if [ "$#" -gt 0 ]; then
  VIEWPORTS=""
  for arg in "$@"; do
    w="${arg%x*}"; h="${arg#*x}"
    mode="pc"; [ "$w" -le 1080 ] && mode="mo"
    VIEWPORTS+="$w $h $mode"$'\n'
  done
else
  VIEWPORTS="$(printf '%s\n' "$INVARIANTS" | python3 -c "
import json, sys
cfg = json.load(sys.stdin)
for v in cfg['viewports']:
    print(v['w'], v['h'], v.get('mode', 'pc'))
")"
fi

# ── 뷰포트별 측정 ───────────────────────────────────────────────────────────
idx=0
while read -r w h mode; do
  [ -z "$w" ] && continue
  # 창은 iframe 이 잘리지 않을 만큼만 크면 된다. 실제 측정 뷰포트는 쿼리로 넘긴 w,h 다.
  "$CHROME" --headless=new --disable-gpu --hide-scrollbars \
    --window-size="$((w + 100)),$((h + 200))" --virtual-time-budget=25000 --dump-dom \
    "$BASE/.claude/hooks/.harness.html?mode=$mode&w=$w&h=$h" 2>/dev/null </dev/null \
    | python3 -c "
import sys, re, base64, json
html = sys.stdin.read()
if not html.strip():
    print(json.dumps({'error': 'Chrome 이 DOM 을 출력하지 않았습니다.'}, ensure_ascii=False))
    sys.exit(0)
m = re.search('<pre id=\"result\"[^>]*>([^<]*)</pre>', html)
if not m or not m.group(1).strip():
    print(json.dumps({'error': '결과를 회수하지 못했습니다. harness 가 측정 전에 종료되었을 수 있습니다.'}, ensure_ascii=False))
else:
    try:
        print(base64.b64decode(m.group(1)).decode('utf-8'))
    except Exception as exc:
        print(json.dumps({'error': '결과 디코드 실패: %s' % exc}, ensure_ascii=False))
" > "$TMP_DIR/$idx.json"
  idx=$((idx + 1))
done <<< "$VIEWPORTS"

# ── 집계 ────────────────────────────────────────────────────────────────────
python3 - "$TMP_DIR" <<'PY'
import json, os, sys, glob

results = []
for path in sorted(glob.glob(os.path.join(sys.argv[1], "*.json")),
                   key=lambda p: int(os.path.basename(p)[:-5])):
    with open(path) as f:
        try:
            results.append(json.load(f))
        except Exception as e:
            results.append({"error": "JSON 파싱 실패: %s" % e})

violations = sum(len(r.get("violations", [])) for r in results)
errors = [r for r in results if r.get("error")]
passed = violations == 0 and not errors

lines = []
for r in results:
    if r.get("error"):
        lines.append("%s ERROR %s" % (r.get("viewport", "?"), r["error"]))
    elif r.get("violations"):
        for v in r["violations"]:
            lines.append("%s FAIL %s [%s] actual=%s limit=%s" % (
                r["viewport"], v["rule"], v["item"], v.get("actual"), v.get("limit")))
    else:
        lines.append("%s PASS" % r["viewport"])

print(json.dumps({
    "passed": passed,
    "violationCount": violations,
    "summary": lines,
    "results": results,
}, ensure_ascii=False, indent=2))

sys.exit(0 if passed else 1)
PY
