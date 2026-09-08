import type { Project } from "../../types";

export const veripay: Project = {
  slug: "veripay",
  name: "VeriPay",
  icon: "shield",
  lang: "Python / FastAPI",
  summary:
    "Real-time payment fraud-detection platform: 26 FastAPI/gRPC services over Kafka and PyFlink, five-domain PostgreSQL estate, XGBoost + Isolation Forest scoring, and a governed LLM boundary for analyst explanations.",
  tags: [
    "Microservices",
    "Kafka",
    "PyFlink",
    "XGBoost",
    "PostgreSQL",
    "React",
  ],
  filters: ["ml", "software"],
  featured: true,
  metrics: [
    { value: "26", label: "FastAPI/gRPC services" },
    { value: "5", label: "PostgreSQL domains" },
    { value: "1", label: "command boots the full stack" },
  ],
  repo: "https://github.com/amouriii/VeriPay",
  bullets: [
    "Architected 26 FastAPI/gRPC microservices — one per diagrammed component — with protobuf contracts as the shared boundary between Python and TypeScript consumers.",
    "Streamed transaction features through Apache Kafka and PyFlink aggregation jobs into a Redis feature store, serving XGBoost and Isolation Forest scoring with SHAP-style attribution.",
    "Partitioned the data plane into five logical PostgreSQL databases (customer, bank, fraud-ops, merchant, mobile), joining across domains by stable IDs and API contracts instead of cross-database foreign keys.",
    "Built the fraud-operations lifecycle end to end: alert queue, evidence-backed investigation workspace with timeline and feature tabs, analyst feedback loop, and a governed local-LLM explanation boundary feeding model retraining.",
  ],
};
