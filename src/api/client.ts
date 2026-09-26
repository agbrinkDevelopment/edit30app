import {
  Character,
  Clue,
  EvidenceType,
  GameDocument,
  Player,
  PlayerClue,
  PlayerEvidence,
  PlayerTimelineEvent,
  TimelineEvent,
} from "../types";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:4000/api";

export interface GameSettings {
  title: string;
  description: string;
  killerRevealed: boolean;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    // Only set this when there's actually a body: Fastify's JSON parser
    // rejects a request that declares this content-type but sends an empty
    // body (e.g. every DELETE, which never has one).
    headers: {
      ...(options?.body ? { "Content-Type": "application/json" } : {}),
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `${options?.method ?? "GET"} ${path} failed: ${res.status} ${body}`,
    );
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

const get = <T>(path: string) => request<T>(path);
const post = <T>(path: string, body: unknown) =>
  request<T>(path, { method: "POST", body: JSON.stringify(body) });
const put = <T>(path: string, body: unknown) =>
  request<T>(path, { method: "PUT", body: JSON.stringify(body) });
const patch = <T>(path: string, body: unknown) =>
  request<T>(path, { method: "PATCH", body: JSON.stringify(body) });
const del = (path: string) => request<void>(path, { method: "DELETE" });

export const api = {
  getGame: () => get<GameSettings>("/game"),
  updateGame: (patchBody: Partial<GameSettings>) =>
    patch<GameSettings>("/game", patchBody),

  getCharacters: () => get<Character[]>("/characters"),
  createCharacter: (c: Omit<Character, "id">) =>
    post<Character>("/characters", c),
  updateCharacter: (id: string, c: Partial<Character>) =>
    put<Character>(`/characters/${id}`, c),
  deleteCharacter: (id: string) => del(`/characters/${id}`),

  getClues: () => get<Clue[]>("/clues"),
  createClue: (c: Omit<Clue, "id">) => post<Clue>("/clues", c),
  updateClue: (id: string, c: Partial<Clue>) => put<Clue>(`/clues/${id}`, c),
  deleteClue: (id: string) => del(`/clues/${id}`),

  getTimelineEvents: () => get<TimelineEvent[]>("/timeline-events"),
  createTimelineEvent: (e: Omit<TimelineEvent, "id">) =>
    post<TimelineEvent>("/timeline-events", e),
  updateTimelineEvent: (id: string, e: Partial<TimelineEvent>) =>
    put<TimelineEvent>(`/timeline-events/${id}`, e),
  setTimelineEventRevealed: (id: string, revealed: boolean) =>
    patch<TimelineEvent>(`/timeline-events/${id}/revealed`, { revealed }),
  deleteTimelineEvent: (id: string) => del(`/timeline-events/${id}`),

  getEvidence: () => get<EvidenceType[]>("/evidence"),
  createEvidence: (e: Omit<EvidenceType, "id">) =>
    post<EvidenceType>("/evidence", e),
  updateEvidence: (id: string, e: Partial<EvidenceType>) =>
    put<EvidenceType>(`/evidence/${id}`, e),
  setEvidenceRevealed: (id: string, revealed: boolean) =>
    patch<EvidenceType>(`/evidence/${id}/revealed`, { revealed }),
  deleteEvidence: (id: string) => del(`/evidence/${id}`),

  getDocuments: () => get<GameDocument[]>("/documents"),
  createDocument: (d: Omit<GameDocument, "id">) =>
    post<GameDocument>("/documents", d),
  updateDocument: (id: string, d: Partial<GameDocument>) =>
    put<GameDocument>(`/documents/${id}`, d),
  setDocumentRevealed: (id: string, revealed: boolean) =>
    patch<GameDocument>(`/documents/${id}/revealed`, { revealed }),
  deleteDocument: (id: string) => del(`/documents/${id}`),

  getNewsArticles: () => get<GameDocument[]>("/news-articles"),
  createNewsArticle: (d: Omit<GameDocument, "id">) =>
    post<GameDocument>("/news-articles", d),
  updateNewsArticle: (id: string, d: Partial<GameDocument>) =>
    put<GameDocument>(`/news-articles/${id}`, d),
  setNewsArticleRevealed: (id: string, revealed: boolean) =>
    patch<GameDocument>(`/news-articles/${id}/revealed`, { revealed }),
  deleteNewsArticle: (id: string) => del(`/news-articles/${id}`),

  getVictimNotes: () => get<GameDocument[]>("/victim-notes"),
  createVictimNote: (d: Omit<GameDocument, "id">) =>
    post<GameDocument>("/victim-notes", d),
  updateVictimNote: (id: string, d: Partial<GameDocument>) =>
    put<GameDocument>(`/victim-notes/${id}`, d),
  setVictimNoteRevealed: (id: string, revealed: boolean) =>
    patch<GameDocument>(`/victim-notes/${id}/revealed`, { revealed }),
  deleteVictimNote: (id: string) => del(`/victim-notes/${id}`),

  signInPlayer: (team: string) => post<Player>("/players/sign-in", { team }),
  getPlayerTimelineEvents: (playerId: string) =>
    get<PlayerTimelineEvent[]>(`/players/${playerId}/timeline-events`),
  createPlayerTimelineEvent: (
    playerId: string,
    e: Omit<PlayerTimelineEvent, "id">,
  ) => post<PlayerTimelineEvent>(`/players/${playerId}/timeline-events`, e),
  updatePlayerTimelineEvent: (
    playerId: string,
    id: string,
    e: Partial<PlayerTimelineEvent>,
  ) => put<PlayerTimelineEvent>(`/players/${playerId}/timeline-events/${id}`, e),
  deletePlayerTimelineEvent: (playerId: string, id: string) =>
    del(`/players/${playerId}/timeline-events/${id}`),
  getPlayerTimelineStatus: (playerId: string) =>
    get<{ solved: boolean }>(`/players/${playerId}/timeline-status`),

  getPlayerEvidence: (playerId: string) =>
    get<PlayerEvidence[]>(`/players/${playerId}/evidence`),
  createPlayerEvidence: (playerId: string, e: Omit<PlayerEvidence, "id">) =>
    post<PlayerEvidence>(`/players/${playerId}/evidence`, e),
  updatePlayerEvidence: (
    playerId: string,
    id: string,
    e: Partial<PlayerEvidence>,
  ) => put<PlayerEvidence>(`/players/${playerId}/evidence/${id}`, e),
  deletePlayerEvidence: (playerId: string, id: string) =>
    del(`/players/${playerId}/evidence/${id}`),
  getPlayerEvidenceStatus: (playerId: string) =>
    get<{ solved: boolean }>(`/players/${playerId}/evidence-status`),

  getPlayerClues: (playerId: string) =>
    get<PlayerClue[]>(`/players/${playerId}/clues`),
  createPlayerClue: (playerId: string, c: Omit<PlayerClue, "id">) =>
    post<PlayerClue>(`/players/${playerId}/clues`, c),
  updatePlayerClue: (playerId: string, id: string, c: Partial<PlayerClue>) =>
    put<PlayerClue>(`/players/${playerId}/clues/${id}`, c),
  deletePlayerClue: (playerId: string, id: string) =>
    del(`/players/${playerId}/clues/${id}`),
  getPlayerClueStatus: (playerId: string) =>
    get<{ solved: boolean }>(`/players/${playerId}/clue-status`),
};
