import type * as BusinessModule from "../constants/business";
import type * as DatesModule from "../lib/dates";
import type * as EntitlementModule from "../lib/entitlement";
import type * as StorageModule from "../lib/storage";

declare global {
  function test(name: string, fn: () => void | Promise<void>): void;

  function expect<T>(received: T): {
    toBe(expected: T): void;
    toEqual(expected: T): void;
  };

  const __TEST_STORAGE__: {
    reset(initialValues?: Record<string, string>): void;
    snapshot(): Record<string, string>;
  };

  const __TEST_RUNTIME__: {
    loadModules(options: { dev: boolean }): {
      business: typeof BusinessModule;
      dates: typeof DatesModule;
      entitlement: typeof EntitlementModule;
      storage: typeof StorageModule;
    };
  };
}

export {};
