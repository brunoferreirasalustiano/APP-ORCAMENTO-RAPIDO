const fs = require("node:fs");
const Module = require("node:module");
const path = require("node:path");
const ts = require("typescript");

const projectRoot = path.resolve(__dirname, "..");
const tests = [];
let asyncStorageState = new Map();
const fileSystemState = {
  existingUris: new Set(),
  copiedFiles: [],
  deletedUris: [],
  madeDirectories: [],
  readRequests: [],
  readFiles: new Map()
};
const printState = {
  jobs: []
};
const sharingState = {
  available: true,
  shared: []
};

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
  },
  toContain(expected) {
    if (typeof received !== "string" && !Array.isArray(received)) {
      throw new Error("toContain expects a string or array");
    }

    if (!received.includes(expected)) {
      throw new Error(`Expected ${JSON.stringify(received)} to contain ${JSON.stringify(expected)}`);
    }
  },
  toMatch(expected) {
    const regex = expected instanceof RegExp ? expected : new RegExp(String(expected));
    if (typeof received !== "string" || !regex.test(received)) {
      throw new Error(`Expected ${JSON.stringify(received)} to match ${regex}`);
    }
  },
  toBeGreaterThan(expected) {
    if (typeof received !== "number" || received <= expected) {
      throw new Error(`Expected ${JSON.stringify(received)} to be greater than ${JSON.stringify(expected)}`);
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

global.__TEST_EXPO__ = {
  reset() {
    fileSystemState.existingUris = new Set();
    fileSystemState.copiedFiles = [];
    fileSystemState.deletedUris = [];
    fileSystemState.madeDirectories = [];
    fileSystemState.readRequests = [];
    fileSystemState.readFiles = new Map();
    printState.jobs = [];
    sharingState.available = true;
    sharingState.shared = [];
  },
  fileSystem: fileSystemState,
  print: printState,
  sharing: sharingState
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

const fileSystemMock = {
  documentDirectory: "file:///documents/",
  cacheDirectory: "file:///cache/",
  EncodingType: {
    Base64: "base64"
  },
  async getInfoAsync(uri) {
    return { exists: fileSystemState.existingUris.has(uri), uri };
  },
  async makeDirectoryAsync(uri) {
    fileSystemState.madeDirectories.push(uri);
    fileSystemState.existingUris.add(uri);
  },
  async deleteAsync(uri) {
    fileSystemState.deletedUris.push(uri);
    fileSystemState.existingUris.delete(uri);
  },
  async copyAsync(copy) {
    fileSystemState.copiedFiles.push(copy);
    fileSystemState.existingUris.add(copy.to);
  },
  async readAsStringAsync(uri) {
    fileSystemState.readRequests.push(uri);
    if (!fileSystemState.readFiles.has(uri)) {
      throw new Error(`No mocked file for ${uri}`);
    }

    return fileSystemState.readFiles.get(uri);
  }
};

const printMock = {
  async printToFileAsync(job) {
    printState.jobs.push(job);
    return { uri: `file:///cache/print-${printState.jobs.length}.pdf` };
  }
};

const sharingMock = {
  async isAvailableAsync() {
    return sharingState.available;
  },
  async shareAsync(uri, options) {
    sharingState.shared.push({ uri, options });
  }
};

const originalLoad = Module._load;
Module._load = function loadWithMocks(request, parent, isMain) {
  if (request === "@react-native-async-storage/async-storage") {
    return { __esModule: true, default: asyncStorageMock, ...asyncStorageMock };
  }
  if (request === "expo-file-system") {
    return fileSystemMock;
  }
  if (request === "expo-print") {
    return printMock;
  }
  if (request === "expo-sharing") {
    return sharingMock;
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
      money: require(path.join(projectRoot, "src/lib/money.ts")),
      pdf: require(path.join(projectRoot, "src/lib/pdf.ts")),
      quote: require(path.join(projectRoot, "src/lib/quote.ts")),
      storage: require(path.join(projectRoot, "src/lib/storage.ts"))
    };
  }
};

for (const file of fs.readdirSync(path.join(projectRoot, "src/lib"))) {
  if (file.endsWith(".test.ts")) {
    require(path.join(projectRoot, "src/lib", file));
  }
}

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
