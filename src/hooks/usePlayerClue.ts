import { useCallback, useEffect, useState } from "react";
import { api } from "../api/client";
import { PlayerClue } from "../types";

// A player's own, private reconstruction of the clues, and whether it
// currently matches the real clues (compared server-side — the real content
// is never sent to the browser). Mirrors usePlayerTimeline / usePlayerEvidence.
export function usePlayerClue(playerId: string | undefined) {
  const [items, setItems] = useState<PlayerClue[]>([]);
  const [solved, setSolved] = useState(false);
  const [loading, setLoading] = useState(!!playerId);

  const refreshStatus = useCallback(() => {
    if (!playerId) return;
    api
      .getPlayerClueStatus(playerId)
      .then((s) => setSolved(s.solved))
      .catch(() => undefined);
  }, [playerId]);

  useEffect(() => {
    if (!playerId) {
      setItems([]);
      setSolved(false);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    api
      .getPlayerClues(playerId)
      .then((cs) => {
        if (!cancelled) setItems(cs);
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    refreshStatus();
    return () => {
      cancelled = true;
    };
  }, [playerId, refreshStatus]);

  // Each mutator updates local state and rechecks the solved status only
  // once the server has confirmed the change — not before. Doing it
  // optimistically races the still-in-flight write: the status check can
  // reach the server before the write does and read the stale answer, with
  // nothing to correct it afterwards (that required a reload to fix).
  const addItem = (c: Omit<PlayerClue, "id">) => {
    if (!playerId) return;
    api
      .createPlayerClue(playerId, c)
      .then((created) => {
        setItems((prev) => [...prev, created]);
        refreshStatus();
      })
      .catch(() => undefined);
  };

  const updateItem = (c: PlayerClue) => {
    if (!playerId) return;
    api
      .updatePlayerClue(playerId, c.id, c)
      .then(() => {
        setItems((prev) => prev.map((x) => (x.id === c.id ? c : x)));
        refreshStatus();
      })
      .catch(() => undefined);
  };

  const removeItem = (id: string) => {
    if (!playerId) return;
    api
      .deletePlayerClue(playerId, id)
      .then(() => {
        setItems((prev) => prev.filter((x) => x.id !== id));
        refreshStatus();
      })
      .catch(() => undefined);
  };

  return { items, solved, loading, addItem, updateItem, removeItem };
}
