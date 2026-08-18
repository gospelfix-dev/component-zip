(function (global) {
  "use strict";

  // file:// 로 열면 fetch 가 CORS 로 막히므로 data/products.json 과 동일한 내용을 복제해 둔다.
  // products.json 을 고치면 이 상수도 함께 갱신한다 (.claude/hooks/validate-product.sh 가 검사).
  const FALLBACK = {
    section: {
      eyebrow: "Product Card",
      title: "상품 썸네일 카드",
      subtitle: "이미지·사이즈·가격을 하나의 카드로 보여주는 커머스 컴포넌트"
    },
    products: [
      {
        id: "light-hooded-tracksuit",
        categoryIcon: "beanie",
        images: [
          "./imgs/hooded-tracksuit-1.png",
          "./imgs/hooded-tracksuit-2.png",
          "./imgs/hooded-tracksuit-3.png"
        ],
        badge: { text: "-10%" },
        title: "WHERES RUDOLPH 6Panel Cap_washed red",
        brand: { name: "WinterElegance", initial: "W", color: "#E8871E" },
        price: { currency: "₩", original: 49000, discounted: 44100 },
        sizes: ["XS", "S", "M", "L", "XL"]
      },
      {
        id: "quilted-puffer-vest",
        categoryIcon: "hanger",
        images: [
          "./imgs/quilted-puffer-vest-1.png",
          "./imgs/quilted-puffer-vest-2.png",
          "./imgs/quilted-puffer-vest-3.png"
        ],
        badge: { text: "-10%" },
        title: "WHERES RUDOLPH 6Panel Cap_navy",
        brand: { name: "NordicPeak", initial: "N", color: "#2F6BD8" },
        price: { currency: "₩", original: 49000, discounted: 44100 },
        sizes: ["S", "M", "L"]
      }
    ]
  };

  const tpl = (id) => document.getElementById(id).content.firstElementChild.cloneNode(true);
  const setText = (el, value) => {
    if (!el) return;
    if (value === undefined || value === null || value === "") {
      el.remove();
      return;
    }
    el.textContent = value;
  };
  const formatMoney = (currency, amount) => {
    const fractionDigits = currency === "₩" ? 0 : 2;
    return `${currency}${amount.toLocaleString("en-US", {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits
    })}`;
  };

  let toastTimer = null;
  function showToast(message) {
    const toast = document.getElementById("toast");
    if (!toast) return;
    toast.textContent = message;
    toast.dataset.show = "true";
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.dataset.show = "false";
    }, 1800);
  }

  function bindImageCarousel(card, images) {
    const wrapper = card.querySelector(".swiper-wrapper");
    const nav = card.querySelector(".card__photo-nav");
    const prev = card.querySelector(".card__photo-prev");
    const next = card.querySelector(".card__photo-next");

    nav.dataset.single = images.length <= 1 ? "true" : "false";

    images.forEach((src) => {
      const slide = tpl("photoSlideTemplate");
      const photo = slide.querySelector(".card__photo");
      photo.src = src;
      photo.alt = "";
      photo.onerror = () => {
        // 상품 이미지는 사용자가 imgs/ 에 직접 넣는 값이다. 없을 때 img 를 숨기고
        // 형제 요소(.card__photo-fallback)의 자리표시자 패턴으로 대체한다.
        // img 를 display:none 처리하므로 브라우저의 "깨진 이미지" 아이콘도 함께 사라진다.
        photo.onerror = null;
        photo.removeAttribute("src");
        photo.dataset.fallback = "true";
      };
      wrapper.appendChild(slide);
    });

    // 렌더가 끝난(.swiper-wrapper 가 채워진) 뒤에만 초기화한다. 빈 DOM 에서 초기화하면
    // 슬라이드 수가 0으로 잡힌다 (.claude/rules/03-javascript.md).
    // effect:"cube" — 좌우로 미끄러지는 대신 상품이 입체적으로 회전하는 느낌을 낸다.
    new Swiper(card.querySelector(".card__swiper"), {
      effect: "cube",
      grabCursor: true,
      cubeEffect: { shadow: false, slideShadows: false },
      slidesPerView: 1,
      spaceBetween: 0,
      navigation: { nextEl: next, prevEl: prev },
      a11y: { prevSlideMessage: "이전 이미지", nextSlideMessage: "다음 이미지" }
    });
  }

  function bindWishlist(card) {
    const btn = card.querySelector(".card__wish");
    btn.addEventListener("click", () => {
      const pressed = btn.getAttribute("aria-pressed") === "true";
      btn.setAttribute("aria-pressed", String(!pressed));
      showToast(pressed ? "찜 목록에서 제거했습니다" : "찜 목록에 추가했습니다");
    });
  }

  function bindShare(card, product) {
    const btn = card.querySelector(".card__share");
    btn.addEventListener("click", async () => {
      const shareData = { title: product.title, text: product.title, url: location.href };
      if (navigator.share) {
        try {
          await navigator.share(shareData);
        } catch (err) {
          // 사용자가 공유를 취소한 경우는 정상 경로이므로 무시한다.
        }
        return;
      }
      if (navigator.clipboard) {
        try {
          await navigator.clipboard.writeText(location.href);
          showToast("링크를 복사했습니다");
        } catch (err) {
          // 클립보드 권한이 없으면 조용히 건너뛴다.
        }
      }
    });
  }

  function bindBack(card) {
    card.querySelector(".card__back").addEventListener("click", () => {
      if (history.length > 1) history.back();
    });
  }

  function bindSizePicker(card, sizes) {
    const toggle = card.querySelector(".card__size");
    const label = card.querySelector(".card__size-label");
    const menu = card.querySelector(".card__sizemenu");

    sizes.forEach((size) => {
      const option = tpl("sizeOptionTemplate");
      option.textContent = size;
      option.dataset.size = size;
      option.addEventListener("click", () => {
        menu.querySelectorAll(".sizemenu__option").forEach((o) => o.setAttribute("aria-selected", "false"));
        option.setAttribute("aria-selected", "true");
        label.textContent = size;
        closeMenu();
      });
      menu.appendChild(option);
    });

    function openMenu() {
      menu.hidden = false;
      toggle.setAttribute("aria-expanded", "true");
      document.addEventListener("click", onOutsideClick, { capture: true });
    }
    function closeMenu() {
      menu.hidden = true;
      toggle.setAttribute("aria-expanded", "false");
      document.removeEventListener("click", onOutsideClick, { capture: true });
    }
    function onOutsideClick(event) {
      if (!card.querySelector(".card__actions").contains(event.target)) closeMenu();
    }

    toggle.addEventListener("click", () => {
      const expanded = toggle.getAttribute("aria-expanded") === "true";
      expanded ? closeMenu() : openMenu();
    });
  }

  function bindAddToCart(card, product) {
    const btn = card.querySelector(".card__add");
    const sizeLabel = card.querySelector(".card__size-label");
    btn.addEventListener("click", () => {
      if (sizeLabel.textContent === "Choose size") {
        showToast("사이즈를 먼저 선택해 주세요");
        return;
      }
      btn.dataset.added = "true";
      showToast(`${product.title} (${sizeLabel.textContent}) 장바구니에 담았습니다`);
      setTimeout(() => {
        btn.dataset.added = "false";
      }, 1200);
    });
  }

  function buildCard(product) {
    const card = tpl("productCardTemplate");

    bindBack(card);
    bindWishlist(card);
    bindShare(card, product);
    bindImageCarousel(card, product.images && product.images.length ? product.images : ["./imgs/placeholder.jpg"]);

    setText(card.querySelector(".card__badge"), product.badge && product.badge.text);
    const categoryIcon = card.querySelector(".card__category-icon use");
    categoryIcon.setAttribute("href", `#ico-${product.categoryIcon || "hanger"}`);

    setText(card.querySelector(".card__title"), product.title);
    setText(card.querySelector(".card__brand-name"), product.brand && product.brand.name);
    const avatar = card.querySelector(".card__brand-avatar");
    if (product.brand) {
      avatar.textContent = product.brand.initial || product.brand.name.charAt(0);
      avatar.style.background = product.brand.color || "#9a9ea5";
    } else {
      avatar.remove();
    }

    const { currency, original, discounted } = product.price;
    setText(card.querySelector(".card__price-original"), original ? formatMoney(currency, original) : "");
    setText(card.querySelector(".card__price-discounted"), formatMoney(currency, discounted));

    bindSizePicker(card, product.sizes || []);
    bindAddToCart(card, product);

    return card;
  }

  function render(data) {
    const bind = (key) => document.querySelector(`[data-bind="${key}"]`);
    Object.entries(data.section || {}).forEach(([key, value]) => setText(bind(key), value));

    const track = document.getElementById("productTrack");
    const fragment = document.createDocumentFragment();
    data.products.forEach((product) => fragment.appendChild(buildCard(product)));
    track.replaceChildren(fragment);
  }

  function init() {
    fetch("./data/products.json")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(render)
      .catch((err) => {
        console.warn("products.json 로드 실패, FALLBACK 데이터로 렌더링합니다.", err);
        render(FALLBACK);
      });
  }

  document.addEventListener("DOMContentLoaded", init);

  global.ProductCard = { render, FALLBACK };
})(window);
