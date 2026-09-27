import React, { useEffect, useState } from "react";
import { useGame } from "../context/GameContext";
import { Character, Clue, TimelineEvent, GameDocument } from "../types";
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
  Skull,
  User,
} from "lucide-react";
import { api, fileSrc } from "../api/client";
import { reportUploadError } from "../shared/helpers";
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

      <Section id="admin-karaktarer" title="Karaktärer">
        <CharacterAdmin />
      </Section>

      <Section id="admin-tidslinje" title="Tidslinje">
        <TimelineAdmin />
      </Section>

      <Section id="admin-ledtradar" title="Ledtrådar">
        <ClueAdmin />
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

const emptyCharacter = (): Omit<Character, "id"> => ({
  name: "",
  initials: "",
  role: "suspect",
  description: "",
  motive: "",
  alibi: "",
  secrets: "",
  isKiller: false,
  imageUrl: null,
});

function CharacterAdmin() {
  const {
    game,
    addCharacter,
    updateCharacter,
    removeCharacter,
    refreshCharacters,
  } = useGame();

  const [editing, setEditing] = useState<Character | null>(null);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState(emptyCharacter());

  // Admin edits characters directly, so start from the backend's current state.
  useEffect(() => {
    refreshCharacters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startCreate = () => {
    setDraft(emptyCharacter());
    setCreating(true);
    setEditing(null);
  };
  const startEdit = (c: Character) => {
    setDraft(c);
    setEditing(c);
    setCreating(false);
  };
  const cancel = () => {
    setEditing(null);
    setCreating(false);
  };
  const save = () => {
    if (!draft.name.trim()) return;
    // Only one killer: marking this one clears the flag on everyone else.
    if (draft.isKiller) {
      game.characters.forEach((c) => {
        if (c.isKiller && c.id !== editing?.id)
          updateCharacter({ ...c, isKiller: false });
      });
    }
    if (creating) addCharacter(draft);
    else if (editing) updateCharacter({ ...draft, id: editing.id });
    cancel();
  };
  const remove = (c: Character) => {
    if (window.confirm(`Ta bort ${c.name}?`)) removeCharacter(c.id);
  };

  const setField = <K extends keyof Omit<Character, "id">>(
    field: K,
    value: Omit<Character, "id">[K],
  ) => setDraft((d) => ({ ...d, [field]: value }));

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    api
      .uploadFile(file)
      .then(({ url }) => setField("imageUrl", url))
      .catch(reportUploadError);
  };

  const showForm = creating || editing;
  const characters = [...game.characters].sort(
    (a, b) => (theme.roleOrder[a.role] ?? 99) - (theme.roleOrder[b.role] ?? 99),
  );

  return (
    <>
      <div style={{ ...sharedStyles.header, marginBottom: 12 }}>
        <button style={sharedStyles.btn} onClick={startCreate}>
          <Plus size={16} /> Lägg till karaktär
        </button>
      </div>

      {characters.length === 0 ? (
        <div style={sharedStyles.empty}>Inga karaktärer än.</div>
      ) : (
        <div style={sharedStyles.list}>
          {characters.map((c) => (
            <div key={c.id} style={sharedStyles.card}>
              <div style={sharedStyles.cardTop}>
                <div style={{ ...sharedStyles.cardMeta, flexWrap: "wrap" }}>
                  <div style={styles.characterThumb}>
                    {c.imageUrl ? (
                      <img
                        src={fileSrc(c.imageUrl)}
                        alt=""
                        style={sharedStyles.imgCover}
                      />
                    ) : (
                      <User size={16} color={theme.textFaint} />
                    )}
                  </div>
                  <span style={sharedStyles.name}>{c.name}</span>
                  <span style={sharedStyles.tag}>
                    {theme.roleLabels[c.role] ?? c.role}
                  </span>
                  {c.isKiller && <Skull size={14} color={theme.primary} />}
                </div>
                <div style={sharedStyles.cardActions}>
                  <button
                    style={sharedStyles.iconBtn}
                    onClick={() => startEdit(c)}
                  >
                    <Edit2 size={15} />
                  </button>
                  <button
                    style={{ ...sharedStyles.iconBtn, color: theme.primary }}
                    onClick={() => remove(c)}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
              {c.description && (
                <p style={sharedStyles.descCompact}>{c.description}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div style={sharedStyles.formCard}>
          <h2 style={sharedStyles.formTitle}>
            {creating ? "Ny karaktär" : `Redigera: ${editing!.name}`}
          </h2>
          <div style={sharedStyles.formGrid}>
            <Field label="Bild" full>
              <div style={sharedStyles.fileRow}>
                <div style={styles.filePreview}>
                  {draft.imageUrl ? (
                    <img
                      src={fileSrc(draft.imageUrl)}
                      alt=""
                      style={sharedStyles.imgCover}
                    />
                  ) : (
                    <User size={28} color={theme.textFaint} />
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
                    onClick={() => setField("imageUrl", null)}
                  >
                    <X size={15} /> Ta bort bild
                  </button>
                )}
              </div>
            </Field>
            <Field label="Namn">
              <input
                style={sharedStyles.input}
                value={draft.name}
                onChange={(e) => setField("name", e.target.value)}
              />
            </Field>
            <Field label="Initialer">
              <input
                style={sharedStyles.input}
                value={draft.initials}
                onChange={(e) => setField("initials", e.target.value)}
                maxLength={4}
              />
            </Field>
            <Field label="Roll">
              <select
                style={sharedStyles.input}
                value={draft.role}
                onChange={(e) =>
                  setField("role", e.target.value as Character["role"])
                }
              >
                {Object.entries(theme.roleLabels).map(([role, label]) => (
                  <option key={role} value={role}>
                    {label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Beskrivning" full>
              <textarea
                style={sharedStyles.textarea}
                value={draft.description}
                onChange={(e) => setField("description", e.target.value)}
                rows={3}
              />
            </Field>
            <Field label="Motiv">
              <textarea
                style={sharedStyles.textarea}
                value={draft.motive}
                onChange={(e) => setField("motive", e.target.value)}
                rows={2}
              />
            </Field>
            <Field label="Alibi">
              <textarea
                style={sharedStyles.textarea}
                value={draft.alibi}
                onChange={(e) => setField("alibi", e.target.value)}
                rows={2}
              />
            </Field>
            <Field label="Hemligheter" full>
              <textarea
                style={sharedStyles.textarea}
                value={draft.secrets}
                onChange={(e) => setField("secrets", e.target.value)}
                rows={2}
              />
            </Field>
          </div>
          <label style={sharedStyles.revealedToggle}>
            <input
              type="checkbox"
              checked={draft.isKiller}
              onChange={(e) => setField("isKiller", e.target.checked)}
            />
            <Skull size={14} color={theme.primary} />
            <span>Den här karaktären är mördaren</span>
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
    </>
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

// A clue is an item (e.g. Fällkniven) and the one character it really
// belongs to — the answer players' drag-and-drop in the Ledtrådar card is
// checked against. Stored as the first entry of relatedCharacterIds.
const emptyClue = (): Omit<Clue, "id"> => ({
  title: "",
  description: "",
  location: "",
  revealedBy: "",
  relatedCharacterIds: [],
  isMacguffin: false,
  imageUrl: null,
});

function ClueAdmin() {
  const { game, addClue, updateClue, removeClue, refreshClues } = useGame();

  const [editing, setEditing] = useState<Clue | null>(null);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState(emptyClue());

  // Admin edits clues directly, so start from the backend's current state.
  useEffect(() => {
    refreshClues();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startCreate = () => {
    setDraft(emptyClue());
    setCreating(true);
    setEditing(null);
  };
  const startEdit = (c: Clue) => {
    setDraft(c);
    setEditing(c);
    setCreating(false);
  };
  const cancel = () => {
    setEditing(null);
    setCreating(false);
  };
  const save = () => {
    if (!draft.title.trim()) return;
    if (creating) addClue(draft);
    else if (editing) updateClue({ ...draft, id: editing.id });
    cancel();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    api
      .uploadFile(file)
      .then(({ url }) => setDraft((d) => ({ ...d, imageUrl: url })))
      .catch(reportUploadError);
  };

  const showForm = creating || editing;
  const charById = new Map(game.characters.map((c) => [c.id, c]));
  const ownerOptions = game.characters.filter(
    (c) => c.role === "suspect" || c.role === "detective",
  );

  return (
    <>
      <div style={{ ...sharedStyles.header, marginBottom: 12 }}>
        <button style={sharedStyles.btn} onClick={startCreate}>
          <Plus size={16} /> Lägg till ledtråd
        </button>
      </div>

      {game.clues.length === 0 ? (
        <div style={sharedStyles.empty}>Inga ledtrådar än.</div>
      ) : (
        <div style={sharedStyles.list}>
          {game.clues.map((clue) => {
            const ownerId = clue.relatedCharacterIds[0];
            return (
              <div key={clue.id} style={sharedStyles.card}>
                <div style={sharedStyles.cardTop}>
                  <div style={{ ...sharedStyles.cardMeta, flexWrap: "wrap" }}>
                    <div style={styles.clueThumb}>
                      {clue.imageUrl ? (
                        <img
                          src={fileSrc(clue.imageUrl)}
                          alt=""
                          style={sharedStyles.imgCover}
                        />
                      ) : (
                        <ImageIcon size={16} color={theme.textFaint} />
                      )}
                    </div>
                    <span style={sharedStyles.name}>{clue.title}</span>
                    <span style={sharedStyles.tag}>
                      {ownerId
                        ? charById.get(ownerId)?.name ?? "Okänd"
                        : "Ingen karaktär"}
                    </span>
                  </div>
                  <div style={sharedStyles.cardActions}>
                    <button
                      style={sharedStyles.iconBtn}
                      onClick={() => startEdit(clue)}
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      style={{ ...sharedStyles.iconBtn, color: theme.primary }}
                      onClick={() => removeClue(clue.id)}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
                {clue.description && (
                  <p style={sharedStyles.descCompact}>{clue.description}</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <div style={sharedStyles.formCard}>
          <h2 style={sharedStyles.formTitle}>
            {creating ? "Ny ledtråd" : `Redigera: ${editing!.title}`}
          </h2>
          <div style={sharedStyles.formGridSingle}>
            <Field label="Titel" full>
              <input
                style={sharedStyles.input}
                value={draft.title}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, title: e.target.value }))
                }
              />
            </Field>
            <Field label="Beskrivning" full>
              <textarea
                style={sharedStyles.textarea}
                value={draft.description}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, description: e.target.value }))
                }
                rows={3}
              />
            </Field>
            <Field label="Tillhör karaktär" full>
              <select
                style={sharedStyles.input}
                value={draft.relatedCharacterIds[0] ?? ""}
                onChange={(e) =>
                  setDraft((d) => ({
                    ...d,
                    relatedCharacterIds: e.target.value ? [e.target.value] : [],
                  }))
                }
              >
                <option value="">Ingen</option>
                {ownerOptions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({theme.roleLabels[c.role] ?? c.role})
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Bild" full>
              <div style={sharedStyles.fileRow}>
                <div style={styles.filePreview}>
                  {draft.imageUrl ? (
                    <img
                      src={fileSrc(draft.imageUrl)}
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
                    onClick={() => setDraft((d) => ({ ...d, imageUrl: null }))}
                  >
                    <X size={15} /> Ta bort bild
                  </button>
                )}
              </div>
            </Field>
          </div>
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
    // "Ingen" in the dropdown is an empty string; store it as no link.
    const doc = { ...draft, relatedCharacterId: draft.relatedCharacterId || null };
    if (creating) add(doc);
    else if (editing) update({ ...doc, id: editing.id });
    cancel();
  };
  const setField = (
    field: keyof Omit<GameDocument, "id">,
    value: string | boolean,
  ) => setDraft((d) => ({ ...d, [field]: value }));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    api
      .uploadFile(file)
      .then(({ url }) => {
        setField("fileUrl", url);
        setField("fileType", file.type);
      })
      .catch(reportUploadError);
  };
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    api
      .uploadFile(file)
      .then(({ url }) => setField("imageUrl", url))
      .catch(reportUploadError);
  };

  const showForm = creating || editing;
  // Förhörsdokument belong to someone who was questioned; news articles
  // and notes can mention anyone, and news usually isn't about anyone.
  const relatedOptions =
    kind === "document"
      ? game.characters.filter(
          (c) => c.role === "suspect" || c.role === "witness",
        )
      : game.characters;
  const relatedLabel =
    kind === "news" ? "Kopplad karaktär (valfritt)" : "Kopplad karaktär";
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
              <Field label={relatedLabel} full>
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
                        src={fileSrc(draft.fileUrl)}
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
                      src={fileSrc(draft.imageUrl)}
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
                src={fileSrc(viewing.imageUrl)}
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
                src={fileSrc(viewing.fileUrl)}
                alt={viewing.title}
                style={sharedStyles.viewerImg}
              />
            ) : (
              <iframe
                src={`${fileSrc(viewing.fileUrl)}#zoom=100`}
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
    borderBottom: `2px solid ${theme.cardBorder}`,
  },
  characterThumb: {
    width: 28,
    height: 28,
    borderRadius: "50%",
    background: theme.inputBg,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    flexShrink: 0,
  },
  clueThumb: {
    width: 28,
    height: 28,
    borderRadius: 6,
    background: theme.inputBg,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    flexShrink: 0,
  },
  filePreview: {
    width: 56,
    height: 56,
    borderRadius: 8,
    background: theme.inputBg,
    border: `1px solid ${theme.textMuted}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    flexShrink: 0,
  },
};
