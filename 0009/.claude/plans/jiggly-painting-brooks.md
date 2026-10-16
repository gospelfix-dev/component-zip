# 0009 뷰티샵 랜딩페이지 구현 계획

## Context

`0009`는 아직 아무 구현도 없는 빈 폴더다(`index.html` 0바이트, `assets/` 빈 디렉터리,
`data/` 없음, git 이력에 전혀 등장하지 않는 미커밋 신규 폴더). 반면 `.claude/rules/`
4개 파일은 형제 폴더 `0008`(든든김밥 분식 프랜차이즈)에서 그대로 복사해온 잔재다 —
내용·수정 시각(10/14)이 0008과 완전히 일치하고 0009 자체 커밋이 없다.

이번 세션에서 먼저 `docs/`(01-style-reference.md ~ 09-shadcn-tokens.md, DESIGN.md 등,
10/16 작성)를 만들어 **"뷰티샵 브랜딩 랜딩페이지"**(모노톤+포인트 1색, Noto Sans KR,
플랫 디자인, 예약 기반 서비스형 샵)로 디자인 시스템을 확정했다. 이제 사용자가 blissful
(화장품 커머스), LUMINA(스킨클리닉), Skin—clean(러시아 코스메톨로지 클리닉) 3개 레퍼런스
이미지를 주며 "학습해서 index.html에 랜딩페이지를 완성"해 달라고 요청했다.

**판단**: 세 이미지는 업종이 제각각(이커머스/클리닉 예약/클리닉 소개)이고 일부 스타일
(이탤릭 세리프 헤드라인, 반투명 글래스 배지, 텍스처 많은 배경)은 이미 확정한
`docs/DESIGN.md`의 "하지 말 것"(장식 폰트 금지, 그림자·그라데이션 금지, 포인트 컬러 1개)과
충돌한다. 이미 이번 세션에 확정한 디자인 시스템이 있으므로, 세 이미지는 **섹션 구성·
컴포넌트 레이아웃 패턴의 참고 자료**로만 쓰고, 색·타이포·모서리·모션 토큰은
`docs/02~09`에 이미 정한 값을 그대로 따른다. 업종은 `docs/DESIGN.md`가 이미 정의한
**예약 기반 뷰티샵**(전후사진, 디자이너·원장 소개, 가격·위치·영업시간)으로 간다 —
blissful 같은 장바구니 커머스가 아니다. `.claude/rules/`의 든든김밥 잔재는 이번
구현에 맞춰 다시 쓴다(현재 상태로 두면 체크인된 규칙 문서가 실제 프로젝트와 거짓으로
어긋난다).

사진(히어로 인물, 전후사진, 디자이너 얼굴, 갤러리)은 저장된 메모리 제약(스톡 사진 라이선스
위반 우려)에 따라 **실제 인물 사진을 쓰지 않고** `docs/08-guidelines.md`에 이미 정의된
방식대로 `tint`/`surface` 배경 + `[이미지 설명]` 자리표시 블록으로 대체한다.

브랜드명은 `[대괄호]`를 실제 렌더 화면에 그대로 노출하지 않기 위해(0008 "든든김밥"
선례처럼) 가상 플레이스홀더 브랜드 **"소담"**(국문 "소담뷰티", 워드마크 `sodam`)으로
확정한다 — "과하지 않은, 나에게 맞는 변화"라는 기존 포지셔닝 문구와 의미상 맞물린다.

## 파일 구조

```
index.html                  마크업 (빈 data-content 컨테이너, JS가 fetch로 채움)
data/content.json           콘텐츠 단일 진실 공급원
assets/css/init.css         브라우저 리셋
assets/css/fonts.css        @font-face (Noto Sans KR, self-host 시도)
assets/css/animations.css   @keyframes 전용
assets/css/style.css        :root 토큰 + 컴포넌트
assets/js/script.js         fetch → 렌더 + 인터랙션
assets/fonts/                NotoSansKR-Regular/Medium/Bold.woff2 (curl로 Google Fonts에서
                             서브셋 다운로드 시도; 네트워크 불가 시 시스템 산세리프 폴백 +
                             TODO 주석으로 수동 교체 안내)
docs/10-data-contract.md    새 데이터 스키마 문서 (0007/0008의 04-data-contract.md 역할)
.claude/rules/01-project.md    든든김밥 → 소담 뷰티샵으로 전면 재작성
.claude/rules/02-css.md        토큰 예시를 ink/gray/surface/rose/tint, 모서리 2단
                                (base 6px/pill 16px+), 그림자·테두리 금지로 교체
.claude/rules/03-javascript.md 구조는 유지(ES6, fetch→renderAll), 렌더 함수 목록을
                                이 프로젝트 섹션에 맞게 교체
.claude/rules/04-data-contract.md  kimbap 스키마를 삭제하고 docs/10-data-contract.md와
                                    동일한 뷰티샵 스키마로 교체
```

