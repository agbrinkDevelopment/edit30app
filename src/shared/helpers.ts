import { theme } from "../theme";
import {
  CORRECT_OWNER_FOR_ITEM,
  INVESTIGATION_SECTIONS,
  SORT_ITEMS,
  SORT_KEY,
} from "./data";

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

export function correctItemsFor(characterId: string): string[] {
  return SORT_ITEMS.filter(
    (item) => CORRECT_OWNER_FOR_ITEM[item.id] === characterId,
  ).map((item) => item.id);
}

export function isBucketSolved(
  characterId: string,
  itemBucket: Record<string, string>,
): boolean {
  const correct = correctItemsFor(characterId);
  if (correct.length === 0) return false;
  const current = SORT_ITEMS.filter(
    (item) => itemBucket[item.id] === characterId,
  ).map((item) => item.id);
  if (current.length !== correct.length) return false;
  const correctSet = new Set(correct);
  return current.every((id) => correctSet.has(id));
}

export function loadSort(): Record<string, string> {
  try {
    const saved = localStorage.getItem(SORT_KEY);
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
