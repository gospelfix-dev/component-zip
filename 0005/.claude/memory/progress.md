# 진행 현황

세션 시작 시 `.claude/hooks/load-memory.sh` 가 이 파일도 함께 컨텍스트로 주입한다.
이 파일은 **"지금 무엇이 되어 있는가"** 를 담는다. 설계 판단의 "왜"는 `decisions.md` 참고.

---

## 완료된 것

- Iconly 상품 카드 시안(뒤로가기·찜·공유·이미지 캐러셀·할인 배지·가격·사이즈 선택·
  360도 버튼·Add to Cart)을 정적 파일(HTML/CSS/JS/JSON)로 재현했다.
- `.claude/` 하위에 agents(`product-card-design-qa`)·hooks(`validate-product.sh`,
  `load-memory.sh`)·memory·plans·rules 구조를 갖췄다.
- 상품 이미지 2세트(`imgs/hooded-tracksuit-1~3.png`, `imgs/quilted-puffer-vest-1~3.png`)를
  연결했다. `data/products.json` 과 `js/app.js` 의 `FALLBACK` 양쪽에 반영됨.
- 카드 안 이미지 캐러셀을 바닐라 인덱스 순환 → Swiper(8.4.7, 벤더링) `effect:"cube"` 로
  전환했다. 카드 간 높이 불일치(제목 줄바꿈 차이)는 `.card` 를 flex column 으로 바꾸고
  `.card__stage` 에 `flex:1 1 auto` 를 줘서 이미지 영역이 흡수하도록 고쳤다.
  `.card__title` 에는 `min-height:90px` 도 추가되어 있다.
- 가격을 원화(₩)로 바꾸면서 `formatMoney()` 가 통화별 소수점 자릿수를 분기하도록 고쳤다
  (₩ 은 0자리, 그 외는 2자리).
- 섹션 제목을 "상품 상세 카드" → "상품 썸네일 카드" 로 변경.

## 현재 데이터 상태 (`data/products.json`)

두 상품 모두 **실제로는 볼캡 사진**인데, 처음 만들 때 넣었던 옷(트랙수트/패딩베스트) 더미
카피가 일부 남아 있다. 사용자가 "레이아웃 테스트용이니 그대로 둔다"고 확인했다 —
아래 불일치는 의도적으로 방치된 상태다:

| 필드 | 상품1 (`light-hooded-tracksuit`) | 상품2 (`quilted-puffer-vest`) |
|---|---|---|
| 실제 사진 | 빨간 볼캡 "WHERES RUDOLPH" | 네이비 볼캡 "NY" 로고 |
| `title` | WHERES RUDOLPH 6Panel Cap_washed red ✅ 실제와 일치 | WHERES RUDOLPH 6Panel Cap_navy ✅ 실제와 일치 |
| `categoryIcon` | `beanie` (모자 계열이라 그나마 근접) | `hanger` (옷걸이 — 캡과 안 맞음) |
| `brand.name` | WinterElegance (더미) | NordicPeak (더미) |
| `sizes` | XS~XL (옷 사이즈 — 캡에 안 맞음) | S~L (옷 사이즈 — 캡에 안 맞음) |
| `price` | ₩49,000 → ₩44,100 (-10%) | ₩49,000 → ₩44,100 (-10%) |

제목은 이미 실제 상품명으로 맞춰졌으니, 나중에 `brand`/`sizes`/`categoryIcon` 도
정리해 달라는 요청이 오면 이 표를 참고해서 어디가 더미인지 바로 알 수 있다.

## 다음에 이어서 할 수 있는 것

- `categoryIcon`/`brand`/`sizes` 를 실제 캡 상품에 맞게 정리 (요청 시).
- Swiper `cube` 이펙트는 사진이 2~3장뿐이라 회전감이 은은하다 — 사진을 늘리거나
  `coverflow` 로 바꾸는 옵션을 사용자에게 제안해둔 상태 (아직 결정 안 됨).
- `product-card-design-qa` 에이전트로 최종 시안 대조는 아직 실행 안 함.
