# 데이터 계약

`data/content.json`이 콘텐츠의 **단일 진실 공급원**이다. `0007`(시안A)과 완전히 동일한
스키마·수치를 쓴다 — 같은 클라이언트·같은 사업 정보이므로 문구 톤만 에디토리얼체로
다듬을 수 있으나 숫자/사실관계는 그대로 유지한다.

## 스키마 (실제 `data/content.json` 기준)

```jsonc
{
  "contact": { "phone": "string", "instagram": "string", "instagramUrl": "string" },
  "competency": [                                                                // 3개
    { "num": "string(eyebrow)", "title": "string", "desc": "string(HTML 인라인 허용)" }
  ],
  "trust": [ { "label": "string", "desc": "string" } ],                          // 4개
  "meat": [ { "image": "assets/imgs/meat_*.png", "name": "string" } ],           // 9개
  "selfbar": [ { "image": "assets/imgs/sb_*.jpg", "name": "string" } ],          // 8개 노출
  "profit": [                                                                    // 3개 매장
    {
      "name": "string",
      "open": "YYYY. MM. DD 오픈",
      "salesWon": 47000000,          // 숫자만. "원" 단위 문자열 붙이지 않는다
      "rate": 36.1,                  // 순수익률(%)
      "tall": false                  // 강조 매장 표시용 플래그(천호 직영점만 true)
    }
  ],
  "cost": {
    "head": { "item": "항목", "detail": "내용", "price": "금액" },
    "rows": [ { "item": "string", "detail": "string", "price": "상담 시 안내" } ]  // 6행
  },
  "stores": [
    { "name": "string", "date": "YYYY. MM. DD OPEN", "image": "assets/imgs/bg.png", "mapUrl": "string" }
  ]                                                                              // 3개
}
```

## 규칙

- `salesWon`은 숫자 리터럴만 쓴다. **"원" 단위를 붙이지 않는다** — A안에서 사용자가
  명시적으로 제거를 요청한 표기이며 B에서도 유지한다. B는 이 값을 `.revenue-figure`의
  `data-count-to`에 그대로 심어 스크롤 진입 시 0에서 카운트업하는 데도 쓴다
  (`assets/js/script.js`의 `animateCount`).
- `desc`로 끝나는 필드만 `<b>` 같은 인라인 태그를 허용한다(HTML로 삽입). 나머지 텍스트
  필드는 이스케이프해서 넣는다.
- 이미지 경로는 프로젝트 루트 기준 상대경로(`assets/imgs/...`, 앞에 `./` 없음)로 적는다.
- `stores[].image`는 현재 3곳 모두 `assets/imgs/bg.png` 공용이다(의도된 상태, 누락 아님).

## 동기화 의무

`data/content.json`은 `assets/js/script.js`가 `fetch`로 직접 읽는다. **`FALLBACK` 사본을
JS에 두지 않는다** — `file://`로 열었을 때는 안내 문구만 보여주고, 정상 경로는 반드시
로컬 서버(`python3 -m http.server`)로 확인한다.

## 항목 추가 절차

1. `data/content.json`에 항목 추가
2. 사진을 쓴다면 `assets/imgs/`에 추가하고 경로 연결
3. `meat`/`selfbar`/`profit`/`stores` 개수가 바뀌면 `assets/css/style.css`의 관련
   `grid-template-columns`/레이아웃을 검토
