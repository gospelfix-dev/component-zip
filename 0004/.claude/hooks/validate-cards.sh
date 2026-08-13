#!/usr/bin/env bash
# PostToolUse(Write|Edit) 훅
# data/cards.json 또는 js/app.js 를 수정한 직후 데이터 무결성을 검사한다.
#
# 검사 항목
#   1. cards.json 이 유효한 JSON 인가
#   2. 각 카드에 필수 필드(id / theme / name / contacts)가 있는가
#   3. id 가 중복되지 않는가
#   4. theme 이 알려진 값인가 (오타는 dark 로 흡수되어 화면상 티가 안 난다)
#   5. contacts[].type / actions 가 화이트리스트 안에 있는가
#   6. photo 경로의 파일이 실제로 존재하는가
#   7. app.js 의 FALLBACK 카드 id 가 cards.json 과 일치하는가
#
# 문제가 있으면 decision:block 으로 Claude 에게 피드백한다.

set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

file="$(cat | jq -r '.tool_input.file_path // .tool_response.filePath // empty')"

# 관심 있는 파일이 아니면 조용히 통과
case "$file" in
  */data/cards.json | */js/app.js) ;;
  *) exit 0 ;;
esac

python3 - "$ROOT" <<'PY'
import json, os, re, sys

root = sys.argv[1]
data_path = os.path.join(root, "data", "cards.json")
app_path = os.path.join(root, "js", "app.js")

THEMES = {"dark", "paper", "light", "blue", "navy"}
TYPES = {"mobile", "tel", "email", "web", "address"}
ACTIONS = {"call", "sms", "mail", "web", "map"}
SHAPES = {"hero", "circle", "portrait"}

problems = []

try:
    with open(data_path, encoding="utf-8") as f:
        data = json.load(f)
except FileNotFoundError:
    sys.exit(0)
except json.JSONDecodeError as e:
    problems.append(f"data/cards.json 파싱 실패 (line {e.lineno}): {e.msg}")
    data = None

if data is not None:
    cards = data.get("cards", [])
    if not cards:
        problems.append("data/cards.json 의 cards 가 비어 있습니다.")

    ids = []
    for i, card in enumerate(cards):
        label = card.get("id") or f"cards[{i}]"
        ids.append(card.get("id"))

        for key in ("id", "name", "theme"):
            if not card.get(key):
                problems.append(f"{label}: 필수 필드 '{key}' 가 없습니다.")

        theme = card.get("theme")
        if theme and theme not in THEMES:
            problems.append(
                f"{label}: theme '{theme}' 은 알 수 없는 값입니다 "
                f"(허용: {', '.join(sorted(THEMES))}). app.js 가 dark 로 흡수하므로 화면상 티가 안 납니다."
            )

        shape = card.get("photoShape")
        if shape and shape not in SHAPES:
            problems.append(f"{label}: photoShape '{shape}' 은 알 수 없는 값입니다 (허용: {', '.join(sorted(SHAPES))}).")

        accent = card.get("accent")
        if accent and not re.fullmatch(r"#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?", accent):
            problems.append(f"{label}: accent '{accent}' 이 유효한 hex 가 아닙니다.")

        contacts = card.get("contacts") or []
        if not contacts:
            problems.append(f"{label}: contacts 가 비어 있어 연락 수단이 없습니다.")

        for j, contact in enumerate(contacts):
            ctype = contact.get("type")
            if ctype not in TYPES:
                problems.append(
                    f"{label}.contacts[{j}]: type '{ctype}' 이 허용 목록에 없습니다 "
                    f"({', '.join(sorted(TYPES))})."
                )
            if not contact.get("value"):
                problems.append(f"{label}.contacts[{j}]: value 가 비어 있습니다.")
            for action in contact.get("actions") or []:
                if action not in ACTIONS:
                    problems.append(
                        f"{label}.contacts[{j}]: action '{action}' 이 허용 목록에 없습니다 "
                        f"({', '.join(sorted(ACTIONS))})."
                    )
            if ctype == "tel" and "sms" in (contact.get("actions") or []):
                problems.append(f"{label}.contacts[{j}]: 유선전화에 sms 액션이 붙어 있습니다.")

        photo = card.get("photo")
        if photo:
            resolved = os.path.normpath(os.path.join(root, photo.lstrip("./")))
            if not os.path.isfile(resolved):
                problems.append(f"{label}: photo 파일이 없습니다 -> {photo}")

    dupes = sorted({i for i in ids if i and ids.count(i) > 1})
    if dupes:
        problems.append(f"id 가 중복됩니다: {', '.join(dupes)} (아바타 시드가 겹쳐 같은 얼굴이 나옵니다)")

    # app.js 의 FALLBACK 과 id 동기화 확인
    try:
        with open(app_path, encoding="utf-8") as f:
            app_src = f.read()
    except FileNotFoundError:
        app_src = ""

    if app_src and "const FALLBACK" in app_src:
        fallback = app_src.split("const FALLBACK", 1)[-1].split("const THEMES", 1)[0]
        fb_ids = re.findall(r'id:\s*"([^"]+)"', fallback)
        missing = [i for i in ids if i and i not in fb_ids]
        extra = [i for i in fb_ids if i not in ids]
        if missing or extra:
            problems.append(
                "js/app.js 의 FALLBACK 이 cards.json 과 어긋납니다. "
                f"누락={missing or '없음'}, 불필요={extra or '없음'} "
                "(file:// 로 열 때 쓰이는 데이터이므로 함께 갱신하세요)"
            )

if problems:
    reason = "명함 데이터 정합성 문제:\n- " + "\n- ".join(problems)
    print(json.dumps({"decision": "block", "reason": reason}, ensure_ascii=False))
PY
