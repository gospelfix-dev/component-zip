# 프로젝트 원칙

"든든김밥" 분식/김밥 프랜차이즈 창업 랜딩페이지. 플레이스홀더 브랜드명이며 실존 클라이언트가
확정되지 않은 신규 기획이다 — 오공김밥·나드리김밥 레퍼런스 2곳을 분석해 겹치지 않는 독자
팔레트("재료색" 컨셉)와 포지셔닝으로 설계했다. **빌드 도구 없는 순수 정적 파일**로만
구성한다.

형제 폴더 `0007`/`0007-B`(고품격대패, 삼겹살 프랜차이즈)와는 업종·클라이언트·콘텐츠 계약이
전혀 다른 독립 프로젝트다 — 참고하지 않는다.

## 절대 규칙

- **빌드 단계를 도입하지 않는다.** npm, webpack, Vite, Sass, TypeScript 모두 사용하지 않는다.
  브라우저가 파일을 그대로 읽어서 동작해야 한다.
- **프레임워크를 도입하지 않는다.** React, Vue, jQuery 없이 바닐라 JS(ES6)로 작성한다.
- **외부 리소스는 Swiper.js CDN만 허용한다.** jsdelivr Swiper.js(매장안내 캐러셀 전용,
  `<link>`/`<script defer>`만 추가) 외의 CDN 스크립트·스타일시트를 새로 추가하지 않는다.
  웹폰트(GmarketSans)는 전부 self-host라 Google Fonts 등 폰트 CDN에 의존하지 않는다.

## 파일 구조

```
index.html                  마크업 (빈 data-content 컨테이너, JS가 fetch로 채움)
CLAUDE.md / docs/design.md  정본 문서 ("왜" / "정확한 값")
data/content.json           콘텐츠 단일 진실 공급원 (연락처·창업프로세스·신뢰지표·장비·
                             메뉴·매출분석·비용표·매장안내)
assets/css/init.css         브라우저 리셋
assets/css/fonts.css        @font-face (GmarketSans 3웨이트, self-host — 유일한 서체)
assets/css/animations.css   @keyframes 전용
assets/css/style.css        :root 토큰 + 컴포넌트
assets/js/script.js         fetch → 렌더 + 인터랙션
assets/fonts/                GmarketSans*.woff2 3개
assets/imgs/                 kimbap_cutout.png(히어로 투명 컷아웃 사진),
                              marquee_kimbap.png / marquee_tteokbokki.png
                              (브랜드 마퀴 티커 아이콘 2종, 각 160x160, 홀/짝 번갈아 사용) —
                              메뉴/매장/장비는 여전히 CSS/SVG placeholder
```

## 동작 보장 범위

`fetch`가 CORS로 막히므로 `index.html`을 **`file://`로 직접 열면 콘텐츠가 비어 보인다**
(안내 문구만 뜬다, 정상 동작). `FALLBACK` 사본을 JS에 두지 않는다 — `data/content.json`을
고쳐도 화면이 안 바뀌는 함정이 생기기 때문이다.

## 확인 방법

```bash
python3 -m http.server 8765   # http://localhost:8765/index.html
```
