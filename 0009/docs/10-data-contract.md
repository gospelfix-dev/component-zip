# 10. 데이터 계약

`data/content.json`이 콘텐츠의 단일 진실 공급원입니다. "연두"는 플레이스홀더
브랜드명이므로 가격·후기·팀 정보는 전부 데모 값입니다 — 실제 클라이언트가 확정되면
이 파일의 값만 교체하면 됩니다(스키마는 유지).

구현 세부사항(동기화 의무, 항목 추가 절차)을 포함한 정본은
`.claude/rules/04-data-contract.md`입니다 — 이 파일은 스키마 레퍼런스만 담습니다.

## 스키마

```jsonc
{
  "brand": { "name": "연두", "wordmark": "YEONDU", "tagline": "string" },
  "nav": [ { "label": "string", "target": "#sectionId" } ],
  "contact": { "phone": "string", "instagram": "string", "instagramUrl": "string",
               "address": "string", "businessHours": "string",
               "owner": "string", "bizRegNo": "string" },
  "hero": { "headline": "string", "desc": "string",
            "primaryLabel": "string", "secondaryLabel": "string" },
  "menu": {
    "categories": ["string"],
    "items": [ { "category": "string", "name": "string", "desc": "string",
                 "price": 50000, "badge": "string" } ]
  },
  "about": { "lead": "string", "body": "string" },
  "beforeAfter": [ { "service": "string", "beforeLabel": "string",
                      "afterLabel": "string" } ],
  "team": [ { "name": "string", "role": "string", "bio": "string" } ],
  "reviews": [ { "author": "string", "service": "string", "month": "string",
                 "text": "string" } ],
  "pricing": [ { "service": "string", "price": 50000 } ],
  "chatbot": { "fabLabel": "string", "panelTitle": "string", "panelSubtitle": "string",
               "greeting": ["string"],
               "topics": [ { "id": "string(kebab-case)", "label": "string" } ] },
  "footer": {
    "about": [ { "label": "string" } ], "info": [ { "label": "string" } ],
    "other": [ { "label": "string" } ]
  }
}
```

- `price`는 숫자 리터럴만 씁니다(단위 문자열 없음).
- `menu.items[].badge`는 빈 문자열이면 배지를 렌더링하지 않습니다.
- 실사진이 없으므로 `image` 필드는 두지 않습니다 — [08-guidelines.md](08-guidelines.md)의
  이미지 placeholder 규칙을 따릅니다.
- `chatbot.topics[].id`는 분기 키로만 쓰이고, 답변 본문은 `contact`/`pricing` 값을
  그 자리에서 포맷해 만듭니다(중복 저장하지 않음).
