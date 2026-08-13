# PRD: Jonathan Soto Portfolio

A personal portfolio that presents Jonathan Soto (jonasotoaguilar), Backend & Full-Stack Engineer, to recruiters and developers. The site must make the right first impression: fast, memorable (Persona-3 aesthetic), and instantly credible through four real, linkable projects. The product model is a Persona-3 game-menu shell: the root route `/` is a full-screen menu of five items — ABOUT, RESUME, PROJECTS, SKILLS, CONTACT — and selecting an item changes the complete view to its own static route. It matters now because the reference React SPA delivers the aesthetic but at the cost of bundle weight, crawlability, and maintenance surface — a static rebuild preserves the identity while meeting a strict performance budget.

## Quick Path

1. Define the user problem (recruiters need credible, fast evidence of skill).
2. State the proposed outcome (a static, Persona-3-inspired game-menu portfolio with five view routes).
3. Confirm measurable success criteria (Lighthouse, Web Vitals, route and content coverage).
4. Review non-goals before approving scope (no blog, no backend, no i18n, no analytics in v1).

## Details

| Topic | Decision |
|-------|----------|
| Primary user | Recruiters and hiring managers evaluating Jonathan Soto |
| Problem | The reference portfolio is a heavy React SPA; recruiters often land on slow, hard-to-crawl pages and abandon them, and the scrolling one-page model is not the intended product |
| Outcome | A fast, static game-menu portfolio: a Persona-3 menu shell at `/` plus five static view routes: `/about`, `/resume`, `/projects`, `/skills`, `/contact` |
| Success measure | Lighthouse performance >= 90, accessibility >= 95, LCP < 2.5s, CLS < 0.1, INP < 200ms |

## 1. Executive Summary

- **Problem Statement**: Recruiters and developers need quick, credible evidence of Jonathan Soto's work; the previous portfolio's SPA architecture risks slow first paint, weak crawlability, and heavy client JS for a content-light site.
- **Proposed Solution**: A static Astro 7 site (SSG, Markdown Content Collections) with the Persona-3 aesthetic — near-black navy palette, radial blue glow, CRT scanlines, Canvas 2D living background, and an original decorative figure/artifact layer — and native View Transitions for cross-page motion. The root route `/` is a full-screen game menu of five giant diagonally staggered items with a persistent colorful keyboard-active indicator and controls clustered bottom-right; each item activates its own static view page with real content, deep-linkable URLs, and per-view SEO. Optional ambient audio (a user-provided licensed track only) plays after the first interaction, with a persistent mute toggle. Content is file-based; external links point to the project repositories (GitHub), the live WealthQuest page (itch.io), and the contact email. The RESUME view is grounded in Jonathan's verified CV data; no ranks, metrics, or phone number are published.
- **Success Criteria**:
  - Lighthouse performance >= 90 and accessibility >= 95 on the index page of the production build.
  - LCP < 2.5s, CLS < 0.1, INP < 200ms on a mid-range device over 4G (budget documented in ARCHITECTURE.md).
  - The root menu renders exactly five items, and each activates its own view route.
  - All four projects render from Content Collections in the PROJECTS view.
  - The RESUME view uses only verified CV data (no fake ranks or metrics) and never publishes the phone number.
  - Every view is reachable by deep link and listed in `sitemap.xml` (index + five views; 404 excluded).
  - Unknown paths render the 404 page; the JSON-LD `Person` block parses as valid schema.org data.
  - Full Playwright E2E suite passes in CI.

## 2. User Experience & Functionality

### User Journey

A visitor lands on `/` and sees a full-screen game menu: five diagonally staggered items centered/center-right with a persistent colorful active indicator that follows keyboard navigation. Selecting ABOUT, RESUME, PROJECTS, SKILLS, or CONTACT replaces the whole screen with that view; Escape (or Browser Back) returns to the menu. Keyboard/control hints and the ambient-audio mute toggle sit in a fixed bottom-right cluster. Optional ambient audio plays only from a user-provided licensed track and only after the visitor's first interaction; the muted preference persists. Each view is a self-contained screen: PROJECTS and RESUME use an in-view LIST with a detail panel (deep-linkable, e.g. `/projects#serviceflow`), SKILLS groups the stack, CONTACT offers the email and social links, ABOUT states identity and focus areas. On a phone the panels stack and scroll; without JavaScript the same content renders in normal document flow.

