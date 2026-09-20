import React, { useState } from "react";
import { useGame } from "../context/GameContext";
import { useAuth } from "../context/AuthContext";
import { EvidenceType, GameDocument } from "../types";
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
import Modal from "../components/Modal";
import { docTabColor } from "../shared/helpers";

const emptyEvidence = (): Omit<EvidenceType, "id"> => ({
  title: "",
  description: "",
  foundAt: "",
  relatedCharacterIds: [],
  revealed: true,
});

const emptyDocument = (): Omit<GameDocument, "id"> => ({
  title: "",
  description: "",
  fileUrl: "",
  fileType: "",
  imageUrl: "",
  relatedCharacterId: "",
  revealed: true,
});

export default function Evidence() {
  const {
    game,
    addEvidence,
    updateEvidence,
    removeEvidence,
    setEvidenceRevealed,
    addDocument,
    updateDocument,
    removeDocument,
    setDocumentRevealed,
    addNewsArticle,
    updateNewsArticle,
    removeNewsArticle,
    setNewsArticleRevealed,
  } = useGame();
  const { isAdmin } = useAuth();

  const [editing, setEditing] = useState<EvidenceType | null>(null);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState(emptyEvidence());

  const [editingDoc, setEditingDoc] = useState<GameDocument | null>(null);
  const [creatingDoc, setCreatingDoc] = useState(false);
  const [docDraft, setDocDraft] = useState(emptyDocument());
  const [viewing, setViewing] = useState<GameDocument | null>(null);

  const [editingNews, setEditingNews] = useState<GameDocument | null>(null);
  const [creatingNews, setCreatingNews] = useState(false);
  const [newsDraft, setNewsDraft] = useState(emptyDocument());

  const startCreate = () => {
    setDraft(emptyEvidence());
    setCreating(true);
    setEditing(null);
  };
  const startEdit = (e: EvidenceType) => {
    setEditing(e);
    setDraft(e);
    setCreating(false);
  };
  const cancel = () => {
    setEditing(null);
    setCreating(false);
  };

  const save = () => {
    if (!draft.title.trim()) return;
    if (creating) addEvidence(draft);
    else if (editing) updateEvidence({ ...draft, id: editing.id });
    cancel();
  };

  const setField = (field: keyof Omit<EvidenceType, "id">, value: any) =>
    setDraft((d) => ({ ...d, [field]: value }));

  const toggleCharacter = (id: string) => {
    const ids = draft.relatedCharacterIds.includes(id)
      ? draft.relatedCharacterIds.filter((x) => x !== id)
      : [...draft.relatedCharacterIds, id];
    setField("relatedCharacterIds", ids);
  };

  const showForm = isAdmin && (editing || creating);
  const visibleEvidence = game.evidence.filter((e) => isAdmin || e.revealed);

  const startCreateDoc = () => {
    setDocDraft(emptyDocument());
    setCreatingDoc(true);
    setEditingDoc(null);
  };
  const startEditDoc = (d: GameDocument) => {
    setEditingDoc(d);
    setDocDraft(d);
    setCreatingDoc(false);
  };
  const cancelDoc = () => {
    setEditingDoc(null);
    setCreatingDoc(false);
  };

  const saveDoc = () => {
    if (!docDraft.title.trim() || !docDraft.fileUrl) return;
    if (creatingDoc) addDocument(docDraft);
    else if (editingDoc) updateDocument({ ...docDraft, id: editingDoc.id });
    cancelDoc();
  };

  const setDocField = (field: keyof Omit<GameDocument, "id">, value: any) =>
    setDocDraft((d) => ({ ...d, [field]: value }));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setDocField("fileUrl", reader.result as string);
      setDocField("fileType", file.type);
    };
    reader.readAsDataURL(file);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setDocField("imageUrl", reader.result as string);
    reader.readAsDataURL(file);
  };

  const showDocForm = isAdmin && (editingDoc || creatingDoc);
  const visibleDocuments = game.documents.filter((d) => isAdmin || d.revealed);

  const startCreateNews = () => {
    setNewsDraft(emptyDocument());
    setCreatingNews(true);
    setEditingNews(null);
  };
  const startEditNews = (d: GameDocument) => {
    setEditingNews(d);
    setNewsDraft(d);
    setCreatingNews(false);
  };
  const cancelNews = () => {
    setEditingNews(null);
    setCreatingNews(false);
  };

  const saveNews = () => {
    if (!newsDraft.title.trim() || !newsDraft.fileUrl) return;
    if (creatingNews) addNewsArticle(newsDraft);
    else if (editingNews)
      updateNewsArticle({ ...newsDraft, id: editingNews.id });
    cancelNews();
  };

  const setNewsField = (field: keyof Omit<GameDocument, "id">, value: any) =>
    setNewsDraft((d) => ({ ...d, [field]: value }));

  const handleNewsFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setNewsField("fileUrl", reader.result as string);
      setNewsField("fileType", file.type);
    };
    reader.readAsDataURL(file);
  };

  const handleNewsImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setNewsField("imageUrl", reader.result as string);
    reader.readAsDataURL(file);
  };

  const showNewsForm = isAdmin && (editingNews || creatingNews);
  const visibleNewsArticles = game.newsArticles.filter(
    (d) => isAdmin || d.revealed,
  );

  return (
    <div style={sharedStyles.pagePadded}>
      {false && (
        <>
          <div style={sharedStyles.header}>
            <h1 style={sharedStyles.h1}>Materiell</h1>
            <button style={{ ...sharedStyles.btn, justifyContent: "flex-end" }} onClick={startCreate}>
              <Plus size={16} /> Lägg till bevis
            </button>
          </div>

          {showForm && (
            <div style={sharedStyles.formCard}>
              <h2 style={sharedStyles.formTitle}>
                {creating ? "Nytt bevis" : `Redigera: ${editing!.title}`}
              </h2>
              <div style={sharedStyles.formGrid}>
                <Field label="Titel">
                  <input
                    style={sharedStyles.input}
                    value={draft.title}
                    onChange={(e) => setField("title", e.target.value)}
                    placeholder="Bevisets namn"
                  />
                </Field>
                <Field label="Hittades">
                  <input
                    style={sharedStyles.input}
                    value={draft.foundAt}
                    onChange={(e) => setField("foundAt", e.target.value)}
                    placeholder="Var hittades beviset?"
                  />
                </Field>
                <Field label="Beskrivning" full>
                  <textarea
                    style={sharedStyles.textarea}
                    value={draft.description}
                    onChange={(e) => setField("description", e.target.value)}
                    placeholder="Vad är detta bevis och vad avslöjar det?"
                    rows={3}
                  />
                </Field>
                {game.characters.length > 0 && (
                  <Field label="Kopplade karaktärer" full>
                    <div style={sharedStyles.checkboxGroup}>
                      {game.characters.map((c) => (
                        <label key={c.id} style={sharedStyles.checkLabel}>
                          <input
                            type="checkbox"
                            checked={draft.relatedCharacterIds.includes(c.id)}
                            onChange={() => toggleCharacter(c.id)}
                          />
                          {c.name}
                        </label>
                      ))}
                    </div>
                  </Field>
                )}
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
                <button style={{ ...sharedStyles.btnSecondary, justifyContent: "flex-end" }} onClick={cancel}>
                  <X size={15} /> Avbryt
                </button>
                <button style={{ ...sharedStyles.btn, justifyContent: "flex-end" }} onClick={save}>
                  <Check size={15} /> Spara
                </button>
              </div>
            </div>
          )}

          {visibleEvidence.length === 0 && !showForm ? (
            <div style={sharedStyles.empty}>Inga bevis än.</div>
          ) : (
            <div style={sharedStyles.list}>
              {visibleEvidence.map((item) => {
                const related = game.characters.filter((c) =>
                  item.relatedCharacterIds.includes(c.id),
                );
                const isHidden = !item.revealed;
                return (
                  <div
                    key={item.id}
                    style={{
                      ...styles.card,
                      opacity: isHidden ? 0.6 : 1,
                      borderLeft: `4px solid ${isHidden ? theme.textFaint : theme.accent}`,
                    }}
                  >
                    <div style={{ ...sharedStyles.cardTop, marginBottom: 0 }}>
                      <div style={{ ...sharedStyles.cardMeta, flexWrap: "wrap" }}>
                        <span style={sharedStyles.name}>{item.title}</span>
                        {item.foundAt && (
                          <span style={sharedStyles.location}>{item.foundAt}</span>
                        )}
                        {isHidden && (
                          <span style={sharedStyles.hiddenTag}>
                            <EyeOff size={11} /> Dold
                          </span>
                        )}
                      </div>
                      {isAdmin && (
                        <div style={{ ...sharedStyles.cardActions, alignItems: "center" }}>
                          <button
                            style={sharedStyles.iconBtn}
                            onClick={() =>
                              setEvidenceRevealed(item.id, !item.revealed)
                            }
                            title={
                              item.revealed
                                ? "Dölj för spelarna"
                                : "Visa för spelarna"
                            }
                          >
                            {item.revealed ? (
                              <EyeOff size={15} />
                            ) : (
                              <Eye size={15} />
                            )}
                          </button>
                          <button
                            style={sharedStyles.iconBtn}
                            onClick={() => startEdit(item)}
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            style={{ ...sharedStyles.iconBtn, color: theme.primary }}
                            onClick={() => removeEvidence(item.id)}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      )}
                    </div>
                    {item.description && (
                      <p style={sharedStyles.descCompact}>{item.description}</p>
                    )}
                    {related.length > 0 && (
                      <div style={sharedStyles.tags}>
                        {related.map((c) => (
                          <span key={c.id} style={sharedStyles.tag}>
                            {c.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div style={styles.sectionDivider} />
        </>
      )}

      <div style={sharedStyles.header}>
        <h2 style={sharedStyles.h1}>Förhörsdokument</h2>
        {isAdmin && (
          <button style={{ ...sharedStyles.btn, justifyContent: "flex-end" }} onClick={startCreateDoc}>
            <Plus size={16} /> Lägg till dokument
          </button>
        )}
      </div>

      {showDocForm && (
        <div style={sharedStyles.formCard}>
          <h2 style={sharedStyles.formTitle}>
            {creatingDoc ? "Nytt dokument" : `Redigera: ${editingDoc!.title}`}
          </h2>
          <div style={sharedStyles.formGridSingle}>
            <Field label="Titel" full>
              <input
                style={sharedStyles.input}
                value={docDraft.title}
                onChange={(e) => setDocField("title", e.target.value)}
                placeholder="Dokumentets namn"
              />
            </Field>
            <Field label="Beskrivning" full>
              <textarea
                style={sharedStyles.textarea}
                value={docDraft.description}
                onChange={(e) => setDocField("description", e.target.value)}
                placeholder="Vad är detta dokument?"
                rows={3}
              />
            </Field>
            {game.characters.filter(
              (c) => c.role === "suspect" || c.role === "witness",
            ).length > 0 && (
              <Field label="Kopplad karaktär" full>
                <select
                  style={sharedStyles.input}
                  value={docDraft.relatedCharacterId ?? ""}
                  onChange={(e) =>
                    setDocField("relatedCharacterId", e.target.value)
                  }
                >
                  <option value="">Ingen</option>
                  {game.characters
                    .filter((c) => c.role === "suspect" || c.role === "witness")
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({theme.roleLabels[c.role] ?? c.role})
                      </option>
                    ))}
                </select>
              </Field>
            )}
            <Field label="Fil (PDF eller bild)" full>
              <div style={sharedStyles.fileRow}>
                {docDraft.fileUrl && (
                  <div style={styles.filePreview}>
                    {docDraft.fileType.startsWith("image/") ? (
                      <img
                        src={docDraft.fileUrl}
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
                {docDraft.fileUrl && (
                  <button
                    type="button"
                    style={{ ...sharedStyles.btnSecondary, justifyContent: "flex-end" }}
                    onClick={() => {
                      setDocField("fileUrl", "");
                      setDocField("fileType", "");
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
                  {docDraft.imageUrl ? (
                    <img
                      src={docDraft.imageUrl}
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
                {docDraft.imageUrl && (
                  <button
                    type="button"
                    style={{ ...sharedStyles.btnSecondary, justifyContent: "flex-end" }}
                    onClick={() => setDocField("imageUrl", "")}
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
              checked={docDraft.revealed}
              onChange={(e) => setDocField("revealed", e.target.checked)}
            />
            {docDraft.revealed ? (
              <Eye size={14} color={theme.accent} />
            ) : (
              <EyeOff size={14} color={theme.textMuted} />
            )}
            <span>Synligt för spelarna</span>
          </label>
          <div style={sharedStyles.formActions}>
            <button style={{ ...sharedStyles.btnSecondary, justifyContent: "flex-end" }} onClick={cancelDoc}>
              <X size={15} /> Avbryt
            </button>
            <button style={{ ...sharedStyles.btn, justifyContent: "flex-end" }} onClick={saveDoc}>
              <Check size={15} /> Spara
            </button>
          </div>
        </div>
      )}

      {visibleDocuments.length === 0 && !showDocForm ? (
        <div style={sharedStyles.empty}>Inga dokument än.</div>
      ) : (
        <div className="doc-grid" style={styles.docGrid}>
          {visibleDocuments.map((doc) => {
            const isHidden = !doc.revealed;
            const relatedChar = game.characters.find(
              (c) => c.id === doc.relatedCharacterId,
            );
            const tabColor = docTabColor(relatedChar?.role);
            return (
              <div
                key={doc.id}
                style={{ ...styles.folderWrap, opacity: isHidden ? 0.6 : 1 }}
              >
                <div
                  style={{
                    ...styles.folderTab,
                    ...(tabColor
                      ? { background: tabColor, borderColor: tabColor }
                      : {}),
                  }}
                >
                  <span
                    style={{
                      ...styles.folderTabTitle,
                      color: tabColor ? theme.primaryText : theme.text,
                    }}
                  >
                    {doc.title}
                  </span>
                  {isHidden && (
                    <EyeOff
                      size={12}
                      color={tabColor ? theme.primaryText : theme.textMuted}
                    />
                  )}
                </div>
                <div style={styles.folderBody}>
                  <div
                    style={styles.folderThumb}
                    onClick={() => doc.fileUrl && setViewing(doc)}
                  >
                    {doc.imageUrl || doc.fileType.startsWith("image/") ? (
                      <img
                        src={doc.imageUrl || doc.fileUrl}
                        alt=""
                        style={sharedStyles.imgCover}
                      />
                    ) : (
                      <FileText size={40} color={theme.textFaint} />
                    )}
                  </div>
                  {doc.description && (
                    <p style={sharedStyles.descCompact}>{doc.description}</p>
                  )}
                  <div style={styles.folderActions}>
                    <button
                      style={{ ...sharedStyles.btnSecondary, justifyContent: "flex-end" }}
                      onClick={() => setViewing(doc)}
                      disabled={!doc.fileUrl}
                    >
                      <Eye size={14} /> Visa
                    </button>
                    {isAdmin && (
                      <div style={styles.folderAdminActions}>
                        <button
                          style={sharedStyles.iconBtn}
                          onClick={() =>
                            setDocumentRevealed(doc.id, !doc.revealed)
                          }
                          title={
                            doc.revealed
                              ? "Dölj för spelarna"
                              : "Visa för spelarna"
                          }
                        >
                          {doc.revealed ? (
                            <EyeOff size={15} />
                          ) : (
                            <Eye size={15} />
                          )}
                        </button>
                        <button
                          style={sharedStyles.iconBtn}
                          onClick={() => startEditDoc(doc)}
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          style={{ ...sharedStyles.iconBtn, color: theme.primary }}
                          onClick={() => removeDocument(doc.id)}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div style={styles.sectionDivider} />

      <div style={sharedStyles.header}>
        <h2 style={sharedStyles.h1}>Nyhetsartiklar</h2>
        {isAdmin && (
          <button style={{ ...sharedStyles.btn, justifyContent: "flex-end" }} onClick={startCreateNews}>
            <Plus size={16} /> Lägg till artikel
          </button>
        )}
      </div>

      {showNewsForm && (
        <div style={sharedStyles.formCard}>
          <h2 style={sharedStyles.formTitle}>
            {creatingNews ? "Ny artikel" : `Redigera: ${editingNews!.title}`}
          </h2>
          <div style={sharedStyles.formGridSingle}>
            <Field label="Rubrik" full>
              <input
                style={sharedStyles.input}
                value={newsDraft.title}
                onChange={(e) => setNewsField("title", e.target.value)}
                placeholder="Artikelns rubrik"
              />
            </Field>
            <Field label="Ingress" full>
              <textarea
                style={sharedStyles.textarea}
                value={newsDraft.description}
                onChange={(e) => setNewsField("description", e.target.value)}
                placeholder="Vad handlar artikeln om?"
                rows={3}
              />
            </Field>
            {game.characters.filter(
              (c) => c.role === "suspect" || c.role === "witness",
            ).length > 0 && (
              <Field label="Kopplad karaktär" full>
                <select
                  style={sharedStyles.input}
                  value={newsDraft.relatedCharacterId ?? ""}
                  onChange={(e) =>
                    setNewsField("relatedCharacterId", e.target.value)
                  }
                >
                  <option value="">Ingen</option>
                  {game.characters
                    .filter((c) => c.role === "suspect" || c.role === "witness")
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({theme.roleLabels[c.role] ?? c.role})
                      </option>
                    ))}
                </select>
              </Field>
            )}
            <Field label="Fil (PDF eller bild)" full>
              <div style={sharedStyles.fileRow}>
                {newsDraft.fileUrl && (
                  <div style={styles.filePreview}>
                    {newsDraft.fileType.startsWith("image/") ? (
                      <img
                        src={newsDraft.fileUrl}
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
                    onChange={handleNewsFileChange}
                    style={{ display: "none" }}
                  />
                </label>
                {newsDraft.fileUrl && (
                  <button
                    type="button"
                    style={{ ...sharedStyles.btnSecondary, justifyContent: "flex-end" }}
                    onClick={() => {
                      setNewsField("fileUrl", "");
                      setNewsField("fileType", "");
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
                  {newsDraft.imageUrl ? (
                    <img
                      src={newsDraft.imageUrl}
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
                    onChange={handleNewsImageChange}
                    style={{ display: "none" }}
                  />
                </label>
                {newsDraft.imageUrl && (
                  <button
                    type="button"
                    style={{ ...sharedStyles.btnSecondary, justifyContent: "flex-end" }}
                    onClick={() => setNewsField("imageUrl", "")}
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
              checked={newsDraft.revealed}
              onChange={(e) => setNewsField("revealed", e.target.checked)}
            />
            {newsDraft.revealed ? (
              <Eye size={14} color={theme.accent} />
            ) : (
              <EyeOff size={14} color={theme.textMuted} />
            )}
            <span>Synligt för spelarna</span>
          </label>
          <div style={sharedStyles.formActions}>
            <button style={{ ...sharedStyles.btnSecondary, justifyContent: "flex-end" }} onClick={cancelNews}>
              <X size={15} /> Avbryt
            </button>
            <button style={{ ...sharedStyles.btn, justifyContent: "flex-end" }} onClick={saveNews}>
              <Check size={15} /> Spara
            </button>
          </div>
        </div>
      )}

      {visibleNewsArticles.length === 0 && !showNewsForm ? (
        <div style={sharedStyles.empty}>Inga artiklar än.</div>
      ) : (
        <div className="news-grid" style={styles.newsGrid}>
          {visibleNewsArticles.map((article) => {
            const isHidden = !article.revealed;
            const relatedChar = game.characters.find(
              (c) => c.id === article.relatedCharacterId,
            );
            const tabColor = docTabColor(relatedChar?.role);
            return (
              <div
                key={article.id}
                style={{
                  ...styles.folderWrap,
                  ...styles.newsStack,
                  opacity: isHidden ? 0.6 : 1,
                }}
              >
                {/* <span
                  style={{
                    ...styles.folderTabTitle,
                    color: tabColor ? theme.primaryText : theme.text,
                  }}
                >
                  {article.title}
                </span> */}
                {/* <div
                  style={{
                    ...styles.folderTab,
                    ...(tabColor
                      ? { background: tabColor, borderColor: tabColor }
                      : {}),
                  }}
                >
                  <span
                    style={{
                      ...styles.folderTabTitle,
                      color: tabColor ? theme.primaryText : theme.text,
                    }}
                  >
                    {article.title}
                  </span>
                  {isHidden && (
                    <EyeOff
                      size={12}
                      color={tabColor ? theme.primaryText : theme.textMuted}
                    />
                  )}
                </div> */}
                <div style={styles.folderBody}>
                  <div
                    style={styles.folderThumb}
                    onClick={() => article.fileUrl && setViewing(article)}
                  >
                    {article.imageUrl ||
                    article.fileType.startsWith("image/") ? (
                      <img
                        src={article.imageUrl || article.fileUrl}
                        alt=""
                        style={sharedStyles.imgCover}
                      />
                    ) : (
                      <FileText size={40} color={theme.textFaint} />
                    )}
                  </div>
                  {article.description && (
                    <p style={sharedStyles.descCompact}>{article.description}</p>
                  )}
                  <div style={styles.folderBottomRow}>
                    <button
                      style={{ ...sharedStyles.btnSecondary, justifyContent: "flex-end" }}
                      onClick={() => setViewing(article)}
                      disabled={!article.fileUrl}
                    >
                      <Eye size={14} /> Läs
                    </button>
                  </div>
                  {isAdmin && (
                    <div style={styles.folderAdminActions}>
                      <button
                        style={sharedStyles.iconBtn}
                        onClick={() =>
                          setNewsArticleRevealed(article.id, !article.revealed)
                        }
                        title={
                          article.revealed
                            ? "Dölj för spelarna"
                            : "Visa för spelarna"
                        }
                      >
                        {article.revealed ? (
                          <EyeOff size={15} />
                        ) : (
                          <Eye size={15} />
                        )}
                      </button>
                      <button
                        style={sharedStyles.iconBtn}
                        onClick={() => startEditNews(article)}
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        style={{ ...sharedStyles.iconBtn, color: theme.primary }}
                        onClick={() => removeNewsArticle(article.id)}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
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

      <style>{`
        @media (max-width: 700px) {
          .doc-grid, .news-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 480px) {
          .doc-grid, .news-grid { grid-template-columns: 1fr !important; }
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

const styles: Record<string, React.CSSProperties> = {
  sectionDivider: {
    height: 1,
    background: theme.divider,
    margin: "40px 0 32px",
  },
  card: {
    background: theme.cardBg,
    borderRadius: 10,
    padding: "16px 20px",
    border: `1px solid ${theme.textFaint}`,
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
  docGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "26px 20px",
  },
  folderWrap: { position: "relative", marginTop: 20 },
  newsStack: {
    marginTop: 30,
    marginLeft: 12,
    borderRadius: "0 10px 10px 10px",
    boxShadow: [
      `-2px -2px 0 0 ${theme.cardBg}`,
      `-2px -2px 0 1px ${theme.cardBorder}`,
      `-5px -5px 0 0 ${theme.cardBg}`,
      `-5px -5px 0 1px ${theme.cardBorder}`,
    ].join(", "),
  },
  folderTab: {
    position: "absolute",
    top: -28,
    left: 0,
    zIndex: 2,
    display: "flex",
    alignItems: "center",
    gap: 6,
    maxWidth: "75%",
    background: theme.cardBg,
    border: `1px solid ${theme.textFaint}`,
    borderBottom: "none",
    borderRadius: "8px 8px 0 0",
    padding: "6px 14px",
  },
  folderTabTitle: {
    fontWeight: 700,
    fontSize: 13,
    color: theme.text,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  folderBody: {
    position: "relative",
    zIndex: 1,
    background: theme.cardBg,
    border: `1px solid ${theme.textFaint}`,
    borderRadius: "0 10px 10px 10px",
    padding: "16px",
  },
  folderThumb: {
    width: "100%",
    aspectRatio: "4 / 3",
    borderRadius: 8,
    background: theme.inputBg,
    border: `1px solid ${theme.inputBorder}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    cursor: "pointer",
    marginBottom: 10,
  },
  folderActions: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    alignItems: "stretch",
  },
  folderAdminActions: { display: "flex", gap: 8, justifyContent: "center" },
  folderBottomRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "end",
    gap: 10,
  },
  newsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "26px 20px",
  },
};
