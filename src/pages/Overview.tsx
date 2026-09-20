import React from "react";
import { useGame } from "../context/GameContext";
import { useAuth } from "../context/AuthContext";
import CaseTimeline from "../components/CaseTimeline";
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
  const { isAdmin } = useAuth();
  const { started } = useGameTimer();

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
        <KillerGuessCard />
      </Section>

      <Section id="kartan" title="Kartan">
        <CityMap
          done={!!progress["kartan"]}
          onToggleDone={() => toggleStep("kartan")}
        />
      </Section>

      <Section id="tidslinje" title="Tidslinje">
        <CaseTimeline />
      </Section>

      <Section id="ledtradar" title="Ledtrådar">
        <CluesCard />
      </Section>

      {detective && (
        <Section id="detektiven" title="Detektiven">
          <SpotlightCard
            character={detective}
            game={game}
            isAdmin={isAdmin}
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
            isAdmin={isAdmin}
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
            isAdmin={isAdmin}
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
            isAdmin={isAdmin}
            progress={progress}
            onToggleDone={toggleStep}
          />
        </Section>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {};
