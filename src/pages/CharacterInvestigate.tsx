import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGame } from "../context/GameContext";
import { ArrowLeft, User, Check } from "lucide-react";
import { theme } from "../theme";
import { sharedStyles } from "../shared/styles";

const NOTES_KEY = "character-notes";

function loadNotes(): Record<string, string> {
  try {
    const saved = localStorage.getItem(NOTES_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

export default function CharacterInvestigate() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { game } = useGame();
  const character = game.characters.find((c) => c.id === id);

  const [notes, setNotes] = useState<Record<string, string>>(loadNotes);
  const [saved, setSaved] = useState(false);
  const value = (id && notes[id]) || "";

  const save = () => {
    if (!id) return;
    try {
      localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
    } catch {
      // ignore storage errors
    }
    setSaved(true);
  };

  if (!character) {
    return (
      <div style={sharedStyles.pagePadded}>
        <p>Karaktären hittades inte.</p>
        <button
          style={sharedStyles.detailBackBtn}
          onClick={() => navigate("/characters")}
        >
          <ArrowLeft size={15} /> Tillbaka
        </button>
      </div>
    );
  }

  return (
    <div style={sharedStyles.pagePadded}>
      <button
        style={sharedStyles.detailBackBtn}
        onClick={() => navigate("/characters")}
      >
        <ArrowLeft size={15} /> Tillbaka till karaktärer
      </button>

      <div style={sharedStyles.detailHeader}>
        <div style={sharedStyles.detailPhoto}>
          {character.imageUrl ? (
            <img
              src={character.imageUrl}
              alt={character.name}
              style={sharedStyles.imgCover}
            />
          ) : (
            <User size={32} color={theme.textFaint} />
          )}
        </div>
        <h1 style={styles.h1}>{character.name}</h1>
      </div>

      <div style={sharedStyles.detailCard}>
        <label style={styles.label}>Vad har du kommit fram till om {character.name}?</label>
        <p style={styles.hint}>
          Denna information är obligatorisk för att kunna lösa fallet.
        </p>
        <textarea
          style={styles.textarea}
          value={value}
          onChange={(e) => {
            if (!id) return;
            setNotes((n) => ({ ...n, [id]: e.target.value }));
            setSaved(false);
          }}
          placeholder="Skriv vad du vet eller misstänker..."
          rows={6}
        />
        <div style={styles.actions}>
          <button style={sharedStyles.btn} onClick={save}>
            <Check size={15} /> Spara
          </button>
          {saved && <span style={styles.savedTag}>Sparat!</span>}
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  h1: { margin: 0, fontSize: 24, fontWeight: 700, color: theme.text },
  label: {
    display: "block",
    fontSize: 14,
    fontWeight: 600,
    color: theme.text,
    marginBottom: 4,
  },
  hint: { fontSize: 12, color: theme.textMuted, margin: "0 0 12px" },
  textarea: {
    width: "100%",
    background: theme.inputBg,
    border: `1px solid ${theme.inputBorder}`,
    borderRadius: 7,
    color: theme.text,
    padding: "10px 12px",
    fontSize: 14,
    fontFamily: "inherit",
    resize: "vertical",
    boxSizing: "border-box",
    marginBottom: 14,
  },
  actions: { display: "flex", alignItems: "center", gap: 12 },
  savedTag: { fontSize: 13, color: theme.success, fontWeight: 600 },
};
