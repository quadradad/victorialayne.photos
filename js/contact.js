// Inquiry form. Two modes:
//  - FORMSPREE_ID set  -> async submit to Formspree, inline success/error
//  - FORMSPREE_ID = "" -> fallback: opens the visitor's mail app with a
//    pre-filled message to victoria@ (works with zero backend)
//
// To activate Formspree: create the form at formspree.io, paste the ID below
// (the part after /f/ in the endpoint), commit, push.

const FORMSPREE_ID = ""; // e.g. "xkgwqpzy"
const CONTACT_EMAIL = "victoria@victorialayne.photos";

(function () {
  const form = document.querySelector(".inquiry-form");
  if (!form) return;
  const note = form.querySelector(".form-note");

  const val = (name) => (form.querySelector(`[name="${name}"]`) || {}).value || "";

  function setNote(text, ok) {
    note.textContent = text;
    note.style.color = ok ? "var(--sage)" : "var(--terracotta)";
  }

  if (!FORMSPREE_ID) {
    setNote("This sends your note from your own email app — or just email me directly.", true);
  } else {
    setNote("", true);
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (form.querySelector('[name="_gotcha"]').value) return; // honeypot

    const summary =
      `Session type: ${val("session_type")}\n` +
      `Rough date: ${val("date") || "not sure yet"}\n\n` +
      `${val("message")}\n\n` +
      `— ${val("name")} (${val("email")})`;

    if (!FORMSPREE_ID) {
      const subject = encodeURIComponent(`Inquiry: ${val("session_type")} session — ${val("name")}`);
      window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${encodeURIComponent(summary)}`;
      setNote("Your email app should have opened with your note ready to send.", true);
      return;
    }

    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = "Sending…";
    try {
      const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({
          name: val("name"),
          email: val("email"),
          session_type: val("session_type"),
          date: val("date"),
          message: val("message"),
          _subject: `Inquiry: ${val("session_type")} session — ${val("name")}`,
        }),
      });
      if (!res.ok) throw new Error(`status ${res.status}`);
      form.reset();
      btn.textContent = "Sent ✓";
      setNote("Got it! I'll get back to you within a day or two — check your inbox.", true);
    } catch (err) {
      btn.disabled = false;
      btn.textContent = "Send it";
      setNote(`Hmm, that didn't go through — please email ${CONTACT_EMAIL} directly.`, false);
    }
  });
})();
