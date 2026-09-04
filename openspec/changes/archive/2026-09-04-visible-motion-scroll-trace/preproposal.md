---
schema: gentle-ai.sdd-preproposal/v1
revision: 1
change: visible-motion-scroll-trace
artifact_store_mode: openspec
exploration:
  reference: openspec/changes/visible-motion-scroll-trace/exploration.md
  outcome: ready
  ready_for_proposal: true
research_request:
  questions: []
  requested_classes:
    documentation: []
    open-web: []
  admission:
    schema: gentle-ai.sdd-research-capability/v1
    result: not_selected
    reason: "No new research selected — existing 38-source research from archived ui-performance-seo-audit reused per orchestrator decision"
    observed_grants:
      documentation: []
      open-web: []
    freshness: 2026-09-03T00:00:00Z
  research_outcome: reused
  reused_from: openspec/changes/archive/2026-09-03-ui-performance-seo-audit/research.md
  reused_revision: 1
  reused_source_count: 38
  reused_outcome: done
evidence_references:
  openspec:
    path: openspec/changes/archive/2026-09-03-ui-performance-seo-audit/research.md
    schema: gentle-ai.sdd-research/v1
    revision: 1
    bytes_verified: true
    reused: true
    source_count: 38
    outcome: done
  engram:
    topic: sdd/ui-performance-seo-audit/research
    present: false
    reason: "artifact_store.mode=openspec; Engram not required — archived OpenSpec reused; Engram absent per persistence-contract"
product_decisions: confirmed
product_decisions_detail:
  visual_authority: "inherit-existing — PRODUCT.md + DESIGN.md persona3-portfolio v alpha retained; no palette/type/composition redesign; six routes share BaseLayout grammar"
  motion_package: "balanced — route fade ~250ms; panel entrance 24px/620ms with 80ms stagger; desktop fine-hover card lift -2px; persisted background opacity re-entry 250ms"
  route_fade: "250ms"
  panel_entrance_y: "24px"
  panel_entrance_duration: "620ms"
  panel_stagger: "80ms"
  card_lift: "-2px"
  card_lift_media: "(hover:hover) and (pointer:fine)"
  ambient_reentry: "250ms opacity only on persisted background (WaterField/bg-words)"
  reduced_motion: "preserved — prefers-reduced-motion: reduce collapses to opacity instant, no transform/drift/parallax"
  hover_gating: "preserved — fine+hover gating for parallax and card lift; coarse/no-hover never depends on hover"
  will_change: "preserved — transient will-change set before motion, cleared on complete/kill/swap; no standing stylesheet will-change"
  scroll_behavior: "preserved — native document scroll only; never restore global html { scroll-behavior: smooth }"
  scroll_trace_gate: "capture scroll trace before any blur/fixed-layer optimization; only trace-proven paint fix may ship"
  trace_protocol: "exploration.md Trace Protocol — representative routes /projects and /experience at 1280x800 and 390x800, D1/D2/M1/M2/C matrix, chrome-devtools Performance trace, median FPS/long-tasks/layer attribution, gate: blur/layer change warranted iff median FPS <50 or >2 long tasks aligned to ghost/clip/fixed layers in 2/3 runs"
proposal_ready: true
---

# Preproposal: visible-motion-scroll-trace

Research lane is **unselected — reused**. The 38-source evidence from `openspec/changes/archive/2026-09-03-ui-performance-seo-audit/research.md` revision 1 (`gentle-ai.sdd-research/v1`, outcome `done`, accessed 2026-09-03) is reused verbatim. No new `ctx_fetch_and_index` / `context7` research was selected for this change per orchestrator decision and `exploration.md` Reuse vs New Research §.

- **Exploration**: `openspec/changes/visible-motion-scroll-trace/exploration.md` reports `ready` for proposal — current motion/legacy system verified on disk (GSAP y18/0.55 stagger0.06, WaterField persist guard, parallax gating, clip-panel/blur paint suspects), approaches 1/2 as motion baseline with trace-gated approach 3, risks/mitigation and executable Trace Protocol defined. Ready_for_proposal true; blocked until admission closed — now closed by balanced package.
- **Research**: Reused revision 1 covers ClientRouter lifecycle + transition:persist (S-01..S-05), astro:assets priority/loading/fetchpriority (S-06..S-09), will-change transient vs persistent (S-13..S-15), prefers-reduced-motion (S-16), scroll-behavior (S-17), transform compositing (S-18..S-20), sitemap/canonical/OG/sameAs (S-10..S-12, S-32..S-33), Lighthouse/CWV thresholds (S-24..S-27), GSAP import (S-35..S-36). All 38 sources remain current; no contradictions. Reused bytes verified — no new validation needed; new research would not materially improve motion salience proposal until trace evidence exists.
- **Store**: `openspec` — validates only OpenSpec per persistence-contract. OpenSpec readback of archived `research.md` succeeds; Engram not required.
- **Decisions**: `confirmed` — balanced package selected by user: route fade ~250ms; panel entrance 24px/620ms with 80ms stagger; desktop fine-hover card lift -2px; persisted background opacity re-entry 250ms. Invariants confirmed: reduced-motion, fine+hover gating, transient will-change, native scroll preserved; global smooth never restored. Scroll trace gated; only trace-proven paint fix may ship. Visual authority inherit-existing confirmed — no palette/type/composition redesign.

Gate per `research-lifecycle.md`: unselected research skips research-done condition. With exploration ready, reused evidence valid (revision 1, done, 38 sources, bytes_verified true), product decisions confirmed, and store ready, `proposal_ready: true`.

Next: `sdd-propose` may run; it must receive this confirmed pre-proposal handoff (revision 1) and MUST NOT re-interview or infer consent. `DESIGN.md` / `PRODUCT.md` remain inherited authorities — no redesign authorized. If any future evidence revision contradicts, bump `revision` monotonically and re-validate.

## Revision Integrity

- Revision 1 — initial preproposal for `visible-motion-scroll-trace`. Monotonic; no prior revision to compare. Reused research revision 1, outcome done, 38 sources. Evidence references validated against archived file on disk. Product decisions confirmed as above.
