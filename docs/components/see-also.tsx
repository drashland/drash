import styles from "./see-also.module.css";

/**
 * Cross-references between glossary entries.
 *
 * `items` maps an anchor on the current page to the label to show for it, so
 * `{ chain: "Chain" }` links to `#chain` with the text "Chain".
 */
export function SeeAlso({ items }: { items: Record<string, string> }) {
  const entries = Object.entries(items);

  if (entries.length === 0) {
    return null;
  }

  return (
    <p className={styles.seeAlso}>
      <span className={styles.label}>See also</span>
      {entries.map(([anchor, label], index) => (
        <span key={anchor}>
          {index > 0 ? ", " : " "}
          <a href={`#${anchor}`}>{label}</a>
        </span>
      ))}
    </p>
  );
}
