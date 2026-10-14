# CSS 규칙

## 파일 분리

`assets/css/`는 역할별 4파일이다. `index.html`이 이 순서로 로드한다. 새 규칙을 추가할 때
`style.css`에 다시 섞어 넣지 않는다.

1. `init.css` — 브라우저 기본값 리셋만
2. `fonts.css` — `@font-face` 선언만 (GmarketSans 3웨이트, 유일한 서체)
3. `animations.css` — `@keyframes` 전용, 컴포넌트 전용이어도 예외 없이 여기
4. `style.css` — `:root` 토큰 + 컴포넌트. 미디어쿼리는 파일 끝에 몰지 않고 **해당 컴포넌트
   블록 바로 뒤에** 붙인다.

CSS 섹션 헤더 주석에 클래스 prefix를 슬래시로 나열하지 않는다(예: `.menu-*/.store-*`) —
`*/`가 주석을 조기 종료시켜 뒤따르는 규칙 전체가 조용히 사라지는 함정이 있다. 여러 prefix를
적을 땐 쉼표로 구분한다(`.menu-*, .store-* 계열`).

## 명명

BEM이 아니라 **의미 기반 클래스명**을 쓴다 (`.trust-card`, `.process-step`, `.revenue-figure`
식). 블록 이름을 바꿀 때는 `index.html`의 마크업, `assets/js/script.js`의
`getElementById`/`fill()` 대상 id, `assets/css/style.css`를 **동시에** 수정한다 — id 하나만
어긋나도 화면이 조용히 비어 보이는 실패 모드가 생긴다.

## 값 작성

- **색상은 반드시 `:root` 토큰을 쓴다.** 컴포넌트 안에 하드코딩한 헥사값을 넣지 않는다.
  포인트 컬러 축은 `--red`(CTA·매출/신뢰지표 숫자)와 `--yellow`(배지·세컨더리) 둘뿐이다 —
  새 강조색 계열을 추가하지 않는다.
  ```bash
  grep -n "#[0-9A-Fa-f]\{3,6\}" assets/css/style.css   # :root 선언부 외에 나오면 위반
  ```
- **크기는 `clamp()`로 반응형 처리한다.** 미디어쿼리로 폰트 크기를 계단식 변경하지 않는다.
- **`font-size`는 12px 이상 120px 이하만 허용한다.** 이 범위 자체가 전역 규칙이며 요소별
  개별 예외를 만들지 않는다.
- **모서리는 용도별 4단 체계다.** 임의로 섞지 않는다.
  - `--radius-badge`(8px) — 배지, 인풋, 비용표 헤더 행, 동의 체크박스
  - `--radius-card`(16px) — 카드, 문의 모달(바텀시트)
  - `--radius-pill`(999px) — 버튼, 메뉴/비용 탭
  - `--radius-circle`(50%) — 메뉴 placeholder 원, 프로세스 단계 아이콘 원, 모바일 FAB
    버튼 전용. 그 외 배지·버튼에 쓰지 않는다.
- **이탤릭을 쓰지 않는다.** 산세리프 이탤릭은 이 프로젝트의 레퍼런스 어디에도 없는 관습이다.
- **폼 범위 셀렉터는 특이성 역전에 주의한다.** `#inquiryForm input` 처럼 폼 범위 일반
  셀렉터를 걸 때, 체크박스(`.form-agree input`) 같은 시각적으로 다르게 보여야 하는 특수
  입력이 같은 셀렉터에 걸려 레이아웃이 깨질 수 있다 — 새 입력 요소를 추가할 땐 처음부터
  `#inquiryForm .form-agree` 식으로 상위 셀렉터를 포함해 특이성을 맞춰 작성한다.

## 애니메이션

