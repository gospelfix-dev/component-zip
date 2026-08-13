# Digital Name Card — 모바일 명함

빌드 도구 없이 동작하는 정적 명함 컴포넌트. HTML5/CSS3/JS(ES6)/JSON 만으로 구성된다.
테마 하나(`dark` `paper` `light` `blue` `navy`)로 명함 레이아웃 전체가 바뀐다.

## 규칙

아래 문서가 이 프로젝트의 작업 규칙이다. 코드를 수정하기 전에 해당하는 규칙을 따른다.

@.claude/rules/01-project.md
@.claude/rules/02-css.md
@.claude/rules/03-javascript.md
@.claude/rules/04-data-contract.md

## 확인

```bash
python3 -m http.server 8765   # http://localhost:8765/index.html
```

`index.html` 을 파일로 직접 열어도(`file://`) **같은 화면이** 나와야 한다.
그래서 ES6 로 쓰되 `<script type="module">` 은 쓰지 않는다.

## 전용 에이전트

| 에이전트 | 용도 |
|---|---|
| `card-design-qa` | 시안과 구현의 시각적 차이 대조 |
| `markup-a11y` | 시맨틱 마크업·접근성·색상 대비 |
| `contact-link-check` | 연락처 링크 스킴·데이터 정합성 점검 |

## 자동 검사

`data/cards.json` 또는 `js/app.js` 를 수정하면 훅이 데이터 정합성을 검사한다
(필수 필드, `theme`·`type`·`action` 화이트리스트, `id` 중복, 사진 경로, `FALLBACK` 동기화).
차단되면 실제로 두 파일을 맞춘다.
