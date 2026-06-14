const revealItems = document.querySelectorAll(".reveal");
const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector(".site-nav");
const navLinks = document.querySelectorAll(".site-nav a");
const contactForm = document.getElementById("contact-form");
const formStatus = document.getElementById("form-status");
const siteHeader = document.querySelector(".site-header");

document.body.classList.add("has-js");

const syncHeaderState = () => {
  if (!siteHeader) {
    return;
  }

  siteHeader.classList.toggle("is-scrolled", window.scrollY > 18);
};

const scrollToHashTarget = (hash, behavior = "smooth") => {
  if (!hash) {
    return;
  }

  const target = document.querySelector(hash);
  if (!target) {
    return;
  }

  const compactHeader = window.innerWidth <= 860 ? 150 : 118;
  const targetTop = target.getBoundingClientRect().top + window.scrollY - compactHeader;
  window.scrollTo({ top: Math.max(targetTop, 0), behavior });
};

revealItems.forEach((item) => {
  const delay = item.dataset.delay || "0";
  item.style.setProperty("--delay", `${delay}ms`);
});

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver((entries, revealObserver) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    });
  }, {
    threshold: 0.18,
    rootMargin: "0px 0px -8% 0px"
  });

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("visible"));
}

if (menuToggle && siteNav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("is-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    document.body.classList.toggle("menu-open", isOpen);
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      siteNav.classList.remove("is-open");
      menuToggle.setAttribute("aria-expanded", "false");
      document.body.classList.remove("menu-open");

      const href = link.getAttribute("href");
      if (href && href.startsWith("#")) {
        window.setTimeout(() => scrollToHashTarget(href), 30);
      }
    });
  });
}

syncHeaderState();
window.addEventListener("scroll", syncHeaderState, { passive: true });
window.addEventListener("load", () => {
  syncHeaderState();

  if (window.location.hash) {
    window.setTimeout(() => scrollToHashTarget(window.location.hash, "auto"), 80);
  }
});

if (contactForm && formStatus) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(contactForm);
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const context = String(formData.get("context") || "").trim();
    const message = String(formData.get("message") || "").trim();

    if (!name || !email || !message) {
      formStatus.textContent = "Izpolni ime, e-pošto in sporočilo.";
      formStatus.classList.remove("is-success");
      formStatus.classList.add("is-error");
      return;
    }

    const subject = encodeURIComponent(`TRI-GLAV pilotni dostop - ${name}`);
    const body = encodeURIComponent(
      [
        `Ime: ${name}`,
        `E-pošta: ${email}`,
        context ? `Telefon ali organizacija: ${context}` : "",
        "",
        "Sporočilo:",
        message
      ].filter(Boolean).join("\n")
    );

    formStatus.textContent = "Odpiram pripravljen e-mail za info@tri-glav.si.";
    formStatus.classList.remove("is-error");
    formStatus.classList.add("is-success");

    window.location.href = `mailto:info@tri-glav.si?subject=${subject}&body=${body}`;
  });
}
