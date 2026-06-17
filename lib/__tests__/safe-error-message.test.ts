import { getServerErrorMessage } from "../safe-error-message";
import { ApiError } from "@/services/http-client";

describe("getServerErrorMessage", () => {
  const FALLBACK = "Failed to add bank";

  it("surfaces an actionable server message from an ApiError", () => {
    const err = new ApiError(400, "Invalid request. Please check your details and try again.", {
      serverMessage: "This is an NRE account. Please add it under your NRE bank account instead.",
    });
    expect(getServerErrorMessage(err, FALLBACK)).toBe(
      "This is an NRE account. Please add it under your NRE bank account instead.",
    );
  });

  it("returns the fallback when there is no server message", () => {
    const err = new ApiError(400, "Invalid request. Please check your details and try again.");
    expect(getServerErrorMessage(err, FALLBACK)).toBe(FALLBACK);
  });

  it("never leaks payment-provider internals", () => {
    const err = new ApiError(400, "Invalid request.", {
      serverMessage: "Credible penny-drop failed for this account.",
    });
    expect(getServerErrorMessage(err, FALLBACK)).toBe(FALLBACK);
  });

  it("filters raw axios/network text", () => {
    const err = new ApiError(500, "Something went wrong.", {
      serverMessage: "Request failed with status code 500",
    });
    expect(getServerErrorMessage(err, FALLBACK)).toBe(FALLBACK);
  });

  it("returns the fallback for non-ApiError values", () => {
    expect(getServerErrorMessage(new Error("boom"), FALLBACK)).toBe(FALLBACK);
    expect(getServerErrorMessage(undefined, FALLBACK)).toBe(FALLBACK);
  });
});
