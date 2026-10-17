# 프로젝트 원칙

"연두"(워드마크 `yeondu`) 뷰티샵 브랜딩 랜딩페이지. 플레이스홀더 브랜드명이며 실존
클라이언트가 확정되지 않은 신규 기획이다 — blissful(화장품 커머스)·LUMINA(스킨클리닉)·
Skin—clean(코스메톨로지 클리닉) 3개 레퍼런스를 분석해 섹션 구성·레이아웃 패턴만 빌리고,
색·타이포·모서리·모션 토큰은 `docs/DESIGN.md`가 정한 독자 디자인 시스템(모노톤 + 포인트
1색, 플랫, Noto Sans KR)을 그대로 따른다. **빌드 도구 없는 순수 정적 파일**로만 구성한다.

2026-10-16 포인트 컬러를 `rose`(#A8434F)에서 `lime`(#EFF382)으로 교체하면서 브랜드명을
"소담"에서 "연두"로 변경했다 — `lime`은 짙은 초록이 되기 전의 여린 새잎·새싹 색(국문
색이름 "연두")이라, 브랜드명 자체를 그 색 이름으로 지어 포인트 컬러와 아이덴티티를
직접 연결했다. "과하지 않은, 나에게 맞는 변화"라는 기존 포지셔닝과도 들어맞는다 —
연두는 진한 초록으로 가는 중간 단계이지 그 자체로 완성된 색이 아니므로, 무리해서
한 번에 바뀌지 않고 자기 속도로 서서히 짙어지는 변화를 상징한다. 새 브랜드명을 또
바꿔야 한다면 이 포인트 컬러와의 연결 고리를 유지할 것(색과 무관한 임의의 이름으로
되돌리지 않는다).

형제 폴더 `0007`/`0007-B`(고품격대패, 삼겹살 프랜차이즈), `0008`(든든김밥, 분식 프랜차이즈)와는
업종·클라이언트·콘텐츠 계약이 전혀 다른 독립 프로젝트다 — 참고하지 않는다. 엔지니어링
패턴(파일 분리, fetch→render 구조, mock 폼, 1회성 스크롤 리빌 등)만 선례로 재사용한다.

## 절대 규칙

- **빌드 단계를 도입하지 않는다.** npm, webpack, Vite, Sass, TypeScript 모두 사용하지 않는다.
  브라우저가 파일을 그대로 읽어서 동작해야 한다.
- **프레임워크를 도입하지 않는다.** React, Vue, jQuery 없이 바닐라 JS(ES6)로 작성한다.
- **외부 CDN 리소스를 추가하지 않는다.** 캐러셀/슬라이더가 필요하면 Swiper.js 등 CDN에
  의존하지 않고 CSS `scroll-snap` + 바닐라 JS로 구현한다. 웹폰트(Noto Sans KR)는 전부
  self-host이며 Google Fonts 등 폰트 CDN에 의존하지 않는다. **아이콘도 CDN이 아니라 인라인
  SVG로만 추가한다**(0007/0008의 lucide path 인라인 패턴과 동일).
  - **예외(2026-10-16, 사용자 확정)**: `index.html`에 motion.dev(Motion)를
    `https://cdn.jsdelivr.net/npm/motion@latest/dist/motion.js`로 불러온다(전역
    `window.Motion`, `<script type="module">`/`import` 아님 — 모듈 시스템 금지 규칙은
    그대로 유지). 애니메이션 라이브러리 도입을 위한 명시적 단일 예외이며, 다른 CDN
    리소스(캐러셀, 아이콘, 폰트)로 확장하지 않는다.
- **실제 인물·제품 사진을 쓰지 않는다.** 스톡 사진 라이선스 문제를 피하기 위해 히어로
  인물, 전후사진, 디자이너 얼굴, 갤러리 등 모든 사진 영역은 `tint`/`surface` 배경 +
  `[이미지 설명]` 텍스트 placeholder 블록으로 대체한다(`docs/08-guidelines.md` "이미지"
  규칙 그대로). 실사진이 들어오면 `data/content.json`에 `image` 필드를 추가하고 해당
  render 함수에 분기를 넣는다.
- **1페이지 사이트 원칙.** 기본적으로 `index.html` 하나가 전체 사이트이며, nav는 같은
  페이지 안의 섹션 앵커(`#menu`, `#pricing` 등)로만 이동한다.
  - **예외(2026-10-18, 사용자 확정)**: Stitch 디자인 시안 5개 화면(홈/전문가 소개/
    포트폴리오·갤러리/프로그램·가격/예약·오시는 길)을 `home.html`/`specialists.html`/
    `portfolio.html`/`programs.html`/`contact.html` 5개의 **실제 별도 HTML 파일**로
    분리 제작했다. `index.html`은 여전히 유일한 프로덕션 1페이지이며 이 5개와 nav를
    공유하지 않는다 — 5개는 서로만 링크로 연결되는 독립된 **디자인 시안(draft)
    페이지군**이고, `index.html`에서는 눈에 띄지 않는 한 곳(푸터)에만 진입 링크를
    둔다. 다른 절대 규칙(빌드 도구 금지·외부 CDN 금지·실사진 금지·브랜드명 연두 유지·
    색상 토큰·그림자 금지·단일 브레이크포인트 등)은 이 5개 페이지에도 예외 없이
    그대로 적용된다. 이 5개를 더 늘리거나 index.html의 섹션 앵커 nav를 다중 페이지
    라우팅으로 바꾸는 추가 확장은 이번 예외 범위 밖이다 — 필요해지면 다시 확인한다.

## 정본 문서

디자인 규칙의 정본은 `docs/`다 — 이 폴더 안의 규칙 파일들은 `docs/`의 요약이 아니라
구현 세부사항이며, 색상·타이포·간격·모서리·컴포넌트 수치가 서로 어긋나면 **`docs/`가
우선한다**.

| 파일 | 내용 |
| --- | --- |
| `docs/DESIGN.md` | 목차 — 여기서 시작 |
| `docs/01-style-reference.md` | 아이덴티티·톤앤매너·모션 원칙 |
| `docs/02-colors.md` | 컬러 토큰 |
| `docs/03-typography.md` | 타이포그래피 |
| `docs/04-spacing.md` | 간격 |
| `docs/05-radius.md` | 모서리 |
| `docs/06-elevation.md` | 그림자 금지(플랫) 정책 |
| `docs/07-components.md` | 컴포넌트 규격 |
| `docs/08-guidelines.md` | 레이아웃·이미지·금지사항·에이전트 작업 규칙 |
| `docs/09-shadcn-tokens.md` / `docs/design.shadcn.md` | 구현 토큰(참고용, 이 프로젝트는 shadcn/Next.js를 쓰지 않으므로 CSS 변수만 차용) |
| `docs/10-data-contract.md` | `data/content.json` 스키마 |

## 파일 구조

```
index.html                  마크업 (빈 data-content 컨테이너, JS가 fetch로 채움) — 프로덕션 1페이지
home.html                    디자인 시안(draft) — Stitch "홈" 화면 재현, index.html과 별개
specialists.html             디자인 시안(draft) — Stitch "전문가 소개" 화면 재현
portfolio.html                디자인 시안(draft) — Stitch "포트폴리오 및 갤러리" 화면 재현
programs.html                 디자인 시안(draft) — Stitch "프로그램 및 가격" 화면 재현
contact.html                  디자인 시안(draft) — Stitch "예약 및 오시는 길" 화면 재현
docs/                        정본 디자인 문서 (위 표 참고)
data/content.json           콘텐츠 단일 진실 공급원 (브랜드·연락처·내비·히어로·메뉴·
                             전후사진·팀·후기·가격·챗봇·푸터)
assets/css/init.css         브라우저 리셋
assets/css/fonts.css        @font-face (Noto Sans KR 5웨이트, self-host — 유일한 서체)
assets/css/animations.css   @keyframes 전용
assets/css/style.css        :root 토큰 + 컴포넌트
assets/js/script.js         fetch → 렌더 + 인터랙션
assets/fonts/                NotoSansKR-Regular/Medium/Bold.woff2
assets/imgs/                 (실사진 없음 — 전부 CSS/SVG placeholder. 아이콘은
                              `assets/js/script.js`에 인라인 SVG로 둔다)
```

## 동작 보장 범위

`fetch`가 CORS로 막히므로 `index.html`을 **`file://`로 직접 열면 콘텐츠가 비어 보인다**
(안내 문구만 뜬다, 정상 동작). `FALLBACK` 사본을 JS에 두지 않는다 — `data/content.json`을
고쳐도 화면이 안 바뀌는 함정이 생기기 때문이다.

## 확인 방법

```bash
python3 -m http.server 8765   # http://localhost:8765/index.html
```
