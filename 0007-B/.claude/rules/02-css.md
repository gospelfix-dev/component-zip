# CSS 규칙

## 파일 분리

`assets/css/`는 역할별 4파일이다. `index.html`이 이 순서로 로드한다. 새 규칙을 추가할 때
`style.css`에 다시 섞어 넣지 않는다.

1. `init.css` — 브라우저 기본값 리셋만
2. `fonts.css` — `@font-face` 선언만 (Pretendard 9웨이트, 유일한 서체)
3. `animations.css` — `@keyframes` 전용, 컴포넌트 전용이어도 예외 없이 여기
4. `style.css` — `:root` 토큰 + 컴포넌트. 미디어쿼리는 파일 끝에 몰지 않고 **해당 컴포넌트
   블록 바로 뒤에** 붙인다.

## 명명

BEM이 아니라 **의미 기반 클래스명**을 쓴다 (`.feature-row`, `.seal-badge`, `.revenue-figure`
식). 블록 이름을 바꿀 때는 `index.html`의 마크업, `assets/js/script.js`의 `querySelector`/
`fill()` 대상 id, `assets/css/style.css`를 **동시에** 수정한다 — id 하나만 어긋나도 화면이
조용히 비어 보이는 실패 모드가 생긴다.

## 값 작성

- **색상은 반드시 `:root` 토큰을 쓴다.** 컴포넌트 안에 하드코딩한 헥사값을 넣지 않는다.
  주 포인트 컬러는 `--bronze` 계열(진하게/틴트) 하나뿐 — 새 강조색 계열을 추가하지 않는다.
- **`--red`는 범위가 제한된 예외 토큰이다.** `.seal-badge`(豚 배지)와 `.revenue-figure`
  (03 수익분석 매출 숫자) **두 곳에만** 쓴다. 그 외 위치(버튼·링크·장식)에 쓰지 않는다.
  ```bash
  grep -n "var(--red)" assets/css/style.css   # 위 두 셀렉터 블록 외에 나오면 위반
  ```
  단, `.wave-rule`/`.wave-rule--invert`의 인라인 SVG data-URI `stroke` 값은 `var()`를 쓸 수
  없는 리소스 컨텍스트라 hex를 직접 적는 유일한 예외다 — `:root`의 `--bronze`/`--bronze-tint`
  값과 반드시 수동으로 동기화한다.
- **크기는 `clamp()`로 반응형 처리한다.** 미디어쿼리로 폰트 크기를 계단식 변경하지 않는다.
- **`font-size`는 12px 이상 120px 이하만 허용한다.** 러닝헤드 라벨("01 ·
  COMPETITIVENESS")·소형 태그류는 12~13px + `letter-spacing`이 카탈로그 장르 문법이라
  18px 하한이 맞지 않는다. 이 범위 자체가 전역 규칙이며 요소별 개별 예외를 만들지 않는다.
- **모서리는 용도별 4단 체계다.** 임의로 섞지 않는다.
  - `--radius-badge`(6px) — 豚 배지, 트러스트 배지, 인풋, 04 헤더 행
  - `--radius-card`(14px) — 사진 프레임, 카드, 문의 모달
  - `--radius-pill`(999px) — 버튼
  - `--radius-circle`(50%) — **셀프바·고기 사진 원형 크롭 전용**. 배지·버튼에 쓰지 않는다.
- **이탤릭을 쓰지 않는다.** 산세리프 이탤릭은 이 프로젝트의 레퍼런스 어디에도 없는 관습이다.

## 애니메이션

- 전환은 `transform`과 `opacity`만 쓴다. `width`/`height`/`top`을 전환하지 않는다.
- **무한 반복 애니메이션(팝/샤인/블링크/스냅류)을 만들지 않는다.** 스크롤 리빌은 전부
  1회 재생(`IntersectionObserver` 후 필요시 `unobserve`)만 허용한다 — 진입할 때마다
  반복 재생되는 효과(A의 영수증 리빌, 자동 오픈 모달)는 B의 "절제된 인터랙션" 원칙 위반이다.
- 03 수익분석의 매출 숫자 카운트업(`animateCount`)도 1회성 예외로 허용된 장치다 — 정보를
  가리지 않고(목표값은 처음부터 `data-count-to`에 존재) 시각적 카운팅만 진행되므로 원칙과
  충돌하지 않는다.
- **새 애니메이션을 추가하면 `prefers-reduced-motion` 블록에도 반드시 예외를 추가한다.**

## 반응형 분기점

단일 브레이크포인트 `max-width:1024px`만 쓴다. 새 값을 만들지 않는다.

| 폭 | 레이아웃 |
|---|---|
| > 1024px | PC (그리드/2단 레이아웃) |
| ≤ 1024px | 모바일 (1열 스택, 햄버거 nav) |
