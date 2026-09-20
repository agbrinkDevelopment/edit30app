import { useNavigate } from "react-router-dom";
import { Character, GameState } from "../types";
import { styles as sharedStyles } from "../shared/styles";
import { roleColor, subsectionKey } from "../shared/helpers";
import { theme } from "../theme";
import { Check, ChevronRight, User } from "lucide-react";
import SubsectionHeader from "./SubsectionHeader";
import Timeline from "./Timeline";

export default function CharacterGrid({
  characters,
  game,
  isAdmin,
  progress,
  onToggleDone,
}: {
  characters: Character[];
  game: GameState;
  isAdmin: boolean;
  progress: Record<string, boolean>;
  onToggleDone: (id: string) => void;
}) {
  const navigate = useNavigate();
  return (
    <div style={styles.grid}>
      {characters.map((c) => {
        const kartanDone = !!progress[subsectionKey(c.id, "kartan")];
        const tidslinjeDone = !!progress[subsectionKey(c.id, "tidslinje")];
        const evidenceDone = !!progress[subsectionKey(c.id, "evidence")];
        const done = kartanDone && tidslinjeDone && evidenceDone;
        return (
          <div
            key={c.id}
            style={{
              ...sharedStyles.victimCard,
              borderColor:
                isAdmin && c.isKiller ? theme.primary : theme.textFaint,
              borderLeft: `4px solid ${roleColor(c.role)}`,
            }}
          >
            <div
              style={sharedStyles.cardCheckBtn}
              title={
                done
                  ? "Alla delar av utredningen är klara"
                  : "Inte alla delar av utredningen är klara än"
              }
            >
              <span
                style={{
                  ...sharedStyles.cardCheckCircle,
                  ...(done ? sharedStyles.cardCheckCircleDone : {}),
                }}
              >
                {done && <Check size={11} color={theme.primaryText} />}
              </span>
            </div>
            <div style={{ ...sharedStyles.victimHeader, marginBottom: 0 }}>
              <div style={sharedStyles.victimPhoto}>
                {c.imageUrl ? (
                  <img
                    src={c.imageUrl}
                    alt={c.name}
                    style={sharedStyles.victimPhotoImg}
                  />
                ) : (
                  <User size={32} color={theme.textFaint} />
                )}
              </div>
              <div>
                <div style={sharedStyles.cardNameRow}>
                  <span style={{ ...sharedStyles.victimName, marginBottom: 0 }}>
                    {c.name}
                  </span>
                  <span
                    style={{
                      ...sharedStyles.badge,
                      background: roleColor(c.role),
                    }}
                  >
                    {theme.roleLabels[c.role] ?? c.role}
                  </span>
                </div>
                {c.description && (
                  <p style={sharedStyles.victimDesc}>{c.description}</p>
                )}
              </div>
            </div>

            <div style={sharedStyles.investigationSection}>
              <h3 style={sharedStyles.investigationTitle}>Utredningen</h3>
              <div style={sharedStyles.investigationSub}>
                <SubsectionHeader
                  title="Kartan"
                  checked={kartanDone}
                  onToggle={() => onToggleDone(subsectionKey(c.id, "kartan"))}
                />
                {c.location ? (
                  <p style={sharedStyles.investigationText}>
                    Lat: {c.location.lat.toFixed(4)}, Lon:{" "}
                    {c.location.lon.toFixed(4)}
                  </p>
                ) : (
                  <p style={sharedStyles.investigationText}>
                    Ingen platsinformation tillagd.
                  </p>
                )}
              </div>
              <div style={sharedStyles.investigationSub}>
                <SubsectionHeader
                  title="Fysiskt bevis"
                  checked={evidenceDone}
                  onToggle={() => onToggleDone(subsectionKey(c.id, "evidence"))}
                />
                todo
              </div>
              <div style={sharedStyles.investigationSub}>
                <SubsectionHeader
                  title="Tidslinje"
                  checked={tidslinjeDone}
                  onToggle={() =>
                    onToggleDone(subsectionKey(c.id, "tidslinje"))
                  }
                />
                <Timeline
                  events={game.timelineEvents.filter(
                    (e) =>
                      e.characterIds.includes(c.id) && (isAdmin || e.revealed),
                  )}
                  emptyText="No timeline events recorded yet."
                />
              </div>
              <button
                style={sharedStyles.compilationBtn}
                onClick={() => navigate(`/characters/${c.id}/compilation`)}
              >
                Utred <ChevronRight size={14} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: 14,
  },
};
