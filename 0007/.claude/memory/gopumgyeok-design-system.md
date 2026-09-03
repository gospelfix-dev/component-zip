---
name: gopumgyeok-design-system
description: "고품격대패 랜딩(0007)의 확정 디자인 시스템 — 골드/블랙 토큰, Pretendard 단독, 웨이브 디바이더, 5섹션 구조"
metadata: 
  node_type: memory
  type: project
  originSessionId: 64490a38-09ba-439e-83a5-66505594f155
  modified: 2026-09-03T00:00:00.000Z
---

`component-zip/0007/` 랜딩([[gopumgyeok-landing-project]])의 **확정된** 디자인 규칙. 임의로 바꾸지 말 것.

**컬러 토큰** (`assets/css/style.css` `:root`)
```
--bg:#0E0C0A  --bg-card:#18140F  --bg-card-2:#211B14
--gold:#C9A227  --gold-light:#E8CD7A
--text:#F3EEE2  --text-dim:#B3A995  --muted:#7A7264  --line:#332C22
--red:#A6291F   /* HACCP 배지·豚 태그에서 채택한 강조 레드 */
```

**폰트**: Pretendard 단일 패밀리(100~900, 9웨이트). Song Myung 등 세리프는 **사용자가 명시적으로 요청해 완전 제거**했으므로 다시 넣지 말 것.
2026-09-02부터 `assets/fonts/Pretendard-*.woff2` 로 **self-host** 한다(`assets/css/fonts.css`
`@font-face`). 예전엔 `index.html`이 `fonts.googleapis.com/css2?family=Pretendard…`를 썼는데
Google Fonts에 Pretendard가 없어 **HTTP 400**이었다(2026-09-01 확인, 이제는 해결됨 — 이 사실은
과거 이력으로만 남겨둔다). `01 경쟁력` 포스터 타이틀(`.comp-title`)만 예외로
`RixYeoljeongdo`(`assets/fonts/RixYeoljeongdo.woff2`)를 쓴다 — 다른 곳으로 확장하지 말 것.

**시그니처 장치**: 웨이브(wave) SVG 디바이더 = 카탈로그의 "물결형 인테리어" 브랜드 정체성을 섹션 구분선으로 시각화한 것. 영수증 카드는 [[gopumgyeok-receipt-card]] 참고.

**5섹션 구조** (nav 5개 = 섹션 5개, `scrollIntoView` 스무스 스크롤)
1. `#competitiveness` 경쟁력 — 3대 핵심경쟁력 카드 + 트러스트 스트립(HACCP·7호점·25종+·ECO)
2. `#menu` 메뉴 — 고기 9종 그리드 + 셀프바 25종 원형 그리드
3. `#profit` 수익분석 — 영수증 롤 카드 3개
4. `#cost` 창업비용 — 항목표(가맹비/교육비/보증금/인테리어/설비/초도물품), 금액 미확보 상태
5. `#location` 매장위치 — 매장 3곳 Swiper 캐러셀(2026-09-02부터. 정적 3열 그리드에서 전환) + 문의폼.
   이 프로젝트 유일의 외부 JS 의존성(jsdelivr CDN `swiper@11`). 배경은 매장 개업식 사진
   (`assets/imgs/bg.png`) 블러 처리, 컨트롤 아이콘은 Lucide SVG 인라인. 섹션 자체도 이때 흰
   배경 → 어두운 배경으로 바뀌어, 이제 전 섹션이 어두운 톤이다(흰 배경 섹션 없음)

히어로는 nav에 포함되지 않는 인트로 섹션. **2026-09-01에 대대적으로 비워냈다** — 자세한 구조와 패럴랙스는 [[gopumgyeok-hero-parallax]] 참고.
현재 남은 것은 5개뿐: 배경(`meat_platter.jpg` 풀블리드) + 그라디언트 오버레이 + 중앙 스택(아이캐치 문구 → 골드 그라디언트 워드마크 → 서브카피 → CTA 버튼 2개 → "창업문의 1877-1960" 알약 배지). 폰트 크기는 2026-09-02부터 프로젝트 전역 규칙(18~96px)이 적용됐다 — [[gopumgyeok-landing-project]] 또는 `docs/design.md` Typography 참고.

