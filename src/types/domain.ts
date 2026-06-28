export type QuoteItemType = "Servico";

export type Company = {
  businessName: string;
  ownerName: string;
  whatsapp: string;
  email: string;
  address: string;
  document: string;
  logoUri: string;
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
  paymentMethod: string;
  notes: string;
  discount: number;
  items: QuoteItem[];
};

export type TrialState = {
  firstOpenDate: string;
  trialDays: number;
};

export type EntitlementSource = "none" | "google_play_unverified" | "google_play_pending" | "development_override";

export type EntitlementState = {
  hasPremiumAccess: boolean;
  source: EntitlementSource;
  purchaseProductId: string | null;
  verifiedAt: string | null;
};

export type PersistedAppState = {
  trial: TrialState;
  entitlement: EntitlementState;
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
