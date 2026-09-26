import React from "react";
import { Check, Eye, EyeOff, X } from "lucide-react";
import { Character } from "../types";
import { theme } from "../theme";
import { sharedStyles } from "../shared/styles";
import Modal from "./Modal";
import CharacterPill from "./CharacterPill";

export interface EvidenceDraft {
  title: string;
  description: string;
  foundAt: string;
  relatedCharacterIds: string[];
  revealed: boolean;
}

export const emptyEvidenceDraft = (): EvidenceDraft => ({
  title: "",
  description: "",
  foundAt: "",
  relatedCharacterIds: [],
  revealed: true,
});

// Shared add/edit form for a piece of evidence. Used both from the admin
// panel (editing the real evidence table) and directly from the player's own
// reconstruction, so both get the same fields.
export default function EvidenceFormModal({
  creating,
  draft,
  characters,
  onChange,
  onCancel,
  onSave,
  showRevealedToggle = true,
}: {
  creating: boolean;
  draft: EvidenceDraft;
  characters: Character[];
  onChange: (updater: (d: EvidenceDraft) => EvidenceDraft) => void;
  onCancel: () => void;
  onSave: () => void;
  // The admin panel edits the real evidence table, where "revealed" governs
  // what players can see. A player's own reconstruction has no such concept.
  showRevealedToggle?: boolean;
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
        {creating ? "Nytt bevis" : "Redigera bevis"}
      </h3>
      <Field label="Titel">
        <input
          style={sharedStyles.input}
          value={draft.title}
          onChange={(e) => onChange((d) => ({ ...d, title: e.target.value }))}
          placeholder="Bevisets namn"
        />
      </Field>
      <Field label="Hittades">
        <input
          style={sharedStyles.input}
          value={draft.foundAt}
          onChange={(e) =>
            onChange((d) => ({ ...d, foundAt: e.target.value }))
          }
          placeholder="Var hittades beviset?"
        />
      </Field>
      <Field label="Beskrivning">
        <textarea
          style={{ ...sharedStyles.textarea, marginBottom: 0 }}
          value={draft.description}
          onChange={(e) =>
            onChange((d) => ({ ...d, description: e.target.value }))
          }
          placeholder="Vad är detta bevis och vad avslöjar det?"
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
      {showRevealedToggle && (
        <label style={sharedStyles.revealedToggle}>
          <input
            type="checkbox"
            checked={draft.revealed}
            onChange={(e) =>
              onChange((d) => ({ ...d, revealed: e.target.checked }))
            }
          />
          {draft.revealed ? (
            <Eye size={14} color={theme.accent} />
          ) : (
            <EyeOff size={14} color={theme.textMuted} />
          )}
          <span>Synligt för spelarna</span>
        </label>
      )}
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
};
