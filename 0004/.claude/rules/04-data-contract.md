# 데이터 계약

`data/cards.json` 이 명함 데이터의 **단일 진실 공급원**이다.

## 스키마

```jsonc
{
  "section": {
    "eyebrow": "string",     // 상단 소제목
    "title": "string",       // 페이지 제목
    "subtitle": "string"
  },
  "cards": [
    {
      "id": "kebab-case",           // 필수. 고유. 아바타 SVG 시드로도 쓰임
      "theme": "dark",              // 필수. dark | paper | light | blue | navy
      "accent": "#hex",             // 강조색. JS 가 --card-accent 로 주입
      "photo": "./imgs/a.png|null", // null 이면 js/avatar.js 가 SVG 로 대체
      "photoShape": "hero",         // hero(전신) | circle(원형) | portrait(증명사진)
      "name": "string",             // 필수
      "role": "직무 ㅣ 직책",
      "company": "string",
      "logo": { "mark": "LB", "text": "Li & Balance", "sub": "" },
      "meta": [ { "label": "부서", "value": "PB센터" } ],   // blue 테마의 2열 그리드
      "tags": ["string"],
      "contacts": [                 // 필수. 최소 1개
        {
          "type": "mobile",         // mobile | tel | email | web | address
          "label": "휴대전화",
          "value": "010-0000-0000",
          "actions": ["call", "sms"] // call | sms | mail | web | map
        }
      ],
      "links": [ { "icon": "kakao", "label": "1:1 문의", "href": "#" } ],  // icon: kakao | link
      "about": { "title": "string", "body": ["string"] },
      "slogan": "string"            // 카드 최하단 한 줄
    }
  ]
}
```

## 규칙

- `id`, `theme`, `name`, `contacts` 는 필수다.
- **`theme` 은 `css/style.css` 의 `.namecard--*` 및 `js/app.js` 의 `THEMES` 와 1:1 대응한다.**
  값을 추가하려면 세 곳(JSON · CSS · THEMES)을 함께 고친다.
- `contacts[].type` 이 링크 스킴을 결정한다.

  | type | href |
  |---|---|
  | `mobile` `tel` | `tel:` + 숫자만 |
  | `email` | `mailto:` |
  | `web` | `https://` (이미 붙어 있으면 그대로) |
  | `address` | 네이버 지도 검색 URL (`encodeURIComponent`) |

- `actions` 는 `light` / `blue` 테마에서만 아이콘 버튼으로 보인다.
  생략하면 `type` 에서 기본값을 추론한다. `sms` 만 `type` 과 별개로 `sms:` 스킴을 쓴다.
- `photo` 가 `null` 이면 `js/avatar.js` 가 `id` 해시 시드로 SVG 인물을 그린다.
  사진을 넣으려면 `imgs/` 에 파일을 두고 **프로젝트 루트 기준 상대경로**(`./imgs/...`)로 적는다.
  **파일명은 카드의 `id` 와 같게 짓는다** (`imgs/lee-hangyeol.jpg`).
  크롭 기준점이 안 맞으면 `css/style.css` 의 `--photo-pos` 로 조절한다.
- `photoShape` 는 같은 일러스트를 다르게 크롭한다. 테마와 맞는 값을 쓴다
  (overlay/stacked → `hero`, header → `circle`, banner → `portrait`).
- `links` `about` `slogan` `meta` 는 선택이다. 없으면 해당 블록이 DOM 에서 제거된다.
- **`section` 의 키는 `index.html` 의 `data-bind` 속성값과 1:1로 대응한다.**
  키를 추가하려면 HTML 에 `data-bind="키이름"` 요소를 함께 추가한다.

## 동기화 의무

`data/cards.json` 을 수정하면 `js/app.js` 의 `FALLBACK` 상수도 **같은 내용으로** 갱신한다.
`file://` 로 열었을 때 쓰이는 데이터이며, 어긋나면 환경에 따라 다른 화면이 나온다.

`.claude/hooks/validate-cards.sh` 훅이 이 정합성을 자동으로 검사한다.
훅이 차단하면 무시하지 말고 실제로 두 곳을 맞춘다.

## 명함 추가 절차

1. `data/cards.json` 의 `cards` 에 추가
2. `js/app.js` 의 `FALLBACK.cards` 에 동일하게 추가
3. 사진을 쓴다면 `imgs/` 에 넣고 `photo` 경로 연결 (없으면 `null` 유지)
4. `theme` 이 기존 5종에 없다면 CSS 테마 블록과 `THEMES` 맵을 먼저 추가
