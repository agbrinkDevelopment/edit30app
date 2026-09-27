import React from "react";
import { Check, Lightbulb, SkipForward } from "lucide-react";
import { theme } from "../theme";
import { usePlayerSections } from "../context/PlayerSectionsContext";

// A section's status, used in each section header and in the Mördaren
// checklist, as two circles that are always shown:
// - left: whether the hint was used — a yellow lamp, else empty;
// - right: how the section ended — a green check once it's actually done
//   (even if it was skipped first), a red skip icon if skipped and not done,
//   else empty.
export default function SectionCheckCircle({
  sectionId,
  done,
  baseStyle,
  doneStyle,
  iconSize,
  title,
  wrapperStyle,
}: {
  sectionId: string;
  done: boolean;
  baseStyle: React.CSSProperties;
  doneStyle: React.CSSProperties;
  iconSize: number;
  // Tooltip for the completion circle.
  title?: string;
  // For callers that position the circles (e.g. absolutely in a corner).
  wrapperStyle?: React.CSSProperties;
}) {
  const { sections } = usePlayerSections();
  const section = sections[sectionId];
  const hintUsed = !!section?.hintUsed;
  const skipped = !!section?.skipped;

  return (
    <span style={{ ...styles.wrapper, ...wrapperStyle }}>
      <span
        style={{
          ...baseStyle,
          ...(hintUsed
            ? { background: theme.hint, borderColor: theme.hint }
            : {}),
        }}
        title={hintUsed ? "Ledtråd visad" : "Ingen ledtråd använd"}
      >
        {hintUsed && <Lightbulb size={iconSize} color={theme.hintText} />}
      </span>
      {done ? (
        <span style={{ ...baseStyle, ...doneStyle }} title={title}>
          <Check size={iconSize} color={theme.primaryText} />
        </span>
      ) : skipped ? (
        <span
          style={{
            ...baseStyle,
            background: theme.skipped,
            borderColor: theme.skipped,
          }}
          title="Överhoppad"
        >
          <SkipForward size={iconSize} color={theme.primaryText} />
        </span>
      ) : (
        <span style={baseStyle} title={title} />
      )}
    </span>
  );
}

const styles: Record<string, React.CSSProperties> = {
  // Block-level flex, not inline-flex: an inline box sits on its parent's
  // text baseline, leaving a gap below that pushes the circles off-centre.
  wrapper: {
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
};
