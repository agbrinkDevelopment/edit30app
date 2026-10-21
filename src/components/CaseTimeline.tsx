import React, { useMemo, useState } from "react";
import { Check, Clock, Edit2, Plus, Trash2, User } from "lucide-react";
import { useGame } from "../context/GameContext";
import { PlayerTimelineEvent } from "../types";
import { theme } from "../theme";
import SectionCheckCircle from "./SectionCheckCircle";
import { sharedStyles } from "../shared/styles";
import Modal from "./Modal";
import TimelineEventFormModal, {
  emptyTimelineEventDraft,
} from "./TimelineEventFormModal";
import { formatMinutes, sortByRole, toMinutes } from "../shared/helpers";
import { fileSrc } from "../api/client";

const LANE_HEIGHT = 56;
const PX_PER_MIN = 5;
const PAD_X = 30;
const AXIS_HEIGHT = 32;
const TICK_INTERVAL_MIN = 30;
// Half the width of the outline drawn around an event's dots.
const EVENT_PILL_RADIUS = 16;
// The timeline is split in three by two dividers spanning every row: the
// events before 18:00 lead up to the first, the ones from 20:00 on lead away
// from the second, and the players fill in what happened in between (shaded).
const DIVIDER_START = toMinutes("18:00");
const DIVIDER_END = toMinutes("20:00");
const MIDDLE_BG = "#efebe3";

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

