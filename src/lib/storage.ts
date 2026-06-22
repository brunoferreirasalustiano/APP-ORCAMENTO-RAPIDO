import AsyncStorage from "@react-native-async-storage/async-storage";

import { TRIAL_DAYS } from "../constants/business";
import { createBlankItem, createBlankQuote } from "./quote";
import type { Company, PersistedAppState, Quote, QuoteItem, TrialState } from "../types/domain";

export const STORAGE_KEY = "orcamento-rapido-state-v2";

export function createInitialState(): PersistedAppState {
  return {
    trial: {
      firstOpenDate: new Date().toISOString(),
      trialDays: TRIAL_DAYS,
      isPremium: false,
      purchaseProductId: null
    },
    company: {
      businessName: "",
      ownerName: "",
      whatsapp: "",
      email: "",
      address: "",
      document: ""
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
    trialDays: normalizeNumber(value?.trialDays, fallback.trialDays),
    isPremium: typeof value?.isPremium === "boolean" ? value.isPremium : fallback.isPremium,
    purchaseProductId: typeof value?.purchaseProductId === "string" ? value.purchaseProductId : null
  };
}

function normalizeCompany(value: Partial<Company> | undefined, fallback: Company): Company {
  return {
    businessName: normalizeString(value?.businessName) || fallback.businessName,
    ownerName: normalizeString(value?.ownerName),
    whatsapp: normalizeString(value?.whatsapp),
    email: normalizeString(value?.email),
    address: normalizeString(value?.address),
    document: normalizeString(value?.document)
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
