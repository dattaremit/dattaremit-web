import { resolveOnboardingStep } from "../onboarding-utils";
import type { Account, AccountUser, Address } from "@/types/api";

const baseUser: AccountUser = {
  id: "user-1",
  clerkUserId: "clerk-1",
  firstName: "Jane",
  lastName: "Doe",
  email: "jane@example.com",
  phoneNumberPrefix: "+1",
  phoneNumber: "2025551234",
  dateOfBirth: "1990-01-01",
} as AccountUser;

const baseAddress: Address = {
  id: "addr-1",
  type: "PRESENT",
  addressLine1: "1 Main St",
  city: "NYC",
  state: "NY",
  country: "US",
  postalCode: "10001",
} as Address;

function makeAccount(overrides: Partial<Account> = {}): Account {
  return {
    user: baseUser,
    addresses: [baseAddress],
    accountStatus: "ACTIVE",
    ...overrides,
  };
}

describe("resolveOnboardingStep", () => {
  it("returns 'referral' when account is null", () => {
    expect(resolveOnboardingStep(null)).toBe("referral");
  });

  it("returns 'referral' when account is undefined", () => {
    expect(resolveOnboardingStep(undefined)).toBe("referral");
  });

  it("returns 'blocked' when account is blocked", () => {
    expect(resolveOnboardingStep(makeAccount({ isBlocked: true }))).toBe("blocked");
  });

  it("returns 'waitlist' when account is on the waitlist", () => {
    expect(resolveOnboardingStep(makeAccount({ isOnWaitlist: true }))).toBe("waitlist");
  });

  it("prefers blocked over waitlist when both flags are true", () => {
    expect(resolveOnboardingStep(makeAccount({ isBlocked: true, isOnWaitlist: true }))).toBe(
      "blocked",
    );
  });

  it("returns 'referral' when there is no user record yet", () => {
    expect(resolveOnboardingStep(makeAccount({ user: null }))).toBe("referral");
  });

  it("returns 'address' when user exists but has no addresses", () => {
    expect(resolveOnboardingStep(makeAccount({ addresses: [] }))).toBe("address");
  });

  it("returns 'address' when addresses field is missing", () => {
    expect(
      resolveOnboardingStep(makeAccount({ addresses: undefined as unknown as Address[] })),
    ).toBe("address");
  });

  it("returns 'completed' when user and addresses are both present", () => {
    expect(resolveOnboardingStep(makeAccount())).toBe("completed");
  });
});
