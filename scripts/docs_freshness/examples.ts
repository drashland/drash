/**
 * The example apps under `examples/` that the weekly docs freshness workflow
 * boots on the latest release of their runtime, and the requests it sends each
 * one.
 *
 * Every check here is one the example's docs page shows a reader running, and
 * none of them reach a third-party API, so no API key is needed. The calling-*
 * examples get a placeholder key only so their SDK clients can be constructed
 * at startup.
 *
 * `examples/platforms/vercel` is left out: `vercel dev` needs a logged-in
 * Vercel account.
 */

export type Runtime = "bun" | "cloudflare" | "deno" | "node";

export type Check = {
  method: string;
  path: string;
  body?: string;
  headers?: Record<string, string>;
  status: number;
  /** Text the response body must contain. */
  bodyIncludes?: string;
};

export type Example = {
  /** Repo-relative directory. */
  dir: string;
  runtime: Runtime;
  /** Run once before `start`, e.g. a production build. */
  prepare?: string[];
  start: string[];
  port: number;
  /** Seconds to wait for the port to answer. */
  bootTimeout?: number;
  /** Files to write before starting, removed afterwards if they were absent. */
  files?: Record<string, string>;
  checks: Check[];
};

const PLACEHOLDER_KEYS = {
  ANTHROPIC_API_KEY: "docs-freshness-placeholder",
  OPENAI_API_KEY: "docs-freshness-placeholder",
  PERPLEXITY_API_KEY: "docs-freshness-placeholder",
};

/** Placeholder keys, for SDK clients that refuse to construct without one. */
export const placeholderEnv: Record<string, string> = PLACEHOLDER_KEYS;

const dotenv = Object.entries(PLACEHOLDER_KEYS)
  .map(([key, value]) => `${key}=${value}`)
  .join("\n") + "\n";

const basicChecks: Check[] = [
  { method: "GET", path: "/", status: 200 },
];

// The keyless rows of the Verification table on every calling-* page.
const chatChecks: Check[] = [
  { method: "POST", path: "/chat", body: "not json", status: 400 },
  { method: "POST", path: "/chat", body: "{}", status: 400 },
  { method: "GET", path: "/chat", status: 501 },
  { method: "POST", path: "/nope", status: 404 },
];

// The "Confirm It Answers" request on every mcp-server page.
const mcpChecks: Check[] = [
  {
    method: "POST",
    path: "/mcp",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json, text/event-stream",
      "MCP-Protocol-Version": "2026-07-28",
      "Mcp-Method": "tools/list",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "tools/list",
      params: {
        _meta: {
          "io.modelcontextprotocol/protocolVersion": "2026-07-28",
          "io.modelcontextprotocol/clientCapabilities": {},
        },
      },
    }),
    status: 200,
    bodyIncludes: "save_note",
  },
];

const chatApps = ["calling-claude", "calling-openai", "calling-perplexity"];

function runtimeExamples(
  runtime: Runtime,
  root: string,
  basics: string[],
  start: string[],
  port: number,
  envFile?: string,
): Example[] {
  const files = envFile ? { [envFile]: dotenv } : undefined;
  return [
    ...basics.map((name) => ({
      dir: `${root}/${name}`,
      runtime,
      start,
      port,
      checks: basicChecks,
    })),
    ...chatApps.map((name) => ({
      dir: `${root}/${name}`,
      runtime,
      start,
      port,
      files,
      checks: chatChecks,
    })),
    {
      dir: `${root}/mcp-server`,
      runtime,
      start,
      port,
      checks: mcpChecks,
    },
  ];
}

export const examples: Example[] = [
  ...runtimeExamples(
    "node",
    "examples/runtimes/node",
    ["basic-app-cjs", "basic-app-esm", "basic-app-typescript"],
    ["npm", "start"],
    1447,
  ),
  ...runtimeExamples(
    "deno",
    "examples/runtimes/deno",
    ["basic-app"],
    // The documented command. `--watch` is harmless: the process is killed
    // once its checks finish.
    ["deno", "task", "dev"],
    1447,
    ".env",
  ),
  ...runtimeExamples(
    "bun",
    "examples/runtimes/bun",
    ["basic-app"],
    ["bun", "run", "start"],
    1447,
  ),
  ...runtimeExamples(
    "cloudflare",
    "examples/runtimes/cloudflare-workers",
    ["basic-app"],
    ["npm", "start"],
    8787,
    ".dev.vars",
  ),
  {
    dir: "examples/frameworks/next-js/calling-claude",
    runtime: "node",
    prepare: ["npm", "run", "build"],
    start: ["npm", "start"],
    port: 3000,
    bootTimeout: 120,
    checks: [
      { method: "POST", path: "/api/chat", body: "not json", status: 400 },
      { method: "POST", path: "/api/chat", body: "{}", status: 400 },
    ],
  },
];
