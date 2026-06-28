import type { Quote } from "../types/domain";

function quoteWithTotals(discount = 0): Quote {
  return {
    id: "ORC-0001",
    createdAt: "2026-06-28T12:00:00.000Z",
    clientName: "Cliente",
    clientWhatsapp: "",
    vehicle: "",
    plate: "",
    validUntil: "",
    warranty: "",
    paymentMethod: "",
    notes: "",
    discount,
    items: [
      { id: "1", description: "Servico A", quantity: 2, unitPrice: 150, type: "Servico" },
      { id: "2", description: "Servico B", quantity: 1.5, unitPrice: 80, type: "Servico" }
    ]
  };
}

test("Calcula subtotal somando quantidade vezes valor unitário dos itens", () => {
  const { quote } = __TEST_RUNTIME__.loadModules({ dev: false });

  expect(quote.quoteSubtotal(quoteWithTotals())).toBe(420);
});

test("Calcula total aplicando desconto", () => {
  const { quote } = __TEST_RUNTIME__.loadModules({ dev: false });

  expect(quote.quoteTotal(quoteWithTotals(70))).toBe(350);
});

test("Total do orçamento nunca fica negativo quando desconto excede subtotal", () => {
  const { quote } = __TEST_RUNTIME__.loadModules({ dev: false });

  expect(quote.quoteTotal(quoteWithTotals(999))).toBe(0);
});

test("Gera número de orçamento sequencial com padding e fallback seguro", () => {
  const { quote } = __TEST_RUNTIME__.loadModules({ dev: false });

  expect(quote.createQuoteNumber(12)).toBe("ORC-0012");
  expect(quote.createQuoteNumber(-1)).toBe("ORC-0001");
});
