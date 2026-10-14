# 데이터 계약

`data/content.json`이 콘텐츠의 **단일 진실 공급원**이다. "든든김밥"은 플레이스홀더
브랜드명이므로 비용·매출 수치는 전부 데모 placeholder다 — 실제 클라이언트가 확정되면
이 파일의 수치만 교체하면 된다(스키마는 유지).

## 스키마 (실제 `data/content.json` 기준)

```jsonc
{
  "contact": { "phone": "string", "instagram": "string", "instagramUrl": "string" },
  "process": [ { "step": 1, "label": "string", "desc": "string" } ],             // 7개
  "trustStats": [ { "value": 128, "suffix": "string", "label": "string" } ],     // 4개
  "equipment": [                                                                 // 4개
    { "icon": "sealer|roller|pos|rice", "name": "string",
      "before": "string", "after": "string", "desc": "string(HTML 인라인 허용)" }
  ],
  "menu": {
    "categories": ["string"],                                                   // 3개
    "items": [ { "category": "string", "name": "string", "price": 3500, "badge": "string" } ] // 9개
  },
  "profitStores": [                                                             // 3개
    { "name": "string", "open": "string", "salesWon": 42000000, "netRate": 28.5 }
  ],
  "cost": {
    "tiers": [                                                                  // 2개(소형/표준)
      { "key": "compact", "label": "string",
        "rows": [ { "item": "string", "detail": "string", "price": 3000000 } ] } // 6행
    ],
    "loanNotice": "string"
  },
  "regions": ["string"],                                                        // "전체" 포함
  "stores": [ { "name": "string", "region": "string", "date": "string", "mapUrl": "string" } ], // 3개
  "inquiry": { "deadlineText": "string", "deadlineDate": "ISO8601 string" },
  "chatbot": {                                                                  // UI 카피만 — 답변 본문은 JS 하드코딩
    "fabLabel": "string", "panelTitle": "string", "panelSubtitle": "string",
    "greeting": ["string"],                                                     // 봇 인사 1~2줄
    "inputPlaceholder": "string",
    "topics": [ { "id": "string(kebab-case)", "label": "string" } ]             // 10개, 배열 순서=칩 노출 순서
  }
}
```

## 규칙

- `value`(trustStats)/`price`(menu, cost.rows)/`salesWon`(profitStores)는 **전부 숫자
  리터럴만 쓴다.** 단위 문자열을 붙이지 않는다 — JS의 `won()`/`toLocaleString`이 표시 포맷을
  담당한다.
- **`cost.rows[].price`는 예외 없이 숫자여야 한다.** "상담 시 안내" 같은 문자열을 섞으면
  `renderCostTable`의 `reduce()` 합계 계산이 깨진다(비용표 탭 전환 시마다 합계를 다시
  계산하는 구조이므로 숫자 통일이 필수).
- `desc`로 끝나는 필드(`equipment[].desc`)만 `<b>` 같은 인라인 태그를 허용한다(HTML로
  삽입). 나머지 텍스트 필드는 `esc()`로 이스케이프해서 넣는다.
- `menu.items[].badge`는 빈 문자열(`""`)이면 배지를 렌더링하지 않는다 — `null` 대신 빈
  문자열을 쓴다.
- **`image` 필드는 의도적으로 두지 않는다.** 메뉴/매장/장비 사진이 전무하므로 JS가 필드
  부재를 기준으로 색상블록 placeholder를 렌더링한다. 실사진이 들어오면 `image` 필드를
  추가하고 `assets/js/script.js`의 `renderMenu`/`renderStores`에 분기를 추가한다(항목 추가
  절차 참고).
- `regions`의 첫 값은 항상 "전체"(필터 미적용) 역할을 한다 — `storesState.activeRegion`의
  기본값으로 쓰인다.
- `inquiry.deadlineDate`는 ISO8601 문자열(타임존 포함, 예: `2026-10-31T23:59:59+09:00`)로
  쓴다 — `initCountdown`이 `new Date()`로 직접 파싱한다.
- **`chatbot.topics[].id`는 JS `buildChatReply()`의 분기 키로만 쓰인다.** 비용/수익성/
  운영구조 답변은 `data.cost`/`data.profitStores`/`data.process`를 그 자리에서 포맷해
  만든다(같은 숫자를 `chatbot` 아래 다시 하드코딩하지 않는다 — 두 곳에 두면 싱크가
  깨진다). 소스 데이터가 없는 `location`/`support`/`video-*` 6개 토픽은 지어낸 숫자
  없이 "상담 시 안내/준비 중" 톤의 플레이스홀더 문자열을 `script.js`에 직접 쓴다.

## 동기화 의무

`data/content.json`은 `assets/js/script.js`가 `fetch`로 직접 읽는다. **`FALLBACK` 사본을
JS에 두지 않는다** — `file://`로 열었을 때는 안내 문구만 보여주고, 정상 경로는 반드시
로컬 서버(`python3 -m http.server`)로 확인한다.

## 항목 추가 절차

1. `data/content.json`에 항목 추가(숫자 필드는 리터럴 유지)
2. 사진을 쓴다면 `assets/imgs/`에 추가하고 `image` 필드 연결 + 해당 render 함수에 분기 추가
3. `menu.items`/`profitStores`/`cost.tiers[].rows`/`stores`/`equipment` 개수가 크게 바뀌면
   `assets/css/style.css`의 관련 `grid-template-columns`를 검토
