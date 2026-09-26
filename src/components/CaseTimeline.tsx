import React, { useMemo, useState } from "react";
import { Clock, Edit2, Plus, Trash2, Check, User } from "lucide-react";
import { useGame } from "../context/GameContext";
import { PlayerTimelineEvent } from "../types";
import { theme } from "../theme";
import { sharedStyles } from "../shared/styles";
import Modal from "./Modal";
import TimelineEventFormModal, {
  emptyTimelineEventDraft,
} from "./TimelineEventFormModal";

const LANE_HEIGHT = 56;
const PX_PER_MIN = 5;
const PAD_X = 30;
const AXIS_HEIGHT = 32;
const TICK_INTERVAL_MIN = 30;

function toMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

function formatMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function computeLaneOrder(
  characterIds: string[],
  events: PlayerTimelineEvent[],
): string[] {
  const adjacency = new Map<string, Set<string>>();
  characterIds.forEach((id) => adjacency.set(id, new Set()));
  events
    .filter((e) => e.characterIds.length > 1)
    .forEach((e) => {
      e.characterIds.forEach((a) => {
        e.characterIds.forEach((b) => {
          if (a !== b && adjacency.has(a)) adjacency.get(a)!.add(b);
        });
      });
    });
  const visited = new Set<string>();
  const order: string[] = [];
  const visit = (id: string) => {
    if (visited.has(id)) return;
    visited.add(id);
    order.push(id);
    const neighbors = Array.from(adjacency.get(id) ?? []).sort(
      (a, b) => characterIds.indexOf(a) - characterIds.indexOf(b),
    );
    neighbors.forEach(visit);
  };
  characterIds.forEach(visit);
  return order;
}

