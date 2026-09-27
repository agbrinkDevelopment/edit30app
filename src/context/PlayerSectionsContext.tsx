import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "../api/client";
import { GameResult, PlayerSection } from "../types";
import { useAuth } from "./AuthContext";
import { useGameTimer } from "./GameTimerContext";

interface PlayerSectionsContextType {
  // Keyed by section id.
  sections: Record<string, PlayerSection>;
  // Time added so far by revealed hints and skipped sections.
  penaltySeconds: number;
  // The player's final guess, once they've pressed "Utvärdera".
  result: GameResult | null;
  revealHint: (sectionId: string) => void;
  skipSection: (sectionId: string) => void;
  submitGuess: (guessedCharacterId: string) => Promise<GameResult>;
}

const PlayerSectionsContext = createContext<PlayerSectionsContextType | null>(
  null,
);

// Per-player hint/skip state and the final result, shared by the timer (which
// adds the penalties), each section's help buttons and the killer guess.
// Stored in the backend so penalties survive reloads and can't be undone.
export function PlayerSectionsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { playerId } = useAuth();
  const { elapsedSeconds, stopTimer } = useGameTimer();
  const [sections, setSections] = useState<Record<string, PlayerSection>>({});
  const [result, setResult] = useState<GameResult | null>(null);

  useEffect(() => {
    setSections({});
    setResult(null);
    if (!playerId) return;
    let cancelled = false;
    api
      .getPlayerSections(playerId)
      .then((list) => {
        if (!cancelled)
          setSections(Object.fromEntries(list.map((s) => [s.sectionId, s])));
      })
      .catch(() => undefined);
    api
      .getGameResult(playerId)
      .then((r) => {
        if (!cancelled) setResult(r);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [playerId]);

  const store = (s: PlayerSection) =>
    setSections((prev) => ({ ...prev, [s.sectionId]: s }));

  const revealHint = (sectionId: string) => {
    if (!playerId) return;
    api.revealSectionHint(playerId, sectionId).then(store).catch(() => undefined);
  };

  const skipSection = (sectionId: string) => {
    if (!playerId) return;
    api.skipSection(playerId, sectionId).then(store).catch(() => undefined);
  };

  const submitGuess = async (guessedCharacterId: string) => {
    if (!playerId) throw new Error("Not signed in as a player");
    stopTimer();
    const saved = await api.submitGameResult(playerId, {
      guessedCharacterId,
      elapsedSeconds,
    });
    setResult(saved);
    return saved;
  };

  const penaltySeconds = Object.values(sections).reduce(
    (sum, s) =>
      sum +
      (s.hintUsed ? s.hintPenaltySeconds : 0) +
      (s.skipped ? s.skipPenaltySeconds : 0),
    0,
  );

  return (
    <PlayerSectionsContext.Provider
      value={{
        sections,
        penaltySeconds,
        result,
        revealHint,
        skipSection,
        submitGuess,
      }}
    >
      {children}
    </PlayerSectionsContext.Provider>
  );
}

export function usePlayerSections(): PlayerSectionsContextType {
  const ctx = useContext(PlayerSectionsContext);
  if (!ctx) {
    throw new Error(
      "usePlayerSections must be used within a PlayerSectionsProvider",
    );
  }
  return ctx;
}
