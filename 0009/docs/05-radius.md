# 05. 모서리

`DESIGN.md` "4. 간격·모서리" 중 모서리 부분에서 옮겨왔습니다.

- 모서리: 버튼·카드·이미지 `6px`, 태그만 완전 둥글게(`16px` 이상).
- 플랫하게: `border`와 `box-shadow`를 쓰지 않습니다. 구분은 배경색 차이
  (`white` ↔ `surface`)로 합니다 — 그림자/입체감 정책은
  [06-elevation.md](06-elevation.md) 참고.

## 스케일 토큰

| 토큰 | 값 | 용도 |
| --- | --- | --- |
| `radius-base` | 6px | 버튼, 카드, 이미지 |
| `radius-pill` | 16px 이상 | 태그 |

구현용 CSS 변수는 [09-shadcn-tokens.md](09-shadcn-tokens.md)를 참고하세요.
