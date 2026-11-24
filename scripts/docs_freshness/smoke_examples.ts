/**
 * Boot every example app for one runtime and send it the requests its docs
 * page shows, on whatever version of the runtime is installed. The weekly docs
 * freshness workflow installs the latest release first.
 *
 *   deno run -A scripts/docs_freshness/smoke_examples.ts <runtime> [--report <file>]
 *
 * <runtime> is node, deno, bun, or cloudflare. Writes a JSON report when
 * --report is given, prints a Markdown summary, and exits 1 if any example
 * failed.
 */

import {
  type Example,
  examples,
  placeholderEnv,
  type Runtime,
} from "./examples.ts";

type Result = {
  dir: string;
  ok: boolean;
  /** Why it failed, and the tail of its output. Empty when it passed. */
  errors: string[];
  output: string;
};

const RUNTIMES: Runtime[] = ["bun", "cloudflare", "deno", "node"];

const runtime = Deno.args[0] as Runtime;
if (!RUNTIMES.includes(runtime)) {
  console.error(
    `Usage: smoke_examples.ts <${RUNTIMES.join("|")}> [--report <file>]`,
  );
  Deno.exit(1);
}
const reportIndex = Deno.args.indexOf("--report");
const reportPath = reportIndex === -1 ? undefined : Deno.args[reportIndex + 1];

const childEnv = {
  ...placeholderEnv,
  CI: "true",
  NEXT_TELEMETRY_DISABLED: "1",
  WRANGLER_SEND_METRICS: "false",
};

async function run(cmd: string[], cwd: string, timeoutSeconds: number) {
  const output = await new Deno.Command(cmd[0], {
    args: cmd.slice(1),
    cwd,
    env: childEnv,
    stdout: "piped",
    stderr: "piped",
    signal: AbortSignal.timeout(timeoutSeconds * 1000),
  }).output();
  const text = new TextDecoder().decode(output.stdout) +
    new TextDecoder().decode(output.stderr);
  if (!output.success) {
    throw new Error(
      `\`${cmd.join(" ")}\` exited ${output.code}\n${tail(text)}`,
    );
  }
}

function tail(text: string, lines = 40) {
  return text.trimEnd().split("\n").slice(-lines).join("\n");
}

/** Kill whatever still listens on `port`: npm, tsx, and wrangler fork children. */
async function freePort(port: number) {
  for (let attempt = 0; attempt < 20; attempt++) {
    const lsof = await new Deno.Command("lsof", {
      args: ["-ti", `tcp:${port}`, "-sTCP:LISTEN"],
      stdout: "piped",
      stderr: "null",
    }).output();
    const pids = new TextDecoder().decode(lsof.stdout).split("\n").filter(
      Boolean,
    );
    if (pids.length === 0) return;
    for (const pid of pids) {
      try {
        Deno.kill(Number(pid), "SIGKILL");
      } catch { /* already gone */ }
    }
    await new Promise((r) => setTimeout(r, 250));
  }
}

async function install(example: Example) {
  const cwd = example.dir;
  switch (example.runtime) {
    case "deno":
      return; // `deno task` fetches what it needs.
    case "bun":
      return await run(["bun", "install"], cwd, 300);
    case "cloudflare":
      await run(["npm", "ci", "--no-audit", "--no-fund"], cwd, 300);
      // The lockfile pins wrangler, and wrangler pins workerd -- the actual
      // Workers runtime. Override it so this tests the latest one.
      return await run(
        [
          "npm",
          "install",
          "--no-save",
          "--no-audit",
          "--no-fund",
          "wrangler@latest",
        ],
        cwd,
        300,
      );
    case "node":
      return await run(["npm", "ci", "--no-audit", "--no-fund"], cwd, 600);
  }
}

