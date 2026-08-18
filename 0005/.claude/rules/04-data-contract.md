# 데이터 계약

`data/products.json` 이 상품 데이터의 **단일 진실 공급원**이다.

## 스키마

```jsonc
{
  "section": {
    "eyebrow": "string",
    "title": "string",
    "subtitle": "string"
  },
  "products": [
    {
      "id": "kebab-case",              // 필수. 고유
      "categoryIcon": "beanie",        // 필수. beanie | hanger — 스프라이트 심볼 id 와 대응
      "images": ["./imgs/a-1.jpg"],    // 필수. 최소 1개. 사용자가 imgs/ 에 직접 넣는 경로
      "badge": { "text": "-20%" },     // 선택. 없으면 배지 제거
      "title": "string",               // 필수
      "brand": {                       // 필수
        "name": "string",
        "initial": "W",                // 없으면 name 첫 글자 사용
        "color": "#hex"                // JS 가 아바타 배경으로 인라인 주입
      },
      "price": {                       // 필수
        "currency": "$",
        "original": 1600.0,            // 선택. 없으면 취소선 가격 제거
        "discounted": 1231.0           // 필수
      },
      "sizes": ["XS", "S", "M", "L", "XL"]  // 필수. 최소 1개
    }
  ]
}
```

## 규칙

- `id`, `categoryIcon`, `images`, `title`, `brand`, `price.discounted`, `sizes` 는 필수다.
- `categoryIcon` 은 `index.html` 의 SVG 스프라이트(`#ico-*`)와 1:1 대응한다.
  새 아이콘을 쓰려면 스프라이트에 `<symbol id="ico-새이름">` 을 먼저 추가한다.
- `images` 의 경로는 **프로젝트 루트 기준 상대경로**(`./imgs/...`)로 적는다.
  파일이 아직 없어도 된다 — 없으면 `js/app.js` 의 `onerror` 가 자리표시자로 대체한다.
- `price.original` 이 없으면 취소선 가격 줄이 DOM 에서 제거된다(할인 없는 상품).
- `sizes` 순서가 곧 사이즈 드롭다운의 표시 순서다.

## 동기화 의무

`data/products.json` 을 수정하면 `js/app.js` 의 `FALLBACK` 상수도 **같은 내용으로** 갱신한다.
`file://` 로 열었을 때 쓰이는 데이터이며, 어긋나면 환경에 따라 다른 화면이 나온다.

`.claude/hooks/validate-product.sh` 훅이 이 정합성을 자동으로 검사한다.
훅이 차단하면 무시하지 말고 실제로 두 곳을 맞춘다.

## 상품 추가 절차

1. `data/products.json` 의 `products` 에 추가
2. `js/app.js` 의 `FALLBACK.products` 에 동일하게 추가
3. `imgs/` 에 사진을 넣고 `images` 경로를 연결 (없어도 자리표시자로 렌더된다)
4. `categoryIcon` 이 기존 값(`beanie`/`hanger`)에 없다면 SVG 스프라이트에 심볼을 먼저 추가
