# TRI-GLAV

**Varno na poti. Varno domov.**

TRI-GLAV is an outdoor-safety product concept focused on helping people prepare better, understand mountain conditions and make safer decisions before and during a trip.

This repository currently contains the **public TRI-GLAV landing page**, not the finished mobile application.

## Current status

**Public implementation:** responsive static website  
**Mobile application:** product concept / future development  
**Production emergency system:** not implemented

The website presents the product direction, pilot-interest flow and visual identity. Product concepts described on the site — including offline navigation, contextual weather information, hazards, community reports and SOS support — should not be interpreted as already released application capabilities.

## Live site

- [TRI-GLAV GitHub Pages](https://vcheeko.github.io/tri-glav-website/)
- Product domain: `tri-glav.si`

## Product vision

TRI-GLAV is being designed around a simple safety idea:

> Mountain navigation should combine the map with the conditions, local knowledge and the ability to act when something goes wrong.

The longer-term product direction includes:

- offline navigation and route context;
- weather information connected to the planned route;
- hazard and closure awareness;
- community and locally verified information;
- check-ins and safety-oriented trip state;
- fast access to emergency information and support.

These are **product goals**, not claims that the current website already provides them.

## What is implemented in this repository

The current site is intentionally lightweight and dependency-free:

- semantic HTML landing-page structure;
- responsive CSS layout;
- vanilla JavaScript interactions;
- mobile navigation;
- progressive reveal behavior with an `IntersectionObserver` fallback;
- smooth in-page navigation;
- basic SEO, Open Graph and Twitter metadata;
- accessibility-minded basics such as a skip link and ARIA labels;
- a pilot-interest contact form that prepares an email through the user's local mail client;
- static assets suitable for simple hosting.

There is currently **no application backend behind the contact form** and no claim of formal accessibility compliance.

## Repository structure

```text
tri-glav-website/
├── index.html              # page structure and metadata
├── styles.css              # responsive presentation
├── script.js               # navigation, reveal behavior and contact flow
├── assets/                 # imagery, logos and visual assets
├── public_html-ready/      # hosting-oriented copy/export
├── CODEX_PROMPT.md         # retained AI-development prompt context
└── README.md
```

## Run locally

No build system is required.

From the repository root, either open `index.html` directly or serve the directory with a small local HTTP server, for example:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

## AI-assisted development disclosure

AI tools are used extensively in the TRI-GLAV workflow for ideation, implementation assistance, critique and iteration.

The project is not presented as evidence that every line was manually typed by the founder. The relevant engineering responsibility is to define the product intent, make and document decisions, inspect generated work, test behavior and distinguish implemented functionality from future product claims.

## Current engineering priorities

Before treating the website as a stronger production surface, useful next steps include:

1. automated HTML / link / accessibility checks;
2. browser and responsive regression testing;
3. image and performance optimization;
4. privacy-conscious analytics if needed;
5. replacement of the `mailto:` pilot flow with a validated backend or form service if real submissions need reliable collection;
6. clearer separation between website evidence and future mobile-app capabilities;
7. documented release and deployment checks.

## Product-development principle

TRI-GLAV is safety-oriented. That means future emergency, location and hazard features should be held to a much higher verification standard than ordinary marketing-site functionality.

A polished interface is not evidence that a safety feature works.

---

**TRI-GLAV — EXPLORE. GROW. RISE.**
