import React from "react";
import { styles as sharedStyles } from "../shared/styles";

// A titled Overview section. When `locked` (the player has finished or
// skipped it), the content is blurred and can no longer be interacted with.
// `footer` (the hint/skip area) is rendered outside the blur so a revealed
// hint or the "Överhoppad" tag stays readable.
//
// The blur is an overlay with backdrop-filter rather than a filter on the
// content: a filter would blur every descendant, whereas this lets the
// status circles (.section-check) be raised above the overlay and stay sharp
// — see the .section-locked rule in App.tsx. The overlay also swallows all
// clicks, so nothing underneath can be changed.
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
    backdropFilter: "blur(1.5px)",
    WebkitBackdropFilter: "blur(1.5px)",
    cursor: "not-allowed",
  },
};