### User Personas

- **Recruiter**: scans the site in under a minute; wants a clear headline, fast load, and working links to real work.
- **Developer**: wants to assess depth — stack choices, architecture focus, and open-source projects.

### User Stories

- As a **recruiter**, I want to see a clear role headline immediately so that I understand what Jonathan does within seconds.
- As a **recruiter**, I want to move between About, Resume, Projects, Skills, and Contact like a game menu so that I can browse the whole site without scrolling.
- As a **recruiter**, I want each view to be one URL away so that I can share or revisit exactly the page I need.
- As a **developer**, I want to see four real projects with their stacks so that I can assess breadth and depth.
- As a **recruiter**, I want a working contact path so that I can reach out in one step.
- As a **visitor on a phone**, I want list and detail panels to stack and scroll so that content stays reachable on small screens.
- As a **visitor on a slow connection or with JavaScript disabled**, I want the views to still render their content so that nothing hides behind a script.

### Acceptance Criteria

- [ ] The root route `/` renders the game menu with exactly five items: ABOUT, RESUME, PROJECTS, SKILLS, CONTACT; ArrowUp/ArrowDown wraps and Enter activates.
- [ ] The menu is centered/center-right with per-item diagonal offsets/skews and no overlapping items; the stagger collapses on coarse-pointer viewports so every item stays a non-colliding 44px target.
- [ ] The keyboard-active item carries `data-active` + `aria-current="page"` with a persistent colorful indicator (accent text + accent layer/bar); `:focus-visible` stays visible; hover mirrors the treatment.
- [ ] Keyboard/control hints and the audio mute toggle render as a fixed bottom-right cluster that never overlaps content; hints hide on coarse-pointer viewports.
- [ ] An original abstract figure/artifact layer renders over the background, `aria-hidden` and `pointer-events-none`, static under reduced motion; no character art or fonts from the reference repos ship.
- [ ] Ambient audio: no track bundled; a user-provided licensed `/audio/background.mp3` plays only after the first gesture; without a track the mute control renders a disabled no-track state; the muted state persists across reloads and navigation.
- [ ] Each menu item routes to its own static page: `/about`, `/resume`, `/projects`, `/skills`, `/contact`.
- [ ] The ABOUT view renders the role "Backend & Full-Stack Engineer" and the focus areas from site config.
- [ ] The PROJECTS view lists exactly the four verified projects (ServiceFlow, WealthQuest, EventCommerce, Fintual Sensor) with an in-view detail panel; `/projects#serviceflow` deep links to a selected project.
- [ ] The WealthQuest PROJECTS entry links to https://jonasotoaguilar.itch.io/wealthquest; all other external links resolve (checked by E2E).
- [ ] The RESUME view renders only verified CV data: USACH Ingeniería de Ejecución en Computación e Informática (Mar 2020–Apr 2025); technical telecommunications education (Mar 2017–Nov 2019); Productos Barber Chile sales/customer service (2020–2026); Policomp IT support internship (Jan–Mar 2020); ServiceFlow and WealthQuest projects; WealthQuest academic publication (May 2025); languages Spanish (native) and English (basic technical reading). No ranks, metrics, or phone number.
- [ ] The CONTACT view surfaces jonathansoto.dev@gmail.com, GitHub, and the WealthQuest link.
- [ ] Pressing Escape on any view returns to `/`; the Browser Back button follows native history.
- [ ] A 404 page renders for unknown paths and matches the visual identity.
- [ ] Each view page has a distinct `<title>` and exactly one `<h1>` inside a `<main>` landmark; the JSON-LD `Person` block is present with `sameAs` links.
- [ ] `sitemap.xml` is generated at build time and lists the index plus the five view routes (404 excluded).
- [ ] With `prefers-reduced-motion: reduce`, the canvas background renders a single static frame, transitions are opacity-only (<= 200ms), and no movement-based animation plays.
- [ ] Without JavaScript, every view still renders all content in document flow (the no-scroll screen is an enhancement, not a dependency).
- [ ] The site builds with zero runtime backend, database, or cache dependencies.

