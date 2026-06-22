import type { Quote, QuoteItem } from "../types/domain";

export function createId(prefix: string): string {
  const time = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `${prefix}-${time}-${random}`;
}

export function createQuoteNumber(sequence: number): string {
  const safeSequence = Number.isFinite(sequence) && sequence > 0 ? Math.floor(sequence) : 1;
  return `ORC-${String(safeSequence).padStart(4, "0")}`;
}

export function createBlankItem(): QuoteItem {
  return {
    id: createId("ITEM"),
    description: "",
    quantity: 1,
    unitPrice: 0,
    type: "Servico"
  };
}

export function createBlankQuote(sequence = 1): Quote {
  return {
    id: createQuoteNumber(sequence),
    createdAt: new Date().toISOString(),
    clientName: "",
    clientWhatsapp: "",
    vehicle: "",
    plate: "",
    validUntil: "",
    warranty: "",
    notes: "",
    discount: 0,
    items: [createBlankItem()]
  };
}

export function quoteSubtotal(quote: Quote): number {
  return quote.items.reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.unitPrice || 0), 0);
}

export function quoteTotal(quote: Quote): number {
  return Math.max(0, quoteSubtotal(quote) - Number(quote.discount || 0));
}

export function duplicateQuote(quote: Quote, sequence = 1): Quote {
  return {
    ...quote,
    id: createQuoteNumber(sequence),
    createdAt: new Date().toISOString(),
    items: quote.items.map((item) => ({ ...item, id: createId("ITEM") }))
  };
}
