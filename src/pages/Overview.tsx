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

      <Section id="kartan" title="Kartan">
        <CityMap
          done={!!progress["kartan"]}
          onToggleDone={() => toggleStep("kartan")}
        />
        <SectionHelp sectionId="kartan" done={sectionDone.kartan} />
      </Section>

      <Section id="tidslinje" title="Tidslinje">
        <CaseTimeline
          events={playerTimeline.events}
          solved={playerTimeline.solved}
          solvedCharacterIds={playerTimeline.solvedCharacterIds}
          onAddEvent={playerTimeline.addEvent}
          onUpdateEvent={playerTimeline.updateEvent}
          onRemoveEvent={playerTimeline.removeEvent}
        />
        <SectionHelp sectionId="tidslinje" done={sectionDone.tidslinje} />
      </Section>

      <Section id="ledtradar" title="Ledtrådar">
        <CluesCard
          assignments={playerClue.assignments}
          solved={playerClue.solved}
          solvedCharacterIds={playerClue.solvedCharacterIds}
          onAssign={playerClue.assign}
        />
        <SectionHelp sectionId="ledtradar" done={sectionDone.ledtradar} />
      </Section>

      {detective && (
        <Section id="detektiven" title="Detektiven">
          <SpotlightCard
            character={detective}
            sectionId="detektiven"
            game={game}
            progress={progress}
            onToggleDone={toggleStep}
          />
          <SectionHelp sectionId="detektiven" done={sectionDone.detektiven} />
        </Section>
      )}

      {victim && (
        <Section id="offret" title="Offret">
          <SpotlightCard
            character={victim}
            sectionId="offret"
            game={game}
            progress={progress}
            onToggleDone={toggleStep}
          />
          <SectionHelp sectionId="offret" done={sectionDone.offret} />
        </Section>
      )}

      {suspects.length > 0 && (
        <Section id="de-misstankta" title="De misstänkta">
          <CharacterGrid
            characters={suspects}
            sectionId="de-misstankta"
            game={game}
            progress={progress}
            onToggleDone={toggleStep}
          />
          <SectionHelp
            sectionId="de-misstankta"
            done={sectionDone["de-misstankta"]}
          />
        </Section>
      )}

      {witnesses.length > 0 && (
        <Section id="vittnen" title="Vittnen">
          <CharacterGrid
            characters={witnesses}
            sectionId="vittnen"
            game={game}
            progress={progress}
            onToggleDone={toggleStep}
          />
          <SectionHelp sectionId="vittnen" done={sectionDone.vittnen} />
        </Section>
      )}
    </div>
  );
}
