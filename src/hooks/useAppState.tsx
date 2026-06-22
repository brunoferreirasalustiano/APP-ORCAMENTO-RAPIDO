import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { PREMIUM_PRODUCT_ID } from "../constants/business";
import { IS_DEV_BUILD } from "../constants/runtime";
import { getTrialInfo } from "../lib/dates";
import { createBlankItem, createBlankQuote, duplicateQuote } from "../lib/quote";
import { createInitialState, loadPersistedState, savePersistedState } from "../lib/storage";
import type { Company, PersistedAppState, Quote, QuoteItem, TrialInfo } from "../types/domain";

type AppContextValue = PersistedAppState & {
  isHydrated: boolean;
  trialInfo: TrialInfo;
  canUsePremiumFeature: boolean;
  updateCompany: (patch: Partial<Company>) => void;
  updateCurrentQuote: (patch: Partial<Quote>) => void;
  updateQuoteItem: (itemId: string, patch: Partial<QuoteItem>) => void;
  addQuoteItem: () => void;
  removeQuoteItem: (itemId: string) => void;
  saveCurrentQuote: () => { ok: true } | { ok: false; reason: string };
  startNewQuote: () => void;
  openQuote: (quoteId: string) => void;
  duplicateSavedQuote: (quoteId: string) => void;
  unlockPremiumForTesting: () => void;
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PersistedAppState>(() => createInitialState());
  const [isHydrated, setHydrated] = useState(false);

  useEffect(() => {
    let mounted = true;

    loadPersistedState()
      .then((loaded) => {
        if (mounted) setState(loaded);
      })
      .finally(() => {
        if (mounted) setHydrated(true);
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (isHydrated) void savePersistedState(state);
  }, [isHydrated, state]);

  const setPersistedState = useCallback((updater: (previous: PersistedAppState) => PersistedAppState) => {
    setState((previous) => updater(previous));
  }, []);

  const updateCompany = useCallback(
    (patch: Partial<Company>) => {
      setPersistedState((previous) => ({ ...previous, company: { ...previous.company, ...patch } }));
    },
    [setPersistedState]
  );

  const updateCurrentQuote = useCallback(
    (patch: Partial<Quote>) => {
      setPersistedState((previous) => ({
        ...previous,
        currentQuote: { ...previous.currentQuote, ...patch }
      }));
    },
    [setPersistedState]
  );

  const updateQuoteItem = useCallback(
    (itemId: string, patch: Partial<QuoteItem>) => {
      setPersistedState((previous) => ({
        ...previous,
        currentQuote: {
          ...previous.currentQuote,
          items: previous.currentQuote.items.map((item) => (item.id === itemId ? { ...item, ...patch } : item))
        }
      }));
    },
    [setPersistedState]
  );

  const addQuoteItem = useCallback(() => {
    setPersistedState((previous) => ({
      ...previous,
      currentQuote: {
        ...previous.currentQuote,
        items: [...previous.currentQuote.items, createBlankItem()]
      }
    }));
  }, [setPersistedState]);

  const removeQuoteItem = useCallback(
    (itemId: string) => {
      setPersistedState((previous) => {
        const items = previous.currentQuote.items.filter((item) => item.id !== itemId);
        return {
          ...previous,
          currentQuote: {
            ...previous.currentQuote,
            items: items.length ? items : [createBlankItem()]
          }
        };
      });
    },
    [setPersistedState]
  );

  const saveCurrentQuote = useCallback(() => {
    if (!state.currentQuote.clientName.trim()) {
      return { ok: false as const, reason: "Informe o nome do cliente." };
    }

    setPersistedState((previous) => {
      const existingIndex = previous.quotes.findIndex((quote) => quote.id === previous.currentQuote.id);
      const quotes = [...previous.quotes];

      if (existingIndex >= 0) {
        quotes[existingIndex] = previous.currentQuote;
      } else {
        quotes.unshift(previous.currentQuote);
      }

      return { ...previous, quotes };
    });

    return { ok: true as const };
  }, [setPersistedState, state.currentQuote.clientName]);

  const startNewQuote = useCallback(() => {
    setPersistedState((previous) => ({
      ...previous,
      currentQuote: createBlankQuote(previous.quoteSequence),
      quoteSequence: previous.quoteSequence + 1
    }));
  }, [setPersistedState]);

  const openQuote = useCallback(
    (quoteId: string) => {
      setPersistedState((previous) => {
        const quote = previous.quotes.find((item) => item.id === quoteId);
        return quote ? { ...previous, currentQuote: quote } : previous;
      });
    },
    [setPersistedState]
  );

  const duplicateSavedQuote = useCallback(
    (quoteId: string) => {
      setPersistedState((previous) => {
        const quote = previous.quotes.find((item) => item.id === quoteId);
        return quote
          ? {
              ...previous,
              currentQuote: duplicateQuote(quote, previous.quoteSequence),
              quoteSequence: previous.quoteSequence + 1
            }
          : previous;
      });
    },
    [setPersistedState]
  );

  const unlockPremiumForTesting = useCallback(() => {
    if (!IS_DEV_BUILD) return;

    setPersistedState((previous) => ({
      ...previous,
      trial: {
        ...previous.trial,
        isPremium: true,
        purchaseProductId: PREMIUM_PRODUCT_ID
      }
    }));
  }, [setPersistedState]);

  const trialInfo = useMemo(() => getTrialInfo(state.trial), [state.trial]);
  const canUsePremiumFeature = state.trial.isPremium || trialInfo.isActive;

  const value = useMemo<AppContextValue>(
    () => ({
      ...state,
      isHydrated,
      trialInfo,
      canUsePremiumFeature,
      updateCompany,
      updateCurrentQuote,
      updateQuoteItem,
      addQuoteItem,
      removeQuoteItem,
      saveCurrentQuote,
      startNewQuote,
      openQuote,
      duplicateSavedQuote,
      unlockPremiumForTesting
    }),
    [
      addQuoteItem,
      canUsePremiumFeature,
      duplicateSavedQuote,
      isHydrated,
      openQuote,
      removeQuoteItem,
      saveCurrentQuote,
      startNewQuote,
      state,
      trialInfo,
      unlockPremiumForTesting,
      updateCompany,
      updateCurrentQuote,
      updateQuoteItem
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppState() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useAppState must be used inside AppProvider");
  return context;
}
