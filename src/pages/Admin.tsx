import React, { useState } from "react";
import { useGame } from "../context/GameContext";
import { TimelineEvent, GameDocument } from "../types";
import {
  Plus,
  Trash2,
  Edit2,
  X,
  Check,
  Eye,
  EyeOff,
  FileText,
  Upload,
  Image as ImageIcon,
} from "lucide-react";
import { theme } from "../theme";
import { sharedStyles } from "../shared/styles";
import Section from "../components/Section";
import Modal from "../components/Modal";
import TimelineEventFormModal, {
  emptyTimelineEventDraft,
} from "../components/TimelineEventFormModal";

const emptyDocument = (): Omit<GameDocument, "id"> => ({
  title: "",
  description: "",
  fileUrl: "",
  fileType: "",
  imageUrl: "",
  relatedCharacterId: "",
  revealed: true,
});

export default function Admin() {
  const { game } = useGame();
  const victim = game.characters.find((c) => c.role === "victim");
  const victimNotesTitle = victim
    ? `${victim.name}s anteckningar`
    : "Offrets anteckningar";

  return (
    <div style={sharedStyles.pagePadded}>
      <div style={styles.header}>
        <h1 style={sharedStyles.h1Bold}>Adminpanel</h1>
      </div>

      <Section id="admin-tidslinje" title="Tidslinje">
        <TimelineAdmin />
      </Section>

      <Section id="admin-dokument" title="Förhörsdokument">
        <DocumentAdmin kind="document" />
      </Section>

      <Section id="admin-nyheter" title="Nyhetsartiklar">
        <DocumentAdmin kind="news" />
      </Section>

      <Section id="admin-anteckningar" title={victimNotesTitle}>
        <DocumentAdmin kind="victim-notes" />
      </Section>
    </div>
  );
}

