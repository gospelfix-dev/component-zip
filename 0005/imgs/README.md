# imgs/

상품 이미지를 넣는 폴더입니다. 저장소에는 실제 상품 사진을 포함하지 않습니다.

## 파일명 규칙

`data/products.json` 의 `images` 배열에 적힌 경로와 **정확히 같은 파일명**으로 넣습니다.

```
imgs/light-hooded-tracksuit-1.jpg
imgs/light-hooded-tracksuit-2.jpg
imgs/light-hooded-tracksuit-3.jpg
imgs/quilted-puffer-vest-1.jpg
imgs/quilted-puffer-vest-2.jpg
```

## 권장 사양

- 배경이 없는(투명 PNG) 또는 밝은 단색 배경의 상품 컷을 권장합니다 — 카드 배경(연회색 그라디언트)과
  잘 어우러집니다.
- 세로 방향 사진이 `.card__orbit` 장식 링과 가장 잘 어울립니다.
- 이미지가 아직 없어도 카드는 자리표시자(빗금 패턴)로 정상 렌더링됩니다.

## 이미지를 추가한 뒤

`js/app.js` 의 `FALLBACK.products[].images` 도 `data/products.json` 과 같은 경로로
맞춰야 `file://` 로 열었을 때도 같은 화면이 나옵니다 (`.claude/hooks/validate-product.sh` 가 검사).
