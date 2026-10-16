# 09. 구현 토큰

`DESIGN.md` "10. 구현 토큰" 섹션에서 옮겨왔습니다.

## CSS 변수

```css
:root {
  --color-ink: #151515;
  --color-gray: #5F5F5C;
  --color-surface: #F5F5F3;
  --color-surface-hover: #ECECE9;
  --color-lime: #EFF382;
  --color-lime-hover: #E3E868;
  --color-tint: #F7FAC4;
  --color-white: #FFFFFF;

  --radius-base: 6px;
  --radius-pill: 16px;

  --space-1: 8px;
  --space-2: 12px;
  --space-3: 16px;
  --space-4: 24px;
  --space-6: 48px;

  --font-sans: 'Noto Sans KR', sans-serif;
  --transition-base: background-color 0.15s;
}
```

## styled-components 테마 (Next.js + TypeScript)

```ts
export const theme = {
  color: {
    ink: '#151515',
    gray: '#5F5F5C',
    surface: '#F5F5F3',
    surfaceHover: '#ECECE9',
    lime: '#EFF382',
    limeHover: '#E3E868',
    tint: '#F7FAC4',
    white: '#FFFFFF',
  },
  radius: { base: '6px', pill: '16px' },
  space: { s1: '8px', s2: '12px', s3: '16px', s4: '24px', s6: '48px' },
  font: {
    h1: { size: '32px', line: '40px', weight: 700 },
    h2: { size: '22px', line: '30px', weight: 700 },
    body: { size: '16px', line: '26px', weight: 400 },
    button: { size: '15px', line: '24px', weight: 500 },
    caption: { size: '13px', line: '20px', weight: 500 },
  },
} as const;
```

폰트는 `next/font/google`의 `Noto_Sans_KR`(weight 400, 500, 700)로 불러옵니다.

shadcn/ui 컴포넌트에 이 토큰을 연결하는 방법은 [design.shadcn.md](design.shadcn.md)를
참고하세요.
