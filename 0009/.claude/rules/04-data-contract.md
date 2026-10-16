# 데이터 계약

`data/content.json`이 콘텐츠의 **단일 진실 공급원**이다. "연두"는 플레이스홀더 브랜드명이므로
가격·후기·팀 정보는 전부 데모 placeholder다 — 실제 클라이언트가 확정되면 이 파일의 값만
교체하면 된다(스키마는 유지). 전체 스키마 설명은 `docs/10-data-contract.md`와 동일하다 —
두 문서가 어긋나면 **이 파일이 구현 세부사항까지 포함한 정본**이다.

## 스키마 (실제 `data/content.json` 기준)

```jsonc
{
  "brand": { "name": "연두", "wordmark": "yeondu", "tagline": "string" },
  "nav": [ { "label": "string", "target": "#sectionId" } ],                  // 5개
  "contact": { "phone": "string", "instagram": "string", "instagramUrl": "string",
               "address": "string", "businessHours": "string",
               "owner": "string", "bizRegNo": "string" },
  "hero": { "headline": "string", "desc": "string",
            "primaryLabel": "string", "secondaryLabel": "string" },
  "menu": {
    "categories": ["string"],                                               // 3개
    "items": [ { "category": "string", "name": "string", "desc": "string",
                 "price": 50000, "badge": "string" } ]                       // 9개
  },
  "about": { "lead": "string", "body": "string" },
  "beforeAfter": [ { "service": "string", "beforeLabel": "string",
                      "afterLabel": "string" } ],                            // 4개
  "team": [ { "name": "string", "role": "string", "bio": "string" } ],       // 2개
  "reviews": [ { "author": "string", "service": "string", "month": "string",
                 "text": "string" } ],                                       // 3개
  "pricing": [ { "service": "string", "price": 50000 } ],                    // 6개
  "chatbot": {                                                               // UI 카피만 — 답변 본문은 JS가 조합
    "fabLabel": "string", "panelTitle": "string", "panelSubtitle": "string",
    "greeting": ["string"],
    "topics": [ { "id": "string(kebab-case)", "label": "string" } ]          // 4개
  },
  "footer": {
    "about": [ { "label": "string" } ], "info": [ { "label": "string" } ],
    "other": [ { "label": "string" } ]
  }
}
```

## 규칙

- `price`(menu.items, pricing)는 **전부 숫자 리터럴만 쓴다.** 단위 문자열을 붙이지 않는다 —
  JS의 `toLocaleString()`이 표시 포맷을 담당한다.
- `desc`로 끝나는 필드(`menu.items[].desc`, `about.body`)만 `<b>` 같은 인라인 태그를
  허용한다(HTML로 삽입). 나머지 텍스트 필드는 `esc()`로 이스케이프해서 넣는다.
- `menu.items[].badge`는 빈 문자열(`""`)이면 배지를 렌더링하지 않는다 — `null` 대신 빈
  문자열을 쓴다.
- **`image` 필드는 의도적으로 두지 않는다.** 실사진이 전무하므로 JS가 필드 부재를
  기준으로 `tint`/`surface` 배경의 색상블록 placeholder를 렌더링한다. 실사진이 들어오면
  `image` 필드를 추가하고 `assets/js/script.js`의 해당 render 함수에 분기를 추가한다.
- `nav[].target`은 `index.html`의 섹션 `id`와 정확히 일치해야 한다(`#hero`, `#menu`,
  `#before-after`, `#team`, `#pricing` 등) — 어긋나면 `initSmoothScroll`이 조용히
  아무 동작도 하지 않는다.
- **`chatbot.topics[].id`는 JS `buildChatReply()`의 분기 키로만 쓰인다.** 가격/위치/
  영업시간 답변은 `data.pricing`/`data.contact`를 그 자리에서 포맷해 만든다(같은 값을
  `chatbot` 아래 다시 하드코딩하지 않는다 — 두 곳에 두면 싱크가 깨진다). 예약 방법처럼
  소스 데이터가 없는 토픽은 지어낸 숫자 없이 안내 톤의 플레이스홀더 문자열을 `script.js`에
  직접 쓴다.

## 동기화 의무

`data/content.json`은 `assets/js/script.js`가 `fetch`로 직접 읽는다. **`FALLBACK` 사본을
JS에 두지 않는다** — `file://`로 열었을 때는 안내 문구만 보여주고, 정상 경로는 반드시
로컬 서버(`python3 -m http.server`)로 확인한다.

## 항목 추가 절차

1. `data/content.json`에 항목 추가(숫자 필드는 리터럴 유지)
2. 사진을 쓴다면 `assets/imgs/`에 추가하고 `image` 필드 연결 + 해당 render 함수에 분기 추가
3. `menu.items`/`team`/`reviews`/`pricing` 개수가 크게 바뀌면 `assets/css/style.css`의
   관련 `grid-template-columns`를 검토
