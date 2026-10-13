---
name: gopumgyeok-headless-verification
description: 이 폴더에서 CSS를 시각 검증하는 방법 — 브라우저 확장이 없어 헤드리스 크롬 + iframe 래퍼를 쓴다
metadata:
  type: feedback
---

`0007`의 CSS는 눈으로 확인하지 않으면 안 된다([[gopumgyeok-landing-project]]). 그런데 이 환경에는 함정이 몇 개 있다.

**Claude in Chrome 확장은 연결돼 있지 않다.** `tabs_context_mcp`가 "Browser extension is not connected"로 실패한다. 실제 브라우저 조작이 필요하면 사용자에게 요청할 것. 그 전까지는 헤드리스 크롬으로 해결한다.

```bash
python3 -m http.server 8765 &
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu \
  --hide-scrollbars --window-size=1440,900 --virtual-time-budget=9000 \
  --screenshot=out.png "http://localhost:8765/index.html"
```

**특정 섹션을 찍으려면 iframe 래퍼가 필요하다.** 이유 두 가지:
- `index.html#profit`로 여는 건 `html{scroll-behavior:smooth}` 때문에 엉뚱한 위치에서 찍힌다.
- 창 높이를 8000px로 키워 전체 페이지를 담으려 해도, 히어로가 `100vh`라 히어로 혼자 8000px이 되어 나머지가 안 보인다.

그래서 임시 `_shot.html`을 만들어 iframe에 `index.html`을 넣고, 고정 크기(예: 1440×900)를 준 뒤 `contentWindow.scrollTo(0, 대상.offsetTop + 오프셋)`로 이동시켜 찍는다. **찍고 나면 임시 파일을 지울 것.**

**헤드리스에서 CSS 트랜지션은 흐르지 않는다.** `--virtual-time-budget` 아래에서 첫 렌더 이후의 트랜지션은 진행되지 않아 `max-height`가 시작값에 멈춘 채 측정된다. 그래서:
- 애니메이션 **완료 상태**를 보려면 래퍼에서 `*{transition:none !important}`를 주입하고 찍는다.
- 애니메이션 **동작 여부**는 스크린샷 대신 **클래스 토글을 측정**해서 확인한다(예: `.in-view`가 붙고 떨어지는지).
- IntersectionObserver는 **첫 `scrollTo`를 `load` 핸들러에서 동기로** 호출해야 발화한다. 첫 스크롤을 `setTimeout` 안에 넣으면 콜백이 아예 안 온다(이후 단계는 `setTimeout` 체인으로 이어도 된다).

**픽셀 대신 숫자로 검증하면 훨씬 정확하다.** 텍스트 잘림·정렬 같은 건 래퍼에서 `getBoundingClientRect()`나 `Range.getBoundingClientRect()`로 재서 `document.title`에 적고 `--dump-dom | grep '<title>'`로 뽑는다. 실제로 이 방법으로 "매출 숫자 글자폭 = 폰트 크기의 5.83배"를 구해 `16cqw`라는 상한을 계산했고, 슬롯과 종이 폭이 0.0px 차이로 일치하는 것도 확인했다.

**`--screenshot`은 `setTimeout`/`setInterval` 기반 타이머 상태(예: Swiper `autoplay`)에는
`--virtual-time-budget`을 반영하지 않는다.** 히어로 Swiper 자동재생을 검증할 때
`--virtual-time-budget`을 6000/9500/13000ms로 늘려가며 `--screenshot`을 찍어도 매번 로드 직후의
첫 슬라이드만 캡처됐다(autoplay delay 3200ms가 몇 바퀴 돌 시간을 줘도 안 넘어감). 반면 같은
budget으로 `--dump-dom`을 찍으면 `swiper-wrapper`의 `transform:translate3d(...)`가 실제로
이동해 있고, JS가 매 틱마다 갱신하는 CSS 커스텀 프로퍼티(`style="--progress: 0.3..."`)도
정확한 값으로 찍혀 나온다 — 즉 타이머 자체는 정상 진행되지만 `--screenshot`의 캡처 시점만
그 진행을 반영하지 않는다. **타이머/자동재생/카운트업처럼 시간에 따라 바뀌는 상태를
검증할 때는 스크린샷 대신 `--dump-dom`으로 해당 요소의 인라인 style/class를 확인할 것.**
스크린샷은 정적 레이아웃·색상·타이포그래피 검증에만 신뢰한다.

**Why:** 인계문서에 "모든 CSS가 시각 검증되지 않았다"고 적혀 있을 만큼 이 폴더는 눈으로 확인하는 게 중요한데, 위 함정들 때문에 순진하게 찍으면 검은 화면이나 접힌 카드만 나온다.

**서버를 새로 띄우기 전엔 항상 기존 프로세스를 죽일 것.** `python3 -m http.server 8765`를
매번 새로 띄우다가, 이전 세션이 남긴 프로세스가 포트를 물고 있어 스크린샷에 **다른(형제)
프로젝트**의 페이지가 찍힌 적이 있다(`0007-B` 작업 중인데 `0007`의 히어로가 나옴 — 두
프로젝트가 같은 포트 8765를 관례적으로 쓰기 때문). `lsof -ti:8765 | xargs kill -9`로 죽인
뒤 새로 띄우고, `curl -s http://localhost:8765/index.html | grep <현재-작업-중인-고유
클래스명>`으로 지금 고치는 파일이 실제로 서빙되는지 확인한 뒤에만 스크린샷을 찍는다.

