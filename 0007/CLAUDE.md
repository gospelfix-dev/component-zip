# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

# 고품격대패 — 프랜차이즈 창업 랜딩페이지 (시안A_v2)

빌드 도구 없이 동작하는 단일 페이지 랜딩. `index.html` + `assets/css`(스타일, 역할별 4파일 —
`init.css`/`fonts.css`/`animations.css`/`style.css`) + `assets/js`(스크립트) + `assets/fonts`(웹폰트)
+ `assets/imgs`(이미지) + `data/content.json`(콘텐츠)이 전부다. **2026-09-02 에 `style.css`/
`animations.css`/`script.js`가 프로젝트 루트에서 `assets/css`·`assets/js` 로, 이미지가
`assets/*.jpg` 평면 구조에서 `assets/imgs/` 로 이동했고, 그 뒤 CSS 는 다시 초기화/폰트/키프레임/
컴포넌트 4개 파일로 나뉘었다** — 오래된 문서나 커밋 메시지에서 루트의 `style.css`, `script.js`,
`assets/파일명.jpg`, 또는 CSS 한 덩어리를 보게 되면 실제 위치가 아니라 이동 전 기록임을 감안할 것.

**형제 폴더와 성격이 다르다.** `0001`~`0006`은 재사용 가능한 컴포넌트 데모지만, 이 폴더는
**실제 클라이언트(고품격대패)에게 제출할 랜딩 시안**이다. 구조를 임의로 재작성하지 않는다.
`0007` 은 `component-zip` 저장소의 독립 폴더이며 형제 폴더에 의존하지 않는다. 저장소 전체가
GitHub Pages 로 배포된다(`.github/workflows/static.yml`) — 빌드 단계 없음.

작업 전 **`README.md` 를 먼저 읽는다.** 이 시안은 claude.ai 웹 대화에서 만들어져
CLI 로 인계된 것이라, 확정된 결정과 이미 제거된 요소가 그 문서에 정리되어 있다.
색상 토큰·타이포그래피 크기 표·컴포넌트별 규칙 같은 디자인 세부 값은 **`docs/design.md`** 가
정본이다 — 이 파일(CLAUDE.md)은 "왜 이렇게 짜여 있는지"를, `docs/design.md` 는 "정확히 몇 px/
몇 hex 인지"를 다룬다.

