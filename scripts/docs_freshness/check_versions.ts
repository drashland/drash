/**
 * Compare the runtime versions the docs and CI claim with the latest releases.
 *
 *   deno run --allow-net --allow-read --allow-write --allow-env \
 *     scripts/docs_freshness/check_versions.ts [--report <file>]
 *
 * Only flags what a new release makes stale, so an ordinary week passes:
 *
 * - Node: an even (LTS-line) major has been released that the tested-majors
 *   claim, a CI matrix, or tests/compat does not cover. End-of-life majors are
 *   listed as notes only: dropping one is a support decision, not docs drift.
 * - Deno: the latest major is newer than the tested `Deno N.x`.
 * - wrangler: the latest major differs from the one in sample output. Minor
 *   releases ship weekly and are not worth a pull request.
 *
 * Minimums ("Node 20+", `compatibility_date` floors) are deliberately not
 * checked: a new release does not make a minimum wrong. The smoke tests in
 * smoke_examples.ts cover whether the documented code still runs.
 *
 * Writes a JSON report when --report is given, prints a Markdown summary, and
 * sets `drift=true|false` in $GITHUB_OUTPUT. Always exits 0 unless a release
 * lookup itself fails.
 */

type Finding = { file: string; claim: string; problem: string };

const reportIndex = Deno.args.indexOf("--report");
const reportPath = reportIndex === -1 ? undefined : Deno.args[reportIndex + 1];

const TESTED_CLAIM = "docs/content/docs/getting-started/index.mdx";
const WRANGLER_SAMPLE =
  "docs/content/examples/runtimes/cloudflare-workers/basic-app.mdx";
const NODE_COMPAT_DIRS = ["tests/compat/node", "tests/compat/cloudflare"];

async function getJson(url: string) {
  const headers: Record<string, string> = {
    "User-Agent": "drash-docs-freshness",
  };
  const token = Deno.env.get("GITHUB_TOKEN");
  if (token && url.startsWith("https://api.github.com/")) {
    headers.Authorization = `Bearer ${token}`;
  }
  const response = await fetch(url, { headers });
  if (!response.ok) throw new Error(`${url} answered ${response.status}`);
  return await response.json();
}

async function workflowFiles() {
  const files: string[] = [];
  for await (const entry of Deno.readDir(".github/workflows")) {
    if (entry.isFile && /code_validation\.ya?ml$/.test(entry.name)) {
      files.push(`.github/workflows/${entry.name}`);
    }
  }
  return files.sort();
}

// Latest releases ////////////////////////////////////////////////////////////

const today = new Date().toISOString().slice(0, 10);

// https://github.com/nodejs/Release -- start, lts, maintenance, end per major.
const schedule: Record<string, { start: string; end: string }> = await getJson(
  "https://raw.githubusercontent.com/nodejs/Release/main/schedule.json",
);
const nodeReleased = Object.entries(schedule)
  .map(([v, s]) => ({ major: Number(v.replace(/^v/, "")), ...s }))
  .filter((r) =>
    Number.isInteger(r.major) && r.major % 2 === 0 && r.start <= today
  );
const nodeSupported = nodeReleased.filter((r) => r.end > today).map((r) =>
  r.major
);
const nodeEol = new Set(
  nodeReleased.filter((r) => r.end <= today).map((r) => r.major),
);
const nodeLatestEven = Math.max(...nodeSupported);

const denoLatest =
  (await (await fetch("https://dl.deno.land/release-latest.txt")).text())
    .trim();
const denoMajor = Number(denoLatest.replace(/^v/, "").split(".")[0]);

const bunLatest =
  (await getJson("https://api.github.com/repos/oven-sh/bun/releases/latest"))
    .tag_name.replace(/^bun-v/, "");

const wranglerLatest: string =
  (await getJson("https://registry.npmjs.org/wrangler/latest")).version;
const wranglerMajor = Number(wranglerLatest.split(".")[0]);

// Claims /////////////////////////////////////////////////////////////////////

const findings: Finding[] = [];
const notes: string[] = [];

function checkNodeMajors(file: string, claim: string, majors: number[]) {
  const missing = nodeSupported.filter((m) =>
    m >= Math.min(...majors) && !majors.includes(m)
  );
  if (missing.length) {
    findings.push({
      file,
      claim,
      problem: `Node ${missing.join(", ")} ${
        missing.length === 1 ? "is" : "are"
      } released and supported but not covered (latest even major: ${nodeLatestEven}).`,
    });
  }
  const eol = majors.filter((m) => nodeEol.has(m));
  if (eol.length) {
    notes.push(
      `\`${file}\` (${claim}) still lists end-of-life Node ${
        eol.join(", ")
      }. Dropping it is a support decision, so this is not flagged.`,
    );
  }
}

