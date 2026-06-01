---
tokens:
  font:
    sans: "Inter Variable, Inter, system-ui, sans-serif"
    mono: "JetBrains Mono Variable, JetBrains Mono, ui-monospace, monospace"
  color:
    bg:
      base: "#0a0a0f"
      surface: "#111118"
      elevated: "#1a1a24"
      border: "#242438"
      borderHover: "#2e2e44"
    accent:
      base: "#7c5cfc"
      hover: "#6933ff"
      active: "#5429e6"
    text:
      primary: "#f0f0fa"
      secondary: "#a0a0b8"
      muted: "#6b6b80"
  spacing:
    section: "py-24"
    container: "max-w-6xl mx-auto px-4 sm:px-6 lg:px-8"
  radius:
    card: "rounded-2xl"
    button: "rounded-xl"
    tag: "rounded-md"
  motion:
    duration:
      fast: "150ms"
      base: "200ms"
      slow: "600ms"
---

# DESIGN.md — Jonathan Soto Portfolio

## Information Architecture

```
Home (single-page)
├── Scroll-reactive animated background (CSS variables + aurora orbs + inline JS)
├── Header (sticky nav, ordered: Projects → About → Skills → Contact)
├── Hero (intro, split-color name, profile photo, CTAs)
├── Projects (collection-driven cards with category badges, visual panels, separate link buttons)
├── About / Education / Experience / Publication (2×2 grid of cards)
├── Skills (grid with per-skill icons and hover animation)
├── Contact (3-column card grid: Email, GitHub, LinkedIn with glow hover)
└── Footer (copyright, social icon links)
```

The page is a single-page portfolio. All sections are reachable via anchor links from the sticky header. Nav links are ordered to match DOM section order: `/` (JS logo home) → `#projects` → `#about` → `#skills` → `#contact`.

The page is progressively enhanced — all content renders without JavaScript. A single small inline script sets a `--scroll-progress` CSS variable to drive the animated background.

There is a single Projects section as the one source of truth for all project content — no separate Featured Work section. This avoids duplicate/redundant content.

The About/Education/Experience/Publication sections are grouped into a single `ProfileSections` component with a 2×2 grid of compact cards anchored at `#about`. Each card uses a distinct header icon and uses the same dark card styling as the rest of the page. Content is drawn from the user's verified CV, GitHub README, and academic record.

### Nav Brand Animation

The header brand link shows a JS monogram (rounded square badge with blinking caret) by default. On hover/focus, the monogram fades out and "Jonathan Soto" fades in using an opacity crossfade — zero JavaScript, no layout jump. The full name occupies space in the layout at all times (opacity-hidden) to prevent width shifting. The link has `aria-label="Jonathan Soto — Home"` for accessibility. Both monogram and name text are `aria-hidden="true"` since the accessible name is on the parent anchor.

## Visual Language

**Dark-first.** The canvas is `#0a0a0f` — near-black with a subtle blue undertone. Elevated surfaces (`#111118`, `#1a1a24`) create depth through layering rather than heavy shadows.

**Accent color is violet (`#7c5cfc`).** Used for CTAs, active states, links, hover borders, and decorative elements. Glow effects (`box-shadow` with accent at 20–30% opacity) reinforce the premium feel on card hover.

**Typography drives hierarchy.** Inter for body and headings (clean, neutral, modern). JetBrains Mono for code-like elements (tags, dates, labels, section badges, category labels). Size scale: `text-sm` for metadata → `text-4xl`–`text-6xl` for hero heading.

**Minimalist but impactful.** Inline SVG icons throughout: category icons in Skills header, per-skill icons with hover color transitions, action buttons in project cards and contact section, social icons in footer, decorative elements (accent dot + line) in Hero. Abstract visual panels for projects without screenshots use CSS-only geometric compositions.

### Hero Visual Treatment

