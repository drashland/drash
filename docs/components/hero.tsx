"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./hero.module.css";

const features = [
  {
    title: "Runtime agnostic",
    body:
      "Drash runs with Deno.serve, node:http, Bun.serve, and a Cloudflare Worker fetch. Build once. Run everywhere.",
  },
  {
    title: "No framework lock-in",
    body:
      "The only lock-in you take on is your runtime's — move to another one and your resources and chain come with you.",
  },
  {
    title: "Structure by default",
    body:
      "Strict interfaces forces separation of concerns — keeping you and your code focused on clean architecture.",
  },
  {
    title: "Built on Web Standards",
    body:
      "Resources take a Request and return a Response — no framework-specific request wrapper.",
  },
];

/**
 * A code token: [text, styleClass]. A null class renders as plain text.
 *
 * The card is hand-tokenised rather than run through a highlighter so the hero
 * ships no syntax-highlighting runtime.
 */
type Token = [string, string | null];

const kw = styles.kw;
const fn = styles.fn;
const str = styles.str;
const cmt = styles.cmt;
const dim = styles.dim;

/**
 * Everything above the server binding. Identical for every runtime — which is
 * the point the switcher is making, so it stays fixed while the tail swaps.
 *
 * The Claude tab is the exception: it shows a prompt rather than an app, so it
 * supplies a `body` and skips this entirely.
 */
const shared: Token[] = [
  ["class", kw],
  [" ", null],
  ["Home", fn],
  [" ", null],
  ["extends", kw],
  [" ", null],
  ["Resource", fn],
  [" {\n  paths = [", null],
  ['"/"', str],
  ["];\n\n  ", null],
  ["GET", fn],
  ["(request) {\n    ", null],
  ["return", kw],
  [" ", null],
  ["new", kw],
  [" ", null],
  ["Response", fn],
  ["(", null],
  ['"Oh so easy"', str],
  [");\n  }\n}\n\n", null],
  ["const", kw],
  [" chain = Chain\n  .", null],
  ["builder", fn],
  ["()\n  .", null],
  ["resources", fn],
  ["(Home)\n  .", null],
  ["build", fn],
  ["();\n\n", null],
  ["// Your runtime owns the socket.", cmt],
  ["\n", null],
];

type Tab = {
  id: string;
  label: string;
  /** Shown at the end of the title bar, where an editor shows the filename. */
  file: string;
  /**
   * Prepended to `shared`: what this runtime imports. Separate from `shared`
   * because the entry point differs — native where the runtime has a global
   * `URLPattern`, polyfill otherwise — and Node additionally pulls in
   * `node:http`.
   */
  head?: Token[];
  /** Appended to `shared`: how this runtime hands the chain a request. */
  tail?: Token[];
};

/**
 * The tail differs only in how each runtime hands you a request. Kept short on
 * purpose: the full, copy-pasteable versions live in "Pick your runtime" below.
 *
 * Claude sits last, after the runtimes it would write for you.
 */
