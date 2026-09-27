# itsmesujan-3d

**An AI-native builder portfolio — a neo-brutalist interface wrapped around a real-time 3D layer.**

The portfolio of [Majhi Sujan](https://www.itsmesujan.me) (`@itsmesujan`). One human directing a fleet of AI agents, presented as an argument rather than a claim: three scroll-driven WebGL scenes, a hard-edged typographic system, and a complete, fully readable page underneath it all.

> **The thesis in one line:** a fleet of agents is undirected by nature — it drifts, duplicates work, and wanders off-goal. The job is not to code faster. The job is to aim it.

Live: **[itsmesujan.me](https://www.itsmesujan.me)**

---

## Table of contents

- [What this is](#what-this-is)
- [The page is the argument](#the-page-is-the-argument)
- [Tech stack](#tech-stack)
- [Quick start](#quick-start)
- [Architecture](#architecture)
- [The 3D layer](#the-3d-layer)
- [Design system](#design-system)
- [Content is data](#content-is-data)
- [Contact form](#contact-form)
- [Accessibility](#accessibility)
- [Performance](#performance)
- [SEO and metadata](#seo-and-metadata)
- [Security headers](#security-headers)
- [Deployment](#deployment)
- [Editing guide](#editing-guide)
- [Known limitations](#known-limitations)
- [License](#license)

---

## What this is

A single-page portfolio (`/`) plus statically generated case studies (`/work/[slug]`), built as a **Next.js App Router** application with a **React Three Fiber** enhancement layer.

Two ideas drive every decision in this codebase:

1. **3D is an enhancement, never a dependency.** The page must be complete, readable, and actionable with JavaScript disabled, WebGL unavailable, a mid-range Android phone, or `prefers-reduced-motion: reduce` set. Every 3D scene has a permanent static poster underneath it that carries the full message on its own.
2. **Interaction must have a spatial consequence.** A visitor control that only changes a label teaches nothing. So "inject fault" visibly kills a node and routes a detour around it; the LOCAL↔CLOUD slider physically sends packets down a different path to a different destination.

Nothing on this page is invented. Every number, project, and claim in `src/content/site.ts` is transcribed from real shipped work.

## The page is the argument

Page order is not decoration — it is the sequence of the pitch. Seven sections, with the three 3D beats deliberately separated by 2D so the page breathes, and the evidence section placed *after* the spectacle so 3D is never asked to do the job of proof.

| # | Section | Beat | What it does |
|---|---------|------|--------------|
| 1 | `Hero` | Orientation | Who this is. Hard typographic statement + a quiet always-on agent swarm. |
| 2 | `FleetSection` | **3D — Signature** | A scattered swarm is *recruited* into the six-stage build loop as you scroll. |
| 3 | `DagSection` | **3D — Evidence** | A mission graph fails on command and repairs itself. Agent-X made visible. |
| 4 | `RouterSection` | **3D — Mechanism** | Local vs cloud: packets take a different physical path based on your input. DevPilot. |
| 5 | `Work` | Proof | The shipped work, in numbers. Cards link to full case studies. |
| 6 | `About` | Credibility | Who is behind it, and the methodology. |
| 7 | `Contact` | Action | A real form backed by a server action. |

Three case studies are generated from the same content source: **DevPilot** (Flutter, on-device GGUF models), **Agent-X** (a self-healing agent operating system), and **this site** (the proof that the methodology works on its own author).

---

## Tech stack

| Layer | Choice | Version |
|-------|--------|---------|
| Framework | Next.js (App Router, React Server Components) | `^15.5.4` |
| UI runtime | React / React DOM | `^19.1.1` |
| 3D renderer | three | `^0.180.0` |
| 3D React bindings | @react-three/fiber | `^9.3.0` |
| 3D helpers | @react-three/drei | `^10.7.6` |
| Styling | Tailwind CSS (CSS-first `@theme` config) | `^4.1.13` |
| Language | TypeScript (strict) | `^5.9.2` |
| Package manager | pnpm (lockfile committed) | — |

No animation library. Motion is hand-rolled against one shared clock, which keeps the frame budget predictable and the bundle small.

## Quick start

Requires **Node.js 20+** and **pnpm**.

```bash
# install
pnpm install

# develop (http://localhost:3000)
pnpm dev

# production build + serve
pnpm build
pnpm start

# lint
pnpm lint
```

There is **no environment configuration required** — the app reads no environment variables.

### Project scripts

| Script | Command | Purpose |
|--------|---------|---------|
| `dev` | `next dev` | Local dev server with Fast Refresh |
| `build` | `next build` | Production build (all routes prerendered) |
| `start` | `next start` | Serve the production build |
| `lint` | `next lint` | ESLint via Next.js |

---

## Architecture

```
src/
├── app/                          # App Router — routing, metadata, global styles
│   ├── layout.tsx                # Fonts, metadata, JSON-LD (Person + WebSite)
│   ├── page.tsx                  # The single-page argument: 7 sections in order
│   ├── globals.css               # Design tokens (@theme), utilities, a11y, print
│   ├── not-found.tsx             # 404 — "Nothing shipped here."
│   ├── robots.ts                 # Generated robots.txt
│   ├── sitemap.ts                # Generated sitemap (home + every case study)
│   └── work/[slug]/page.tsx      # Case studies, statically generated per project
│
├── components/
│   ├── Header.tsx                # Fixed nav, scroll-solid state, Esc-closable sheet
│   ├── Footer.tsx                # Closing rail
│   ├── ContactForm.tsx           # Client form; server action is the source of truth
│   └── three/                    # The 3D layer
│       ├── SceneHost.tsx         # ★ The shared host: capability, geometry, progress
│       ├── SceneCanvas.tsx       # Renderer boundary: code-split, error, context-loss
│       ├── HeroScene.tsx         # Quiet hero swarm (lightweight, always-on)
│       ├── AgentSwarm.tsx        # Scene 1 — scatter → ring (the six-stage loop)
│       ├── SelfHealingDag.tsx    # Scene 2 — fault injection + recovery detour
│       └── ModelRouter.tsx       # Scene 3 — local ⇄ cloud packet routing
│
├── content/
│   └── site.ts                   # ★ Single source of truth for every string/number
│
├── lib/
│   ├── capability.ts             # WebGL2 probe, motion prefs, quality tiers, budgets
│   ├── useClock.ts               # One shared rAF clock + reveal/in-view/perf hooks
│   └── useNavHref.ts             # Resolves hash nav targets from any route
│
└── sections/                     # The seven page beats
    ├── Hero.tsx  FleetSection.tsx  DagSection.tsx  RouterSection.tsx
    └── Work.tsx  About.tsx  Contact.tsx
```

### The two files that matter most

- **`src/content/site.ts`** — every string, number, project, and capability on the site lives here. Change a metric in one place; the page, the case studies, the sitemap, and the JSON-LD all follow.
- **`src/components/three/SceneHost.tsx`** — the single contract that every 3D section implements. It decides *whether* 3D runs at all, maps the section's own scroll range to `0–1`, owns every listener it creates, and guarantees the static poster stays in the DOM.

### Component boundaries

- **Server components** (default): `layout`, `page`, `work/[slug]`, `robots`, `sitemap`, `not-found`, `Contact`, and the whole content layer.
- **Client components** (`"use client"`): anything touching scroll, pointer, WebGL, route-aware links, or form state — `Header`, `Footer`, `ContactForm`, `Hero`, the three 3D sections, and `lib/useClock.ts`.
- **Dynamic imports** (`ssr: false`): the entire `three` / R3F dependency graph. It is code-split and only ever mounted in the browser once a section is near the viewport.

---

## The 3D layer

Three scenes, each one an argument made visible. Every scene is a thin consumer of `SceneHost`; none of them touches scroll, resize, or visibility APIs directly.

### SceneHost — the contract

`SceneHost` takes three render props and a few knobs:

| Prop | Role |
|------|------|
| `poster` | The **permanent** static composition. Shown before the 3D loads, on no-WebGL, and forever after any failure. Not a degraded mode — it carries the full message. |
| `overlay` | 2D content above the canvas. Receives `progress` so copy can sync with the scene. |
| `scene` | The 3D contents, receiving a `SceneContext`. |
| `label` | Section label for assistive technology. |
| `camera`, `minHeight`, `className` | Composition and scroll travel. |
| `id` | Anchor target, so in-page navigation can land on the section. |
| `budget` | Optional override of the per-tier particle/packet count for this specific scene. |

Every consumer receives the same `SceneContext`:

```ts
type SceneContext = {
  progress: number;  // this section's own scroll progress, 0–1, measured not guessed
  tier: Tier;        // "low" | "balanced" | "high"
  paused: boolean;   // reduced motion, or scrolled off-screen
  allowTilt: boolean;// fine pointer and motion allowed
  pointer: { x: number; y: number }; // -1–1
  count: number;     // particle/packet budget for this tier
  nodes: number;     // graph-node budget for this tier
  off: boolean;      // 3D is permanently off — reduced motion, or a failed context
};
```

### What gates 3D

A scene only boots when **all** of these are true:

1. `prefers-reduced-motion` is not set.
2. The section has come near the viewport (`IntersectionObserver`, `rootMargin: 300px`).
3. WebGL initialization has not failed, and the GL context has not been lost.

If any check fails, the poster renders instead and the page stays complete. `SceneCanvas` additionally handles a real, commonly-underestimated failure mode: `webglcontextlost` is caught, `preventDefault()`ed, and the 3D subtree is torn down in favour of the static composition.

A canvas, once mounted, is not thrown away when its section scrolls out of view: the frame loop is switched to `frameloop="never"`, so invisible pixels cost nothing while a return scroll skips renderer creation, context setup, shader compilation and buffer upload. `SceneContext.off` is the separate, permanent case — reduced motion, or a dead context — which an overlay uses to disable the controls that depend on the scene and say why.

### Quality tiers

`lib/capability.ts` probes the device (WebGL2 availability, `deviceMemory`, `hardwareConcurrency`, pointer type, viewport size) and picks a starting tier. `lib/useClock.ts → usePerfTier` then **corrects it from measured frame behaviour**:

- two accumulated seconds of frames slower than ~34 ms → demote
- five stable seconds at `balanced` → promote to `high`
- two reversals → lock the tier low so it stops oscillating

Per-tier budgets, read by the scenes themselves:

| Tier | DPR range | Particles | Graph nodes | Shadows | Antialias |
|------|-----------|-----------|-------------|---------|-----------|
| `low` | `1 – 1` | 220 | 7 | no | no |
| `balanced` | `1 – 1.25` | 520 | 10 | yes | yes |
| `high` | `1 – 1.5` | 1100 | 14 | yes | yes |

Scenes that need different density override it per section: the fleet swarm runs `300 / 750 / 1400` agents, the router runs `40 / 70 / 120` packets, and the hero swarm is a fixed lightweight `420` (`120` under reduced motion). The mission graph reads `nodeCount` and trims the tail of its layout — the core path, the fault, and the recovery detour survive every tier. `antialias` is latched from the starting tier before the GL context exists, because it is a context-creation option rather than a runtime toggle.

### The shared clock

There is exactly one `requestAnimationFrame` loop on the page (`lib/useClock.ts`). It samples scroll progress, scroll direction, normalized pointer position, and tab visibility once per frame, then notifies subscribers. Consumers subscribe and clean up; the loop starts on the first subscriber and stops on the last, and it pauses entirely while the tab is hidden so nothing jumps on return.

This is why the page can host three animated scenes without three competing listeners, and why every animated property has exactly one owner.

### The three scenes

**1. `AgentSwarm` — the fleet (`FleetSection`)**
An undirected swarm that scroll *recruits* into the six stages of the build loop. Each agent carries a deterministic home position (a seeded hash, not `Math.random`, so a reload always shows the same six stages), a target stage, an orbital offset, and a stagger delay. Scroll maps non-linearly: the first fifth establishes, the middle three-fifths resolve, the last fifth holds so the labels are readable. Colour carries meaning — ink while scattered, signal orange as it locks in, brightening on hold. Positions are written straight into a preallocated `Float32Array`; the render loop allocates nothing.

**2. `SelfHealingDag` — Agent-X (`DagSection`)**
A mission graph laid out in layers left→right, the way a scheduler reads — 12 nodes at the top tier, trimmed toward the core path on weaker devices — along the dependency edges of a real mission. The single visitor control is **Inject fault**: the target node dies, every edge touching it severs in red, and a teal recovery detour fades in around the break. Existing edges then settle into the recovery state. The button then reads **Replay fault**, with **Reset graph** beside it returning the graph to healthy: the fault state is a prop owned by the section, so a replay restarts from `t=0` with no hidden internal toggle, and each injection is announced in a live region. The visitor learns what "self-healing" means by watching it happen, not by reading a caption.

**3. `ModelRouter` — DevPilot (`RouterSection`)**
A handset, a local GGUF runtime below it, and a 5-sphere cloud cluster above it (many providers, not one vendor). The slider is a real routing parameter: packets spawn at the device, arc outward, and land on a *different destination* depending on the value, taking the colour of whichever route they fly. Packets are one `InstancedMesh` — a single draw call for the entire stream.

### Zero-allocation render loops

All three scenes follow the same discipline: scratch `Vector3` / `Color` / `Object3D` objects are hoisted out of the frame callback, buffers are preallocated for the tier's count, and `dispose()` is called on every GPU resource the scene owns at unmount.

---

## Design system

Neo-brutalist edge over a high-tech layer. **The paper is the interface; the void behind it is where the agents run.** Everything is defined as a token in `src/app/globals.css` — no colour, duration, or corner radius is written inline.

### Tokens (Tailwind v4 `@theme`)

**Surfaces** — `paper` `#f4f1ea` · `paper-dim` `#e8e4d9` · `ink` `#0a0a0a` · `ink-soft` `#1c1c1c` · `void` `#050506`

**Signal** — `signal` `#ff4d1c` · `signal-deep` `#d93a0d` · `verify` `#00e07a` · `fail` `#ff2d55`

There is exactly **one** accent colour, used sparingly so it always means something: signal orange marks the active, aimed, or chosen thing. Verification green and failure red are reserved for the DAG scene, where they carry their literal meaning.

**Type** — three families, loaded through `next/font/google` with `display: swap`:

| Role | Family | Usage |
|------|--------|-------|
| Display | **Archivo** (900/800/600) | Headlines — `.t-display`, `.t-section`, `.t-card` |
| Mono | **JetBrains Mono** | Labels, metrics, index numbers — `.t-mono` |
| Body | **Inter** | Prose — `.t-body-lg` |

**Structure** — `--border-brut: 2.5px`, `--radius-brut: 0px`. Nothing rounds by accident.

**Motion** — all durations and easings live in tokens; `--ease-out-expo` and `--ease-in-out-quart` are the only two curves.

### Fluid type

Every text size is `clamp()`-based and tuned so nothing overflows at 320 px wide — the narrowest viewport the site is audited against. `.t-display` scales from `2.75rem` to `11rem`.

### Textures and utilities

- `.grid-paper` / `.grid-void` — the blueprint grid, light and dark variants.
- `.scanlines` — a hard scanline overlay for void sections.
- `.brut` — the bordered, hard-shadow panel primitive.
- `.reveal-line` / `.reveal-inner` / `.fade-up` — reveal primitives that **work without JavaScript** (the settled state is the default; `data-revealed="true"` is what animates them in).
- `@utility text-balance`, `text-pretty`, `rule-brut`, `rule-brut-void`, `over-scene`.

### Reduced motion

`prefers-reduced-motion: reduce` is handled properly: it removes pinning, parallax, and loops — not just shortening durations. The reveal transforms are forced to their settled state, smooth scrolling is disabled, and 3D never boots at all. **The settled state is the complete state.**

---

## Content is data

`src/content/site.ts` is the single source of truth, and it is deliberately the only place a claim is stated. It exports:

| Export | Consumed by |
|--------|-------------|
| `site` | Layout metadata, JSON-LD, header, footer, contact links |
| `loopSteps` | The six-stage method — 2D list *and* the 3D ring geometry |
| `projects` | Work cards, case study pages, sitemap, per-project metadata |
| `timeline`, `capabilities`, `now` | About section |
| `about`, `contact` | Section copy |
| `verificationLevels` | The DAG verification legend |

The file opens with an explicit provenance rule, and it is worth repeating:

> **PROVENANCE:** every string here is transcribed from the live site and its three case studies as of the current build. Nothing is invented. If a number changes, change it here only.

The `Project` type is the contract for a case study — `problem`, `idea`, `challenges[]`, `iteration`, `result`, `tech[]`, plus an `accent` that drives both the card styling and the scene tint. Adding a project to that array is the *entire* process for adding a case study: the route, the static params, the metadata, the sitemap entry, and the work card all generate themselves.

---

## Contact form

The form is a **React 19 server action** (`useActionState` + `useFormStatus`), and the server is the only source of truth. There is no client-side-only success path: a message is never reported as sent unless the server confirms it.

**Validation runs on the server**, with strict length bounds:

| Field | Rule |
|-------|------|
| `name` | 2–120 characters |
| `email` | Structural pattern check, max 200 characters |
| `subject` | 2–160 characters |
| `message` | 10–5000 characters |

**Spam:** a honeypot field (`company`) is positioned off-screen and hidden from assistive tech. If it is filled, the action returns a successful response — so bots learn nothing — but sends nothing.

**Failure states are honest.** The action returns one of five explicit statuses: `idle`, `ok`, `invalid`, `error`, `unconfigured`. In this build, delivery is not wired to a provider, so a valid submission returns **`unconfigured`** — the form says "Form not connected yet" and points the visitor at direct email instead of faking a success. To enable real delivery, replace the final `return { status: "unconfigured", errors: {} }` in `src/sections/Contact.tsx` with a provider call and only return `{ status: "ok", errors: {} }` once it actually succeeds:

```ts
await resend.emails.send({ from, to, replyTo: email, subject, text: message });
return { status: "ok", errors: {} };
```

**Keyboard and screen-reader behaviour:** an invalid submission renders a `role="alert"` summary, moves focus to it, and each error links to its field via `#field`. Inputs carry `aria-invalid` and `aria-describedby`, and the submit button disables itself while `pending`.

---

## Accessibility

- **Skip to content** link, visible on focus, first in the tab order.
- **Focus is never removed, only restyled** — a 3 px signal-orange `:focus-visible` outline with offset, switching to verification green on dark "void" sections so it always has contrast.
- **Every section is labelled** (`aria-label` / `aria-labelledby`), and the nav is a real `<nav aria-label="Primary">` with a list.
- **Native controls everywhere.** The routing slider is an `<input type="range">` with `aria-valuetext` ("60 percent local, 40 percent cloud"), so keyboard support, announcements, and hit area come for free. Fault injection is a real `<button>`, disabled with a visible reason when 3D is off.
- **Decorative 3D is hidden** — canvases are `aria-hidden="true"` and every scene has a text alternative in the overlay.
- **Reduced motion is honoured fully** (see above), including at the CSS level for settles and reveals.
- **Print styles** — a `.no-print` rule hides the header, and the body inverts to black on white.
- **Mobile menu** locks body scroll while open and closes on `Escape`.
- **In-page anchors land below the fixed header** — `scroll-padding-top` is driven by a `--header-h` token rather than a magic number, so every jump target clears the bar. Navigation is declared once in `site.ts`: `useNavHref` keeps those targets as native anchors on the home page and rewrites them to `/#…` from any other route, so header and footer cannot drift apart.

---

## Performance

- **3D is never in the critical path.** `three` + `@react-three/fiber` + `drei` are dynamically imported with `ssr: false`, and the canvas only mounts when its section nears the viewport.
- **One rAF loop for the whole page**, started on first subscriber and stopped on the last; it pauses on tab hide. Off-screen scenes are switched to `frameloop="never"` — and reported to the scene as `paused`, which freezes continuous drift — rather than burning frames on invisible pixels.
- **Zero allocation per frame.** Preallocated typed arrays, hoisted scratch objects, and instanced meshes (all router packets = one draw call).
- **DPR is capped and adaptive** per tier, with `AdaptiveDpr` from drei; `antialias` follows the starting tier and is off at `low`.
- **Measured geometry.** Section offsets and travel distances are measured on resize and after `document.fonts.ready` — never inside the scroll loop.
- **Reduced scope for the reveal system.** Render props bail out on <0.001 progress deltas, and stages sync to scroll rather than to a timer.

---

## SEO and metadata

- Full `Metadata` in `app/layout.tsx`: title template, canonical URL, Open Graph, Twitter card, keywords, authors, `robots` with `max-image-preview: large`, and a `category`.
- **JSON-LD** `@graph` with a `Person` node (job title, `sameAs` GitHub, `knowsAbout`, country address) and a `WebSite` node referencing it by `@id`. Built only from facts present in the content — no ratings, no invented awards.
- Per-case-study `generateMetadata` with its own canonical and article-type Open Graph tags.
- `robots.ts` and `sitemap.ts` are generated: the sitemap includes the home page at priority `1` and every case study at `0.8`, derived from the `projects` array rather than hand-maintained.
- `viewport` sets `viewportFit: "cover"` and a light/dark `themeColor` pair so mobile browser chrome matches the page.

---

## Security headers

Set globally in `next.config.ts`:

| Header | Value |
|--------|-------|
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `X-Frame-Options` | `SAMEORIGIN` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` |

Also: `poweredByHeader: false` (no `X-Powered-By` fingerprint), `reactStrictMode: true`, and `console` calls stripped from production builds except `error`.

---

## Deployment

The app is a standard Next.js build with no external services and no environment variables, so it deploys anywhere Node runs. On **Vercel**:

1. Import the repository.
2. Framework preset: **Next.js** (auto-detected). Build command `pnpm build` and install command `pnpm install` are detected from the committed lockfile.
3. Deploy. All routes are prerendered at build time.

Then point the `itsmesujan.me` domain at the deployment and confirm the URLs in `src/content/site.ts` (`site.url`, `site.email`, `site.github`) match the live environment — the canonical URLs, Open Graph tags, JSON-LD, `robots.txt`, and `sitemap.xml` are all derived from `site.url`.

---

## Editing guide

| I want to… | Change this |
|-----------|-------------|
| Update a project metric, summary, or stack | `projects[]` in `src/content/site.ts` |
| Add a whole case study | Append to `projects[]` — route, metadata, sitemap, and card all follow |
| Change the six-stage method | `loopSteps[]` in `src/content/site.ts` (2D list *and* 3D ring both read it) |
| Reword the hero or about copy | `site`, `about`, `now` in `src/content/site.ts` |
| Recolour anything | `@theme` tokens in `src/app/globals.css` |
| Retune 3D density | `TIER_BUDGET` in `src/lib/capability.ts`, or a section's `budget` prop |
| Change how a scene behaves | The scene component in `src/components/three/` |
| Reorder the page | `src/app/page.tsx` (the comment there explains the argument order) |
| Wire up contact delivery | The `submit` server action in `src/sections/Contact.tsx` |

---

## Known limitations

Listed honestly, because the site's whole premise is that nothing is claimed that isn't true:

- **Contact delivery is not wired to a mail provider.** Validation and spam handling are real; delivery is not. A valid message returns `unconfigured` and the UI says so. See [Contact form](#contact-form).
- **No test suite is committed.** The methodology describes Playwright audits (overflow, tap targets, console errors, menu interaction at 320–1920 px) run against production builds; those live outside this repository.
- **Bloom is not implemented, and is no longer budgeted.** `TIER_BUDGET` carries only values something actually renders; a post-processing pass would add its budget back alongside the pass itself.
- **No ESLint config is committed**, so `pnpm lint` needs one before it will run cleanly.
- **The `void` scanline treatment and `grid-void` grid are defined** but used sparingly — the shipped page is predominantly on paper.

---

## License

No license file is included: this is a personal portfolio, and all rights are reserved by default. If you want to reuse part of it, [get in touch](mailto:hello@itsmesujan.me).

---

Built by **Majhi Sujan** — specification, orchestration, review, and iteration, with AI agents doing the typing.

[itsmesujan.me](https://www.itsmesujan.me) · [@itsmesujan](https://github.com/itsmesujan/) · [hello@itsmesujan.me](mailto:hello@itsmesujan.me)
