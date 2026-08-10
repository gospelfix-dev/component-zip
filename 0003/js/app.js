/**
 * app.js
 * data/palettes.json 을 읽어 카드 컴포넌트를 렌더링한다.
 * file:// 로 직접 열면 fetch 가 CORS 로 막히므로 인라인 fallback 데이터를 사용한다.
 */
(function () {
  "use strict";

  var DATA_URL = "./data/palettes.json";

  // fetch 실패 시 사용할 최소 데이터 (json 파일과 동일하게 유지할 것)
  var FALLBACK = {
    section: {
      eyebrow: "Ice cream collection",
      title: "Palette Series",
      subtitle: "Three flavors, three moods"
    },
    items: [
      {
        id: "berry-bliss",
        title: "Berry Bliss",
        script: "palette",
        description: "Crunchy coconut armor over a sweet pastel chocolate coat",
        image: "./imgs/Gemini_Generated_Image_01.png",
        art: {
          coat: "#f7efe6", coatShade: "#e7d6c6", core: "#f6e2e6", sauce: "#8e1230",
          chips: ["#e05a5a", "#c8324c", "#f0b8b8", "#ffffff"], stick: "#e0a97d"
        }
      },
      {
        id: "ocean-secret",
        title: "Ocean Secret",
        script: "palette",
        description: "Crisp pastel blue chocolate shell topped with crunchy coconut flakes",
        image: "./imgs/Gemini_Generated_Image_02.png",
        art: {
          coat: "#9dc6e8", coatShade: "#7cabd4", core: "#dbeaf7", sauce: "#12356b",
          chips: ["#1b4b91", "#3f74bb", "#ffffff", "#cfe3f5"], stick: "#e0a97d"
        }
      },
      {
        id: "green-oasis",
        title: "Green Oasis",
        script: "palette",
        description: "Smooth pistachio ice cream with a vivid matcha green tea core",
        image: "./imgs/Gemini_Generated_Image_03.png",
        art: {
          coat: "#a9c98a", coatShade: "#8bb069", core: "#e3edd2", sauce: "#2f5d1e",
          chips: ["#3d7a24", "#6ba043", "#ffffff", "#d7e8bd"], stick: "#e0a97d"
        }
      }
    ]
  };

  var grid = document.getElementById("paletteGrid");
  var template = document.getElementById("paletteCardTemplate");

  function renderHead(section) {
    Object.keys(section || {}).forEach(function (key) {
      var el = document.querySelector('[data-bind="' + key + '"]');
      if (el) el.textContent = section[key];
    });
  }

  function createCard(item) {
    var node = template.content.firstElementChild.cloneNode(true);

    node.dataset.id = item.id || "";
    node.querySelector(".palette-card__name").textContent = item.title || "";
    node.querySelector(".palette-card__script").textContent = item.script || "";
    node.querySelector(".palette-card__desc").textContent = item.description || "";

    var media = node.querySelector(".palette-card__media");
    if (item.image) {
      var img = new Image();
      img.src = item.image;
      img.alt = item.title || "";
      img.loading = "lazy";
      media.appendChild(img);
    } else {
      // 사진이 없으면 SVG 로 대체
      media.innerHTML = window.Popsicle.render(item.art, item.id || item.title);
      var svg = media.querySelector("svg");
      if (svg) svg.setAttribute("aria-label", item.title || "ice cream bar");
    }

    return node;
  }

  function render(data) {
    renderHead(data.section);

    var items = (data.items || []).slice();
    if (!items.length) {
      message("표시할 항목이 없습니다.");
      return;
    }

    var frag = document.createDocumentFragment();
    items.forEach(function (item) {
      frag.appendChild(createCard(item));
    });

    grid.innerHTML = "";
    grid.appendChild(frag);
  }

  function message(text) {
    grid.innerHTML = '<p class="grid-message">' + text + "</p>";
  }

  message("로딩 중…");

  fetch(DATA_URL, { cache: "no-store" })
    .then(function (res) {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.json();
    })
    .then(render)
    .catch(function (err) {
      // file:// 로 열었거나 JSON 을 못 읽은 경우 → 내장 데이터로 렌더
      console.warn("[palette] JSON 로드 실패, fallback 데이터 사용:", err.message);
      render(FALLBACK);
    });
})();
