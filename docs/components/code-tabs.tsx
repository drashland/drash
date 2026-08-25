"use client";

import {
  Children,
  isValidElement,
  type ReactNode,
  useEffect,
  useState,
} from "react";
import styles from "./code-tabs.module.css";

/**
 * A switchable code block whose tabs live in the block's header row, beside the
 * filename — the shape the homepage hero uses.
 *
 * Nextra's own `<Tabs>` renders its tablist as a sibling *above* the panels,
 * while the filename, icon, and copy button live inside each panel's
 * `.nextra-code`. Those are separate subtrees, so no amount of CSS moves the
 * tabs into that header. Rendering both here is what makes one bar possible.
 *
 * Write the fences **without** `filename` — pass the names through `files`
 * instead. A fence with `filename` draws Nextra's own header, which would sit
 * under this one as a second bar. A bare fence still gets Nextra's copy button,
 * floated over the top-right of the code.
 *
 * @example
 * ```mdx
 * <CodeTabs items={["Node", "Deno"]} files={["app.js", "app.ts"]}>
 * <CodeTab>
 * ```js
 * // ...
 * ```
 * </CodeTab>
 * <CodeTab>
 * ```ts
 * // ...
 * ```
 * </CodeTab>
 * </CodeTabs>
 * ```
 */
type CodeTabsProps = {
  /** Tab labels, in the order the panels are given. */
  items: string[];
  /**
   * Filename shown at the end of the bar, one per tab. Omit the prop, or use an
   * empty string for a tab, to show nothing there.
   */
  files?: string[];
  /**
   * Groups sharing a key switch together, and the choice survives a reload.
   *
   * This is the same protocol Nextra's `<Tabs storageKey>` uses — a
   * `localStorage` entry plus a synthetic `storage` event — so a `CodeTabs` and
   * a Nextra `Tabs` with the same key stay in step. The browser's native
   * `storage` event only fires in *other* tabs, which is why the write is
   * followed by an explicit dispatch.
   */
  storageKey?: string;
  children: ReactNode;
};

/**
 * One panel of a {@link CodeTabs}. Exported under its own name rather than as
 * `CodeTabs.Tab`: MDX resolves a dotted name by reading the property off the
 * component, and static properties do not survive the `"use client"` boundary —
 * the server sees a client reference, not the function.
 */
export function CodeTab({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function CodeTabs(
  { items, files, storageKey = "drash-runtime", children }: CodeTabsProps,
) {
  // Always first on the server. Reading storage during render would not match
  // what the server produced, so the stored choice is applied after mount.
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    if (!storageKey) return;

    const stored = Number(localStorage.getItem(storageKey));
    if (Number.isInteger(stored) && stored >= 0 && stored < items.length) {
      setSelected(stored);
    }

    const onStorage = (event: StorageEvent) => {
      if (event.key !== storageKey) return;
      const next = Number(event.newValue);
      if (Number.isInteger(next)) setSelected(next);
    };

    globalThis.addEventListener("storage", onStorage);
    return () => globalThis.removeEventListener("storage", onStorage);
  }, [storageKey, items.length]);

  const select = (index: number) => {
    if (!storageKey) {
      setSelected(index);
      return;
    }

    const newValue = String(index);
    localStorage.setItem(storageKey, newValue);
    // Reaches this group and every sibling listening on the same key.
    globalThis.dispatchEvent(
      new StorageEvent("storage", { key: storageKey, newValue }),
    );
  };

  const panels = Children.toArray(children).filter(isValidElement);
  const file = files?.[selected];

  return (
    <div className={styles.card}>
      <div className={styles.bar}>
        <div className={styles.tabs} role="tablist">
          {items.map((label, index) => (
            <button
              key={label}
              type="button"
              role="tab"
              aria-selected={index === selected}
              className={`${styles.tab} ${
                index === selected ? styles.tabActive : ""
              }`}
              onClick={() => select(index)}
            >
              {label}
            </button>
          ))}
        </div>

        {file
          ? (
            <span className={styles.file}>
              <svg
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                height="14"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeWidth="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2Z"
                />
              </svg>
              {file}
            </span>
          )
          : null}
      </div>

      <div className={styles.panel} role="tabpanel">
        {panels[selected]}
      </div>
    </div>
  );
}
