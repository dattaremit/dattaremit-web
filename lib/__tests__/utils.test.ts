import { cn } from "../utils";

describe("cn", () => {
  it("joins multiple class strings", () => {
    expect(cn("a", "b", "c")).toBe("a b c");
  });

  it("filters out falsy values", () => {
    expect(cn("a", false, null, undefined, "", "b")).toBe("a b");
  });

  it("merges conflicting Tailwind classes — later one wins", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
  });

  it("preserves non-conflicting Tailwind classes", () => {
    expect(cn("text-sm font-bold", "text-red-500")).toBe("text-sm font-bold text-red-500");
  });

  it("respects conditional class objects via clsx", () => {
    expect(cn("base", { active: true, disabled: false })).toBe("base active");
  });

  it("flattens nested arrays", () => {
    expect(cn(["a", ["b", "c"]], "d")).toBe("a b c d");
  });

  it("returns empty string when given no input", () => {
    expect(cn()).toBe("");
  });
});
