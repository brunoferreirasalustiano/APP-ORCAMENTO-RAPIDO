import AsyncStorage from "@react-native-async-storage/async-storage";

import { TRIAL_DAYS } from "../constants/business";
import { IS_DEV_BUILD } from "../constants/runtime";
import { createEmptyEntitlement } from "./entitlement";
import { createBlankItem, createBlankQuote } from "./quote";
import type { Company, EntitlementState, PersistedAppState, Quote, QuoteItem, TrialState } from "../types/domain";

export const STORAGE_KEY = "orcamento-rapido-state-v2";

export function createInitialState(): PersistedAppState {
  return {
    trial: {
      firstOpenDate: new Date().toISOString(),
      trialDays: TRIAL_DAYS
    },
    entitlement: createEmptyEntitlement(),
    company: {
      businessName: "",
      ownerName: "",
      whatsapp: "",
      email: "",
      address: "",
      document: "",
      logoUri: ""
    },
    currentQuote: createBlankQuote(1),
    quotes: [],
    quoteSequence: 2
  };
}

function normalizeNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function normalizeString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function normalizeTrial(value: Partial<TrialState> | undefined, fallback: TrialState): TrialState {
  return {
    firstOpenDate: normalizeString(value?.firstOpenDate) || fallback.firstOpenDate,
    trialDays: fallback.trialDays
  };
}

function normalizeEntitlementSource(value: unknown): EntitlementState["source"] {
  if (value === "development_override") return "development_override";
  if (value === "google_play_pending") return "google_play_pending";
  if (value === "google_play" || value === "google_play_unverified") return "google_play_unverified";
  return "none";
}

function normalizeEntitlement(
  value: Partial<EntitlementState> | undefined,
  fallback: EntitlementState,
  legacyTrial: unknown
): EntitlementState {
  const legacyTrialState = legacyTrial as { isPremium?: unknown; purchaseProductId?: unknown } | undefined;
  const source = normalizeEntitlementSource(value?.source);
  const canRestoreDevelopmentAccess = IS_DEV_BUILD && source === "development_override";
  const canMigrateLegacyDevelopmentAccess = IS_DEV_BUILD && typeof legacyTrialState?.isPremium === "boolean";
  const legacyHasPremiumAccess = legacyTrialState?.isPremium === true;
  const hasPremiumAccess =
    canRestoreDevelopmentAccess && typeof value?.hasPremiumAccess === "boolean"
      ? value.hasPremiumAccess
      : canMigrateLegacyDevelopmentAccess
        ? legacyHasPremiumAccess
        : fallback.hasPremiumAccess;

  return {
    hasPremiumAccess,
    source: hasPremiumAccess ? "development_override" : source,
    purchaseProductId:
      typeof value?.purchaseProductId === "string"
        ? value.purchaseProductId
        : typeof legacyTrialState?.purchaseProductId === "string"
          ? legacyTrialState.purchaseProductId
          : fallback.purchaseProductId,
    verifiedAt: typeof value?.verifiedAt === "string" ? value.verifiedAt : fallback.verifiedAt
  };
}

function normalizeCompany(value: Partial<Company> | undefined, fallback: Company): Company {
  return {
    businessName: normalizeString(value?.businessName) || fallback.businessName,
    ownerName: normalizeString(value?.ownerName),
    whatsapp: normalizeString(value?.whatsapp),
    email: normalizeString(value?.email),
    address: normalizeString(value?.address),
    document: normalizeString(value?.document),
    logoUri: normalizeString(value?.logoUri)
  };
}

function normalizeItem(value: Partial<QuoteItem> | undefined): QuoteItem {
  const fallback = createBlankItem();
  return {
    id: normalizeString(value?.id) || fallback.id,
    description: normalizeString(value?.description),
    quantity: normalizeNumber(value?.quantity, fallback.quantity),
    unitPrice: normalizeNumber(value?.unitPrice, fallback.unitPrice),
    type: "Servico"
  };
}

function normalizeQuote(value: Partial<Quote> | undefined, fallback = createBlankQuote()): Quote {
  const items = Array.isArray(value?.items) ? value.items.map((item) => normalizeItem(item)) : fallback.items;

  return {
    id: normalizeString(value?.id) || fallback.id,
    createdAt: normalizeString(value?.createdAt) || fallback.createdAt,
    clientName: normalizeString(value?.clientName),
    clientWhatsapp: normalizeString(value?.clientWhatsapp),
    vehicle: normalizeString(value?.vehicle),
    plate: normalizeString(value?.plate),
    validUntil: normalizeString(value?.validUntil),
    warranty: normalizeString(value?.warranty),
    paymentMethod: normalizeString(value?.paymentMethod),
    notes: normalizeString(value?.notes),
    discount: normalizeNumber(value?.discount, fallback.discount),
    items: items.length ? items : [createBlankItem()]
  };
}

function sequenceFromQuoteId(id: string): number | null {
  const match = /^ORC-(\d+)$/i.exec(id.trim());
  if (!match) return null;
  const parsed = Number(match[1]);
  return Number.isFinite(parsed) ? parsed : null;
}

function nextSequenceFromQuotes(currentQuote: Quote, quotes: Quote[]): number {
  const highest = [currentQuote, ...quotes].reduce((max, quote) => {
    const sequence = sequenceFromQuoteId(quote.id);
    return sequence && sequence > max ? sequence : max;
  }, 0);

  return highest + 1 || 1;
}

export async function loadPersistedState(): Promise<PersistedAppState> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = createInitialState();
      await savePersistedState(initial);
      return initial;
    }

    const parsed = JSON.parse(raw) as Partial<PersistedAppState>;
    const initial = createInitialState();

    const currentQuote = normalizeQuote(parsed.currentQuote, initial.currentQuote);
    const quotes = Array.isArray(parsed.quotes) ? parsed.quotes.map((quote) => normalizeQuote(quote)) : [];
    const quoteSequence = Math.max(
      normalizeNumber(parsed.quoteSequence, 0),
      nextSequenceFromQuotes(currentQuote, quotes)
    );

    return {
      trial: normalizeTrial(parsed.trial, initial.trial),
      entitlement: normalizeEntitlement(parsed.entitlement, initial.entitlement, parsed.trial),
      company: normalizeCompany(parsed.company, initial.company),
      currentQuote,
      quotes,
      quoteSequence
    };
  } catch {
    const initial = createInitialState();
    await savePersistedState(initial);
    return initial;
  }
}

export async function savePersistedState(state: PersistedAppState): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage failures should not crash the app while the user is filling a quote.
  }
}
