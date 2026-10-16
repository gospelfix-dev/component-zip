# design.shadcn.md — shadcn/ui 테마 매핑 (제안)

`DESIGN.md`에는 shadcn/ui 관련 내용이 없습니다. 이 파일은 [09-shadcn-tokens.md](09-shadcn-tokens.md)의
CSS 변수/테마 값을 shadcn/ui가 기대하는 변수명으로 옮겨 쓸 때 참고하는 **구현 보조 문서**이며,
전체가 `(제안)`입니다 — 보드에 없는 값은 추가하지 않았고, [02-colors.md](02-colors.md) ·
[05-radius.md](05-radius.md)의 토큰을 그대로 매핑만 했습니다.

## globals.css 변수 매핑

shadcn/ui 기본 스캐폴드의 `--background` / `--primary` 등 네이밍에 맞춰 옮기면 다음과
같습니다 (HSL이 아니라 원본 HEX 값을 그대로 사용 — shadcn 기본 템플릿은 HSL을 쓰지만
이 프로젝트는 "9. 하지 말 것"에 없는 임의 변환을 하지 않기 위해 HEX를 유지합니다):

```css
:root {
  --background: #FFFFFF;        /* white */
  --foreground: #151515;        /* ink */

  --muted: #F5F5F3;             /* surface */
  --muted-foreground: #5F5F5C;  /* gray */

  --primary: #EFF382;           /* lime */
  --primary-hover: #E3E868;     /* limeHover */
  --primary-foreground: #151515;/* ink — lime 위에는 반드시 ink, white는 못 읽힘(대비 1.1:1) */

  --secondary: #F5F5F3;         /* surface */
  --secondary-hover: #ECECE9;   /* surfaceHover */
  --secondary-foreground: #151515; /* ink */

  --accent: #F7FAC4;            /* tint */
  --accent-foreground: #151515; /* ink — tint 배경의 태그 글자도 ink(lime 계열은 글자색 금지) */

  --radius: 6px;                /* radius-base — 태그는 개별로 16px(radius-pill) 지정 */
}
```

## 컴포넌트 매핑 메모

- shadcn `Button` → Primary variant는 `bg-primary text-primary-foreground hover:bg-[--primary-hover]`,
  Secondary variant는 `bg-secondary text-secondary-foreground hover:bg-[--secondary-hover]`로
  구성합니다. 규격(높이 48, 모서리 6)은 [07-components.md](07-components.md) 참고.
- shadcn `Badge`(태그)는 `--radius`가 아니라 `rounded-full`(완전 둥글게)을 직접 지정합니다 —
  전역 `--radius: 6px`를 그대로 쓰면 안 됩니다([05-radius.md](05-radius.md)의 2단 체계 참고).
- shadcn 기본 `Card`는 `border` + `shadow`를 기본값으로 둡니다. 이 프로젝트는
  [06-elevation.md](06-elevation.md) 규칙상 `border-0 shadow-none`으로 반드시 덮어써야 합니다.
- 폰트는 Tailwind `fontFamily.sans`에 `var(--font-sans)`(Noto Sans KR)만 연결하고, shadcn
  기본 폰트 스택을 남겨두지 않습니다.
