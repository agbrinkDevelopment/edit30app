import { useCallback, useEffect, useState } from "react";
import { api } from "../api/client";

// A player's own mapping of clues (items) to characters, and whether it
// matches the real owners in the clues table (compared server-side — overall
// and per character). Mirrors usePlayerTimeline / usePlayerEvidence.
export function usePlayerClue(playerId: string | undefined) {
  // clueId -> characterId; a missing entry means unassigned.
  const [assignments, setAssignments] = useState<Record<string, string | null>>(
    {},
  );
  const [solved, setSolved] = useState(false);
  const [solvedCharacterIds, setSolvedCharacterIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(!!playerId);

  const refreshStatus = useCallback(() => {
    if (!playerId) return;
    api
      .getPlayerClueStatus(playerId)
      .then((s) => {
        setSolved(s.solved);
        setSolvedCharacterIds(s.solvedCharacterIds);
      })
      .catch(() => undefined);
  }, [playerId]);

  useEffect(() => {
    if (!playerId) {
      setAssignments({});
      setSolved(false);
      setSolvedCharacterIds([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    api
      .getPlayerClues(playerId)
      .then((cs) => {
        if (!cancelled)
          setAssignments(
            Object.fromEntries(cs.map((c) => [c.clueId, c.characterId])),
          );
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

  // The drop itself is shown immediately so dragging feels instant, but the
  // solved status is only rechecked once the server has confirmed the write
  // — checking earlier can race the write and read the stale answer. A
  // failed write puts the item back where it was.
  const assign = (clueId: string, characterId: string | null) => {
    if (!playerId) return;
    const previous = assignments[clueId] ?? null;
    if (previous === characterId) return;
    setAssignments((prev) => ({ ...prev, [clueId]: characterId }));
    api
      .setPlayerClue(playerId, clueId, characterId)
      .then(() => refreshStatus())
      .catch(() => setAssignments((prev) => ({ ...prev, [clueId]: previous })));
  };

  return { assignments, solved, solvedCharacterIds, loading, assign };
}
