/**
 * popsicle.js
 * 사진 에셋 대신 사용할 아이스크림 바 SVG 생성기.
 * data/palettes.json 의 `art` 색상값을 받아 한 입 베어문 아이스크림을 그린다.
 *
 * window.Popsicle.render(art, seed) -> SVG 문자열
 */
(function (global) {
  "use strict";

  var VB = { w: 200, h: 430 };

  // 결정적 난수 (같은 seed → 항상 같은 토핑 배치)
  function makeRandom(seed) {
    var s = seed >>> 0 || 1;
    return function () {
      s ^= s << 13; s >>>= 0;
      s ^= s >> 17;
      s ^= s << 5;  s >>>= 0;
      return s / 4294967296;
    };
  }

  function hashSeed(str) {
    var h = 2166136261;
    for (var i = 0; i < String(str).length; i++) {
      h ^= String(str).charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  // 아이스크림 몸통 (둥근 막대 형태)
  var BODY = {
    x: 26,
    y: 18,
    w: 148,
    h: 290,
    r: 66
  };

  // 베어문 자국 (우상단)
  var BITE = { cx: 176, cy: 66, r: 62 };

  function chips(art, rand) {
    var out = "";
    var palette = art.chips || ["#ffffff"];
    for (var i = 0; i < 46; i++) {
      var cx = BODY.x + 8 + rand() * (BODY.w - 16);
      var cy = BODY.y + 12 + rand() * (BODY.h - 24);

      // 베어문 영역과 그 주변은 비운다
      var d = Math.hypot(cx - BITE.cx, cy - BITE.cy);
      if (d < BITE.r + 14) continue;

      var rx = 3 + rand() * 4.5;
      var ry = 2 + rand() * 3.5;
      var rot = rand() * 180;
      var fill = palette[Math.floor(rand() * palette.length)];
      var op = (0.55 + rand() * 0.45).toFixed(2);

      out +=
        '<ellipse cx="' + cx.toFixed(1) + '" cy="' + cy.toFixed(1) + '" ' +
        'rx="' + rx.toFixed(1) + '" ry="' + ry.toFixed(1) + '" ' +
        'fill="' + fill + '" opacity="' + op + '" ' +
        'transform="rotate(' + rot.toFixed(1) + ' ' + cx.toFixed(1) + ' ' + cy.toFixed(1) + ')" />';
    }
    return out;
  }

  function render(art, seedSource) {
    var a = art || {};
    var coat = a.coat || "#f2e8dd";
    var coatShade = a.coatShade || "#dccbb9";
    var core = a.core || "#ffffff";
    var sauce = a.sauce || "#8e1230";
    var stick = a.stick || "#e0a97d";

    var uid = "p" + hashSeed(seedSource || "popsicle").toString(36);
    var rand = makeRandom(hashSeed(seedSource || "popsicle"));

    return [
      '<svg viewBox="0 0 ' + VB.w + ' ' + VB.h + '" xmlns="http://www.w3.org/2000/svg" role="img">',
        '<defs>',
          '<clipPath id="' + uid + '-body">',
            '<rect x="' + BODY.x + '" y="' + BODY.y + '" width="' + BODY.w + '" height="' + BODY.h + '" rx="' + BODY.r + '" />',
          '</clipPath>',
          '<linearGradient id="' + uid + '-coat" x1="0" y1="0" x2="1" y2="0.35">',
            '<stop offset="0%" stop-color="' + coatShade + '" />',
            '<stop offset="42%" stop-color="' + coat + '" />',
            '<stop offset="100%" stop-color="' + coatShade + '" />',
          '</linearGradient>',
          '<linearGradient id="' + uid + '-stick" x1="0" y1="0" x2="1" y2="0">',
            '<stop offset="0%" stop-color="' + stick + '" stop-opacity="0.75" />',
            '<stop offset="45%" stop-color="' + stick + '" />',
            '<stop offset="100%" stop-color="' + stick + '" stop-opacity="0.7" />',
          '</linearGradient>',
        '</defs>',

        // 나무 막대
        '<rect x="86" y="285" width="28" height="128" rx="14" fill="url(#' + uid + '-stick)" />',

        '<g clip-path="url(#' + uid + '-body)">',
          // 코팅
          '<rect x="' + BODY.x + '" y="' + BODY.y + '" width="' + BODY.w + '" height="' + BODY.h + '" fill="url(#' + uid + '-coat)" />',

          // 단면: 크림 → 소스
          '<ellipse cx="128" cy="96" rx="58" ry="72" fill="' + core + '" />',
          '<path d="M118 58 C150 66 156 106 132 138 C112 164 92 150 96 122 C99 98 92 78 118 58 Z" fill="' + sauce + '" />',

          // 베어문 자국 (카드 배경으로 파내기)
          '<circle cx="' + BITE.cx + '" cy="' + BITE.cy + '" r="' + BITE.r + '" fill="var(--c-card, #fdfbf7)" />',

          // 토핑
          chips(a, rand),

          // 하단 음영
          '<ellipse cx="100" cy="300" rx="86" ry="34" fill="' + coatShade + '" opacity="0.45" />',
        '</g>',

        // 바닥 그림자
        '<ellipse cx="100" cy="418" rx="46" ry="7" fill="#2b1a2c" opacity="0.08" />',
      '</svg>'
    ].join("");
  }

  global.Popsicle = { render: render };
})(window);
