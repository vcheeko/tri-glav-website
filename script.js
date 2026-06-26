const revealItems = document.querySelectorAll(".reveal");
const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector(".site-nav");
const navLinks = document.querySelectorAll(".site-nav a, .header-cta");
const siteHeader = document.querySelector(".site-header");
const storyPathLine = document.querySelector(".story-path-line");
const storySection = document.querySelector(".story-section");

document.body.classList.add("has-js");

const getScrollOffset = () => {
  const headerHeight = siteHeader ? siteHeader.offsetHeight : 88;
  return headerHeight + 16;
};

const syncHeaderState = () => {
  if (!siteHeader) {
    return;
  }

  siteHeader.classList.toggle("is-scrolled", window.scrollY > 24);
};

const scrollToHashTarget = (hash, behavior = "smooth") => {
  if (!hash || hash === "#") {
    return;
  }

  const target = document.querySelector(hash);
  if (!target) {
    return;
  }

  const targetTop = target.getBoundingClientRect().top + window.scrollY - getScrollOffset();
  window.scrollTo({ top: Math.max(targetTop, 0), behavior });
};

revealItems.forEach((item) => {
  const delay = item.dataset.delay || "0";
  item.style.setProperty("--delay", `${delay}ms`);
});

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    });
  }, {
    threshold: 0.12,
    rootMargin: "0px 0px -6% 0px"
  });

  revealItems.forEach((item) => revealObserver.observe(item));

  if (storyPathLine && storySection) {
    const pathObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        storyPathLine.classList.toggle("is-visible", entry.isIntersecting);
      });
    }, {
      threshold: 0.05,
      rootMargin: "0px"
    });

    pathObserver.observe(storySection);
  }
} else {
  revealItems.forEach((item) => item.classList.add("visible"));

  if (storyPathLine) {
    storyPathLine.classList.add("is-visible");
  }
}

const closeMobileMenu = () => {
  if (!siteNav || !menuToggle) {
    return;
  }

  siteNav.classList.remove("is-open");
  menuToggle.setAttribute("aria-expanded", "false");
  document.body.classList.remove("menu-open");
};

if (menuToggle && siteNav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("is-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
    document.body.classList.toggle("menu-open", isOpen);
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");

      if (href && href.startsWith("#")) {
        event.preventDefault();
        closeMobileMenu();
        window.setTimeout(() => scrollToHashTarget(href), 30);
      } else {
        closeMobileMenu();
      }
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMobileMenu();
    }
  });
}

syncHeaderState();
window.addEventListener("scroll", syncHeaderState, { passive: true });
window.addEventListener("resize", syncHeaderState, { passive: true });

window.addEventListener("load", () => {
  syncHeaderState();

  if (window.location.hash) {
    window.setTimeout(() => scrollToHashTarget(window.location.hash, "auto"), 100);
  }
});
