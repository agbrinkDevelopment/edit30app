import React, { useState } from "react";
import { Clock } from "lucide-react";
import { TimelineEvent } from "../types";
import { theme } from "../theme";
import Modal from "./Modal";

interface Props {
  events: TimelineEvent[];
  emptyText?: string;
}

export default function Timeline({
  events,
  emptyText = "No timeline events yet.",
}: Props) {
  const sorted = [...events].sort((a, b) => a.time.localeCompare(b.time));
  const [openId, setOpenId] = useState<string | null>(null);

  if (sorted.length === 0) {
    return <div style={styles.empty}>{emptyText}</div>;
  }

  const active = sorted.find((ev) => ev.id === openId) ?? null;

  return (
    <div>
      <div style={styles.track}>
        <div style={styles.line} />
        {sorted.map((ev) => {
          const isOpen = ev.id === openId;
          return (
            <button
              key={ev.id}
              type="button"
              style={styles.nodeWrap}
              onClick={() => setOpenId(isOpen ? null : ev.id)}
              aria-expanded={isOpen}
            >
              <span
                style={{ ...styles.node, ...(isOpen ? styles.nodeActive : {}) }}
              />
              <span
                style={{
                  ...styles.nodeTime,
                  ...(isOpen ? styles.nodeTimeActive : {}),
                }}
              >
                {ev.time || "—"}
              </span>
            </button>
          );
        })}
      </div>
      {active && (
        <Modal onClose={() => setOpenId(null)}>
          <div style={styles.cardTime}>
            <Clock size={12} /> {active.time || "Okänd tid"}
          </div>
          <p style={styles.cardDesc}>
            {active.description || "Ingen information tillagd."}
          </p>
        </Modal>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  track: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    gap: 24,
    padding: "8px 0px 8px",
    overflowX: "auto",
  },
  line: {
    position: "absolute",
    left: 12,
    right: 12,
    top: 15,
    height: 2,
    background: theme.divider,
    zIndex: 0,
  },
  nodeWrap: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 6,
    background: "none",
    border: "none",
    cursor: "pointer",
    flexShrink: 0,
    padding: 0,
    fontFamily: "inherit",
  },
  node: {
    width: 14,
    height: 14,
    borderRadius: "50%",
    background: theme.cardBg,
    border: `3px solid ${theme.accent}`,
    transition: "transform 0.15s, background 0.15s",
    boxSizing: "border-box",
  },
  nodeActive: {
    background: theme.accent,
    transform: "scale(1.25)",
  },
  nodeTime: {
    fontSize: 11,
    fontWeight: 600,
    color: theme.textMuted,
    whiteSpace: "nowrap",
  },
  nodeTimeActive: {
    color: theme.accent,
  },
  cardTime: {
    display: "flex",
    alignItems: "center",
    gap: 5,
    fontSize: 12,
    fontWeight: 700,
    color: theme.accent,
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  cardDesc: { margin: 0, fontSize: 14, color: theme.text, lineHeight: 1.5 },
  empty: { fontSize: 13, color: theme.textFaint },
};
