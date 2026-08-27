import styles from "./version-badge.module.css";

/**
 * The version this documentation describes, shown beside the wordmark.
 *
 * Written as a literal rather than derived at build time: docs/package.json is
 * `0.0.0`, so a real derivation would mean reading across package boundaries
 * from a static export.
 *
 * Not maintained by hand, though — `deno task bump-version` rewrites the string
 * below alongside package.json, deno.json, and the examples, so a release moves
 * all of them together. That script matches on this `span`, so keep the version
 * inside it and keep the leading `v`.
 */
export function VersionBadge() {
  return <span className={styles.badge}>v3.0.2</span>;
}
