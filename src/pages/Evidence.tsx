import React, { useState } from "react";
import { useGame } from "../context/GameContext";
import { GameDocument } from "../types";
import { BookOpen, Eye, FileText } from "lucide-react";
import { fileSrc } from "../api/client";
import { theme } from "../theme";
import { sharedStyles } from "../shared/styles";
import Modal from "../components/Modal";
import { docTabColor } from "../shared/helpers";

export default function Evidence() {
  const { game } = useGame();
  const [viewing, setViewing] = useState<GameDocument | null>(null);

  const visibleDocuments = game.documents.filter((d) => d.revealed);
  const visibleNewsArticles = game.newsArticles.filter((d) => d.revealed);
  const visibleVictimNotes = game.victimNotes.filter((d) => d.revealed);
  const victim = game.characters.find((c) => c.role === "victim");
  const victimNotesTitle = victim
    ? `${victim.name}s anteckningar`
    : "Offrets anteckningar";

  return (
    <div style={sharedStyles.pagePadded}>
      <div
        id="forhorsdokument"
        data-scroll-target
        style={{ ...sharedStyles.header, scrollMarginTop: 72 }}
      >
        <h2 style={sharedStyles.h1}>Förhörsdokument</h2>
      </div>

      {visibleDocuments.length === 0 ? (
        <div style={sharedStyles.empty}>Inga dokument än.</div>
      ) : (
        <div className="doc-grid" style={styles.docGrid}>
          {visibleDocuments.map((doc) => {
            const relatedChar = game.characters.find(
              (c) => c.id === doc.relatedCharacterId,
            );
            const tabColor = docTabColor(relatedChar?.role);
            return (
              <div key={doc.id} style={styles.folderWrap}>
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
                </div>
                <div style={styles.folderBody}>
                  <div
                    style={styles.folderThumb}
                    onClick={() => doc.fileUrl && setViewing(doc)}
                  >
                    {doc.imageUrl || doc.fileType.startsWith("image/") ? (
                      <img
                        src={fileSrc(doc.imageUrl || doc.fileUrl)}
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
                      style={{
                        ...sharedStyles.btnSecondary,
                        justifyContent: "flex-end",
                      }}
                      onClick={() => setViewing(doc)}
                      disabled={!doc.fileUrl}
                    >
                      <Eye size={14} /> Visa
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div style={styles.sectionDivider} />

      <div
        id="nyhetsartiklar"
        data-scroll-target
        style={{ ...sharedStyles.header, scrollMarginTop: 72 }}
      >
        <h2 style={sharedStyles.h1}>Nyhetsartiklar</h2>
      </div>

      {visibleNewsArticles.length === 0 ? (
        <div style={sharedStyles.empty}>Inga artiklar än.</div>
      ) : (
        <div className="news-grid" style={styles.newsGrid}>
          {visibleNewsArticles.map((article) => (
            <div
              key={article.id}
              style={{ ...styles.folderWrap, ...styles.newsStack }}
            >
              <div style={styles.folderBody}>
                <div
                  style={styles.folderThumb}
                  onClick={() => article.fileUrl && setViewing(article)}
                >
                  {article.imageUrl || article.fileType.startsWith("image/") ? (
                    <img
                      src={fileSrc(article.imageUrl || article.fileUrl)}
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
                <div style={styles.folderActions}>
                  <button
                    style={{
                      ...sharedStyles.btnSecondary,
                    }}
                    onClick={() => setViewing(article)}
                    disabled={!article.fileUrl}
                  >
                    <Eye size={14} /> Visa
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={styles.sectionDivider} />

      <div
        id="anteckningar"
        data-scroll-target
        style={{ ...sharedStyles.header, scrollMarginTop: 72 }}
      >
        <h2 style={sharedStyles.h1}>{victimNotesTitle}</h2>
      </div>

      {visibleVictimNotes.length === 0 ? (
        <div style={sharedStyles.empty}>Inga anteckningar än.</div>
      ) : (
        <div className="notes-grid" style={styles.notesGrid}>
          {visibleVictimNotes.map((note) => (
            <div key={note.id} style={styles.bookWrap}>
              <div style={styles.bookSpine} />
              <div style={styles.bookBody}>
                <div
                  style={styles.bookThumb}
                  onClick={() => note.fileUrl && setViewing(note)}
                >
                  {note.imageUrl || note.fileType.startsWith("image/") ? (
                    <img
                      src={fileSrc(note.imageUrl || note.fileUrl)}
                      alt=""
                      style={sharedStyles.imgCover}
                    />
                  ) : (
                    <BookOpen size={36} color={theme.textFaint} />
                  )}
                </div>
                <span style={styles.bookTitle}>{note.title}</span>
                {note.description && (
                  <p style={sharedStyles.descCompact}>{note.description}</p>
                )}
                <div style={styles.folderActions}>
                  <button
                    style={{
                      ...sharedStyles.btnSecondary,
                      justifyContent: "flex-end",
                    }}
                    onClick={() => setViewing(note)}
                    disabled={!note.fileUrl}
                  >
                    <Eye size={14} /> Visa
                  </button>
                </div>
              </div>
            </div>
          ))}
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

      <style>{`
        @media (max-width: 700px) {
          .doc-grid, .news-grid, .notes-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 480px) {
          .doc-grid, .news-grid, .notes-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  sectionDivider: {
    height: 1,
    background: theme.divider,
    margin: "40px 0 32px",
  },
  docGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "26px 20px",
  },
  folderWrap: { position: "relative", marginTop: 20 },
  newsStack: {
    marginTop: 6,
    marginLeft: 6,
    borderRadius: "0 10px 10px 10px",
    boxShadow: [
      `-2px -2px 0 0 ${theme.cardBg}`,
      `-2px -2px 0 1px ${theme.textFaint}`,
      `-5px -5px 0 0 ${theme.cardBg}`,
      `-5px -5px 0 1px ${theme.textFaint}`,
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
    gap: 8,
  },
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
  notesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "26px 20px",
  },
  // A little hardcover book: a ridged spine on the left, pages implied by a
  // stacked drop-shadow on the bottom-right, like folderWrap/newsStack.
  bookWrap: {
    display: "flex",
    borderRadius: "3px 10px 10px 3px",
    overflow: "hidden",
    border: `1px solid ${theme.textFaint}`,
    boxShadow: [
      `3px 3px 0 0 ${theme.cardBg}`,
      `3px 3px 0 1px ${theme.textFaint}`,
      `6px 6px 0 0 ${theme.cardBg}`,
      `6px 6px 0 1px ${theme.textFaint}`,
    ].join(", "),
  },
  bookSpine: {
    width: 14,
    flexShrink: 0,
    background: theme.accent,
    backgroundImage:
      "repeating-linear-gradient(180deg, rgba(0,0,0,0.18) 0px, rgba(0,0,0,0.18) 1px, transparent 1px, transparent 7px)",
    borderRight: `1px solid ${theme.textFaint}`,
  },
  bookBody: {
    flex: 1,
    minWidth: 0,
    background: theme.cardBg,
    padding: 16,
  },
  bookThumb: {
    width: "100%",
    aspectRatio: "4 / 3",
    borderRadius: 6,
    background: theme.inputBg,
    border: `1px solid ${theme.inputBorder}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    cursor: "pointer",
    marginBottom: 10,
  },
  bookTitle: {
    display: "block",
    fontFamily: theme.fontSerif,
    fontWeight: 700,
    fontSize: 14,
    color: theme.text,
    marginBottom: 4,
  },
};
