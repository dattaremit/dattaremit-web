import { generateIdempotencyKey } from "../idempotency";

describe("generateIdempotencyKey", () => {
  const originalCrypto = globalThis.crypto;

  afterEach(() => {
    Object.defineProperty(globalThis, "crypto", {
      value: originalCrypto,
      configurable: true,
    });
  });

  it("returns an RFC 4122 v4 UUID string", () => {
    const key = generateIdempotencyKey();
    expect(key).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  });

  it("produces a unique value on each call", () => {
    const a = generateIdempotencyKey();
    const b = generateIdempotencyKey();
    expect(a).not.toBe(b);
  });

  it("throws when crypto.randomUUID is unavailable", () => {
    Object.defineProperty(globalThis, "crypto", {
      value: { subtle: {} },
      configurable: true,
    });
    expect(() => generateIdempotencyKey()).toThrow("crypto.randomUUID is unavailable");
  });

  it("throws when crypto is undefined", () => {
    Object.defineProperty(globalThis, "crypto", {
      value: undefined,
      configurable: true,
    });
    expect(() => generateIdempotencyKey()).toThrow("crypto.randomUUID is unavailable");
  });
});
