/**
 * About page narrative — PLAN.md item 8.
 *
 * Lives apart from content/profile.ts on purpose: profile strings
 * (tagline, summary[0], beyond) are resume/JSON-LD/OG-faithful and shared
 * across surfaces; this module is the /about storytelling layer.
 *
 * Ground rules:
 * - Every technical claim traces to public/omar-nouh-resume.pdf (verified
 *   2026-09 during the item 10 content pass). No invented numbers.
 * - The arc must be retellable by a stranger after 60 seconds:
 *   intersection thesis → five-layer proof ladder → field proof →
 *   what he's looking for → beyond-code as evidence of rigor.
 * - Beyond-code entries are framed as work evidence, never a hobby list.
 * - Availability wording stays locked to profile.availability
 *   ("Open to work — on-site or remote") — don't restate a different window here.
 */

export type LadderLayer = {
  layer: string;
  project: string;
  proof: string;
};

export type BeyondCodeItem = {
  activity: string;
  evidence: string;
};

export const arc = [
  "I keep ending up on both sides of the abstraction line. One semester I'm wiring a 32-bit MIPS datapath in VHDL and paging kernels in C; the next I'm fine-tuning transformers or shipping a .NET application. That used to look like scattered curiosity. It isn't — it's the through-line: I understand AI systems better because I know what they run on, and I understand hardware better because I know what gets built on top of it.",
  "The internships tested whether that layer map survives contact with production. At Dell Technologies I mapped how hardware constraints shape enterprise cloud platforms; at e& I studied system-level vulnerabilities across telecom-scale networks; at Future Career I automated real business workflows — cutting manual data entry 50% and lifting client engagement 25% within two months.",
  "I'm a third-year Computer & AI Engineering student at Ain Shams University (dual degree with the University of East London), expected 2028. The goal is to graduate having worked seriously at every layer — then go deep on the one where I can contribute the most.",
];

export const ladderIntro =
  "Each layer of the stack, with the project that proves I've actually been there:";

export const ladder: LadderLayer[] = [
  {
    layer: "Intelligence",
    project: "ML scene classification — Python, PyTorch, scikit-learn",
    proof: "End-to-end pipeline: preprocessing, feature engineering, fine-tuned CNN/transformer architectures — 60.3% validation accuracy.",
  },
  {
    layer: "Enterprise",
    project: "Cinema booking system — C#, .NET, SQL Server",
    proof: "3NF schema with role-based access, a stored-procedure data access layer, and the full transaction lifecycle in a layered desktop app.",
  },
  {
    layer: "Translation",
    project: "Tiny-language compiler — C",
    proof: "Hand-coded lexer built on DFAs, a formal CFG, and a recursive-descent parser generating visual parse trees.",
  },
  {
    layer: "Kernel",
    project: "FOS operating-system kernel — C",
    proof: "MLFQ scheduler with priority aging, a dynamic heap allocator, and Nth-chance clock page replacement wired to page-fault handling.",
  },
  {
    layer: "Silicon",
    project: "32-bit single-cycle MIPS processor — VHDL",
    proof: "Custom ALU, hardwired R/I/J control unit, and simulation testbenches for branching, timing, and hazard debugging.",
  },
];

export const lookingFor = {
  lead: "What I'm looking for",
  body: "Engineering internships where systems thinking is an asset — infrastructure, platform, ML engineering, or anything close to the hardware–software boundary.",
  points: [
    "Teams that review code and designs honestly; I'd rather be corrected early than vague late.",
    "Real constraints — latency, memory, cost — not just feature checklists.",
    "Based in Cairo; on-site or remote, as the badge says.",
  ],
};

export const beyondCodeIntro =
  "The non-code record is evidence about how I work — not a hobby list:";

export const beyondCode: BeyondCodeItem[] = [
  {
    activity: "Competitive programming",
    evidence:
      "Algorithmic problem-solving measured against a public leaderboard, under a contest clock — not self-graded.",
  },
  {
    activity: "Model United Nations",
    evidence:
      "Researching a position, defending it under scrutiny, and amending it in real time when the room pushes back.",
  },
  {
    activity: "Triathlon",
    evidence:
      "Months of unglamorous training that compound toward one start line — the same discipline that carries long projects to shipping.",
  },
];
