import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";
import {
  GameState,
  Character,
  Clue,
  Scene,
  TimelineEvent,
  EvidenceType,
  GameDocument,
} from "../types";
import { api } from "../api/client";

const defaultState: GameState = {
  title: "",
  description: "",
  characters: [],
  clues: [],
  scenes: [],
  timelineEvents: [],
  evidence: [],
  documents: [],
  newsArticles: [],
  killerRevealed: false,
};

interface GameContextType {
  game: GameState;
  loading: boolean;
  error: string | null;
  setTitle: (title: string) => void;
  setDescription: (desc: string) => void;
  addCharacter: (c: Omit<Character, "id">) => void;
  updateCharacter: (c: Character) => void;
  removeCharacter: (id: string) => void;
  addClue: (c: Omit<Clue, "id">) => void;
  updateClue: (c: Clue) => void;
  removeClue: (id: string) => void;
  addScene: (s: Omit<Scene, "id" | "order">) => void;
  updateScene: (s: Scene) => void;
  removeScene: (id: string) => void;
  addTimelineEvent: (e: Omit<TimelineEvent, "id">) => void;
  updateTimelineEvent: (e: TimelineEvent) => void;
  removeTimelineEvent: (id: string) => void;
  setTimelineEventRevealed: (id: string, revealed: boolean) => void;
  addEvidence: (e: Omit<EvidenceType, "id">) => void;
  updateEvidence: (e: EvidenceType) => void;
  removeEvidence: (id: string) => void;
  setEvidenceRevealed: (id: string, revealed: boolean) => void;
  addDocument: (d: Omit<GameDocument, "id">) => void;
  updateDocument: (d: GameDocument) => void;
  removeDocument: (id: string) => void;
  setDocumentRevealed: (id: string, revealed: boolean) => void;
  addNewsArticle: (d: Omit<GameDocument, "id">) => void;
  updateNewsArticle: (d: GameDocument) => void;
  removeNewsArticle: (id: string) => void;
  setNewsArticleRevealed: (id: string, revealed: boolean) => void;
  setKillerRevealed: (revealed: boolean) => void;
}

const GameContext = createContext<GameContextType | null>(null);