### Non-Goals

- No blog, CMS, or admin interface.
- No backend, database, caching layer, or server-side rendering of dynamic content.
- No i18n/localization in v1 (content is English only).
- No analytics or tracking scripts.
- No theme toggle (light/dark) — the palette is fixed.
- No per-project detail routes in v1 (list/detail is an in-view panel; `/projects/:slug` may come later).
- No React by default; a React island (`@astrojs/react`) is reserved only for the game menu if it requires it.
- No video or heavy image assets for the background.

## 3. Technical Specifications

### Architecture Overview

Static site generation: Markdown Content Collections feed Astro pages at build time; the output is plain HTML/CSS/JS. The root page is a full-screen game menu; each of the five views is its own static route. A fixed three-layer background (CSS radial glow, CSS scanlines, Canvas 2D particles) sits behind every view. Native View Transitions handle page changes; the canvas persists across them via `transition:persist`. Full detail lives in ARCHITECTURE.md.

### Integration Points

- No APIs, authentication, or databases; external links only (GitHub repos, the WealthQuest itch.io page, the contact email).
- Fonts are self-hosted via `@fontsource`; there is no external font CDN.

### Security & Privacy

- The site is static: no user input, no server, no secrets, no cookies.
- The ambient-audio mute preference persists in `localStorage` only (client-side; fails safely to in-memory when storage is unavailable).
- Decorative background layers are `pointer-events-none` and non-interactive, reducing attack surface to zero client-side state; the CV phone number is never published — email and GitHub are the only contact channels.

## 4. AI System Requirements

Not applicable — this is a static site with no AI components.

## 5. Risks & Roadmap

### Phased Rollout

- **MVP**: game-menu shell + five view routes (About, Resume, Projects, Skills, Contact) + 404; in-view LIST/detail panels; canvas background; View Transitions; SEO (per-view titles, JSON-LD, sitemap); full toolchain (unit, E2E, mutation readiness, lint).
- **v1.1**: localized content (i18n) if interest justifies it.
- **v2.0**: blog, or per-project detail pages, authored in the same Content Collections.

### Technical Risks

- **Browser support**: View Transitions and Canvas 2D need modern browsers; fallbacks are built-in (full-page navigation when transitions are unsupported; glow and scanlines render without the canvas).
- **Keyboard hijack**: the reference's global key listeners are a verified bug and must not be copied; key handling is scoped to the active view, covered by the existing "no hijack" test pattern.
- **Motion contract**: per-view transition overlays must land at <= 400ms (the reference's 450–600ms violates the contract) and degrade to opacity-only <= 200ms under reduced motion.
- **Mobile detail**: the reference breaks resume detail on small screens; our detail panel gets an internal scroll region when stacked below the list.
- **Canvas performance**: an unconstrained particle loop can hurt INP; mitigated by a capped particle count, devicePixelRatio-aware sizing, and pausing when the tab is hidden.
- **Content drift**: external links (itch.io, GitHub) can rot; a link-check test in the E2E suite guards against it.

## Checklist

- [x] Problem is clear before solution detail.
- [x] Success criteria are measurable (Lighthouse, Web Vitals, route and content coverage).
- [x] Non-goals are explicit (no blog, backend, i18n, analytics, per-project routes in v1).
- [x] Acceptance criteria are reviewable (E2E-assertable where possible).

## Next Step

Implementation details and decisions live in [ARCHITECTURE.md](./ARCHITECTURE.md) (architecture) and [DESIGN.md](./DESIGN.md) (design system).