기존 `docs/01-09`, `DESIGN.md`, `design.shadcn.md`, `design.template.md`, `README.md`는
**수정하지 않는다** — 재사용 가능한 디자인 시스템 문서로 그대로 둔다.

## 디자인 시스템 (docs/02~09 그대로 적용)

- 컬러: `ink #151515` / `gray #5F5F5C` / `surface #F5F5F3` / `surfaceHover #ECECE9` /
  `rose #A8434F`(포인트, 유일) / `roseHover #8F3743` / `tint #F6ECED` / `white #FFFFFF`
- 폰트: Noto Sans KR 단일(400/500/700), 이탤릭·장식 폰트 금지
- 크기: H1 32/40·H2 22/30·Body 16/26(모바일 15/24)·Button 15/24·Caption 13/20
- 간격: 4pt 스케일 `8·12·16·24·48`만
- 모서리: 버튼/카드/이미지 6px, 태그만 완전 둥글게(16px+)
- 플랫: `border`/`box-shadow` 금지, 레이어 구분은 배경색 차이로만
- 모션: 전환 0.2초 이하 색/페이드만, 패럴랙스·큰 이동·반복 애니메이션 금지,
  스크롤 리빌은 1회성만(`IntersectionObserver` + `unobserve`)
- 브레이크포인트: `max-width:1024px` 단일

## index.html 섹션 구성 (docs/08-guidelines.md 8섹션 + 헤더/하단바/챗봇 그대로)

레이아웃·컴포넌트 패턴은 아래처럼 3개 레퍼런스 이미지에서 빌려오되, 색/타이포/모서리/
그림자 금지 규칙은 깨지 않는다.

1. **헤더**(white, 높이 56) — `sodam` 워드마크 좌측, 가운데 섹션 앵커 내비(블리스풀
   nav 참고), 우측 전화 아이콘(인라인 SVG, 0008 선례 패턴 재사용) + 예약 CTA, 모바일
   햄버거. 히어로 위에 오버레이하지 않고 별도 섹션으로 분리(DESIGN.md 스펙 그대로).
2. **히어로**(surface) — 2단 레이아웃(LUMINA 참고): 좌측 헤드라인 "과하지 않은, 나에게
   맞는 변화" + 설명 + 예약(Primary)/구경하기(Secondary) 버튼, 우측 대표 이미지
   placeholder 블록. 헤드라인은 Noto Sans KR bold만 사용(이탤릭 없음).
3. **시그니처 메뉴** — `docs/07-components.md`의 "메뉴 행"(가로 리스트, 썸네일
   72×72) 컴포넌트를 그대로 쓰되, blissful의 카테고리 탭 UX(Skincare/Hair/Wellness
   식 필터 탭, 각 탭에 개수 배지)를 얹어 카테고리별 필터링 추가.
4. **전후 사진** — 2열 그리드(기존 스펙), blissful의 Instagram 그리드 레이아웃을
   참고해 가로 스크롤(모바일) 지원. 전부 placeholder 블록.
5. **디자이너·원장 소개** — white, 카드 1~2장(사진 placeholder + 약력 설명).
6. **실제 후기** — white, 후기 카드 리스트(기존 스펙 그대로).
7. **가격·위치·영업시간 + 예약 문의 폼** — white. 가격 행 컴포넌트 그대로 쓰고,
   하단에 **인라인 예약 문의 폼 하나**를 둔다(이름/연락처/희망일/메시지, mock 제출).
   헤더·히어로·하단 고정 바의 모든 CTA는 각각 모달을 새로 만들지 않고 이 폼으로
   스크롤+포커스한다 — 0008에서 중복 폼(FAB+모달, 하단바)을 전부 삭제하고 인라인
   폼 하나로 합친 선례를 따른다.
8. **푸터**(surface) — blissful 푸터 구조 참고: 브랜드 워드마크 + 태그라인,
   About/Info/Other 3열 링크, 소셜 아이콘(인스타그램 등), 상호/대표자/사업자등록번호/
   주소/연락처 고지. 하단 고정 바에 가려지지 않게 72px 여백 확보.
