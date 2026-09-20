import React, { useEffect, useMemo, useState } from "react";
import {
  Clock,
  Eye,
  EyeOff,
  Plus,
  Edit2,
  Trash2,
  X,
  Check,
  User,
  ArrowRight,
} from "lucide-react";
import { useGame } from "../context/GameContext";
import { useAuth } from "../context/AuthContext";
import { TimelineEvent } from "../types";
import { theme } from "../theme";
import { sharedStyles } from "../shared/styles";
import Modal from "./Modal";
import CharacterPill from "./CharacterPill";

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
  events: TimelineEvent[],
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

const emptyDraft = (): {
  time: string;
  description: string;
  characterIds: string[];
  revealed: boolean;
} => ({
  time: "",
  description: "",
  characterIds: [],
  revealed: true,
});

const uid = () => Math.random().toString(36).slice(2, 10);

interface TimelineGuess {
  id: string;
  time: string;
  description: string;
}

const GUESS_KEY = "mystery-timeline-guesses";

function loadGuesses(): Record<string, TimelineGuess[]> {
  try {
    const saved = localStorage.getItem(GUESS_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

function normalize(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[.,;:!?]+$/, "");
}

export default function CaseTimeline({
  onSolvedChange,
}: {
  onSolvedChange?: (solved: boolean) => void;
} = {}) {
  const {
    game,
    addTimelineEvent,
    updateTimelineEvent,
    removeTimelineEvent,
    setTimelineEventRevealed,
  } = useGame();
  const { isAdmin } = useAuth();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState(emptyDraft());

  const [guesses, setGuesses] =
    useState<Record<string, TimelineGuess[]>>(loadGuesses);
  const [guessCharId, setGuessCharId] = useState<string | null>(null);
  const [guessDraft, setGuessDraft] = useState({ time: "", description: "" });
  const [pickerOpen, setPickerOpen] = useState(false);

  const addGuess = () => {
    if (!guessCharId || !guessDraft.time || !guessDraft.description.trim())
      return;
    setGuesses((prev) => {
      const next = {
        ...prev,
        [guessCharId]: [
          ...(prev[guessCharId] ?? []),
          { id: uid(), ...guessDraft },
        ],
      };
      try {
        localStorage.setItem(GUESS_KEY, JSON.stringify(next));
      } catch {
        // ignore storage errors
      }
      return next;
    });
    setGuessDraft({ time: "", description: "" });
  };

  const removeGuess = (charId: string, id: string) => {
    setGuesses((prev) => {
      const next = {
        ...prev,
        [charId]: (prev[charId] ?? []).filter((g) => g.id !== id),
      };
      try {
        localStorage.setItem(GUESS_KEY, JSON.stringify(next));
      } catch {
        // ignore storage errors
      }
      return next;
    });
  };

  const correctByChar = useMemo(() => {
    const m = new Map<string, { time: string; description: string }[]>();
    game.characters.forEach((c) => {
      const evs = game.timelineEvents
        .filter((e) => e.revealed && e.characterIds.includes(c.id))
        .map((e) => ({ time: e.time, description: e.description }));
      m.set(c.id, evs);
    });
    return m;
  }, [game.characters, game.timelineEvents]);

  const hasTimeline = (charId: string): boolean =>
    (correctByChar.get(charId) ?? []).length > 0;

  const isCharacterSolved = (charId: string): boolean => {
    const correct = correctByChar.get(charId) ?? [];
    if (correct.length === 0) return true;
    const guessed = guesses[charId] ?? [];
    if (guessed.length !== correct.length) return false;
    const correctSet = new Set(
      correct.map((e) => `${e.time}|${normalize(e.description)}`),
    );
    const guessedSet = new Set(
      guessed.map((g) => `${g.time}|${normalize(g.description)}`),
    );
    if (correctSet.size !== guessedSet.size) return false;
    for (const key of Array.from(correctSet)) {
      if (!guessedSet.has(key)) return false;
    }
    return true;
  };

  const visibleEvents = useMemo(
    () =>
      [...game.timelineEvents]
        .filter((e) => isAdmin || e.revealed)
        .sort((a, b) => a.time.localeCompare(b.time)),
    [game.timelineEvents, isAdmin],
  );

  const laneCharIds = useMemo(() => {
    const allCharacterIds = [...game.characters]
      .sort(
        (a, b) =>
          (theme.roleOrder[a.role] ?? 99) - (theme.roleOrder[b.role] ?? 99),
      )
      .map((c) => c.id);
    return computeLaneOrder(allCharacterIds, visibleEvents);
  }, [visibleEvents, game.characters]);

  // Hardcoded true for now — restore the real check below once character
  // selection is confirmed working.
  const allSolved = true;
  // const allSolved =
  //   laneCharIds.length > 0 && laneCharIds.every((id) => isCharacterSolved(id));

  useEffect(() => {
    onSolvedChange?.(allSolved);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allSolved]);

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
    if (visibleEvents.length === 0) return 0;
    return Math.min(...visibleEvents.map((e) => toMinutes(e.time)));
  }, [visibleEvents]);

  const maxMinutes = useMemo(() => {
    if (visibleEvents.length === 0) return 0;
    return Math.max(...visibleEvents.map((e) => toMinutes(e.time)));
  }, [visibleEvents]);

  const timeToX = (minutes: number) =>
    PAD_X + (minutes - minMinutes) * PX_PER_MIN;

  const eventX = useMemo(() => {
    const m = new Map<string, number>();
    visibleEvents.forEach((e) => m.set(e.id, timeToX(toMinutes(e.time))));
    return m;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleEvents, minMinutes]);

  const eventY = (e: TimelineEvent) => {
    if (e.characterIds.length <= 1) return laneY.get(e.characterIds[0]) ?? 0;
    const ys = e.characterIds
      .map((id) => laneY.get(id))
      .filter((y): y is number => y !== undefined);
    return ys.reduce((a, b) => a + b, 0) / ys.length;
  };

  const ticks = useMemo(() => {
    if (visibleEvents.length === 0) return [];
    const first =
      Math.floor(minMinutes / TICK_INTERVAL_MIN) * TICK_INTERVAL_MIN;
    const last = Math.ceil(maxMinutes / TICK_INTERVAL_MIN) * TICK_INTERVAL_MIN;
    const result: number[] = [];
    for (let t = first; t <= last; t += TICK_INTERVAL_MIN) result.push(t);
    return result;
  }, [minMinutes, maxMinutes, visibleEvents.length]);

  const lastTick = ticks[ticks.length - 1] ?? maxMinutes;
  const graphY = laneCharIds.length * LANE_HEIGHT;
  const axisLineY = graphY + 10;

  const svgWidth = Math.max(timeToX(lastTick), timeToX(maxMinutes)) + PAD_X;
  const svgHeight = graphY + AXIS_HEIGHT;

  const startCreate = () => {
    setDraft(emptyDraft());
    setCreating(true);
    setEditingId(null);
    setSelectedId(null);
  };
  const startEdit = (e: TimelineEvent) => {
    setDraft({
      time: e.time,
      description: e.description,
      characterIds: e.characterIds,
      revealed: e.revealed,
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
    if (creating) addTimelineEvent(draft);
    else if (editingId) updateTimelineEvent({ ...draft, id: editingId });
    cancelForm();
  };
  const toggleDraftChar = (id: string) => {
    setDraft((d) => ({
      ...d,
      characterIds: d.characterIds.includes(id)
        ? d.characterIds.filter((x) => x !== id)
        : [...d.characterIds, id],
    }));
  };

  const selected = game.timelineEvents.find((e) => e.id === selectedId) ?? null;
  const showForm = isAdmin && (creating || editingId);

  return (
    <>
      <div style={{ ...sharedStyles.pillHeaderBase, justifyContent: "flex-start" }}>
        <div
          style={styles.titleCheckBtn}
          title={
            allSolved
              ? "Alla karaktärers tidslinjer är lösta"
              : "Inte alla karaktärers tidslinjer är lösta än"
          }
        >
          <span
            style={{
              ...sharedStyles.pillCheckCircle,
              ...(allSolved ? sharedStyles.pillCheckCircleDone : {}),
            }}
          >
            {allSolved && <Check size={12} color={theme.primaryText} />}
          </span>
        </div>
        <div style={styles.headerSpacer} />
        <button
          style={styles.addEventBtn}
          onClick={() => (isAdmin ? startCreate() : setPickerOpen(true))}
        >
          <Plus size={15} /> Händelse
        </button>
      </div>

      <div style={styles.card}>
        {laneCharIds.length === 0 ? (
          <div style={styles.empty}>No timeline events yet.</div>
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
                    <div
                      style={{
                        ...styles.laneAvatar,
                        cursor: "pointer",
                      }}
                      onClick={() => setGuessCharId(id)}
                      title={c?.name}
                    >
                      {hasTimeline(id) && isCharacterSolved(id) ? (
                        <div style={styles.laneSolvedCheck}>
                          <Check size={18} color={theme.primaryText} />
                        </div>
                      ) : c?.imageUrl ? (
                        <img
                          src={c.imageUrl}
                          alt={c.name}
                          style={sharedStyles.imgCover}
                        />
                      ) : (
                        <User size={20} color={theme.textFaint} />
                      )}
                    </div>
                    {/*  <span style={styles.laneName}>{c?.initials ?? "?"}</span> */}
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
                  const evs = visibleEvents.filter((e) =>
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

                {visibleEvents.map((e) => {
                  const x = eventX.get(e.id)!;
                  const y = eventY(e);
                  const isMerge = e.characterIds.length > 1;
                  const isHidden = !e.revealed;
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
                        fill={
                          isHidden
                            ? theme.cardBg
                            : isMerge
                              ? theme.accent
                              : theme.cardBg
                        }
                        stroke={isHidden ? theme.textFaint : theme.accent}
                        strokeWidth={isSelected ? 4 : 2.5}
                        strokeDasharray={isHidden ? "3 3" : undefined}
                        opacity={isHidden ? 0.6 : 1}
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
                <Clock size={12} /> {selected.time || "Unknown time"}
                {!selected.revealed && (
                  <span style={styles.hiddenTag}>
                    <EyeOff size={11} /> Hidden
                  </span>
                )}
              </div>
              {isAdmin && (
                <div style={styles.detailActions}>
                  <button
                    style={sharedStyles.iconBtn}
                    onClick={() =>
                      setTimelineEventRevealed(selected.id, !selected.revealed)
                    }
                    title={
                      selected.revealed
                        ? "Hide from players"
                        : "Reveal to players"
                    }
                  >
                    {selected.revealed ? (
                      <EyeOff size={15} />
                    ) : (
                      <Eye size={15} />
                    )}
                  </button>
                  <button
                    style={sharedStyles.iconBtn}
                    onClick={() => startEdit(selected)}
                  >
                    <Edit2 size={15} />
                  </button>
                  <button
                    style={{ ...sharedStyles.iconBtn, color: theme.primary }}
                    onClick={() => {
                      removeTimelineEvent(selected.id);
                      setSelectedId(null);
                    }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              )}
            </div>
            <p style={styles.detailDesc}>
              {selected.description || "No details added."}
            </p>
            <div style={styles.detailChips}>
              {selected.characterIds.map((id) => (
                <span key={id} style={styles.detailChip}>
                  {charById.get(id)?.name ?? "Unknown"}
                </span>
              ))}
            </div>
          </Modal>
        )}

        {showForm && (
          <Modal onClose={cancelForm}>
            <h3 style={styles.formTitle}>
              {creating ? "New Event" : "Edit Event"}
            </h3>
            <div style={styles.formRow}>
              <input
                type="time"
                style={styles.timeInput}
                value={draft.time}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, time: e.target.value }))
                }
              />
            </div>
            <textarea
              style={styles.textarea}
              value={draft.description}
              onChange={(e) =>
                setDraft((d) => ({ ...d, description: e.target.value }))
              }
              placeholder="What happens at this moment?"
              rows={10}
            />
            <div style={styles.charPicker}>
              {game.characters.map((c) => (
                <CharacterPill
                  key={c.id}
                  character={c}
                  selected={draft.characterIds.includes(c.id)}
                  onClick={() => toggleDraftChar(c.id)}
                />
              ))}
            </div>
            <div style={sharedStyles.formActions}>
              <button style={styles.btnSecondary} onClick={cancelForm}>
                <X size={15} /> Cancel
              </button>
              <button style={styles.btn} onClick={saveForm}>
                <Check size={15} /> Save
              </button>
            </div>
          </Modal>
        )}
      </div>

      {pickerOpen && (
        <Modal onClose={() => setPickerOpen(false)}>
          <h3 style={styles.formTitle}>Vems tidslinje vill du lägga till?</h3>
          <div style={styles.charPicker}>
            {game.characters.map((c) => (
              <CharacterPill
                key={c.id}
                character={c}
                selected={false}
                onClick={() => {
                  setGuessCharId(c.id);
                  setPickerOpen(false);
                }}
              />
            ))}
          </div>
        </Modal>
      )}

      {guessCharId && (
        <Modal onClose={() => setGuessCharId(null)}>
          <h3 style={styles.formTitle}>
            {charById.get(guessCharId)?.name ?? "Karaktär"}s tidslinje
          </h3>
          <div style={styles.formRow}>
            <input
              type="time"
              style={styles.timeInput}
              value={guessDraft.time}
              onChange={(e) =>
                setGuessDraft((d) => ({ ...d, time: e.target.value }))
              }
            />
          </div>
          <textarea
            style={styles.textarea}
            value={guessDraft.description}
            onChange={(e) =>
              setGuessDraft((d) => ({ ...d, description: e.target.value }))
            }
            placeholder="Vad hände vid den här tiden?"
            rows={2}
          />
          <div style={sharedStyles.formActions}>
            <button style={styles.btn} onClick={addGuess}>
              <Plus size={15} /> Lägg till händelse
            </button>
          </div>

          {(guesses[guessCharId] ?? []).length > 0 && (
            <div style={styles.guessList}>
              {(guesses[guessCharId] ?? []).map((g) => (
                <div key={g.id} style={styles.guessListItem}>
                  <span style={styles.guessListTime}>{g.time}</span>
                  <span style={styles.guessListDesc}>{g.description}</span>
                  <button
                    style={sharedStyles.iconBtn}
                    onClick={() => removeGuess(guessCharId, g.id)}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {isCharacterSolved(guessCharId) ? (
            <p style={styles.guessCorrect}>Rätt! Tidslinjen stämmer.</p>
          ) : (
            <p style={styles.guessIncorrect}>Tidslinjen stämmer inte än.</p>
          )}
        </Modal>
      )}

      {/*  {laneCharIds.length > 0 && (
        <div style={styles.scrollHint}>
          Scrolla för mer <ArrowRight size={13} />
        </div>
      )} */}
    </>
  );
}

const styles: Record<string, React.CSSProperties> = {
  scrollHint: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 4,
    marginTop: 2,
    fontSize: 12,
    color: theme.textMuted,
  },
  headerSpacer: { flex: 1 },
  titleCheckBtn: {
    background: "none",
    border: "none",
    outline: "none",
    padding: 0,
  },
  btn: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    background: theme.textFaint,
    color: theme.primaryText,
    border: "none",
    borderRadius: 7,
    padding: "7px 14px",
    fontWeight: 700,
    fontSize: 13,
    cursor: "pointer",
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
  btnSecondary: {
    display: "flex",
    borderRadius: 7,
    alignItems: "center",
    gap: 6,
    background: theme.secondaryBg,
    color: theme.secondaryText,
    border: "none",
    padding: "8px 16px",
    fontWeight: 600,
    fontSize: 14,
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
  laneSolvedCheck: {
    width: "100%",
    height: "100%",
    background: theme.success,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  laneName: {
    fontSize: 14,
    fontWeight: 600,
    color: theme.text,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
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
  hiddenTag: {
    display: "flex",
    alignItems: "center",
    gap: 3,
    background: theme.secondaryBg,
    color: theme.textMuted,
    padding: "2px 6px",
    borderRadius: 10,
    fontSize: 10,
    textTransform: "none" as const,
    letterSpacing: 0,
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
  formTitle: {
    margin: "0 0 12px",
    fontSize: 15,
    fontWeight: 600,
    color: theme.textFaint,
  },
  formRow: { display: "flex", alignItems: "center", gap: 16, marginBottom: 10 },
  timeInput: {
    background: theme.cardBg,
    border: `1px solid ${theme.inputBorder}`,
    borderRadius: 7,
    color: theme.text,
    padding: "7px 10px",
    fontSize: 14,
    fontFamily: "inherit",
  },
  textarea: {
    width: "100%",
    background: theme.cardBg,
    border: `1px solid ${theme.inputBorder}`,
    borderRadius: 7,
    color: theme.text,
    padding: "8px 12px",
    fontSize: 14,
    fontFamily: "inherit",
    resize: "vertical",
    boxSizing: "border-box",
    marginBottom: 10,
  },
  charPicker: { display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 14 },
  guessList: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    marginTop: 0,
  },
  guessListItem: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    background: theme.inputBg,
    border: `1px solid ${theme.inputBorder}`,
    borderRadius: 7,
    padding: "6px 10px",
  },
  guessListTime: {
    fontSize: 12,
    fontWeight: 700,
    color: theme.textFaint,
    flexShrink: 0,
  },
  guessListDesc: { fontSize: 13, color: theme.text, flex: 1 },
  guessCorrect: {
    marginTop: 12,
    marginBottom: 0,
    fontSize: 14,
    fontWeight: 700,
    color: theme.success,
  },
  guessIncorrect: {
    marginTop: 12,
    marginBottom: 0,
    fontSize: 13,
    color: theme.textMuted,
  },
};
