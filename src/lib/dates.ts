import type { TrialInfo, TrialState } from "../types/domain";

const DAY_MS = 24 * 60 * 60 * 1000;

export function getTrialInfo(trial: TrialState): TrialInfo {
  const parsedFirstOpen = new Date(trial.firstOpenDate);
  const firstOpen = Number.isNaN(parsedFirstOpen.getTime()) ? new Date() : parsedFirstOpen;
  const trialDays = Number.isFinite(trial.trialDays) && trial.trialDays > 0 ? trial.trialDays : 7;
  const elapsedDays = Math.max(0, Math.floor((Date.now() - firstOpen.getTime()) / DAY_MS));
  const remainingDays = Math.max(0, trialDays - elapsedDays);

  return {
    elapsedDays,
    remainingDays,
    isActive: trial.isPremium || elapsedDays < trialDays,
    endsAt: new Date(firstOpen.getTime() + trialDays * DAY_MS)
  };
}

export function formatDate(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("pt-BR");
}