const uid = () => Math.random().toString(36).slice(2, 10);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [game, setGame] = useState<GameState>(defaultState);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [
          settings,
          characters,
          timelineEvents,
          evidence,
          documents,
          newsArticles,
        ] = await Promise.all([
          api.getGame(),
          api.getCharacters(),
          api.getTimelineEvents(),
          api.getEvidence(),
          api.getDocuments(),
          api.getNewsArticles(),
        ]);
        if (cancelled) return;
        setGame((g) => ({
          ...g,
          ...settings,
          characters,
          timelineEvents,
          evidence,
          documents,
          newsArticles,
        }));
        setError(null);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Kunde inte ansluta till servern.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const reportError = (err: unknown) =>
    setError(err instanceof Error ? err.message : String(err));

  // --- Game settings ---
  const setTitle = (title: string) => {
    setGame((g) => ({ ...g, title }));
    api.updateGame({ title }).catch(reportError);
  };
  const setDescription = (description: string) => {
    setGame((g) => ({ ...g, description }));
    api.updateGame({ description }).catch(reportError);
  };
  const setKillerRevealed = (killerRevealed: boolean) => {
    setGame((g) => ({ ...g, killerRevealed }));
    api.updateGame({ killerRevealed }).catch(reportError);
  };

  // --- Characters ---
  const addCharacter = (c: Omit<Character, "id">) => {
    api
      .createCharacter(c)
      .then((created) =>
        setGame((g) => ({ ...g, characters: [...g.characters, created] })),
      )
      .catch(reportError);
  };
  const updateCharacter = (c: Character) => {
    setGame((g) => ({
      ...g,
      characters: g.characters.map((x) => (x.id === c.id ? c : x)),
    }));
    api.updateCharacter(c.id, c).catch(reportError);
  };
  const removeCharacter = (id: string) => {
    setGame((g) => ({
      ...g,
      characters: g.characters.filter((x) => x.id !== id),
    }));
    api.deleteCharacter(id).catch(reportError);
  };

  // --- Clues / Scenes: no active page reads these yet, so they stay
  // local-only for now instead of wiring up unused backend endpoints.
  const addClue = (c: Omit<Clue, "id">) =>
    setGame((g) => ({ ...g, clues: [...g.clues, { ...c, id: uid() }] }));
  const updateClue = (c: Clue) =>
    setGame((g) => ({
      ...g,
      clues: g.clues.map((x) => (x.id === c.id ? c : x)),
    }));
  const removeClue = (id: string) =>
    setGame((g) => ({ ...g, clues: g.clues.filter((x) => x.id !== id) }));

  const addScene = (s: Omit<Scene, "id" | "order">) =>
    setGame((g) => ({
      ...g,
      scenes: [...g.scenes, { ...s, id: uid(), order: g.scenes.length + 1 }],
    }));
  const updateScene = (s: Scene) =>
    setGame((g) => ({
      ...g,
      scenes: g.scenes.map((x) => (x.id === s.id ? s : x)),
    }));
  const removeScene = (id: string) =>
    setGame((g) => ({ ...g, scenes: g.scenes.filter((x) => x.id !== id) }));

  // --- Timeline events ---
  const addTimelineEvent = (e: Omit<TimelineEvent, "id">) => {
    api
      .createTimelineEvent(e)
      .then((created) =>
        setGame((g) => ({
          ...g,
          timelineEvents: [...g.timelineEvents, created],
        })),
      )
      .catch(reportError);
  };
  const updateTimelineEvent = (e: TimelineEvent) => {
    setGame((g) => ({
      ...g,
      timelineEvents: g.timelineEvents.map((x) => (x.id === e.id ? e : x)),
    }));
    api.updateTimelineEvent(e.id, e).catch(reportError);
  };
  const removeTimelineEvent = (id: string) => {
    setGame((g) => ({
      ...g,
      timelineEvents: g.timelineEvents.filter((x) => x.id !== id),
    }));
    api.deleteTimelineEvent(id).catch(reportError);
  };
  const setTimelineEventRevealed = (id: string, revealed: boolean) => {
    setGame((g) => ({
      ...g,
      timelineEvents: g.timelineEvents.map((x) =>
        x.id === id ? { ...x, revealed } : x,
      ),
    }));
    api.setTimelineEventRevealed(id, revealed).catch(reportError);
  };

  // --- Evidence ---
  const addEvidence = (e: Omit<EvidenceType, "id">) => {
    api
      .createEvidence(e)
      .then((created) =>
        setGame((g) => ({ ...g, evidence: [...g.evidence, created] })),
      )
      .catch(reportError);
  };
  const updateEvidence = (e: EvidenceType) => {
    setGame((g) => ({
      ...g,
      evidence: g.evidence.map((x) => (x.id === e.id ? e : x)),
    }));
    api.updateEvidence(e.id, e).catch(reportError);
  };
  const removeEvidence = (id: string) => {
    setGame((g) => ({
      ...g,
      evidence: g.evidence.filter((x) => x.id !== id),
    }));
    api.deleteEvidence(id).catch(reportError);
  };
  const setEvidenceRevealed = (id: string, revealed: boolean) => {
    setGame((g) => ({
      ...g,
      evidence: g.evidence.map((x) => (x.id === id ? { ...x, revealed } : x)),
    }));
    api.setEvidenceRevealed(id, revealed).catch(reportError);
  };

  // --- Documents (Förhörsdokument) ---
  const addDocument = (d: Omit<GameDocument, "id">) => {
    api
      .createDocument(d)
      .then((created) =>
        setGame((g) => ({ ...g, documents: [...g.documents, created] })),
      )
      .catch(reportError);
  };
  const updateDocument = (d: GameDocument) => {
    setGame((g) => ({
      ...g,
      documents: g.documents.map((x) => (x.id === d.id ? d : x)),
    }));
    api.updateDocument(d.id, d).catch(reportError);
  };
  const removeDocument = (id: string) => {
    setGame((g) => ({
      ...g,
      documents: g.documents.filter((x) => x.id !== id),
    }));
    api.deleteDocument(id).catch(reportError);
  };
  const setDocumentRevealed = (id: string, revealed: boolean) => {
    setGame((g) => ({
      ...g,
      documents: g.documents.map((x) =>
        x.id === id ? { ...x, revealed } : x,
      ),
    }));
    api.setDocumentRevealed(id, revealed).catch(reportError);
  };

  // --- News articles (Nyhetsartiklar) ---
  const addNewsArticle = (d: Omit<GameDocument, "id">) => {
    api
      .createNewsArticle(d)
      .then((created) =>
        setGame((g) => ({ ...g, newsArticles: [...g.newsArticles, created] })),
      )
      .catch(reportError);
  };
  const updateNewsArticle = (d: GameDocument) => {
    setGame((g) => ({
      ...g,
      newsArticles: g.newsArticles.map((x) => (x.id === d.id ? d : x)),
    }));
    api.updateNewsArticle(d.id, d).catch(reportError);
  };
  const removeNewsArticle = (id: string) => {
    setGame((g) => ({
      ...g,
      newsArticles: g.newsArticles.filter((x) => x.id !== id),
    }));
    api.deleteNewsArticle(id).catch(reportError);
  };
  const setNewsArticleRevealed = (id: string, revealed: boolean) => {
    setGame((g) => ({
      ...g,
      newsArticles: g.newsArticles.map((x) =>
        x.id === id ? { ...x, revealed } : x,
      ),
    }));
    api.setNewsArticleRevealed(id, revealed).catch(reportError);
  };

  return (
    <GameContext.Provider
      value={{
        game,
        loading,
        error,
        setTitle,
        setDescription,
        addCharacter,
        updateCharacter,
        removeCharacter,
        addClue,
        updateClue,
        removeClue,
        addScene,
        updateScene,
        removeScene,
        addTimelineEvent,
        updateTimelineEvent,
        removeTimelineEvent,
        setTimelineEventRevealed,
        addEvidence,
        updateEvidence,
        removeEvidence,
        setEvidenceRevealed,
        addDocument,
        updateDocument,
        removeDocument,
        setDocumentRevealed,
        addNewsArticle,
        updateNewsArticle,
        removeNewsArticle,
        setNewsArticleRevealed,
        setKillerRevealed,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error("useGame must be used inside GameProvider");
  return ctx;
}
