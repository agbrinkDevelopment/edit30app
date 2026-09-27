import React, { useState } from "react";
import { Info } from "lucide-react";
import { theme } from "../theme";
import Modal from "./Modal";

export default function InfoButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        style={styles.fab}
        onClick={() => setOpen(true)}
        title="Information"
        aria-label="Information"
      >
        <Info size={22} color={theme.primaryText} />
      </button>

      {open && (
        <Modal onClose={() => setOpen(false)} maxWidth={480}>
          <h2 style={styles.header}>Rubrik</h2>
          <div style={styles.submenu}>
            <span style={styles.submenuItem}>Översikt</span>
            <span style={styles.submenuItem}>Regler</span>
            <span style={styles.submenuItem}>Kontakt</span>
          </div>
          <p style={styles.text}>
            Det här är exempeltext i informationsrutan. Här kan innehåll om hur
            spelet fungerar, regler och annan hjälpsam information läggas till
            senare.
          </p>
        </Modal>
      )}
    </>
  );
}

const styles: Record<string, React.CSSProperties> = {
  fab: {
    position: "fixed",
    bottom: 0,
    right: 0,
    width: 52,
    height: 52,
    borderTopLeftRadius: "50%",
    background: theme.primary,
    border: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    boxShadow: "0 4px 14px rgba(0,0,0,0.25)",
    zIndex: 150,
  },
  header: {
    margin: "0 0 12px",
    fontSize: 22,
    fontFamily: theme.fontSerif,
    fontWeight: 700,
    color: theme.accent,
  },
  submenu: {
    display: "flex",
    gap: 10,
    marginBottom: 16,
    flexWrap: "wrap",
  },
  submenuItem: {
    fontSize: 13,
    fontWeight: 600,
    color: theme.secondaryText,
    background: theme.secondaryBg,
    padding: "5px 12px",
    borderRadius: 20,
  },
  text: {
    margin: 0,
    fontSize: 14,
    color: theme.textMuted,
    lineHeight: 1.6,
  },
};