The hero section includes:
- **Split-color name**: "Jonathan" in `text-primary`, "Soto" in `accent-400`. Both are in a single `<h1>`.
- **Profile photo**: Local asset served via Astro Image, circular crop with accent border.
- All text is accessible — the name is real `<h1>` content.

### Scroll-Reactive Background

A CSS-first animated background with four layers, all driven by `--scroll-progress` (0–1) set by a ~250-byte inline script:

1. **Base gradient** (`body::before`, z-index: -3): Shifts hue toward accent color with scroll depth.
2. **Dot grid** (`body::after`, z-index: -2): Opacity intensifies from 0.12 to 0.40 based on scroll.
3. **Aurora orb 1** (top-right): Violet/magenta radial gradient, ~60vw, drifts with `aurora-drift` animation (12s), position shifts with scroll.
4. **Aurora orb 2** (bottom-left): Blue/cyan radial gradient, ~50vw, drifts reverse (16s).
5. **Aurora orb 3** (center-right): Accent/purple radial gradient, ~40vw, drift 14s alternate, opacity increases most dramatically with scroll.

The aurora orbs are fixed-position `<div>` elements with `blur(100px)` filter, placed directly in the DOM by `BaseLayout.astro` with `aria-hidden="true"`.

The script respects `prefers-reduced-motion`: if the user has reduced motion preferences, the script exits early and no `--scroll-progress` variable is set, leaving orbs invisible (opacity: 0 by default).

No animation libraries, no Remotion, no third-party motion frameworks.

## Responsive Behavior

- Mobile-first breakpoints: `sm:` (640px), `lg:` (1024px).
- Single-column on mobile; 2-column project grid at `sm:`; 4-column skills grid at `lg:`; 3-column contact grid at `sm:`.
- Sticky header collapses to icon-only on mobile in future iteration; currently full nav.
- All touch targets ≥ 44px (accessibility constraint).

## Project Card Visual System

### Card Structure

Each project card is an `<article>` element (not a full-card `<a>`). Cards with links render separate action buttons at the bottom. This eliminates nested interactive elements.

Each card has:
1. **Visual panel** (188px tall): image (with lazy loading + hover scale) or CSS abstract geometric panel.
2. **Category badge**: color-coded borders per status.
3. **Title** (`h3`): transitions to accent color on card hover.
4. **Description**: 3-line clamp, secondary text.
5. **Tags**: mono-spaced pill badges.
6. **Link buttons** (when URLs exist): compact bordered buttons with icons — "Repo" (GitHub icon), "Live" (external link icon), "Thesis publication" (book icon). Each opens in a new tab with `rel="noopener noreferrer"`.

### Category Badges

- **Published / Production / PyME** → accent purple (`bg-accent-500/10 border-accent-500/40`)
- **Thesis / Serious Game** → amber (`bg-amber-500/10 border-amber-500/40`)
- **Thesis** → amber (`bg-amber-500/10 border-amber-500/40`)
- **Thesis / API Integration** → sky (`bg-sky-500/10 border-sky-500/40`)
- **Open Source / Practice Project** → emerald (`bg-emerald-500/10 border-emerald-500/40`)

### Project Link Model

Each project can have up to three distinct URLs:

| Field | Label | Icon | Example |
|-------|-------|------|---------|
| `repoUrl` | Repo | GitHub | ServiceFlow, EventCommerce, Fintual Sensor |
| `liveUrl` | Live | External link | ServiceFlow, WealthQuest |
| `thesisUrl` | Thesis publication | Book | WealthQuest |

Links render as compact bordered buttons with SVG icons and text labels. Buttons only render when the corresponding URL field is present.

### Abstract Visual Panels

- **ServiceFlow**: Service-flow grid pattern on dark purple gradient.
- **EventCommerce**: Event-stream composition with ECG-like SVG on dark green gradient.

### Hover Effects

- Card: border shifts to accent purple, glow shadow intensifies, card lifts 4px.
- Visual panel image: slight scale-up (105%).
- Category badge: border opacity transitions.
- Title: color transitions to accent.
- Tags: background lightens slightly.
- Link buttons: border/accent text color transition, background shift.

