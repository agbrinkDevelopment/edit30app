import React, { useState } from "react";
import { styles as sharedStyles } from "../shared/styles";
import { useGame } from "../context/GameContext";
import { AlertTriangle, ChevronDown, HelpCircleIcon, User } from "lucide-react";
import { formatElapsed } from "../shared/helpers";
import { usePlayerSections } from "../context/PlayerSectionsContext";
import { theme } from "../theme";
import SectionCheckCircle from "./SectionCheckCircle";
import { fileSrc } from "../api/client";

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
            startVelocity: 100,
            origin: { y: 0.6 },
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
    <div style={sharedStyles.killerCard}>
      <div
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
          <HelpCircleIcon size={28} color={theme.textFaint} />
        )}
      </div>

      <div style={sharedStyles.guessArea}>
        <div style={sharedStyles.checklist}>
          {mysterySteps.map((step) => (
            <div key={step.id} style={sharedStyles.checklistItem}>
              <SectionCheckCircle
                sectionId={step.id}
                done={step.done}
                baseStyle={sharedStyles.checkCircle}
                doneStyle={sharedStyles.checkCircleDone}
                iconSize={12}
              />
              {step.label}
            </div>
          ))}
        </div>
        <div style={sharedStyles.guessRow}>
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
              opacity: canGuess && guessId ? 1 : 0.5,
              cursor: canGuess && guessId ? "pointer" : "not-allowed",
            }}
            disabled={!canGuess || !guessId}
            onClick={evaluate}
          >
            Utvärdera
          </button>
        </div>
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
          <p style={{ ...sharedStyles.guessResult, color: theme.textMuted }}>
            Slutför eller hoppa över:{" "}
            {remainingSteps.map((s) => s.label).join(", ")}
          </p>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {};
