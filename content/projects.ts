import type { Project, ProjectFilterId } from "./types";
import { veripay } from "./projects/entries/veripay";
import { oracle } from "./projects/entries/oracle";
import { omnitaps } from "./projects/entries/omnitaps";
import { fibonacciHeap } from "./projects/entries/fibonacci-heap";
import { vehicleRentalSystem } from "./projects/entries/vehicle-rental-system";

export const projectFilters: { id: ProjectFilterId; label: string }[] = [
  { id: "os", label: "OS" },
  { id: "compilers", label: "Compilers" },
  { id: "fpga", label: "FPGA" },
  { id: "systems", label: "Systems" },
  { id: "ml", label: "ML" },
  { id: "software", label: "Software" },
];

export const projects: Project[] = [
  veripay,
  oracle,
  omnitaps,
  fibonacciHeap,
  vehicleRentalSystem,
  {
    slug: "inventory-tracker",
    name: "Operations & Inventory Tracker",
    icon: "box",
    lang: "Excel / JavaScript",
    summary:
      "Multi-sheet relational tracking system in Excel for a clothing factory — raw materials, production stages, and order fulfillment — with validation, lookups, and live dashboards.",
    tags: ["Excel", "JavaScript", "Dashboards", "Data Integrity"],
    filters: ["software"],
    bullets: [
      "Designed and built a multi-sheet relational tracking system in Excel to monitor raw materials, production stages, and order fulfillment for a clothing factory.",
      "Programmed dynamic data validation, advanced lookups (INDEX/MATCH), and conditional formatting to eliminate manual entry errors and ensure data integrity.",
      "Structured automated Pivot Tables and summary dashboards to give management clear, real-time visibility into operational bottlenecks and inventory levels.",
    ],
  },
  {
    slug: "fos-kernel",
    name: "Operating System Kernel (FOS)",
    icon: "cog",
    lang: "C / Virtual Memory",
    summary:
      "Custom MLFQ CPU scheduler with priority boosting and aging, a dynamic kernel heap allocator, hierarchical page tables, Nth-Chance Clock replacement, file I/O, and robust page-fault handlers.",
    tags: ["OS", "MLFQ", "Memory Mgmt", "Page Tables"],
    filters: ["os"],
    bullets: [
      "Engineered a custom Multi-Level Feedback Queue (MLFQ) CPU scheduler in C, implementing dynamic priority boosting and aging to optimize execution and eliminate process starvation across queues.",
      "Architected a dynamic kernel heap allocator, managing direct virtual-to-physical address translation, frame allocation, and hierarchical page-directory and page-table structures.",
      "Developed the core memory management subsystem by implementing an Nth-Chance Clock page replacement algorithm, tightly integrated with working-set tracking, page-file I/O, and robust page-fault handlers.",
    ],
  },
  {
    slug: "tiny-compiler",
    name: "Custom Tiny Language Compiler",
    icon: "code",
    lang: "C / C++",
    summary:
      "Compiler frontend from scratch: hand-coded lexer on regular expressions and DFAs, a formal CFG, and a recursive-descent parser that builds syntax trees with error recovery.",
    tags: ["Compilers", "Automata", "CFG", "Parsing"],
    filters: ["compilers"],
    bullets: [
      "Built a complete compiler frontend from scratch in C/C++, engineering a hand-coded lexical analyzer based on custom Regular Expressions and Deterministic Finite Automata (DFAs) to ensure robust tokenization and error recovery.",
      "Designed a formal Context-Free Grammar (CFG) to parse and validate complex programmatic constructs, including functions, control-flow loops, conditionals, and multivariable arithmetic expressions.",
      "Implemented a recursive-descent parser to execute strict syntax analysis, dynamically generating visual parse trees to verify code structure.",
    ],
  },
  {
    slug: "cinema-booking",
    name: "Enterprise Cinema Booking System",
    icon: "film",
    lang: "C# / SQL Server",
    summary:
      "3NF schema of 12 tables with RBAC and stored-procedure data access, plus a layered WinForms app for authentication, payments, and concurrent order state.",
    tags: ["3NF", "SQL Server", "WinForms", "RBAC"],
    filters: ["software"],
    bullets: [
      "Architected a highly normalized (3NF) relational database schema in SQL Server encompassing 12 tables, enforcing strict primary/foreign key constraints and role-based access control.",
      "Engineered a zero ad-hoc SQL data access layer utilizing modular stored procedures and scalar functions to securely bridge the database and the application layer.",
      "Developed an end-to-end layered desktop application in C# .NET to manage the complete transaction lifecycle, handling user authentication, secure payment flows, and concurrent order state management.",
    ],
  },
  {
    slug: "32-bit-processor",
    name: "32-Bit Single-Cycle MIPS Processor",
    icon: "cpu",
    lang: "VHDL / Vivado",
    summary:
      "Modular 32-bit CPU datapath in VHDL with ALU, register file, instruction/data memory, a hardwired control unit for R/I/J formats, and testbenches for branch logic and hazards.",
    tags: ["RTL", "FPGA", "MIPS", "Datapath"],
    filters: ["fpga"],
    bullets: [
      "Designed and simulated a modular 32-bit CPU datapath utilizing VHDL and Xilinx toolchains, integrating a custom ALU, dynamic register file, and distinct instruction/data memory blocks.",
      "Implemented a hardwired control unit capable of decoding R, I, and J instruction formats, driving opcode-dependent execution signals and data flow across the processor.",
      "Engineered comprehensive simulation testbenches to validate opcode branching logic, analyze low-level datapath timing constraints, and debug ALU flags and structural register hazards.",
    ],
  },
  {
    slug: "scene-classifier",
    name: "Scene Classification Pipeline",
    icon: "image",
    lang: "Python / PyTorch Lightning",
    summary:
      "17-way scene-style classification: swappable backbone registry (ResNet, EfficientNet, ConvNeXt, Swin), two-phase unfreezing with Gram-matrix style loss, and a weighted TTA ensemble — 60.3% val accuracy.",
    tags: ["Deep Learning", "ConvNeXt", "Swin", "TTA Ensemble", "Lightning"],
    filters: ["ml"],
    repo: "https://github.com/onouh/AI-ImageProcessing",
    bullets: [
      "Engineered a PyTorch Lightning pipeline with a swappable backbone registry spanning ResNet-50, EfficientNet-B4, five ConvNeXt sizes, and Swin Tiny/Small, with a feature-aware pooling head for both CNN and token-sequence layouts.",
      "Implemented two-phase training — frozen-backbone head training followed by callback-driven unfreezing — with a 100× backbone/head LR differential, warmup + cosine scheduling, 16-mixed precision, and shape-filtered checkpoint loading.",
      "Designed StyleAwareLoss, combining label-smoothed cross-entropy with an optional Gram-matrix texture loss computed over CNN and token-sequence feature layouts to encourage texture-consistent representations.",
      "Built a weighted TTA ensemble that loads the best per-architecture checkpoints, applies 7-view test-time augmentation per model, and blends weight-normalized probabilities into the final submission.",
    ],
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug);
}

export function featuredProjects(): Project[] {
  return projects.filter((project) => project.featured);
}

export function filterProjects(filter: ProjectFilterId | "all"): Project[] {
  if (filter === "all") return projects;
  return projects.filter((project) => project.filters.includes(filter));
}
