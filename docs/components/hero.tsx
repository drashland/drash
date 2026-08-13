import Link from "next/link";
import styles from "./hero.module.css";

const features = [
  {
    title: "Ships no server",
    body:
      "Drash owns routing, resource dispatch, and error semantics. Your runtime owns the socket.",
  },
  {
    title: "Runtime agnostic",
    body:
      "The same chain runs under Deno.serve, node:http, Bun.serve, and a Cloudflare Worker fetch.",
  },
  {
    title: "Built on Web Standards",
    body:
      "Resources take a Request and return a Response — no framework-specific request wrapper.",
  },
  {
    title: "A chain you can read",
    body:
      "The lifecycle is a linked list of handlers, in a fixed order you can point at.",
  },
];

export function Hero() {
  return (
    <>
      <section className={styles.hero}>
        <div className={styles.inner}>
          <span className={styles.eyebrow}>
            <span className={styles.dot} />
            v3 is in beta
          </span>

          <h1 className={styles.title}>
            HTTP services,<br />
            <span className={styles.gradient}>without the framework tax</span>
          </h1>

          <p className={styles.lead}>
            A strongly typed, runtime-agnostic web framework for building
            structured HTTP services in JavaScript, built on Web Standards.
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
              <span className={styles.codeFile}>app.ts</span>
            </div>
            <pre className={styles.code}>
              <code>
                <span className={styles.kw}>class</span>{" "}
                <span className={styles.fn}>Home</span>{" "}
                <span className={styles.kw}>extends</span>{" "}
                <span className={styles.fn}>Resource</span> {"{\n"}
                {"  paths = ["}
                <span className={styles.str}>"/"</span>
                {"];\n\n"}
                {"  "}
                <span className={styles.fn}>GET</span>
                {"(request: Request) {\n"}
                {"    "}
                <span className={styles.kw}>return</span>{" "}
                <span className={styles.kw}>new</span>{" "}
                <span className={styles.fn}>Response</span>
                {"("}
                <span className={styles.str}>"Hello from Home.GET()!"</span>
                {");\n"}
                {"  }\n"}
                {"}\n\n"}
                <span className={styles.kw}>const</span> chain = Chain{"\n"}
                {"  ."}
                <span className={styles.fn}>builder</span>
                {"()\n"}
                {"  ."}
                <span className={styles.fn}>resources</span>
                {"(Home)\n"}
                {"  ."}
                <span className={styles.fn}>build</span>
                {"();\n\n"}
                <span className={styles.cmt}>
                  {"// Your runtime owns the socket."}
                </span>
                {"\n"}
                {"Deno."}
                <span className={styles.fn}>serve</span>
                {"((request) => chain."}
                <span className={styles.fn}>handle</span>
                {"<Response>(request));"}
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
    </>
  );
}
