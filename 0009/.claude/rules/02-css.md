# CSS 규칙

## 파일 분리

`assets/css/`는 역할별 4파일이다. `index.html`이 이 순서로 로드한다. 새 규칙을 추가할 때
`style.css`에 다시 섞어 넣지 않는다.

1. `init.css` — 브라우저 기본값 리셋만
2. `fonts.css` — `@font-face` 선언만 (Noto Sans KR 5웨이트: 400/500/700/800/900, 유일한 서체)
3. `animations.css` — `@keyframes` 전용, 컴포넌트 전용이어도 예외 없이 여기
4. `style.css` — `:root` 토큰 + 컴포넌트. 미디어쿼리는 파일 끝에 몰지 않고 **해당 컴포넌트
   블록 바로 뒤에** 붙인다.

CSS 섹션 헤더 주석에 클래스 prefix를 슬래시로 나열하지 않는다(예: `.menu-*/.store-*`) —
`*/`가 주석을 조기 종료시켜 뒤따르는 규칙 전체가 조용히 사라지는 함정이 있다. 여러 prefix를
적을 땐 쉼표로 구분한다(`.menu-*, .store-* 계열`).

## 명명

BEM이 아니라 **의미 기반 클래스명**을 쓴다 (`.menu-row`, `.review-card`, `.before-after-pair`
식). 블록 이름을 바꿀 때는 `index.html`의 마크업, `assets/js/script.js`의
`getElementById`/`fill()` 대상 id, `assets/css/style.css`를 **동시에** 수정한다 — id 하나만
어긋나도 화면이 조용히 비어 보이는 실패 모드가 생긴다.

## 값 작성 (`docs/02~09`가 정본, 아래는 적용 규칙 요약)

- **색상은 반드시 `:root` 토큰을 쓴다.** 컴포넌트 안에 하드코딩한 헥사값을 넣지 않는다.
  토큰은 `ink`/`gray`/`surface`/`surfaceHover`/`lime`/`limeHover`/`tint`/`white` 8개뿐이다
  (`docs/02-colors.md`). **포인트 컬러는 `lime` 하나만** 쓴다 — 새 강조색 계열을 추가하지
  않는다.
  ```bash
  grep -n "#[0-9A-Fa-f]\{3,6\}" assets/css/style.css   # :root 선언부 외에 나오면 위반
  ```
- **`lime`은 밝은 색이라 글자·아이콘색으로 쓰지 않는다.** `lime`/`limeHover` 배경 위
  글자는 반드시 `ink`다(흰 배경 위 `lime` 대비는 약 1.1:1이라 텍스트로 쓰면 읽을 수
  없다). 2026-10-16 사용자가 포인트 컬러를 `rose`(#A8434F)에서 `lime`(#EFF382)으로
  교체하면서 예약 버튼 글자색을 `white`→`ink`, 태그 글자색을 `rose`→`ink`로 함께
  바꿨다 — 새 `lime` 기반 컴포넌트를 추가할 때도 이 규칙을 그대로 따른다.
- **크기는 `clamp()`로 반응형 처리한다.** 미디어쿼리로 폰트 크기를 계단식 변경하지 않는다.
  단, 기준값 자체는 `docs/03-typography.md`의 표(H1 32/40·H2 22/30·Body 16/26·Button
  15/24·Caption 13/20)를 벗어나지 않는다.
  - **예외**: `.hero-content h1`/`.hero-content p`(2026-10-16, 사용자 확정). 히어로
    헤드라인·설명문만 각각 `clamp(28px, 6.5vw, 44px)`/52, `clamp(16px, 3.2vw, 18px)`/28로
    확대했다 — 히어로의 시각적 임팩트를 키워달라는 명시적 요청에 따른 예외이며, H2 이하
    다른 헤딩이나 다른 섹션의 Body 텍스트에는 확장하지 않는다.
- **`font-size`는 12px 이상 120px 이하만 허용한다.**
- **모서리는 용도별 2단 체계다.** 임의로 섞지 않는다(`docs/05-radius.md`).
  - `--radius-base`(6px) — 버튼, 카드, 이미지(placeholder 포함)
  - `--radius-pill`(16px 이상) — 태그만
- **`border`와 `box-shadow`를 쓰지 않는다.** 레이어 구분은 배경색 차이(`white` ↔
  `surface`)로만 한다(`docs/06-elevation.md`). 그림자·그라데이션·테두리 카드를 추가하지
  않는다.
  - **예외**: `.site-header`(2026-10-16, 사용자 확정). 헤더가 `position: fixed`
    플로팅으로 바뀌면서 흰 배경 섹션 위로 스크롤될 때 배경색 차이만으로는 경계가 전혀
    보이지 않는 상황이 생겨, `border-bottom: 0.5px solid var(--color-surface-hover)`를
    예외로 추가했다(흰 배경 위에서도 보이도록 `white`가 아닌 `surface-hover` 톤 사용).
    배경색 차이로 구분 가능한 다른 컴포넌트에는 이 예외를 확장하지 않는다.
- **이탤릭·장식 폰트를 쓰지 않는다.** Noto Sans KR 단일 서체, 404/500/700 웨이트로만
  위계를 만든다(`docs/03-typography.md`). 레퍼런스 이미지(LUMINA, Skin—clean)의 세리프
  이탤릭 헤드라인은 이 프로젝트의 확정된 "하지 말 것"과 충돌하므로 따라 하지 않는다.
- **폼 범위 셀렉터는 특이성 역전에 주의한다.** `#reservationForm input` 처럼 폼 범위 일반
  셀렉터를 걸 때, 체크박스 같은 시각적으로 다르게 보여야 하는 특수 입력이 같은 셀렉터에
  걸려 레이아웃이 깨질 수 있다 — 새 입력 요소를 추가할 땐 처음부터 상위 셀렉터를 포함해
  특이성을 맞춰 작성한다.

## 애니메이션

- 전환은 `transform`과 `opacity`만 쓴다. `width`/`height`/`top`을 전환하지 않는다.
  색 전환이 필요하면 `background-color 0.15s` 정도의 짧은 트랜지션만 쓴다
  (`docs/01-style-reference.md` 모션 원칙).
- **무한 반복 애니메이션을 만들지 않는다.** 이 프로젝트에는 승인된 무한 반복 예외가
  **없다** — 형제 폴더(0007-B/0008)의 마퀴 티커, 히어로 Swiper autoplay, 커스텀 커서
  회전 같은 장치를 그대로 가져오지 않는다. 새로 무한 반복이 필요하다고 판단되면 반드시
  사용자에게 먼저 확인한다.
- 스크롤 리빌은 전부 1회 재생(`IntersectionObserver` 후 `unobserve`)만 허용한다.
- **새 애니메이션을 추가하면 `prefers-reduced-motion` 블록에도 반드시 예외를 추가한다.**

## 반응형 분기점

단일 브레이크포인트 `max-width:1024px`만 쓴다(`docs/08-guidelines.md`). 새 값을 만들지
않는다.

| 폭 | 레이아웃 |
|---|---|
| > 1024px | PC (히어로 2단, 하단 고정 바 노출) |
| ≤ 1024px | 모바일 (1열 스택, 햄버거 nav, 하단 고정 바 유지) |
