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
      ["HTTP Application", "/docs/concepts/http-application"],
      ["Step-By-Step Guide", "/docs/getting-started/step-by-step-guide"],
      ["Creating a Resource", "/docs/resources/creating-a-resource"],
      ["Middleware", "/docs/middleware"],
      ["Examples", "/examples"],
    ],
  },
  {
    heading: "Reference",
    links: [
      ["Overview", "/reference"],
      ["Core", "/reference/core"],
      ["Standard", "/reference/standard"],
      ["Modules", "/reference/modules"],
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
                <Link className={styles.link} href="/releases">
                  Releases
                </Link>
              </li>
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
          <br />License: GPL-3.0
        </div>
        <div className="max-[365px]:text-left text-right">
          <strong>Authors</strong>
          <br />
          <a
            className="transition-colors hover:text-white hover:underline"
            href="https://github.com/crookse"
            target="_BLANK"
          >
            Eric Crooks
          </a>
          <br />
          <a
            className="transition-colors hover:text-white hover:underline"
            href="https://github.com/saragee3"
            target="_BLANK"
          >
            Sara Gee
          </a>
          <br />
          <a
            className="transition-colors hover:text-white hover:underline"
            href="https://github.com/ebbebington"
            target="_BLANK"
          >
            Breno Salles
          </a>
          <br />
          <a
            className="transition-colors hover:text-white hover:underline"
            href="https://github.com/Guergeiro"
            target="_BLANK"
          >
            Edward Bebbington
          </a>
        </div>
      </div>
    </div>
  );
}
