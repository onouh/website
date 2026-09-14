import { NextResponse } from "next/server";

interface CspReportBody {
  "csp-report"?: {
    documentUri?: string;
    violatedDirective?: string;
    blockedUri?: string;
    originalPolicy?: string;
    sourceFile?: string;
    lineNumber?: number;
    columnNumber?: number;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

const NOISY_DIRECTIVES = new Set([
  // Known noisy patterns that rarely warrant alerting during report-only.
  "script-src-elem",
]);

export async function POST(request: Request) {
  let body: CspReportBody;
  try {
    body = (await request.json()) as CspReportBody;
  } catch {
    const text = await request.text();
    if (!text.trim()) {
      return new NextResponse("empty report", { status: 204 });
    }
    body = { "csp-report": {} } as CspReportBody;
    try {
      const parsed = JSON.parse(text);
      Object.assign(body, parsed);
    } catch {
      // Malformed payload; still acknowledge so the browser stops retrying.
      return new NextResponse(JSON.stringify({ status: "ignored" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  const csp = body["csp-report"];
  if (!csp || typeof csp !== "object") {
    return new NextResponse("no csp-report", { status: 204 });
  }

  const violated = csp.violatedDirective as string | undefined;
  if (violated && NOISY_DIRECTIVES.has(violated)) {
    console.debug(
      "[csp-report noisy]",
      csp.documentUri,
      violated,
      csp.blockedUri
    );
    return new NextResponse(JSON.stringify({ status: "acknowledged" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  console.warn(
    "[csp-report]",
    new URL(request.url).pathname,
    JSON.stringify({
      uri: csp.documentUri,
      violated: csp.violatedDirective,
      blocked: csp.blockedUri,
      source: csp.sourceFile,
      line: csp.lineNumber,
      original: csp.originalPolicy,
    })
  );

  return new NextResponse(JSON.stringify({ status: "logged" }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
