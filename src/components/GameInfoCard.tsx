import React from "react";
import { InfoIcon } from "lucide-react";
import { theme } from "../theme";
import { useGame } from "../context/GameContext";
import { useGameTimer } from "../context/GameTimerContext";
import { styles as sharedStyles } from "../shared/styles";

// Shown next to the play button before the game has started, so the team has
// something to read while the page behind it is still blurred. Hidden once
// GameStartButton has been pressed.
export default function GameInfoCard() {
  const { game } = useGame();
  const { started } = useGameTimer();

  if (started) return null;

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <InfoIcon size={25} color={theme.textFaint} />
        <h2 style={sharedStyles.sectionTitle}>{game.title}</h2>
      </div>
      <p style={styles.text}>
        {game.description ||
          "Ett mordmysterium att lösa tillsammans. Utred karaktärerna, samla ledtrådar och bevis, och lägg pusslet innan ni pekar ut mördaren. Tryck på play när ni är redo att börja."}
      </p>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    background: theme.cardBg,
    border: `1px solid ${theme.textFaint}`,
    borderRadius: 14,
    padding: "16px 20px",
    marginBottom: 24,
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  text: {
    margin: 0,
    fontSize: 12.5,
    lineHeight: 1.5,
    color: theme.textMuted,
  },
};
