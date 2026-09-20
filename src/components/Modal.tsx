import React from "react";
import ReactDOM from "react-dom";
import { X } from "lucide-react";
import { theme } from "../theme";

interface Props {
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: number | string;
  maxHeight?: number | string;
}

export default function Modal({ onClose, children, maxWidth = 480, maxHeight = "80vh" }: Props) {
  return ReactDOM.createPortal(
    <div style={styles.overlay} onClick={onClose}>
      <div style={{ ...styles.dialog, maxWidth, maxHeight }} onClick={(e) => e.stopPropagation()}>
        <button style={styles.closeBtn} onClick={onClose} aria-label="Close">
          <X size={18} />
        </button>
        {children}
      </div>
    </div>,
    document.body,
  );
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: 20,
  },
  dialog: {
    position: "relative",
    background: theme.cardBg,
    borderRadius: 12,
    padding: 24,
    maxWidth: 480,
    width: "100%",
    maxHeight: "80vh",
    overflowY: "auto",
    boxShadow: "0 10px 40px rgba(0,0,0,0.35)",
  },
  closeBtn: {
    position: "absolute",
    top: 12,
    right: 12,
    background: "none",
    border: "none",
    cursor: "pointer",
    color: theme.textMuted,
    padding: 4,
  },
};