export default function CaseTimeline({
  events,
  solved,
  solvedCharacterIds,
  onAddEvent,
  onUpdateEvent,
  onRemoveEvent,
  readOnly = false,
}: {
  // Finished or skipped: still scrollable and events can be opened, but
  // nothing can be added, edited or removed.
  readOnly?: boolean;
  events: PlayerTimelineEvent[];
  solved: boolean;
  // Characters whose lane is complete; their avatar gets a check badge.
  solvedCharacterIds: string[];
  onAddEvent: (e: Omit<PlayerTimelineEvent, "id">) => void;
  onUpdateEvent: (e: PlayerTimelineEvent) => void;
  onRemoveEvent: (id: string) => void;
}) {
  const { game } = useGame();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
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

  // Always wide enough to show both dividers.
  const minMinutes = useMemo(
    () =>
      Math.min(DIVIDER_START, ...sortedEvents.map((e) => toMinutes(e.time))),
    [sortedEvents],
  );

  const maxMinutes = useMemo(
    () => Math.max(DIVIDER_END, ...sortedEvents.map((e) => toMinutes(e.time))),
    [sortedEvents],
  );

  const timeToX = (minutes: number) =>
    PAD_X + (minutes - minMinutes) * PX_PER_MIN;

  const eventX = useMemo(() => {
    const m = new Map<string, number>();
    sortedEvents.forEach((e) => m.set(e.id, timeToX(toMinutes(e.time))));
    return m;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortedEvents, minMinutes]);

  const ticks = useMemo(() => {
    const first =
      Math.floor(minMinutes / TICK_INTERVAL_MIN) * TICK_INTERVAL_MIN;
    const last = Math.ceil(maxMinutes / TICK_INTERVAL_MIN) * TICK_INTERVAL_MIN;
    const result: number[] = [];
    for (let t = first; t <= last; t += TICK_INTERVAL_MIN) result.push(t);
    return result;
  }, [minMinutes, maxMinutes]);

  const lastTick = ticks[ticks.length - 1] ?? maxMinutes;
  const graphY = laneCharIds.length * LANE_HEIGHT;
  const axisLineY = graphY + 10;

  const svgWidth = Math.max(timeToX(lastTick), timeToX(maxMinutes)) + PAD_X;
  const svgHeight = graphY + AXIS_HEIGHT;

  const selected = events.find((e) => e.id === selectedId) ?? null;

  return (
    <>
      <div
        style={{ ...sharedStyles.pillHeaderBase, justifyContent: "flex-start" }}
      >
        <div
          style={styles.titleCheckBtn}
          title={
            solved
              ? "Din tidslinje stämmer med den riktiga"
              : "Din tidslinje stämmer inte än"
          }
        >
          <SectionCheckCircle
            sectionId="tidslinje"
            done={solved}
            baseStyle={sharedStyles.pillCheckCircle}
            doneStyle={sharedStyles.pillCheckCircleDone}
            iconSize={12}
          />
        </div>
        <div style={styles.headerSpacer} />
        {!readOnly && (
          <button style={styles.addEventBtn} onClick={startCreate}>
            <Plus size={15} /> Händelse
          </button>
        )}
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
                    {/* The avatar clips its image, so the badge sits on a
                        wrapper around it instead. */}
                    <div style={styles.laneAvatarWrap}>
                      <div
                        style={{
                          ...styles.laneAvatar,
                          ...(solvedCharacterIds.includes(id)
                            ? { borderColor: theme.success }
                            : {}),
                        }}
                        title={c?.name}
                      >
                        {c?.imageUrl ? (
                          <img
                            src={fileSrc(c.imageUrl)}
                            alt={c.name}
                            style={sharedStyles.imgCover}
                          />
                        ) : (
                          <User size={20} color={theme.textFaint} />
                        )}
                      </div>
                      {solvedCharacterIds.includes(id) && (
                        <span
                          style={styles.laneAvatarCheck}
                          title="Tidslinjen för den här karaktären stämmer"
                        >
                          <Check size={9} color={theme.primaryText} />
                        </span>
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
                {/* The players' part, between the two dividers. */}
                <rect
                  x={timeToX(DIVIDER_START)}
                  y={0}
                  width={timeToX(DIVIDER_END) - timeToX(DIVIDER_START)}
                  height={graphY}
                  fill={MIDDLE_BG}
                />
                {/* Its left and right borders. */}
                {[DIVIDER_START, DIVIDER_END].map((t) => (
                  <line
                    key={`middle-border-${t}`}
                    x1={timeToX(t)}
                    y1={0}
                    x2={timeToX(t)}
                    y2={graphY}
                    stroke={theme.accent}
                    strokeWidth={1}
                  />
                ))}
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
                  const minutes = evs.map((e) => toMinutes(e.time));
                  const before = minutes.filter((m) => m < DIVIDER_START);
                  const between = minutes.filter(
                    (m) => m >= DIVIDER_START && m < DIVIDER_END,
                  );
                  const after = minutes.filter((m) => m >= DIVIDER_END);
                  // Straight lines along the character's own row: from
                  // their first event to the 18:00 divider, across the
                  // middle when they have events there, and from the 20:00
                  // divider to their last event.
                  const segments: [number, number][] = [];
                  if (before.length) segments.push([before[0], DIVIDER_START]);
                  if (between.length)
                    segments.push([DIVIDER_START, DIVIDER_END]);
                  if (after.length)
                    segments.push([DIVIDER_END, after[after.length - 1]]);
                  const y = laneY.get(id)!;
                  const role = charById.get(id)?.role;
                  const strokeDasharray =
                    role === "witness"
                      ? "2 4"
                      : role === "suspect"
                        ? "8 5"
                        : role === "detective"
                          ? "8 4 2 4"
                          : undefined;
                  return segments.map(([from, to]) => (
                    <line
                      key={`${id}-${from}`}
                      x1={timeToX(from)}
                      y1={y}
                      x2={timeToX(to)}
                      y2={y}
                      stroke={theme.roleColors[role ?? ""] ?? theme.divider}
                      strokeWidth={2.5}
                      strokeDasharray={strokeDasharray}
                      opacity={0.55}
                    />
                  ));
                })}

                {/* The two dividers: an empty outline across every row,
                    shaped like an event's. */}
                {[DIVIDER_START, DIVIDER_END].map((t) => (
                  <rect
                    key={`split-${t}`}
                    x={timeToX(t) - EVENT_PILL_RADIUS}
                    y={LANE_HEIGHT / 2 - EVENT_PILL_RADIUS}
                    width={EVENT_PILL_RADIUS * 2}
                    height={
                      (laneCharIds.length - 1) * LANE_HEIGHT +
                      EVENT_PILL_RADIUS * 2
                    }
                    rx={EVENT_PILL_RADIUS}
                    fill={theme.cardBg}
                    stroke={theme.accent}
                    strokeWidth={1.5}
                  />
                ))}

                {sortedEvents.map((e) => {
                  const x = eventX.get(e.id)!;
                  return (
                    <g
                      key={e.id}
                      onClick={() => {
                        setSelectedId(e.id);
                      }}
                      style={{ cursor: "pointer" }}
                    >
                      {/* An event is a dot on each participant's row,
                          grouped by a rounded outline (a plain circle when
                          there's only one participant). */}
                      {(() => {
                        const ys = e.characterIds
                          .map((id) => laneY.get(id))
                          .filter((v): v is number => v !== undefined);
                        if (ys.length === 0) return null;
                        const top = Math.min(...ys) - EVENT_PILL_RADIUS;
                        const bottom = Math.max(...ys) + EVENT_PILL_RADIUS;
                        return (
                          <rect
                            x={x - EVENT_PILL_RADIUS}
                            y={top}
                            width={EVENT_PILL_RADIUS * 2}
                            height={bottom - top}
                            rx={EVENT_PILL_RADIUS}
                            fill={theme.cardBg}
                            stroke={theme.accent}
                            strokeWidth={1.5}
                          />
                        );
                      })()}
                      {e.characterIds.map((id) => {
                        const rowY = laneY.get(id);
                        if (rowY === undefined) return null;
                        return (
                          <circle
                            key={id}
                            cx={x}
                            cy={rowY}
                            r={5}
                            fill={
                              theme.roleColors[charById.get(id)?.role ?? ""] ??
                              theme.accent
                            }
                          />
                        );
                      })}
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
              {!readOnly && (
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
              )}
            </div>
            <p style={styles.detailDesc}>
              {selected.description || "Ingen beskrivning tillagd."}
            </p>
            <div style={styles.detailChips}>
              {sortByRole(
                selected.characterIds.map((id) => ({
                  id,
                  name: charById.get(id)?.name ?? "Okänd",
                  role: charById.get(id)?.role ?? "",
                })),
              ).map((c) => (
                <span
                  key={c.id}
                  style={{
                    ...styles.detailChip,
                    borderColor: theme.roleColors[c.role] ?? theme.inputBorder,
                  }}
                >
                  {c.name}
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
  empty: {
    width: "100%",
    boxSizing: "border-box",
    minHeight: 120,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    color: theme.textFaint,
    fontSize: 14,
    padding: "24px 16px",
  },
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
  laneAvatarWrap: {
    position: "relative",
    flexShrink: 0,
  },
  laneAvatarCheck: {
    position: "absolute",
    top: -3,
    right: -5,
    width: 16,
    height: 16,
    borderRadius: "50%",
    background: theme.success,
    border: `1.5px solid ${theme.cardBg}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  laneAvatar: {
    width: 40,
    height: 40,
    borderRadius: "50%",
    background: theme.inputBg,
    marginLeft: 6,
    // Longhands: borderColor turns green when the lane is complete.
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: theme.inputBorder,
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
    paddingRight: 32,
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
    background: theme.cardBg,
    color: theme.textFaint,
    padding: "2px 8px",
    borderRadius: 20,
    // Colour is set per character (their role colour) where it's rendered.
    border: "1.5px solid transparent",
  },
};
