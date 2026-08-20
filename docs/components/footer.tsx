import Link from "next/link";
import styles from "./footer.module.css";

/*
 * agents.md is a static file in public/, not a route, so it needs a plain
 * anchor — and plain anchors do not get the basePath prefix that next/link
 * applies on its own. Mirrors next.config.mjs; both read the same variable at
 * build time, so they cannot drift.
 */
const basePath = process.env.DOCS_BASE_PATH ?? "";

const columns: { heading: string; links: [string, string][] }[] = [
  {
    heading: "Docs",
    links: [
      ["Introduction", "/docs/getting-started"],
      ["About These Pages", "/docs/getting-started/about-these-pages"],
      ["Prerequisites", "/docs/getting-started/prerequisites"],
      ["Concepts", "/docs/concepts/framework"],
      ["Glossary", "/docs/misc/glossary"],
    ],
  },
  {
    heading: "Learn",
    links: [
      ["Quickstart", "/docs/quickstart"],
      ["Step-by-step guide", "/docs/getting-started/step-by-step-guide"],
      ["Creating a Resource", "/docs/resources/creating-a-resource"],
      ["Middleware", "/docs/tutorials/middleware"],
      ["Examples", "/examples"],
    ],
  },
  {
    heading: "Reference",
    links: [
      ["Overview", "/reference"],
      ["HTTPError", "/reference/core/http-error"],
      ["Resource groups", "/reference/standard/resource-group"],
      ["Chain", "/reference/modules/http/chain"],
    ],
  },
];

export function DrashFooter() {
  return (
    // The marker attribute is what app/globals.css keys its two overrides off.
    // Nextra's own utility classes are generated and change between releases.
    <div className={styles.root} data-drash-footer>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <span className={styles.wordmark}>Drash</span>
          <p className={styles.tagline}>
            Built for people.<br />Programmable by agents.<br />{" "}
            Native to the web.
          </p>
        </div>

        <nav className={styles.columns} aria-label="Footer">
          {columns.map((column) => (
            <div className={styles.column} key={column.heading}>
              <h2 className={styles.heading}>{column.heading}</h2>
              <ul className={styles.list}>
                {column.links.map(([label, href]) => (
                  <li key={href}>
                    <Link className={styles.link} href={href}>
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className={styles.column}>
            <h2 className={styles.heading}>Project</h2>
            <ul className={styles.list}>
              <li>
                <a
                  className={styles.link}
                  href="https://github.com/drashland/drash"
                  target="_blank"
                  rel="noreferrer"
                >
                  GitHub
                </a>
              </li>
              <li>
                <a
                  className={styles.link}
                  href="https://github.com/drashland/drash/issues"
                  target="_blank"
                  rel="noreferrer"
                >
                  Issues
                </a>
              </li>
              <li>
                <a
                  className={styles.link}
                  href={`${basePath}/agents.md`}
                  title="Setup instructions for coding agents"
                >
                  agents.md
                </a>
              </li>
            </ul>
          </div>
        </nav>
      </div>

      <div className={styles.bottom}>
        <div>
          Copyright © 2019-2026 Drash
        </div>
        <div className={styles.bottomright}>
          Drash v3 is in beta. APIs may change.<br />License: GPL-3.0.
        </div>
      </div>
    </div>
  );
}
