import React, { useState } from "react";
import { styles as sharedStyles } from "../shared/styles";
import { useGame } from "../context/GameContext";
import {
  AlertTriangle,
  Check,
  ChevronDown,
  HelpCircleIcon,
  User,
} from "lucide-react";
import { isCharacterInvestigated, loadProgress } from "../shared/helpers";
import { PROGRESS_KEY } from "../shared/data";
import { theme } from "../theme";
import { useGameTimer } from "../context/GameTimerContext";
import { fileSrc } from "../api/client";

export default function KillerGuessCard({
  tidslinjeSolved,
  ledtradarSolved,
}: {
  tidslinjeSolved: boolean;
  ledtradarSolved: boolean;
}) {
  const [guessResult, setGuessResult] = useState<"correct" | "wrong" | null>(
    null,
  );
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { game } = useGame();
  const { stopTimer } = useGameTimer();

  const [progress] = useState<Record<string, boolean>>(
    loadProgress(PROGRESS_KEY),
  );

  const victim = game.characters.find((c) => c.role === "victim");
  const detective = game.characters.find((c) => c.role === "detective");
  const suspects = game.characters.filter((c) => c.role === "suspect");
  const witnesses = game.characters.filter((c) => c.role === "witness");

  const mysterySteps = [
    { id: "kartan", label: "Kartan", done: !!progress["kartan"] },
    { id: "tidslinje", label: "Tidslinjen", done: tidslinjeSolved },
    { id: "ledtradar", label: "Ledtrådar", done: ledtradarSolved },
    {
      id: "detektiven",
      label: "Detektiven",
      done: !detective || isCharacterInvestigated(detective.id, progress),
    },
    {
      id: "offret",
      label: "Offret",
      done: !victim || isCharacterInvestigated(victim.id, progress),
    },
    {
      id: "de-misstankta",
      label: "De misstänkta",
      done:
        suspects.length === 0 ||
        suspects.every((c) => isCharacterInvestigated(c.id, progress)),
    },
    {
      id: "vittnen",
      label: "Vittnen",
      done:
        witnesses.length === 0 ||
        witnesses.every((c) => isCharacterInvestigated(c.id, progress)),
    },
  ];

  const [guessId, setGuessId] = useState("");

  const killer = game.characters.find((c) => c.isKiller);
  const allStepsDone = mysterySteps.every((s) => s.done);
  const guessedChar = suspects.find((c) => c.id === guessId);

  const submitGuess = () => {
    stopTimer();
    const guessed = game.characters.find((c) => c.id === guessId);
    if (!guessed) return;
    const correct = guessed.isKiller;
    setGuessResult(correct ? "correct" : "wrong");
    if (correct) {
      window.confetti?.({
        particleCount: 240,
        spread: 120,
        startVelocity: 100,
        origin: { y: 0.4 },
        disableForReducedMotion: true,
      });
    }
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
              <span
                style={{
                  ...sharedStyles.checkCircle,
                  ...(step.done ? sharedStyles.checkCircleDone : {}),
                }}
              >
                {step.done && <Check size={12} color={theme.primaryText} />}
              </span>
              {step.label}
            </div>
          ))}
        </div>
        <div style={sharedStyles.guessRow}>
          <div
            style={{
              ...sharedStyles.guessDropdownWrap,
              opacity: allStepsDone ? 1 : 0.5,
            }}
            tabIndex={allStepsDone ? 0 : -1}
            onBlur={() => setDropdownOpen(false)}
          >
            <button
              type="button"
              style={{
                ...sharedStyles.guessDropdownTrigger,
                cursor: allStepsDone ? "pointer" : "not-allowed",
              }}
              disabled={!allStepsDone}
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
                      setGuessId(c.id);
                      setGuessResult(null);
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
              opacity: allStepsDone && guessId ? 1 : 0.5,
              cursor: allStepsDone && guessId ? "pointer" : "not-allowed",
            }}
            disabled={!allStepsDone || !guessId}
            onClick={submitGuess}
          >
            Utvärdera
          </button>
          {guessResult && (
            <p
              style={{
                ...sharedStyles.guessResult,
                color:
                  guessResult === "correct" ? theme.success : theme.primary,
              }}
            >
              {guessResult === "correct"
                ? "Rätt gissat! Du har löst mysteriet."
                : "Fel gissning – tänk om och försök igen."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {};
