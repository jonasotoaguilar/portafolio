---
schema: gentle-ai.sdd-preproposal/v1
revision: 1
change: ui-performance-seo-audit
artifact_store_mode: openspec
exploration:
  reference: openspec/changes/ui-performance-seo-audit/exploration.md
  outcome: ready
  ready_for_proposal: true
research_request:
  questions:
    - id: Q1
      text: "Astro 7 ClientRouter / view transition lifecycle: authoritative guidance for route transitions, transition:persist, script re-execution, and avoiding stale persisted animation state."
    - id: Q2
      text: "astro:assets and browser image loading: authoritative guidance for above-fold/LCP images, loading, fetchpriority, preload, responsive widths/sizes, and avoiding eager decorative images."
    - id: Q3
      text: "Web motion performance: authoritative browser guidance for will-change, transform compositing, prefers-reduced-motion, continuous ambient animation, pointer-driven RAF work, and global scroll-behavior: smooth interactions. Distinguish requirements from optional advice."
    - id: Q4
      text: "SEO for Astro static sites: authoritative guidance for canonical URLs, sitemap integration, robots.txt, Open Graph URLs/images, and JSON-LD sameAs; clarify what requires configured site/absolute URLs."
    - id: Q5
      text: "Measurement plan: authoritative Lighthouse/Core Web Vitals guidance for LCP, INP, CLS and comparable before/after testing. Do not invent target measurements beyond official thresholds or the sources' own wording."
    - id: Q6
      text: "GSAP 3: official evidence on tree-shaking/import behavior and whether replacing GSAP with CSS should be treated as a measured tradeoff rather than assumed improvement."
  requested_classes:
    documentation:
      - ctx_fetch_and_index
      - ctx_search
      - context7_resolve-library-id
      - context7_query-docs
    open-web:
      - ctx_fetch_and_index
      - ctx_search
admission:
  schema: gentle-ai.sdd-research-capability/v1
  result: admitted
  observed_grants:
    documentation:
      - ctx_fetch_and_index
      - ctx_search
      - context7_resolve-library-id
      - context7_query-docs
    open-web:
      - ctx_fetch_and_index
      - ctx_search
  freshness: 2026-09-03T00:00:00Z
research_outcome: done
evidence_references:
  openspec:
    path: openspec/changes/ui-performance-seo-audit/research.md
    schema: gentle-ai.sdd-research/v1
    revision: 1
    bytes_verified: true
  engram:
    topic: sdd/ui-performance-seo-audit/research
    present: false
    reason: "artifact_store.mode=openspec; Engram not required per persistence-contract hybrid rule (openspec validates only OpenSpec)"
product_decisions: confirmed
product_decisions_detail:
  about_cta: "Reroute About CTA from /experience to /contact (forward step; Contact is desire path)"
  linkedin: "Promote text handle jonathan-soto-dev to https://www.linkedin.com/in/jonathan-soto-dev everywhere (contact card, home panel, Footer) with target _blank rel me noopener noreferrer; flag as constructed from authorized handle, not 999-verified; update Head.astro sameAs to [github, linkedinUrl]"
  privacy: "Phone stays absent: zero tel:, zero telephone in JSON-LD, zero 8894|2050|+56 in dist/src"
  copy: "Strip provenance/dev copy ship-wide (Contact 3 paragraphs + guard string, Experience provenance sentence, About Facts-only phrasing, Projects legacy note) and rewrite as finished product voice; no CV string ships"
  cv_github_internal: "CV/GitHub remain internal sources, not public copy"
  seo: "Require site configured for canonical/sitemap/robots absolute URLs; do not fabricate site value; sitemap gated on SITE but document local verification via SITE demo build; add robots.txt Sitemap hint when site present"
  motion_seo_perf: "Slice B: remove global scroll-behavior smooth or scope to :target, short-lived will-change (set before timeline, clear on complete), gate mousemove parallax to (hover:hover) and (pointer:fine) + !prefersReduced, consider lazy GSAP or CSS replacement as measured tradeoff, add per-route LCP preload fetchpriority high + og:image dimensions"
proposal_ready: true
---

# Preproposal: ui-performance-seo-audit

Selected research lane is **done**. Every admitted question (Q1..Q6) is supported by mapped authoritative sources in `research.md` (S-01..S-38). No question is unsupported, no synthesis without source, no `not found` required.

- **Exploration**: `exploration.md` reports ready for proposal with two-slice recommendation (A correctness, B motion/SEO/perf hardening) and explicit product decisions.
- **Research**: `research.md` revision 1, outcome `done`, all 6 questions validated, sources with publisher/URL/excerpt, contradictions/uncertainty/freshness recorded, product choices kept separate.
- **Store**: `openspec` — validates only OpenSpec per persistence-contract. OpenSpec readback succeeds; Engram not required.
- **Decisions**: `confirmed` — About→Contact, LinkedIn link constructed, privacy invariant, provenance removal, CV internal, SEO `site` requirement, motion handling all confirmed per exploration p.82.

Gate per `research-lifecycle.md`: selected research is ready only when evidence is valid and `done`, decisions are `confirmed`, references valid, and selected store mode ready. All true → `proposal_ready: true`.

Next: `sdd-propose` may run; it must receive this confirmed pre-proposal handoff and MUST NOT re-interview or infer consent. If any future evidence revision contradicts, bump `revision` and re-validate.

