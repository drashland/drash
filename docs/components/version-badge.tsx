import styles from "./version-badge.module.css";

/**
 * The major version this documentation describes, shown beside the wordmark.
 *
 * Hardcoded rather than derived. The root package.json is `3.0.0-beta.3`, which
 * would render as `v3.0.0-beta.3`, and docs/package.json is `0.0.0` — so a real
 * derivation would mean reading across package boundaries and reformatting the
 * string for a value that changes once a major.
 */
export function VersionBadge() {
  return <span className={styles.badge}>v3.0.0</span>;
}
