# 11. AI 이미지 제작 워크플로우 (CI 로고 · 배너 · SNS 광고 소재)

연두(yeondu) 브랜드의 CI 로고, 브랜드 톤 배너, SNS 광고 소재를 ChatGPT(GPT 이미지)로
제작하기 위한 작업 문서다. 두 부분으로 구성된다.

1. **제작 환경 세팅** — Claude Code에서 OpenAI API 키 없이 ChatGPT 구독 + Codex CLI로 이미지를 생성하는 방법
2. **브랜드 가이드 & 프롬프트 템플릿** — 이미지가 연두의 정체성을 벗어나지 않도록 하는 기준

> 브랜드 정체성의 정본은 루트 `README.md`, 색·타이포 수치의 정본은 `docs/02~09`다.
> 이 문서는 그 값을 **이미지 프롬프트로 옮기는 용도**이며, 값이 어긋나면 정본을 따른다.

## 참고 링크 (미확인)

- ChatGPT 공유 대화 "연두 홈페이지 콘텐츠 작성":
  https://chatgpt.com/share/6adf3c53-8cbc-83e8-8db5-5f6be75c459c
- 2026-10-26 기준 공유 페이지 본문이 길이 제한으로 잘려 **내용을 가져오지 못했다.**
  디자인 작업(CI·배너·SNS)은 이 대화 안에서 이어가는 것으로 하고, 거기서 확정된 로고
  방향·카피·소재 구성이 있으면 아래 "확정 사항 기록"에 옮겨 적는다.

---

## Part 1. 제작 환경 세팅 (Codex CLI 경유 GPT 이미지 생성)

OpenAI API 키 없이 **ChatGPT 구독**으로 Codex CLI를 통해 이미지를 만든다. Claude Code
데스크톱 앱 + macOS 기준.

### 1-1. 사전 확인

```bash
node -v                      # 18.18 이상
which codex && codex --version
codex login status
echo $CLAUDE_CONFIG_DIR      # 비어 있으면 설정 폴더는 ~/.claude, 아니면 그 경로
```

### 1-2. Codex CLI 설치 / 로그인

```bash
brew install codex           # Homebrew 없으면: npm i -g @openai/codex
codex login                  # 직접 실행 — ChatGPT 계정 브라우저 로그인
```

로그인은 사용자가 앱 내 터미널에서 직접 한다(에이전트가 대신하지 않는다).

### 1-3. OpenAI 공식 Claude Code 플러그인

```bash
claude plugin marketplace add openai/codex-plugin-cc
claude plugin install codex@openai-codex
```

설치 후 실제 설정 폴더(`CLAUDE_CONFIG_DIR` 기준)의 `settings.json`에
`"codex@openai-codex": true`가 들어갔는지 확인한다.

### 1-4. 권한 허용

설정 폴더 `settings.json`의 `permissions.allow`에 추가:

```json
"Bash(codex exec:*)"
```

- 자동(Auto) 권한 모드에서는 `settings.json` 수정이 Self-Modification으로 **차단**된다.
  우회하지 말고, 입력창 아래 권한 모드를 확인받는 모드로 바꾼 뒤 다시 시도한다.

### 1-5. 이미지 생성 명령 (핵심)

```bash
codex exec --skip-git-repo-check -s workspace-write \
  "Generate an image using your image generation tool: <프롬프트>. \
Save the resulting PNG file in the current directory as <파일명>.png."
```

- `--full-auto` 옵션은 codex-cli 0.161+ 에서 **제거됐다.** `-s workspace-write`를 쓴다.
- 1회 생성에 약 1분 걸린다. Bash 타임아웃은 **5분 이상**으로 준다.
- 결과 PNG는 **현재 작업 디렉터리**에 저장된다. 프로젝트에 쓸 이미지는 아래 저장 위치 규칙을 따른다.
- 생성된 이미지는 `Read`로만 열면 사용자에게 보이지 않는다. 대화창에는
  `SendUserFile(display: render)`로 띄운다.

### 1-6. 테스트 (세팅 검증용)

```bash
codex exec --skip-git-repo-check -s workspace-write \
  "Generate an image using your image generation tool: a cute orange cat sitting on a laptop keyboard, flat illustration style. Save the resulting PNG file in the current directory as cat.png."
```

테스트 산출물(`cat.png`)은 프로젝트에 남기지 않고 삭제한다.

