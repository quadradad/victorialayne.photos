// Victoria Layne Photos — minimal JS (nav only; keep this site fast)

const toggle = document.querySelector(".nav-toggle");
const nav = document.querySelector(".site-nav");

// Sessions dropdown: hover works via CSS; this adds tap support
document.querySelectorAll(".nav-drop-btn").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    const dd = btn.parentElement;
    const open = dd.classList.toggle("open");
    btn.setAttribute("aria-expanded", String(open));
  });
});
document.addEventListener("click", () => {
  document.querySelectorAll(".nav-dropdown.open").forEach((dd) => {
    dd.classList.remove("open");
    dd.querySelector(".nav-drop-btn").setAttribute("aria-expanded", "false");
  });
});

if (toggle && nav) {
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
  });

  // close menu when a link is tapped
  nav.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => {
      nav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    })
  );
}
