import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGame } from "../context/GameContext";
import { ArrowLeft, User } from "lucide-react";
import { theme } from "../theme";
import { sharedStyles } from "../shared/styles";
import { fileSrc } from "../api/client";

export default function Compilation() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { game } = useGame();
  const character = game.characters.find((c) => c.id === id);

  if (!character) {
    return (
      <div style={sharedStyles.pagePadded}>
        <p>Karaktären hittades inte.</p>
        <button style={sharedStyles.detailBackBtn} onClick={() => navigate("/")}>
          <ArrowLeft size={15} /> Tillbaka
        </button>
      </div>
    );
  }

  return (
    <div style={sharedStyles.pagePadded}>
      <button style={sharedStyles.detailBackBtn} onClick={() => navigate("/")}>
        <ArrowLeft size={15} /> Tillbaka
      </button>

      <div style={sharedStyles.detailHeader}>
        <div style={sharedStyles.detailPhoto}>
          {character.imageUrl ? (
            <img
              src={fileSrc(character.imageUrl)}
              alt={character.name}
              style={sharedStyles.imgCover}
            />
          ) : (
            <User size={32} color={theme.textFaint} />
          )}
        </div>
        <h1 style={styles.h1}>Utredning: {character.name}</h1>
      </div>

      <div style={sharedStyles.detailCard}>
        <p style={styles.text}>
          Här kommer utredningens Utredda resultat för {character.name} att
          visas.
        </p>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  h1: { margin: 0, fontSize: 22, fontWeight: 700, color: theme.text },
  text: { margin: 0, fontSize: 14, color: theme.textMuted, lineHeight: 1.6 },
};
