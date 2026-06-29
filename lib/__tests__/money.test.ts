import { dollarsToCents, usdToInr } from "../money";
import { MIN_TRANSFER_CENTS, MAX_TRANSFER_CENTS } from "@/constants/limits";

describe("dollarsToCents", () => {
  it("converts whole dollars to cents", () => {
    expect(dollarsToCents("100")).toBe(10000);
  });

  it("converts dollars and cents", () => {
    expect(dollarsToCents("112.34")).toBe(11234);
  });

  it("handles single decimal place by padding", () => {
    expect(dollarsToCents("15.5")).toBe(1550);
  });

  it("trims surrounding whitespace before parsing", () => {
    expect(dollarsToCents("  42.00  ")).toBe(4200);
  });

  it("returns exact integer cents for tricky decimal inputs", () => {
    // 18.7 * 100 in IEEE-754 is 1869.9999999999998; the string-arithmetic
    // implementation should still produce exactly 1870.
    expect(dollarsToCents("18.7")).toBe(1870);
  });

  it("accepts the minimum allowed amount", () => {
    expect(dollarsToCents(String(MIN_TRANSFER_CENTS / 100))).toBe(MIN_TRANSFER_CENTS);
  });

  it("accepts the maximum allowed amount", () => {
    expect(dollarsToCents(String(MAX_TRANSFER_CENTS / 100))).toBe(MAX_TRANSFER_CENTS);
  });

  it("throws on negative numbers", () => {
    expect(() => dollarsToCents("-1")).toThrow("Enter a valid amount");
  });

  it("throws on non-numeric strings", () => {
    expect(() => dollarsToCents("abc")).toThrow("Enter a valid amount");
  });

  it("throws on empty input", () => {
    expect(() => dollarsToCents("")).toThrow("Enter a valid amount");
  });

  it("throws on more than two decimal places", () => {
    expect(() => dollarsToCents("1.234")).toThrow("Enter a valid amount");
  });

  it("throws when below the minimum allowed amount", () => {
    expect(() => dollarsToCents("0")).toThrow("outside the allowed range");
  });

  it("throws when above the maximum allowed amount", () => {
    const overMax = String(MAX_TRANSFER_CENTS / 100 + 1);
    expect(() => dollarsToCents(overMax)).toThrow("outside the allowed range");
  });
});

describe("usdToInr", () => {
  it("converts a whole-dollar amount at the live rate", () => {
    expect(usdToInr("100", 85)).toBeCloseTo(8500, 6);
  });

  it("converts dollars and cents at the live rate", () => {
    expect(usdToInr("100.50", 85.5)).toBeCloseTo(8592.75, 6);
  });

  it("trims surrounding whitespace before parsing", () => {
    expect(usdToInr("  42.00  ", 80)).toBeCloseTo(3360, 6);
  });

  it("returns null for an empty or malformed amount", () => {
    expect(usdToInr("", 85)).toBeNull();
    expect(usdToInr("abc", 85)).toBeNull();
    expect(usdToInr("12.", 85)).toBeNull();
    expect(usdToInr("1.234", 85)).toBeNull();
  });

  it("returns null for a non-positive amount", () => {
    expect(usdToInr("0", 85)).toBeNull();
    expect(usdToInr("-5", 85)).toBeNull();
  });

  it("returns null when the rate is unavailable or invalid", () => {
    expect(usdToInr("100", null)).toBeNull();
    expect(usdToInr("100", undefined)).toBeNull();
    expect(usdToInr("100", 0)).toBeNull();
    expect(usdToInr("100", NaN)).toBeNull();
  });
});
