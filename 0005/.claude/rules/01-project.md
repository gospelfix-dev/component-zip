# 프로젝트 원칙

Iconly 스타일 상품 상세 카드 컴포넌트. **빌드 도구 없는 순수 정적 파일**로만 구성한다.

## 절대 규칙

- **빌드 단계를 도입하지 않는다.** npm, webpack, Vite, Sass, TypeScript 모두 사용하지 않는다.
  브라우저가 파일을 그대로 읽어서 동작해야 한다.
- **프레임워크를 도입하지 않는다.** React, Vue, jQuery 없이 바닐라 JS 로 작성한다.
  예외는 슬라이더 라이브러리 **Swiper 하나뿐**이다 (아래 참고).
- 여러 상품일 때의 바깥 가로 스크롤(`.gallery__track`)은 Swiper 가 아니라 CSS
  `scroll-snap` 으로 처리한다. Swiper 를 이 용도로 추가하지 않는다.
- **외부 리소스는 웹폰트만 허용한다.** 아이콘도 CDN 대신 `index.html` 상단의
  인라인 SVG 스프라이트(`<symbol id="ico-*">`)로 해결한다.

## 상품 이미지

- 상품 이미지는 **사용자가 직접 `imgs/`에 넣는다.** 이 저장소에는 넣지 않는다.
- 이미지가 없거나 경로가 깨지면 `js/app.js` 의 `<img onerror>` 가 자리표시자
  패턴(`.card__photo[data-fallback="true"]`)으로 조용히 대체한다 — 화면이 깨지지 않는다.
- 자세한 파일명 규칙은 `imgs/README.md` 참고.

## 파일 구조

```
index.html          마크업 + SVG 아이콘 스프라이트 + <template> 3종
css/swiper.css       Swiper 8.4.7 (벤더 파일 — 수정 금지)
css/style.css        토큰 → 리셋 → 페이지 → 갤러리 → 카드 → 하위 블록 → 반응형
js/swiper.js          Swiper 8.4.7 (벤더 파일 — 수정 금지)
js/app.js            JSON 로드 → 카드 조립(이미지 캐러셀/찜/공유/사이즈/장바구니) → 렌더
data/products.json  상품 데이터 (단일 진실 공급원)
imgs/               상품 사진. 사용자가 직접 채운다
```

**벤더 파일은 직접 고치지 않는다.** Swiper 의 기본 스타일을 바꿔야 하면
`css/style.css` 에서 덮어쓴다 (특정성 주의 — `02-css.md` 참고).

## 동작 보장 범위

`index.html` 을 **`file://` 로 직접 열어도 동작해야 한다.**
`fetch` 가 CORS 로 막히므로 `js/app.js` 의 `FALLBACK` 상수가 그 경우를 담당한다.
데이터를 바꿀 때는 `data/products.json` 과 `FALLBACK` 을 **항상 함께** 수정한다.

같은 이유로 `<script type="module">` 을 쓰지 않는다. 자세한 배경은
`.claude/rules/03-javascript.md` 와 `.claude/memory/decisions.md` 참고.

## 확인 방법

```bash
python3 -m http.server 8765   # http://localhost:8765/index.html
open index.html               # file:// 경로도 같은 화면이어야 한다
```

## 전용 에이전트

| 에이전트 | 용도 |
|---|---|
| `product-card-design-qa` | 참고 시안과 구현의 시각적 차이 대조 |
