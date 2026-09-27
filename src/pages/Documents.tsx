import React, { useState } from "react";
import { useGame } from "../context/GameContext";
import { useAuth } from "../context/AuthContext";
import { GameDocument } from "../types";
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
import { api, fileSrc } from "../api/client";
import { reportUploadError } from "../shared/helpers";
import { theme } from "../theme";
import { sharedStyles } from "../shared/styles";
import Modal from "../components/Modal";

const emptyDocument = (): Omit<GameDocument, "id"> => ({
  title: "",
  description: "",
  fileUrl: "",
  fileType: "",
  imageUrl: "",
  revealed: true,
});

export default function Documents() {
  const {
    game,
    addDocument,
    updateDocument,
    removeDocument,
    setDocumentRevealed,
  } = useGame();
  const { isAdmin } = useAuth();
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
    if (creating) addDocument(draft);
    else if (editing) updateDocument({ ...draft, id: editing.id });
    cancel();
  };

  const setField = (field: keyof Omit<GameDocument, "id">, value: any) =>
    setDraft((d) => ({ ...d, [field]: value }));

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

  const showForm = isAdmin && (editing || creating);
  const visibleDocuments = game.documents.filter((d) => isAdmin || d.revealed);

  return (
    <div style={sharedStyles.pageNarrow}>
      <div style={sharedStyles.header}>
        <h1 style={sharedStyles.h1}>Dokument</h1>
        {isAdmin && (
          <button style={sharedStyles.btn} onClick={startCreate}>
            <Plus size={16} /> Lägg till dokument
          </button>
        )}
      </div>

      {showForm && (
        <div style={sharedStyles.formCard}>
          <h2 style={sharedStyles.formTitle}>
            {creating ? "Nytt dokument" : `Redigera: ${editing!.title}`}
          </h2>
          <div style={sharedStyles.formGridSingle}>
            <Field label="Titel" full>
              <input
                style={sharedStyles.input}
                value={draft.title}
                onChange={(e) => setField("title", e.target.value)}
                placeholder="Dokumentets namn"
              />
            </Field>
            <Field label="Beskrivning" full>
              <textarea
                style={sharedStyles.textarea}
                value={draft.description}
                onChange={(e) => setField("description", e.target.value)}
                placeholder="Vad är detta dokument?"
                rows={3}
              />
            </Field>
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
                    style={{ ...sharedStyles.btnSecondary, fontSize: 13 }}
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
                    style={{ ...sharedStyles.btnSecondary, fontSize: 13 }}
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
            <button style={{ ...sharedStyles.btnSecondary, fontSize: 13 }} onClick={cancel}>
              <X size={15} /> Avbryt
            </button>
            <button style={sharedStyles.btn} onClick={save}>
              <Check size={15} /> Spara
            </button>
          </div>
        </div>
      )}

      {visibleDocuments.length === 0 && !showForm ? (
        <div style={sharedStyles.empty}>Inga dokument än.</div>
      ) : (
        <div style={sharedStyles.list}>
          {visibleDocuments.map((doc) => {
            const isHidden = !doc.revealed;
            return (
              <div
                key={doc.id}
                style={{ ...sharedStyles.card, display: "flex", gap: 16, opacity: isHidden ? 0.6 : 1 }}
              >
                <div
                  style={styles.cardThumb}
                  onClick={() => doc.fileUrl && setViewing(doc)}
                >
                  {doc.imageUrl || doc.fileType.startsWith("image/") ? (
                    <img
                      src={fileSrc(doc.imageUrl || doc.fileUrl)}
                      alt=""
                      style={sharedStyles.imgCover}
                    />
                  ) : (
                    <FileText size={26} color={theme.textFaint} />
                  )}
                </div>
                <div style={styles.cardBody}>
                  <div style={styles.cardTop}>
                    <span style={sharedStyles.name}>{doc.title}</span>
                    {isHidden && (
                      <span style={sharedStyles.hiddenTag}>
                        <EyeOff size={11} /> Dold
                      </span>
                    )}
                  </div>
                  {doc.description && (
                    <p style={sharedStyles.desc}>{doc.description}</p>
                  )}
                  <div style={styles.cardActions}>
                    <button
                      style={{ ...sharedStyles.btnSecondary, fontSize: 13 }}
                      onClick={() => setViewing(doc)}
                      disabled={!doc.fileUrl}
                    >
                      <Eye size={14} /> Visa
                    </button>
                    {isAdmin && (
                      <>
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
                          onClick={() => startEdit(doc)}
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          style={{ ...sharedStyles.iconBtn, color: theme.primary }}
                          onClick={() => removeDocument(doc.id)}
                        >
                          <Trash2 size={15} />
                        </button>
                      </>
                    )}
                  </div>
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
  filePreview: {
    width: 56,
    height: 56,
    borderRadius: 8,
    background: theme.inputBg,
    border: `1px solid ${theme.inputBorder}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    flexShrink: 0,
  },
  cardThumb: {
    width: 64,
    height: 64,
    borderRadius: 8,
    background: theme.inputBg,
    border: `1px solid ${theme.inputBorder}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    flexShrink: 0,
    cursor: "pointer",
  },
  cardBody: { flex: 1, minWidth: 0 },
  cardTop: { display: "flex", alignItems: "center", gap: 10, marginBottom: 6 },
  cardActions: { display: "flex", gap: 8, alignItems: "center" },
};
