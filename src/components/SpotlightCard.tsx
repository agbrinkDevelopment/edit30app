import React from "react";
import { useNavigate } from "react-router-dom";
import { Character, GameState } from "../types";
import { roleColor, subsectionKey } from "../shared/helpers";
import { styles as sharedStyles } from "../shared/styles";
import { Check, ChevronRight, User } from "lucide-react";
import { theme } from "../theme";
import SubsectionHeader from "./SubsectionHeader";
import Timeline from "./Timeline";

export default function SpotlightCard({
  character,
  game,
  isAdmin,
  progress,
  onToggleDone,
}: {
  character: Character;
  game: GameState;
  isAdmin: boolean;
  progress: Record<string, boolean>;
  onToggleDone: (id: string) => void;
}) {
  const navigate = useNavigate();
  const kartanDone = !!progress[subsectionKey(character.id, "kartan")];
  const tidslinjeDone = !!progress[subsectionKey(character.id, "tidslinje")];
  const evidenceDone = !!progress[subsectionKey(character.id, "evidence")];
  const done = kartanDone && tidslinjeDone && evidenceDone;

  return (
    <div
      style={{
        ...sharedStyles.victimCard,
        borderLeft: `4px solid ${roleColor(character.role)}`,
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
      <div style={sharedStyles.victimHeader}>
        <div style={sharedStyles.victimPhoto}>
          {character.imageUrl ? (
            <img
              src={character.imageUrl}
              alt={character.name}
              style={sharedStyles.victimPhotoImg}
            />
          ) : (
            <User size={32} color={theme.textFaint} />
          )}
        </div>
        <div>
          <div style={sharedStyles.cardNameRow}>
            <span style={{ ...sharedStyles.victimName, marginBottom: 0 }}>
              {character.name}
            </span>
            <span
              style={{ ...sharedStyles.badge, background: roleColor(character.role) }}
            >
              {theme.roleLabels[character.role] ?? character.role}
            </span>
          </div>
          {character.description && (
            <p style={sharedStyles.victimDesc}>{character.description}</p>
          )}
        </div>
      </div>

      <div style={sharedStyles.investigationSection}>
        <h3 style={sharedStyles.investigationTitle}>Utredningen</h3>
        <div style={sharedStyles.investigationSub}>
          <SubsectionHeader
            title="Kartan"
            checked={kartanDone}
            onToggle={() => onToggleDone(subsectionKey(character.id, "kartan"))}
          />
          {character.location ? (
            <p style={sharedStyles.investigationText}>
              Lat: {character.location.lat.toFixed(4)}, Lon:{" "}
              {character.location.lon.toFixed(4)}
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
            onToggle={() =>
              onToggleDone(subsectionKey(character.id, "evidence"))
            }
          />
          todo
        </div>
        <div style={sharedStyles.investigationSub}>
          <SubsectionHeader
            title="Tidslinje"
            checked={tidslinjeDone}
            onToggle={() =>
              onToggleDone(subsectionKey(character.id, "tidslinje"))
            }
          />
          <Timeline
            events={game.timelineEvents.filter(
              (e) =>
                e.characterIds.includes(character.id) &&
                (isAdmin || e.revealed),
            )}
            emptyText="No timeline events recorded yet."
          />
        </div>
        <button
          style={sharedStyles.compilationBtn}
          onClick={() => navigate(`/characters/${character.id}/compilation`)}
        >
          Utred <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {};
