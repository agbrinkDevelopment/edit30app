import React from "react";
import { useGame } from "../context/GameContext";
import { useAuth } from "../context/AuthContext";
import { usePlayerTimeline } from "../hooks/usePlayerTimeline";
import { usePlayerEvidence } from "../hooks/usePlayerEvidence";
import { usePlayerClue } from "../hooks/usePlayerClue";
import CaseTimeline from "../components/CaseTimeline";
import PlayerEvidenceCard from "../components/PlayerEvidenceCard";
import CityMap from "../components/CityMap";
import { isCharacterInvestigated, loadProgress } from "../shared/helpers";
import { MYSTERY_SECTIONS, PROGRESS_KEY } from "../shared/data";
import SectionHelp from "../components/SectionHelp";
import { usePlayerSections } from "../context/PlayerSectionsContext";
import SpotlightCard from "../components/SpotlightCard";
import Section from "../components/Section";
import KillerGuessCard from "../components/KillerGuessCard";
import CharacterGrid from "../components/CharacterGrid";
import { useGameTimer } from "../context/GameTimerContext";
import CluesCard from "../components/CluesCard";

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
    kartan: !!progress["kartan"],
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
          steps={MYSTERY_SECTIONS.map((s) => ({
            ...s,
            done: sectionDone[s.id],
          }))}
        />
      </Section>

      <Section
        id="kartan"
        title="Kartan"
        locked={isLocked("kartan")}
        footer={<SectionHelp sectionId="kartan" done={sectionDone.kartan} />}
      >
        <CityMap
          done={!!progress["kartan"]}
          onToggleDone={() => toggleStep("kartan")}
        />
      </Section>

      <Section
        id="tidslinje"
        title="Tidslinje"
        locked={isLocked("tidslinje")}
        footer={<SectionHelp sectionId="tidslinje" done={sectionDone.tidslinje} />}
      >
        <CaseTimeline
          events={playerTimeline.events}
          solved={playerTimeline.solved}
          solvedCharacterIds={playerTimeline.solvedCharacterIds}
          onAddEvent={playerTimeline.addEvent}
          onUpdateEvent={playerTimeline.updateEvent}
          onRemoveEvent={playerTimeline.removeEvent}
        />
      </Section>

      <Section
        id="ledtradar"
        title="Ledtrådar"
        locked={isLocked("ledtradar")}
        footer={<SectionHelp sectionId="ledtradar" done={sectionDone.ledtradar} />}
      >
        <CluesCard
          assignments={playerClue.assignments}
          solved={playerClue.solved}
          solvedCharacterIds={playerClue.solvedCharacterIds}
          onAssign={playerClue.assign}
        />
      </Section>

      {detective && (
        <Section
          id="detektiven"
          title="Detektiven"
          locked={isLocked("detektiven")}
          footer={<SectionHelp sectionId="detektiven" done={sectionDone.detektiven} />}
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
          locked={isLocked("offret")}
          footer={<SectionHelp sectionId="offret" done={sectionDone.offret} />}
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
          locked={isLocked("de-misstankta")}
          footer={<SectionHelp sectionId="de-misstankta" done={sectionDone["de-misstankta"]} />}
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
          locked={isLocked("vittnen")}
          footer={<SectionHelp sectionId="vittnen" done={sectionDone.vittnen} />}
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
    </div>
  );
}
