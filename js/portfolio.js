// Portfolio: filterable grid + lightbox. Data comes from gallery-data.js
// (regenerate with tools/build_gallery.py after adding images).

(function () {
  const bar = document.getElementById("filterBar");
  const grid = document.getElementById("gallery");
  const lightbox = document.getElementById("lightbox");
  const lbImg = document.getElementById("lbImg");
  const lbCaption = document.getElementById("lbCaption");

  let current = "all";
  let visible = []; // items shown under current filter
  let index = 0;

  const pretty = (c) => c.charAt(0).toUpperCase() + c.slice(1);

  // build filter pills
  GALLERY_CATEGORIES.forEach((cat) => {
    const b = document.createElement("button");
    b.className = "filter-pill";
    b.dataset.cat = cat;
    b.textContent = pretty(cat);
    bar.appendChild(b);
  });

  function render() {
    visible = GALLERY.filter((g) => current === "all" || g.cat === current);
    grid.innerHTML = "";
    visible.forEach((g, i) => {
      const img = document.createElement("img");
      img.src = g.src;
      img.alt = `${pretty(g.cat)} — ${g.label}`;
      img.loading = "lazy";
      img.addEventListener("click", () => open(i));
      grid.appendChild(img);
    });
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

  // lightbox
  function open(i) {
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
    lbImg.src = g.src;
    lbImg.alt = g.label;
    lbCaption.textContent = `${pretty(g.cat)} — ${g.label}`;
  }
  const step = (d) => { index = (index + d + visible.length) % visible.length; show(); };

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

  // preselect filter from hash (e.g. portfolio.html#concerts)
  const hash = location.hash.replace("#", "");
  if (GALLERY_CATEGORIES.includes(hash)) current = hash;

  render();
})();
