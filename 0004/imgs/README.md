# imgs/

인물 사진을 여기에 넣는다.

## 파일명 규칙

**카드의 `id` 와 같은 이름을 쓴다.** 어느 사진이 누구 것인지 파일명만 보고 알 수 있어야 한다.

```
imgs/lee-hangyeol.jpg   ←  cards.json 의 "id": "lee-hangyeol"
```

## 연결 방법

`data/cards.json` 과 `js/app.js` 의 `FALLBACK` **두 곳** 모두에서 경로를 적는다.

```json
"photo": "./imgs/lee-hangyeol.jpg"
```

`photo` 가 `null` 이면 `js/avatar.js` 가 `id` 해시 시드로 SVG 인물을 대신 그린다.
한쪽만 고치면 `.claude/hooks/validate-cards.sh` 가 막는다.

## 크롭

`css/style.css` 의 `--photo-pos` 로 크롭 기준점을 조절한다 (기본 `50% 50%`).
원형 아바타(`light` 테마)는 지름이 작아 `50% 12%` 로 얼굴만 담는다.
