import type { Project } from "../../types";

export const fibonacciHeap: Project = {
  slug: "fibonacci-heap",
  name: "Fibonacci Heap + Interactive GUIs",
  icon: "graph",
  lang: "C++17 / Qt 6",
  summary:
    "Templated Fibonacci heap with the full amortized-operation surface, plus two Qt 6 applications: an animated heap visualizer and an emergency-care priority queue built on it.",
  tags: [
    "Data Structures",
    "Amortized Analysis",
    "Qt 6",
    "C++17",
  ],
  filters: ["systems"],
  repo: "https://github.com/onouh/FibonacciHeap",
  bullets: [
    "Implemented a fully templated C++17 Fibonacci heap with O(1) amortized insert, get-min, decrease-key, and merge, O(log n) amortized extract-min and delete, and cascading-cut maintenance with leak-free memory management.",
    "Built an interactive Qt 6 visualizer with click-to-select nodes, animated extract-min consolidations and decrease-key cuts, adjustable playback speed, and color-coded pointer relationships (min, marked, root, selected).",
    "Applied the heap to a real domain in TaskManagerGUI, an emergency-care patient queue where triage priority drives extract-min ordering.",
    "Packaged with CMake (Qt 6 Widgets, C++17) and a feature-validation script that checks GUI controls, animation integration, and interactive capabilities.",
  ],
};
