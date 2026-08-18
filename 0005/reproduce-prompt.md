# 재현용 프롬프트 — 상품 상세 카드 (Iconly 스타일)

이 문서는 `0005` 컴포넌트를 처음부터 다시 만들고 싶을 때, Claude나 ChatGPT 같은 다른 AI 세션에
그대로 붙여넣기 위한 프롬프트다. 코드 스니펫이 아니라 **설계 의도("왜")**를 담고 있다 —
코드만 보고 베끼면 재현되지 않는 트랩(데이터 이중화, Swiper 인스턴스별 바인딩 등)이 있기 때문이다.
자세한 배경은 `.claude/memory/decisions.md` 참고.

---

## 붙여넣기용 프롬프트

```
빌드 도구 없이 동작하는 정적 "상품 상세 카드" 컴포넌트를 만들어줘. Iconly 스타일 커머스 UI를
HTML5 + CSS3 + 바닐라 ES6 + JSON 데이터로 구현하고, 완성되면 파일별로 나눠서 각각 전체 코드를 출력해줘.

산출물은 반드시 아래 폴더 구조 그대로 만들어줘 (파일명만 같고 폴더 없이 평평하게 만들지 말 것):
프로젝트루트/
├── index.html
├── css/
│   └── style.css
├── js/
│   └── app.js
├── data/
│   └── products.json
└── imgs/          (빈 폴더 — 상품 사진은 내가 나중에 직접 넣을 것이므로 실제 이미지 파일은
                     만들 필요 없음. 아래 "상품 이미지 경로" 절의 파일명으로 경로만 미리 잡아줘)

파일을 하나씩 만들 때 파일 경로를 "style.css"가 아니라 "css/style.css"처럼 폴더를 포함해서
명시해줘. 그리고 index.html 안에서도 반드시 그 하위 경로로 참조해줘:
  <link rel="stylesheet" href="./css/style.css" />
  <script src="./js/app.js"></script>
  fetch("./data/products.json")
루트에 파일 4개를 평평하게 늘어놓고 참조 경로만 "style.css"처럼 쓰면 안 됨 — css/js/data
하위 폴더가 실제로 존재해야 하고, index.html의 경로도 그 폴더를 가리켜야 함.

## 상품 이미지 경로 (실제 파일명 그대로 사용)
이미지 파일 자체는 텍스트로 생성할 수 없으니 만들지 말고, products.json과 FALLBACK 안의
"images" 배열에는 아래 실제 파일명을 경로로 그대로 넣어줘. 나는 이 파일명과 동일한 이름으로
사진을 imgs/ 폴더에 직접 넣을 거야:
  상품1 (light-hooded-tracksuit):
    ./imgs/hooded-tracksuit-1.png
    ./imgs/hooded-tracksuit-2.png
    ./imgs/hooded-tracksuit-3.png
  상품2 (quilted-puffer-vest):
    ./imgs/quilted-puffer-vest-1.png
    ./imgs/quilted-puffer-vest-2.png
    ./imgs/quilted-puffer-vest-3.png
이미지가 아직 없어도 화면이 깨지지 않아야 해 — js/app.js의 <img onerror> 핸들러가 이미지 로드
실패 시 빗금 패턴 자리표시자(.card__photo[data-fallback="true"])로 조용히 대체하도록 만들어줘.
(이미지 캐러셀 라이브러리는 Swiper 8.4.7을 CDN에서 로드해서 써도 됨:
https://cdn.jsdelivr.net/npm/swiper@8.4.7/swiper-bundle.min.css ,
https://cdn.jsdelivr.net/npm/swiper@8.4.7/swiper-bundle.min.js)

## 절대 규칙
- 빌드 단계 없음. npm/webpack/Vite/Sass/TypeScript 사용 금지. 브라우저가 파일을 그대로 읽어 동작해야 함.
- 프레임워크 금지(React/Vue/jQuery 없음). 바닐라 JS. 예외는 이미지 캐러셀용 Swiper 하나뿐.
- `<script type="module">` / `import` / `export` 금지 — index.html을 더블클릭해서 file://로 열어도
  동작해야 하는데, 모듈은 CORS로 막히기 때문. 대신 IIFE + 전역 네임스페이스 하나(`window.ProductCard`)로 작성.
- 아이콘은 아이콘 폰트/CDN 대신 index.html 상단에 인라인 SVG `<symbol>` 스프라이트로 직접 그려서 씀
  (Iconly 원본은 라이선스가 있으므로 실루엣만 참고해서 자체 제작 — 뒤로가기 셰브론, 하트, 업로드,
  비니 모자, 옷걸이, 큐브, 플러스, 아래 화살표 총 8종).
- 외부 리소스는 웹폰트(Pretendard)와 Swiper CDN 두 가지만 허용.
- 텍스트는 textContent로 넣고 innerHTML은 쓰지 않음. 카드 마크업은 JS 문자열이 아니라
  <template> 태그를 cloneNode(true)해서 만듦.

## 데이터 이중화 (중요, 빠뜨리지 말 것)
data/products.json이 단일 진실 공급원이지만, file://로 직접 열면 fetch가 CORS로 막히므로
js/app.js 상단에 FALLBACK이라는 상수로 **완전히 동일한 내용을 그대로 복제**해두고, fetch 실패 시
FALLBACK으로 렌더링해줘. 두 데이터는 절대 어긋나면 안 됨(어긋나면 서버로 볼 때와 더블클릭으로
볼 때 다른 화면이 나옴).

## 데이터 스키마 (data/products.json)
필드 의미는 아래와 같고, "id/categoryIcon/images/title/brand/price.discounted/sizes"는 필수야:
- id: kebab-case, 고유
- categoryIcon: "beanie" 또는 "hanger" — SVG 스프라이트 심볼 id와 대응
- images: 최소 1개 배열. 실제 파일은 없어도 됨(경로만 미리 잡아둠)
- badge: 선택. 없으면 배지 제거 ({ "text": "-20%" } 형태)
- brand: { name, initial(없으면 name 첫 글자), color(hex) } — color는 JS가 아바타 배경에 인라인 주입
- price: { currency, original(선택, 없으면 취소선 가격 제거), discounted }
- sizes: 최소 1개 배열, 순서 = 드롭다운 표시 순서

아래 실제 상품 데이터 2개를 그대로 넣어줘 (이미지 경로는 위 "상품 이미지 경로" 절과 동일해야 함):
{
  "section": {
    "eyebrow": "Product Card",
    "title": "상품 썸네일 UI 디자인",
    "subtitle": "이미지·사이즈·가격을 하나의 카드로 보여주는 커머스 컴포넌트"
  },
  "products": [
    {
      "id": "light-hooded-tracksuit",
      "categoryIcon": "beanie",
      "images": [
        "./imgs/hooded-tracksuit-1.png",
        "./imgs/hooded-tracksuit-2.png",
        "./imgs/hooded-tracksuit-3.png"
      ],
      "badge": { "text": "-10%" },
      "title": "WHERES RUDOLPH 6Panel Cap_washed red",
      "brand": { "name": "WinterElegance", "initial": "W", "color": "#E8871E" },
      "price": { "currency": "₩", "original": 49000, "discounted": 44100 },
      "sizes": ["XS", "S", "M", "L", "XL"]
    },
    {
      "id": "quilted-puffer-vest",
      "categoryIcon": "hanger",
      "images": [
        "./imgs/quilted-puffer-vest-1.png",
        "./imgs/quilted-puffer-vest-2.png",
        "./imgs/quilted-puffer-vest-3.png"
      ],
      "badge": { "text": "-10%" },
      "title": "WHERES RUDOLPH 6Panel Cap_navy",
      "brand": { "name": "NordicPeak", "initial": "N", "color": "#2F6BD8" },
      "price": { "currency": "₩", "original": 49000, "discounted": 44100 },
      "sizes": ["S", "M", "L"]
    }
  ]
}
통화가 "₩"이면 소수점 자리 없이(0자리), 그 외 통화면 소수점 2자리로 금액을 포맷해줘.

## 렌더링 파이프라인
fetch(products.json) 실패 → FALLBACK 사용
  → render(): section 텍스트 바인딩 + products 배열마다 buildCard() 호출
  → buildCard(): <template id="productCardTemplate"> clone → 각 블록 채우기 → 이벤트 바인딩
  → 전부 DocumentFragment에 모은 뒤 track.replaceChildren(fragment)로 한 번에 삽입

## 카드 컴포넌트 구성 (위 → 아래)
1. 상단바: 원형 아이콘버튼 3개 — 좌측 뒤로가기(history.back()), 우측에 찜(하트, aria-pressed
   토글 + 토스트 안내)과 공유(navigator.share 우선, 없으면 navigator.clipboard로 링크 복사,
   둘 다 없으면 조용히 무시)
2. 이미지 스테이지: 장식용 타원 링(카드 뒤에 깔리는 border만 있는 원, z-index 낮게) +
   Swiper 캐러셀. effect는 "cube"로 — 좌우로 미끄러지는 대신 상품이 입체적으로 회전하는
   느낌. 캐러셀 좌우 화살표는 슬라이드 위에 떠 있는 원형 버튼 쌍(z-index 높게). 이미지가
   1장뿐이면 화살표 숨김.
   - 카드가 여러 장이면 카드마다 별도의 new Swiper() 인스턴스를 만들고, navigation.nextEl/
     prevEl에는 문자열 선택자가 아니라 **그 카드 안의 버튼 엘리먼트를 직접** 넘겨줘. 모든 카드가
     같은 클래스명을 쓰기 때문에 문자열 선택자를 쓰면 모든 카드가 첫 번째 카드의 버튼을 공유하게 됨.
   - 이미지 로드 실패(onerror)하면 img를 숨기고 빗금 패턴 자리표시자로 대체. onerror는 실행 후
     스스로 해제(무한루프 방지).
3. 배지(할인율 알약, 검정 배경 흰 텍스트) + 카테고리 아이콘(우측, 회색톤)
4. 제목(굵게, 최소 높이 고정해서 카드 간 높이가 안 맞는 문제 방지) / 브랜드(색상 원형
   아바타 — brand.color를 JS가 style.background로 인라인 주입 + 브랜드명) / 가격(우측 정렬,
   원가는 취소선 회색 작은 글씨, 할인가는 굵고 큰 글씨)
5. 하단 액션 3개, flex 가로 배치:
   - 사이즈 선택 알약버튼: 네이티브 <select> 대신 커스텀 드롭다운(role="listbox", 3열 그리드
     팝업, 바깥 클릭시 닫힘 — document 클릭 리스너는 메뉴 열려있을 때만 등록/해제). 기본
     라벨은 "Choose size"
   - 360도 보기: outline 스타일 원형 아이콘버튼(큐브 아이콘)
   - Add to Cart: 검정 배경 알약버튼(primary). 사이즈 미선택 상태(라벨이 여전히 "Choose size")
     에서 누르면 담지 않고 토스트로만 "사이즈를 먼저 선택해 주세요" 안내. 사이즈 선택된 상태면
     토스트로 담김 안내 + 버튼이 잠깐(약 1.2초) 초록색으로 바뀜. 실제 장바구니 상태 저장소는
     없음(단순 시각 데모).

## 스타일 토큰
--page-bg: #eef0f0; --page-ink: #16181d; --page-ink-soft: #6b7178;
--card-w: 400px; --ease: cubic-bezier(0.22, 1, 0.36, 1);
카드는 라운드 36px, 흰색→연회색 그라디언트 배경, 큰 블러 그림자로 떠 있는 느낌.
색상은 컴포넌트 규칙 안에 하드코딩하지 말고 위 토큰만 사용(brand-avatar 배경색만 예외 — JSON에서
받은 값을 인라인으로 주입).

## 반응형
480px 이하: --card-w를 min(400px, 88vw)로, 하단 액션 3버튼이 줄바꿈(사이즈+담기는 각각
100% 폭, 360도 버튼은 오른쪽 정렬로 이동).

## 접근성
aria-expanded(사이즈 드롭다운 열림 상태 단일 판단 기준), aria-pressed(찜 토글),
role="listbox"/role="option" + aria-selected(사이즈 옵션), 토스트는 role="status"
aria-live="polite".

## 여러 상품을 가로로 나열할 때
카드 안 이미지 캐러셀(Swiper)과는 별개로, 상품 카드 자체가 여러 장일 때 넘기는 바깥
가로 스크롤은 Swiper를 쓰지 말고 CSS `scroll-snap-type: x mandatory` +
`scroll-snap-align: center`로 처리해줘.

## 최종 확인
1. 다운로드한 결과물을 열어서 css/, js/, data/ 폴더가 실제로 존재하는지, 그 안에
   style.css / app.js / products.json이 들어있는지 먼저 확인해줘. 폴더 없이 파일 4개가
   평평하게 나와 있으면 잘못 만들어진 것이니 폴더 구조부터 다시 요청해줘.
2. "python3 -m http.server"로 연 화면과 index.html을 더블클릭(file://)해서 연 화면이
   반드시 동일해야 해 — 이게 안 되면 십중팔구 products.json과 FALLBACK 내용이 어긋난 것이니
   둘을 맞춰줘.
```

