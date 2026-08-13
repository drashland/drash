import type { HTMLAttributes } from "react";
import styles from "./table.module.css";

function cx(...values: (string | undefined)[]) {
  return values.filter(Boolean).join(" ");
}

/**
 * Markdown tables, wrapped in their own scroll container.
 *
 * The wrapper is what scrolls — not the page — so a wide table never forces
 * horizontal scrolling on the document body.
 */
export function Table({
  className,
  ...props
}: HTMLAttributes<HTMLTableElement>) {
  return (
    <div className={styles.wrapper}>
      <table className={cx(styles.table, className)} {...props} />
    </div>
  );
}

export function Th(
  { className, ...props }: HTMLAttributes<HTMLTableCellElement>,
) {
  return <th className={cx(styles.th, className)} {...props} />;
}

export function Td(
  { className, ...props }: HTMLAttributes<HTMLTableCellElement>,
) {
  return <td className={cx(styles.td, className)} {...props} />;
}

export function Tr(
  { className, ...props }: HTMLAttributes<HTMLTableRowElement>,
) {
  return <tr className={cx(styles.tr, className)} {...props} />;
}
