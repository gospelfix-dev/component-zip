# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

# 고품격대패 — 프랜차이즈 창업 랜딩페이지 (시안B — 카탈로그 라이트 / Ivory & Bronze Catalogue)

빌드 도구 없이 동작하는 단일 페이지 랜딩. `index.html` + `assets/css`(역할별 4파일 —
`init.css`/`fonts.css`/`animations.css`/`style.css`) + `assets/js`(스크립트) +
`assets/fonts`(Pretendard 웹폰트) + `assets/imgs`(이미지) + `data/content.json`(콘텐츠)이
전부다.

**형제 폴더 `0007`이 시안A다.** 같은 클라이언트(고품격대패)·같은 콘텐츠 계약
(`data/content.json` 스키마와 실제 수치가 동일)이지만, 팔레트 축이 다르다 — A는 다크
차콜(`#0E0C0A`) + 골드/레드 + 영수증·티켓 스큐어모피즘("프리미엄 정육점" 무드), B는
아이보리/베이지 + 브론즈골드 + 커피브라운("카탈로그 라이트" 무드)이다. 둘 다 클라이언트가
실제로 인쇄 배포한 카탈로그(`고품격대패_카달로그_최종_인쇄.pdf`)의 서로 다른 실측 페이지를
근거로 삼는다 — A는 표지의 다크+골드, B는 내지의 라이트+브론즈+커피. **A를 참고하되 그대로
베끼지 않는다.**

`0007-B`는 `component-zip` 저장소의 독립 폴더이며 형제 폴더에 의존하지 않는다.

색상 토큰·타이포그래피 크기 표·컴포넌트별 규칙 같은 디자인 세부 값은 **`docs/design.md`**
가 정본이다 — 이 파일(CLAUDE.md)은 "왜 이렇게 짜여 있는지"를, `docs/design.md`는 "정확히
몇 px/몇 hex인지"를 다룬다.

**이 방향은 두 번째 재설계 결과다.** 첫 번째 B안("고품격저널/Butcher's Dossier" — 크림+
테라코타+세리프 매거진 문법)은 담당자가 조사 없이 창작한 컨셉이었다. 실제 브랜드 카탈로그
PDF와 3개 참고 사이트(귀한족발·더맛있는족발보쌈·치킨신드롬)를 학습한 뒤, 세리프·원형 잉크
스탬프·매거진 컬로폰 같은 요소가 실제 브랜드 언어와 무관한 창작이었음이 확인되어 지금의
방향으로 대체됐다. 아래 "되살리면 안 되는 것"에는 A안뿐 아니라 **이 직전 B안의 관습**도
포함된다 — 다음 세션이 실수로 그쪽으로 되돌아가지 않도록 주의할 것.

---

## 명령어

```bash
# 로컬 서버
python3 -m http.server 8765     # http://localhost:8765/index.html

# ⚠ file:// 로 더블클릭해 열면 data/content.json 이 CORS 로 막혀 콘텐츠가 안 나온다
#   (화면에 안내 문구가 뜬다). 반드시 위 로컬 서버로 볼 것.

# JSON 유효성
python3 -c "import json;json.load(open('data/content.json'));print('ok')"

# 헤드리스 스크린샷 (시각 검증)
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu \
  --hide-scrollbars --window-size=1440,3000 --virtual-time-budget=9000 \
  --screenshot=/tmp/shot.png "http://localhost:8765/index.html"

# 회귀 스윕 — 세리프/레드 스코프 (배포 전 필수)
grep -n "font-serif" assets/css/style.css index.html      # 0건이어야 함
grep -n "var(--red)" assets/css/style.css                  # .seal-badge, .revenue-figure 외에 없어야 함

# 에셋 참조 정합성 (참조하는데 없는 파일 찾기)
grep -ohE 'assets/[A-Za-z0-9_./-]+' index.html assets/css/*.css assets/js/*.js data/content.json | sort -u | \
  while read f; do [ -f "$f" ] || echo "MISSING: $f"; done
```

테스트 러너·린터·빌드는 없다. 검증 수단은 위 스크린샷과 육안 확인이 전부다.

