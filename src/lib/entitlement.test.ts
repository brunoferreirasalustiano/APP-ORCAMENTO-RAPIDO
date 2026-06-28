import type { EntitlementState, PersistedAppState } from "../types/domain";

function createPersistedState(patch: Partial<PersistedAppState> = {}): PersistedAppState {
  const { storage } = __TEST_RUNTIME__.loadModules({ dev: false });
  return {
    ...storage.createInitialState(),
    ...patch
  };
}

function expiredTrialState() {
  return {
    firstOpenDate: "2020-01-01T00:00:00.000Z",
    trialDays: 9999
  };
}

function activeTrialState() {
  return {
    firstOpenDate: new Date().toISOString(),
    trialDays: 0
  };
}

function unverifiedGooglePlayEntitlement(patch: Partial<EntitlementState> = {}): EntitlementState {
  return {
    hasPremiumAccess: true,
    source: "google_play_unverified",
    purchaseProductId: "premium_lifetime",
    verifiedAt: "2026-01-01T00:00:00.000Z",
    ...patch
  };
}

async function loadProductionState(rawState: PersistedAppState) {
  const { storage } = __TEST_RUNTIME__.loadModules({ dev: false });
  __TEST_STORAGE__.reset({ [storage.STORAGE_KEY]: JSON.stringify(rawState) });
  return storage.loadPersistedState();
}

test("Entitlement com source google_play_unverified não deve liberar Premium", () => {
  const { entitlement } = __TEST_RUNTIME__.loadModules({ dev: false });

  const canUsePremium = entitlement.canUsePremiumFeature(unverifiedGooglePlayEntitlement(), {
    elapsedDays: 99,
    remainingDays: 0,
    isActive: false,
    endsAt: new Date("2020-01-08T00:00:00.000Z")
  });

  expect(canUsePremium).toBe(false);
});

test("Entitlement com source google_play_pending não deve liberar Premium", () => {
  const { entitlement } = __TEST_RUNTIME__.loadModules({ dev: false });

  const canUsePremium = entitlement.canUsePremiumFeature(
    unverifiedGooglePlayEntitlement({ source: "google_play_pending" }),
    {
      elapsedDays: 99,
      remainingDays: 0,
      isActive: false,
      endsAt: new Date("2020-01-08T00:00:00.000Z")
    }
  );

  expect(canUsePremium).toBe(false);
});

test("Entitlement com hasPremiumAccess true vindo de storage não deve liberar Premium em produção", async () => {
  const state = await loadProductionState(
    createPersistedState({
      trial: expiredTrialState(),
      entitlement: unverifiedGooglePlayEntitlement({
        source: "development_override"
      })
    })
  );
  const { dates, entitlement } = __TEST_RUNTIME__.loadModules({ dev: false });

  expect(entitlement.canUsePremiumFeature(state.entitlement, dates.getTrialInfo(state.trial))).toBe(false);
});

test("trial.isPremium legado não deve virar Premium em produção", async () => {
  const legacyState = createPersistedState({
    trial: {
      ...expiredTrialState(),
      isPremium: true,
      purchaseProductId: "premium_lifetime"
    } as PersistedAppState["trial"]
  });
  const state = await loadProductionState(legacyState);
  const { dates, entitlement } = __TEST_RUNTIME__.loadModules({ dev: false });

  expect(entitlement.canUsePremiumFeature(state.entitlement, dates.getTrialInfo(state.trial))).toBe(false);
});

test("trialDays vindo do storage deve ser ignorado e substituído pela constante interna", async () => {
  const state = await loadProductionState(
    createPersistedState({
      trial: {
        firstOpenDate: "2020-01-01T00:00:00.000Z",
        trialDays: 9999
      }
    })
  );
  const { business, dates } = __TEST_RUNTIME__.loadModules({ dev: false });
  const trialInfo = dates.getTrialInfo(state.trial);

  expect(state.trial.trialDays).toBe(business.TRIAL_DAYS);
  expect(trialInfo.isActive).toBe(false);
});

test("Trial ativo pode liberar apenas o uso de teste definido como decisão de produto", () => {
  const { dates, entitlement } = __TEST_RUNTIME__.loadModules({ dev: false });
  const trialInfo = dates.getTrialInfo(activeTrialState());

  expect(entitlement.canUsePremiumFeature(entitlement.createEmptyEntitlement(), trialInfo)).toBe(true);
  expect(entitlement.isVerifiedPremium(entitlement.createEmptyEntitlement())).toBe(false);
});

test("unlock/development_override só pode liberar em ambiente __DEV__", () => {
  const productionModules = __TEST_RUNTIME__.loadModules({ dev: false });
  const developmentModules = __TEST_RUNTIME__.loadModules({ dev: true });
  const productionEntitlement = productionModules.entitlement.createDevelopmentEntitlement();
  const developmentEntitlement = developmentModules.entitlement.createDevelopmentEntitlement();

  expect(productionModules.entitlement.isVerifiedPremium(productionEntitlement)).toBe(false);
  expect(developmentModules.entitlement.isVerifiedPremium(developmentEntitlement)).toBe(true);
});

test("Dados antigos sem entitlement não devem quebrar o carregamento", async () => {
  const legacyState = createPersistedState({
    trial: expiredTrialState()
  });
  const legacyPayload = JSON.parse(JSON.stringify(legacyState)) as Partial<PersistedAppState>;
  delete legacyPayload.entitlement;

  const { storage } = __TEST_RUNTIME__.loadModules({ dev: false });
  __TEST_STORAGE__.reset({ [storage.STORAGE_KEY]: JSON.stringify(legacyPayload) });

  const loaded = await storage.loadPersistedState();

  expect(loaded.entitlement.source).toBe("none");
  expect(loaded.entitlement.hasPremiumAccess).toBe(false);
  expect(loaded.trial.trialDays).toBe(7);
});
