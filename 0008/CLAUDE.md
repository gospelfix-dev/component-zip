# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

# 든든김밥 — 분식/김밥 프랜차이즈 창업 랜딩페이지

빌드 도구 없이 동작하는 단일 페이지 랜딩. `index.html` + `assets/css`(역할별 4파일 —
`init.css`/`fonts.css`/`animations.css`/`style.css`) + `assets/js/script.js` +
`assets/fonts`(GmarketSans 웹폰트) + `assets/imgs`(히어로 컷아웃 사진 1장 + 마퀴 티커용
김밥/떡볶이 썸네일 2장, 메뉴/매장/장비는 여전히 placeholder) + `data/content.json`
(콘텐츠)이 전부다.

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
grep -n "infinite" assets/css/*.css   # .marquee-track(브랜드 마퀴, 의도된 예외) 1건만 — 그 외 0건이어야 함
grep -oE "font-size:[^;]+" assets/css/style.css             # 전부 12px~120px 범위
```

---

## 아키텍처

```
DOMContentLoaded → boot()
 ├─ initSmoothScroll() / initMobileNav() / initScrollSpy()
 ├─ initInquiryForm() / initStickyInquiryBar() / initInquiryFab()   (문의 폼 3곳, 전부 mock 제출)
 ↓ fetch('data/content.json') → renderAll(data)
 ├─ renderProcess / renderTrustStats / renderEquipment
 ├─ renderMenu(+initMenuTabs) / renderProfitCards
 ├─ renderCost(+initCostTierToggle — 소형/표준 탭, 합계 reduce 계산)
 ├─ renderStores(+initStoreFilter, +initStoreSwiper — 지역 필터 변경 시 Swiper destroy 후 재생성)
 ├─ renderContact / initCountdown(상담 마감 D-day, 실제 Date 계산)
 ↓ DOM 반영 후
 ├─ initScrollReveal('.reveal')      IO 1회성, unobserve
 └─ initCountUp('[data-count-to]')   IO 1회성 카운트업(매출 숫자, 신뢰지표 숫자)
```

`data/content.json`이 콘텐츠 단일 진실 공급원이다. 스키마는 `.claude/rules/04-data-contract.md`
참고. `image` 필드는 의도적으로 없다 — 메뉴/매장 사진이 아직 없으므로 JS가 원형 색상블록+
이니셜 placeholder를 렌더링한다(`.menu-ph`). 장비 카드 아이콘은 인라인 SVG다.

Swiper CDN은 **매장안내(08) 캐러셀에만** 사용한다. 그 외 캐러셀성 UI(창업안내 섹션의 모바일
프로세스 다이어그램)는 CSS `scroll-snap`으로 대체해 외부 의존을 최소화했다.

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
- **`.marquee-track`(메뉴 섹션 바로 다음, 브랜드 마퀴 티커)의 `animation: ... infinite`는
  버그가 아니라 의도된 유일한 예외다.** "무한 반복 애니메이션 금지" 원칙을 보고 이 줄을
  임의로 제거하거나 1회성으로 바꾸지 말 것 — 2026-10-14 사용자가 레퍼런스(efully.co.kr)를
  보여주며 명시적으로 요청해 추가했다. 자세한 내용은 `.claude/rules/02-css.md`의 애니메이션
  섹션 참고.

## 되살리면 안 되는 것

(해당 없음 — 신규 프로젝트라 아직 확정된 회귀 금지 목록이 없다. 사용자 피드백이 쌓이면
이 섹션에 축적한다.)
