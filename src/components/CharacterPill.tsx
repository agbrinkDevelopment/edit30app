import React from "react";
import { User } from "lucide-react";
import { theme } from "../theme";
import { Character } from "../types";
import { sharedStyles } from "../shared/styles";

interface Props {
  character: Character;
  selected: boolean;
  onClick: () => void;
}

export default function CharacterPill({ character, selected, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        ...styles.pill,
        ...(selected ? styles.pillSelected : {}),
      }}
    >
      <span style={styles.avatar}>
        {character.imageUrl ? (
          <img
            src={character.imageUrl}
            alt={character.name}
            style={sharedStyles.imgCover}
          />
        ) : (
          <User size={14} color={theme.textFaint} />
        )}
      </span>
      {character.name}
    </button>
  );
}

const styles: Record<string, React.CSSProperties> = {
  pill: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: theme.inputBg,
    border: 0,
    borderRadius: 20,
    padding: "4px 14px 4px 4px",
    color: theme.text,
    fontFamily: "inherit",
    fontWeight: 600,
    fontSize: 14,
    cursor: "pointer",
  },
  pillSelected: {
    background: theme.accentBg,
    color: theme.accent,
  },
  avatar: {
    width: 26,
    height: 26,
    borderRadius: "50%",
    background: theme.cardBg,
    border: `1px solid ${theme.inputBorder}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    flexShrink: 0,
  },
};