9. **하단 고정 바**(모든 섹션 위 플로팅) — 예약하기(Primary, flex 2)/문의(Secondary,
   flex 1), 7번 폼으로 스크롤.
10. **챗봇 버튼**(52×52 원형, ink 배경) — 클릭 시 패널 오픈, 자주 묻는 질문
    3~4개(가격/예약 방법/위치/영업시간) 칩 클릭 → 정적 캔드 답변. 자동 오픈 없음.

## data/content.json 스키마 (docs/10-data-contract.md에 동일 문서화)

```jsonc
{
  "brand": { "name": "소담", "wordmark": "sodam", "tagline": "string" },
  "contact": { "phone": "string", "instagram": "string", "instagramUrl": "string",
               "address": "string", "businessHours": "string",
               "owner": "string", "bizRegNo": "string" },
  "nav": [ { "label": "string", "target": "string(css selector)" } ],
  "hero": { "headline": "string", "desc": "string" },
  "menu": {
    "categories": ["string"],
    "items": [ { "category": "string", "name": "string", "desc": "string",
                 "price": 50000, "badge": "string" } ]
  },
  "beforeAfter": [ { "label": "string" } ],
  "team": [ { "name": "string", "role": "string", "bio": "string" } ],
  "reviews": [ { "author": "string", "service": "string", "month": "string",
                 "text": "string" } ],
  "pricing": [ { "service": "string", "price": 50000 } ],
  "chatbot": { "fabLabel": "string", "greeting": ["string"],
               "topics": [ { "id": "string", "label": "string", "answer": "string" } ] },
  "footer": {
    "about": [ { "label": "string" } ], "info": [ { "label": "string" } ],
    "other": [ { "label": "string" } ]
  }
}
```

- `price`는 숫자 리터럴만(0007/0008과 동일 규칙).
- `menu.items[].badge`는 빈 문자열이면 배지 미표시.
- 실사진 없는 상태이므로 `image` 필드는 두지 않는다(0007/0008 규칙과 동일 사유).

## JS 구조 (assets/js/script.js, ES6 vanilla)

```
DOMContentLoaded → boot()
 ├─ initSmoothScroll / initMobileNav / initScrollSpy (0007/0008 선례 재사용)
 ├─ fetch('data/content.json') → renderAll()
 │   ├─ renderHeader / renderHero / renderMenu(+initMenuCategoryTabs)
 │   ├─ renderBeforeAfter / renderTeam / renderReviews
 │   ├─ renderPricing / renderFooter
 │   └─ renderChatbot(+초기엔 FAB만, 패널은 클릭 시)
 ├─ initReservationForm()   #reservationForm 인라인 mock 제출, 모든 CTA가 여기로 스크롤
 ├─ initStickyBar()         하단 고정 바, 데스크톱/모바일 모두 노출(DESIGN.md엔 분기
 │                          명시 없음 — 0007/0008처럼 모바일에서 과도하게 가리지 않는지
 │                          확인하며 조정)
 ├─ initScrollReveal(sel)   공용 1회성 스크롤 리빌 유틸
 └─ fetch 실패 시 showFetchError() — FALLBACK 사본을 JS에 두지 않음(file:// 열람 시
   안내 문구만 표시, 0007/0008과 동일 원칙)
```

텍스트는 `esc()`로 이스케이프, `fill(id, html)`로 컨테이너당 1회 교체, 외부 리소스는
추가하지 않는다(아이콘은 인라인 SVG만, 폰트는 self-host만).

## 검증

```bash
python3 -m http.server 8765
# http://localhost:8765/index.html 에서 섹션별 확인
```

- 모바일(≤1024px)/데스크톱 두 폭에서 레이아웃 확인, 가로 스크롤 없는지 확인
- `grep -n "#[0-9A-Fa-f]\{3,6\}" assets/css/style.css` → `:root` 선언부 외에 안 나오는지
- `grep infinite assets/css/*.css` → 무한 반복 애니메이션 없는지(이번 구현엔 승인된
  예외 없음 — 추가하지 않음)
- `data/content.json` 값 바꿔보고 화면에 반영되는지(단일 진실 공급원 확인)
- 예약 폼 mock 제출, 챗봇 FAB 클릭 FAQ 응답, 카테고리 탭 필터링 동작 확인