### 1-7. 메모리 저장

"이미지 만들어줘"라고 하면 바로 위 방식(1-5)으로 생성하도록 명령어와 주의사항
(`--full-auto` 제거, 타임아웃 5분+, SendUserFile 표시)을 메모리에 저장해 둔다.

---

## Part 2. 연두 브랜드 가이드 (프롬프트에 반영할 기준)

### 2-1. 브랜드 핵심

| 항목 | 내용 |
| --- | --- |
| 브랜드명 | 연두 / 워드마크 `YEONDU` (대문자) |
| 포지셔닝 | **과하지 않은, 나에게 맞는 변화** |
| 이름의 의미 | 짙은 초록이 되기 전의 여린 새잎 색. 서서히 짙어지는 중인 변화 |
| 톤 | 차분함 · 정확함 · 자연스러움. 존댓말, 짧은 문장 |
| 스타일 레퍼런스 | Linear · Vercel · Notion처럼 여백이 넓고 평평한 UI |

### 2-2. 컬러 (이미지 프롬프트에 HEX로 명시)

| 토큰 | HEX | 이미지에서의 역할 |
| --- | --- | --- |
| `lime` (포인트) | `#EFF382` | 배경·면 채움 전용. 글자·아이콘 색으로 쓰지 않음 |
| `tint` | `#F7FAC4` | `lime`의 옅은 버전, 보조 배경 |
| `ink` | `#151515` | 글자·로고 선·`lime` 위 유일한 글자색 |
| `gray` | `#5F5F5C` | 보조 문구 |
| `surface` | `#F5F5F3` | 여백 배경 |
| `white` | `#FFFFFF` | 기본 배경 |

원칙은 **모노톤 + 포인트 1색(lime)**. 두 번째 강조색을 만들지 않는다.

### 2-3. 로고(CI) 방향

- 현재 확정: 대문자 `YEONDU` **타이포 워드마크**, Noto Sans KR Bold(700). 별도 심볼 없음.
- README의 **미확정 제안**: 외잎 하나(싹/새잎 실루엣)를 단색 `ink` 라인으로 그린 미니멀 모티프.
  심볼을 넣는다면 이 방향에서 시작하되, 채택은 사용자가 결정한다.
- 로고 시안 산출 기준: 흑백(`ink`/`white`) 단색 버전이 먼저 성립해야 하고, `lime` 배경
  버전과 흰 배경 버전을 함께 뽑는다. 최소 크기에서도 읽혀야 한다(파비콘용 "Y" 단독 변형 포함).

### 2-4. 하지 않는 것 (이미지에도 동일 적용)

- 그라데이션, 그림자, 테두리 카드, 글래스모피즘, 3D/광택 효과
- 세리프·이탤릭·장식 폰트
- 이모지 아이콘, 반짝이(스파클) 장식
- 극적인 비포·애프터 연출, "최고", "100% 만족" 같은 과장 문구
- 지어낸 후기·수치·수상 내역
- 포인트 컬러 2개 이상

### 2-5. 실제 인물·제품 사진 관련 주의

프로젝트 규칙상 실제 인물·제품 사진은 웹사이트에 쓰지 않는다(스톡 라이선스 회피).
AI 생성 이미지에서도 다음을 지킨다.

- 얼굴이 뚜렷한 **인물 사진은 가급적 피하고**, 소재는 일러스트·패턴·오브제·타이포 중심으로 구성한다.
- 인물이 필요하면 실존 인물이 연상되지 않는 일반적 표현(뒷모습·손·부분 컷)으로 한정하고,
  사용 전 사용자가 확인한다.
- 웹사이트(`index.html` 및 시안 페이지)에 넣을 때는 기존 규칙(placeholder 원칙, `data/content.json`의 `image` 필드 도입 절차)을 따른다. 광고·SNS용 소재는 웹사이트와 별개로 관리한다.

---

## Part 3. 프롬프트 템플릿

공통 접두어(모든 프롬프트 앞에 붙인다):

```
Brand: YEONDU, a calm Korean beauty brand. Positioning: "a change that is not excessive, fit for me".
Style: flat, minimal, lots of whitespace, no gradients, no shadows, no borders, no 3D, no glossy effects.
Palette only: lime #EFF382, pale lime #F7FAC4, ink #151515, gray #5F5F5C, off-white #F5F5F3, white #FFFFFF.
Lime is used only as a background/fill, never as text color. Text on lime is always ink.
Typeface feel: clean Korean sans-serif (Noto Sans KR), no serif, no italic, no decorative fonts.
No emoji, no sparkles, no exaggerated claims.
```

