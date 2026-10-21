import React from "react";
import { theme } from "../theme";
import { useGame } from "../context/GameContext";
import { useAuth } from "../context/AuthContext";
import { usePlayerTimeline } from "../hooks/usePlayerTimeline";
import { usePlayerEvidence } from "../hooks/usePlayerEvidence";
import { usePlayerClue } from "../hooks/usePlayerClue";
import CaseTimeline from "../components/CaseTimeline";
import PlayerEvidenceCard from "../components/PlayerEvidenceCard";
import CityMap from "../components/CityMap";
import {
  isCharacterInvestigated,
  loadProgress,
  sortByRole,
} from "../shared/helpers";
import { MYSTERY_SECTIONS, PROGRESS_KEY } from "../shared/data";
import SectionHelp from "../components/SectionHelp";
import { usePlayerSections } from "../context/PlayerSectionsContext";
import SpotlightCard from "../components/SpotlightCard";
import Section from "../components/Section";
import KillerGuessCard from "../components/KillerGuessCard";
import CharacterGrid from "../components/CharacterGrid";
import { useGameTimer } from "../context/GameTimerContext";
import CluesCard from "../components/CluesCard";
import { useMapLocations } from "../hooks/useMapLocations";

export default function Overview() {
  const { game } = useGame();
  const { started } = useGameTimer();
  const { playerId } = useAuth();
  const { sections: playerSections } = usePlayerSections();
  const playerTimeline = usePlayerTimeline(playerId);
  const playerClue = usePlayerClue(playerId);
  /* const playerEvidence = usePlayerEvidence(playerId); */

  const victim = game.characters.find((c) => c.role === "victim");
  const detective = game.characters.find((c) => c.role === "detective");
  const suspects = game.characters.filter((c) => c.role === "suspect");
  const witnesses = game.characters.filter((c) => c.role === "witness");

  const [progress, setProgress] = React.useState<Record<string, boolean>>(
    loadProgress(PROGRESS_KEY),
  );

  // Kartan is done when every location on it is checked or skipped — saved
  // per player in the backend, not in this browser's progress.
  const map = useMapLocations();
  const kartanDone = map.allDone;

  const toggleStep = (id: string) => {
    setProgress((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem(PROGRESS_KEY, JSON.stringify(next));
      } catch {
        // ignore storage errors
      }
      return next;
    });
  };

  // Whether each checklist section is finished on its own merits (a skip is
  // tracked separately, see SectionHelp / KillerGuessCard). A section with
  // no characters to look at counts as done.
  const sectionDone: Record<string, boolean> = {
    kartan: kartanDone,
    tidslinje: playerTimeline.solved,
    ledtradar: playerClue.solved,
    detektiven: !detective || isCharacterInvestigated(detective.id, progress),
    offret: !victim || isCharacterInvestigated(victim.id, progress),
    "de-misstankta": suspects.every((c) =>
      isCharacterInvestigated(c.id, progress),
    ),
    vittnen: witnesses.every((c) => isCharacterInvestigated(c.id, progress)),
  };

  // A finished or skipped section is locked: nothing more can be done in it.
  const isLocked = (id: string) =>
    sectionDone[id] || !!playerSections[id]?.skipped;

  return (
    <div
      style={{
        filter: started ? undefined : "blur(2px)",
        pointerEvents: started ? undefined : "none",
        userSelect: started ? undefined : "none",
        transition: "filter 0.4s",
      }}
      aria-hidden={!started}
    >
      <Section id="mordaren" title="Mördaren" style={{ marginTop: 0 }}>
        <KillerGuessCard
          steps={MYSTERY_SECTIONS
            // The character sections are information only for now, so
            // they're not part of the checklist.
            .filter((s) => !INFO_ONLY_SECTIONS.includes(s.id))
            .map((s) => ({
              ...s,
              done: sectionDone[s.id],
            }))}
          subSteps={{
            kartan: {
              plain: true,
              rows: map.pins.map((p) => ({
                id: p.id,
                sectionId: p.sectionId,
                label: p.name,
                done: p.done,
              })),
            },
            // One row per lane, checked when that character's events are
            // right (or the whole timeline is).
            tidslinje: {
              rows: sortByRole(game.characters).map((c) => ({
                id: c.id,
                label: c.name,
                done:
                  playerTimeline.solved ||
                  playerTimeline.solvedCharacterIds.includes(c.id),
              })),
            },
            // One row per bucket: the detective and the suspects.
            ledtradar: {
              rows: [...(detective ? [detective] : []), ...suspects].map(
                (c) => ({
                  id: c.id,
                  label: c.name,
                  done:
                    playerClue.solved ||
                    playerClue.solvedCharacterIds.includes(c.id),
                }),
              ),
            },
            // (Character sections are information only for now.)
            // The character sections: one row per character, checked once
            // that character has been investigated.
            // ...Object.fromEntries(
            // (
            // [
            // ["detektiven", detective ? [detective] : []],
            // ["offret", victim ? [victim] : []],
            // ["de-misstankta", suspects],
            // ["vittnen", witnesses],
            // ] as const
            // ).map(([id, chars]) => [
            // id,
            // {
            // rows: chars.map((c) => ({
            // id: c.id,
            // label: c.name,
            // done: isCharacterInvestigated(c.id, progress),
            // })),
            // },
            // ]),
            // ),
          }}
        />
      </Section>

      <Section id="fallet" title="Om fallet">
        <div style={styles.caseCard}>
          <p style={styles.caseText}>
            {game.description || "Här kommer informationen om fallet att stå."}
          </p>
        </div>
      </Section>

      {detective && (
        <Section
          id="detektiven"
          title="Detektiven"
          // Information only for now: no locking or hint/skip.
          /* locked={isLocked("detektiven")}
          footer={
            <SectionHelp sectionId="detektiven" done={sectionDone.detektiven} />
          } */
        >
          <SpotlightCard
            character={detective}
            sectionId="detektiven"
            game={game}
            progress={progress}
            onToggleDone={toggleStep}
          />
        </Section>
      )}

      {victim && (
        <Section
          id="offret"
          title="Offret"
          // Information only for now: no locking or hint/skip.
          /* locked={isLocked("offret")}
          footer={<SectionHelp sectionId="offret" done={sectionDone.offret} />} */
        >
          <SpotlightCard
            character={victim}
            sectionId="offret"
            game={game}
            progress={progress}
            onToggleDone={toggleStep}
          />
        </Section>
      )}

      {suspects.length > 0 && (
        <Section
          id="de-misstankta"
          title="De misstänkta"
          // Information only for now: no locking or hint/skip.
          /* locked={isLocked("de-misstankta")}
          footer={
            <SectionHelp
              sectionId="de-misstankta"
              done={sectionDone["de-misstankta"]}
            />
          } */
        >
          <CharacterGrid
            characters={suspects}
            sectionId="de-misstankta"
            game={game}
            progress={progress}
            onToggleDone={toggleStep}
          />
        </Section>
      )}

      {witnesses.length > 0 && (
        <Section
          id="vittnen"
          title="Vittnen"
          // Information only for now: no locking or hint/skip.
          /* locked={isLocked("vittnen")}
          footer={
            <SectionHelp sectionId="vittnen" done={sectionDone.vittnen} />
          } */
        >
          <CharacterGrid
            characters={witnesses}
            sectionId="vittnen"
            game={game}
            progress={progress}
            onToggleDone={toggleStep}
          />
        </Section>
      )}
      <Section id="kartan" title="Kartan" locked={isLocked("kartan")}>
        <CityMap map={map} />
      </Section>

      <Section
        id="tidslinje"
        title="Tidslinje"
        footer={
          <SectionHelp sectionId="tidslinje" done={sectionDone.tidslinje} />
        }
      >
        <CaseTimeline
          events={playerTimeline.events}
          solved={playerTimeline.solved}
          solvedCharacterIds={playerTimeline.solvedCharacterIds}
          onAddEvent={playerTimeline.addEvent}
          onUpdateEvent={playerTimeline.updateEvent}
          onRemoveEvent={playerTimeline.removeEvent}
          // Not covered when finished, so it can still be scrolled and its
          // events opened — just no longer changed.
          readOnly={isLocked("tidslinje")}
        />
      </Section>

      <Section
        id="ledtradar"
        title="Ledtrådar"
        footer={
          <SectionHelp sectionId="ledtradar" done={sectionDone.ledtradar} />
        }
      >
        <CluesCard
          assignments={playerClue.assignments}
          solved={playerClue.solved}
          solvedCharacterIds={playerClue.solvedCharacterIds}
          onAssign={playerClue.assign}
          // Not covered when finished, so it can still be scrolled — just
          // no longer changed.
          readOnly={isLocked("ledtradar")}
        />
      </Section>
    </div>
  );
}

// Sections that are pure information for now (no checklist, hint or skip).
const INFO_ONLY_SECTIONS = ["detektiven", "offret", "de-misstankta", "vittnen"];

const styles: Record<string, React.CSSProperties> = {
  caseCard: {
    background: theme.cardBg,
    border: `1px solid ${theme.textFaint}`,
    borderRadius: 14,
    padding: "16px 20px",
  },
  caseText: {
    margin: 0,
    fontSize: 15,
    lineHeight: 1.6,
    color: theme.text,
    whiteSpace: "pre-line",
  },
};