const tabs: Tab[] = [
  {
    id: "node",
    label: "Node",
    file: "app.js",
    head: [
      ["import", kw],
      [" { ", null],
      ["Chain", fn],
      [", ", null],
      ["Resource", fn],
      [" } ", null],
      ["from", kw],
      [" ", null],
      ['"@drashland/drash/modules/http.polyfill.js"', str],
      [";\n", null],
      ["import", kw],
      [" { ", null],
      ["createServer", fn],
      [" } ", null],
      ["from", kw],
      [" ", null],
      ['"node:http"', str],
      [";\n\n", null],
    ],
    tail: [
      ["createServer", fn],
      ["((request, response) => {\n  ", null],
      ["return", kw],
      [" chain.", null],
      ["handle", fn],
      ["({\n    url: ", null],
      ["`http://localhost:1447${request.url}`", str],
      [
        ",\n    method: request.method,\n    request,\n    response\n  })}).",
        null,
      ],
      ["listen", fn],
      ["(1447)", null],
    ],
  },
  {
    id: "deno",
    label: "Deno",
    file: "app.ts",
    head: [
      ["import", kw],
      [" { ", null],
      ["Chain", fn],
      [", ", null],
      ["Resource", fn],
      [" } ", null],
      ["from", kw],
      [" ", null],
      ['"npm:@drashland/drash/modules/http.native.js"', str],
      [";\n\n\n", null],
    ],
    tail: [
      ["Deno.", null],
      ["serve", fn],
      ["({\n  hostname: ", null],
      ['"localhost"', str],
      [",\n  port: 1447,\n  handler: ", null],
      ["async", kw],
      [" (request: ", null],
      ["Request", fn],
      [") => {\n    ", null],
      ["return", kw],
      [" chain.", null],
      ["handle", fn],
      ["<", null],
      ["Response", fn],
      [">(request);\n  }\n});", null],
    ],
  },
  {
    id: "bun",
    label: "Bun",
    file: "app.js",
    head: [
      ["import", kw],
      [" { ", null],
      ["Chain", fn],
      [", ", null],
      ["Resource", fn],
      [" } ", null],
      ["from", kw],
      [" ", null],
      ['"@drashland/drash/modules/http.polyfill.js"', str],
      [";\n\n\n", null],
    ],
    tail: [
      ["Bun.", null],
      ["serve", fn],
      ["({\n  hostname: ", null],
      ['"localhost"', str],
      [",\n  port: 1447,\n  ", null],
      ["fetch", fn],
      ["(request", null],
      [") {\n    ", null],
      ["return", kw],
      [" chain.", null],
      ["handle", fn],
      ["(request);\n  },\n});", null],
    ],
  },
  {
    id: "cloudflare",
    label: "Cloudflare",
    file: "worker.js",
    head: [
      ["import", kw],
      [" { ", null],
      ["Chain", fn],
      [", ", null],
      ["Resource", fn],
      [" } ", null],
      ["from", kw],
      [" ", null],
      ['"@drashland/drash/modules/http.native.js"', str],
      [";\n\n\n", null],
    ],
    tail: [
      ["export", kw],
      [" ", null],
      ["default", kw],
      [" {\n  ", null],
      ["fetch", fn],
      ["(request) {\n    ", null],
      ["return", kw],
      [" chain.", null],
      ["handle", fn],
      ["(request);\n  },\n};", null],
    ],
  },
];

/**
 * The agent transcript, shown in its own card below the runtime switcher rather
 * than as a fifth tab. It is not a runtime you would pick between — it is the
 * alternative to picking one — so putting it in the rotation implied a false
 * equivalence, and its 16 lines against the runtimes' 24 made the card jump.
 *
 * Lines wrap at 80 columns: `.code` scrolls rather than wraps, so anything
 * longer runs off the card.
 */
const transcript: { file: string; body: Token[] } = {
  file: "terminal",
  body: [
    ["$ ", cmt],
    ["claude", fn],
    ["\n\n", null],
    ["> ", cmt],
    [
      "Read https://drash.crookse.com/agents.md and set up a Drash project.\n\n",
      str,
    ],
  ],
};

function renderTokens(tokens: Token[], keyPrefix: string) {
  return tokens.map(([text, cls], i) =>
    cls
      ? <span key={`${keyPrefix}-${i}`} className={cls}>{text}</span>
      : <span key={`${keyPrefix}-${i}`}>{text}</span>
  );
}

/** How long each tab stays on screen before the card advances. */
const ROTATE_MS = 2000;

