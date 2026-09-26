import React from "react";
import { useGame } from "../context/GameContext";
import { useAuth } from "../context/AuthContext";
import { usePlayerTimeline } from "../hooks/usePlayerTimeline";
import { usePlayerEvidence } from "../hooks/usePlayerEvidence";
import { usePlayerClue } from "../hooks/usePlayerClue";
import CaseTimeline from "../components/CaseTimeline";
import PlayerEvidenceCard from "../components/PlayerEvidenceCard";
import PlayerClueCard from "../components/PlayerClueCard";
import CityMap from "../components/CityMap";
import { loadProgress } from "../shared/helpers";
import { PROGRESS_KEY } from "../shared/data";
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
  const playerEvidence = usePlayerEvidence(playerId);
  const playerClue = usePlayerClue(playerId);

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
        <KillerGuessCard tidslinjeSolved={playerTimeline.solved} />
      </Section>

      <Section id="kartan" title="Kartan">
        <CityMap
          done={!!progress["kartan"]}
          onToggleDone={() => toggleStep("kartan")}
        />
      </Section>

      <Section id="tidslinje" title="Tidslinje">
        <CaseTimeline
          events={playerTimeline.events}
          solved={playerTimeline.solved}
          onAddEvent={playerTimeline.addEvent}
          onUpdateEvent={playerTimeline.updateEvent}
          onRemoveEvent={playerTimeline.removeEvent}
        />
      </Section>

      {/* <Section id="bevis" title="Bevis">
        <PlayerEvidenceCard
          items={playerEvidence.items}
          solved={playerEvidence.solved}
          onAddItem={playerEvidence.addItem}
          onUpdateItem={playerEvidence.updateItem}
          onRemoveItem={playerEvidence.removeItem}
        />
      </Section> */}

      <Section id="ledtradar" title="Ledtrådar">
        <CluesCard />
      </Section>

      {/*   <Section id="spar" title="Spår">
        <PlayerClueCard
          items={playerClue.items}
          solved={playerClue.solved}
          onAddItem={playerClue.addItem}
          onUpdateItem={playerClue.updateItem}
          onRemoveItem={playerClue.removeItem}
        />
      </Section> */}

      {detective && (
        <Section id="detektiven" title="Detektiven">
          <SpotlightCard
            character={detective}
            game={game}
            progress={progress}
            onToggleDone={toggleStep}
          />
        </Section>
      )}

      {victim && (
        <Section id="offret" title="Offret">
          <SpotlightCard
            character={victim}
            game={game}
            progress={progress}
            onToggleDone={toggleStep}
          />
        </Section>
      )}

      {suspects.length > 0 && (
        <Section id="de-misstankta" title="De misstänkta">
          <CharacterGrid
            characters={suspects}
            game={game}
            progress={progress}
            onToggleDone={toggleStep}
          />
        </Section>
      )}

      {witnesses.length > 0 && (
        <Section id="vittnen" title="Vittnen">
          <CharacterGrid
            characters={witnesses}
            game={game}
            progress={progress}
            onToggleDone={toggleStep}
          />
        </Section>
      )}
    </div>
  );
}
