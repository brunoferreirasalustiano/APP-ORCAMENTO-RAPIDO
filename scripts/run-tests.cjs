const fs = require("node:fs");
const Module = require("node:module");
const path = require("node:path");
const ts = require("typescript");

const projectRoot = path.resolve(__dirname, "..");
const tests = [];
let asyncStorageState = new Map();

global.test = (name, fn) => {
  tests.push({ name, fn });
};

global.expect = (received) => ({
  toBe(expected) {
    if (received !== expected) {
      throw new Error(`Expected ${JSON.stringify(received)} to be ${JSON.stringify(expected)}`);
    }
  },
  toEqual(expected) {
    if (JSON.stringify(received) !== JSON.stringify(expected)) {
      throw new Error(`Expected ${JSON.stringify(received)} to equal ${JSON.stringify(expected)}`);
    }
  }
});

global.__TEST_STORAGE__ = {
  reset(initialValues = {}) {
    asyncStorageState = new Map(Object.entries(initialValues));
  },
  snapshot() {
    return Object.fromEntries(asyncStorageState);
  }
};

const asyncStorageMock = {
  async getItem(key) {
    return asyncStorageState.has(key) ? asyncStorageState.get(key) : null;
  },
  async setItem(key, value) {
    asyncStorageState.set(key, String(value));
  },
  async removeItem(key) {
    asyncStorageState.delete(key);
  },
  async clear() {
    asyncStorageState.clear();
  }
};

const originalLoad = Module._load;
Module._load = function loadWithMocks(request, parent, isMain) {
  if (request === "@react-native-async-storage/async-storage") {
    return { __esModule: true, default: asyncStorageMock, ...asyncStorageMock };
  }

  return originalLoad.call(this, request, parent, isMain);
};

require.extensions[".ts"] = (module, filename) => {
  const source = fs.readFileSync(filename, "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
      esModuleInterop: true,
      jsx: ts.JsxEmit.ReactNative
    },
    fileName: filename
  }).outputText;

  module._compile(output, filename);
};

function resetProjectModules() {
  for (const key of Object.keys(require.cache)) {
    if (key.startsWith(path.join(projectRoot, "src"))) {
      delete require.cache[key];
    }
  }
}

global.__TEST_RUNTIME__ = {
  loadModules({ dev }) {
    global.__DEV__ = dev;
    resetProjectModules();

    return {
      business: require(path.join(projectRoot, "src/constants/business.ts")),
      dates: require(path.join(projectRoot, "src/lib/dates.ts")),
      entitlement: require(path.join(projectRoot, "src/lib/entitlement.ts")),
      storage: require(path.join(projectRoot, "src/lib/storage.ts"))
    };
  }
};

require(path.join(projectRoot, "src/lib/entitlement.test.ts"));

(async () => {
  let failures = 0;

  for (const { name, fn } of tests) {
    try {
      await fn();
      console.log(`ok - ${name}`);
    } catch (error) {
      failures += 1;
      console.error(`not ok - ${name}`);
      console.error(error instanceof Error ? error.stack : error);
    }
  }

  if (failures > 0) {
    process.exitCode = 1;
    return;
  }

  console.log(`${tests.length} tests passed`);
})();
