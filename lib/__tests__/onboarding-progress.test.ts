import { computeOnboardingState, stepIndex, stepHref, nextHref } from "../onboarding-progress";
import { ROUTES } from "@/constants/routes";
import type { Account, AccountUser, Address } from "@/types/api";

const completeUser: AccountUser = {
  id: "user-1",
  clerkUserId: "clerk-1",
  firstName: "Jane",
  lastName: "Doe",
  email: "jane@example.com",
  phoneNumberPrefix: "+1",
  phoneNumber: "2025551234",
  dateOfBirth: "1990-01-01",
} as AccountUser;

const address: Address = {
  id: "addr-1",
  type: "PRESENT",
  addressLine1: "1 Main St",
  city: "NYC",
  state: "NY",
  country: "US",
  postalCode: "10001",
} as Address;

describe("stepIndex", () => {
  it("returns the correct ordering for each step", () => {
    expect(stepIndex("referral")).toBe(0);
    expect(stepIndex("profile")).toBe(1);
    expect(stepIndex("address")).toBe(2);
  });
});

describe("stepHref", () => {
  it("maps each step to its onboarding route", () => {
    expect(stepHref("referral")).toBe(ROUTES.ONBOARDING.REFERRAL);
    expect(stepHref("profile")).toBe(ROUTES.ONBOARDING.PROFILE);
    expect(stepHref("address")).toBe(ROUTES.ONBOARDING.ADDRESS);
  });
});

describe("nextHref", () => {
  it("returns ROOT when there is no next step", () => {
    expect(
      nextHref({
        nextStep: null,
        completion: { profile: true, address: true },
      }),
    ).toBe(ROUTES.ROOT);
  });

  it("returns the correct href for the next step", () => {
    expect(
      nextHref({
        nextStep: "address",
        completion: { profile: true, address: false },
      }),
    ).toBe(ROUTES.ONBOARDING.ADDRESS);
  });
});

describe("computeOnboardingState", () => {
  it("returns referral as next step when account has no user", () => {
    const state = computeOnboardingState({
      user: null,
      addresses: [],
      accountStatus: "INITIAL",
    } as Account);
    expect(state.nextStep).toBe("referral");
    expect(state.completion).toEqual({ profile: false, address: false });
  });

  it("returns referral as next step for null account", () => {
    expect(computeOnboardingState(null).nextStep).toBe("referral");
    expect(computeOnboardingState(undefined).nextStep).toBe("referral");
  });

  it("returns profile as next step when user is missing required fields", () => {
    const partialUser = { ...completeUser, phoneNumber: "" } as AccountUser;
    const state = computeOnboardingState({
      user: partialUser,
      addresses: [],
      accountStatus: "INITIAL",
    } as Account);
    expect(state.nextStep).toBe("profile");
    expect(state.completion.profile).toBe(false);
  });

  it("marks profile complete when all required user fields are present", () => {
    const state = computeOnboardingState({
      user: completeUser,
      addresses: [],
      accountStatus: "INITIAL",
    } as Account);
    expect(state.completion.profile).toBe(true);
    expect(state.nextStep).toBe("address");
  });

  it("treats address as incomplete when there is no Zynk entity", () => {
    const state = computeOnboardingState({
      user: completeUser,
      addresses: [address],
      accountStatus: "PENDING",
      hasZynkEntity: false,
    } as Account);
    expect(state.completion.address).toBe(false);
    expect(state.nextStep).toBe("address");
  });

  it("treats address as complete only when both rows exist and Zynk entity exists", () => {
    const state = computeOnboardingState({
      user: completeUser,
      addresses: [address],
      accountStatus: "ACTIVE",
      hasZynkEntity: true,
    } as Account);
    expect(state.completion.address).toBe(true);
    expect(state.nextStep).toBeNull();
  });
});