**헤드리스 스크린샷으로 좁은 뷰포트(≲450px)를 검증할 때 주의**: 이 환경의 헤드리스 Chrome은
`position:fixed`+퍼센트/auto 폭 flex 컨테이너의 오른쪽 정렬 자식(예: 모바일 헤더의 햄버거
버튼, `.nav-logo` 안의 豚 배지)이 450px 미만 폭에서 전혀 안 그려지는 렌더링 결함이 있다(실제
브라우저 문제가 아니라 도구 결함으로 확인됨 —
`.claude/agent-memory/screenshot-verifier/headless-narrow-viewport-flex-bug.md` 참고). 모바일
요소가 안 보이면 먼저 이 결함을 의심하고, CSS를 억지로 고치지 말고 ≥1024px 폭 스크린샷으로
대체 검증할 것.

---

## 아키텍처

### 콘텐츠는 `data/content.json` 하나가 단일 진실 공급원

경쟁력·트러스트·고기 9종·셀프바 8종·수익 3개 매장·창업비용표·매장 카드·연락처가 전부 이
JSON에 있다. **문구나 이미지를 바꿀 일이 생기면 거의 항상 JSON만 고치면 된다.** 이번
재설계로 팔레트·모티프·클래스명은 전면 교체됐지만 **스키마와 실제 값은 A안과 동일하게
그대로 유지**됐다 — 콘텐츠 계약은 손대지 않는다.

`index.html`에는 각 자리에 빈 컨테이너(`data-content` 속성 + id)만 있고, `assets/js/script.js`가
`fetch`로 읽어 채운다. `FALLBACK` 사본을 JS에 두지 않는다 — 사본을 두면 JSON을 고쳐도
화면이 안 바뀌는 함정이 생긴다. `fetch` 실패 시(대개 `file://`로 연 경우) 해당 자리에
이유를 적어 보여준다. 정확한 스키마는 `.claude/rules/04-data-contract.md` 참고.

### JS는 렌더 1곳 + 인터랙션 여러 곳

```
DOMContentLoaded
 └─ boot()  데이터 무관 인터랙션 먼저 붙임 →
      data/content.json 을 fetch → renderAll() 로 8개 영역 렌더 →
      DOM 에 카드가 올라온 뒤에만 관찰 가능한 스크롤 리빌과 initStoreSwiper() 를 붙임
 ├─ initSmoothScroll()    [data-target] 클릭 → scrollIntoView + 모바일 메뉴 닫기
 ├─ initMobileNav()       #navToggle → .nav-open 토글
 ├─ initScrollSpy()       스크롤 40px 넘으면 헤더 .scrolled / rootMargin 으로 nav active 갱신
 ├─ initInquiryForm()     05 섹션 인라인 폼(#inquiryForm) submit 가로채 버튼 텍스트만 교체 (목업)
 ├─ initInquirySheet()    문의하기 모달(#inquirySheetBackdrop) — [data-open-inquiry] 클릭으로만
 │                        열린다. A안과 달리 섹션 진입 시 자동으로 열리지 않는다(아래 참고).
 ├─ initScrollReveal()    01/02/03/04 공용 1회성 스크롤 리빌 유틸(IntersectionObserver,
 │                        진입 시 .in-view 부여 후 unobserve). 03 수익분석 행에서는 같은
 │                        콜백 안에서 animateCount() 로 매출 숫자 카운트업도 함께 시작한다.
 └─ initStoreSwiper()     05 매장위치 Swiper 캐러셀 초기화 + 자동재생 타이머, syncCaption()
```

모듈 시스템(`import`/`type="module"`)을 쓰지 않는다 — 파일 하나에 전역 함수로 둔다.
ES6 문법(`const`/`let`, 화살표 함수, 템플릿 리터럴)은 자유롭게 쓴다.

### 절제된 인터랙션 원칙 — A안과 가장 크게 갈리는 지점

A안은 무한 반복 attention 애니메이션(워드마크 팝/샤인, 강조 키워드 블링크, 섹션 타이틀
스냅)과, 섹션을 드나들 때마다 반복 재생되는 영수증 펼침 애니메이션·자동 오픈 모달을 의도적
장치로 썼다. **B안은 정반대로 "절제된 인터랙션"이 컨셉의 핵심이다**:

