import React from "react";
import { Check, Lightbulb, SkipForward } from "lucide-react";
import { theme } from "../theme";
import { usePlayerSections } from "../context/PlayerSectionsContext";

// A section's status, used in each section header and in the Mördaren
// checklist. The first circle is plain completion: a green check once the
// section is actually done, whether or not the player took the hint or
// skipped it. When they did, a second circle to its right says which —
// a yellow lamp for a revealed hint, or a red skip icon (skip wins).
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

  return (
    <span style={{ ...styles.wrapper, ...wrapperStyle }}>
      <span style={{ ...baseStyle, ...(done ? doneStyle : {}) }} title={title}>
        {done && <Check size={iconSize} color={theme.primaryText} />}
      </span>
      {section?.skipped ? (
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
        section?.hintUsed && (
          <span
            style={{
              ...baseStyle,
              background: theme.hint,
              borderColor: theme.hint,
            }}
            title="Ledtråd visad"
          >
            <Lightbulb size={iconSize} color={theme.hintText} />
          </span>
        )
      )}
    </span>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
  },
};
