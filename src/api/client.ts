import {
  Character,
  EvidenceType,
  GameDocument,
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
    headers: { "Content-Type": "application/json" },
    ...options,
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
};