export function Hero() {
  const [active, setActive] = useState(0);
  /**
   * A tab has keyboard focus. Hover deliberately does not pause: the card is a
   * showcase, not something a reader is expected to copy from, so drifting the
   * pointer across it should not halt the rotation. Keyboard focus is different
   * — reaching a tab takes intent, and it is the step before a click.
   */
  const [paused, setPaused] = useState(false);
  /** A tab was clicked. The reader has taken over; this is never cleared. */
  const [stopped, setStopped] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  /*
   * Tracked in an effect rather than read during render: `window.matchMedia`
   * does not exist while pre-rendering, and seeding state from it during render
   * would desync the exported HTML from the first client render. Subscribing to
   * `change` also means toggling the OS setting takes effect without a reload.
   */
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduceMotion(query.matches);

    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  /*
   * The cleanup is what implements pause and stop: flipping any of these flags
   * re-runs the effect, which clears the running interval and then declines to
   * start a new one.
   *
   * `active` is deliberately not a dependency. Advancing via the functional
   * update keeps the interval alive across ticks — depending on `active` would
   * tear it down and recreate it every 5s, so a hover arriving mid-cycle would
   * silently restart the clock instead of pausing it.
   */
  useEffect(() => {
    if (stopped || paused || reduceMotion) return;

    const id = setInterval(
      () => setActive((index) => (index + 1) % tabs.length),
      ROTATE_MS,
    );

    return () => clearInterval(id);
  }, [stopped, paused, reduceMotion]);

  const current = tabs[active];

  return (
    <>
      <section className={styles.hero}>
        <div className={styles.inner}>
          {/* <span className={styles.eyebrow}>
            <span className={styles.dot} />
            v3 is in beta
          </span> */}

          <h1 className={styles.title}>
            Better web apps<br />
            <span className={styles.gradient}>without the framework tax</span>
          </h1>

          <p className={styles.lead}>
            {/* Build once. Run across JavaScript runtimes. Built on Web Standards. */}
            Built for people. Programmable by agents. Native to the web.
          </p>

          <div className={styles.actions}>
            <Link
              className={`${styles.button} ${styles.primary}`}
              href="/docs/quickstart/deno"
            >
              Get started →
            </Link>
            <a
              className={`${styles.button} ${styles.secondary}`}
              href="https://github.com/drashland/drash"
              target="_blank"
              rel="noreferrer"
            >
              View on GitHub
            </a>
          </div>

          {
            /*
             * onFocus/onBlur rather than a :focus-within rule: React maps them to
             * native focusin/focusout, which bubble, so focusing a tab button
             * inside the card pauses it without per-button handlers.
             *
             * There is no pointer equivalent by design — see the `paused` note
             * above.
             */
          }
          <div
            className={styles.codeCard}
            onFocus={() => setPaused(true)}
            onBlur={() => setPaused(false)}
          >
            <div className={styles.codeBar}>
              <span
                className={styles.codeDot}
                style={{ background: "#ff5f57" }}
              />
              <span
                className={styles.codeDot}
                style={{ background: "#febc2e" }}
              />
              <span
                className={styles.codeDot}
                style={{ background: "#28c840" }}
              />

              <div
                className={styles.tabs}
                role="tablist"
                aria-label="Getting started"
              >
                {tabs.map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    role="tab"
                    id={`hero-tab-${item.id}`}
                    aria-selected={index === active}
                    aria-controls="hero-code"
                    className={`${styles.tab} ${
                      index === active ? styles.tabActive : ""
                    }`}
                    onClick={() => {
                      setActive(index);
                      setStopped(true);
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <span className={styles.codeFile}>{current.file}</span>
            </div>

            <pre
              className={styles.code}
              id="hero-code"
              role="tabpanel"
              aria-labelledby={`hero-tab-${current.id}`}
            >
              <code>
                {renderTokens(current.head ?? [], `${current.id}-head`)}
                {renderTokens(shared, "shared")}
                {renderTokens(current.tail ?? [], current.id)}
              </code>
            </pre>
          </div>
        </div>
      </section>

      <section className={styles.features}>
        {features.map((feature) => (
          <div className={styles.feature} key={feature.title}>
            <h3 className={styles.featureTitle}>{feature.title}</h3>
            <p className={styles.featureBody}>{feature.body}</p>
          </div>
        ))}
      </section>

      <section className={styles.agent}>
        <h2 className={styles.agentTitle}>Let your agent set it up</h2>
        {
          /*
           * The agent transcript. No tab strip and no `role="tabpanel"` — it
           * is a single fixed block, not one of a set — and `.transcript`
           * drops the min-height the switcher needs so this card sits at its
           * own natural height.
           */
        }
        <div className={styles.codeCard}>
          <div className={styles.codeBar}>
            <span
              className={styles.codeDot}
              style={{ background: "#ff5f57" }}
            />
            <span
              className={styles.codeDot}
              style={{ background: "#febc2e" }}
            />
            <span
              className={styles.codeDot}
              style={{ background: "#28c840" }}
            />
            <span className={styles.codeFile}>{transcript.file}</span>
          </div>

          <pre className={`${styles.code} ${styles.transcript}`}>
            <code>{renderTokens(transcript.body, "transcript")}</code>
          </pre>
        </div>
      </section>
    </>
  );
}
