# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

# 든든김밥 — 분식/김밥 프랜차이즈 창업 랜딩페이지

빌드 도구 없이 동작하는 단일 페이지 랜딩. `index.html` + `assets/css`(역할별 4파일 —
`init.css`/`fonts.css`/`animations.css`/`style.css`) + `assets/js/script.js` +
`assets/fonts`(GmarketSans 웹폰트) + `assets/imgs`(히어로 컷아웃 사진 2장(`.hero-swiper`
슬라이드) + 신뢰지표 섹션 뒷배경 사진 1장 + 마퀴 티커용 김밥/떡볶이 썸네일 2장, 메뉴/매장/장비는
여전히 placeholder) + `data/content.json`(콘텐츠)이 전부다.

**"든든김밥"은 플레이스홀더 브랜드명이다.** 실제 클라이언트가 확정되지 않은 상태에서
분식/김밥 업종 레퍼런스(오공김밥, 나드리김밥) 2곳을 분석해 설계한 독자 기획이며, 실존
브랜드가 아니다. 형제 폴더 `0007`/`0007-B`(고품격대패, 삼겹살 프랜차이즈)와는 **업종·
클라이언트·콘텐츠 계약이 전혀 다른 독립 프로젝트**다 — 참고하지 않는다.

`0008`은 `component-zip` 저장소의 독립 폴더이며 형제 폴더에 의존하지 않는다.

색상 토큰·타이포그래피 크기·컴포넌트별 규칙 같은 디자인 세부 값은 **`docs/design.md`**가
정본이다 — 이 파일(CLAUDE.md)은 "왜 이렇게 짜여 있는지"를, `docs/design.md`는 "정확히
몇 px/몇 hex인지"를 다룬다.

---

## 명령어

```bash
# 로컬 서버
python3 -m http.server 8765     # http://localhost:8765/index.html

# ⚠ file:// 로 더블클릭해 열면 data/content.json 이 CORS 로 막혀 콘텐츠가 안 나온다
#   (화면에 안내 문구가 뜬다). 반드시 위 로컬 서버로 볼 것.

# JSON 유효성
python3 -c "import json;json.load(open('data/content.json'));print('ok')"

# 헤드리스 스크린샷(시각 검증) — 뷰포트 높이를 실제 문서 길이보다 과도하게 키우면
# (경험상 1만px 이상) 크롬 합성 과정에서 하단부가 타일링 아티팩트로 흐릿하게 나올 수 있다.
# 문서 전체를 한 장에 담고 싶으면 1024px 초과 PC 기준 6000px 안팎이 안전하다.
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu \
  --hide-scrollbars --window-size=1440,6000 --virtual-time-budget=15000 \
  --run-all-compositor-stages-before-draw \
  --screenshot=/tmp/shot.png "http://localhost:8765/index.html"

# 에셋 참조 정합성 (참조하는데 없는 파일 찾기)
grep -ohE 'assets/[A-Za-z0-9_./-]+' index.html assets/css/*.css assets/js/*.js data/content.json | sort -u | \
  while read f; do [ -f "$f" ] || echo "MISSING: $f"; done

# 회귀 스윕 (배포 전 필수)
grep -n "infinite" assets/css/*.css   # .marquee-track + .custom-cursor-badge(의도된 예외) 2건만 — 그 외 0건이어야 함
grep -oE "font-size:[^;]+" assets/css/style.css             # 전부 12px~120px 범위
```

---

## 아키텍처