function TimelineAdmin() {
  const {
    game,
    addTimelineEvent,
    updateTimelineEvent,
    removeTimelineEvent,
    setTimelineEventRevealed,
  } = useGame();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState(emptyTimelineEventDraft());

  const startCreate = () => {
    setDraft(emptyTimelineEventDraft());
    setCreating(true);
    setEditingId(null);
  };
  const startEdit = (e: TimelineEvent) => {
    setDraft({
      time: e.time,
      description: e.description,
      characterIds: e.characterIds,
      revealed: e.revealed,
    });
    setEditingId(e.id);
    setCreating(false);
  };
  const cancel = () => {
    setCreating(false);
    setEditingId(null);
  };
  const save = () => {
    if (!draft.time || draft.characterIds.length === 0) return;
    if (creating) addTimelineEvent(draft);
    else if (editingId) updateTimelineEvent({ ...draft, id: editingId });
    cancel();
  };

  const showForm = creating || editingId;
  const events = [...game.timelineEvents].sort((a, b) =>
    a.time.localeCompare(b.time),
  );
  const charById = new Map(game.characters.map((c) => [c.id, c]));

  return (
    <>
      <div style={{ ...sharedStyles.header, marginBottom: 12 }}>
        <button style={sharedStyles.btn} onClick={startCreate}>
          <Plus size={16} /> Lägg till händelse
        </button>
      </div>

      {events.length === 0 ? (
        <div style={sharedStyles.empty}>Inga händelser än.</div>
      ) : (
        <div style={sharedStyles.list}>
          {events.map((e) => (
            <div key={e.id} style={sharedStyles.card}>
              <div style={sharedStyles.cardTop}>
                <div style={{ ...sharedStyles.cardMeta, flexWrap: "wrap" }}>
                  <span style={sharedStyles.name}>{e.time}</span>
                  {!e.revealed && (
                    <span style={sharedStyles.hiddenTag}>
                      <EyeOff size={11} /> Dold
                    </span>
                  )}
                </div>
                <div style={sharedStyles.cardActions}>
                  <button
                    style={sharedStyles.iconBtn}
                    onClick={() => setTimelineEventRevealed(e.id, !e.revealed)}
                    title={
                      e.revealed ? "Dölj för spelarna" : "Visa för spelarna"
                    }
                  >
                    {e.revealed ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                  <button
                    style={sharedStyles.iconBtn}
                    onClick={() => startEdit(e)}
                  >
                    <Edit2 size={15} />
                  </button>
                  <button
                    style={{ ...sharedStyles.iconBtn, color: theme.primary }}
                    onClick={() => removeTimelineEvent(e.id)}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
              {e.description && (
                <p style={sharedStyles.descCompact}>{e.description}</p>
              )}
              {e.characterIds.length > 0 && (
                <div style={sharedStyles.tags}>
                  {e.characterIds.map((id) => (
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
        <TimelineEventFormModal
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

type DocumentAdminKind = "document" | "news" | "victim-notes";

function DocumentAdmin({ kind }: { kind: DocumentAdminKind }) {
  const {
    game,
    addDocument,
    updateDocument,
    removeDocument,
    setDocumentRevealed,
    addNewsArticle,
    updateNewsArticle,
    removeNewsArticle,
    setNewsArticleRevealed,
    addVictimNote,
    updateVictimNote,
    removeVictimNote,
    setVictimNoteRevealed,
  } = useGame();

  const byKind = {
    document: {
      add: addDocument,
      update: updateDocument,
      remove: removeDocument,
      setRevealed: setDocumentRevealed,
      items: game.documents,
    },
    news: {
      add: addNewsArticle,
      update: updateNewsArticle,
      remove: removeNewsArticle,
      setRevealed: setNewsArticleRevealed,
      items: game.newsArticles,
    },
    "victim-notes": {
      add: addVictimNote,
      update: updateVictimNote,
      remove: removeVictimNote,
      setRevealed: setVictimNoteRevealed,
      items: game.victimNotes,
    },
  } satisfies Record<
    DocumentAdminKind,
    {
      add: (d: Omit<GameDocument, "id">) => void;
      update: (d: GameDocument) => void;
      remove: (id: string) => void;
      setRevealed: (id: string, revealed: boolean) => void;
      items: GameDocument[];
    }
  >;

  const { add, update, remove, setRevealed, items } = byKind[kind];

  const [editing, setEditing] = useState<GameDocument | null>(null);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState(emptyDocument());
  const [viewing, setViewing] = useState<GameDocument | null>(null);

  const startCreate = () => {
    setDraft(emptyDocument());
    setCreating(true);
    setEditing(null);
  };
  const startEdit = (d: GameDocument) => {
    setEditing(d);
    setDraft(d);
    setCreating(false);
  };
  const cancel = () => {
    setEditing(null);
    setCreating(false);
  };
  const save = () => {
    if (!draft.title.trim() || !draft.fileUrl) return;
    if (creating) add(draft);
    else if (editing) update({ ...draft, id: editing.id });
    cancel();
  };
  const setField = (
    field: keyof Omit<GameDocument, "id">,
    value: string | boolean,
  ) => setDraft((d) => ({ ...d, [field]: value }));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setField("fileUrl", reader.result as string);
      setField("fileType", file.type);
    };
    reader.readAsDataURL(file);
  };
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setField("imageUrl", reader.result as string);
    reader.readAsDataURL(file);
  };

  const showForm = creating || editing;
  const relatedOptions = game.characters.filter(
    (c) => c.role === "suspect" || c.role === "witness",
  );
  const addLabel = {
    document: "Lägg till dokument",
    news: "Lägg till artikel",
    "victim-notes": "Lägg till anteckning",
  }[kind];
  const titleLabel = kind === "news" ? "Rubrik" : "Titel";
  const descLabel = kind === "news" ? "Ingress" : "Beskrivning";

  return (
    <>
      <div style={{ ...sharedStyles.header, marginBottom: 12 }}>
        <button style={sharedStyles.btn} onClick={startCreate}>
          <Plus size={16} /> {addLabel}
        </button>
      </div>

      {items.length === 0 ? (
        <div style={sharedStyles.empty}>Inget tillagt än.</div>
      ) : (
        <div style={sharedStyles.list}>
          {items.map((item) => (
            <div key={item.id} style={sharedStyles.card}>
              <div style={sharedStyles.cardTop}>
                <div style={{ ...sharedStyles.cardMeta, flexWrap: "wrap" }}>
                  <span style={sharedStyles.name}>{item.title}</span>
                  {!item.revealed && (
                    <span style={sharedStyles.hiddenTag}>
                      <EyeOff size={11} /> Dold
                    </span>
                  )}
                </div>
                <div
                  style={{ ...sharedStyles.cardActions, alignItems: "center" }}
                >
                  <button
                    style={sharedStyles.iconBtn}
                    onClick={() => setViewing(item)}
                    disabled={!item.fileUrl}
                    title="Visa"
                  >
                    <Eye size={15} />
                  </button>
                  <button
                    style={sharedStyles.iconBtn}
                    onClick={() => setRevealed(item.id, !item.revealed)}
                    title={
                      item.revealed ? "Dölj för spelarna" : "Visa för spelarna"
                    }
                  >
                    {item.revealed ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                  <button
                    style={sharedStyles.iconBtn}
                    onClick={() => startEdit(item)}
                  >
                    <Edit2 size={15} />
                  </button>
                  <button
                    style={{ ...sharedStyles.iconBtn, color: theme.primary }}
                    onClick={() => remove(item.id)}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
              {item.description && (
                <p style={sharedStyles.descCompact}>{item.description}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div style={sharedStyles.formCard}>
          <h2 style={sharedStyles.formTitle}>
            {creating
              ? `Nytt ${titleLabel.toLowerCase()}`
              : `Redigera: ${editing!.title}`}
          </h2>
          <div style={sharedStyles.formGridSingle}>
            <Field label={titleLabel} full>
              <input
                style={sharedStyles.input}
                value={draft.title}
                onChange={(e) => setField("title", e.target.value)}
              />
            </Field>
            <Field label={descLabel} full>
              <textarea
                style={sharedStyles.textarea}
                value={draft.description}
                onChange={(e) => setField("description", e.target.value)}
                rows={3}
              />
            </Field>
            {relatedOptions.length > 0 && (
              <Field label="Kopplad karaktär" full>
                <select
                  style={sharedStyles.input}
                  value={draft.relatedCharacterId ?? ""}
                  onChange={(e) =>
                    setField("relatedCharacterId", e.target.value)
                  }
                >
                  <option value="">Ingen</option>
                  {relatedOptions.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({theme.roleLabels[c.role] ?? c.role})
                    </option>
                  ))}
                </select>
              </Field>
            )}
            <Field label="Fil (PDF eller bild)" full>
              <div style={sharedStyles.fileRow}>
                {draft.fileUrl && (
                  <div style={styles.filePreview}>
                    {draft.fileType.startsWith("image/") ? (
                      <img
                        src={draft.fileUrl}
                        alt=""
                        style={sharedStyles.imgCover}
                      />
                    ) : (
                      <FileText size={28} color={theme.textFaint} />
                    )}
                  </div>
                )}
                <label style={sharedStyles.btnSecondary}>
                  <Upload size={14} /> Ladda upp
                  <input
                    type="file"
                    accept="application/pdf,image/*"
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                  />
                </label>
                {draft.fileUrl && (
                  <button
                    type="button"
                    style={sharedStyles.btnSecondary}
                    onClick={() => {
                      setField("fileUrl", "");
                      setField("fileType", "");
                    }}
                  >
                    <X size={15} /> Ta bort fil
                  </button>
                )}
              </div>
            </Field>
            <Field label="Relaterad bild" full>
              <div style={sharedStyles.fileRow}>
                <div style={styles.filePreview}>
                  {draft.imageUrl ? (
                    <img
                      src={draft.imageUrl}
                      alt=""
                      style={sharedStyles.imgCover}
                    />
                  ) : (
                    <ImageIcon size={28} color={theme.textFaint} />
                  )}
                </div>
                <label style={sharedStyles.btnSecondary}>
                  <Upload size={14} /> Ladda upp bild
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
                    <X size={15} /> Ta bort bild
                  </button>
                )}
              </div>
            </Field>
          </div>
          <label style={sharedStyles.revealedToggle}>
            <input
              type="checkbox"
              checked={draft.revealed}
              onChange={(e) => setField("revealed", e.target.checked)}
            />
            {draft.revealed ? (
              <Eye size={14} color={theme.accent} />
            ) : (
              <EyeOff size={14} color={theme.textMuted} />
            )}
            <span>Synligt för spelarna</span>
          </label>
          <div style={sharedStyles.formActions}>
            <button style={sharedStyles.btnSecondary} onClick={cancel}>
              <X size={15} /> Avbryt
            </button>
            <button style={sharedStyles.btn} onClick={save}>
              <Check size={15} /> Spara
            </button>
          </div>
        </div>
      )}

      {viewing && (
        <Modal onClose={() => setViewing(null)} maxWidth={900} maxHeight="90vh">
          <div style={sharedStyles.viewerHeader}>
            {viewing.imageUrl && (
              <img
                src={viewing.imageUrl}
                alt=""
                style={sharedStyles.viewerHeaderImg}
              />
            )}
            <div>
              <h2 style={sharedStyles.viewerTitle}>{viewing.title}</h2>
              {viewing.description && (
                <p style={sharedStyles.viewerDesc}>{viewing.description}</p>
              )}
            </div>
          </div>
          <div style={sharedStyles.viewerFrame}>
            {viewing.fileType.startsWith("image/") ? (
              <img
                src={viewing.fileUrl}
                alt={viewing.title}
                style={sharedStyles.viewerImg}
              />
            ) : (
              <iframe
                src={`${viewing.fileUrl}#zoom=100`}
                title={viewing.title}
                style={sharedStyles.viewerIframe}
              />
            )}
          </div>
        </Modal>
      )}
    </>
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

const styles: Record<string, React.CSSProperties> = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 28,
    paddingBottom: 4,
    borderBottom: `2px solid ${theme.textFaint}`,
  },
  filePreview: {
    width: 56,
    height: 56,
    borderRadius: 8,
    background: theme.inputBg,
    border: `1px solid ${theme.textFaint}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    flexShrink: 0,
  },
};
