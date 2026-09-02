---
name: gopumgyeok-design-system
description: "고품격대패 랜딩(0007)의 확정 디자인 시스템 — 골드/블랙 토큰, Pretendard 단독, 웨이브 디바이더, 5섹션 구조"
metadata: 
  node_type: memory
  type: project
  originSessionId: 64490a38-09ba-439e-83a5-66505594f155
  modified: 2026-09-01T07:19:32.032Z
---

`component-zip/0007/` 랜딩([[gopumgyeok-landing-project]])의 **확정된** 디자인 규칙. 임의로 바꾸지 말 것.

**컬러 토큰** (`assets/css/style.css` `:root`)
```
--bg:#0E0C0A  --bg-card:#18140F  --bg-card-2:#211B14
--gold:#C9A227  --gold-light:#E8CD7A
--text:#F3EEE2  --text-dim:#B3A995  --muted:#7A7264  --line:#332C22
--red:#A6291F   /* HACCP 배지·豚 태그에서 채택한 강조 레드 */
```

**폰트**: Pretendard 단일 패밀리(400~900). Song Myung 등 세리프는 **사용자가 명시적으로 요청해 완전 제거**했으므로 다시 넣지 말 것.
로드처는 **jsdelivr**여야 한다 — `index.html`이 쓰던 `fonts.googleapis.com/css2?family=Pretendard…`는 Google Fonts에 Pretendard가 없어 **HTTP 400**이다(2026-09-01 실제 요청으로 확인). 형제 폴더 `0004`/`0005`와 같이 `https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard-dynamic-subset.min.css`를 쓴다. 맥에서는 `-apple-system` 폴백이 비슷하게 보여 육안으로 놓치기 쉽다.

**시그니처 장치**: 웨이브(wave) SVG 디바이더 = 카탈로그의 "물결형 인테리어" 브랜드 정체성을 섹션 구분선으로 시각화한 것. 영수증 카드는 [[gopumgyeok-receipt-card]] 참고.

**5섹션 구조** (nav 5개 = 섹션 5개, `scrollIntoView` 스무스 스크롤)
1. `#competitiveness` 경쟁력 — 3대 핵심경쟁력 카드 + 트러스트 스트립(HACCP·7호점·25종+·ECO)
2. `#menu` 메뉴 — 고기 9종 그리드 + 셀프바 25종 원형 그리드
3. `#profit` 수익분석 — 영수증 롤 카드 3개
4. `#cost` 창업비용 — 항목표(가맹비/교육비/보증금/인테리어/설비/초도물품), 금액 미확보 상태
5. `#location` 매장위치 — 매장 3곳 카드 + 문의폼

히어로는 nav에 포함되지 않는 인트로 섹션. **2026-09-01에 대대적으로 비워냈다** — 자세한 구조와 패럴랙스는 [[gopumgyeok-hero-parallax]] 참고.
현재 남은 것은 5개뿐: 배경(`meat_platter.jpg` 풀블리드) + 그라디언트 오버레이 + 중앙 스택(아이캐치 문구 → 골드 그라디언트 워드마크 `clamp(52px,11vw,96px)` → 서브카피 → CTA 버튼 2개 → "창업문의 1877-1960" 알약 배지). 폰트 크기는 2026-09-02부터 프로젝트 전역 규칙(18~96px)이 적용됐다 — [[gopumgyeok-landing-project]] 또는 `docs/design.md` Typography 참고.

**히어로에서 삭제된 것 — 사용자가 하나씩 지목해 없앴다. 되살리지 말 것:**
- `.hero-bottom-photos` (하단 좌우 고기 사진, radial 마스크 페이드)
- `.hero-tag-float` (좌측 "#프리미엄 대패삼겹살 / 물결형 인테리어 시그니처")
- `.hero-underline` (워드마크 아래 붉은 SVG 웨이브) — 이 요소가 갖고 있던 아래 여백 28px은 `.hero-wordmark`로 옮겼다
- `.hero-callout` (골드 배지 "왕십리 · 천호 · 시흥은계 3개 매장 운영중!")
- 히어로 직후의 `.wave` 디바이더 1개 (3개 중 첫 번째. 나머지 2개는 남아 있다)
- "왕십리/천호/시흥은계 오픈일" 하단 스트립 (05 섹션과 중복)

`.hero-badge-phone`은 **삭제가 아니라 이동**이다 — 우상단 절대배치(헤더 "창업 상담" 버튼에 가려졌었다)에서 중앙 스택 맨 아래로 옮겨 `display:inline-flex` + 부모의 `text-align:center`로 정렬한다.

**콘텐츠 데이터**: 2026-09-01부터 `data/content.json` 이 단일 진실 공급원이다(경쟁력·트러스트·고기·셀프바·수익·창업비용·매장·연락처). `index.html` 은 빈 컨테이너만 갖고 `assets/js/script.js` 가 `fetch` 로 채운다. **JS 안에 `FALLBACK` 사본을 두지 않았다** — 그래서 `file://` 더블클릭으로는 콘텐츠가 안 뜬다(안내 문구가 대신 표시됨). 로컬 서버로 볼 것.

**JS 구조** (`assets/js/script.js`, `defer`): `boot()` 가 JSON 을 읽어 `renderAll()` 로 8개 영역을 그린 뒤 `initReceiptReveal()` 을 붙인다. 데이터와 무관한 `initSmoothScroll()` / `initMobileNav()`(900px↓ 햄버거) / `initScrollSpy()` / `initInquiryForm()`(목업) 은 fetch 전에 먼저 붙는다.
