import React from "react";
import { Lightbulb, SkipForward } from "lucide-react";
import { theme } from "../theme";
import { sharedStyles } from "../shared/styles";
import { usePlayerSections } from "../context/PlayerSectionsContext";

function formatPenalty(seconds: number): string {
  const minutes = Math.round(seconds / 60);
  return minutes > 0 ? `+${minutes} min` : `+${seconds} s`;
}

// Shown at the bottom of each section. Help for a player who's stuck: first they can reveal the
// admin's hint, and if that doesn't help, skip the section. Both add time to
// their total (the amounts are set per section in the admin panel). A
// section without hint text goes straight to offering the skip.
export default function SectionHelp({
  sectionId,
  done,
}: {
  sectionId: string;
  done: boolean;
}) {
  const { sections, result, revealHint, skipSection } = usePlayerSections();
  const section = sections[sectionId];
  if (!section) return null;

  const finished = !!result;
  const canHint = section.hasHint && !section.hintUsed;
  const canSkip = !section.skipped && (section.hintUsed || !section.hasHint);

  const confirmHint = () => {
    if (
      window.confirm(
        `Visa ledtråd? Det lägger till ${formatPenalty(section.hintPenaltySeconds)} på din tid.`,
      )
    )
      revealHint(sectionId);
  };
  const confirmSkip = () => {
    if (
      window.confirm(
        `Hoppa över sektionen? Det lägger till ${formatPenalty(section.skipPenaltySeconds)} på din tid.`,
      )
    )
      skipSection(sectionId);
  };

  const showButtons = !done && !finished && (canHint || canSkip);
  if (!section.hintUsed && !section.skipped && !showButtons) return null;

  return (
    <div style={styles.wrap}>
      {section.hintUsed && section.hint && (
        <div style={styles.hintBox}>
          <span style={styles.hintIcon}>
            <Lightbulb size={12} color={theme.hintText} />
          </span>
          <span>{section.hint}</span>
        </div>
      )}
      {section.skipped && (
        <span style={styles.skippedTag}>
          <SkipForward size={12} /> Överhoppad (
          {formatPenalty(section.skipPenaltySeconds)})
        </span>
      )}
      {showButtons && (
        <div style={styles.buttons}>
          {canHint && (
            <button style={styles.btn} onClick={confirmHint}>
              <Lightbulb size={14} /> Visa ledtråd (
              {formatPenalty(section.hintPenaltySeconds)})
            </button>
          )}
          {canSkip && (
            <button style={styles.btn} onClick={confirmSkip}>
              <SkipForward size={14} /> Hoppa över (
              {formatPenalty(section.skipPenaltySeconds)})
            </button>
          )}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrap: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    marginTop: 12,
  },
  hintBox: {
    display: "flex",
    alignItems: "flex-start",
    gap: 8,
    background: theme.cardBg,
    border: `1px solid ${theme.textFaint}`,
    borderRadius: 12,
    padding: "10px 12px",
    fontSize: 14,
    color: theme.text,
    lineHeight: 1.5,
  },
  // Same look as the hint circle in SectionCheckCircle.
  hintIcon: {
    ...sharedStyles.pillCheckCircle,
    flexShrink: 0,
    background: theme.hint,
    borderColor: theme.hint,
  },
  skippedTag: {
    display: "inline-flex",
    alignSelf: "flex-end",
    alignItems: "center",
    gap: 4,
    background: theme.secondaryBg,
    color: theme.textMuted,
    padding: "3px 10px",
    borderRadius: 20,
    fontSize: 12,
  },
  // Bottom-right of the section, below the revealed hint.
  buttons: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 8,
    flexWrap: "wrap",
  },
  btn: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    background: theme.cardBg,
    color: theme.textFaint,
    border: `1px solid ${theme.textFaint}`,
    borderRadius: 20,
    padding: "5px 12px",
    fontSize: 13,
    fontWeight: 600,
    fontFamily: "inherit",
    cursor: "pointer",
  },
};