**`.hero-wordmark`는 이 96px 규칙의 유일한 예외다.** 원래 132px → 96px로 줄었다가(2026-09-02),
2026-09-03에 사용자가 "타이틀을 더 크게" 요청 → 96px 상한을 지키며 임팩트를 키우는 대안(letter-spacing/그림자 등)을 먼저 제안했으나 사용자가 명시적으로 96px 예외를 선택 →
`docs/design.md`에 남아있던 "132px→96px" 이력을 근거로 원래 값 132px로 복원. 현재 `clamp(72px,15vw,132px)`.
같이 확인할 것: `wordmarkIntro` 팝 인트로는 원래 1회성(`both`, 애니메이션 없음 반복)이었는데
2026-09-03에 "6초마다 반복" → 다시 "3초가 너무 길다"는 피드백으로 최종 **3초 주기 무한 반복**
(`animation: wordmarkIntro 3s … infinite`)으로 바뀌었다. 팝 자체의 체감 속도(약 0.85s)는 유지하고
나머지 구간은 scale(1)/opacity:1로 정지해 있다가 주기마다 다시 팝인다.
다른 요소에 96px 예외를 유추 확장하지 말 것 — [[gopumgyeok-font-size-rule-exception]] 참고.

**히어로에서 삭제된 것 — 사용자가 하나씩 지목해 없앴다. 되살리지 말 것:**
- `.hero-bottom-photos` (하단 좌우 고기 사진, radial 마스크 페이드)
- `.hero-tag-float` (좌측 "#프리미엄 대패삼겹살 / 물결형 인테리어 시그니처")
- `.hero-underline` (워드마크 아래 붉은 SVG 웨이브) — 이 요소가 갖고 있던 아래 여백 28px은 `.hero-wordmark`로 옮겼다
- `.hero-callout` (골드 배지 "왕십리 · 천호 · 시흥은계 3개 매장 운영중!")
- 히어로 직후의 `.wave` 디바이더 1개 (3개 중 첫 번째. 나머지 2개는 남아 있다)
- "왕십리/천호/시흥은계 오픈일" 하단 스트립 (05 섹션과 중복)

`.hero-badge-phone`은 **삭제가 아니라 이동**이다 — 우상단 절대배치(헤더 "창업 상담" 버튼에 가려졌었다)에서 중앙 스택 맨 아래로 옮겨 `display:inline-flex` + 부모의 `text-align:center`로 정렬한다.

**콘텐츠 데이터**: 2026-09-01부터 `data/content.json` 이 단일 진실 공급원이다(경쟁력·트러스트·고기·셀프바·수익·창업비용·매장·연락처). `index.html` 은 빈 컨테이너만 갖고 `assets/js/script.js` 가 `fetch` 로 채운다. **JS 안에 `FALLBACK` 사본을 두지 않았다** — 그래서 `file://` 더블클릭으로는 콘텐츠가 안 뜬다(안내 문구가 대신 표시됨). 로컬 서버로 볼 것.

**JS 구조** (`assets/js/script.js`, `defer`): `boot()` 가 JSON 을 읽어 `renderAll()` 로 8개 영역을 그린 뒤 `initReceiptReveal()` 을 붙인다. 데이터와 무관한 `initSmoothScroll()` / `initMobileNav()`(1024px↓ 햄버거) / `initScrollSpy()` / `initInquiryForm()`(목업) 은 fetch 전에 먼저 붙는다.

**CSS 파일 분리 + 반응형 브레이크포인트 (2026-09-02 확정)**
`assets/css/` 는 역할별 4개 파일이고 `index.html` 이 이 순서로 로드한다:
`init.css`(리셋: `*`/`html`/`body`/`img`/`a`/`ul,li`) → `fonts.css`(`@font-face` — Pretendard
9웨이트 + RixYeoljeongdo) → `animations.css`(`@keyframes` 전부, 컴포넌트 전용이어도 예외 없음) →
`style.css`(토큰 + 컴포넌트, 위 세 파일을 이름으로만 참조). 새 리셋/폰트/키프레임을 추가할 때
`style.css` 에 다시 섞어 넣지 말 것.
반응형은 **`@media (max-width:1024px)` 하나만** 쓴다 — 1024px 초과 PC / 1024px 이하 모바일의
2단계 구조다. 이전엔 900(nav)/820(카드 그리드 다수)/700(고기 그리드·창업비용 표) 세 값이
컴포넌트마다 따로 쓰였는데 전부 1024px 로 통일했다. 새 반응형 규칙도 이 값만 재사용할 것 —
`.hero-center{ max-width:900px; }` 처럼 브레이크포인트가 아니라 순수 레이아웃 폭 제한으로 쓰인
값은 이 통일 대상이 아니다. 자세한 내용은 `docs/design.md` Layout 절 참고.
