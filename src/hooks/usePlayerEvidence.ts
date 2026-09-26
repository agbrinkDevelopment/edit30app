import { useCallback, useEffect, useState } from "react";
import { api } from "../api/client";
import { PlayerEvidence } from "../types";

// A player's own, private reconstruction of the physical evidence, and
// whether it currently matches the real evidence (compared server-side — the
// real content is never sent to the browser). Mirrors usePlayerTimeline.
export function usePlayerEvidence(playerId: string | undefined) {
  const [items, setItems] = useState<PlayerEvidence[]>([]);
  const [solved, setSolved] = useState(false);
  const [loading, setLoading] = useState(!!playerId);

  const refreshStatus = useCallback(() => {
    if (!playerId) return;
    api
      .getPlayerEvidenceStatus(playerId)
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
      .getPlayerEvidence(playerId)
      .then((evs) => {
        if (!cancelled) setItems(evs);
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
  const addItem = (e: Omit<PlayerEvidence, "id">) => {
    if (!playerId) return;
    api
      .createPlayerEvidence(playerId, e)
      .then((created) => {
        setItems((prev) => [...prev, created]);
        refreshStatus();
      })
      .catch(() => undefined);
  };

  const updateItem = (e: PlayerEvidence) => {
    if (!playerId) return;
    api
      .updatePlayerEvidence(playerId, e.id, e)
      .then(() => {
        setItems((prev) => prev.map((x) => (x.id === e.id ? e : x)));
        refreshStatus();
      })
      .catch(() => undefined);
  };

  const removeItem = (id: string) => {
    if (!playerId) return;
    api
      .deletePlayerEvidence(playerId, id)
      .then(() => {
        setItems((prev) => prev.filter((x) => x.id !== id));
        refreshStatus();
      })
      .catch(() => undefined);
  };

  return { items, solved, loading, addItem, updateItem, removeItem };
}
