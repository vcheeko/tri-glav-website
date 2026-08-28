# TRI-GLAV

[![quality](https://github.com/vcheeko/tri-glav-website/actions/workflows/quality.yml/badge.svg?branch=main)](https://github.com/vcheeko/tri-glav-website/actions/workflows/quality.yml)

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

## Engineering evidence

The public `quality` GitHub Actions workflow runs on pull requests and pushes to `main`.

It currently verifies:

- document identity, Slovenian language metadata and title;
- description, robots, canonical, Open Graph and Twitter metadata presence;
- local asset references exist and do not escape repository scope;
- no `javascript:` asset/link URLs are accepted by the static check;
- images have non-empty alt text;
- core HTML IDs are unique and expected section targets exist;
- internal hash links resolve to existing IDs;
- external HTTP references are rejected in favor of HTTPS;
- the README keeps the boundary between the implemented website and unimplemented mobile/emergency capabilities visible;
- `script.js` passes Node syntax validation.

The quality badge represents these repository checks only. It is **not** a certification of accessibility, mountain-safety correctness, emergency reliability or future application features.

## Repository structure

```text
tri-glav-website/
├── .github/workflows/       # automated repository quality checks
├── tests/                   # dependency-free static quality tests
├── index.html               # page structure and metadata
├── styles.css               # responsive presentation
├── script.js                # navigation, reveal behavior and contact flow
├── assets/                  # imagery, logos and visual assets
├── public_html-ready/       # hosting-oriented copy/export
├── CODEX_PROMPT.md          # retained AI-development prompt context
└── README.md
```

## Run locally

No build system is required.

From the repository root, either open `index.html` directly or serve the directory with a small local HTTP server, for example:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

Run the repository checks locally with:

```bash
python -m unittest discover -s tests -p 'test_*.py' -v
node --check script.js
```

## AI-assisted development disclosure

AI tools are used extensively in the TRI-GLAV workflow for ideation, implementation assistance, critique and iteration.

The project is not presented as evidence that every line was manually typed by the founder. The relevant engineering responsibility is to define the product intent, make and document decisions, inspect generated work, test behavior and distinguish implemented functionality from future product claims.

## Current engineering priorities

The next useful engineering steps are:

1. real browser and responsive regression testing rather than static inspection alone;
2. automated accessibility tooling in addition to the current basic structural checks;
3. image and performance optimization with measurable budgets;
4. privacy-conscious analytics if needed;
5. replacement of the `mailto:` pilot flow with a validated backend or form service if real submissions need reliable collection;
6. documented deployment/release checks and PR-first change discipline.

## Product-development principle

TRI-GLAV is safety-oriented. That means future emergency, location and hazard features should be held to a much higher verification standard than ordinary marketing-site functionality.

A polished interface is not evidence that a safety feature works.

---

**TRI-GLAV — EXPLORE. GROW. RISE.**
