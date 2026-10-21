import { useEffect, useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useGame } from "../context/GameContext";
import { usePlayerSections } from "../context/PlayerSectionsContext";
import { mapSectionId } from "../shared/data";
import { theme } from "../theme";
import { Character } from "../types";

// Pill order: Edit (the victim), Sten (the detective), Henrik, then the
// rest. Henrik is matched by name since he's an ordinary suspect.
const PIN_ORDER = ["victim", "detective", "Henrik Svärd"];
const pinRank = (c: { role: string; name: string }) => {
  const i = PIN_ORDER.findIndex((key) => key === c.role || key === c.name);
  return i === -1 ? PIN_ORDER.length : i;
};

// Edit, Sten (the detective) and every suspect get a location — even before
// it's been placed on the map. Witnesses don't. Characters at the same
// coordinates share one location (e.g. Kenta and Peter), whose section is
// named after the first of them.
export function groupMapLocations(all: Character[]): Character[][] {
  const characters = all
    .filter((c) => ["victim", "detective", "suspect"].includes(c.role))
    .sort((a, b) => pinRank(a) - pinRank(b));
  const groups = new Map<string, Character[]>();
  for (const c of characters) {
    const key = c.location ? `${c.location.lat},${c.location.lon}` : c.id;
    groups.set(key, [...(groups.get(key) ?? []), c]);
  }
  return Array.from(groups.values());
}

// The locations on Kartan and the player's progress on each, shared by
// Kartan itself and the Mördaren checklist.
export function useMapLocations() {
  const { game } = useGame();
  const { playerId } = useAuth();
  const { sections } = usePlayerSections();

  // Characters whose location the player has completed, saved per player in
  // the backend (player_map).
  const [solvedIds, setSolvedIds] = useState<string[]>([]);
  useEffect(() => {
    setSolvedIds([]);
    if (!playerId) return;
    let cancelled = false;
    api
      .getPlayerMap(playerId)
      .then((ids) => {
        if (!cancelled) setSolvedIds(ids);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [playerId]);

  const pins = groupMapLocations(game.characters).map((members) => {
    // Its own hint and skip, like the page's sections.
    const sectionId = mapSectionId(members[0].id);
    return {
      id: members[0].id,
      sectionId,
      members,
      label: members.map((m) => m.initials).join(" & "),
      role: members[0].role,
      name: members.map((m) => m.name).join(" & "),
      color: theme.roleColors[members[0].role] as string | undefined,
      location: members[0].location,
      // Checked when every character at it is.
      done: members.every((m) => solvedIds.includes(m.id)),
      skipped: !!sections[sectionId]?.skipped,
    };
  });

  // Kartan is complete once every location is checked or skipped.
  const allDone = pins.length > 0 && pins.every((p) => p.done || p.skipped);

  // Checks or unchecks a location, i.e. every character at it.
  const setDone = (pin: (typeof pins)[number], done: boolean) => {
    const memberIds = pin.members.map((m) => m.id);
    setSolvedIds((ids) =>
      done
        ? [...ids, ...memberIds.filter((id) => !ids.includes(id))]
        : ids.filter((x) => !memberIds.includes(x)),
    );
    if (!playerId) return;
    for (const id of memberIds) {
      api
        .setPlayerMapLocation(playerId, id, done)
        .catch((err) => console.error("Could not save map progress:", err));
    }
  };

  return { pins, allDone, setDone };
}

export type MapLocations = ReturnType<typeof useMapLocations>;
export type MapPin = MapLocations["pins"][number];
