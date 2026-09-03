export type Project = {
  slug: string;
  name: string;
  repo: string;
  summary: string;
  detail: string;
  stack: string[];
  status: string;
  highlights: string[];
  links: { label: string; href: string }[];
};

export const projects: Project[] = [
  {
    slug: "opencode-tokenmeter",
    name: "opencode-tokenmeter",
    repo: "https://github.com/jonasotoaguilar/opencode-tokenmeter",
    summary:
      "OpenCode TUI plugin — TokenMeter sidebar for live token usage, cost, and delegation tree.",
    detail:
      "TUI sidebar for OpenCode sessions: live token count, estimated cost, and worker delegation tree. Solid.js + OpenTUI, shipped to npm as opencode-tokenmeter-tui. Installed as an OpenCode plugin, no backend required.",
    stack: ["TypeScript", "Solid.js", "OpenTUI", "OpenCode Plugin", "Bun"],
    status: "Shipped — npm: opencode-tokenmeter-tui",
    highlights: [
      "Live token/cost sidebar during OpenCode sessions",
      "Delegation tree for sub-agents",
      "Published to npm with provenance",
    ],
    links: [
      { label: "Repository", href: "https://github.com/jonasotoaguilar/opencode-tokenmeter" },
      { label: "npm", href: "https://www.npmjs.com/package/opencode-tokenmeter-tui" },
    ],
  },
  {
    slug: "serviceflow",
    name: "ServiceFlow",
    repo: "https://github.com/jonasotoaguilar/serviceflow",
    summary: "Full-stack service order & ticket management — Next.js + PocketBase + Docker.",
    detail:
      "Live backend is PocketBase (auth + data) with Appwrite noted in GitHub description legacy. Next.js 16 App Router, TypeScript, React 19, Tailwind v4. CRUD + status workflow (pending/ready/completed/cancelled), branch locations, search LIKE + pagination, tenancy by userId, Docker Compose (PocketBase + app), Zod + hook-form.",
    stack: [
      "Next.js",
      "TypeScript",
      "PocketBase",
      "Appwrite (legacy desc.)",
      "Docker",
      "Tailwind CSS",
      "Zod",
    ],
    status: "Shipped — live PocketBase backend in Docker Compose",
    highlights: [
      "Service intake + status workflow with read-only after completion",
      "Location/branch control with movement history",
      "Tenant isolation via PocketBase rules (userId = @request.auth.id)",
    ],
    links: [{ label: "Repository", href: "https://github.com/jonasotoaguilar/serviceflow" }],
  },
  {
    slug: "raguard",
    name: "RAGuard",
    repo: "https://github.com/jonasotoaguilar/raguard",
    summary:
      "Multi-tenant conversational RAG over internal docs — grounded answers with citations.",
    detail:
      "Self-hosted answer engine over PDFs/Markdown. Hybrid retrieval (PostgreSQL FTS simple + pgvector halfvec(1536) HNSW) fused with RRF k=60, permission-filtered per user/role before ranking. Bounded chat with static grounded prompt, OpenAI completer, [n] citation verification, 503 envelope on provider failure, neutral null answer on no-match. Redis/Arq ingestion pipeline (parse, chunk, embed, atomic indexing). Stack: Python 3.13, FastAPI, PostgreSQL + pgvector, Redis, MinIO/S3, Docker Compose.",
    stack: [
      "Python",
      "FastAPI",
      "PostgreSQL + pgvector",
      "Redis + Arq",
      "pgvector HNSW",
      "Docker",
      "OpenAI",
    ],
    status: "MVP retrieval & chat delivered on main (2026-08-24) — web UI planned",
    highlights: [
      "Tenant-predicate before ranking — no unauthorized chunk reaches generation",
      "RRF fusion (k=60) + deterministic tie-break",
      "Injection-aware generation: sources as delimited untrusted data",
    ],
    links: [{ label: "Repository", href: "https://github.com/jonasotoaguilar/raguard" }],
  },
  {
    slug: "eventcommerce",
    name: "EventCommerce",
    repo: "https://github.com/jonasotoaguilar/eventcommerce",
    summary: "Modular event-driven commerce backend — bounded contexts, outbox, idempotency.",
    detail:
      "Product-quality portfolio backend: bounded contexts orders/inventory/payments/notifications/checkout via dependency-injector, orders API (POST/GET + timeline), synchronous checkout creates order + reserves inventory (FOR UPDATE) + authorizes payment via deterministic simulated policy, durable Idempotency-Key with 409 on mismatch, domain_events + outbox_events + processed_events. Python, FastAPI, SQLAlchemy 2 async. AMQP consumer/outbox scheduler and IAM/catalog/cart contexts remain planned — publisher/worker modules exist but not yet wired.",
    stack: [
      "Python",
      "FastAPI",
      "SQLAlchemy",
      "PostgreSQL",
      "Transactional Outbox",
      "Alembic",
      "Docker",
    ],
    status: "Core backend MVP — checkout/orders durable; event choreography & IAM planned",
    highlights: [
      "Transactional outbox + domain event envelope",
      "Row-level inventory lock (FOR UPDATE) in checkout",
      "Deterministic payment policy (ADR-0005) for testability",
    ],
    links: [{ label: "Repository", href: "https://github.com/jonasotoaguilar/eventcommerce" }],
  },
];

export const featuredSlugs = ["opencode-tokenmeter", "serviceflow"] as const;
