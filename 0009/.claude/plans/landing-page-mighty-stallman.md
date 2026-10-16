# 0008 — 분식/김밥 프랜차이즈 창업 랜딩페이지 ("든든김밥")

## Context

사용자가 분식/김밥 업종의 레퍼런스 랜딩페이지 4장(오공김밥, 나드리김밥)을 제시하며 신규 랜딩페이지 기획을 요청했다. `0008` 폴더를 확인한 결과 **완전히 빈 신규 폴더**였으나, `.claude/rules/*`와 `.claude/memory/*`에는 이전 세션이 세팅해둔 **"고품격대패"(삼겹살) 프로젝트용 규칙**이 그대로 남아 있었다 — 즉 설계 문서는 삼겹살을 전제로 하는데 실제 산출물(index.html 등)은 하나도 없는 불일치 상태였다.

사용자에게 확인한 결과 **"0008을 분식/김밥용으로 교체"**하기로 결정했다. 따라서 이 플랜은 0008을 삼겹살이 아닌 **분식/김밥 프랜차이즈 창업 랜딩페이지**로 0부터 새로 만들고, 기존 삼겹살 전제의 `.claude/rules/*` 스캐폴딩도 분식/김밥 기준으로 전면 교체하는 작업이다.

레퍼런스 분석:
- **오공김밥**(다크그린+옐로우): 원형 아이콘 창업 프로세스 다이어그램, 가맹개설비용표(항목/내용/금액+합계), 지점별 월매출 증명 카드, 자동화 장비 카드, 인라인 창업문의 폼.
- **나드리김밥**(아이보리+테라코타+브라운): 매장검색(직접/지역 탭), 카운트다운+상담폼+플로팅 바, "불황에 맞서는 브랜드" 통계 배지, "초보자도 쉽게" 조리 간소화 강조, 3WAY(매장/배달/포장) 시스템.

사용자 메모리 원칙(명확화 질문 최소화, 기본값으로 바로 진행)에 따라 **브랜드명이 주어지지 않았으므로 플레이스홀더로 "든든김밥"을 확정**하고, 레퍼런스 두 곳과 겹치지 않는 독자 팔레트("재료색" 컨셉 — 구운 김의 적갈블랙 + 당근/고추장 레드 + 단무지 옐로우)로 설계한다. 0007/0007-B와 같은 **빌드 도구 없는 순수 정적 파일** 방법론(fetch 기반 렌더, data/content.json 단일 진실 공급원, CSS 4파일 분리, ES6, 단일 브레이크포인트 1024px, IO 1회성 리빌)을 그대로 계승한다. Pretendard 폰트는 `0007-B/assets/fonts/`에 9웨이트 self-host 파일이 이미 존재함을 확인했으므로 그대로 복사해 재사용한다(RixYeoljeongdo 디스플레이 폰트는 삼겹살 전용 "고급감" 연출이라 이번엔 가져오지 않는다).

## 브랜드/팔레트 확정안

- **브랜드명**: 든든김밥 (플레이스홀더, 실제 클라이언트명 확정 시 content.json/CLAUDE.md만 교체하면 됨)
- **포지셔닝**: "재료 본연의 색으로 신뢰를 주는 실속형 분식 프랜차이즈" — 오공의 트렌디·자동화 강조와 나드리의 폐업률 공포 마케팅 둘 다 쓰지 않는 중립 톤.
- **색 토큰** (`:root`):

| 토큰 | 값 | 용도 |
|---|---|---|
| `--bg` | `#FFFBF2` | 기본 배경 |
| `--bg-dark` | `#241512` | 히어로/다크 섹션 (구운 김 색 — 오공 그린·나드리 브라운과 다른 적갈블랙) |
| `--red` | `#E4402C` | CTA, 포인트, 매출 숫자 (두 레퍼런스 모두 레드를 메인으로 안 씀) |
| `--red-deep` | `#B22B1C` | hover/active |
| `--yellow` | `#FFC72C` | 배지, 세컨더리 포인트 |
| `--yellow-deep` | `#E3A600` | hover |
| `--white` | `#FFFFFF` | 카드 배경 |
| `--text` / `--text-invert` / `--text-dim` | `#2B211D` / `#FBF3E3` / `#8C7F74` | 텍스트 |
| `--line` | `#E8DECE` | 구분선 |

