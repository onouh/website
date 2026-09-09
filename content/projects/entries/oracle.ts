import type { Project } from "../../types";

export const oracle: Project = {
  slug: "oracle",
  name: "Oracle",
  icon: "layers",
  lang: "C++20 / Metal",
  summary:
    "Distributed LLM inference engine that pipelines a 70B model across ordinary Macs over Thunderbolt-3 IP: packed 76-byte tensor transport, RAM/VRAM layer sharding, and an OpenAI-compatible API on the master node.",
  tags: [
    "Distributed Systems",
    "C++20",
    "Inference",
    "Thunderbolt-3",
    "Metal",
  ],
  filters: ["systems"],
  featured: true,
  metrics: [
    { value: "70B", label: "parameters sharded across the cluster" },
    { value: "3", label: "Macs in the Thunderbolt-3 pipeline" },
    { value: "76", label: "byte packed wire header on the hot path" },
  ],
  repo: "https://github.com/amouriii/Oracle",
  bullets: [
    "Built a C++20 inference engine that shards a 70B-Q4 transformer by layer across a Thunderbolt-3 IP mesh of Macs, keeping KV caches local to each worker and streaming F16 activations between stages.",
    "Designed a 76-byte packed binary TensorHeader wire protocol (magic ORCL, writev/readv header+body) with zero protobuf or JSON on the hot path, plus a POSIX shared-memory SPSC ring for the local hop.",
    "Exposed an OpenAI-compatible HTTP API (POST /v1/chat/completions with SSE) on the master node so iPhone and curl clients talk to the cluster like any hosted model.",
    "Gated the build with four performance phases — network bench (>8 Gbps TCP), allocation, tensor-pass checksum, end-to-end inference — each with its own script and pass criteria.",
  ],
};
