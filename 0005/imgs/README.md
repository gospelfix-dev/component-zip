# imgs/

상품 이미지를 넣는 폴더입니다. 저장소에는 실제 상품 사진을 포함하지 않습니다.

## 파일명 규칙

`data/products.json` 의 `images` 배열(그리고 `js/app.js` 의 `FALLBACK.products[].images`)에
적힌 경로와 **정확히 같은 파일명**으로 넣습니다. 하나라도 다르면 `<img onerror>` 가 자리표시자로
조용히 대체해버려 사진이 안 보이는데, 에러가 뜨지 않아 원인을 찾기 어렵습니다.

현재 등록된 상품 기준 실제 파일명(현재는 전부 `imgs/` 에 채워져 있음):

```
imgs/hooded-tracksuit-1.png       (상품 id: light-hooded-tracksuit)
imgs/hooded-tracksuit-2.png
imgs/hooded-tracksuit-3.png
imgs/quilted-puffer-vest-1.png    (상품 id: quilted-puffer-vest)
imgs/quilted-puffer-vest-2.png
imgs/quilted-puffer-vest-3.png
```

상품을 새로 추가할 때는 `id` 와 파일명을 반드시 일치시킬 필요는 없지만(파일명은 `images`
배열에 적은 경로가 곧 진실이다), 위 목록처럼 상품별로 접두어를 통일해두면 폴더 안에서
어떤 사진이 어떤 상품 것인지 구분하기 쉽습니다.

## 권장 사양

- 배경이 없는(투명 PNG) 또는 밝은 단색 배경의 상품 컷을 권장합니다 — 카드 배경(연회색 그라디언트)과
  잘 어우러집니다.
- 세로 방향 사진이 `.card__orbit` 장식 링과 가장 잘 어울립니다.
- 이미지가 아직 없어도 카드는 자리표시자(빗금 패턴)로 정상 렌더링됩니다.

## 이미지를 추가한 뒤

`js/app.js` 의 `FALLBACK.products[].images` 도 `data/products.json` 과 같은 경로로
맞춰야 `file://` 로 열었을 때도 같은 화면이 나옵니다 (`.claude/hooks/validate-product.sh` 가 검사).