---

## 참고

- 이 문서는 코드 산출물이 아니라 **재현용 참고 문서**다. `.claude/hooks/validate-product.sh`의
  검사 대상이 아니며, `data/products.json` / `js/app.js`를 수정해도 이 파일을 자동으로
  갱신해주지 않는다 — 스키마나 규칙을 크게 바꾸면 이 문서도 수동으로 맞춰야 한다.
- 실제 구현의 "왜"(Swiper cube 이펙트를 고른 이유, 사이즈 드롭다운을 커스텀으로 만든 이유 등)는
  `.claude/memory/decisions.md`에 더 자세히 기록되어 있다.

### 이미 평평한(flat) 파일로 받았다면

다른 AI가 폴더 구조 없이 `index.html`, `style.css`, `app.js`, `products.json` 4개를 한
계층에 평평하게 만들어줬다면, 아래처럼 직접 정리하면 된다:

1. 압축을 푼 폴더 안에 `css`, `js`, `data`, `imgs` 폴더 4개를 새로 만든다.
2. `style.css` → `css/style.css`로, `app.js` → `js/app.js`로, `products.json` →
   `data/products.json`로 각각 옮긴다. `index.html`은 그대로 루트에 둔다.
3. `index.html`을 열어 `<link>`/`<script>`/`fetch` 경로가 `style.css`, `app.js`,
   `products.json`처럼 폴더 없이 적혀 있다면 각각 `./css/style.css`, `./js/app.js`,
   `./data/products.json`로 고쳐준다.
4. `data/products.json`(그리고 `js/app.js`의 `FALLBACK`) 안 `images` 경로가 이미
   `./imgs/hooded-tracksuit-1.png` 형태로 되어 있는지 확인한다. 아니라면 위 "상품 이미지
   경로" 절의 6개 파일명으로 맞춰 고친다.
5. `imgs/` 폴더에 실제 상품 사진을 4번의 파일명과 **정확히 같은 이름**으로 넣는다
   (`0005/imgs/`에 이미 있는 파일을 그대로 복사해도 됨). 이름이 다르면 `<img onerror>`가
   자리표시자로 대체해버려 사진이 안 보인다.
6. 다시 더블클릭(file://)으로 열어서 카드와 사진이 정상적으로 보이는지 확인한다.
