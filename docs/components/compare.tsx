import type { ReactNode } from "react";
import styles from "./compare.module.css";

/**
 * Two code samples shown side by side for comparison.
 *
 * Collapses to a single column below 900px, where two columns of code stop
 * being readable.
 *
 * `CompareItem` is exported separately rather than hung off `Compare` as
 * `Compare.Item`. React Fast Refresh re-evaluates this module on every edit and
 * does not reliably carry static properties across, which leaves MDX resolving
 * `Compare.Item` to `undefined` and throwing "Element type is invalid" on save.
 * Nextra's own `Tabs.Tab` avoids this only because it lives in node_modules,
 * which Fast Refresh never touches.
 *
 * @example
 * <Compare>
 *   <CompareItem label="Express">
 *     ```js
 *     app.get("/", handler);
 *     ```
 *   </CompareItem>
 *   <CompareItem label="Drash">
 *     ```ts
 *     class MyResource extends Resource {}
 *     ```
 *   </CompareItem>
 * </Compare>
 */
export function Compare({ children }: { children: ReactNode }) {
  return <div className={styles.grid}>{children}</div>;
}

export function CompareItem(
  { label, children }: { label: string; children: ReactNode },
) {
  return (
    <div className={styles.item}>
      <div className={styles.label}>{label}</div>
      {children}
    </div>
  );
}