모서리 4단 체계: `--radius-badge`(8px) 배지/인풋/비용표 헤더, `--radius-card`(16px) 카드/모달, `--radius-pill`(999px) 버튼, `--radius-circle`(50%) 메뉴 placeholder·프로세스 아이콘 원. 폰트 크기 12~120px, `clamp()` 반응형, 단일 브레이크포인트 `max-width:1024px`.

## 섹션 구성 (10개)

1. 헤더/네비 — 로고+메뉴+CTA+햄버거(공통 관례)
2. 히어로 + 창업 프로세스 — 7단계(문의→상담→상권분석→가맹계약→교육·공사→오픈준비→매장오픈) 원형 아이콘+점선. 모바일은 Swiper 대신 CSS `scroll-snap`
3. 신뢰지표 — 가맹점수/재계약률/운영연수/폐업건수 4카드, IO 1회성 카운트업 (공포 비교 배지 없이 중립적 숫자만)
4. 경쟁력(조리 간소화·자동화) — 장비 카드마다 Before/After 시간 비교 수치 (레퍼런스엔 없는 차별점)
5. 메뉴 소개 — 카테고리 탭(대표/프리미엄/사이드), 사진 없이 원형 색상블록+이니셜 placeholder
6. 매출증명/수익분석 — 지점별 매출 카드 + 순수익률, 카운트업 1회성
7. 가맹개설비용표 — 소형(10평)/표준(20평) 2단 탭 비교 + 합계 자동계산(모든 price 숫자 리터럴로 통일, "상담 시 안내" 문자열 섞지 않음) + 무이자대출 안내
8. 매장안내 — 지역 드롭다운 필터 + Swiper 카드 캐러셀(이 프로젝트 유일 Swiper 사용처), 필터 변경 시 Swiper 재생성
9. 창업문의 폼 — 인라인 폼 + 데스크톱 하단 고정 바 + 모바일 FAB→모달. "이달 상담 마감까지" 중립적 날짜 카운트다운(실제 Date 계산, 가짜 할인 타이머 아님)
10. 푸터 — 상호/주소/대표/사업자번호/영업시간

## data/content.json 스키마

```jsonc
{
  "_readme": "든든김밥 랜딩 콘텐츠 단일 진실 공급원. desc 필드만 <b> 인라인 허용. 비용/매출 수치는 데모 placeholder.",
  "contact": { "phone": "1588-0000", "instagram": "@deundeun_gimbap", "instagramUrl": "..." },
  "process": [ { "step": 1, "label": "창업문의", "desc": "..." } ],   // 7개
  "trustStats": [ { "value": 128, "suffix": "호점", "label": "전국 가맹점" } ], // 4개
  "equipment": [ { "icon": "sealer", "name": "...", "before": "...", "after": "...", "desc": "<b>...</b>" } ], // 4개
  "menu": { "categories": [...], "items": [ { "category": "...", "name": "...", "price": 3500, "badge": "BEST" } ] },
  "profitStores": [ { "name": "...", "open": "...", "salesWon": 42000000, "netRate": 28.5 } ], // 3개
  "cost": {
    "tiers": [
      { "key": "compact", "label": "소형 매장 (10평형)", "rows": [ { "item": "가맹비", "detail": "...", "price": 3000000 } ] },
      { "key": "standard", "label": "표준 매장 (20평형)", "rows": [ ... ] }
    ],
    "loanNotice": "창업자금 무이자 대출 상담 가능 (조건은 상담 시 안내)"
  },
  "regions": ["전체", "서울", "경기", "인천", "부산", "대구"],
  "stores": [ { "name": "...", "region": "서울", "date": "2024. 09 OPEN", "mapUrl": "..." } ], // 3개
  "inquiry": { "deadlineText": "이달 상담 마감까지", "deadlineDate": "2026-10-31T23:59:59+09:00" }
}
```

`image` 필드는 의도적으로 생략 — 사진 에셋이 전무하므로 JS가 부재를 감지해 색상블록 placeholder를 렌더링한다. `price`/`salesWon`은 전부 숫자 리터럴(0007 관례 계승), 비용표는 합계 자동계산이 가능하도록 전부 숫자로 통일(오공처럼 "상담 시 안내" 문자열을 섞지 않음).

## JS 구조 (`assets/js/script.js`)