- 스크롤 리빌은 전부 **1회 재생**(`initScrollReveal`, `IntersectionObserver` 후 `unobserve`).
- 03 수익분석의 매출 숫자 **카운트업**(`animateCount`)도 1회만 재생되고, `prefers-reduced-motion`
  이면 애니메이션 없이 즉시 최종값을 표시한다. 정보(목표값)는 처음부터 `data-count-to`에
  DOM 상 존재하므로 정보를 가리지 않는다 — 이 이유로 **3D 플립카드는 채택하지 않았다**
  (플립카드는 기본 상태에서 데이터를 가려 이 원칙과 충돌한다).
- 문의 모달(`initInquirySheet`)은 `[data-open-inquiry]` **클릭으로만** 연다. A안의
  `#menu` 섹션 진입 시 자동 오픈 로직은 가져오지 않는다.
- 화려한 그라디언트 샤인, 무한 블링크, 즉시 스냅 같은 CSS 무한 keyframe을 만들지 않는다.

이 원칙을 "심심해서 개선한다"는 이유로 되돌리지 않는다 — 컨셉 자체의 정의다.

### 채택한 실제 브랜드 모티프

카탈로그 PDF와 3개 참고 사이트를 조사한 결과 확정한 모티프다. 근거 없이 추가/제거하지 않는다.

- **豚 스탬프 배지(`.seal-badge`)** — 실제 로고의 돼지 한자 스탬프를 CSS로 재현한 것(새
  이미지 없이 `border-radius:var(--radius-badge)` 사각 배지 + `豚` 글자). `.nav-logo`,
  `.footer-logo`, 04 창업비용 "7호점 한정"(`.seal-tag`), 문의 모달 브랜드 표기 네 곳에 쓴다.
- **웨이브 헤어라인(`.wave-rule`/`.wave-rule--invert`)** — 카탈로그가 언급하는 실제 "물결형
  인테리어"를 얇은 반복 SVG 패턴으로 재현했다. A안의 풀블리드 SVG 곡선과는 스케일·색·구현
  방식이 전부 다르다(01 경쟁력 특집 리스트 아래, 푸터 상단).
- **확장 타임라인(`.store-timeline`, 05 매장위치, 2026-09-08 신규)** — 100chae.com·
  hyojadong.kr 벤치마크 조사 뒤 구조만 차용해 추가했다. `stores[].date`/`name`(신규 필드
  없음)을 가로 타임라인으로 보여줘 05 h2 카피 "확장을 증명하는 기록"을 뒷받침한다. 마커는
  원형이 아니라 `--radius-badge`(사각) — 원형은 셀프바·고기 전용 규칙, 다이아몬드 구분자는
  "정확히 2곳" 규칙이 있어 둘 다 재사용할 수 없었다.
- **Sticky CTA bar(`.sticky-cta`, 2026-09-08 신규)** — 100chae.com의 하단 고정 문의 폼바를
  참고했다. `.nav-cta`가 모바일에서 사라지는 공백을 메우는 정적 바(전화번호 +
  `[data-open-inquiry]`)로, 자동으로 열리거나 애니메이션되지 않아 "절제된 인터랙션" 원칙과
  충돌하지 않는다.
- **다이아몬드 점선 구분자(`.diamond-divider`)** — 카탈로그의 소제목 장식 문법. 01 트러스트
  그리드 위, 04 "7호점 한정" 문단 위 **두 곳에만** 쓴다 — 과다 사용은 원칙 위반이다.
