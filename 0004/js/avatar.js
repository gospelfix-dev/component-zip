/**
 * avatar.js
 * 인물 사진(`photo`)이 없을 때 쓰는 SVG 대체 일러스트 생성기.
 *
 * 계약:  window.Avatar.render(seed, shape, accent) -> SVG 문자열
 *   seed   카드의 id. 같은 id 는 항상 같은 그림을 만든다(결정성).
 *   shape  "hero" | "circle" | "portrait"  — 같은 그림을 다르게 크롭한다.
 *   accent 카드 강조색. 배경 그라디언트를 여기서 파생시킨다.
 *
 * Math.random() 을 쓰지 않는 이유는 .claude/memory/decisions.md 참고.
 */
(function (global) {
  "use strict";

  /* ---------- 시드 난수 ---------- */

  /** 문자열 → 32bit 정수 해시 (djb2) */
  const hash = (str) => {
    let h = 5381;
    for (let i = 0; i < str.length; i += 1) {
      h = ((h << 5) + h + str.charCodeAt(i)) >>> 0;
    }
    return h;
  };

  /** 시드에서 0 이상 1 미만 값을 순차적으로 뽑는 생성기 (mulberry32) */
  const rngFrom = (seed) => {
    let t = seed >>> 0;
    return () => {
      t = (t + 0x6d2b79f5) >>> 0;
      let x = Math.imul(t ^ (t >>> 15), 1 | t);
      x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
      return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
    };
  };

  /* ---------- 색 유틸 ---------- */

  const toRgb = (hex) => {
    const v = hex.replace("#", "");
    const full = v.length === 3 ? v.split("").map((c) => c + c).join("") : v;
    return [
      parseInt(full.slice(0, 2), 16),
      parseInt(full.slice(2, 4), 16),
      parseInt(full.slice(4, 6), 16)
    ];
  };

  const toHex = ([r, g, b]) =>
    "#" + [r, g, b].map((n) => Math.max(0, Math.min(255, Math.round(n)))
      .toString(16).padStart(2, "0")).join("");

  /** color 를 target 쪽으로 ratio(0~1) 만큼 섞는다 */
  const mix = (color, target, ratio) => {
    const a = toRgb(color);
    const b = toRgb(target);
    return toHex(a.map((n, i) => n + (b[i] - n) * ratio));
  };

  /* ---------- 팔레트 ---------- */

  const SKIN = ["#f0d0b8", "#e6c1a3", "#dcaf90", "#f4dac6"];
  const SUIT = ["#2b3242", "#1e2733", "#34415c", "#262f3d", "#3a4050"];
  const SHIRT = ["#ffffff", "#f3f7fc", "#edf2f9"];
  const TIE = ["#1f3a68", "#7c2130", "#2f6146", "#3c4a63", "#8a6d2f"];
  const HAIR = ["#241c18", "#2e251f", "#181310"];

  const HAIR_PATH = [
    "M132 196c-4-58 22-86 63-86s67 28 63 86c-7-35-19-53-41-53-14 0-21 8-39 8-24 0-38 13-46 45z",
    "M131 200c-6-62 24-90 64-90s70 28 64 90c-4-40-24-58-64-58s-58 18-64 58z",
    "M132 198c-5-60 23-88 63-88s68 28 63 88c-8-36-14-47-46-53-20-4-34 6-42 16-9 11-30 17-38 37z"
  ];

  /* 같은 그림을 크롭만 달리해서 쓴다 (.claude/memory/decisions.md 참고).
     hero 는 글래스 박스가 하단을 덮으므로 얼굴이 상단 1/3 에 오도록 타이트하게 잡는다. */
  const VIEWBOX = {
    hero: "48 34 300 369",
    circle: "128 128 134 134",
    portrait: "88 100 214 268"
  };

  /* ---------- 렌더 ---------- */

  /**
   * @param {string} seed   카드 id
   * @param {string} shape  hero | circle | portrait
   * @param {string} accent 카드 강조색 hex
   * @returns {string} SVG 마크업
   */
  const render = (seed, shape, accent) => {
    const rand = rngFrom(hash(String(seed || "avatar")));
    const pick = (list) => list[Math.floor(rand() * list.length)];

    const base = accent && /^#[0-9a-f]{3,6}$/i.test(accent) ? accent : "#5a6478";
    const bgTop = mix(base, "#ffffff", 0.72);
    const bgBottom = mix(base, "#ffffff", 0.42);

    const skin = pick(SKIN);
    const skinShade = mix(skin, "#000000", 0.12);
    const suit = pick(SUIT);
    const suitDark = mix(suit, "#000000", 0.22);
    const shirt = pick(SHIRT);
    const tie = pick(TIE);
    const hair = pick(HAIR);
    const hairPath = pick(HAIR_PATH);
    const glasses = rand() > 0.55;

    const id = "av-" + hash(String(seed)).toString(36);
    const box = VIEWBOX[shape] || VIEWBOX.hero;

    return [
      '<svg class="avatar-svg" viewBox="' + box + '" preserveAspectRatio="xMidYMid slice"',
      ' role="img" xmlns="http://www.w3.org/2000/svg">',
      "<defs>",
      '<linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1">',
      '<stop offset="0" stop-color="' + bgTop + '"/>',
      '<stop offset="1" stop-color="' + bgBottom + '"/>',
      "</linearGradient>",
      "</defs>",

      /* 배경 */
      '<rect x="-40" y="-40" width="470" height="560" fill="url(#' + id + ')"/>',

      /* 목 */
      '<path d="M170 244h50v78q0 26-25 26t-25-26z" fill="' + skinShade + '"/>',

      /* 재킷 */
      '<path d="M14 480c0-102 86-148 181-152 95 4 181 50 181 152z" fill="' + suit + '"/>',

      /* 셔츠 */
      '<path d="M195 328 152 348l-12 132h110l-12-132z" fill="' + shirt + '"/>',

      /* 라펠 */
      '<path d="M152 348 190 386l-22 94h-30z" fill="' + suitDark + '"/>',
      '<path d="M238 348 200 386l22 94h30z" fill="' + suitDark + '"/>',

      /* 셔츠 칼라 */
      '<path d="M168 336 195 366l27-30-14-10-13 10-13-10z" fill="' + mix(shirt, "#000", 0.06) + '"/>',

      /* 넥타이 */
      '<path d="M186 362h18l6 20-15 12-15-12z" fill="' + mix(tie, "#fff", 0.12) + '"/>',
      '<path d="M195 394 208 402l-5 78h-16l-5-78z" fill="' + tie + '"/>',

      /* 귀 */
      '<ellipse cx="136" cy="206" rx="10" ry="16" fill="' + skinShade + '"/>',
      '<ellipse cx="254" cy="206" rx="10" ry="16" fill="' + skinShade + '"/>',

      /* 얼굴 */
      '<ellipse cx="195" cy="198" rx="60" ry="74" fill="' + skin + '"/>',

      /* 눈썹·눈 */
      '<path d="M164 187q11-6 22 0" stroke="' + hair + '" stroke-width="3.4" fill="none" stroke-linecap="round"/>',
      '<path d="M204 187q11-6 22 0" stroke="' + hair + '" stroke-width="3.4" fill="none" stroke-linecap="round"/>',
      '<ellipse cx="175" cy="203" rx="4.2" ry="5" fill="#33302e"/>',
      '<ellipse cx="215" cy="203" rx="4.2" ry="5" fill="#33302e"/>',
      '<path d="M185 237q10 6 20 0" stroke="' + skinShade + '" stroke-width="3.4" fill="none" stroke-linecap="round"/>',

      /* 안경 (시드에 따라) */
      glasses
        ? '<g fill="none" stroke="#2f3640" stroke-width="3.4" opacity="0.85">' +
          '<rect x="156" y="190" width="38" height="26" rx="9"/>' +
          '<rect x="198" y="190" width="38" height="26" rx="9"/>' +
          '<path d="M194 201h4M156 197l-14-4M236 197l14-4"/>' +
          "</g>"
        : "",

      /* 머리 */
      '<path d="' + hairPath + '" fill="' + hair + '"/>',
      "</svg>"
    ].join("");
  };

  global.Avatar = { render };
})(window);
