const siteHeader = document.querySelector(".site-header");
const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector(".site-nav");
const navLinks = document.querySelectorAll("[data-nav-link]");
const contactForm = document.getElementById("contact-form");
const formStatus = document.getElementById("form-status");
const formIntent = document.getElementById("form-intent");
const formMessage = document.getElementById("form-message");
const faqTopic = document.getElementById("faq-topic");
const faqItems = document.querySelectorAll(".faq__item");

let scrollRevealObserver = null;
let scrollSpyObserver = null;

const FORM_INTENTS = {
  pilot: {
    subject: "TRI-GLAV pilotni uporabnik",
    placeholder: "Na kratko opiši, zakaj se želiš pridružiti pilotu in katere poti poznaš."
  },
  ekipa: {
    subject: "TRI-GLAV – pridružitev projektu",
    placeholder: "Predstavi se in opiši svoje tehnično ozadje ter zanimanje za projekt."
  },
  podpora: {
    subject: "TRI-GLAV – podpora razvoju",
    placeholder: "Na kratko opiši, kako bi rad podprl razvoj TRI-GLAV."
  }
};

function closeMobileMenu() {
  if (!siteNav || !menuToggle) return;
  siteNav.classList.remove("is-open");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Odpri meni");
}

function setFormIntent(intent) {
  const config = FORM_INTENTS[intent] || FORM_INTENTS.pilot;
  if (formIntent) formIntent.value = intent in FORM_INTENTS ? intent : "pilot";
  if (formMessage) formMessage.placeholder = config.placeholder;
}

function setupStoryScroll() {
  const storySection = document.getElementById("zgodba");
  const chapters = document.querySelectorAll(".story-chapter");
  const navLinks = document.querySelectorAll(".story-scroll__link");
  const progressBar = document.getElementById("story-progress");

  if (!storySection || !chapters.length) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const total = chapters.length;

  const setActive = (index) => {
    const i = Math.max(0, Math.min(index, total - 1));
    chapters.forEach((ch, idx) => ch.classList.toggle("is-active", idx === i));
    navLinks.forEach((link, idx) => link.classList.toggle("is-active", idx === i));
    if (progressBar) {
      progressBar.style.width = `${((i + 1) / total) * 100}%`;
    }
  };

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      const index = Number(link.dataset.chapter);
      const target = document.getElementById(`story-${index}`);
      if (!target) return;
      target.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "center" });
      setActive(index);
    });
  });

  if (reducedMotion) {
    chapters.forEach((ch) => ch.classList.add("is-active"));
    if (progressBar) progressBar.style.width = "100%";
    return;
  }

  const chapterObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
      if (!visible.length) return;
      const index = Number(visible[0].target.dataset.chapter);
      if (!Number.isNaN(index)) setActive(index);
    },
    { root: null, rootMargin: "-20% 0px -35% 0px", threshold: [0.2, 0.45, 0.7] }
  );

  chapters.forEach((chapter) => chapterObserver.observe(chapter));
  setActive(0);
}

function setupScrollReveal() {
  if (scrollRevealObserver) {
    scrollRevealObserver.disconnect();
    scrollRevealObserver = null;
  }

  const revealElements = document.querySelectorAll(".reveal");
  if (!revealElements.length) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    revealElements.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  revealElements.forEach((el) => el.classList.remove("is-visible"));

  scrollRevealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        scrollRevealObserver.unobserve(entry.target);
      });
    },
    { root: null, rootMargin: "0px 0px -5% 0px", threshold: 0.08 }
  );

  revealElements.forEach((el) => scrollRevealObserver.observe(el));
}

function setupScrollSpy() {
  if (scrollSpyObserver) {
    scrollSpyObserver.disconnect();
    scrollSpyObserver = null;
  }

  const spyTargets = document.querySelectorAll(
    ".section[id], .hero[id], .section--cta[id], .story-scroll[id]"
  );
  if (!spyTargets.length || !navLinks.length) return;

  scrollSpyObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
      if (!visible.length) return;

      const id = visible[0].target.id;
      navLinks.forEach((link) => {
        link.classList.toggle("is-active", link.dataset.navLink === id);
      });
    },
    {
      root: null,
      rootMargin: `-${getComputedStyle(document.documentElement).getPropertyValue("--header-h").trim() || "108px"} 0px -55% 0px`,
      threshold: [0.1, 0.25, 0.5]
    }
  );

  spyTargets.forEach((section) => scrollSpyObserver.observe(section));
}

function setupFaqFilter() {
  if (!faqTopic || !faqItems.length) return;

  const filterFaq = () => {
    const topic = faqTopic.value;
    faqItems.forEach((item) => {
      const match = topic === "all" || item.dataset.topic === topic;
      item.hidden = !match;
      if (!match) item.open = false;
    });
  };

  faqTopic.addEventListener("change", filterFaq);
  filterFaq();
}

function syncHeaderState() {
  if (!siteHeader) return;
  siteHeader.classList.toggle("is-scrolled", window.scrollY > 8);
}

if (menuToggle && siteNav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("is-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Zapri meni" : "Odpri meni");
  });
}

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    closeMobileMenu();
    if (link.dataset.formIntent) setFormIntent(link.dataset.formIntent);
  });
});

document.querySelectorAll("[data-form-intent]").forEach((trigger) => {
  trigger.addEventListener("click", () => setFormIntent(trigger.dataset.formIntent));
});

setFormIntent("pilot");
setupStoryScroll();
setupScrollReveal();
setupScrollSpy();
setupFaqFilter();
syncHeaderState();
window.addEventListener("scroll", syncHeaderState, { passive: true });

if (contactForm && formStatus) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(contactForm);
    const name = String(formData.get("name") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const context = String(formData.get("context") || "").trim();
    const message = String(formData.get("message") || "").trim();
    const intent = String(formData.get("intent") || "pilot");
    const privacyAccepted = formData.get("privacy") === "strinjam-se";
    const config = FORM_INTENTS[intent] || FORM_INTENTS.pilot;

    if (!contactForm.checkValidity() || !name || !email || !message || !privacyAccepted) {
      formStatus.textContent = "Izpolni obvezna polja in potrdi, da si prebral obvestilo o zasebnosti.";
      contactForm.reportValidity();
      return;
    }

    const subject = encodeURIComponent(`${config.subject} – ${name}`);
    const body = encodeURIComponent(
      [
        `Namen: ${config.subject}`,
        `Ime: ${name}`,
        `E-pošta: ${email}`,
        context ? `Organizacija: ${context}` : "",
        "",
        "Sporočilo:",
        message
      ].filter(Boolean).join("\n")
    );

    formStatus.textContent = "Odpiram osnutek e-pošte. Sporočilo bo poslano šele, ko ga potrdiš v svojem e-poštnem odjemalcu.";
    window.location.href = `mailto:info@tri-glav.si?subject=${subject}&body=${body}`;
  });
}
