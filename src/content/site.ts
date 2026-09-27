/**
 * Single source of truth for all site content.
 *
 * PROVENANCE: every string here is transcribed from the live site
 * (itsmesujan.me) and its three case studies as of the current build.
 * Nothing is invented. If a number changes, change it here only.
 */

export const site = {
  name: "Majhi Sujan",
  handle: "itsmesujan",
  role: "AI-Native Builder",
  domain: "itsmesujan.me",
  url: "https://www.itsmesujan.me",
  tagline: "I build software with AI agents.",
  subTagline: "Human-directed. AI-powered. Built to ship.",
  description:
    "I turn ideas into working products by designing the specification, directing AI agents, reviewing their output, and iterating until it ships.",
  location: "Japan",
  github: "https://github.com/itsmesujan/",
  avatar: "https://avatars.githubusercontent.com/u/184980156?v=4",
  email: "hello@itsmesujan.me",
} as const;

/** The 6-step loop. This is the site's central motif — it recurs in 2D and 3D. */
export const loopSteps = [
  {
    id: "idea",
    index: "01",
    label: "Idea",
    line: "Turn an idea into a precise specification — scope, constraints, acceptance criteria. Ambiguity is the enemy.",
  },
  {
    id: "spec",
    index: "02",
    label: "Decompose",
    line: "Break the problem into tasks agents can execute independently without stepping on each other.",
  },
  {
    id: "agents",
    index: "03",
    label: "Direct",
    line: "Give agents context, constraints, tools, and objectives. Steering beats typing.",
  },
  {
    id: "review",
    index: "04",
    label: "Review",
    line: "Inspect architecture, implementation, tests, and behavior. Nothing ships unread.",
  },
  {
    id: "iterate",
    index: "05",
    label: "Iterate",
    line: "Feed failures back into the spec and the plan. Each loop makes the system sharper.",
  },
  {
    id: "ship",
    index: "06",
    label: "Ship",
    line: "Deploy, verify in production, keep improving. Shipped is the only state that counts.",
  },
] as const;

export type Project = {
  slug: string;
  title: string;
  kind: string;
  year: string;
  stack: string;
  summary: string;
  problem: string;
  idea: string;
  challenges: string[];
  iteration: string;
  result: string;
  tech: string[];
  /** Section 2D accent used for the card and its scene tint. */
  accent: "signal" | "verify" | "paper";
};

export const projects: Project[] = [
  {
    slug: "devpilot",
    title: "DevPilot",
    kind: "Mobile app",
    year: "2026",
    stack: "Flutter · Dart",
    summary:
      "An AI-assistant app for Android that unifies 10+ cloud providers with fully local GGUF models — one agent-directed build, shipped as a 65 MB APK.",
    problem:
      "Every AI assistant locks you into one vendor, one subscription, and a cloud round-trip for every message. On a phone, that means cost, latency, and zero privacy — pick two.",
    idea:
      "One native Android app that unifies cloud AI (10+ providers) with fully local GGUF models — the power of frontier models online, the privacy of on-device inference offline.",
    challenges: [
      "Streaming chat across 10+ providers with different APIs, formats, and failure modes.",
      "Running 60+ GGUF models on-device via llama.cpp + Vulkan without melting mid-range phones.",
      "Keeping API keys, memory, and voice data inside the device trust boundary (Android Keystore).",
    ],
    iteration:
      "The agent loop caught what manual review would have missed: provider adapters stress-tested against live APIs, UI rebuilt three times until the typographic chat layout stopped fighting the model output, and the local-model pipeline profiled on real devices until load times felt native.",
    result:
      "Shipped as a 64.8 MB release APK — 10+ cloud providers, 60+ local models, a ReAct agent with 11 tools, research engine, voice pipeline, memory, and a DAG workflow builder. One human, one agent-directed build, first complete ship.",
    tech: ["Flutter", "Dart", "llama.cpp", "Vulkan", "Android Keystore", "OpenAI/Anthropic/Gemini APIs"],
    accent: "verify",
  },
  {
    slug: "agent-x",
    title: "Agent-X",
    kind: "Agent operating system",
    year: "2026",
    stack: "Python · GCP",
    summary:
      "An autonomous mission OS: deterministic kernel, self-healing DAG scheduler, 4-level evidence verification — built for high-reliability agent execution.",
    problem:
      "Prompt-chained agents are stochastic: they drift from the goal, fail unpredictably, and hallucinate completion. Fine for demos — not for engineering work you have to trust.",
    idea:
      "An autonomous mission operating system: a deterministic kernel, an epistemic world model, and a self-healing DAG scheduler — agents as governed execution, not vibes.",
    challenges: [
      "Classifying agent failures into 9 categories and mapping them to 9 recovery strategies without human intervention.",
      "Routing tasks by complexity between fast (Flash) and frontier (Pro) models under a hard dollar budget.",
      "Proving completion — no hallucinated deliverables — via cryptographic hashing and independent verifier agents.",
    ],
    iteration:
      "The benchmark suite drives the loop: 20 standardized scenarios, injected faults, and drift conditions. Each weakness found (recovery gaps, routing cost spikes) fed back into the kernel design until the numbers held.",
    result:
      "94.5% mission success rate vs 42% single-loop baseline · 91.2% self-healing recovery · 87.5% cost reduction per mission · 162/162 test suite passing · 100% verified-proof rate. Deployed on Cloud Run + Firestore + Pub/Sub, 100% Terraform.",
    tech: ["Python", "Google Cloud Run", "Firestore", "Pub/Sub", "Terraform", "Gemini 2.5 Pro/Flash", "ADK"],
    accent: "signal",
  },
  {
    slug: "this-site",
    title: "this site",
    kind: "Web product",
    year: "2026",
    stack: "Next.js · TypeScript",
    summary:
      "A three-app web product — portfolio, digital store, publication — spec'd, built, and deployed from agent-directed conversations. You're reading the proof.",
    problem:
      "Prove the AI-native methodology on myself: can one person direct a fleet of agents to design, build, and operate a real multi-app web product — not a template, not a demo?",
    idea:
      "A three-app product: this portfolio, a digital store of agent-built products, and a publication — one monorepo, one design system, deployed continuously from conversations.",
    challenges: [
      "Keeping a shared neo-brutalist design system in sync across three independent Next.js apps.",
      "Mobile: the desktop nav defined the page's minimum width — 102px of sideways scroll at 375px until restructured.",
      "Quality discipline: every change built, audited headlessly at 320–1920px, and verified on the live deploy before it counts.",
    ],
    iteration:
      "The site is its own test bench. Automated Playwright audits (overflow, tap targets, console errors, menu interaction) run against production builds before anything ships; failures loop back into the spec.",
    result:
      "Live at itsmesujan.me — designed, built, QA'd, and deployed agent-first. The portfolio you're reading is the argument.",
    tech: ["Next.js 16", "TypeScript", "Tailwind v4", "Playwright", "Vercel"],
    accent: "paper",
  },
];