```
DOMContentLoaded → boot()
 ├─ initSmoothScroll() / initMobileNav() / initScrollSpy()
 ├─ initInquiryForm()      인라인 문의 폼(#inquiryForm) mock 제출 — 2026-10-14 데스크톱 하단
 │                         고정 바(sticky-inquiry)와 모바일 FAB+모달(inquiry-fab/modal)은
 │                         사용자 요청으로 삭제, 이 인라인 폼 1곳만 남음
 ├─ initHeroSwiper()       히어로 비주얼(김밥/떡볶이) 슬라이드, 정적 마크업 기준 1회 초기화
 ├─ initCustomCursor()     마우스 환경에서 네이티브 커서를 끄고 화살표+김밥 뱃지 커서로 대체
 ↓ fetch('data/content.json') → renderAll(data)
 ├─ renderProcess / renderTrustStats / renderEquipment
 ├─ renderMenu(+initMenuTabs) / renderProfitCards
 ├─ renderCost(+initCostTierToggle — 소형/표준 탭, 합계 reduce 계산)
 ├─ renderStores(+initStoreFilter, +initStoreSwiper — 지역 필터 변경 시 Swiper destroy 후 재생성)
 ├─ renderContact / initCountdown(상담 마감 D-day, 실제 Date 계산)
 └─ renderChatbot(data)    24시간 창업상담 플로팅 챗봇(.chat-fab/.chat-panel) — 초기
                           인사+토픽칩 렌더, FAB/닫기/배경클릭/ESC 핸들러, 칩 클릭 위임
                           리스너로 FAQ 분기, 자유입력 mock 답변, "상담신청 하기" 선택 시
                           패널을 닫고 #inquiry로 스크롤. data.cost/profitStores/process/
                           chatbot을 씀 — 정적 스크립트 FAQ 트리이며 실제 AI/백엔드
                           연동이 아니다(나중에 실제 API로 착각해 연결하지 않도록 명시).
 ↓ DOM 반영 후
 ├─ initScrollReveal('.reveal')      IO 1회성, unobserve
 └─ initCountUp('[data-count-to]')   IO 1회성 카운트업(매출 숫자, 신뢰지표 숫자)
```

`data/content.json`이 콘텐츠 단일 진실 공급원이다. 스키마는 `.claude/rules/04-data-contract.md`
참고. `image` 필드는 의도적으로 없다 — 메뉴/매장 사진이 아직 없으므로 JS가 원형 색상블록+
이니셜 placeholder를 렌더링한다(`.menu-ph`). 장비 카드 아이콘은 인라인 SVG다.

Swiper CDN은 **매장안내(08) 캐러셀**과 **히어로 비주얼(김밥/떡볶이 사진 전환, `.hero-swiper`)**
두 곳에만 사용한다(2026-10-14 사용자 요청으로 히어로에도 확대 — `index.html`에 이미 로드된
Swiper CDN을 재사용, 추가 `<script>`/`<link>` 없음). 그 외 캐러셀성 UI(창업안내 섹션의 모바일
프로세스 다이어그램)는 CSS `scroll-snap`으로 대체해 외부 의존을 최소화했다. 히어로 스와이퍼는
`initHeroSwiper()`에서 정적 마크업 기준으로 1회만 초기화한다(매장 스와이퍼처럼 필터 변경 시
destroy·재생성하지 않음 — 슬라이드가 고정이라 재생성 로직이 필요 없다).

2026-10-14 사용자가 형제 폴더 0007-B 히어로의 "고기 슬라이드" 효과(Swiper `effect:'fade'`
+ `autoplay` 무한 루프 + 전환 시 사진이 아래에서 위로 올라오는 `heroPhotoUp` 키프레임)를
그대로 가져와 달라고 요청 — autoplay 포함 여부까지 명시적으로 확인받은 뒤 적용했다. 이 때문에
`.marquee-track`과 함께 **두 번째로 승인된 무한 반복 UI 예외**다(`.claude/rules/02-css.md`,
`assets/css/animations.css` 헤더 주석 참고). `prefers-reduced-motion`에서는
`initHeroSwiper()`가 `autoplay:false`+`speed:0`으로 끄고, CSS에서도
`.hero-swiper .swiper-slide-active .hero-photo`의 애니메이션을 끈다. 페이지네이션 점은
없다(0007-B와 동일하게 autoplay만으로 순환, `grabCursor:true`라 드래그로 수동 전환은 가능).

**커스텀 커서(2026-10-14 사용자 요청)**는 2중 구조다. ① `body`에
`cursor:url("assets/imgs/cursor_pointer.svg") 10 5, auto;` — 화살표 모양 SVG(흰 채움 +
`--text` 아웃라인, 밝은/어두운 배경 모두에서 또렷하도록 이중 stroke)를 기본 커서로 깔아,
JS가 꺼져 있거나 터치 기기라도 항상 이 모양은 나온다. ② `initCustomCursor()`가
`(hover:hover)` 포인터 환경(마우스)임을 확인하면 `body.has-custom-cursor`를 붙여 네이티브
커서를 숨기고(`cursor:none`), `#customCursor`(화살표 + `marquee_kimbap.png` 원형 뱃지)를
`mousemove`로 추종시킨다 — 레퍼런스 스크린샷처럼 화살표 옆에 김밥 사진이 같이 따라다니는
효과. `.custom-cursor-badge`는 `width:56px`를 명시했는데도 init.css 의
`img{max-width:100%}` 리셋 때문에 부모(`.custom-cursor`, 화살표의 26px로만 너비가
정해짐) 기준 26px로 찌그러지는 버그가 있었다 — `max-width:none`으로 리셋을 명시적으로
풀어 고쳤다(같은 함정을 가진 새 고정크기 커서/뱃지 이미지를 추가할 때 주의).

