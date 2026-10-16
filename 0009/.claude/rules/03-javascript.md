# JavaScript 규칙

## 문법 수준

**ES6 문법으로 작성한다.** `var`/IIFE/ES5 강제는 하지 않는다.

- `const`/`let`을 쓴다
- 화살표 함수, 템플릿 리터럴을 쓴다
- 모듈 시스템(`import`/`type="module"`)은 쓰지 않는다 — 파일 하나에 전역 함수로 둔다

`fetch`와 `Promise`로 `data/content.json`을 읽는다.

## 구조

```
DOMContentLoaded
 └─ boot()  데이터 무관 인터랙션 먼저 붙임 →
      fetch → renderAll() 로 섹션 렌더 →
      DOM 에 올라온 뒤에만 관찰 가능한 리빌 함수들을 붙임
 ├─ initSmoothScroll()     [data-target] 클릭 스크롤 + 모바일 nav 닫기
 ├─ initMobileNav()        햄버거 토글
 ├─ initScrollSpy()        헤더 .is-scrolled 토글
 ├─ renderHeader / renderHero / renderMenu(+initMenuCategoryTabs — 카테고리
 │                         클릭 시 data-category 로 메뉴 행 필터링, 탭 전환만이고
 │                         Swiper 같은 외부 캐러셀 없음)
 ├─ renderBeforeAfter / renderTeam / renderReviews / renderPricing / renderFooter
 ├─ renderChatbot(data)    FAQ 챗봇 FAB+패널(.chat-fab/.chat-panel) — FAB 클릭으로만
 │                         열림(자동 오픈 없음), 칩 클릭은 e.target.closest('[data-topic]')
 │                         위임 리스너 1개로 처리. 정적 FAQ 트리아지이며 실제 AI/백엔드
 │                         호출이 아니다.
 ├─ initReservationForm()  인라인 폼(#reservationForm) mock 제출 — 유일한 예약/문의
 │                         입력 경로. 헤더·히어로·하단 고정 바의 모든 CTA는 새 모달을
 │                         만들지 않고 이 폼으로 스크롤 + 첫 입력 필드 포커스만 한다
 │                         (0008에서 중복 폼을 전부 삭제하고 인라인 폼 하나로 합친 선례를
 │                         따른다 — 되살리지 않는다: 하단 고정 바 전용 별도 폼, 모바일
 │                         FAB+모달 폼을 추가로 만들지 않는다).
 └─ initScrollReveal(sel)  공용 1회성 스크롤 리빌 유틸(IntersectionObserver, threshold 0.15)
```

하단 고정 바(`#stickyBar`)의 예약하기/문의 버튼은 별도 함수 없이 헤더·히어로와 똑같이
`[data-target]` + `initSmoothScroll()`로 처리한다 — 버튼마다 핸들러를 중복으로 달지 않는다.

## 렌더링

- 텍스트는 `esc()`로 이스케이프해서 넣는다. `desc`류 필드만 `<b>` 같은 인라인 태그를
  허용해 HTML로 삽입한다.
- 각 렌더 함수는 `fill(id, html)` 유틸로 대상 컨테이너의 `innerHTML`을 **한 번만** 교체한다
  (여러 항목을 문자열 배열로 모아 `join('')`한 뒤 한 번에 삽입 — 항목마다 개별
  `appendChild`를 반복하지 않는다).

## 오류 처리

`fetch` 실패는 정상 경로다(주로 `file://`로 연 경우). 해당 자리에 이유를 문구로 보여준다
(`showFetchError()`). `FALLBACK` 사본을 JS에 두지 않는다 — `data/content.json`을 고쳐도
화면이 안 바뀌는 함정이 생긴다.

## 절제된 인터랙션 원칙

무한 반복 attention 애니메이션, 스크롤로 섹션을 드나들 때마다 반복 재생되는 리빌,
자동으로 튀어나오는 모달을 만들지 않는다. 챗봇 패널은 사용자가 FAB를 클릭해야만 열린다 —
자동 오픈 없음. 스크롤 리빌은 `IntersectionObserver`로 진입 시 1회만 클래스를 붙이고,
반드시 `unobserve`한다.

이 프로젝트에는 카운트다운이나 숫자 카운트업 같은 장치가 없다 — 가격은 정적으로
`toLocaleString()`만 거쳐 표시한다. 허위 긴급성 연출(가짜 타이머 등)을 만들지 않는다.

**예외(2026-10-16, 사용자 확정)**: `initScrollSpy()`가 `.is-scrolled` 토글 시
`window.Motion.animate()`(motion.dev, CDN 예외는 `.claude/rules/01-project.md` 참고)로
`top`/`left`/`right`/`border-radius`/`backdrop-filter`를 FLIP 방식으로 보간한다 —
CSS 전환을 `transform`/`opacity`로만 제한하는 `02-css.md` 애니메이션 규칙과 별개로,
레이아웃에 영향을 주는 속성이라 JS 라이브러리로 처리한 단일 예외다. class 전환 자체는
CSS가 그대로 담당해 Motion 로드 실패 시에도 즉시 전환되며, `prefers-reduced-motion`일
때는 `window.Motion.animate()` 호출 자체를 건너뛴다(CSS의 전역 reduced-motion 블록은
WAAPI 애니메이션을 제어하지 않으므로 JS에서 별도 체크 필요).
