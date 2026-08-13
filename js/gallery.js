// Gallery engine: powers the full portfolio page (filters) AND per-page
// embeds (<div class="masonry" data-gallery-cat="portraits" data-gallery-limit="8">).
// Data comes from gallery-data.js (regenerate with tools/build_gallery.py).

(function () {
  const pretty = (c) =>
    (typeof GALLERY_LABELS !== "undefined" && GALLERY_LABELS[c]) ||
    c.charAt(0).toUpperCase() + c.slice(1);

  // ---------- lightbox (shared) ----------
  const lightbox = document.getElementById("lightbox");
  let visible = [];
  let index = 0;

  function open(items, i) {
    if (!lightbox) return;
    visible = items;
    index = i;
    show();
    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }
  function close() {
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }
  function show() {
    const g = visible[index];
    document.getElementById("lbImg").src = g.src;
    document.getElementById("lbImg").alt = g.label;
  }
  const step = (d) => { index = (index + d + visible.length) % visible.length; show(); };

  if (lightbox) {
    lightbox.querySelector(".lb-close").addEventListener("click", close);
    lightbox.querySelector(".lb-prev").addEventListener("click", () => step(-1));
    lightbox.querySelector(".lb-next").addEventListener("click", () => step(1));
    lightbox.addEventListener("click", (e) => { if (e.target === lightbox) close(); });
    document.addEventListener("keydown", (e) => {
      if (!lightbox.classList.contains("open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") step(-1);
      if (e.key === "ArrowRight") step(1);
    });
  }

  function renderInto(el, items) {
    el.innerHTML = "";
    items.forEach((g, i) => {
      const img = document.createElement("img");
      // width/height reserve layout space before load — no page jumping
      if (g.w && g.h) { img.width = g.w; img.height = g.h; }
      img.alt = `${pretty(g.cat)} — ${g.label}`;
      img.loading = "lazy";
      img.decoding = "async";
      const reveal = () => img.classList.add("loaded");
      img.addEventListener("load", reveal, { once: true });
      img.addEventListener("error", reveal, { once: true });
      img.src = g.thumb || g.src; // grid loads the small thumb; lightbox loads full-size
      if (img.complete) reveal();
      img.addEventListener("click", () => open(items, i));
      el.appendChild(img);
    });
  }

  // ---------- embed mode ----------
  document.querySelectorAll("[data-gallery-cat]").forEach((el) => {
    const cat = el.dataset.galleryCat;
    const limit = parseInt(el.dataset.galleryLimit || "0", 10);
    let items = GALLERY.filter((g) => g.cat === cat);
    if (limit) items = items.slice(0, limit);
    if (!items.length) {
      el.outerHTML = '<p class="gallery-empty">Fresh galleries are on their way — browse the <a href="./portfolio.html">full portfolio</a> in the meantime.</p>';
      return;
    }
    renderInto(el, items);
  });

  // ---------- portfolio mode (filter bar present) ----------
  const bar = document.getElementById("filterBar");
  const grid = document.getElementById("gallery");
  if (bar && grid) {
    let current = "all";

    GALLERY_CATEGORIES.forEach((cat) => {
      const b = document.createElement("button");
      b.className = "filter-pill";
      b.dataset.cat = cat;
      b.textContent = pretty(cat);
      bar.appendChild(b);
    });

    function render() {
      const items = GALLERY.filter((g) => current === "all" || g.cat === current);
      renderInto(grid, items);
      document.querySelectorAll(".filter-pill").forEach((p) =>
        p.classList.toggle("active", p.dataset.cat === current)
      );
    }

    bar.addEventListener("click", (e) => {
      const pill = e.target.closest(".filter-pill");
      if (!pill) return;
      current = pill.dataset.cat;
      history.replaceState(null, "", current === "all" ? "./portfolio.html" : `#${current}`);
      render();
    });

    const hash = location.hash.replace("#", "");
    if (GALLERY_CATEGORIES.includes(hash)) current = hash;

    render();
  }
})();
