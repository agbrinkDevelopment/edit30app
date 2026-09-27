import {
  Character,
  Clue,
  EvidenceType,
  GameResult,
  GameDocument,
  Player,
  PlayerClue,
  PlayerEvidence,
  PlayerSection,
  PlayerTimelineEvent,
  SectionHint,
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

// Uploaded files are stored as "/api/uploads/<name>" rather than a full URL,
// so the same row works whichever backend serves it (localhost or deployed).
// Resolves that against the API's own origin; any other URL (public assets
// like "/characters/…", old data: URLs) is returned unchanged.
export function fileSrc(url: string): string;
export function fileSrc(
  url: string | null | undefined,
): string | undefined;
export function fileSrc(url: string | null | undefined) {
  if (!url) return undefined;
  return url.startsWith("/api/")
    ? API_BASE_URL.replace(/\/api\/?$/, "") + url
    : url;
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
  // Sends the file as the raw body; the backend puts it in blob storage and
  // returns the path to store on the document.
  uploadFile: (file: File) =>
    request<{ url: string }>("/uploads", {
      method: "POST",
      body: file,
      headers: { "Content-Type": file.type },
    }),

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

  signInPlayer: (team: string, role: "admin" | "player") =>
    post<Player>("/players/sign-in", { team, role }),
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
  setPlayerClue: (
    playerId: string,
    clueId: string,
    characterId: string | null,
  ) => put<PlayerClue>(`/players/${playerId}/clues/${clueId}`, { characterId }),
  getPlayerClueStatus: (playerId: string) =>
    get<{ solved: boolean; solvedCharacterIds: string[] }>(
      `/players/${playerId}/clue-status`,
    ),

  getSectionHints: () => get<SectionHint[]>("/section-hints"),
  updateSectionHint: (
    sectionId: string,
    h: Partial<Omit<SectionHint, "sectionId">>,
  ) => put<SectionHint>(`/section-hints/${sectionId}`, h),

  getPlayerSections: (playerId: string) =>
    get<PlayerSection[]>(`/players/${playerId}/sections`),
  revealSectionHint: (playerId: string, sectionId: string) =>
    post<PlayerSection>(`/players/${playerId}/sections/${sectionId}/hint`, {}),
  skipSection: (playerId: string, sectionId: string) =>
    post<PlayerSection>(`/players/${playerId}/sections/${sectionId}/skip`, {}),

  // 404 (no result yet) comes back as null rather than an error.
  getGameResult: (playerId: string) =>
    get<GameResult>(`/players/${playerId}/result`).catch((err: Error) => {
      if (err.message.includes(" 404 ")) return null;
      throw err;
    }),
  submitGameResult: (
    playerId: string,
    body: { guessedCharacterId: string; elapsedSeconds: number },
  ) => post<GameResult>(`/players/${playerId}/result`, body),
};
