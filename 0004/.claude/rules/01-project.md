# 프로젝트 원칙

모바일 디지털 명함 컴포넌트. **빌드 도구 없는 순수 정적 파일**로만 구성한다.

## 절대 규칙

- **빌드 단계를 도입하지 않는다.** npm, webpack, Vite, Sass, TypeScript 모두 사용하지 않는다.
  브라우저가 파일을 그대로 읽어서 동작해야 한다.
- **프레임워크를 도입하지 않는다.** React, Vue, jQuery 없이 바닐라 JS 로 작성한다.
  예외는 슬라이더 라이브러리 **Swiper 하나뿐**이다 (아래 참고).
- **외부 리소스는 웹폰트만 허용한다.** 아이콘도 CDN 대신 `index.html` 상단의
  인라인 SVG 스프라이트(`<symbol id="ico-*">`)로 해결한다.

## 서드파티 — Swiper 8.4.7 (MIT)

명함 갤러리의 좌우 슬라이드에 쓴다. `0002` 와 같은 버전을 **로컬에 벤더링**했다.

- **CDN 으로 바꾸지 않는다.** `file://` 실행과 외부 리소스 금지 원칙을 지키기 위해
  `js/swiper.js` / `css/swiper.css` 를 저장소에 직접 둔다.
- 이 라이브러리를 npm 의존성으로 바꾸지 않는다. 무빌드 원칙이 우선이다.
- Swiper 를 더 늘리지 않는다. 다른 UI 라이브러리가 필요해 보이면 먼저 바닐라로 시도한다.

## 파일 구조

```
index.html        마크업 + SVG 아이콘 스프라이트 + <template> 7종
css/swiper.css    Swiper 8.4.7 (벤더 파일 — 수정 금지)
css/style.css     토큰 → 리셋 → 배경 → 페이지 → 갤러리 → 카드 → 블록 → 테마 → 반응형
js/swiper.js      Swiper 8.4.7 (벤더 파일 — 수정 금지)
js/avatar.js      photo 가 null 일 때 쓰는 SVG 인물 일러스트
js/app.js         JSON 로드 → 테마별 카드 조립 → 슬라이더 초기화
data/cards.json   명함 데이터 (단일 진실 공급원)
imgs/             인물 사진. 파일명은 카드의 id 와 같게 짓는다
```

**벤더 파일은 직접 고치지 않는다.** Swiper 의 기본 스타일을 바꿔야 하면
`css/style.css` 에서 덮어쓴다 (특정성 주의 — `02-css.md` 참고).

## 동작 보장 범위

`index.html` 을 **`file://` 로 직접 열어도 동작해야 한다.**
`fetch` 가 CORS 로 막히므로 `js/app.js` 의 `FALLBACK` 상수가 그 경우를 담당한다.
데이터를 바꿀 때는 `data/cards.json` 과 `FALLBACK` 을 **항상 함께** 수정한다.

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
| `card-design-qa` | 시안과 구현의 시각적 차이 대조 |
| `markup-a11y` | 시맨틱 마크업·접근성·색상 대비 |
| `contact-link-check` | 연락처 링크 스킴·데이터 정합성 점검 |
