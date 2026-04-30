import { dollarsToCents } from "../money";
import { MIN_TRANSFER_CENTS, MAX_TRANSFER_CENTS } from "@/constants/limits";

describe("dollarsToCents", () => {
  it("converts whole dollars to cents", () => {
    expect(dollarsToCents("100")).toBe(10000);
  });

  it("converts dollars and cents", () => {
    expect(dollarsToCents("12.34")).toBe(1234);
  });

  it("handles single decimal place by padding", () => {
    expect(dollarsToCents("5.5")).toBe(550);
  });

  it("trims surrounding whitespace before parsing", () => {
    expect(dollarsToCents("  42.00  ")).toBe(4200);
  });

  it("returns exact integer cents for tricky decimal inputs", () => {
    // 8.7 * 100 in IEEE-754 is 869.9999999999999; the string-arithmetic
    // implementation should still produce exactly 870.
    expect(dollarsToCents("8.7")).toBe(870);
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