### 3-1. CI 로고

```
<공통 접두어>
Create a logo sheet for "YEONDU": uppercase geometric sans-serif wordmark, bold weight, generous letter spacing.
Show 3 variations on one canvas: (1) ink on white, (2) ink on lime #EFF382, (3) white on ink #151515.
Optional variation (4): the wordmark with a single minimal sprout/leaf line mark in ink, thin uniform stroke.
Flat vector look, centered, large margins. Save as logo-sheet.png.
```

### 3-2. 배너 (가로형, 웹/이벤트)

```
<공통 접두어>
Wide banner 1920x720. Lime #EFF382 solid background, large ink headline in Korean:
"과하지 않은, 나에게 맞는 변화", small gray-ink subtext "연두는 피부 본연의 리듬을 살핍니다.",
small ink button-like label "예약하기" on white rounded rectangle (6px radius).
Right side: an abstract single-leaf line illustration in ink or a soft tint #F7FAC4 shape. No photos of people.
```

### 3-3. SNS 광고 소재

| 용도 | 비율 | 구성 |
| --- | --- | --- |
| 인스타 피드 | 1:1 / 4:5 | 한 문장 카피 + 워드마크 + 단색 배경 |
| 스토리/릴스 커버 | 9:16 | 상단 워드마크, 중앙 카피, 하단 CTA 라벨 |
| 카드뉴스 | 1:1 시리즈 | 표지(lime) → 설명(white/surface) → 마무리 CTA(lime) |

```
<공통 접두어>
Instagram feed post 1080x1350. Background lime #EFF382. Center: Korean copy in ink, bold, left-aligned:
"<한 문장 카피>". Bottom-left small uppercase wordmark YEONDU in ink. Plenty of empty space.
No people, no product photos, no decoration other than one minimal leaf line mark.
```

카피 후보(README 기존 문구 기반, 신규 문구는 사용자 확인 후 확정):

- 과하지 않은, 나에게 맞는 변화
- 피부를 대하는 방식은 늘 같습니다.
- 짙은 초록이 되기 전 여린 새잎처럼, 무리하지 않는 속도로.
- 꼭 필요한 관리만 권해 드립니다.

### 3-4. 한글 텍스트 주의

이미지 생성 모델은 한글 글자를 깨뜨리는 경우가 있다. 생성 후 오탈자를 반드시 확인하고,
깨지면 (a) 텍스트 없는 배경만 생성한 뒤 Figma/HTML에서 텍스트를 얹거나 (b) 문구를 짧게 줄여
재생성한다. 로고 워드마크는 최종적으로 폰트 기반 벡터로 다시 제작하는 것을 권장한다.

---

## Part 4. 저장 위치 & 파일명 규칙

생성물은 웹사이트 에셋(`assets/imgs/`)과 섞지 않는다.

```
brand-assets/
  logo/        logo-sheet-v1.png, logo-wordmark-ink.png ...
  banner/      banner-main-1920x720-v1.png ...
  sns/         feed-1x1-01.png, story-9x16-01.png, card-01~05.png ...
  prompts/     사용한 최종 프롬프트 기록 (선택)
```

- 파일명: `용도-규격-번호-v버전.png` (예: `feed-4x5-01-v2.png`)
- 사이트에 실제로 쓰는 이미지만 리사이즈/압축해서 `assets/imgs/`로 옮긴다
  (기존 규칙: 표시 크기에 맞춰 리사이즈 후 JPEG 변환).

## 전용 에이전트

`.claude/agents/brand-image-generator.md` — 이 문서의 Part 1~4를 규칙으로 내장한 이미지 생성 전용
서브에이전트. "이미지 만들어줘 / 로고 시안 / 인스타 소재" 요청이 오면 이 에이전트에 위임한다.
독립적인 여러 장은 병렬 생성하고(최대 4개), 결과 이미지 표시는 부모 세션이 맡는다.

## 확정 사항 기록 (작업하며 채우기)

- [ ] ChatGPT 공유 대화에서 확정된 로고 방향:
- [ ] 확정 카피:
- [ ] 심볼(외잎) 채택 여부:
- [ ] 1차 SNS 소재 목록:
