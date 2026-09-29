import React, { useState } from "react";
import { styles as sharedStyles } from "../shared/styles";
import { useGame } from "../context/GameContext";
import {
  AlertTriangle,
  ArrowDown,
  ChevronDown,
  ChevronRight,
  HelpCircleIcon,
  Pointer,
  User,
} from "lucide-react";
import { formatElapsed, scrollToSection } from "../shared/helpers";
import { usePlayerSections } from "../context/PlayerSectionsContext";
import { theme } from "../theme";
import SectionCheckCircle from "./SectionCheckCircle";
import { fileSrc } from "../api/client";
import { useIsMobile } from "../hooks/useIsMobile";

// The checklist of sections plus the final killer guess. A section counts as
// complete when it's done or skipped. The first "Utvärdera" is final: it
// stops the timer and saves the guess, time and per-section outcome.
export default function KillerGuessCard({
  steps,
}: {
  steps: { id: string; label: string; done: boolean }[];
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { game } = useGame();
  const { sections, result, submitGuess } = usePlayerSections();
  const isMobile = useIsMobile();

  const suspects = game.characters.filter((c) => c.role === "suspect");

  const mysterySteps = steps.map((step) => ({
    ...step,
    skipped: !!sections[step.id]?.skipped,
  }));

  const [selectedId, setSelectedId] = useState("");
  // Once submitted, the saved guess is what's shown (also after a reload).
  const guessId = result?.guessedCharacterId ?? selectedId;
  const guessResult = result ? (result.correct ? "correct" : "wrong") : null;

  const killer = game.characters.find((c) => c.isKiller);
  const remainingSteps = mysterySteps.filter((s) => !s.done && !s.skipped);
  const allStepsDone = remainingSteps.length === 0;
  const canGuess = allStepsDone && !result && !submitting;
  const guessedChar = suspects.find((c) => c.id === guessId);

  const evaluate = () => {
    if (!guessId || !canGuess) return;
    setSubmitting(true);
    submitGuess(guessId)
      .then((saved) => {
        if (saved.correct) {
          window.confetti?.({
            particleCount: 240,
            spread: 120,
            startVelocity: 50,
            // Launched from mid-screen on desktop; from below the bottom
            // edge on mobile, where the card fills more of the screen.
            origin: { y: isMobile ? 1.2 : 0.6 },
            disableForReducedMotion: true,
          });
        }
      })
      .catch((err) =>
        window.alert(
          `Kunde inte spara din gissning: ${err instanceof Error ? err.message : String(err)}`,
        ),
      )
      .finally(() => setSubmitting(false));
  };

  return (
    <div className="killer-card" style={sharedStyles.killerCard}>
      <div
        className="killer-photo"
        style={{
          ...sharedStyles.killerPhotoWrap,
          ...(guessResult === "wrong" ? sharedStyles.killerPhotoWrapWrong : {}),
        }}
      >
        {guessResult === "correct" ? (
          killer?.imageUrl ? (
            <img
              src={fileSrc(killer.imageUrl)}
              alt={killer.name}
              style={sharedStyles.killerPhotoImg}
            />
          ) : (
            <User size={56} color={theme.textFaint} />
          )
        ) : guessResult === "wrong" ? (
          <AlertTriangle size={48} color="#ffffff" />
        ) : guessedChar ? (
          guessedChar.imageUrl ? (
            <img
              src={fileSrc(guessedChar.imageUrl)}
              alt={guessedChar.name}
              style={sharedStyles.killerPhotoImg}
            />
          ) : (
            <User size={56} color={theme.textFaint} />
          )
        ) : (
          <div style={styles.photoPlaceholder}>
            {/* Desktop only; hidden on mobile, where the text below takes
                its place (see .killer-photo-question in App.tsx). */}
            <HelpCircleIcon
              className="killer-photo-question"
              size={28}
              color={theme.textFaint}
            />
            {/* Mobile only (see .killer-photo-help in App.tsx), where the
                "Slutför eller hoppa över" line below is hidden instead. */}
            {remainingSteps.length > 0 && (
              <div className="killer-photo-help">
                <div style={styles.photoHelpRow}>
                  <p style={styles.photoHelp}>
                    Innan du kan lösa detta{" "}
                    <span style={styles.mysteryWord}>mordmysterium</span>{" "}
                    behöver du gå igenom:{" "}
                    {remainingSteps.map((s) => s.label).join(", ")}. Slutför
                    varje del eller hoppa över den – peka sedan ut mördaren.
                  </p>
                </div>
                {/* Nudges the player down to the sections; tapping it jumps
                    to the first one still left. */}
                <button
                  type="button"
                  className="scroll-down-arrow"
                  style={styles.scrollArrow}
                  onClick={() => scrollToSection(remainingSteps[0].id)}
                  aria-label="Scrolla ner"
                >
                  <ArrowDown size={22} color={theme.textFaint} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div style={sharedStyles.guessArea}>
        <div style={sharedStyles.checklist}>
          {mysterySteps.map((step) => (
            <div key={step.id} style={sharedStyles.checklistItem}>
              <div
                style={{
                  borderBottom: `1px solid ${theme.cardBorder}`,
                  paddingBottom: 2,
                  marginBottom: 8,
                }}
              >
                {step.label}
              </div>

              <div style={styles.stepRow}>
                <SectionCheckCircle
                  sectionId={step.id}
                  done={step.done}
                  baseStyle={sharedStyles.checkCircle}
                  doneStyle={sharedStyles.checkCircleDone}
                  iconSize={12}
                />
                <button
                  type="button"
                  style={styles.stepLink}
                  onClick={() => scrollToSection(step.id)}
                  title={`Gå till ${step.label}`}
                  aria-label={`Gå till ${step.label}`}
                >
                  <ChevronRight size={18} color={theme.textFaint} />
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="killer-guess-row" style={sharedStyles.guessRow}>
          <div
            style={{
              ...sharedStyles.guessDropdownWrap,
              opacity: canGuess ? 1 : 0.5,
            }}
            tabIndex={canGuess ? 0 : -1}
            onBlur={() => setDropdownOpen(false)}
          >
            <button
              type="button"
              style={{
                ...sharedStyles.guessDropdownTrigger,
                cursor: canGuess ? "pointer" : "not-allowed",
              }}
              disabled={!canGuess}
              onClick={() => setDropdownOpen((o) => !o)}
            >
              <span style={sharedStyles.guessDropdownAvatar}>
                {guessedChar?.imageUrl ? (
                  <img
                    src={fileSrc(guessedChar.imageUrl)}
                    alt={guessedChar.name}
                    style={sharedStyles.guessDropdownAvatarImg}
                  />
                ) : (
                  <User size={14} color={theme.textFaint} />
                )}
              </span>
              <span style={sharedStyles.guessDropdownLabel}>
                {guessedChar ? guessedChar.name : "Välj misstänkt..."}
              </span>
              <ChevronDown size={14} color={theme.textFaint} />
            </button>

            {dropdownOpen && (
              <div style={sharedStyles.guessDropdownList}>
                {suspects.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    className="guess-dropdown-option"
                    style={sharedStyles.guessDropdownOption}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      setSelectedId(c.id);
                      setDropdownOpen(false);
                    }}
                  >
                    <span style={sharedStyles.guessDropdownAvatar}>
                      {c.imageUrl ? (
                        <img
                          src={fileSrc(c.imageUrl)}
                          alt={c.name}
                          style={sharedStyles.guessDropdownAvatarImg}
                        />
                      ) : (
                        <User size={14} color={theme.textFaint} />
                      )}
                    </span>
                    {c.name}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            style={{
              ...sharedStyles.guessBtn,
              ...styles.guessBtnContent,
              opacity: canGuess && guessId ? 1 : 0.5,
              cursor: canGuess && guessId ? "pointer" : "not-allowed",
            }}
            disabled={!canGuess || !guessId}
            onClick={evaluate}
          >
            <Pointer size={16} />
            Peka ut
          </button>
        </div>
        <div className="killer-guess-msg" style={{ paddingBottom: 4 }}>
          {result && (
            <p
              style={{
                ...sharedStyles.guessResult,
                color: result.correct ? theme.success : theme.primary,
              }}
            >
              {result.correct
                ? "Rätt gissat! Du har löst mysteriet."
                : "Fel gissning – mysteriet förblev olöst."}{" "}
              Din tid: {formatElapsed(result.totalSeconds)}
              {result.penaltySeconds > 0 &&
                ` (varav ${formatElapsed(result.penaltySeconds)} tillägg)`}
            </p>
          )}
          {!result && !allStepsDone && (
            <p
              className="killer-remaining"
              style={{ ...sharedStyles.guessResult, color: theme.textMuted }}
            >
              Slutför eller hoppa över:{" "}
              {remainingSteps.map((s) => s.label).join(", ")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  photoPlaceholder: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 12,
    padding: 36,
    textAlign: "center",
  },
  scrollArrow: {
    marginTop: 18,
    width: 40,
    height: 40,
    borderRadius: "50%",
    border: `1px solid ${theme.textFaint}`,
    background: "transparent",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  // A checklist row's status circles on the left, its "go to" chevron on
  // the right.
  stepRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  stepLink: {
    background: "none",
    border: "none",
    padding: 4,
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
  },
  // Pointing hand next to the "Peka ut" label.
  guessBtnContent: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
  },
  // Same font and colour as the "Mordmysterium" logo in the navbar.
  mysteryWord: {
    fontFamily: theme.fontAccent,
    color: theme.primary,
    fontSize: 14,
    letterSpacing: 0.5,
  },
  photoHelpRow: {
    display: "flex",
    alignItems: "flex-start",
    gap: 8,
    textAlign: "center",
  },
  // Nudged down to line up with the first line of text.
  photoHelpIcon: { flexShrink: 0, marginTop: 2 },
  photoHelp: {
    margin: 0,
    fontSize: 14,
    lineHeight: 1.5,
    color: theme.textMuted,
  },
};
