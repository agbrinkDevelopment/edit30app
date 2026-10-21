import React, { useState } from "react";
import { Check } from "lucide-react";
import { theme } from "../theme";
import SectionCheckCircle from "./SectionCheckCircle";
import SectionHelp from "./SectionHelp";
import { sharedStyles } from "../shared/styles";
import { fileSrc } from "../api/client";
import ApartmentGame from "./ApartmentGame";
import { MapLocations } from "../hooks/useMapLocations";

function tightBbox(lat: number, lon: number) {
  return `${lon - 0.004},${lat - 0.002},${lon + 0.004},${lat + 0.002}`;
}

function osmEmbedUrl(lat: number, lon: number) {
  const bbox = tightBbox(lat, lon);
  const marker = `${lat},${lon}`;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${encodeURIComponent(marker)}`;
}

export default function CityMap({ map }: { map: MapLocations }) {
  const { pins, allDone, setDone } = map;
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Starts on the first pill (Edit).
  const selected = pins.find((p) => p.id === selectedId) ?? pins[0];
  // Edit's apartment game is the only minigame so far; the other locations
  // get theirs later.
  const hasGame = selected?.role === "victim";
  const gameSolved = !!selected?.done;

  return (
    <div>
      <div
        className="citymap-header"
        style={{
          ...sharedStyles.pillHeaderBase,
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
          {/* Kartan has no hint or skip of its own: it's done once every
              location is checked or skipped. */}
          <span
            style={{
              ...sharedStyles.pillCheckCircle,
              ...(allDone ? sharedStyles.pillCheckCircleDone : {}),
            }}
            title={allDone ? "Klar" : "Bocka av alla platser på kartan"}
          >
            {allDone && <Check size={12} color={theme.primaryText} />}
          </span>
        </div>
        <div className="citymap-tabs" style={styles.tabs}>
          {pins.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedId(p.id)}
              style={{
                ...styles.tab,
                ...(p.id === selected?.id ? styles.tabActive : {}),
                // The border is the character's role colour.
                ...(p.color && { border: `1.5px solid ${p.color}` }),
              }}
            >
              {/* A checked location shows a check in place of each photo,
                  overlapping the same way. */}
              <span style={styles.tabAvatars}>
                {p.members.map((m, i) =>
                  p.done ? (
                    <span
                      key={m.id}
                      style={{
                        ...styles.tabCheck,
                        ...(i > 0 && styles.tabAvatarOverlap),
                      }}
                    >
                      <Check
                        size={11}
                        strokeWidth={3}
                        color={theme.primaryText}
                      />
                    </span>
                  ) : (
                    m.imageUrl && (
                      <img
                        key={m.id}
                        src={fileSrc(m.imageUrl)}
                        alt=""
                        style={{
                          ...styles.tabAvatar,
                          ...(i > 0 && styles.tabAvatarOverlap),
                        }}
                      />
                    )
                  ),
                )}
              </span>
              {p.label}
            </button>
          ))}
        </div>
      </div>
      {selected && (
        <div style={styles.card}>
          {/* This location's status: hint used, and done or skipped. */}
          <SectionCheckCircle
            sectionId={selected.sectionId}
            done={gameSolved}
            baseStyle={sharedStyles.pillCheckCircle}
            doneStyle={sharedStyles.pillCheckCircleDone}
            iconSize={12}
            title={gameSolved ? "Klar" : "Inte klar än"}
            wrapperStyle={styles.cardCheck}
          />
          <div style={styles.body}>
            <div className="citymap-intro" style={styles.intro}>
              {selected.members.some((m) => m.imageUrl) && (
                <div style={styles.introImages}>
                  {selected.members.map(
                    (m) =>
                      m.imageUrl && (
                        <img
                          key={m.id}
                          src={fileSrc(m.imageUrl)}
                          alt={m.name}
                          style={styles.introImage}
                        />
                      ),
                  )}
                </div>
              )}
              <div>
                <h3 style={styles.introTitle}>{selected.name}</h3>
                <p style={styles.introText}>
                  {selected.role === "detective"
                    ? "Ta er till platsen på kartan och samla bevis från brottsplatsen."
                    : hasGame
                      ? "Ta er till platsen på kartan. Klicka sedan runt i Edits lägenhet, leta upp de gömda föremålen och lös ledtrådarna. Den som låser upp datorn har klarat minispelet."
                      : "Ta er till platsen på kartan. Minispelet för den här platsen kommer snart."}
                </p>
              </div>
            </div>
            <div className="citymap-divider" style={styles.divider}>
              <span style={styles.dividerLabel}>Kartan</span>
            </div>
            {selected.location ? (
              <iframe
                key={selected.id}
                title="Karta över Uppsala"
                src={osmEmbedUrl(selected.location.lat, selected.location.lon)}
                className="citymap-iframe"
                style={styles.iframe}
                loading="lazy"
              />
            ) : (
              <div style={styles.noLocation}>
                Platsen är inte utsatt på kartan än.
              </div>
            )}
            {hasGame && (
              <>
                <div className="citymap-divider" style={styles.divider}>
                  <span style={styles.dividerLabel}>Minispelet</span>
                </div>
                <ApartmentGame
                  onExit={() => setDone(selected, true)}
                  style={styles.game}
                />
                {gameSolved && (
                  <div style={styles.solved}>
                    Datorn är upplåst – du har klarat minispelet!
                  </div>
                )}
              </>
            )}
            {/* Marks the location done by hand, also where there's a game. */}
            <button
              type="button"
              onClick={() => setDone(selected, !gameSolved)}
              style={{
                ...styles.validateBtn,
                ...(gameSolved ? styles.validateBtnDone : {}),
              }}
            >
              {gameSolved ? (
                <>
                  <Check size={14} strokeWidth={3} /> Klar – ångra
                </>
              ) : (
                "Markera som klar"
              )}
            </button>
            {/* Visa ledtråd / Hoppa över for this location. */}
            <SectionHelp sectionId={selected.sectionId} done={gameSolved} />
          </div>
        </div>
      )}

      <style>{`
        .citymap-divider::before, .citymap-divider::after {
          content: ""; flex: 1; height: 1px; background: currentColor;
        }
        @media (max-width: 480px) {
          .citymap-iframe { height: 240px !important; }
          .citymap-intro { flex-direction: column; }
        }
      `}</style>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  titleRow: { display: "flex", alignItems: "center", gap: 10 },
  tabs: { display: "flex", gap: 6, flexWrap: "wrap" },
  tab: {
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    gap: 6,
    whiteSpace: "nowrap",
    background: "transparent",
    color: theme.textFaint,
    border: `1px solid ${theme.textFaint}`,
    borderRadius: 20,
    padding: "5px 12px",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
  },
  tabAvatars: { display: "flex", flexShrink: 0 },
  // Further photos tuck under the previous one.
  tabAvatarOverlap: { marginLeft: -6 },
  introImages: { display: "flex", gap: 8, flexShrink: 0 },
  tabAvatar: {
    width: 18,
    height: 18,
    borderRadius: "50%",
    objectFit: "cover",
    margin: "-2px 0 -2px -7px",
    boxShadow: `0 0 0 1.5px ${theme.cardBg}`,
    flexShrink: 0,
  },
  // Same green check circle as the section headers, pill-sized.
  tabCheck: {
    width: 18,
    height: 18,
    margin: "-2px 0 -2px -7px",
    borderRadius: "50%",
    boxShadow: `0 0 0 1.5px ${theme.cardBg}`,
    background: theme.success,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  tabActive: {
    background: theme.accentBg,
    color: theme.text,
    border: `1px solid ${theme.textFaint}`,
  },
  cardCheck: { position: "absolute", top: 12, right: 12, zIndex: 1 },
  card: {
    position: "relative",
    background: theme.cardBg,
    border: `1px solid ${theme.textFaint}`,
    borderRadius: 12,
    overflow: "hidden",
  },
  iframe: {
    width: "100%",
    height: 360,
    border: "none",
    borderRadius: 10,
    display: "block",
  },
  body: {
    padding: 16,
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  // Right padding keeps the text clear of the corner check.
  intro: {
    display: "flex",
    gap: 16,
    alignItems: "flex-start",
    paddingRight: 70,
  },
  introImage: {
    width: 120,
    height: 120,
    borderRadius: 10,
    objectFit: "cover",
    flexShrink: 0,
  },
  introTitle: {
    fontSize: 20,
    fontWeight: 700,
    color: theme.text,
    margin: "0 0 6px",
  },
  introText: { fontSize: 15, lineHeight: 1.5, color: theme.text, margin: 0 },
  // A line with a label in the middle, between the intro and the game.
  divider: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    color: theme.textFaint,
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  dividerLabel: { flexShrink: 0 },
  noLocation: {
    padding: "32px 16px",
    borderRadius: 10,
    background: theme.bg,
    color: theme.textFaint,
    fontSize: 14,
    textAlign: "center",
  },
  // The game sits inside this card, so drop its own card frame.
  game: { border: "none", padding: 0, background: "transparent" },
  solved: {
    fontWeight: 600,
    color: theme.accent,
  },
  validateBtn: {
    alignSelf: "flex-start",
    display: "flex",
    alignItems: "center",
    gap: 6,
    background: theme.accent,
    color: theme.primaryText,
    border: `1.5px solid ${theme.accent}`,
    borderRadius: 20,
    padding: "6px 16px",
    fontFamily: "inherit",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  },
  validateBtnDone: {
    background: theme.accentBg,
    color: theme.accent,
  },
};
