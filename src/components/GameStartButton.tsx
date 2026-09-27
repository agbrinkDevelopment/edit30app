import React from "react";
import { Clock, PlayCircle } from "lucide-react";
import { theme } from "../theme";
import { styles as sharedStyles } from "../shared/styles";
import { useGameTimer } from "../context/GameTimerContext";
import { usePlayerSections } from "../context/PlayerSectionsContext";
import { formatElapsed } from "../shared/helpers";

export default function GameStartButton() {
  const { started, elapsedSeconds, startGame } = useGameTimer();
  const { penaltySeconds, result } = usePlayerSections();
  // Hints and skips add to the clock; after "Utvärdera" the saved total wins.
  const totalSeconds = result
    ? result.totalSeconds
    : elapsedSeconds + penaltySeconds;
  const penalty = result ? result.penaltySeconds : penaltySeconds;

  if (!started) {
    return (
      <button
        className="game-timer"
        style={sharedStyles.gameStartBtn}
        onClick={startGame}
      >
        <PlayCircle size={21} />
      </button>
    );
  }

  return (
    <div
      className="game-timer"
      style={sharedStyles.gameTimer}
      title={
        penalty > 0
          ? `Varav ${formatElapsed(penalty)} tillägg för ledtrådar och överhoppade sektioner`
          : undefined
      }
    >
      <span style={sharedStyles.gameTimerValue}>
        {formatElapsed(totalSeconds)}
      </span>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {};
