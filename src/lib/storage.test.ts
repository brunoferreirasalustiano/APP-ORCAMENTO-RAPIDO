import type { PersistedAppState } from "../types/domain";

test("Persistência normaliza orçamento antigo sem forma de pagamento e preserva totais calculáveis", async () => {
  const { storage, quote } = __TEST_RUNTIME__.loadModules({ dev: false });
  const legacyState = storage.createInitialState() as PersistedAppState;
  const legacyQuote = {
    id: "ORC-0042",
    createdAt: "2026-06-28T12:00:00.000Z",
    clientName: "Cliente antigo",
    clientWhatsapp: "11999999999",
    vehicle: "Servico",
    plate: "ABC",
    validUntil: "",
    warranty: "",
    notes: "",
    discount: 25,
    items: [{ id: "ITEM-1", description: "Mão de obra", quantity: 2, unitPrice: 100, type: "Servico" }]
  };

  __TEST_STORAGE__.reset({
    [storage.STORAGE_KEY]: JSON.stringify({
      ...legacyState,
      currentQuote: legacyQuote,
      quotes: [legacyQuote]
    })
  });

  const loaded = await storage.loadPersistedState();

  expect(loaded.currentQuote.paymentMethod).toBe("");
  expect(loaded.quotes[0]!.paymentMethod).toBe("");
  expect(quote.quoteTotal(loaded.currentQuote)).toBe(175);
});

test("Persistência recria item em branco quando orçamento salvo vem sem itens", async () => {
  const { storage } = __TEST_RUNTIME__.loadModules({ dev: false });
  const state = storage.createInitialState();

  __TEST_STORAGE__.reset({
    [storage.STORAGE_KEY]: JSON.stringify({
      ...state,
      currentQuote: {
        ...state.currentQuote,
        items: []
      }
    })
  });

  const loaded = await storage.loadPersistedState();

  expect(loaded.currentQuote.items.length).toBe(1);
  expect(loaded.currentQuote.items[0]!.quantity).toBe(1);
});

test("Persistência salva estado serializado no AsyncStorage", async () => {
  const { storage } = __TEST_RUNTIME__.loadModules({ dev: false });
  const state = storage.createInitialState();

  __TEST_STORAGE__.reset();
  await storage.savePersistedState({ ...state, quoteSequence: 10 });

  const saved = JSON.parse(__TEST_STORAGE__.snapshot()[storage.STORAGE_KEY]!);
  expect(saved.quoteSequence).toBe(10);
});
test("Persistência recupera estado inicial seguro quando JSON salvo está corrompido", async () => {
  const { storage } = __TEST_RUNTIME__.loadModules({ dev: false });

  __TEST_STORAGE__.reset({ [storage.STORAGE_KEY]: "{json-invalido" });

  const loaded = await storage.loadPersistedState();

  expect(loaded.quoteSequence).toBe(2);
  expect(loaded.quotes.length).toBe(0);
  expect(loaded.currentQuote.id).toBe("ORC-0001");
  expect(loaded.entitlement.source).toBe("none");
});