```
DOMContentLoaded → boot()
 ├─ initSmoothScroll() / initMobileNav() / initScrollSpy()
 ├─ initInquiryForm() / initStickyInquiryBar() / initInquiryFab()   (인라인+하단바+모바일 모달, mock submit)
 └─ initCountdown()   inquiry.deadlineDate 기준 실시간 텍스트 갱신
 ↓ fetch('data/content.json') → renderAll(data)
 ├─ renderProcess / renderTrustStats / renderEquipment
 ├─ renderMenu(+initMenuTabs) / renderProfitCards
 ├─ renderCost(+initCostTierToggle, 합계 reduce 계산)
 ├─ renderStores(+initStoreFilter, +initStoreSwiper — 지역 필터 변경 시 Swiper destroy 후 재생성)
 └─ renderContact
 ↓ DOM 반영 후
 ├─ initScrollReveal('.reveal')   IO 1회성, unobserve
 └─ initCountUp('[data-count-to]') IO 1회성 카운트업
```

`fill()`/`esc()` 유틸로 렌더, `desc`류만 HTML 허용. `fetch` 실패 시 FALLBACK 사본 없이 안내 문구만 표시. Swiper CDN은 매장안내 캐러셀에만 사용.

## 에셋 조달

- 폰트: `0007-B/assets/fonts/Pretendard-*.woff2` 9종을 그대로 복사(OFL, self-host 재사용). RixYeoljeongdo는 가져오지 않음.
- 사진: 메뉴/매장/장비 전부 **1차 구현은 CSS/인라인 SVG placeholder**로 채운다 — 원형 색상블록+이니셜(메뉴), 색상블록+매장명(매장), 인라인 SVG 선 아이콘(장비). 추후 실사진 교체 시 `image` 필드 추가 + JS 분기 하나만 바꾸면 되도록 설계.

## 함께 교체/작성할 문서

- `CLAUDE.md`, `docs/design.md` — 든든김밥 기준으로 신규 작성(0007 구조를 틀로만 차용).
- `.claude/rules/01~04-*.md` — 삼겹살 전제 내용을 전면 교체(브랜드명, 파일 구조, 색 토큰명 `--bronze`→`--red`/`--yellow`, 데이터 스키마, Swiper 재생성 로직 등).
- 기존 `.claude/memory/gopumgyeok-*.md` 9개, `.claude/agents/router.md` 등은 이번 구현과 무관한 삼겹살 전용 메모리이므로 **이 작업에서는 건드리지 않고** CLAUDE.md에 "정리 필요" 메모만 남긴다(별도 후속 작업으로 분리).
- 재적용할 기존 함정: 폼 범위 셀렉터는 처음부터 상위 셀렉터 포함해서 작성(특이성 역전 방지), CSS 섹션 헤더 주석에 `.a-*/.b-*`처럼 슬래시로 클래스 나열 금지(`*/` 조기종료 방지, 쉼표로 구분).

## 검증 방법

```bash
python3 -m http.server 8765   # http://localhost:8765/index.html
python3 -c "import json;json.load(open('data/content.json'));print('ok')"
grep -n "infinite" assets/css/*.css          # 무한반복 애니메이션 없어야 함
grep -oE 'font-size:[^;]+' assets/css/style.css   # 전부 12~120px 범위인지 확인
```

체크리스트: `file://` 직접 열면 안내 문구만 뜨는지 / 로컬 서버에서 전 섹션이 JSON으로 채워지는지 / 1024px 기준 PC·모바일 레이아웃 / 지역 필터 변경 시 Swiper 정상 재생성 / 비용표 탭 전환 시 합계 재계산 / 문의 폼 3곳(인라인/하단바/모바일 모달) mock 제출 동작 / 스크롤 리빌·카운트업이 재진입 시 반복 재생되지 않는지(1회성 확인).

## Critical Files

- `index.html`, `data/content.json`, `assets/js/script.js`, `assets/css/{init,fonts,animations,style}.css` — 전부 신규 생성
- `.claude/rules/01-project.md` ~ `04-data-contract.md` — 전면 교체
- `CLAUDE.md`, `docs/design.md` — 신규 작성
- 참고용(차용하되 복사 금지): `0007-B/CLAUDE.md`, `0007-B/docs/design.md`, `0007-B/assets/fonts/`
