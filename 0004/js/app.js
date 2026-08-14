/**
 * app.js
 * data/cards.json 을 읽어 모바일 명함 카드를 렌더링한다. (ES6)
 *
 * <script type="module"> 을 쓰지 않는 이유:
 *   file:// 로 열면 모듈 로딩이 CORS 로 막힌다. 더블클릭 확인 워크플로를 지키려고
 *   IIFE + 전역 네임스페이스 하나(window.NameCard)로 구성한다.
 * FALLBACK 상수가 data/cards.json 과 중복되는 이유도 같다.
 * 데이터를 바꿀 때는 두 곳을 반드시 함께 고친다 (.claude/hooks/validate-cards.sh 가 검사).
 */
(function (global) {
  "use strict";

  const DATA_URL = "./data/cards.json";

  /* ── fetch 실패 시 사용할 데이터 (data/cards.json 과 동일하게 유지할 것) ── */
  const FALLBACK = {
    section: {
      eyebrow: "Digital Name Card",
      title: "모바일 명함",
      subtitle: "테마 하나로 바뀌는 다섯 가지 온라인 디지털 명함 레이아웃"
    },
    cards: [
      {
        id: "lee-hangyeol",
        theme: "dark",
        accent: "#1f3a68",
        photo: "./imgs/lee-hangyeol.jpg",
        photoShape: "hero",
        name: "이한결",
        role: "송무팀 ㅣ 대표 변호사",
        company: "법률사무소 궤적",
        logo: { mark: "GWE", text: "TRAJECTORY", sub: "법률사무소 궤적" },
        tags: ["고객 신뢰", "동반 성장"],
        contacts: [
          { type: "mobile", label: "휴대전화", value: "010-0000-0000", actions: ["call", "sms"] },
          { type: "tel", label: "유선전화", value: "02-000-0000", actions: ["call"] },
          { type: "email", label: "이메일", value: "lawyer@creatornomic.io", actions: ["mail"] },
          { type: "web", label: "홈페이지", value: "www.lawyer.co.io", actions: ["web"] },
          { type: "address", label: "주소", value: "서울특별시 강남구 역삼로 123", actions: ["map"] }
        ]
      },
      {
        id: "cho-hyunmin",
        theme: "light",
        accent: "#2f6bd8",
        photo: "./imgs/cho-hyunmin.jpg",
        photoShape: "circle",
        name: "조현민",
        role: "창동지점 ㅣ 영업과장",
        company: "이모션렌트",
        logo: { mark: "ER", text: "Emotion Rent", sub: "" },
        tags: ["멤버십 문의", "차종 상담", "기업용 플랜"],
        contacts: [
          { type: "mobile", label: "휴대전화", value: "010-0000-0000", actions: ["call", "sms"] },
          { type: "tel", label: "유선전화", value: "02-000-0000", actions: ["call"] },
          { type: "email", label: "이메일", value: "sale@creatornomic.io", actions: ["mail"] },
          { type: "web", label: "홈페이지", value: "www.emotionrent.co.io", actions: ["web"] },
          { type: "address", label: "주소", value: "서울시 도봉구 도담로 123", actions: ["map"] }
        ],
        links: [
          { icon: "kakao", label: "신차 출고 알림, 견적 문의", href: "#" },
          { icon: "link", label: "서비스 이용 가이드", href: "#" }
        ],
        about: {
          title: "전기차 & 프리미엄 차량 렌탈 전문",
          body: [
            "🚗 프리미엄 전기차 렌트",
            "• 최신형 Tesla Model 3 & Model Y 2025 Edition 입고!",
            "• BMW iX3 / Mercedes EQE 등 인기 모델 상시 업데이트",
            "• 하루 15만 원부터, 무제한 주행 패키지 제공"
          ]
        }
      },
      {
        id: "lee-soohwan",
        theme: "dark",
        accent: "#2f6146",
        photo: "./imgs/lee-soohwan.jpg",
        photoShape: "hero",
        name: "이수환",
        role: "IT 전문 ㅣ 대표세무사",
        company: "세무법인 리앤밸런스",
        logo: { mark: "LB", text: "Li & Balance", sub: "" },
        tags: ["절세 전략", "세금 리스크 관리", "맞춤형 컨설팅"],
        contacts: [
          { type: "mobile", label: "휴대전화", value: "010-0000-0000", actions: ["call", "sms"] },
          { type: "email", label: "이메일", value: "pro@creatornomic.io", actions: ["mail"] },
          { type: "web", label: "홈페이지", value: "www.libalance.co.io", actions: ["web"] },
          { type: "address", label: "주소", value: "강원도 속초시 중앙로 123, 2층", actions: ["map"] }
        ],
        slogan: "당신의 비즈니스에 세금의 균형을 더합니다."
      },
      {
        id: "kim-hyunsoo",
        theme: "paper",
        accent: "#8b8fa8",
        photo: "./imgs/kim-hyunsoo.jpg",
        photoShape: "hero",
        name: "김현수",
        role: "상업용 부동산 전문 ㅣ 공인중개사",
        company: "정착 공인중개사사무소",
        logo: { mark: "정착", text: "정착공인중개사사무소", sub: "GANGNAM SEOCHO REAL ESTATE" },
        tags: ["고수익 매물", "상권·입지 분석", "1:1 문의"],
        contacts: [
          { type: "mobile", label: "휴대전화", value: "010-0000-0000", actions: ["call", "sms"] },
          { type: "tel", label: "유선전화", value: "02-000-0000", actions: ["call"] },
          { type: "web", label: "홈페이지", value: "www.srealty.co.io", actions: ["web"] },
          { type: "address", label: "주소", value: "서울특별시 서초구 강남대로 123", actions: ["map"] }
        ],
        slogan: "수익률로 증명하는 상업 부동산, 이제 '정착'할 시간입니다."
      },
      {
        id: "kim-seojeong",
        theme: "blue",
        accent: "#1a50d8",
        photo: "./imgs/kim-seojeong.jpg",
        photoShape: "portrait",
        name: "김서정",
        role: "",
        company: "한결은행",
        logo: { mark: "S", text: "한결은행", sub: "Hangyel Bank" },
        meta: [
          { label: "부서", value: "PB센터 / 대출금융부" },
          { label: "직책", value: "수석 상담원" }
        ],
        tags: ["리스크 없는 빠른 대출", "카카오톡 1:1 상담"],
        contacts: [
          { type: "mobile", label: "휴대전화", value: "010-0000-0000", actions: ["call", "sms"] },
          { type: "tel", label: "유선전화", value: "02-000-0000", actions: ["call"] },
          { type: "address", label: "주소", value: "서울특별시 중구 을지로 123", actions: ["map"] }
        ]
      },
      {
        id: "yoon-siheon",
        theme: "navy",
        accent: "#16265c",
        photo: "./imgs/yoon-siheon.jpg",
        photoShape: "hero",
        name: "윤시헌",
        role: "재정보호 설계 전문가 ㅣ 컨설턴트",
        company: "정성 파이낸셜 리스크컨설팅",
        logo: { mark: "JS", text: "JEONGSEONG", sub: "Financial Risk Consulting" },
        tags: ["기업 리스크 관리", "맞춤 컨설팅", "가계 보장 설계"],
        contacts: [
          { type: "mobile", label: "휴대전화", value: "010-0000-0000", actions: ["call", "sms"] },
          { type: "tel", label: "유선전화", value: "02-000-0000", actions: ["call"] },
          { type: "email", label: "이메일", value: "pro@creatornomic.io", actions: ["mail"] },
          { type: "web", label: "홈페이지", value: "www.jeongseong.co.io", actions: ["web"] }
        ]
      }
    ]
  };

  /* ── 테마별 레이아웃 규칙 ──────────────────────────────────────
     identity : overlay(사진 위 글래스 박스) | header(회색 헤더) |
                banner(솔리드 배너) | stacked(사진 아래 블록)
     contact  : row(레이블─값─쉐브론) | stack(레이블/값 + 액션 버튼)
     ────────────────────────────────────────────────────────────── */
  const THEMES = {
    dark: { identity: "overlay", contact: "row" },
    paper: { identity: "overlay", contact: "row" },
    light: { identity: "header", contact: "stack" },
    blue: { identity: "banner", contact: "stack" },
    navy: { identity: "stacked", contact: "row" }
  };

  const ICONS = {
    mobile: "ico-phone",
    tel: "ico-phone",
    email: "ico-mail",
    web: "ico-globe",
    address: "ico-pin",
    kakao: "ico-kakao",
    link: "ico-link"
  };

  const ACTIONS = {
    call: { icon: "ico-phone", text: "전화 걸기" },
    sms: { icon: "ico-message", text: "문자 보내기" },
    mail: { icon: "ico-mail", text: "메일 보내기" },
    web: { icon: "ico-globe", text: "홈페이지 열기" },
    map: { icon: "ico-pin", text: "지도에서 보기" }
  };

  const gallery = document.getElementById("cardGallery");
  const track = document.getElementById("cardTrack");
  const messageEl = document.getElementById("galleryMessage");
  const toastEl = document.getElementById("toast");
  const prevBtn = document.getElementById("cardPrev");
  const nextBtn = document.getElementById("cardNext");
  const tpl = (id) => document.getElementById(id).content.firstElementChild;

  /* 슬라이드 전환 속도(ms). prefers-reduced-motion 은 CSS 에서 0ms 로 덮는다 */
  const SWIPER_SPEED = 480;
  let swiper = null;

  /* ---------- 유틸 ---------- */

  const digits = (value) => String(value).replace(/[^0-9+]/g, "");

  /** 연락처 타입 → 실제 동작하는 href */
  const toHref = (type, value) => {
    const v = String(value || "").trim();
    if (!v) return "#";
    switch (type) {
      case "mobile":
      case "tel":
        return "tel:" + digits(v);
      case "sms":
        return "sms:" + digits(v);
      case "email":
        return "mailto:" + v;
      case "web":
        return /^https?:\/\//i.test(v) ? v : "https://" + v;
      case "address":
        return "https://map.naver.com/p/search/" + encodeURIComponent(v);
      default:
        return "#";
    }
  };

  /** 액션 버튼의 href — sms 만 타입이 따로 있고 나머지는 연락처 타입을 따른다 */
  const actionHref = (action, contact) =>
    action === "sms" ? toHref("sms", contact.value) : toHref(contact.type, contact.value);

  const setText = (root, selector, value) => {
    const el = root.querySelector(selector);
    if (!el) return null;
    if (value) {
      el.textContent = value;
    } else {
      el.remove();
      return null;
    }
    return el;
  };

  const useIcon = (svg, symbolId) => {
    const use = svg.querySelector("use");
    if (use) use.setAttribute("href", "#" + symbolId);
  };

  let toastTimer = 0;
  const toast = (text) => {
    if (!toastEl) return;
    toastEl.textContent = text;
    toastEl.classList.add("is-on");
    global.clearTimeout(toastTimer);
    toastTimer = global.setTimeout(() => toastEl.classList.remove("is-on"), 1600);
  };

  const copy = (text) => {
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(text).then(
      () => toast(text + " 복사됨"),
      () => {}
    );
  };

  /* ---------- 블록 빌더 ---------- */

  const buildPhoto = (card, shape) => {
    if (card.photo) {
      const img = new Image();
      img.src = card.photo;
      img.alt = card.name + " 프로필 사진";
      img.className = "avatar-img";
      img.loading = "lazy";
      return img;
    }
    const wrap = document.createElement("div");
    wrap.className = "avatar-fallback";
    // Avatar 가 만든 SVG 문자열만 innerHTML 로 넣는다 (외부 입력 아님)
    wrap.innerHTML = global.Avatar.render(card.id, shape, card.accent);
    const svg = wrap.querySelector("svg");
    if (svg) svg.setAttribute("aria-label", card.name + " 프로필 일러스트");
    return wrap;
  };

  const buildTags = (tags) => {
    if (!tags || !tags.length) return null;
    const list = document.createElement("ul");
    list.className = "chips";
    tags.forEach((text) => {
      const chip = tpl("tagTemplate").cloneNode(true);
      chip.textContent = text;
      list.appendChild(chip);
    });
    return list;
  };

  const buildMeta = (meta) => {
    if (!meta || !meta.length) return null;
    const dl = document.createElement("dl");
    dl.className = "meta";
    meta.forEach((row) => {
      const cell = tpl("metaTemplate").cloneNode(true);
      cell.querySelector(".meta__label").textContent = row.label || "";
      cell.querySelector(".meta__value").textContent = row.value || "";
      dl.appendChild(cell);
    });
    return dl;
  };

  const buildIdentity = (card, layout) => {
    const node = tpl("identityTemplate").cloneNode(true);
    node.classList.add("identity--" + layout);

    const avatarSlot = node.querySelector(".identity__avatar");
    if (layout === "header" || layout === "banner") {
      avatarSlot.appendChild(buildPhoto(card, card.photoShape || "circle"));
      avatarSlot.classList.add("identity__avatar--" + (card.photoShape || "circle"));
    } else {
      avatarSlot.remove();
    }

    setText(node, ".identity__name", card.name);
    setText(node, ".identity__role", card.role);
    setText(node, ".identity__company", card.company);

    const logo = card.logo || {};
    if (logo.mark || logo.text) {
      setText(node, ".identity__logo-mark", logo.mark);
      setText(node, ".identity__logo-name", logo.text);
      setText(node, ".identity__logo-sub", logo.sub);
    } else {
      node.querySelector(".identity__logo").remove();
    }

    const meta = buildMeta(card.meta);
    if (meta) node.appendChild(meta);

    const tags = buildTags(card.tags);
    if (tags) node.appendChild(tags);

    return node;
  };

  const buildContactRow = (contact) => {
    const node = tpl("contactRowTemplate").cloneNode(true);
    const link = node.querySelector(".contact__link");
    link.href = toHref(contact.type, contact.value);
    if (contact.type === "web" || contact.type === "address") {
      link.target = "_blank";
      link.rel = "noopener";
    }
    node.querySelector(".contact__label").textContent = contact.label || "";
    node.querySelector(".contact__value").textContent = contact.value || "";
    link.setAttribute("aria-label", (contact.label || "") + " " + (contact.value || ""));
    return node;
  };

  const buildContactStack = (contact) => {
    const node = tpl("contactStackTemplate").cloneNode(true);
    node.querySelector(".contact__label").textContent = contact.label || "";

    const value = node.querySelector(".contact__value");
    value.textContent = contact.value || "";
    value.setAttribute("aria-label", (contact.value || "") + " 복사하기");
    value.addEventListener("click", () => copy(contact.value));

    const slot = node.querySelector(".contact__actions");
    const list = contact.actions && contact.actions.length
      ? contact.actions
      : [contact.type === "email" ? "mail" : contact.type === "web" ? "web"
        : contact.type === "address" ? "map" : "call"];

    list.forEach((name) => {
      const spec = ACTIONS[name];
      if (!spec) return;
      const btn = tpl("actionTemplate").cloneNode(true);
      btn.href = actionHref(name, contact);
      btn.setAttribute("aria-label", (contact.label || "") + " " + spec.text);
      btn.setAttribute("title", spec.text);
      if (name === "web" || name === "map") {
        btn.target = "_blank";
        btn.rel = "noopener";
      }
      useIcon(btn.querySelector(".action__icon"), spec.icon);
      slot.appendChild(btn);
    });

    return node;
  };

  const buildLink = (row) => {
    const node = tpl("linkTemplate").cloneNode(true);
    const link = node.querySelector(".linkrow__link");
    link.href = row.href || "#";
    if (/^https?:/i.test(row.href || "")) {
      link.target = "_blank";
      link.rel = "noopener";
    }
    node.querySelector(".linkrow__label").textContent = row.label || "";
    useIcon(node.querySelector(".linkrow__icon"), ICONS[row.icon] || "ico-link");
    return node;
  };

  /* ---------- 카드 ---------- */

  const buildCard = (card) => {
    const theme = THEMES[card.theme] ? card.theme : "dark";
    const rules = THEMES[theme];

    const node = tpl("cardTemplate").cloneNode(true);
    node.classList.add("namecard--" + theme);
    node.dataset.id = card.id || "";
    if (card.accent) node.style.setProperty("--card-accent", card.accent);

    const frame = node.querySelector(".namecard__frame");
    const hero = node.querySelector(".namecard__hero");
    const glass = node.querySelector(".namecard__glass");
    const identity = buildIdentity(card, rules.identity);

    if (rules.identity === "overlay" || rules.identity === "stacked") {
      hero.querySelector(".namecard__photo").appendChild(buildPhoto(card, card.photoShape || "hero"));
      if (rules.identity === "overlay") {
        glass.appendChild(identity);
      } else {
        glass.remove();
        frame.appendChild(identity);
      }
    } else {
      hero.remove();
      frame.appendChild(identity);
    }

    /* 연락처 */
    const contactList = node.querySelector(".namecard__contacts");
    contactList.classList.add("namecard__contacts--" + rules.contact);
    (card.contacts || []).forEach((contact) => {
      contactList.appendChild(
        rules.contact === "row" ? buildContactRow(contact) : buildContactStack(contact)
      );
    });

    /* 링크 */
    const linkList = node.querySelector(".namecard__links");
    if (card.links && card.links.length) {
      card.links.forEach((row) => linkList.appendChild(buildLink(row)));
    } else {
      linkList.remove();
    }

    /* 소개 */
    const about = node.querySelector(".namecard__about");
    if (card.about && (card.about.title || (card.about.body || []).length)) {
      setText(about, ".namecard__about-title", card.about.title);
      const body = about.querySelector(".namecard__about-body");
      (card.about.body || []).forEach((line) => {
        const p = document.createElement("p");
        p.className = "namecard__about-line";
        p.textContent = line;
        body.appendChild(p);
      });
    } else {
      about.remove();
    }

    /* 슬로건 */
    setText(node, ".namecard__slogan", card.slogan);

    return node;
  };

  /* ---------- 렌더 ---------- */

  const renderHead = (section) => {
    Object.keys(section || {}).forEach((key) => {
      const el = document.querySelector('[data-bind="' + key + '"]');
      if (el) el.textContent = section[key];
    });
  };

  const message = (text) => {
    messageEl.textContent = text || "";
  };

  /**
   * 끝단 버튼의 disabled 속성은 Swiper 가 이미 건다 —
   * navigation 모듈이 nav 요소의 tagName 이 BUTTON 이면 `el.disabled = isEnd` 를 직접 설정한다.
   * (그래서 여기서 다시 걸 필요가 없다. 마크업을 <a> 로 바꾸면 이 동작이 사라진다.)
   *
   * 문제는 그 순간 해당 버튼에 포커스가 있으면 포커스가 body 로 튕겨 키보드 위치를 잃는 것이다.
   * Swiper 가 disabled 를 거는 시점이 slideChange 이벤트보다 빨라 미리 손쓸 수 없으므로,
   * 빠져나간 뒤(focusout)에 반대편 버튼으로 넘겨준다.
   */
  const keepNavFocus = (el, other) => {
    if (!el || !other) return;
    el.addEventListener("focusout", (event) => {
      // 갈 곳이 있거나(relatedTarget) 비활성화 때문이 아니면 건드리지 않는다
      if (event.relatedTarget || !el.disabled || other.disabled) return;
      other.focus({ preventScroll: true });
    });
  };

  keepNavFocus(prevBtn, nextBtn);
  keepNavFocus(nextBtn, prevBtn);

  /**
   * 좌우 슬라이드. 카드 폭은 CSS 의 --card-w 가 정하므로 slidesPerView 는 "auto".
   * 카드 안쪽(.namecard__scroll)이 세로로 스크롤되므로 touchAngle 로 가로 제스처만 잡는다.
   */
  const initSwiper = () => {
    if (swiper) {
      swiper.destroy(true, true);
      // 파괴된 인스턴스의 상태가 버튼에 남지 않게 되돌린다
      if (prevBtn) prevBtn.disabled = false;
      if (nextBtn) nextBtn.disabled = false;
    }

    swiper = new Swiper(gallery, {
      slidesPerView: "auto",
      speed: SWIPER_SPEED,
      grabCursor: true,
      touchAngle: 40,
      breakpoints: {
        0: { spaceBetween: 14 },
        581: { spaceBetween: 22 },
        901: { spaceBetween: 30 }
      },
      navigation: {
        prevEl: "#cardPrev",
        nextEl: "#cardNext",
        disabledClass: "swiper-button-disabled"
      },
      pagination: {
        el: "#cardPagination",
        clickable: true
      },
      keyboard: {
        enabled: true,
        onlyInViewport: true
      },
      a11y: {
        enabled: true,
        containerMessage: "디지털 명함 목록",
        prevSlideMessage: "이전 명함",
        nextSlideMessage: "다음 명함",
        paginationBulletMessage: "{{index}}번째 명함으로 이동"
      }
    });
  };

  const render = (data) => {
    renderHead(data.section);

    const cards = data.cards || [];
    if (!cards.length) {
      track.innerHTML = "";
      message("표시할 명함이 없습니다.");
      return;
    }

    const frag = document.createDocumentFragment();
    cards.forEach((card) => {
      const slide = document.createElement("div");
      slide.className = "swiper-slide";
      slide.appendChild(buildCard(card));
      frag.appendChild(slide);
    });

    track.innerHTML = "";
    track.appendChild(frag);
    message("");
    initSwiper();
  };

  message("로딩 중…");

  fetch(DATA_URL, { cache: "no-store" })
    .then((res) => {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.json();
    })
    .then(render)
    .catch((err) => {
      // file:// 로 열었거나 JSON 을 못 읽은 경우 → 내장 데이터로 렌더
      console.warn("[namecard] JSON 로드 실패, fallback 데이터 사용:", err.message);
      render(FALLBACK);
    });

  global.NameCard = { render, toHref, THEMES, get swiper() { return swiper; } };
})(window);
