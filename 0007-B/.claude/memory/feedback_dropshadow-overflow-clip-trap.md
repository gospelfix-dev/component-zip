---
name: feedback_dropshadow-overflow-clip-trap
description: "overflow:hidden 조상(특히 Swiper .swiper 컨테이너) 안에서 filter:drop-shadow 를 쓰면 그림자 번짐이 사각형으로 잘려 부자연스러운 박스 테두리가 생긴다"
metadata:
  type: feedback
---

히어로(`0007-B`)에 Swiper 캐러셀을 도입하면서 기존 `.hero-meat-main{ filter:drop-shadow(0 30px
50px rgba(0,0,0,.55)); }`를 그대로 슬라이드 안에 넣었더니, 투명 배경 이미지(`meat_samgyeop.png`
등)에서 사각형 클리핑 테두리가 또렷하게 보이는 버그가 났다. 사용자가 스크린샷으로
"네모 박스가 있어서 그림자가 이상해보여"라고 지적해서 발견했다.

**원인**: Swiper 라이브러리는 `.swiper` 컨테이너에 기본적으로 `overflow:hidden`을 건다(비활성
슬라이드를 감추기 위한 필수 동작이라 끌 수 없다 — 끄면 옆 슬라이드가 미리 보여버린다).
`drop-shadow`의 블러 번짐 반경(대략 `blur * 1.5 + offset`, 예: `blur:50px offset-y:30px`면
아래로 ~105px, 옆으로 ~75px까지 번진다)이 슬라이드 안쪽 여백(패딩)보다 크면, 그림자가 사그라들기
전에 `overflow:hidden` 경계에서 그대로 잘려 하드 엣지(=눈에 보이는 사각형 테두리)가 생긴다.
불투명 배경 이미지에서는 안 보이지만(배경이 이미 박스를 다 채우고 있어서), 투명 배경 컷아웃
이미지에서는 클리핑 경계와 배경색 차이가 그대로 드러난다.

**Why**: `overflow:hidden` + `filter`의 상호작용은 CSS 스펙상 당연한 동작이라 브라우저 버그가
아니다 — 슬라이드가 하나만 필요한 캐러셀(Swiper 등)에 그림자 있는 이미지를 넣을 때 항상 재현되는
구조적 함정이다.

**How to apply**: Swiper(또는 다른 `overflow:hidden` 캐러셀) 슬라이드 안에 `drop-shadow`가 걸린
이미지를 넣을 때는 둘 중 하나로 맞춘다 — (1) 슬라이드 패딩을 그림자 번짐 반경보다 넉넉히 키우거나,
(2) 그림자의 `blur`/`offset`을 줄여 번짐이 기존 패딩 안에 다 들어오게 한다. 이 프로젝트는 (2)를
택해 `drop-shadow(0 30px 50px rgba(0,0,0,.55))` → `drop-shadow(0 14px 20px rgba(0,0,0,.5))`로
줄이고 슬라이드 패딩을 `24px` → `48px`로 늘렸다(`assets/css/style.css`의 `.hero-swiper
.swiper-slide`/`.hero-meat-main`). 컨테이너 자체를 음수 마진으로 부풀려 여백을 버는 방법도
있지만, 이웃 슬라이드가 새어 보이지 않게 폭 계산을 맞춰야 해서 더 복잡하다 — 간단한 쪽을 먼저
시도할 것.
