import type { ComponentProps } from "react";
import { Callout as NextraCallout } from "nextra/components";
import styles from "./callout.module.css";

type NextraCalloutProps = ComponentProps<typeof NextraCallout>;

type CalloutProps = Omit<NextraCalloutProps, "type"> & {
  /**
   * Nextra's types, plus `"gray"` — a monochromatic variant for asides that
   * should not compete with the surrounding copy.
   */
  type?: NextraCalloutProps["type"] | "gray";
};

/**
 * Nextra's callout, defaulted to smaller text and extended with a `"gray"`
 * type.
 *
 * `"gray"` renders its own element rather than delegating to Nextra. Nextra
 * puts `className` on its *inner* content div, so styling a box through it
 * would draw a second border inside Nextra's own, and its icon slot would
 * still reserve space with no icon in it.
 */
export function Callout(
  { className, emoji = null, type, ...props }: CalloutProps,
) {
  if (type === "gray") {
    return (
      <div
        className={[styles.callout, styles.gray, className]
          .filter(Boolean)
          .join(" ")}
        {...props}
      />
    );
  }

  return (
    <NextraCallout
      type={type}
      emoji={emoji}
      className={[styles.callout, className].filter(Boolean).join(" ")}
      {...props}
    />
  );
}