**`--window-size`의 폭이 좁으면(≲450px) 헤드리스가 요청한 값을 무시하고 내부적으로
500px 뷰포트를 쓴다 — 스크린샷 PNG는 요청한 크기(예: 390×900)로 나오지만, 그 안의
레이아웃은 500px 폭 기준으로 계산된 뒤 축소 없이 크롭된다.** 실제로 겪은 사례: `left:50%;
transform:translateX(-50%);width:150px` 로 만든 배경 띠가 390px 캔버스에서 x=175~325
(중심 250)에 그려져 "중앙(195)에서 55px 어긋났다"고 오판했는데, 페이지에 `document.
documentElement.clientWidth`를 찍어보니 500이 나왔다(500/2=250, 정확히 일치). **≥800px
폭에서는 `clientWidth`가 요청값과 일치해 정상 동작한다.** 모바일(`max-width:1024px`) 스타일
검증 시 실제 좁은 기기 폭(360~430px)이 아니라 **800px 안팎을 쓸 것** — CLAUDE.md/screenshot-
verifier가 이미 "450px 미만에서 오른쪽 정렬 flex 자식이 안 그려지는 결함"을 문서화해
뒀지만, 이번 건은 그거와 다른 증상(엉뚱한 폭으로 렌더)이라 **450px 미만 전체를 신뢰하지
않는 게 안전**하다.

**`--virtual-time-budget`은 `setTimeout` 타이머는 정상 진행시키지만, 그 타이머가 트리거한
CSS `transform` 트랜지션(예: Swiper `effect:'creative'`의 슬라이드 위치 보간)은 실제
컴포지터 프레임 타이밍과 다르게 뒤틀린 상태로 스크린샷에 찍힐 수 있다.** Swiper
`effect:'creative'` + `loop:true` 조합에서 활성 슬라이드가 오른쪽으로 밀려 보이는 버그를
`--virtual-time-budget=3400/6000` 양쪽에서 100% 재현했지만, **같은 페이지를 실시간(virtual-
time-budget 없이) `--remote-debugging-port`로 띄우고 CDP로 직접 `getBoundingClientRect()`를
찍었더니 완벽히 중앙 정렬**돼 있었다 — 헤드리스 가상시간 자체가 만든 착시였다. **transform
기반 JS 애니메이션(Swiper 이펙트 등)의 "전환 후 안착 상태"를 검증할 때는 `--virtual-time-
budget` 스크린샷을 곧이곧대로 믿지 말고, 의심되면 아래 CDP 실시간 확인으로 교차검증할 것.**
(참고: 이 세션에서 결국 Swiper 자체는 `effect:'fade'`로 되돌리고 "슥 올라오는" 모션은
별도 CSS 키프레임으로 분리해 문제를 우회했다 — `gopumgyeok-swiper-creative-loop-bug`
참고.)

**CDP(Chrome DevTools Protocol) 실시간 디버깅 — puppeteer 없이 Node 네이티브
`WebSocket`으로 가능하다.**
```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new \
  --disable-gpu --force-device-scale-factor=1 --hide-scrollbars \
  --window-size=800,1200 --remote-debugging-port=9333 \
  --user-data-dir=/private/tmp/.../chrome-profile-debug \
  "http://localhost:8766/index.html" &
curl -s http://localhost:9333/json   # 타겟 목록 — "type":"page" 인 것만 골라야 한다.
                                      # 실수로 browser_ui(Omnibox Popup) 타겟에 붙으면
                                      # querySelector 가 전부 null 이 된다.
```
Node(v22+, 네이티브 `WebSocket` 전역 지원)로 `ws://.../devtools/page/<targetId>`에 접속해
`Runtime.enable`→(대기)→`Runtime.evaluate({expression, returnByValue:true})`로 임의 JS를
실행하고 `getBoundingClientRect()`/`getComputedStyle()` 값을 그대로 받아올 수 있고,
`Page.captureScreenshot`으로 그 순간의 실제(가상시간 아닌) 스크린샷도 뜰 수 있다. 메시지
`id`를 자기가 보낸 요청 수만큼 정확히 세어(`Runtime.enable`이 id=1이면 그 응답도 id=1) 매칭
해야 한다 — 어긋나면 다음 응답을 영영 못 받는다.

**특정 섹션이 정적 HTML에 이미 존재하면(= JS `fetch` 렌더를 안 거치는 섹션 껍데기), iframe
없이 URL 해시(`index.html#섹션id`)만으로도 헤드리스가 그 위치로 점프해 스크린샷에 잡힌다.**
위 "iframe 래퍼가 필요하다" 항목은 `#profit`처럼 스크롤 위치가 애매하거나 실패했던
과거 경험 기준이었는데, `#ranking`(정적 `<section id="ranking">`가 히어로 바로 다음이라
JS 렌더를 기다릴 필요가 없는 섹션)에는 그냥
`"...Chrome" --headless=new --window-size=1440,1900 --virtual-time-budget=9000
--screenshot=out.png "http://localhost:8765/index.html#ranking"` 만으로 원하는 위치가 바로
찍혔다. 반면 이번 세션에서 iframe + `contentWindow.scrollTo` 방식은 이유 불명으로 두 번
연속 실패(항상 페이지 맨 위만 찍힘)했다. **먼저 해시+충분히 큰 `--window-size`로 시도해보고,
안 되면 그때 iframe 래퍼로 폴백할 것** — iframe을 기본값으로 먼저 시도하지 않는다.
