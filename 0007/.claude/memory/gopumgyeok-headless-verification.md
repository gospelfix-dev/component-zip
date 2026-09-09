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

**2026-09-09에 추가로 확인된 함정들:**

- **검증 도중 파일이 실시간으로 계속 바뀔 수 있다.** 사용자가 같은 세션에서 짧은 간격으로
  연달아 수정 요청을 보내면(예: 문의 FAB 버튼을 하루에 다섯 번 다시 디자인), 스크린샷 검증을
  시작한 시점과 끝난 시점 사이에 코드가 이미 여러 버전 지나가 있을 수 있다. 검증 시작 전과
  끝나기 직전 두 번 관련 CSS/HTML을 다시 grep/Read해서 대상 코드가 안정됐는지(mtime이 더
  안 바뀌는지) 확인하고, 지시문이 묘사하는 "방금 바뀐 상태"가 아니라 **그 순간 디스크에 실제로
  있는 최종 상태**를 기준으로 보고한다.
- **`--window-size` 폭이 500px 미만이면 무시되고 500px로 렌더된 뒤 크롭된다.** 진짜 390px
  같은 좁은 모바일 폭을 테스트하려 해도 헤드리스 Chrome이 이 값을 존중하지 않아, 텍스트가
  잘린 것처럼 보이는 가짜 오버플로우가 생긴다. 500px 이상 값으로만 신뢰할 수 있다.
- **큰 폭(예: 5000px 이상) 스크롤 뒤 `--screenshot`을 찍으면 검은 프레임만 나올 때가 있다.**
  실제 스크롤로 먼 거리를 이동시키는 대신, 대상 요소에 `in-view` 같은 클래스를 스크립트로
  직접 주입하거나 `scrollTo` 목표 지점을 트리거 지점 바로 근처로 좁혀서 우회한다.
- **`initReceiptReveal`은 더 이상 `IntersectionObserver`가 아니라 순수 `scroll` 이벤트
  리스너**(`window.scrollY >= triggerTop` 비교)로 바뀌었다(2026-09-09). 그래서 이 반복 리빌을
  검증할 때는 `IntersectionObserver` 콜백 재발화 함정([[gopumgyeok-headless-verification]]
  위쪽 내용) 대신, `window.scrollTo(0, 목표값)` 직후 `window.dispatchEvent(new
  Event('scroll'))`을 명시적으로 호출해야 `update()`가 실행된다 — 헤드리스에서는 진짜 스크롤이
  일으키는 네이티브 scroll 이벤트가 프로그래매틱 `scrollTo`만으로는 안 붙는 경우가 있다.
- **`component-zip` 저장소에는 `0007`과 형제 폴더 `0007-B`가 공존하고, 둘 다 같은 포트
  (8765)로 로컬 서버를 띄우는 관례가 있다.** 다른 세션이 동시에 `0007-B`용 서버를 8765에
  띄워 놓으면 이쪽에서 `python3 -m http.server 8765`를 실행해도 실제로는 기존 서버가 응답해
  엉뚱한(0007-B) 콘텐츠를 캡처하게 된다. 캡처 전에 `lsof -a -p <PID> -d cwd`로 서버 프로세스의
  작업 디렉터리가 `0007`인지 확인하거나, 포트를 다른 값으로 바꿔 뜨는 것이 안전하다.
