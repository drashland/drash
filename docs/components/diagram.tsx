"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import styles from "./diagram.module.css";

/**
 * A Mermaid diagram on a white card, with a button that opens it full screen.
 *
 * The card stays white in dark mode, so pin the diagram to Mermaid's light
 * theme with `%%{init: {"theme": "default"}}%%`. Otherwise Nextra draws the
 * dark-theme diagram, whose light lines and text vanish on white.
 *
 * @example
 * ```mdx
 * <Diagram>
 * ```mermaid
 * %%{init: {"theme": "default"}}%%
 * sequenceDiagram
 *   Client->>Server: Request
 * ```
 * </Diagram>
 * ```
 */
export function Diagram({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [canFullscreen, setCanFullscreen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // `document` only exists in the browser, and iPhone Safari has no Fullscreen
  // API at all, so the button appears only once we know it will work.
  useEffect(() => {
    setCanFullscreen(document.fullscreenEnabled);

    const onChange = () => {
      setIsFullscreen(document.fullscreenElement === ref.current);
    };

    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggle = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      ref.current?.requestFullscreen();
    }
  };

  return (
    <div ref={ref} className={styles.diagram}>
      {canFullscreen && (
        <button type="button" className={styles.button} onClick={toggle}>
          {isFullscreen ? "Exit full screen" : "Full screen"}
        </button>
      )}
      {children}
    </div>
  );
}
