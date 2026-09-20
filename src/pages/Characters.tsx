import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGame } from "../context/GameContext";
import { useAuth } from "../context/AuthContext";
import { Character } from "../types";
import {
  Plus,
  Trash2,
  Edit2,
  X,
  Check,
  Skull,
  User,
  Upload,
  Clock,
  ChevronRight,
} from "lucide-react";
import { theme } from "../theme";
import { sharedStyles } from "../shared/styles";
import Timeline from "../components/Timeline";

const emptyChar = (): Omit<Character, "id"> => ({
  name: "",
  initials: "",
  role: "suspect",
  description: "",
  motive: "",
  alibi: "",
  secrets: "",
  isKiller: false,
  imageUrl: "",
});

export default function Characters() {
  const navigate = useNavigate();
  const { game, addCharacter, updateCharacter, removeCharacter } = useGame();
  const { isAdmin } = useAuth();
  const [editing, setEditing] = useState<Character | null>(null);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState(emptyChar());

  const startCreate = () => {
    setDraft(emptyChar());
    setCreating(true);
    setEditing(null);
  };
  const startEdit = (c: Character) => {
    setEditing(c);
    setDraft(c);
    setCreating(false);
  };
  const cancel = () => {
    setEditing(null);
    setCreating(false);
  };

  const save = () => {
    if (!draft.name.trim()) return;
    if (creating) {
      if (draft.isKiller) {
        game.characters.forEach((c) => {
          if (c.isKiller) updateCharacter({ ...c, isKiller: false });
        });
      }
      addCharacter(draft);
    } else if (editing) {
      if (draft.isKiller) {
        game.characters.forEach((c) => {
          if (c.isKiller && c.id !== editing.id)
            updateCharacter({ ...c, isKiller: false });
        });
      }
      updateCharacter({ ...draft, id: editing.id });
    }
    cancel();
  };

  const setField = (
    field: keyof Omit<Character, "id">,
    value: string | boolean,
  ) => setDraft((d) => ({ ...d, [field]: value }));

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setField("imageUrl", reader.result as string);
    reader.readAsDataURL(file);
  };

  const showForm = isAdmin && (editing || creating);

  const sortedCharacters = [...game.characters].sort(
    (a, b) => (theme.roleOrder[a.role] ?? 99) - (theme.roleOrder[b.role] ?? 99),
  );

  return (
    <div style={styles.page}>
      <div style={{ ...sharedStyles.header, marginBottom: 12 }}>
        <h1 style={sharedStyles.h1}>Karaktärer</h1>
        {isAdmin && (
          <button style={sharedStyles.btn} onClick={startCreate}>
            <Plus size={16} /> Add Character
          </button>
        )}
      </div>

      {showForm && (
        <div style={sharedStyles.formCard}>
          <h2 style={sharedStyles.formTitle}>
            {creating ? "New Character" : `Edit: ${editing!.name}`}
          </h2>
          <div style={sharedStyles.formGrid}>
            <Field label="Photo" full>
              <div style={styles.photoRow}>
                <div style={styles.photoPreview}>
                  {draft.imageUrl ? (
                    <img src={draft.imageUrl} alt="" style={sharedStyles.imgCover} />
                  ) : (
                    <User size={28} color={theme.textFaint} />
                  )}
                </div>
                <label style={sharedStyles.btnSecondary}>
                  <Upload size={14} /> Upload
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: "none" }}
                  />
                </label>
                {draft.imageUrl && (
                  <button
                    type="button"
                    style={sharedStyles.btnSecondary}
                    onClick={() => setField("imageUrl", "")}
                  >
                    <X size={15} /> Remove
                  </button>
                )}
              </div>
            </Field>
            <Field label="Name">
              <input
                style={sharedStyles.input}
                value={draft.name}
                onChange={(e) => setField("name", e.target.value)}
                placeholder="Character name"
              />
            </Field>
            <Field label="Initials">
              <input
                style={sharedStyles.input}
                value={draft.initials}
                onChange={(e) => setField("initials", e.target.value)}
                placeholder="e.g. LB"
                maxLength={4}
              />
            </Field>
            <Field label="Role">
              <select
                style={sharedStyles.input}
                value={draft.role}
                onChange={(e) =>
                  setField("role", e.target.value as Character["role"])
                }
              >
                <option value="suspect">Misstänkt</option>
                <option value="victim">Offret</option>
                <option value="detective">Detektiv</option>
                <option value="witness">Vittne</option>
              </select>
            </Field>
            <Field label="Description" full>
              <textarea
                style={sharedStyles.textarea}
                value={draft.description}
                onChange={(e) => setField("description", e.target.value)}
                placeholder="Who is this person? Background, appearance, personality..."
                rows={3}
              />
            </Field>
            <Field label="Motive">
              <textarea
                style={sharedStyles.textarea}
                value={draft.motive}
                onChange={(e) => setField("motive", e.target.value)}
                placeholder="Why would they commit murder?"
                rows={2}
              />
            </Field>
            <Field label="Alibi">
              <textarea
                style={sharedStyles.textarea}
                value={draft.alibi}
                onChange={(e) => setField("alibi", e.target.value)}
                placeholder="Where were they when it happened?"
                rows={2}
              />
            </Field>
            <Field label="Secrets" full>
              <textarea
                style={sharedStyles.textarea}
                value={draft.secrets}
                onChange={(e) => setField("secrets", e.target.value)}
                placeholder="Hidden secrets only the game master knows..."
                rows={2}
              />
            </Field>
          </div>
          <label style={styles.killerToggle}>
            <input
              type="checkbox"
              checked={draft.isKiller}
              onChange={(e) => setField("isKiller", e.target.checked)}
            />
            <Skull size={14} color={theme.primary} />
            <span>This character is the killer</span>
          </label>
          <div style={sharedStyles.formActions}>
            <button style={sharedStyles.btnSecondary} onClick={cancel}>
              <X size={15} /> Cancel
            </button>
            <button style={sharedStyles.btn} onClick={save}>
              <Check size={15} /> Save
            </button>
          </div>
        </div>
      )}

      {game.characters.length === 0 && !showForm ? (
        <div style={sharedStyles.empty}>
          No characters yet. Add one to get started.
        </div>
      ) : (
        <div style={sharedStyles.list}>
          {sortedCharacters.map((c) => (
            <div key={c.id} style={styles.row}>
              <div style={styles.imageCard}>
                {c.imageUrl ? (
                  <img
                    src={c.imageUrl}
                    alt={c.name}
                    style={sharedStyles.imgCover}
                  />
                ) : (
                  <User size={28} color={theme.textFaint} />
                )}
              </div>
              <div
                className="character-card"
                style={{
                  ...sharedStyles.card,
                  flex: 1,
                  minWidth: 260,
                  cursor: "pointer",
                  transition: "box-shadow 0.15s",
                  borderLeft: `4px solid ${roleColor(c.role)}`,
                }}
                onClick={() => navigate(`/characters/${c.id}`)}
              >
                <div style={sharedStyles.cardTop}>
                  <div style={sharedStyles.cardMeta}>
                    <span style={sharedStyles.name}>{c.name}</span>
                    {isAdmin && c.isKiller && (
                      <Skull size={14} color={theme.primary} />
                    )}
                    <span
                      style={{ ...styles.badge, background: roleColor(c.role) }}
                    >
                      {theme.roleLabels[c.role] ?? c.role}
                    </span>
                  </div>
                  {isAdmin && (
                    <div style={sharedStyles.cardActions}>
                      <button
                        style={sharedStyles.iconBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          startEdit(c);
                        }}
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        style={{ ...sharedStyles.iconBtn, color: theme.primary }}
                        onClick={(e) => {
                          e.stopPropagation();
                          removeCharacter(c.id);
                        }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  )}
                </div>
                {c.description && <p style={sharedStyles.desc}>{c.description}</p>}
                <div style={styles.chips}>
                  {c.motive && <Chip label="Motive" value={c.motive} />}
                  {c.alibi && <Chip label="Alibi" value={c.alibi} />}
                </div>
                <div style={styles.timelineView}>
                  <div style={styles.timelineViewTitle}>
                    <Clock size={12} /> Tidslinje
                  </div>
                  <Timeline
                    events={game.timelineEvents.filter(
                      (e) =>
                        e.characterIds.includes(c.id) &&
                        (isAdmin || e.revealed),
                    )}
                    emptyText="Inga händelser tillagda än."
                  />
                </div>
                <div style={styles.investigateLabel}>
                  Utred <ChevronRight size={14} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .character-card:hover {
          box-shadow: 0 6px 18px rgba(0,0,0,0.12);
        }
      `}</style>
    </div>
  );
}

function Field({
  label,
  children,
  full,
}: {
  label: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <div style={{ gridColumn: full ? "1 / -1" : undefined }}>
      <label
        style={{
          display: "block",
          marginBottom: 6,
          fontSize: 12,
          color: theme.textMuted,
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: 0.5,
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

function Chip({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ fontSize: 12, color: theme.textMuted }}>
      <span style={{ color: theme.accent, fontWeight: 600 }}>{label}: </span>
      {value}
    </div>
  );
}

function roleColor(role: string) {
  return theme.roleColors[role] ?? theme.textFaint;
}

const styles: Record<string, React.CSSProperties> = {
  page: { maxWidth: 860, margin: "0 auto", padding: "32px 24px" },
  killerToggle: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    cursor: "pointer",
    color: theme.primary,
    fontSize: 14,
    marginBottom: 20,
  },
  photoRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
  },
  photoPreview: {
    width: 100,
    maxWidth: "100%",
    aspectRatio: "1 / 1",
    borderRadius: 8,
    background: theme.inputBg,
    border: `1px solid ${theme.inputBorder}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    flexShrink: 0,
  },
  row: { display: "flex", gap: 12, alignItems: "flex-start", flexWrap: "wrap" },
  imageCard: {
    width: 100,
    maxWidth: "100%",
    aspectRatio: "1 / 1",
    borderRadius: 10,
    background: theme.inputBg,
    border: `1px solid ${theme.cardBorder}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    flexShrink: 0,
  },
  badge: {
    fontSize: 11,
    padding: "2px 8px",
    borderRadius: 20,
    color: theme.primaryText,
    textTransform: "capitalize" as const,
  },
  chips: { display: "flex", flexDirection: "column", gap: 4 },
  timelineView: {
    marginTop: 12,
    paddingTop: 10,
    borderTop: `1px solid ${theme.divider}`,
    display: "flex",
    flexDirection: "column",
    gap: 5,
  },
  timelineViewTitle: {
    display: "flex",
    alignItems: "center",
    gap: 5,
    fontSize: 11,
    fontWeight: 700,
    color: theme.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  investigateLabel: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 4,
    marginTop: 12,
    color: theme.accent,
    fontWeight: 700,
    fontSize: 13,
  },
};
