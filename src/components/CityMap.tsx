import React, { useState } from "react";
import { Check } from "lucide-react";
import { useGame } from "../context/GameContext";
import { theme } from "../theme";
import { sharedStyles } from "../shared/styles";

// S:t Olofsgatan 10B, Uppsala — the crime scene
const CRIME_SCENE = { lat: 59.8583161, lon: 17.6289139 };

function tightBbox(lat: number, lon: number) {
  return `${lon - 0.004},${lat - 0.002},${lon + 0.004},${lat + 0.002}`;
}

function osmEmbedUrl(lat: number, lon: number) {
  const bbox = tightBbox(lat, lon);
  const marker = `${lat},${lon}`;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${encodeURIComponent(marker)}`;
}

export default function CityMap({
  done,
  onToggleDone,
}: {
  done?: boolean;
  onToggleDone?: () => void;
}) {
  const { game } = useGame();
  const [selectedId, setSelectedId] = useState("scene");

  const pins = [
    { id: "scene", label: "Brottsplatsen", ...CRIME_SCENE },
    ...game.characters
      .filter((c) => c.location)
      .map((c) => ({
        id: c.id,
        label: c.initials,
        lat: c.location!.lat,
        lon: c.location!.lon,
      })),
  ];

  const selected = pins.find((p) => p.id === selectedId) ?? pins[0];

  return (
    <div>
      <div style={{ ...sharedStyles.pillHeaderBase, justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          {onToggleDone && (
            <button
              style={styles.titleCheckBtn}
              onClick={onToggleDone}
              title={done ? "Markera som oläst" : "Markera som klar"}
            >
              <span
                style={{
                  ...sharedStyles.pillCheckCircle,
                  ...(done ? sharedStyles.pillCheckCircleDone : {}),
                }}
              >
                {done && <Check size={12} color={theme.primaryText} />}
              </span>
            </button>
          )}
        </div>
        <div style={styles.tabs}>
          {pins.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedId(p.id)}
              style={{
                ...styles.tab,
                ...(p.id === selectedId ? styles.tabActive : {}),
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
      <div style={styles.card}>
        <iframe
          key={selected.id}
          title="Karta över Uppsala"
          src={osmEmbedUrl(selected.lat, selected.lon)}
          className="citymap-iframe"
          style={styles.iframe}
          loading="lazy"
        />
      </div>

      <style>{`
        @media (max-width: 480px) {
          .citymap-iframe { height: 240px !important; }
        }
      `}</style>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  titleRow: { display: "flex", alignItems: "center", gap: 10 },
  titleCheckBtn: {
    background: "none",
    border: "none",
    outline: "none",
    padding: 0,
    cursor: "pointer",
  },
  tabs: { display: "flex", gap: 6, flexWrap: "wrap" },
  tab: {
    background: "transparent",
    color: theme.textFaint,
    border: `1px solid ${theme.textFaint}`,
    borderRadius: 20,
    padding: "5px 12px",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
  },
  tabActive: {
    background: theme.textFaint,
    color: theme.primaryText,
    border: `1px solid ${theme.textFaint}`,
  },
  card: {
    background: theme.cardBg,
    border: `1px solid ${theme.textFaint}`,
    borderRadius: 12,
    overflow: "hidden",
  },
  iframe: { width: "100%", height: 360, border: "none", display: "block" },
};
