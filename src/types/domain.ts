export type QuoteItemType = "Servico";

export type Company = {
  businessName: string;
  ownerName: string;
  whatsapp: string;
  email: string;
  address: string;
  document: string;
};

export type QuoteItem = {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  type: QuoteItemType;
};

export type Quote = {
  id: string;
  createdAt: string;
  clientName: string;
  clientWhatsapp: string;
  vehicle: string;
  plate: string;
  validUntil: string;
  warranty: string;
  notes: string;
  discount: number;
  items: QuoteItem[];
};

export type TrialState = {
  firstOpenDate: string;
  trialDays: number;
  isPremium: boolean;
  purchaseProductId: string | null;
};

export type PersistedAppState = {
  trial: TrialState;
  company: Company;
  currentQuote: Quote;
  quotes: Quote[];
  quoteSequence: number;
};

export type TrialInfo = {
  elapsedDays: number;
  remainingDays: number;
  isActive: boolean;
  endsAt: Date;
};
