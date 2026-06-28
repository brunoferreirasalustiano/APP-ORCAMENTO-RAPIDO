import type * as BusinessModule from "../constants/business";
import type * as DatesModule from "../lib/dates";
import type * as EntitlementModule from "../lib/entitlement";
import type * as MoneyModule from "../lib/money";
import type * as PdfModule from "../lib/pdf";
import type * as QuoteModule from "../lib/quote";
import type * as StorageModule from "../lib/storage";

declare global {
  function test(name: string, fn: () => void | Promise<void>): void;

  function expect<T>(received: T): {
    toBe(expected: T): void;
    toEqual(expected: T): void;
    toContain(expected: T extends string ? string : unknown): void;
    toMatch(expected: RegExp | string): void;
    toBeGreaterThan(expected: number): void;
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
      money: typeof MoneyModule;
      pdf: typeof PdfModule;
      quote: typeof QuoteModule;
      storage: typeof StorageModule;
    };
  };

  const __TEST_EXPO__: {
    reset(): void;
    fileSystem: {
      existingUris: Set<string>;
      copiedFiles: Array<{ from: string; to: string }>;
      deletedUris: string[];
      madeDirectories: string[];
      readRequests: string[];
      readFiles: Map<string, string>;
    };
    print: {
      jobs: Array<{ html: string; base64?: boolean }>;
    };
    sharing: {
      available: boolean;
      shared: Array<{ uri: string; options: unknown }>;
    };
  };
}

export {};