- **원형 크롭 그리드** — 02 메뉴(고기)는 원형 + 두꺼운 검정 링(`.meat-frame`, "검정 원형
  접시" 재현), 셀프바는 원형 + 얇은 브론즈 링(`.selfbar-frame`)으로 링 색으로 구분한다.
- **금박 그라디언트 텍스트(`.gold-text`)** — `background-clip:text` 그라디언트, 반드시
  `color:var(--bronze)` fallback을 먼저 선언한다. 각 섹션 h2 강조어 6곳 + 히어로 카피 1곳.

### CSS는 4개 파일로 역할이 나뉘어 있고, 섹션별로 미디어쿼리가 붙어 있다

`index.html`은 `assets/css/init.css`(리셋) → `assets/css/fonts.css`(`@font-face`,
Pretendard 9웨이트만) → `assets/css/animations.css`(`@keyframes`, 컴포넌트 전용이어도 예외
없이 전부 여기) → `assets/css/style.css`(토큰 + 컴포넌트) 순으로 로드한다. 새 리셋/폰트/
키프레임 규칙을 추가할 때 `style.css`에 다시 섞어 넣지 않는다.

`style.css` 안에서는 각 컴포넌트 블록 바로 뒤에 해당 `@media`가 따라온다. 새 반응형 규칙도
파일 끝이 아니라 **해당 컴포넌트 옆에** 쓴다. **브레이크포인트는 `max-width:1024px` 하나만
쓴다.** 새 값을 만들지 않는다. 맨 끝의 `@media (prefers-reduced-motion: reduce)` 블록은
유지한다.

디자인 토큰은 `assets/css/style.css`의 `:root` — 아이보리/베이지 계열 3, 잉크 텍스트 계열
3, **주 포인트 컬러(`--bronze` 계열)는 하나뿐**, **레드(`--red`)는 `.seal-badge`와
`.revenue-figure` 두 곳에만 쓰는 범위 제한 신호색**. 색을 새로 쓰지 말고 토큰에서
가져온다. `--red`가 이 두 곳 밖으로 새어나가면 규칙 위반이다.

**다크 반전 존은 히어로·맛집랭킹1위 배너·푸터 세 곳이다**(2026-09-08에 히어로가, 2026-09-09에
맛집랭킹1위 배너가 추가됐다 — 둘 다 사용자가 다크 배너 참고 이미지를 제시하며 명시적으로
요청한 예외다). 히어로/맛집랭킹1위는 같은 다크 토큰 쌍을 쓴다 — 히어로 전용 `--hero-ink`
(`#373332`)/`--paper`(맛집랭킹1위도 새 토큰을 만들지 않고 이 쌍을 재사용). 푸터는 `--coffee`
계열/`--on-coffee`로 별도. `--hero-ink`는 사이트 전역 텍스트 색인 `--ink`(#1B1712)를 배경으로
재사용하다가, 사용자가 지정한 배경색이 `--ink` 값과 달라 전역 텍스트 색을 건드리지 않도록
분리한 히어로 전용 토큰이다. 새 다크 존을 네 번째로 추가하지 않는다 — 필요하면 이 문서와
`docs/design.md`를 먼저 갱신한다.

**폰트 크기는 프로젝트 전역 12px~120px 범위만 허용한다.** 러닝헤드 라벨("01 ·
COMPETITIVENESS")·소형 태그류는 12~13px + 넓은 자간이 카탈로그 장르 문법이라 이 하한이
맞다. 상한 120px은 히어로 헤드라인이 Black(900) 웨이트로 크게 강조될 수 있도록 확보한
값이다. 정확한 요소별 크기표는 `docs/design.md` Typography 절 참고.

### 산세리프 단일 통일이 확정 요소다 — 두 번 뒤집힌 규칙이니 주의할 것

조사한 카탈로그와 3개 참고 사이트 전부 **세리프를 전혀 쓰지 않는다.** 헤드라인/본문 모두
Pretendard(self-host, 9웨이트) 하나로 통일하고, 위계는 세리프-산세리프 대비가 아니라
**웨이트 대비**(헤드라인/대형 숫자 800~900, 본문 400~500)로 만든다. 이탤릭도 쓰지 않는다 —
산세리프 이탤릭은 카탈로그/레퍼런스 어디에도 없는 관습이다. Google Fonts CDN 의존이 완전히
제거되어 **외부 리소스는 Swiper.js CDN 하나뿐**이다(`.claude/rules/01-project.md` 참고).

과거 직전 B안은 "세리프가 확정 요소"라고 반대로 문서화했었다 — 그건 조사 없이 만든 창작
규칙이었고 지금은 폐기됐다. 실수로 세리프를 다시 들여오지 않는다.

**예외**: 2026-09-09부터 맛집랭킹1위 배너의 "맛집 랭킹" 텍스트(`.ranking-brush`) 한 곳에
한해 A안 전용이었던 붓글씨체 `RixYeoljeongdo`를 쓴다 — 사용자가 명시적으로 요청한 결과다.
`assets/fonts/RixYeoljeongdo.woff2`는 프로젝트 스캐폴딩 시점부터 이미 있었지만(직전 B안
잔재로 추정) 지금까지 미사용이었고, 이번에 처음 `@font-face`(`fonts.css`)로 등록됐다. 이건
"산세리프 단일 통일"을 뒤집는 것이 아니라 딱 이 한 요소에 한정된 예외다 — 다른 헤드라인
(01~05 섹션 타이틀, 히어로 헤드라인 등)에 이 예외를 확장하지 않는다.

### 05 매장위치 — Swiper.js 로직은 A안에서 재사용, 스타일만 리스킨

A안이 도입한 Swiper.js 캐러셀(jsdelivr CDN `swiper@11/swiper-bundle.min.{css,js}`)과
`initStoreSwiper`/`syncCaption` 로직을 그대로 재사용한다 — 이미 검증된 자동재생/캡션
동기화 로직을 재구현하는 리스크를 피하기 위함이며, 로직 자체는 화려하지 않아 "절제된
인터랙션" 원칙과도 상충하지 않는다. **바뀐 것은 스타일뿐**이다: 카드는 `--radius-card`
(14px) 라운드 카드로, 오버레이는 아이보리 계열 그라디언트로, 텍스트 화살표(← / →) +
분수 인디케이터("01 / 03") 컨트롤은 그대로 유지한다.

**함정**: `.location-layout`의 grid 컬럼에 `minmax(0, …)`(또는 자식에 `min-width:0`)이
빠지면, Swiper 슬라이드의 flex 콘텐츠가 min-content 폭으로 계산되며 폭이 수천만 px로
폭주하는 버그가 난다(실제로 겪었던 회귀). `.location-left, .location-right{ min-width:0; }`
를 유지할 것.

### 로고 처리

`assets/imgs/logo_gold.png`는 A안의 다크 배경 기준으로 만들어진 자산이라 B의 아이보리
배경 위에 그대로 쓰면 배경과 충돌한다. 새 로고 이미지를 만들지 않는 원칙을 지키기 위해
**헤더/본문에서는 산세리프 워드마크 텍스트 + 豚 배지**로 대체하고, `logo_gold.png` 원본은
**푸터(래스터 로고 이미지를 쓰는 유일한 곳)에만** 그대로 사용한다. 히어로도 2026-09-08부터
다크 반전 존이 됐지만(위 Colors 절 참고), 로고는 여전히 이미지가 아니라 산세리프 텍스트
워드마크(`.nav-word`)를 색만 뒤집어(`--paper`) 쓴다 — `logo_gold.png`를 히어로에 새로
가져오지 않는다.

---

## `.claude/` 스캐폴딩 상태

`rules/01-project.md`~`04-data-contract.md`와 `agents/router.md`/`css-stylist.md`/
`design-qa.md`/`code-reviewer.md`/`markup-a11y.md`는 이 폴더(0007-B)의 실제 구조 기준으로
작성되어 있다 — 신뢰해도 된다. `agents/content-editor.md`/`screenshot-verifier.md`/
`asset-optimizer.md`는 A안 기준으로 쓰였지만 절차·스키마 자체는 프로젝트 무관해 그대로
유효하다. `.claude/memory/archive/`, `.claude/plans/archive/`, `.claude/agent-memory/
screenshot-verifier/archive/`에는 A안 전용 시각 구현 디테일(골드/레드 토큰, 영수증 스캘럽,
히어로 sticky 패럴랙스 등)이 격리되어 있다 — B의 확정 규칙으로 인용하지 않는다.

---

## 알려진 이슈

1. **창업비용 금액이 전부 "상담 시 안내"** — 카탈로그에 실제 금액이 없어서다(A안과 동일 이슈).
   2026-09-08, 100chae.com 벤치마크의 "N/7호점" 진행바(가맹 슬롯 소진율 시각화) 채택을
   검토했으나 보류했다 — `data/content.json`의 `profit` 배열은 가맹점과 직영점(`천호
   직영점`, `tall:true`)이 섞여 있어, 매장 수(현재 3개)를 그대로 "가맹 7호점 중 N호점
   운영중"으로 시각화하면 직영점까지 가맹 슬롯으로 오인시키는 허위 과장이 된다. 가맹/직영
   구분 필드(`profit[].type` 등)를 클라이언트에게 확인받아 스키마에 명시적으로 추가하기
   전에는 이 진행바를 만들지 않는다.
2. **셀프바 이미지가 다수 미사용** — `assets/imgs/sb_*.jpg` 중 8종만 그리드에 노출된다.
   `interior1~4`, `hero_food.jpg`, `black_texture`, `generated_bg.png`, `Gemini_Generated_*`도
   백업용으로만 남아 있다(과거 히어로 시도에서 썼다가 2026-09-08 다크 배너 재작업으로
   빠졌다). 현재 히어로는 `meat_1.png`(투명 배경 컷아웃) 한 장만 텍스트와 겹쳐 쓴다 —
   같은 세트로 받은 `meat_2.png`/`meat_3.png`는 3장을 나란히 띄운 이전 시도에서 쓰였다가
   "이미지가 텍스트를 가리도록" 요청 이후 단일 이미지로 바뀌며 다시 미사용으로 빠졌다.
3. **에셋이 전부 카탈로그 PDF 크롭본** — 저해상도다. 프로덕션에서는 클라이언트 원본 사진으로 교체.
4. **문의폼은 목업** — 실제 전송 없음.

## 되살리면 안 되는 것

**A안(0007) 전용 — 절대 가져오지 않는다**
- 영수증/티켓 스큐어모피즘(프린터 슬롯, 스캘럽 절취선, 펀치홀 노치, 리본 코너)
- 다크 차콜 베이스를 **전 섹션**에 쓰는 것(A안은 히어로/메뉴/수익분석/창업비용/매장위치
  전부 다크였다) + **골드(`--gold`)나 레드를 주 포인트 컬러로 전면 확장하는 것**.
  **예외**: 2026-09-08부터 히어로가, 2026-09-09부터 맛집랭킹1위 배너가 다크(`--hero-ink`
  배경 + `--paper` 텍스트)로 추가됐다 — 둘 다 사용자가 참고 배너를 제시하며 명시적으로
  요청한 결과다. 이건 "전 섹션 다크"가 아니라 "다크 반전 존이 히어로·맛집랭킹1위·푸터
  세 곳"인 것이며, 액센트 컬러도 A안의 골드(`--gold`)가 아니라 B의 기존 `--bronze` 하나만
  쓴다 — 새 골드 토큰을 만들지 않았다. 02~05 섹션과 배지·버튼 등 나머지 컴포넌트를 다크로
  되돌리는 근거로 이 예외를 확장하지 않는다.
- 무한 반복 attention 애니메이션과 자동 오픈 모달 — "절제된 인터랙션" 원칙 위반
- 매출 숫자의 **"원" 단위**(A안에서 명시적으로 제거된 표기, B에도 계승)

**직전 B안("고품격저널") 전용 — 근거 없는 창작이었으므로 되살리지 않는다**
- 세리프 폰트(Noto Serif KR)와 이탤릭 강조
- 원형 잉크 스탬프(`.stamp-ring`)·원형 소인(`.postmark`) — 원형은 이제 셀프바·고기 사진
  전용이고, 배지·태그류는 사각/라운드사각(`.seal-badge`, `.trust-badge-icon`)이다
- "ISSUE NO.07" 매거진 발행 정보 컬로폰 표
- 테라코타(`--stamp`) 단일 포인트 컬러 — 지금은 브론즈(`--bronze`)가 주 포인트이고
  레드(`--red`)가 두 곳에만 쓰이는 별도 신호색이다