---

## 알려진 이슈 / 다음 단계

- **사진 에셋이 전무하다.** 메뉴 9종·매장 3곳·장비 4종 전부 CSS/SVG placeholder로 채워져
  있다. 실사진이 들어오면 `data/content.json`에 `image` 필드를 추가하고
  `assets/js/script.js`의 해당 render 함수(`renderMenu`/`renderStores`)에 `image ? <img> :
  placeholder` 분기를 추가하면 된다 — 데이터 구조는 이미 이 교체를 고려해 설계됨.
- **비용표/매출 수치는 데모 placeholder다.** `data/content.json`의 `cost`, `profitStores`,
  `trustStats` 값은 실제 가맹 계약 수치가 아니다. 실측값이 나오면 JSON만 교체하면 된다.
- 기존 `.claude/memory/gopumgyeok-*.md` 9개와 `.claude/agents/router.md` 등은 형제 폴더
  (고품격대패) 전용 스캐폴딩이 이번 작업 이전에 이 폴더에 잘못 세팅되어 있던 것이다. 이번
  작업에서는 `.claude/rules/*.md`만 든든김밥 기준으로 교체했고, 저 메모리/에이전트 파일은
  건드리지 않았다 — 다음 세션에서 정리가 필요하면 별도 작업으로 처리할 것(이 랜딩 구현과는
  무관).
- **`.marquee-track`(메뉴 섹션 바로 다음, 브랜드 마퀴 티커)과 `.custom-cursor-badge`(커스텀
  커서 김밥 뱃지)의 `animation: ... infinite`는 버그가 아니라 의도된 예외다(2건).**
  "무한 반복 애니메이션 금지" 원칙을 보고 이 줄들을 임의로 제거하거나 1회성으로 바꾸지
  말 것 — 둘 다 2026-10-14 사용자가 명시적으로 요청해 추가했다(마퀴는 레퍼런스
  efully.co.kr을 보여주며, 커서 뱃지는 "360도 계속 무한으로 돌았으면 좋겠다"고 직접
  요청). 자세한 내용은 `.claude/rules/02-css.md`의 애니메이션 섹션 참고.

## 되살리면 안 되는 것

- **데스크톱 하단 고정 상담바(`.sticky-inquiry`, 전화번호+인라인 폼)와 모바일 FAB+문의
  모달(`.inquiry-fab`/`.inquiry-modal`)** — 2026-10-14 사용자가 명시적으로 "하단에 이
  부분 삭제해줘, 모바일도 삭제해줘"라고 요청해 `index.html`/`assets/css/style.css`/
  `assets/js/script.js`(`initStickyInquiryBar`/`initInquiryFab`)에서 전부 제거했다.
  현재 문의 폼은 페이지 내 인라인 `#inquiryForm`(`initInquiryForm()`) 1곳만 남아있다 —
  사용자가 다시 요청하지 않는 한 하단 고정바나 모바일 FAB을 되살리지 않는다.

> **참고(혼동 방지)**: 위에서 삭제된 `.sticky-inquiry`/`.inquiry-fab`/`.inquiry-modal`과,
> 같은 날(2026-10-14) 이후 새로 추가된 **"24시간 창업상담" 플로팅 챗봇
> (`.chat-fab`/`.chat-panel`, `renderChatbot`)은 서로 다른 기능이다** — 혼동하지 말 것.
> 전자는 단순 문의 폼을 하단에 중복 노출하던 위젯으로 사용자가 명시적으로 삭제를
> 요청했고, 후자는 그와 무관하게 사용자가 **새로** 요청한 FAQ형 챗봇(클릭형 분기
> 응답, 실제 백엔드 없음)이다. 두 기능은 클래스/id가 전혀 겹치지 않는다. "하단 고정
> FAB"이라는 이유만으로 이 챗봇을 이 규칙에 묶어 삭제하지 않는다 — 삭제 대상은 오직
> 위에 명시된 옛 클래스/id들뿐이다.
