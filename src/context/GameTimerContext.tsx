import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const STARTED_AT_KEY = "mystery-game-started-at";
const STOPPED_AT_KEY = "mystery-game-stopped-at";

function loadTimestamp(key: string): number | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

// Called on sign-out so the next sign-in starts with a fresh "not started"
// timer instead of resuming the previous team's game clock.
export function resetGameTimer(): void {
  try {
    localStorage.removeItem(STARTED_AT_KEY);
    localStorage.removeItem(STOPPED_AT_KEY);
  } catch {
    // ignore storage errors
  }
}

interface GameTimerContextType {
  started: boolean;
  stopped: boolean;
  elapsedSeconds: number;
  startGame: () => void;
  stopTimer: () => void;
}

const GameTimerContext = createContext<GameTimerContextType | null>(null);

// Backed by localStorage (not just React state) so the play button and
// timer stay correct across page navigation and reloads, instead of
// resetting every time GameTimerProvider remounts.
export function GameTimerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [startedAt, setStartedAt] = useState<number | null>(() =>
    loadTimestamp(STARTED_AT_KEY),
  );
  const [stoppedAt, setStoppedAt] = useState<number | null>(() =>
    loadTimestamp(STOPPED_AT_KEY),
  );
  const [now, setNow] = useState(() => Date.now());

  const started = startedAt !== null;
  const stopped = stoppedAt !== null;
  const elapsedSeconds = started
    ? Math.max(0, Math.floor(((stopped ? stoppedAt! : now) - startedAt!) / 1000))
    : 0;

  const startGame = () => {
    const ts = Date.now();
    setStartedAt(ts);
    setStoppedAt(null);
    setNow(ts);
    try {
      localStorage.setItem(STARTED_AT_KEY, String(ts));
      localStorage.removeItem(STOPPED_AT_KEY);
    } catch {
      // ignore storage errors
    }
  };

  const stopTimer = () => {
    if (stoppedAt !== null) return;
    const ts = Date.now();
    setStoppedAt(ts);
    try {
      localStorage.setItem(STOPPED_AT_KEY, String(ts));
    } catch {
      // ignore storage errors
    }
  };

  useEffect(() => {
    if (!started || stopped) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [started, stopped]);

  return (
    <GameTimerContext.Provider
      value={{ started, stopped, elapsedSeconds, startGame, stopTimer }}
    >
      {children}
    </GameTimerContext.Provider>
  );
}

export function useGameTimer(): GameTimerContextType {
  const ctx = useContext(GameTimerContext);
  if (!ctx) {
    throw new Error("useGameTimer must be used within a GameTimerProvider");
  }
  return ctx;
}
