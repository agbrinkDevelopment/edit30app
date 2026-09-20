import React from "react";
import { Clock, PlayCircle } from "lucide-react";
import { theme } from "../theme";
import { styles as sharedStyles } from "../shared/styles";
import { useGameTimer } from "../context/GameTimerContext";

function formatElapsed(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function GameStartButton() {
  const { started, elapsedSeconds, startGame } = useGameTimer();

  if (!started) {
    return (
      <button style={sharedStyles.gameStartBtn} onClick={startGame}>
        <PlayCircle size={21} />
      </button>
    );
  }

  return (
    <div style={sharedStyles.gameTimer}>
      <span style={sharedStyles.gameTimerValue}>
        {formatElapsed(elapsedSeconds)}
      </span>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {};