export const timeline = [
  {
    year: "2024",
    text: "Discovered agentic AI. First experiments turning plain-English ideas into working software.",
  },
  {
    year: "2025",
    text: "Learned the workflow for real: spec → agents → review → iterate → ship.",
  },
  {
    year: "2026",
    text: "Shipped DevPilot. Started building the agents themselves (Agent-X).",
  },
  {
    year: "Now",
    text: "Directing AI agent workflows end to end — ideation to production.",
  },
] as const;

export const capabilities = [
  {
    group: "AI Engineering",
    items: [
      "Agent orchestration",
      "Context engineering",
      "Prompt engineering",
      "Agent workflows",
      "AI output evaluation",
      "Tool integration",
      "MCP",
    ],
  },
  {
    group: "Product Engineering",
    items: [
      "Full-stack development",
      "Rapid prototyping",
      "Architecture",
      "API design",
      "Deployment",
      "Debugging",
    ],
  },
  {
    group: "Stack",
    items: [
      "TypeScript",
      "Python",
      "React",
      "Next.js",
      "Flutter",
      "Dart",
      "Supabase",
      "Vercel",
      "Google Cloud",
    ],
  },
] as const;

export const now = {
  building: {
    label: "Currently building",
    text: "Agent-X — autonomous coding workflows that plan, execute, and verify.",
  },
  learning: {
    label: "Learning",
    text: "Agent evaluation · MCP · multi-agent systems.",
  },
  exploring: {
    label: "Exploring",
    text: "What one person + a fleet of AI agents can actually ship.",
  },
} as const;

export const about = {
  heading: "it's me, sujan",
  body: "I'm not a traditional developer. I design what gets built, then direct teams of AI agents to build it — reviewing every decision, every architecture, every line that ships. The skill isn't typing code fast; it's knowing exactly what to build and steering the machines that build it.",
  second:
    "The loop — specification, orchestration, review, iteration — started as curiosity in 2024 and hardened into a methodology. Everything in my work was built this way, end to end. Based in Japan, building globally, fluent in Japanese and English.",
} as const;

export const contact = {
  heading: "Have something worth building?",
  body: "I'm interested in ambitious products, AI-native workflows, and interesting technical problems.",
} as const;

/** The 4 evidence levels, used as the DAG verification legend. */
export const verificationLevels = [
  "Structural",
  "Functional",
  "Behavioural",
  "Cryptographic",
] as const;
