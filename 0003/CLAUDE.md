# Palette Series — 아이스크림 제품 카드

빌드 도구 없이 동작하는 정적 카드 컴포넌트. HTML/CSS/JS/JSON 만으로 구성된다.

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

`index.html` 을 파일로 직접 열어도(`file://`) 동작해야 한다.

## 전용 에이전트

| 에이전트 | 용도 |
|---|---|
| `design-qa` | 시안과 구현의 시각적 차이 대조 |
| `asset-optimizer` | `imgs/` 용량·해상도 점검 |
| `markup-a11y` | 시맨틱 마크업·접근성·색상 대비 |

## 자동 검사

`data/palettes.json` 또는 `js/app.js` 를 수정하면 훅이 데이터 정합성을 검사한다
(필수 필드, 이미지 경로 존재, `FALLBACK` 동기화). 차단되면 실제로 두 파일을 맞춘다.
