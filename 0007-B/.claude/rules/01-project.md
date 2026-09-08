# 프로젝트 원칙

"고품격대패" 삼겹살 프랜차이즈 창업 랜딩페이지 — **시안B (카탈로그 라이트 / Ivory & Bronze
Catalogue)**. `0007`(다크 차콜 + 골드/레드 시안A)과 같은 클라이언트·같은 콘텐츠 계약이지만
팔레트 축이 다른 독립 시안이다. `0007`은 참고용일 뿐 그대로 베끼지 않는다. **빌드 도구 없는
순수 정적 파일**로만 구성한다.

## 절대 규칙

- **빌드 단계를 도입하지 않는다.** npm, webpack, Vite, Sass, TypeScript 모두 사용하지 않는다.
  브라우저가 파일을 그대로 읽어서 동작해야 한다.
- **프레임워크를 도입하지 않는다.** React, Vue, jQuery 없이 바닐라 JS(ES6)로 작성한다.
- **외부 리소스는 Swiper.js CDN만 허용한다.** jsdelivr Swiper.js(`05 매장위치` 캐러셀 전용,
  `<link>`/`<script defer>`만 추가) 외의 CDN 스크립트·스타일시트를 새로 추가하지 않는다.
  웹폰트(Pretendard)는 전부 self-host라 Google Fonts 등 폰트 CDN에 의존하지 않는다.

## 파일 구조

```
index.html                  마크업 (빈 data-content 컨테이너, JS가 fetch로 채움)
CLAUDE.md / docs/design.md  정본 문서 ("왜" / "정확한 값")
data/content.json           콘텐츠 단일 진실 공급원 (경쟁력·메뉴·수익분석·창업비용·매장·연락처)
assets/css/init.css         브라우저 리셋
assets/css/fonts.css        @font-face (Pretendard 9웨이트, self-host — 유일한 서체)
assets/css/animations.css   @keyframes 전용
assets/css/style.css        :root 토큰 + 컴포넌트
assets/js/script.js         fetch → 렌더 + 인터랙션
assets/fonts/                Pretendard-*.woff2 9개
assets/imgs/                 제품/매장/인테리어 사진
```

## 동작 보장 범위

`fetch`가 CORS로 막히므로 `index.html`을 **`file://`로 직접 열면 콘텐츠가 비어 보인다**
(안내 문구만 뜬다, 정상 동작). `0003`류의 `FALLBACK` 사본을 JS에 두지 않는다 —
`data/content.json`을 고쳐도 화면이 안 바뀌는 함정이 생기기 때문이다.

## 확인 방법

```bash
python3 -m http.server 8765   # http://localhost:8765/index.html
```
