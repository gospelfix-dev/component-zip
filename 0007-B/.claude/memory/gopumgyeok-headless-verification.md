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

**Why:** 인계문서에 "모든 CSS가 시각 검증되지 않았다"고 적혀 있을 만큼 이 폴더는 눈으로 확인하는 게 중요한데, 위 함정들 때문에 순진하게 찍으면 검은 화면이나 접힌 카드만 나온다.
