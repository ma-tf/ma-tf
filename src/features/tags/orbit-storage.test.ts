import {
  ORBIT_ROTATION_KEY,
  readStoredRotation,
  writeStoredRotation,
} from "@features/tags/orbit-storage";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";

function setStorage(storage: Storage | undefined) {
  Object.defineProperty(globalThis, "sessionStorage", {
    configurable: true,
    enumerable: true,
    value: storage,
    writable: true,
  });
}

function memoryStorage(values: Record<string, string> = {}): Storage {
  return {
    getItem: (key: string) => values[key] ?? null,
    setItem: (key: string, value: string) => {
      values[key] = value;
    },
    removeItem: (key: string) => {
      delete values[key];
    },
    clear: () => {
      for (const key of Object.keys(values)) delete values[key];
    },
    key: (index: number) => Object.keys(values)[index] ?? null,
    get length() {
      return Object.keys(values).length;
    },
  };
}

afterEach(() => {
  vi.restoreAllMocks();
  setStorage(undefined);
});

describe("readStoredRotation", () => {
  it("returns 0 when storage is unavailable", () => {
    setStorage(undefined);
    expect(readStoredRotation()).toBe(0);
  });

  it("returns 0 when no value is stored", () => {
    setStorage(memoryStorage());
    expect(readStoredRotation()).toBe(0);
  });

  it("returns the stored finite value", () => {
    setStorage(memoryStorage({ [ORBIT_ROTATION_KEY]: "42.5" }));
    expect(readStoredRotation()).toBe(42.5);
  });

  it("returns 0 for corrupt values", () => {
    for (const corrupt of ["not-a-number", "NaN", "Infinity", "null", "undefined", "{}}}"]) {
      setStorage(memoryStorage({ [ORBIT_ROTATION_KEY]: corrupt }));
      expect(readStoredRotation()).toBe(0);
    }
  });

  it("returns 0 when reading throws", () => {
    const storage = memoryStorage();
    vi.spyOn(storage, "getItem").mockImplementation(() => {
      throw new DOMException("denied", "SecurityError");
    });
    setStorage(storage);
    expect(readStoredRotation()).toBe(0);
  });
});

describe("writeStoredRotation", () => {
  it("persists the rotation", () => {
    const values: Record<string, string> = {};
    setStorage(memoryStorage(values));
    expect(writeStoredRotation(12.5)).toBe(true);
    expect(values[ORBIT_ROTATION_KEY]).toBe("12.5");
  });

  it("returns false when storage is unavailable", () => {
    setStorage(undefined);
    expect(writeStoredRotation(1)).toBe(false);
  });

  it("returns false when writing throws", () => {
    const storage = memoryStorage();
    vi.spyOn(storage, "setItem").mockImplementation(() => {
      throw new DOMException("denied", "QuotaExceededError");
    });
    setStorage(storage);
    expect(writeStoredRotation(1)).toBe(false);
  });
});