async function smoke(example: Example): Promise<Result> {
  const result: Result = {
    dir: example.dir,
    ok: false,
    errors: [],
    output: "",
  };
  const created: string[] = [];
  let child: Deno.ChildProcess | undefined;
  let output = "";

  try {
    await install(example);
    if (example.prepare) await run(example.prepare, example.dir, 600);

    for (const [name, contents] of Object.entries(example.files ?? {})) {
      const path = `${example.dir}/${name}`;
      try {
        await Deno.stat(path);
      } catch {
        await Deno.writeTextFile(path, contents);
        created.push(path);
      }
    }

    await freePort(example.port);
    child = new Deno.Command(example.start[0], {
      args: example.start.slice(1),
      cwd: example.dir,
      env: childEnv,
      stdout: "piped",
      stderr: "piped",
    }).spawn();
    const exited = child.status.then((s) => s);
    const decoder = new TextDecoder();
    for (const stream of [child.stdout, child.stderr]) {
      stream.pipeTo(
        new WritableStream({
          write(chunk) {
            output += decoder.decode(chunk);
          },
        }),
      ).catch(() => {});
    }

    const base = `http://localhost:${example.port}`;
    const deadline = Date.now() + (example.bootTimeout ?? 60) * 1000;
    let booted = false;
    while (Date.now() < deadline) {
      const early = await Promise.race([
        exited,
        new Promise<undefined>((r) => setTimeout(() => r(undefined), 500)),
      ]);
      if (early) {
        throw new Error(`Exited with code ${early.code} before answering`);
      }
      try {
        await (await fetch(base, { signal: AbortSignal.timeout(2000) })).body
          ?.cancel();
        booted = true;
        break;
      } catch { /* not listening yet */ }
    }
    if (!booted) {
      throw new Error(`Nothing answered on ${base} within the boot timeout`);
    }

    for (const check of example.checks) {
      const label = `${check.method} ${check.path}${
        check.body ? ` ${check.body.slice(0, 20)}` : ""
      }`;
      try {
        const response = await fetch(base + check.path, {
          method: check.method,
          headers: check.headers,
          body: check.body,
          signal: AbortSignal.timeout(15000),
        });
        const body = await response.text();
        if (response.status !== check.status) {
          result.errors.push(
            `${label}: expected ${check.status}, got ${response.status}: ${
              body.slice(0, 200)
            }`,
          );
        } else if (check.bodyIncludes && !body.includes(check.bodyIncludes)) {
          result.errors.push(
            `${label}: body lacks "${check.bodyIncludes}": ${
              body.slice(0, 200)
            }`,
          );
        }
      } catch (error) {
        result.errors.push(`${label}: ${(error as Error).message}`);
      }
    }
  } catch (error) {
    result.errors.push((error as Error).message);
  } finally {
    try {
      child?.kill("SIGTERM");
    } catch { /* already exited */ }
    await freePort(example.port);
    for (const path of created) await Deno.remove(path).catch(() => {});
  }

  result.ok = result.errors.length === 0;
  result.output = result.ok ? "" : tail(output);
  return result;
}

const selected = examples.filter((e) => e.runtime === runtime);
const results: Result[] = [];
for (const example of selected) {
  console.error(`\n▶ ${example.dir}`);
  const result = await smoke(example);
  console.error(
    result.ok ? "  ✓ passed" : `  ✗ ${result.errors.join("\n    ")}`,
  );
  results.push(result);
}

const lines = [
  `### Examples on ${runtime}`,
  "",
  ...results.map((r) =>
    r.ok
      ? `- ✅ \`${r.dir}\``
      : `- ❌ \`${r.dir}\`\n${r.errors.map((e) => `  - ${e}`).join("\n")}`
  ),
  "",
];
const summary = lines.join("\n");
console.log(summary);
const stepSummary = Deno.env.get("GITHUB_STEP_SUMMARY");
if (stepSummary) {
  await Deno.writeTextFile(stepSummary, summary + "\n", { append: true });
}
if (reportPath) {
  await Deno.writeTextFile(
    reportPath,
    JSON.stringify({ runtime, results }, null, 2) + "\n",
  );
}

Deno.exit(results.every((r) => r.ok) ? 0 : 1);
