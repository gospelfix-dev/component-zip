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
