import React, { useState } from "react";
import { Check, Edit2, Plus, Skull, Trash2 } from "lucide-react";
import { useGame } from "../context/GameContext";
import { PlayerClue } from "../types";
import { theme } from "../theme";
import { sharedStyles } from "../shared/styles";
import ClueFormModal, { emptyClueDraft } from "./ClueFormModal";

// The clues a player has personally reconstructed. Never fed the real clues
// table — only this player's own items, plus whether they match (computed
// server-side; see usePlayerClue / playerService).
export default function PlayerClueCard({
  items,
  solved,
  onAddItem,
  onUpdateItem,
  onRemoveItem,
}: {
  items: PlayerClue[];
  solved: boolean;
  onAddItem: (c: Omit<PlayerClue, "id">) => void;
  onUpdateItem: (c: PlayerClue) => void;
  onRemoveItem: (id: string) => void;
}) {
  const { game } = useGame();
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState(emptyClueDraft());

  const startCreate = () => {
    setDraft(emptyClueDraft());
    setCreating(true);
    setEditingId(null);
  };
  const startEdit = (item: PlayerClue) => {
    setDraft({
      title: item.title,
      description: item.description,
      location: item.location,
      relatedCharacterIds: item.relatedCharacterIds,
      isMacguffin: item.isMacguffin,
    });
    setEditingId(item.id);
    setCreating(false);
  };
  const cancel = () => {
    setCreating(false);
    setEditingId(null);
  };
  const save = () => {
    if (!draft.title.trim()) return;
    if (creating) onAddItem(draft);
    else if (editingId) onUpdateItem({ ...draft, id: editingId });
    cancel();
  };
  const showForm = creating || editingId;

  const charById = new Map(game.characters.map((c) => [c.id, c]));

  return (
    <>
      <div style={{ ...sharedStyles.pillHeaderBase, justifyContent: "flex-start" }}>
        <div
          style={styles.titleCheckBtn}
          title={
            solved
              ? "Dina ledtrådar stämmer med de riktiga"
              : "Dina ledtrådar stämmer inte än"
          }
        >
          <span
            style={{
              ...sharedStyles.pillCheckCircle,
              ...(solved ? sharedStyles.pillCheckCircleDone : {}),
            }}
          >
            {solved && <Check size={12} color={theme.primaryText} />}
          </span>
        </div>
        <div style={styles.headerSpacer} />
        <button style={styles.addBtn} onClick={startCreate}>
          <Plus size={15} /> Ledtråd
        </button>
      </div>

      {items.length === 0 ? (
        <div style={sharedStyles.empty}>
          Inga ledtrådar tillagda än. Lägg till vad du tror är ledtrådar i
          fallet.
        </div>
      ) : (
        <div style={sharedStyles.list}>
          {items.map((item) => (
            <div key={item.id} style={sharedStyles.card}>
              <div style={sharedStyles.cardTop}>
                <div style={{ ...sharedStyles.cardMeta, flexWrap: "wrap" }}>
                  <span style={sharedStyles.name}>{item.title}</span>
                  {item.location && (
                    <span style={sharedStyles.location}>{item.location}</span>
                  )}
                  {item.isMacguffin && (
                    <Skull size={14} color={theme.primary} />
                  )}
                </div>
                <div style={sharedStyles.cardActions}>
                  <button
                    style={sharedStyles.iconBtn}
                    onClick={() => startEdit(item)}
                    title="Redigera"
                  >
                    <Edit2 size={15} />
                  </button>
                  <button
                    style={{ ...sharedStyles.iconBtn, color: theme.primary }}
                    onClick={() => onRemoveItem(item.id)}
                    title="Ta bort"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
              {item.description && (
                <p style={sharedStyles.descCompact}>{item.description}</p>
              )}
              {item.relatedCharacterIds.length > 0 && (
                <div style={sharedStyles.tags}>
                  {item.relatedCharacterIds.map((id) => (
                    <span key={id} style={sharedStyles.tag}>
                      {charById.get(id)?.name ?? "Okänd"}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <ClueFormModal
          creating={creating}
          draft={draft}
          characters={game.characters}
          onChange={setDraft}
          onCancel={cancel}
          onSave={save}
        />
      )}
    </>
  );
}

const styles: Record<string, React.CSSProperties> = {
  headerSpacer: { flex: 1 },
  titleCheckBtn: {
    background: "none",
    border: "none",
    outline: "none",
    padding: 0,
  },
  addBtn: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    background: theme.textFaint,
    color: theme.primaryText,
    border: `1px solid ${theme.textFaint}`,
    borderRadius: 20,
    padding: "7px 16px",
    fontWeight: 700,
    fontSize: 13,
    cursor: "pointer",
  },
};
