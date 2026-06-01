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
      base: "300ms"
      slow: "600ms"
---

# DESIGN.md — Jonathan Soto Portfolio

## Information Architecture

```
Home (single-page)
├── Header (sticky nav)
├── Hero (intro, name, tagline, CTAs)
├── Projects (collection-driven cards, filterable by tags)
├── Experience (timeline, chrono-descending)
├── Skills (grid: languages, frontend, backend, practices)
├── Contact CTA (email link, social links)
└── Footer (copyright, social links)

/404
└── Not found page with back-home CTA
```

All sections are reachable via anchor links from the sticky header. The page is progressively enhanced — all content renders without JavaScript.

## Visual Language

**Dark-first.** The canvas is `#0a0a0f` — near-black with a subtle blue undertone. Elevated surfaces (`#111118`, `#1a1a24`) create depth through layering rather than heavy shadows.

**Accent color is violet (`#7c5cfc`).** Used sparingly for CTAs, active states, and links. Glow effects (`box-shadow` with accent at 20–30% opacity) reinforce the premium feel without being gaudy.

**Typography drives hierarchy.** Inter for body and headings (clean, neutral, modern). JetBrains Mono for code-like elements (tags, dates, labels). Size scale: `text-sm` for metadata → `text-4xl`–`text-6xl` for hero heading.

**Restrained decoration.** Thin borders (`border-dark-800`) separate sections. No gradients, no emoji, no illustrations — the work speaks.

## Responsive Behavior

- Mobile-first breakpoints: `sm:` (640px), `lg:` (1024px).
- Single-column on mobile; 2-column project grid at `sm:`; 4-column skills grid at `lg:`.
- Sticky header collapses to icon-only on mobile in future iteration; currently full nav.
- All touch targets ≥ 44px (accessibility constraint).

## Accessibility

- `prefers-reduced-motion` disables all animations and sets `scroll-behavior: auto`.
- Focus-visible outlines on all interactive elements (accent color, 2px offset).
- Semantic HTML: `<nav>`, `<header>`, `<main>`, `<footer>`, `<article>` for project cards.
- Skip-to-content link added in a future iteration.
- Color contrast ratios meet WCAG AA minimums (text-primary on bg: ~15:1, text-secondary on bg: ~7:1).

## Animation Rules

| Trigger | Effect | Duration | Respects reduced motion |
|---------|--------|----------|------------------------|
| Page load (Hero) | Fade-in | 0.6s | ✅ |
| Scroll-in (sections) | Slide-up + fade-in | 0.6s | ✅ |
| Hover (project cards) | Border color shift | 150ms | ✅ |
| Hover (links/buttons) | Color transition | 150ms | ✅ |

All animations use CSS `@keyframes` and `animation` — zero JavaScript for motion. GPU-accelerated where possible (`transform`, `opacity` only).

## SEO / Performance Constraints

- **Static generation.** Every route is pre-rendered. No SSR, no hydration needed for core content.
- **Metadata per page:** `<title>`, `<meta description>`, Open Graph, Twitter card, canonical URL.
- **JSON-LD Person schema** on homepage with name, URL, job title, description.
- **Sitemap** auto-generated via `@astrojs/sitemap`.
- **Astro prefetch** enabled for instant navigation.
- **CSS minification** via Lightning CSS (Vite build option).
- **Font loading:** Google Fonts CDN with `display=swap`, `preconnect` hints for fast TTFB.
- **Image optimization:** Future content images will use Astro's `<Image />` component with format auto-detection and responsive srcsets.
- Lighthouse target: ≥ 95 performance, ≥ 100 accessibility, ≥ 100 SEO, ≥ 100 best practices.

## Component States

### ProjectCard
- **Default:** Dark surface, subtle border, full content visible.
- **Hover:** Border lightens to `border-dark-600`, title shifts to accent.
- **External link:** Arrow icon, opens in new tab with `rel="noopener noreferrer"`.

### Header
- **Default:** Transparent backdrop with blur.
- **Scroll:** Sticky, backdrop increases to `bg-dark-950/90`.
- **Active link:** Accent color underline (future iteration).

### ContactCTA
- **Default:** Accent button + muted social links.
- **Hover (button):** Darkens to `bg-accent-600`.
- **Hover (social links):** Lightens to `text-accent-300`.

### Timeline
- **Default:** Vertical line on desktop, no line on mobile.
- **Each entry:** Dot + date range + role + company + description.
- **Present:** `endDate` omitted → renders "Present" badge.

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
- **CSS animations only** for motion. No JS animation libraries.
- **Content in MDX/Markdown** under `src/content/`. Structured with Zod schemas and loaders in `src/content.config.ts`.
- **Build must pass `astro check`** (TypeScript validation) before `astro build`.
- **All public-facing strings in English** — project is an English portfolio.
