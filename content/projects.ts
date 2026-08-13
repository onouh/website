import type { Project, ProjectFilterId } from "./types";

export const projectFilters: { id: ProjectFilterId; label: string }[] = [
  { id: "os", label: "OS" },
  { id: "compilers", label: "Compilers" },
  { id: "fpga", label: "FPGA" },
  { id: "ml", label: "ML" },
  { id: "software", label: "Software" },
];

export const projects: Project[] = [
  {
    slug: "inventory-tracker",
    name: "Operations & Inventory Tracker",
    icon: "📦",
    lang: "Excel / JavaScript",
    summary:
      "Multi-sheet relational tracking system in Excel for a clothing factory — raw materials, production stages, and order fulfillment — with validation, lookups, and live dashboards.",
    tags: ["Excel", "JavaScript", "Dashboards", "Data Integrity"],
    filters: ["software"],
    featured: true,
    bullets: [
      "Designed and built a multi-sheet relational tracking system in Excel to monitor raw materials, production stages, and order fulfillment for a clothing factory.",
      "Programmed dynamic data validation, advanced lookups (INDEX/MATCH), and conditional formatting to eliminate manual entry errors and ensure data integrity.",
      "Structured automated Pivot Tables and summary dashboards to give management clear, real-time visibility into operational bottlenecks and inventory levels.",
    ],
  },
  {
    slug: "fos-kernel",
    name: "Operating System Kernel (FOS)",
    icon: "⚙️",
    lang: "C / Virtual Memory",
    summary:
      "Custom MLFQ CPU scheduler with priority boosting and aging, a dynamic kernel heap allocator, hierarchical page tables, Nth-Chance Clock replacement, file I/O, and robust page-fault handlers.",
    tags: ["OS", "MLFQ", "Memory Mgmt", "Page Tables"],
    filters: ["os"],
    featured: true,
    bullets: [
      "Engineered a custom Multi-Level Feedback Queue (MLFQ) CPU scheduler in C, implementing dynamic priority boosting and aging to optimize execution and eliminate process starvation across queues.",
      "Architected a dynamic kernel heap allocator, managing direct virtual-to-physical address translation, frame allocation, and hierarchical page-directory and page-table structures.",
      "Developed the core memory management subsystem by implementing an Nth-Chance Clock page replacement algorithm, tightly integrated with working-set tracking, page-file I/O, and robust page-fault handlers.",
    ],
  },
  {
    slug: "tiny-compiler",
    name: "Custom Tiny Language Compiler",
    icon: "🔤",
    lang: "C / C++",
    summary:
      "Compiler frontend from scratch: hand-coded lexer on regular expressions and DFAs, a formal CFG, and a recursive-descent parser that builds syntax trees with error recovery.",
    tags: ["Compilers", "Automata", "CFG", "Parsing"],
    filters: ["compilers"],
    featured: true,
    bullets: [
      "Built a complete compiler frontend from scratch in C/C++, engineering a hand-coded lexical analyzer based on custom Regular Expressions and Deterministic Finite Automata (DFAs) to ensure robust tokenization and error recovery.",
      "Designed a formal Context-Free Grammar (CFG) to parse and validate complex programmatic constructs, including functions, control-flow loops, conditionals, and multivariable arithmetic expressions.",
      "Implemented a recursive-descent parser to execute strict syntax analysis, dynamically generating visual parse trees to verify code structure.",
    ],
  },
  {
    slug: "cinema-booking",
    name: "Enterprise Cinema Booking System",
    icon: "🎬",
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
    icon: "🔬",
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
    name: "Machine Learning Scene Classification",
    icon: "🖼️",
    lang: "Python / PyTorch",
    summary:
      "End-to-end scene classification pipeline with preprocessing, feature engineering, and fine-tuning of convolutional and transformer models — 60.3% validation accuracy.",
    tags: ["Deep Learning", "ConvNeXt", "Transformers", "Fine-tuning"],
    filters: ["ml"],
    bullets: [
      "Built an end-to-end machine learning pipeline for image scene classification, engineering robust data preprocessing workflows to handle image distortions and categorical encoding, and optimizing classification models with advanced feature engineering.",
      "Executed comprehensive fine-tuning on complex deep learning architectures (including convolutions and transformers) and model evaluation techniques on custom structured datasets, successfully achieving 60.3% validation accuracy.",
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
