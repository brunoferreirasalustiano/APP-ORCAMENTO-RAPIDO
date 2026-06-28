import { PREMIUM_PRODUCT_ID } from "../constants/business";
import { IS_DEV_BUILD } from "../constants/runtime";
import type { EntitlementState, TrialInfo } from "../types/domain";

export function createEmptyEntitlement(): EntitlementState {
  return {
    hasPremiumAccess: false,
    source: "none",
    purchaseProductId: null,
    verifiedAt: null
  };
}

export function createDevelopmentEntitlement(): EntitlementState {
  return {
    hasPremiumAccess: true,
    source: "development_override",
    purchaseProductId: PREMIUM_PRODUCT_ID,
    verifiedAt: new Date().toISOString()
  };
}

export function canUsePremiumFeature(entitlement: EntitlementState, trialInfo: TrialInfo): boolean {
  return isVerifiedPremium(entitlement) || trialInfo.isActive;
}

export function isVerifiedPremium(entitlement: EntitlementState): boolean {
  if (!entitlement.hasPremiumAccess) return false;
  return IS_DEV_BUILD && entitlement.source === "development_override";
}
