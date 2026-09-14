import type { NextConfig } from "next";

const CSP_SELF = "'self'";

const headers = [
  {
    source: "/(.*)",
    headers: [
      {
        key: "X-Content-Type-Options",
        value: "nosniff",
      },
      {
        key: "Referrer-Policy",
        value: "strict-origin-when-cross-origin",
      },
      {
        key: "Permissions-Policy",
        value:
          "camera=(), microphone=(), geolocation=(), interest-cohort=(), usb=(), magnetometer=(), gyroscope=(), accelerator=(), bluetooth=(), payment=(), sync-xhr=",
      },
      {
        key: "Cross-Origin-Opener-Policy",
        value: "same-origin",
      },
      {
        key: "Cross-Origin-Resource-Policy",
        value: "same-origin",
      },
      {
        key: "X-Frame-Options",
        value: "DENY",
      },
      {
        key: "X-DNS-Prefetch-Control",
        value: "on",
      },
      {
        key: "X-Permitted-Cross-Domain-Policies",
        value: "none",
      },
      {
        key: "X-XSS-Protection",
        value: "0",
      },
      {
        key: "Strict-Transport-Security",
        value: "max-age=31536000; includeSubDomains; preload",
      },
      {
        key:
          "Content-Security-Policy-Report-Only",
        value:
          [
            `default-src ${CSP_SELF}`,
            `script-src ${CSP_SELF} 'unsafe-inline' 'unsafe-eval'`,
            `style-src ${CSP_SELF} 'unsafe-inline'`,
            `img-src ${CSP_SELF} data: https:`,
            `connect-src ${CSP_SELF} https://api.resend.com https://*.vercel-analytics.com https://*.vercel.com https://*.resend.com`,
            `font-src ${CSP_SELF} data:`,
            `object-src 'none'`,
            `base-uri ${CSP_SELF}`,
            `form-action ${CSP_SELF}`,
            `frame-ancestors 'none'`,
            `upgrade-insecure-requests`,
          ].join("; ") +
          "; report-uri /api/csp-report",
      },
    ],
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return headers;
  },
};

export default nextConfig;