**2026-09-04, 디자인 아이덴티티를 [shadcn/ui](https://ui.shadcn.com/)와 100% 동일하게 맞추는
방향으로 전면 재설계했다** — 사용자가 명시적으로 요청한 결정이다. 골드/레드 브랜드 컬러,
RixYeoljeongdo 디스플레이 폰트, 영수증 프린터 슬롯 같은 스큐어모픽 장치, 무한 반복 attention
애니메이션을 전부 걷어내고 shadcn 의 뉴트럴 그레이스케일 토큰(oklch, dark 테마 기본) + 절제된
카드/버튼 문법으로 다시 세웠다. 이 CLAUDE.md 와 `docs/design.md` 는 전부 이 새 시스템 기준으로
갱신됐다 — 옛 골드/레드 값을 언급하는 커밋 메시지나 기억은 이동 전 기록으로 간주할 것.

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

# 에셋 참조 정합성 (참조하는데 없는 파일 찾기)
grep -oE 'assets/[A-Za-z0-9_./-]+' index.html assets/css/*.css assets/js/*.js data/content.json | sort -u | \
  while read f; do [ -f "$f" ] || echo "MISSING: $f"; done
```

테스트 러너·린터·빌드는 없다. 검증 수단은 위 스크린샷과 육안 확인이 전부다.
**지금까지의 CSS 는 브라우저로 한 번도 검증된 적이 없다** — 이전 작업 환경에 브라우저가 없었다.
CSS 를 만졌으면 반드시 실제로 렌더해서 확인한다.

---

## 아키텍처

### 콘텐츠는 `data/content.json` 하나가 단일 진실 공급원

경쟁력 카드·트러스트 스트립·고기 9종·셀프바·수익 3개 매장·창업비용표·매장 카드·연락처가
전부 이 JSON 에 있다. **문구나 이미지를 바꿀 일이 생기면 거의 항상 JSON 만 고치면 된다.**

`index.html` 에는 각 자리에 빈 컨테이너(`data-content` 속성 + id)만 있고, `assets/js/script.js` 가
`fetch` 로 읽어 채운다. `0003`~`0005` 처럼 JS 안에 `FALLBACK` 사본을 두지 **않았다** —
사본을 두면 JSON 을 고쳐도 화면이 안 바뀌는 함정이 생긴다. 대신 `fetch` 실패 시
(대개 `file://` 로 연 경우) 해당 자리에 이유를 적어 보여준다.

JSON 에서 `desc` 로 끝나는 필드만 `<b>` 같은 인라인 태그를 그대로 쓸 수 있고(HTML 로 삽입),
나머지 텍스트 필드는 `esc()` 로 이스케이프된다.

### JS 는 렌더 1곳 + 인터랙션 5곳

```
DOMContentLoaded
 └─ boot()  data/content.json 을 fetch → renderAll() 로 8개 영역 렌더 → initReceiptReveal()
      (데이터와 무관한 아래 4개는 fetch 전에 먼저 붙는다 — JSON 이 실패해도 동작해야 하므로)
 ├─ initReceiptReveal()   IntersectionObserver(threshold [0, 0.35]) → 35% 보이면 in-view 부여,
 │                        완전히 벗어나면 제거. 섹션에 들어올 때마다 반복 재생(unobserve 하지 않음)
 ├─ initSmoothScroll()    [data-target] 클릭 → scrollIntoView + 모바일 메뉴 닫기
 ├─ initMobileNav()       #navToggle → .nav-open 토글
 ├─ initScrollSpy()       스크롤 40px 넘으면 헤더 .scrolled / rootMargin 으로 nav active 갱신
 └─ initInquiryForm()     submit 가로채 버튼 텍스트만 교체 (전송 없음, 완전 목업)
```

모듈 시스템(`import`/`type="module"`)을 쓰지 않는다 — 파일 하나에 전역 함수로 둔다.

### 수익분석 카드 — 스큐어모피즘은 2026-09-04에 전부 걷어냈다

`03 수익분석`의 카드는 예전에 "영수증이 프린터 슬롯에서 뽑혀 나오는" 스큐어모픽 은유였다
(금속 프린터 바, `clip-path` 슬라이드 아웃, `mask-image` 스캘럽 절취선, 바코드 무늬, 실물
종이 색). shadcn 전면 재설계로 전부 제거하고 평범한 `.receipt-card`(보더 + 라운드 + 패딩)
하나로 단순화했다 — `assets/js/script.js` `renderProfitCards` 참고. **이 함정을 다시 되살리지
않는다**: drop-shadow, mask-image 스캘럽, 프린터 바 마크업은 전부 죽은 개념이다. 스크롤 리빌
트리거(`initReceiptReveal`)와 그 로직 자체는 그대로 유지됐다 — `opacity`/`translateY`
트랜지션으로 구현만 바뀌었다.
- 매출 숫자 뒤 **"원" 단위는 사용자 요청으로 삭제**됐다. 다시 붙이지 않는다(이번 재설계와
  무관하게 계속 유효).

### CSS 는 4개 파일로 역할이 나뉘어 있고, 섹션별로 미디어쿼리가 붙어 있다

`index.html` 은 `assets/css/init.css`(리셋) → `assets/css/fonts.css`(`@font-face`) →
`assets/css/animations.css`(`@keyframes`, 컴포넌트 전용이어도 예외 없이 전부 여기) →
`assets/css/style.css`(토큰 + 컴포넌트) 순으로 로드한다(2026-09-02 분리). 새 리셋/폰트/키프레임
규칙을 추가할 때 `style.css` 에 다시 섞어 넣지 않는다.

`style.css` 안에서는 형제 폴더의 "토큰 → 레이아웃 → 컴포넌트 → 반응형" 순서와 달리, 각 컴포넌트
블록 바로 뒤에 해당 `@media` 가 따라온다. 새 반응형 규칙도 파일 끝이 아니라 **해당 컴포넌트 옆에**
쓴다. **브레이크포인트는 `max-width:1024px` 하나만 쓴다** — 1024px 초과가 PC, 1024px 이하가
모바일이다(2026-09-02 확정. 이전에는 900/820/700px 세 값이 컴포넌트마다 섞여 있었으나 전부
1024px 로 통일했다). 새 값을 만들지 않는다. 맨 끝의 `@media (prefers-reduced-motion: reduce)`
블록은 유지한다.

디자인 토큰은 `assets/css/style.css` 의 `:root` — shadcn/ui 기본(neutral) 테마의 dark 세트를
oklch 값 그대로 옮겼다(`--background`/`--foreground`/`--card`/`--primary`/`--secondary`/
`--muted`/`--accent`/`--destructive`/`--border`/`--input`/`--ring` + `--radius` 계열).
색을 새로 쓰지 말고 토큰에서 가져온다 — 골드/레드 토큰(`--gold`, `--red` 등)은 2026-09-04에
전부 제거됐다. 흰 카드가 필요한 자리(트러스트 카드/창업비용 헤더행/문의 시트/모바일 nav)는
`docs/design.md` Colors 절의 "light 테마 로컬 재선언" 패턴을 따른다.

**폰트 크기 18~96px 고정 규칙은 2026-09-04 shadcn 재설계로 폐기됐다.** 이제 shadcn/Tailwind
표준 타입 스케일(13/14/16/18~20/28~40px, 히어로만 예외적으로 `clamp(40px,7vw,64px)`)을 쓴다.
정확한 요소별 크기표는 `docs/design.md` Typography 절 참고.

### 다크/라이트 컴포넌트에서 토큰이 로컬로 뒤집힌다

`:root` 는 shadcn dark 테마 값이 기본이라 전 섹션이 그 배경(`var(--background)`)을 그대로
쓴다 — 별도 재선언이 필요 없다(예전엔 섹션마다 `--text: var(--text-invert)` 를 걸어야 했지만,
지금은 `:root` 자체가 이미 어두운 톤이라 그 재선언 자체가 사라졌다). 재선언이 필요한 건 반대로
**밝은 카드를 만드는 자리뿐**이다 — 트러스트 카드(`.trust-item`), 창업비용 헤더 행
(`.cost-row.cost-head`, `--muted` 재사용이라 재선언 없음), 문의하기 Bottom Sheet
(`.inquiry-sheet`), 모바일 nav 플라이아웃(`@media (max-width:1024px) .nav-links`) — 이 넷은
그 셀렉터 스코프에서 `--background`/`--foreground`/`--card`/`--border`/`--muted-foreground`
등을 shadcn **light** 테마 oklch 값으로 로컬 재정의한다. 새 밝은 카드를 추가할 때 이 재선언을
빠뜨리면 어두운 텍스트가 어두운 배경 위에 그대로 남아 안 보이는 회귀가 난다. 정확한 패턴은
`docs/design.md` Colors 절 "밝은 카드로 뒤집는 자리" 참고.

### 시그니처 장치는 2026-09-04 shadcn 재설계로 대부분 제거됐다

`.wave` SVG 디바이더는 CSS 규칙 자체가 죽어 있었다(실제 `index.html` 마크업이 이미 없었다 —
이번 재설계 작업 중 처음 발견했다). 스큐어모픽 장치(경쟁력 카드 펀치홀 노치, 트러스트 카드
리본 모서리, 영수증 프린터 슬롯/스캘럽/바코드)도 전부 걷어내고 평범한 shadcn Card 패턴으로
바꿨다. 지금 남은 "시그니처"는 shadcn 자체의 절제된 문법(hairline 보더 그리드, `--radius`
스케일 통일, Button `default`/`outline` 두 갈래)뿐이다 — `docs/design.md` Shapes/Components
절 참고.

### 05 매장위치 — 이 프로젝트 유일의 외부 JS 의존성

2026-09-02, 정적 3열 그리드를 Swiper.js 캐러셀(jsdelivr CDN `swiper@11/swiper-bundle.min.{css,js}`)
로 바꿨다. "빌드 도구 없는 정적 파일" 원칙은 여전히 지킨다(번들러 없이 `<link>`/`<script defer>`
만 추가) — 다만 이 섹션만큼은 순수 바닐라가 아니라 외부 런타임 라이브러리에 의존한다. 배경은
사용자가 제공한 매장 개업식 사진(`assets/imgs/bg.png`)을 블러 처리해 깔고, 캐러셀 컨트롤
아이콘은 Lucide(lucide.dev) SVG 를 그대로 인라인으로 가져다 썼다. 자세한 구성은
`docs/design.md` Components 절 "매장위치 캐러셀" 참고.

---

## ⚠️ `.claude/` 스캐폴딩이 이 폴더 내용과 맞지 않는다

`0007/.claude/` 는 `0003`(아이스크림 팔레트 카드)에서 통째로 복사된 것이고 갱신되지 않았다.
그대로 믿으면 안 된다.

| 파일 | 실제 상태 |
|---|---|
| `rules/01-project.md` ~ `04-data-contract.md` | 아이스크림 카드 기준. `data/palettes.json`, `js/app.js`, `FALLBACK` 등 **이 폴더에 없는 파일**을 전제로 한다 |
| `memory/` | **정리 완료.** 0003 사본이던 `decisions.md` 를 제거하고(동일 파일이 `0003/.claude/memory/` 에 그대로 있다) 이 폴더의 실제 메모리 `gopumgyeok-*.md` 5개 + `MEMORY.md` 를 넣었다. `SessionStart` 훅이 이걸 주입한다 |
| `hooks/validate-palettes.sh` | `data/palettes.json`/`js/app.js` 를 대상으로 하므로 여기서는 항상 무해하게 통과(no-op) |
| `agents/` | **2026-09-02 재구성 완료.** `router`(라우팅 오케스트레이터) + `content-editor`/`css-stylist`/`screenshot-verifier`/`code-reviewer`(신규) + `design-qa`/`markup-a11y`/`asset-optimizer`(0007 실제 경로·컴포넌트 기준으로 재작성) 총 8개. 모두 `name/description/tools/model/color/memory` 프론트매터를 갖추고 이 폴더의 실제 파일(`assets/css/style.css`, `data/content.json`, `assets/imgs/`)을 전제로 한다 — 더 이상 0003 사본이 아니다 |

이 폴더의 진짜 "왜"는 `README.md` 와 `0007/.claude/memory/gopumgyeok-*.md` 5개에 있다
(`SessionStart` 훅이 후자를 자동 주입한다). `rules/` 를 이 폴더에 맞게 다시 쓰기 전까지는 인용하지 않는다.

---

## 알려진 이슈

1. **창업비용 금액이 전부 "상담 시 안내"** — 카탈로그에 실제 금액이 없어서다. `index.html` 의
   `.cost-table` 은 정적이라 수치를 받으면 바로 채울 수 있다.
2. **셀프바 이미지 16장이 미사용** — `assets/imgs/sb_*.jpg` 20종 중 그리드에 8종만 노출된다.
   `interior1~4`, `hero_food`, `black_texture` 도 백업용으로만 남아 있다. 누락이 아니라 의도된 여분이다.
3. **에셋 44장이 전부 카탈로그 PDF 크롭본** — 저해상도다. 프로덕션에서는 클라이언트 원본 사진으로 교체.
4. **문의폼은 목업** — 최종 프로덕션은 Next.js + Supabase 로 마이그레이션 예정(관리자모드·도메인·호스팅 포함).
5. **`assets/imgs/generated.png`(경쟁력 섹션 배경 워터마크)와 `assets/fonts/RixYeoljeongdo.woff2`
   (제거됨)가 더 이상 참조되지 않는다** — 전자는 2026-09-04 shadcn 재설계로 배경 워터마크
   장식을 걷어내며 미참조 상태가 됐다(파일은 남겨뒀다, 셀프바 미사용 이미지와 같은 의도된 여분
   취급). 후자는 폰트 자체가 삭제됐다(참고 2).
6. **로고 이미지(`assets/imgs/logo_gold.png`)는 여전히 골드 색이다** — CSS 토큰은 전부 뉴트럴로
   바뀌었지만 로고는 래스터 자산이라 재색상하지 못했다. 새 로고 자산이 생기면 교체를 검토한다.

(과거 이슈였던 "Pretendard 가 Google Fonts 400 에러로 로드되지 않던 문제"는 2026-09-02에
`assets/fonts/Pretendard-*.woff2` self-host + `assets/css/fonts.css` 분리로 해결됐다.)

## 되살리면 안 되는 것

사용자가 명시적으로 제거를 지시한 항목이다. 개선처럼 보여도 되돌리지 않는다.

- Song Myung 등 **세리프 폰트** — Pretendard 단일 패밀리로 확정
- 히어로 하단 **"왕십리/천호/시흥은계 오픈일" 스트립** — 05 매장위치와 중복이라 제거
- 영수증 매출 숫자의 **"원" 단위**
- **골드/레드 브랜드 컬러**(`--gold`/`--gold-light`/`--red` 및 파생 hex) — 2026-09-04 shadcn
  재설계로 전부 제거. 강조는 `--foreground`(중립) 또는 `--destructive`(위험/한정 표시 전용)만.
- **RixYeoljeongdo 디스플레이 폰트** — 삭제됐다(파일도 지웠다). Pretendard 단일 패밀리로 재확정.
- **워드마크 팝 인트로/샤인, 키워드 블링크, 강조 스냅 같은 무한 반복 attention 애니메이션** —
  shadcn 의 절제된 모션 언어와 맞지 않아 제거. 스크롤 리빌(`fadeInUp`)만 허용한다.
- **영수증 프린터 슬롯/스캘럽 절취선/바코드, 경쟁력 카드 펀치홀 노치, 트러스트 카드 리본 모서리**
  같은 스큐어모피즘 — 평범한 shadcn Card 로 대체됐다.
- **`font-size` 18~96px 고정 범위 규칙** — 폐기됐다. `docs/design.md` Typography 절의 새 스케일을
  따른다.
