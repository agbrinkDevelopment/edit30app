import React from "react";
import { styles as sharedStyles } from "../shared/styles";

// A titled Overview section. When `locked` (the player has finished or
// skipped it), the content stays visible but can no longer be interacted
// with: a transparent overlay swallows all clicks, so nothing underneath can
// be changed. The status circles (.section-check) are raised above it — see
// the .section-locked rule in App.tsx.
export default function Section({
  id,
  title,
  style,
  locked = false,
  footer,
  children,
}: {
  id?: string;
  title: string;
  style?: React.CSSProperties;
  locked?: boolean;
  footer?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      style={{ ...sharedStyles.section, scrollMarginTop: 72, ...style }}
    >
      <h2 style={sharedStyles.sectionTitle}>{title}</h2>
      <div
        className={locked ? "section-locked" : undefined}
        style={styles.content}
        aria-disabled={locked || undefined}
      >
        {children}
        {locked && <div style={styles.lockOverlay} />}
      </div>
      {footer}
    </section>
  );
}

const styles: Record<string, React.CSSProperties> = {
  content: { position: "relative" },
  lockOverlay: {
    position: "absolute",
    inset: 0,
    zIndex: 1,
    // Same rounding as the section cards (sharedStyles.card).
    borderRadius: 14,
    margin: -4,
    cursor: "not-allowed",
  },
};
