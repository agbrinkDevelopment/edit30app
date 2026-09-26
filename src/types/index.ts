export interface TimelineEvent {
  id: string;
  time: string;
  description: string;
  characterIds: string[];
  revealed: boolean;
}

export interface Character {
  id: string;
  name: string;
  initials: string;
  role: "suspect" | "victim" | "detective" | "witness";
  description: string;
  motive: string;
  alibi: string;
  secrets: string;
  isKiller: boolean;
  imageUrl?: string | null;
  location?: { lat: number; lon: number } | null;
}

export interface Clue {
  id: string;
  title: string;
  description: string;
  location: string;
  revealedBy: string;
  relatedCharacterIds: string[];
  isMacguffin: boolean;
}

export interface Scene {
  id: string;
  title: string;
  description: string;
  order: number;
  characterIds: string[];
  clueIds: string[];
}

export interface EvidenceType {
  id: string;
  title: string;
  description: string;
  foundAt: string;
  relatedCharacterIds: string[];
  revealed: boolean;
}

export interface GameDocument {
  id: string;
  title: string;
  description: string;
  fileUrl: string;
  fileType: string;
  imageUrl?: string | null;
  relatedCharacterId?: string | null;
  revealed: boolean;
}

// A signed-in player (one per team). Created on sign-in; see App.tsx.
export interface Player {
  id: string;
  team: string;
}

// The player's own private reconstruction of the timeline — never the real
// timeline_events. See usePlayerTimeline / CaseTimeline.
export interface PlayerTimelineEvent {
  id: string;
  time: string;
  description: string;
  characterIds: string[];
}

// The player's own private reconstruction of the evidence — never the real
// evidence table. See usePlayerEvidence / PlayerEvidenceCard.
export interface PlayerEvidence {
  id: string;
  title: string;
  description: string;
  foundAt: string;
  relatedCharacterIds: string[];
}

// The player's own private reconstruction of the clues — never the real
// clues table. Omits `revealedBy`: that's the admin's narrative note on how
// a clue surfaces, not a fact the player is reconstructing.
export interface PlayerClue {
  id: string;
  title: string;
  description: string;
  location: string;
  relatedCharacterIds: string[];
  isMacguffin: boolean;
}

export interface GameState {
  title: string;
  description: string;
  characters: Character[];
  clues: Clue[];
  scenes: Scene[];
  timelineEvents: TimelineEvent[];
  evidence: EvidenceType[];
  documents: GameDocument[];
  newsArticles: GameDocument[];
  victimNotes: GameDocument[];
  killerRevealed: boolean;
}
