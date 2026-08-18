#!/usr/bin/env bash
# PostToolUse(Write|Edit) 훅
# data/products.json 또는 js/app.js 를 수정한 직후 데이터 무결성을 검사한다.
#
# 검사 항목
#   1. products.json 이 유효한 JSON 인가
#   2. 각 상품에 필수 필드(id / categoryIcon / images / title / brand / price.discounted / sizes)가 있는가
#   3. id 가 중복되지 않는가
#   4. categoryIcon 이 index.html 의 SVG 스프라이트에 실제로 존재하는가
#   5. brand.color 가 유효한 hex 인가
#   6. price.discounted 가 price.original 보다 크지 않은가 (할인가인데 더 비싸면 오타 가능성)
#   7. app.js 의 FALLBACK 상품 id 가 products.json 과 일치하는가
#
# 문제가 있으면 decision:block 으로 Claude 에게 피드백한다.

set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

file="$(cat | jq -r '.tool_input.file_path // .tool_response.filePath // empty')"

# 관심 있는 파일이 아니면 조용히 통과
case "$file" in
  */data/products.json | */js/app.js) ;;
  *) exit 0 ;;
esac

python3 - "$ROOT" <<'PY'
import json, os, re, sys

root = sys.argv[1]
data_path = os.path.join(root, "data", "products.json")
app_path = os.path.join(root, "js", "app.js")
html_path = os.path.join(root, "index.html")

problems = []

try:
    with open(data_path, encoding="utf-8") as f:
        data = json.load(f)
except FileNotFoundError:
    sys.exit(0)
except json.JSONDecodeError as e:
    problems.append(f"data/products.json 파싱 실패 (line {e.lineno}): {e.msg}")
    data = None

known_icons = set()
try:
    with open(html_path, encoding="utf-8") as f:
        known_icons = set(re.findall(r'<symbol id="ico-([a-z0-9-]+)"', f.read()))
except FileNotFoundError:
    pass

if data is not None:
    products = data.get("products", [])
    if not products:
        problems.append("data/products.json 의 products 가 비어 있습니다.")

    ids = []
    for i, product in enumerate(products):
        label = product.get("id") or f"products[{i}]"
        ids.append(product.get("id"))

        for key in ("id", "categoryIcon", "images", "title", "brand", "price", "sizes"):
            if not product.get(key):
                problems.append(f"{label}: 필수 필드 '{key}' 가 없습니다.")

        icon = product.get("categoryIcon")
        if icon and known_icons and icon not in known_icons:
            problems.append(
                f"{label}: categoryIcon '{icon}' 이 index.html 스프라이트에 없습니다 "
                f"(존재: {', '.join(sorted(known_icons)) or '없음'})."
            )

        images = product.get("images") or []
        if not isinstance(images, list) or not images:
            problems.append(f"{label}: images 가 비어 있습니다 (최소 1개 필요).")

        brand = product.get("brand") or {}
        if brand:
            if not brand.get("name"):
                problems.append(f"{label}.brand: name 이 없습니다.")
            color = brand.get("color")
            if color and not re.fullmatch(r"#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?", color):
                problems.append(f"{label}.brand: color '{color}' 이 유효한 hex 가 아닙니다.")

        price = product.get("price") or {}
        if price:
            if price.get("discounted") is None:
                problems.append(f"{label}.price: discounted 가 없습니다.")
            original = price.get("original")
            discounted = price.get("discounted")
            if isinstance(original, (int, float)) and isinstance(discounted, (int, float)):
                if discounted > original:
                    problems.append(
                        f"{label}.price: discounted({discounted}) 가 original({original}) 보다 큽니다."
                    )

        sizes = product.get("sizes") or []
        if not isinstance(sizes, list) or not sizes:
            problems.append(f"{label}: sizes 가 비어 있습니다 (최소 1개 필요).")

    dupes = sorted({i for i in ids if i and ids.count(i) > 1})
    if dupes:
        problems.append(f"id 가 중복됩니다: {', '.join(dupes)}")

    # app.js 의 FALLBACK 과 id 동기화 확인
    try:
        with open(app_path, encoding="utf-8") as f:
            app_src = f.read()
    except FileNotFoundError:
        app_src = ""

    if app_src and "const FALLBACK" in app_src:
        fallback = app_src.split("const FALLBACK", 1)[-1]
        fb_ids = re.findall(r'id:\s*"([^"]+)"', fallback)
        missing = [i for i in ids if i and i not in fb_ids]
        extra = [i for i in fb_ids if i not in ids]
        if missing or extra:
            problems.append(
                "js/app.js 의 FALLBACK 이 products.json 과 어긋납니다. "
                f"누락={missing or '없음'}, 불필요={extra or '없음'} "
                "(file:// 로 열 때 쓰이는 데이터이므로 함께 갱신하세요)"
            )

if problems:
    reason = "상품 데이터 정합성 문제:\n- " + "\n- ".join(problems)
    print(json.dumps({"decision": "block", "reason": reason}, ensure_ascii=False))
PY