## Skills Visual System

Each skill item includes a 14×14 SVG icon with hover color/scale transitions, organized into four categories:

- **Languages** (6 items): JavaScript, TypeScript, Python, Java, SQL, NoSQL
- **Frameworks & Tools** (5 items): React, Next.js, Spring Boot, Git, REST APIs
- **Focus Areas** (4 items): Backend, Web Development, APIs, Developer Experience
- **Practices** (7 items): TDD, Spec-Driven Development, GitHub Actions, AI Agents, Clear APIs, Maintainable Systems, Automation

All skill names are plain text — no HTML entities in the data layer (the `&amp;` bug is fixed).

## Experience Section

The Experience card in ProfileSections includes two entries with honest, detailed descriptions emphasizing applied professional skills rather than inflated titles:

- **Customer Service & Technical Support** at Productos Barber Chile (2020–2026): Customer-facing role combining technical support, IT operations, and process automation. Delivered ServiceFlow as a functional business application. Skill tags: Customer communication, IT support, Process automation, ServiceFlow.
- **IT Support Intern** at Policomp (Jan–Mar 2020): Internship focused on incident registration, derivation, and escalation. Resolved simple remote software incidents such as printer connection and configuration. Developed customer support skills through direct user interaction. Skill tags: Incident registration, Escalation, User support, Remote software support.

Compact mono-spaced skill tags appear below each description for quick scanning.

## Footer

The footer uses SVG icons (Feather icons via inline SVG) for GitHub and LinkedIn links instead of plain text. Each icon link has an `aria-label` for accessibility. Links open in new tabs with `rel="noopener noreferrer"`.

## Contact Section

Three-column card grid (single column on mobile):
- **Email card**: Accent-themed (purple icon background), "Say hello" action. Links to `mailto:jonasotoaguilar@gmail.com`.
- **GitHub card**: Dark-themed, links to `github.com/jonasotoaguilar`.
- **LinkedIn card**: Dark-themed, links to LinkedIn profile.

Each card has:
- Rounded-xl icon container with border
- Label (bold, small)
- Secondary text (username/handle)
- Card-level hover: border accent + glow shadow + 4px lift

## Accessibility

- `prefers-reduced-motion` disables all animations, including the scroll-reactive background script.
- Focus-visible outlines on all interactive elements (accent color, 2px offset).
- Semantic HTML: `<nav>`, `<header>`, `<main>`, `<footer>`, project cards are `<article>` elements with child `<a>` buttons — no nested anchors.
- All image links include explicit text labels and `aria-label` attributes.
- The JS monogram in nav is `aria-hidden="true"` (decorative only). Nav brand link uses `aria-label="Jonathan Soto — Home"`.
- Footer social icons use `aria-label` ("GitHub profile", "LinkedIn profile").
- Keyboard focus is visible on all links and buttons.
- Color contrast ratios meet WCAG AA minimums (text-primary on bg: ~15:1, text-secondary on bg: ~7:1).
- All images have `alt` text or are purely decorative with `aria-hidden`.

## Animation Rules

| Trigger | Effect | Duration | Respects reduced motion |
|---------|--------|----------|------------------------|
| Page load (Hero) | Fade-in + glow pulse (decorative) | 0.6s | ✅ |
| Scroll-in (sections) | Slide-up + fade-in | 0.6s | ✅ |
| Scroll (background) | Gradient hue shift + dot grid opacity + aurora orb positions | Continuous (RAF) | ✅ |
| Hover (project cards) | Accent border + glow + lift (4px) + image scale | 300ms | ✅ |
| Hover (skill items) | Icon color + scale + text color | 200ms | ✅ |
| Hover (nav brand) | Full name slides out from JS monogram | 500ms | ✅ |
| Hover (links/buttons) | Color transition | 150ms | ✅ |
| Hero decorative dot | Glow pulse (continuous subtle) | 3s | ✅ |
| JS monogram caret | Blink (step-end) | 1.2s | ✅ |
| Aurora orbs | Drift/opacity animation | 12–16s | ✅ |
| Contact cards | Accent border + glow + lift | 300ms | ✅ |
| Footer social icons | Color transition on hover | 150ms | ✅ |