- 전환은 `transform`과 `opacity`만 쓴다. `width`/`height`/`top`을 전환하지 않는다.
  **유일한 예외**: `.process-connector-arrow-wrap`(창업 프로세스 07→멘트 칸 화살표
  커넥터)의 `clip-path:inset()` 리빌(`@keyframes connectorWipeIn`, `assets/css/
  animations.css`). 2026-10-14, 막대+화살촉이 합쳐진 복합 `clip-path:polygon()` 도형에
  row1/vert 와 같은 `scaleX(0)→1` 리빌을 썼더니 기하 좌표가 통째로 곱셈 압축되면서
  애니메이션 도중 모양이 일그러지는 문제가 실제로 보고됐다(모션을 늦춘 뒤 더 또렷하게
  드러남) — 단순 사각 막대(row1/vert)는 scaleX/scaleY 로 늘려도 왜곡이 없지만, 복합
  폴리곤은 transform 만으로 왜곡 없이 "그려내는" 효과를 낼 방법이 없다. 대신 wrap 을
  `overflow:hidden` 마스크로 두고 안쪽 도형은 `position:absolute`로 실제 크기 그대로
  고정한 채 마스크의 `clip-path:inset()` 왼쪽 값만 줄여 가려진 영역만 드러낸다 — 도형
  자체는 한 번도 scale 되지 않는다. 새로운 복합 폴리곤 리빌을 또 추가해야 한다면 이
  패턴을 재사용할 것(단, 이 예외를 "clip-path 전환 전면 허용"으로 확대 해석하지 않는다).
  **함정**: `clip-path:inset(...)`로 완전히 접힌 상태(예: `inset(0 0 0 100%)`)를
  `.reveal`의 정적(트리거 전) 규칙에 두면 Chrome의 IntersectionObserver 가 그 요소를
  "교차 안 함"으로 판정해 `is-visible` 이 영원히 안 붙는 교착 상태가 생긴다(직접 관찰로
  확인됨 — `transform:scaleX(0)` 정적 상태는 이 문제가 없었다). clip-path 의 접힌
  시작값은 반드시 `@keyframes`의 `from{}` 안에서만 선언하고, 정적 `.reveal` 규칙에는
  `opacity:0`만 둔다.
- **무한 반복 애니메이션(팝/샤인/블링크/스냅류)을 만들지 않는다.** 스크롤 리빌은 전부
  1회 재생(`IntersectionObserver` 후 `unobserve`)만 허용한다.
- 신뢰지표/매출증명의 숫자 카운트업(`animateCount`)도 1회성 예외로 허용된 장치다 — 정보를
  가리지 않고(목표값은 처음부터 `data-count-to`에 존재) 시각적 카운팅만 진행되므로 원칙과
  충돌하지 않는다.
- **승인된 무한 반복 예외 세 가지.** 모두 사용자가 명시적으로 요청·확인한 뒤 추가됐다 —
  이 예외들이 "무한 반복 전면 허용"으로 확대 해석되지 않는다. 새로운 무한 반복 요소를
  **추가로** 만들 때는 반드시 사용자에게 먼저 확인할 것.
  1. 브랜드 마퀴 티커(`.marquee-track`, `@keyframes marquee-scroll`) — 2026-10-14
     레퍼런스(efully.co.kr)를 보여주며 요청. 배포 전 회귀 스윕의
     `grep infinite assets/css/*.css`는 이 줄과 아래 3번 줄, 총 두 줄만 나오면 정상이다.
  2. 히어로 비주얼 사진 전환(`.hero-swiper`, Swiper `autoplay` + `@keyframes heroPhotoUp`)
     — 2026-10-14 형제 폴더 0007-B의 히어로 "고기 슬라이드" 효과를 그대로 가져와 달라는
     요청(autoplay 포함 여부까지 확인받음). `heroPhotoUp` 키프레임 자체는 `infinite`를
     쓰지 않는 1회성 재생이라 위 grep 체크에는 걸리지 않는다 — 반복은 Swiper의
     `autoplay`(JS, `assets/js/script.js`의 `initHeroSwiper()`)가 슬라이드 전환마다
     클래스를 토글하는 방식이다.
  3. 커스텀 커서 김밥 뱃지 회전(`.custom-cursor-badge`, `@keyframes cursorBadgeSpin`,
     3s linear) — 2026-10-14 "마우스 커서 김밥이 360도 계속 무한으로 돌았으면 좋겠다"는
     명시적 요청. 부모 `.custom-cursor`가 아니라 자식 뱃지에만 건다 — 부모는
     `initCustomCursor()`가 매 mousemove 마다 `transform:translate()`를 인라인으로
     덮어써 커서를 따라다니게 하므로, 회전을 부모에 걸면 위치 추적이 깨진다.
- **새 애니메이션을 추가하면 `prefers-reduced-motion` 블록에도 반드시 예외를 추가한다.**

## 반응형 분기점

단일 브레이크포인트 `max-width:1024px`만 쓴다. 새 값을 만들지 않는다.

| 폭 | 레이아웃 |
|---|---|
| > 1024px | PC (그리드/다단 레이아웃, 데스크톱 하단 고정 상담바 노출) |
| ≤ 1024px | 모바일 (1~2열 스택, 햄버거 nav, 모바일 FAB 노출·하단 고정 바 숨김) |
