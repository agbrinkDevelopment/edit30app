import React from "react";
import { Check, Skull, X } from "lucide-react";
import { Character } from "../types";
import { theme } from "../theme";
import { sharedStyles } from "../shared/styles";
import Modal from "./Modal";
import CharacterPill from "./CharacterPill";

export interface ClueDraft {
  title: string;
  description: string;
  location: string;
  relatedCharacterIds: string[];
  isMacguffin: boolean;
}

export const emptyClueDraft = (): ClueDraft => ({
  title: "",
  description: "",
  location: "",
  relatedCharacterIds: [],
  isMacguffin: false,
});

// Shared add/edit form for a clue. Used both from the admin panel (editing
// the real clues table) and directly from the player's own reconstruction,
// so both get the same fields.
export default function ClueFormModal({
  creating,
  draft,
  characters,
  onChange,
  onCancel,
  onSave,
}: {
  creating: boolean;
  draft: ClueDraft;
  characters: Character[];
  onChange: (updater: (d: ClueDraft) => ClueDraft) => void;
  onCancel: () => void;
  onSave: () => void;
}) {
  const toggleCharacter = (id: string) =>
    onChange((d) => ({
      ...d,
      relatedCharacterIds: d.relatedCharacterIds.includes(id)
        ? d.relatedCharacterIds.filter((x) => x !== id)
        : [...d.relatedCharacterIds, id],
    }));

  return (
    <Modal onClose={onCancel}>
      <h3 style={sharedStyles.formTitle}>
        {creating ? "Ny ledtråd" : "Redigera ledtråd"}
      </h3>
      <Field label="Titel">
        <input
          style={sharedStyles.input}
          value={draft.title}
          onChange={(e) => onChange((d) => ({ ...d, title: e.target.value }))}
          placeholder="Ledtrådens namn"
        />
      </Field>
      <Field label="Plats">
        <input
          style={sharedStyles.input}
          value={draft.location}
          onChange={(e) =>
            onChange((d) => ({ ...d, location: e.target.value }))
          }
          placeholder="Var finns ledtråden?"
        />
      </Field>
      <Field label="Beskrivning">
        <textarea
          style={{ ...sharedStyles.textarea, marginBottom: 0 }}
          value={draft.description}
          onChange={(e) =>
            onChange((d) => ({ ...d, description: e.target.value }))
          }
          placeholder="Vad avslöjar den här ledtråden?"
          rows={3}
        />
      </Field>
      <Field label="Kopplade karaktärer">
        <div style={styles.charPicker}>
          {characters.map((c) => (
            <CharacterPill
              key={c.id}
              character={c}
              selected={draft.relatedCharacterIds.includes(c.id)}
              onClick={() => toggleCharacter(c.id)}
            />
          ))}
        </div>
      </Field>
      <label style={styles.macguffinToggle}>
        <input
          type="checkbox"
          checked={draft.isMacguffin}
          onChange={(e) =>
            onChange((d) => ({ ...d, isMacguffin: e.target.checked }))
          }
        />
        <Skull size={14} color={theme.primary} />
        <span>Detta är fallets huvudledtråd (macguffin)</span>
      </label>
      <div style={sharedStyles.formActions}>
        <button style={sharedStyles.btnSecondary} onClick={onCancel}>
          <X size={15} /> Avbryt
        </button>
        <button style={sharedStyles.btn} onClick={onSave}>
          <Check size={15} /> Spara
        </button>
      </div>
    </Modal>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={styles.field}>
      <label style={styles.fieldLabel}>{label}</label>
      {children}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  field: { marginBottom: 12 },
  fieldLabel: {
    display: "block",
    marginBottom: 6,
    fontSize: 12,
    color: theme.textMuted,
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  charPicker: { display: "flex", flexWrap: "wrap", gap: 12 },
  macguffinToggle: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    cursor: "pointer",
    color: theme.primary,
    fontSize: 14,
    marginBottom: 16,
  },
};
