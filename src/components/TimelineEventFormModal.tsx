import React from "react";
import { Check, Eye, EyeOff, X } from "lucide-react";
import { Character } from "../types";
import { theme } from "../theme";
import { sharedStyles } from "../shared/styles";
import Modal from "./Modal";
import CharacterPill from "./CharacterPill";

export interface TimelineEventDraft {
  time: string;
  description: string;
  characterIds: string[];
  revealed: boolean;
}

export const emptyTimelineEventDraft = (): TimelineEventDraft => ({
  time: "",
  description: "",
  characterIds: [],
  revealed: true,
});

// Shared add/edit form for a timeline event. Used both from the admin panel
// and directly from CaseTimeline, so anyone adding an event gets the same
// fields: time, description, which characters it involves, and whether it's
// revealed to players.
export default function TimelineEventFormModal({
  creating,
  draft,
  characters,
  onChange,
  onCancel,
  onSave,
  showRevealedToggle = true,
}: {
  creating: boolean;
  draft: TimelineEventDraft;
  characters: Character[];
  onChange: (updater: (d: TimelineEventDraft) => TimelineEventDraft) => void;
  onCancel: () => void;
  onSave: () => void;
  // The admin panel edits the real timeline_events, where "revealed" governs
  // what players can see. A player's own reconstruction has no such concept.
  showRevealedToggle?: boolean;
}) {
  const toggleCharacter = (id: string) =>
    onChange((d) => ({
      ...d,
      characterIds: d.characterIds.includes(id)
        ? d.characterIds.filter((x) => x !== id)
        : [...d.characterIds, id],
    }));

  return (
    <Modal onClose={onCancel}>
      <h3 style={sharedStyles.formTitle}>
        {creating ? "Ny händelse" : "Redigera händelse"}
      </h3>
      <div style={styles.formRow}>
        <input
          type="time"
          style={sharedStyles.input}
          value={draft.time}
          onChange={(e) => onChange((d) => ({ ...d, time: e.target.value }))}
        />
      </div>
      <textarea
        style={{ ...sharedStyles.textarea, marginBottom: 10 }}
        value={draft.description}
        onChange={(e) =>
          onChange((d) => ({ ...d, description: e.target.value }))
        }
        placeholder="Vad händer vid den här tidpunkten?"
        rows={4}
      />
      <div style={styles.charPicker}>
        {characters.map((c) => (
          <CharacterPill
            key={c.id}
            character={c}
            selected={draft.characterIds.includes(c.id)}
            onClick={() => toggleCharacter(c.id)}
          />
        ))}
      </div>
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

const styles: Record<string, React.CSSProperties> = {
  formRow: { display: "flex", alignItems: "center", gap: 16, marginBottom: 10 },
  charPicker: { display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 14 },
};