// The timeline a player has personally reconstructed. Never fed the real
// timeline_events — only this player's own events, plus whether they match
// (computed server-side; see usePlayerTimeline / playerService).
export default function CaseTimeline({
  events,
  solved,
  onAddEvent,
  onUpdateEvent,
  onRemoveEvent,
}: {
  events: PlayerTimelineEvent[];
  solved: boolean;
  onAddEvent: (e: Omit<PlayerTimelineEvent, "id">) => void;
  onUpdateEvent: (e: PlayerTimelineEvent) => void;
  onRemoveEvent: (id: string) => void;
}) {
  const { game } = useGame();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState(emptyTimelineEventDraft());

  const startCreate = () => {
    setDraft(emptyTimelineEventDraft());
    setCreating(true);
    setEditingId(null);
    setSelectedId(null);
  };
  const startEdit = (e: PlayerTimelineEvent) => {
    setDraft({
      time: e.time,
      description: e.description,
      characterIds: e.characterIds,
      revealed: true,
    });
    setEditingId(e.id);
    setCreating(false);
    setSelectedId(null);
  };
  const cancelForm = () => {
    setCreating(false);
    setEditingId(null);
  };
  const saveForm = () => {
    if (!draft.time || draft.characterIds.length === 0) return;
    const payload = {
      time: draft.time,
      description: draft.description,
      characterIds: draft.characterIds,
    };
    if (creating) onAddEvent(payload);
    else if (editingId) onUpdateEvent({ ...payload, id: editingId });
    cancelForm();
  };
  const showForm = creating || editingId;

  const sortedEvents = useMemo(
    () => [...events].sort((a, b) => a.time.localeCompare(b.time)),
    [events],
  );

  const laneCharIds = useMemo(() => {
    const allCharacterIds = [...game.characters]
      .sort(
        (a, b) =>
          (theme.roleOrder[a.role] ?? 99) - (theme.roleOrder[b.role] ?? 99),
      )
      .map((c) => c.id);
    return computeLaneOrder(allCharacterIds, sortedEvents);
  }, [sortedEvents, game.characters]);

  const charById = useMemo(
    () => new Map(game.characters.map((c) => [c.id, c])),
    [game.characters],
  );

  const laneY = useMemo(() => {
    const m = new Map<string, number>();
    laneCharIds.forEach((id, i) =>
      m.set(id, i * LANE_HEIGHT + LANE_HEIGHT / 2),
    );
    return m;
  }, [laneCharIds]);

  const minMinutes = useMemo(() => {
    if (sortedEvents.length === 0) return 0;
    return Math.min(...sortedEvents.map((e) => toMinutes(e.time)));
  }, [sortedEvents]);

  const maxMinutes = useMemo(() => {
    if (sortedEvents.length === 0) return 0;
    return Math.max(...sortedEvents.map((e) => toMinutes(e.time)));
  }, [sortedEvents]);

  const timeToX = (minutes: number) =>
    PAD_X + (minutes - minMinutes) * PX_PER_MIN;

  const eventX = useMemo(() => {
    const m = new Map<string, number>();
    sortedEvents.forEach((e) => m.set(e.id, timeToX(toMinutes(e.time))));
    return m;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortedEvents, minMinutes]);

  const eventY = (e: PlayerTimelineEvent) => {
    if (e.characterIds.length <= 1) return laneY.get(e.characterIds[0]) ?? 0;
    const ys = e.characterIds
      .map((id) => laneY.get(id))
      .filter((y): y is number => y !== undefined);
    return ys.reduce((a, b) => a + b, 0) / ys.length;
  };

  const ticks = useMemo(() => {
    if (sortedEvents.length === 0) return [];
    const first =
      Math.floor(minMinutes / TICK_INTERVAL_MIN) * TICK_INTERVAL_MIN;
    const last = Math.ceil(maxMinutes / TICK_INTERVAL_MIN) * TICK_INTERVAL_MIN;
    const result: number[] = [];
    for (let t = first; t <= last; t += TICK_INTERVAL_MIN) result.push(t);
    return result;
  }, [minMinutes, maxMinutes, sortedEvents.length]);

  const lastTick = ticks[ticks.length - 1] ?? maxMinutes;
  const graphY = laneCharIds.length * LANE_HEIGHT;
  const axisLineY = graphY + 10;

  const svgWidth = Math.max(timeToX(lastTick), timeToX(maxMinutes)) + PAD_X;
  const svgHeight = graphY + AXIS_HEIGHT;

  const selected = events.find((e) => e.id === selectedId) ?? null;

  return (
    <>
      <div style={{ ...sharedStyles.pillHeaderBase, justifyContent: "flex-start" }}>
        <div
          style={styles.titleCheckBtn}
          title={
            solved
              ? "Din tidslinje stämmer med den riktiga"
              : "Din tidslinje stämmer inte än"
          }
        >
          <span
            style={{
              ...sharedStyles.pillCheckCircle,
              ...(solved ? sharedStyles.pillCheckCircleDone : {}),
            }}
          >
            {solved && <Check size={12} color={theme.primaryText} />}
          </span>
        </div>
        <div style={styles.headerSpacer} />
        <button style={styles.addEventBtn} onClick={startCreate}>
          <Plus size={15} /> Händelse
        </button>
      </div>

      <div style={styles.card}>
        {laneCharIds.length === 0 ? (
          <div style={styles.empty}>
            Inga händelser tillagda än. Lägg till vad du tror hände.
          </div>
        ) : (
          <div style={styles.graphWrap}>
            <div style={styles.laneLabels}>
              {laneCharIds.map((id, i) => {
                const c = charById.get(id);
                const isSuspect = c?.role === "suspect";
                const prevIsSuspect =
                  charById.get(laneCharIds[i - 1])?.role === "suspect";
                const nextIsSuspect =
                  charById.get(laneCharIds[i + 1])?.role === "suspect";
                const roundTop = !isSuspect || !prevIsSuspect;
                const roundBottom = !isSuspect || !nextIsSuspect;
                return (
                  <div
                    key={id}
                    style={{
                      ...styles.laneLabel,
                      height: LANE_HEIGHT,
                      borderLeft: `2px solid ${theme.roleColors[c?.role ?? ""] ?? theme.textMuted}`,
                      borderRight: `2px solid ${theme.roleColors[c?.role ?? ""] ?? theme.textMuted}`,
                      borderTop: roundTop
                        ? `2px solid ${theme.roleColors[c?.role ?? ""] ?? theme.textMuted}`
                        : undefined,
                      borderBottom: roundBottom
                        ? `2px solid ${theme.roleColors[c?.role ?? ""] ?? theme.textMuted}`
                        : undefined,
                      borderTopLeftRadius: roundTop ? 32 : 0,
                      borderBottomLeftRadius: roundBottom ? 32 : 0,
                      borderTopRightRadius: roundTop ? 32 : 0,
                      borderBottomRightRadius: roundBottom ? 32 : 0,
                    }}
                  >
                    <div style={styles.laneAvatar} title={c?.name}>
                      {c?.imageUrl ? (
                        <img
                          src={c.imageUrl}
                          alt={c.name}
                          style={sharedStyles.imgCover}
                        />
                      ) : (
                        <User size={20} color={theme.textFaint} />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={styles.graphScroll}>
              <svg width={svgWidth} height={svgHeight}>
                <rect
                  x={0}
                  y={0}
                  width={svgWidth}
                  height={graphY}
                  fill={theme.cardBg}
                  stroke={theme.cardBorder}
                  strokeWidth={1}
                />
                {laneCharIds.slice(0, -1).map((id, i) => (
                  <line
                    key={`divider-${id}`}
                    x1={0}
                    y1={(i + 1) * LANE_HEIGHT}
                    x2={svgWidth}
                    y2={(i + 1) * LANE_HEIGHT}
                    stroke={theme.cardBorder}
                    strokeWidth={1}
                  />
                ))}

                <line
                  x1={0}
                  y1={axisLineY}
                  x2={svgWidth}
                  y2={axisLineY}
                  stroke={theme.textMuted}
                  strokeWidth={1}
                />
                {ticks.map((t) => {
                  const x = timeToX(t);
                  return (
                    <g key={`tick-${t}`}>
                      <line
                        x1={x}
                        y1={axisLineY - 4}
                        x2={x}
                        y2={axisLineY + 4}
                        stroke={theme.textMuted}
                        strokeWidth={1}
                      />
                      <text
                        x={x}
                        y={axisLineY + 18}
                        textAnchor="middle"
                        fontSize={14}
                        fill={theme.textMuted}
                      >
                        {formatMinutes(t)}
                      </text>
                    </g>
                  );
                })}
                {laneCharIds.map((id) => {
                  const evs = sortedEvents.filter((e) =>
                    e.characterIds.includes(id),
                  );
                  if (evs.length < 2) return null;
                  let d = "";
                  evs.forEach((e, i) => {
                    const x = eventX.get(e.id)!;
                    const y = eventY(e);
                    if (i === 0) {
                      d += `M ${x},${y}`;
                    } else {
                      const prevX = eventX.get(evs[i - 1].id)!;
                      const prevY = eventY(evs[i - 1]);
                      if (prevY === y) {
                        d += ` L ${x},${y}`;
                      } else {
                        const midX = (prevX + x) / 2;
                        d += ` C ${midX},${prevY} ${midX},${y} ${x},${y}`;
                      }
                    }
                  });
                  const role = charById.get(id)?.role;
                  const strokeDasharray =
                    role === "witness"
                      ? "2 4"
                      : role === "suspect"
                        ? "8 5"
                        : role === "detective"
                          ? "8 4 2 4"
                          : undefined;
                  return (
                    <path
                      key={id}
                      d={d}
                      fill="none"
                      stroke={
                        theme.roleColors[role ?? ""] ?? theme.divider
                      }
                      strokeWidth={2.5}
                      strokeDasharray={strokeDasharray}
                      opacity={0.55}
                    />
                  );
                })}

                {sortedEvents.map((e) => {
                  const x = eventX.get(e.id)!;
                  const y = eventY(e);
                  const isMerge = e.characterIds.length > 1;
                  const isSelected = e.id === selectedId;
                  return (
                    <g
                      key={e.id}
                      onClick={() => setSelectedId(isSelected ? null : e.id)}
                      style={{ cursor: "pointer" }}
                    >
                      <circle
                        cx={x}
                        cy={y}
                        r={isMerge ? 10 : 7}
                        fill={isMerge ? theme.accent : theme.cardBg}
                        stroke={theme.accent}
                        strokeWidth={isSelected ? 4 : 2.5}
                      />
                    </g>
                  );
                })}
              </svg>
            </div>
            <div style={styles.scrollShadow} />
          </div>
        )}

        {selected && (
          <Modal onClose={() => setSelectedId(null)}>
            <div style={styles.detailTop}>
              <div style={styles.detailTime}>
                <Clock size={12} /> {selected.time || "Okänd tid"}
              </div>
              <div style={styles.detailActions}>
                <button
                  style={sharedStyles.iconBtn}
                  onClick={() => startEdit(selected)}
                  title="Redigera"
                >
                  <Edit2 size={15} />
                </button>
                <button
                  style={{ ...sharedStyles.iconBtn, color: theme.primary }}
                  onClick={() => {
                    onRemoveEvent(selected.id);
                    setSelectedId(null);
                  }}
                  title="Ta bort"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
            <p style={styles.detailDesc}>
              {selected.description || "Ingen beskrivning tillagd."}
            </p>
            <div style={styles.detailChips}>
              {selected.characterIds.map((id) => (
                <span key={id} style={styles.detailChip}>
                  {charById.get(id)?.name ?? "Okänd"}
                </span>
              ))}
            </div>
          </Modal>
        )}
      </div>

      {showForm && (
        <TimelineEventFormModal
          creating={creating}
          draft={draft}
          characters={game.characters}
          onChange={setDraft}
          onCancel={cancelForm}
          onSave={saveForm}
          showRevealedToggle={false}
        />
      )}
    </>
  );
}

const styles: Record<string, React.CSSProperties> = {
  headerSpacer: { flex: 1 },
  titleCheckBtn: {
    background: "none",
    border: "none",
    outline: "none",
    padding: 0,
  },
  addEventBtn: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    background: theme.textFaint,
    color: theme.primaryText,
    border: `1px solid ${theme.textFaint}`,
    borderRadius: 20,
    padding: "7px 16px",
    fontWeight: 700,
    fontSize: 13,
    cursor: "pointer",
  },
  card: {
    background: theme.cardBg,
    border: `1px solid ${theme.textFaint}`,
    borderRadius: 16,
  },
  empty: { color: theme.textFaint, fontSize: 14, padding: "12px 0" },
  graphWrap: {
    borderRadius: 16,
    display: "flex",
    position: "relative",
  },
  scrollShadow: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    width: 20,
    pointerEvents: "none",
  },
  laneLabels: {
    borderRadius: "14px 0px 0px 14px",
    display: "flex",
    flexDirection: "column",
    flexShrink: 0,
    width: 64,
    padding: "10px 0px 0px 8px",
    background: theme.cardBg,
  },
  laneLabel: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    background: "#fff",
  },
  laneAvatar: {
    width: 40,
    height: 40,
    borderRadius: "50%",
    background: theme.inputBg,
    marginLeft: 6,
    border: `1px solid ${theme.inputBorder}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    flexShrink: 0,
  },
  graphScroll: {
    marginTop: 4,
    overflowX: "auto",
    flex: 1,
    marginRight: 8,
    borderRadius: "0 20 20 0",
    margin: "10px 10px 10px 10px",
  },
  detailTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  detailTime: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: 12,
    fontWeight: 700,
    color: theme.textFaint,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  detailActions: { display: "flex", gap: 8 },
  detailDesc: {
    margin: "0 0 10px",
    fontSize: 14,
    color: theme.text,
    lineHeight: 1.5,
  },
  detailChips: { display: "flex", gap: 6, flexWrap: "wrap" },
  detailChip: {
    fontSize: 12,
    background: theme.accentBg,
    color: theme.textFaint,
    padding: "2px 8px",
    borderRadius: 20,
  },
};
