import type { Project } from "../../types";

export const omnitaps: Project = {
  slug: "omnitaps",
  name: "Omnitaps",
  icon: "globe",
  lang: "React 19 / Serverless",
  summary:
    "Live multi-tenant enterprise SaaS for hospitality: guest websites, QR menus, captive Wi-Fi with Stripe checkout, and an operator console — one catch-all serverless function under Vercel's Hobby cap, multi-arch Docker image on GHCR.",
  tags: [
    "React 19",
    "Supabase",
    "Prisma",
    "Stripe",
    "Serverless",
    "Docker",
  ],
  filters: ["software"],
  featured: true,
  metrics: [
    { value: "1", label: "catch-all serverless function" },
    { value: "2", label: "architectures on the Docker image" },
  ],
  repo: "https://github.com/amouriii/Omnitaps",
  bullets: [
    "Shipped a live multi-tenant platform (omnitaps.vercel.app) spanning guest-facing café sites, QR menus, reviews, chatbot, and a full operator console with Supabase Auth-scoped admin routes.",
    "Condensed all production APIs into a single catch-all Serverless Function (`api/[...path].js`) with an internal route table, staying under Vercel Hobby's 12-function cap while supporting Stripe webhooks (bodyParser off, 30s maxDuration).",
    "Implemented captive Wi-Fi onboarding with OTP delivery over email (Resend) and SMS (Twilio), Stripe checkout + webhooks, and graceful demo fallbacks when Prisma or the seed tenant is unavailable.",
    "Published a multi-arch (amd64 + arm64) Docker image to GHCR with build-time `VITE_*` arg handling, plus one-command setup (`npm run setup`) and deploy (`npm run launch`) scripts.",
  ],
};
