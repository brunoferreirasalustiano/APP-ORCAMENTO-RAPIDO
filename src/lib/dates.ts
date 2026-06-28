import type { TrialInfo, TrialState } from "../types/domain";
import { TRIAL_DAYS } from "../constants/business";

const DAY_MS = 24 * 60 * 60 * 1000;

export function getTrialInfo(trial: TrialState): TrialInfo {
  const parsedFirstOpen = new Date(trial.firstOpenDate);
  const firstOpen = Number.isNaN(parsedFirstOpen.getTime()) ? new Date() : parsedFirstOpen;
  // Product decision only: this local trial improves onboarding, but it is not an anti-fraud control.
  const trialDays = TRIAL_DAYS;
  const elapsedDays = Math.max(0, Math.floor((Date.now() - firstOpen.getTime()) / DAY_MS));
  const remainingDays = Math.max(0, trialDays - elapsedDays);

  return {
    elapsedDays,
    remainingDays,
    isActive: elapsedDays < trialDays,
    endsAt: new Date(firstOpen.getTime() + trialDays * DAY_MS)
  };
}

export function formatDate(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("pt-BR");
}

export function parseQuoteDate(value: string): Date | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const brDate = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(trimmed);
  if (brDate) {
    const day = Number(brDate[1]);
    const month = Number(brDate[2]);
    const year = Number(brDate[3]);
    const date = new Date(year, month - 1, day);

    if (date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day) {
      return date;
    }

    return null;
  }

  const isoDate = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (isoDate) {
    const year = Number(isoDate[1]);
    const month = Number(isoDate[2]);
    const day = Number(isoDate[3]);
    const date = new Date(year, month - 1, day);

    if (date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day) {
      return date;
    }

    return null;
  }

  const parsed = new Date(trimmed);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function startOfLocalDay(value: string | Date): Date | null {
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return null;
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function isQuoteValidUntilBeforeIssueDate(validUntil: string, createdAt: string): boolean {
  const validUntilDate = parseQuoteDate(validUntil);
  if (!validUntilDate) return false;

  const issueDate = startOfLocalDay(createdAt);
  if (!issueDate) return false;

  return startOfLocalDay(validUntilDate)!.getTime() < issueDate.getTime();
}