All animations use CSS `@keyframes`, `transition`, and `animation` — the only JavaScript is the ~250-byte scroll-progress setter for the background. GPU-accelerated where possible (`transform`, `opacity` only).

## Content Schema

```typescript
const projects = defineCollection({
  schema: z.object({
    title: z.string(),              // Project name
    description: z.string(),        // Short description (shown in card)
    liveUrl: z.string().url().optional(),  // Live/demo deployment URL
    repoUrl: z.string().url().optional(),  // Source code (GitHub) URL
    thesisUrl: z.string().url().optional(), // Academic publication permalink
    category: z.string().optional(),   // Badge label
    tags: z.array(z.string()),      // Technology tags
    featured: z.boolean(),           // Prioritized ordering flag
    date: z.date(),                  // Project date
    image: z.string().optional(),    // Visual panel image URL
    imageAlt: z.string().optional(), // Alt text for image
  })
});
```

## Content Integrity Rules

- **No unsupported claims.** Descriptions must match verifiable source data.
- **ServiceFlow** is published in production for a PyME (verified by user). Has both `liveUrl` and `repoUrl`.
- **WealthQuest** has `liveUrl` (itch.io) and `thesisUrl` (USACH library record). No private GitHub repository URL.
- **Fintual Sensor** has `repoUrl` linking to the BlendedGames-bGames GitHub organization.
- **EventCommerce** has `repoUrl` linking to `github.com/jonasotoaguilar/eventcommerce`.
- **All project URLs** point to verified domains: `github.com/jonasotoaguilar`, `github.com/BlendedGames-bGames`, `jonasotoaguilar.itch.io`, `jonasotoaguilar.space`, or `usach.primo.exlibrisgroup.com`.
- **Thesis publication permalink**: `https://usach.primo.exlibrisgroup.com/permalink/56USACH_INST/r14o49/alma992203734506116` is the official USACH library record for WealthQuest. This link also appears in the Publication card in the About section.
- **No placeholder text** anywhere in production content.
- **No fabricated employment.** The Experience section is truthful and emphasizes applied professional skills rather than inflated titles.
- **Profile photo** uses local asset (`src/assets/perfil.jpg`) served through Astro's Image component.
- **Email** matches user-provided CV: `jonasotoaguilar@gmail.com`.

## Technology Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Framework | Astro 5 | Static-first, islands architecture, content collections |
| Styling | Tailwind CSS 4 | Utility-first, CSS-native config via `@theme`, tree-shaken |
| Content | Astro Content Collections | Type-safe, file-based, MDX-compatible |
| Type system | TypeScript strict | Full type safety across templates and collections |
| Lint/Format | Biome 2 | Single tool, fast, ESLint+Prettier compatible |
| Unit tests | Vitest | Vite-native, fast, Astro-compatible |
| E2E tests | Playwright | Cross-browser, trace viewer, reliable selectors |
| Package manager | pnpm | Fast, disk-efficient, strict resolution |

## Implementation Constraints

- **No client-side framework** by default. All components are `.astro` files with zero JavaScript shipped unless explicitly needed for interactive islands.
- **CSS animations only** for motion. The single inline script (~250 bytes) sets a CSS variable only — zero animation logic in JS. Nav brand expand animation is pure CSS (`max-width` + `transition` + `overflow: hidden`).
- **No Remotion** or any animation library. Background is CSS-first with JS only as a variable setter.
- **Content in MDX/Markdown** under `src/content/`. Structured with Zod schemas and loaders in `src/content.config.ts`.
- **Build must pass `astro check`** (TypeScript validation) before `astro build`.
- **All public-facing strings in English** — project is an English portfolio.