const testedText = await Deno.readTextFile(TESTED_CLAIM);

const nodeTested = testedText.match(/Node ((?:\d+\/)*\d+)/);
if (nodeTested) {
  checkNodeMajors(
    TESTED_CLAIM,
    nodeTested[0],
    nodeTested[1].split("/").map(Number),
  );
} else {
  findings.push({
    file: TESTED_CLAIM,
    claim: "Node 20/22/...",
    problem: "The tested Node majors claim is gone; update check_versions.ts.",
  });
}

const denoTested = testedText.match(/Deno (\d+)\.x/);
if (denoTested && Number(denoTested[1]) < denoMajor) {
  findings.push({
    file: TESTED_CLAIM,
    claim: denoTested[0],
    problem: `Deno ${denoLatest} is out.`,
  });
}

for (const file of await workflowFiles()) {
  const text = await Deno.readTextFile(file);
  // Commented-out matrices are documentation of a disabled job, not a claim.
  const live = text.split("\n").filter((line) => !line.trim().startsWith("#"))
    .join("\n");
  const matrices = new Set(
    [...live.matchAll(/node-version: \[([^\]]+)\]/g)].map((m) => m[1]),
  );
  for (const matrix of matrices) {
    checkNodeMajors(
      file,
      `node-version: [${matrix}]`,
      matrix.split(",").map((v) => parseInt(v.trim())),
    );
  }
  for (
    const [claim, major] of new Set(
      [...live.matchAll(/deno-version: v(\d+)\.x/g)].map((m) =>
        [m[0], m[1]] as const
      ),
    )
  ) {
    if (Number(major) < denoMajor) {
      findings.push({ file, claim, problem: `Deno ${denoLatest} is out.` });
    }
  }
}

for (const dir of NODE_COMPAT_DIRS) {
  const majors: number[] = [];
  for await (const entry of Deno.readDir(dir)) {
    const match = entry.isDirectory && entry.name.match(/^node-v(\d+)\.x$/);
    if (match) majors.push(Number(match[1]));
  }
  checkNodeMajors(
    dir,
    `node-v{${majors.sort((a, b) => a - b).join(",")}}.x`,
    majors,
  );
}

const wranglerSample = (await Deno.readTextFile(WRANGLER_SAMPLE)).match(
  /wrangler (\d+)\.\d+\.\d+/,
);
if (wranglerSample && Number(wranglerSample[1]) !== wranglerMajor) {
  findings.push({
    file: WRANGLER_SAMPLE,
    claim: wranglerSample[0],
    problem: `wrangler ${wranglerLatest} is out.`,
  });
}

// Report /////////////////////////////////////////////////////////////////////

const latest = {
  node: { supportedEvenMajors: nodeSupported, latestEvenMajor: nodeLatestEven },
  deno: denoLatest,
  bun: bunLatest,
  wrangler: wranglerLatest,
};

const summary = [
  "### Version claims",
  "",
  `Latest (${today}): Node ${nodeLatestEven} (supported even majors: ${
    nodeSupported.join(", ")
  }), Deno ${denoLatest}, Bun ${bunLatest}, wrangler ${wranglerLatest}.`,
  "",
  ...(findings.length
    ? findings.map((f) => `- ❌ \`${f.file}\` — \`${f.claim}\`: ${f.problem}`)
    : ["- ✅ No version claim is stale."]),
  ...(notes.length ? ["", "Notes:", ...notes.map((n) => `- ${n}`)] : []),
  "",
].join("\n");

console.log(summary);
const stepSummary = Deno.env.get("GITHUB_STEP_SUMMARY");
if (stepSummary) {
  await Deno.writeTextFile(stepSummary, summary + "\n", { append: true });
}
const githubOutput = Deno.env.get("GITHUB_OUTPUT");
if (githubOutput) {
  await Deno.writeTextFile(githubOutput, `drift=${findings.length > 0}\n`, {
    append: true,
  });
}
if (reportPath) {
  await Deno.writeTextFile(
    reportPath,
    JSON.stringify({ date: today, latest, findings, notes }, null, 2) + "\n",
  );
}
