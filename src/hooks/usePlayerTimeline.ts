import { useCallback, useEffect, useState } from "react";
import { api } from "../api/client";
import { PlayerTimelineEvent } from "../types";

// A player's own, private reconstruction of the timeline, and whether it
// currently matches the real timeline_events (compared server-side — the
// real content is never sent to the browser). Used by CaseTimeline to render
// and edit the player's list, and by KillerGuessCard for its checklist.
export function usePlayerTimeline(playerId: string | undefined) {
  const [events, setEvents] = useState<PlayerTimelineEvent[]>([]);
  const [solved, setSolved] = useState(false);
  const [loading, setLoading] = useState(!!playerId);

  const refreshStatus = useCallback(() => {
    if (!playerId) return;
    api
      .getPlayerTimelineStatus(playerId)
      .then((s) => setSolved(s.solved))
      .catch(() => undefined);
  }, [playerId]);

  useEffect(() => {
    if (!playerId) {
      setEvents([]);
      setSolved(false);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    api
      .getPlayerTimelineEvents(playerId)
      .then((evs) => {
        if (!cancelled) setEvents(evs);
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
  // optimistically (updating state, then separately re-checking status)
  // races the still-in-flight write: the status check can reach the server
  // before the write does and read the stale answer, with nothing to correct
  // it afterwards (that's what required a reload to see the right state).
  const addEvent = (e: Omit<PlayerTimelineEvent, "id">) => {
    if (!playerId) return;
    api
      .createPlayerTimelineEvent(playerId, e)
      .then((created) => {
        setEvents((prev) => [...prev, created]);
        refreshStatus();
      })
      .catch(() => undefined);
  };

  const updateEvent = (e: PlayerTimelineEvent) => {
    if (!playerId) return;
    api
      .updatePlayerTimelineEvent(playerId, e.id, e)
      .then(() => {
        setEvents((prev) => prev.map((x) => (x.id === e.id ? e : x)));
        refreshStatus();
      })
      .catch(() => undefined);
  };

  const removeEvent = (id: string) => {
    console.log("HERE id= ", id);
    if (!playerId) return;
    api
      .deletePlayerTimelineEvent(playerId, id)
      .then(() => {
        setEvents((prev) => prev.filter((x) => x.id !== id));
        refreshStatus();
      })
      .catch(() => undefined);
  };

  return { events, solved, loading, addEvent, updateEvent, removeEvent };
}
