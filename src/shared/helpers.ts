import { theme } from "../theme";
import { INVESTIGATION_SECTIONS } from "./data";

export function toMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

export function formatMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function subsectionKey(characterId: string, section: string): string {
  return `${characterId}__${section}`;
}

export function docTabColor(role?: string): string | undefined {
  if (role !== "suspect" && role !== "witness") return undefined;
  return theme.roleColors[role];
}

export function scrollToSection(id: string) {
  document
    .getElementById(id)
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function roleColor(role: string) {
  return theme.roleColors[role] ?? theme.textFaint;
}

export function loadProgress(progressKey: string): Record<string, boolean> {
  try {
    const saved = localStorage.getItem(progressKey);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

export function isCharacterInvestigated(
  characterId: string,
  progress: Record<string, boolean>,
): boolean {
  return INVESTIGATION_SECTIONS.every(
    (section) => !!progress[subsectionKey(characterId, section)],
  );
}

export function reportUploadError(err: unknown) {
  window.alert(
    `Kunde inte ladda upp filen: ${err instanceof Error ? err.message : String(err)}`,
  );
}

// mm:ss, with minutes allowed past 59 (e.g. "75:03").
export function formatElapsed(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
