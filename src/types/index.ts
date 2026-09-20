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
  killerRevealed: boolean;
}
