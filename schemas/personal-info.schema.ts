import * as yup from "yup";

const MIN_AGE = 18;
const MAX_AGE = 120;

// Per-country exact-length rules for the national phone number, keyed by dial
// prefix. Mirrors mobile's PHONE_RULES so the two clients accept/reject the same
// numbers. Primary onboarding is always a US (+1) user, so a 10-digit check here
// stops e.g. an 8-digit number sailing through to the platform. Unsupported
// prefixes fall back to a generic length bound rather than being rejected.
const PHONE_RULES: Record<string, { length: number; name: string }> = {
  "+1": { length: 10, name: "US" },
  "+91": { length: 10, name: "Indian" },
};

function yearsSince(dateString: string): number | null {
  const ms = Date.parse(dateString);
  if (!Number.isFinite(ms)) return null;
  const birth = new Date(ms);
  const now = new Date();
  let age = now.getUTCFullYear() - birth.getUTCFullYear();
  const m = now.getUTCMonth() - birth.getUTCMonth();
  if (m < 0 || (m === 0 && now.getUTCDate() < birth.getUTCDate())) age--;
  return age;
}

export const personalInfoSchema = yup.object({
  firstName: yup
    .string()
    .trim()
    .required("First name is required")
    .max(50, "First name is too long"),
  lastName: yup.string().trim().required("Last name is required").max(50, "Last name is too long"),
  phoneNumberPrefix: yup
    .string()
    .trim()
    .required("Country code is required")
    .max(6, "Country code is too long"),
  phoneNumber: yup
    .string()
    .trim()
    .required("Phone number is required")
    .matches(/^\d+$/, "Phone number must contain only digits")
    .test("phone-length", "Invalid phone number", function (value) {
      if (!value) return true; // `required` already handles the empty case
      const prefix = this.parent.phoneNumberPrefix as string | undefined;
      const rule = prefix ? PHONE_RULES[prefix] : undefined;

      if (!rule) {
        // Foreign / unsupported dial code — keep a permissive bound.
        if (value.length < 4) {
          return this.createError({ message: "Phone number must be at least 4 digits" });
        }
        if (value.length > 15) {
          return this.createError({ message: "Phone number is too long" });
        }
        return true;
      }

      if (value.length !== rule.length) {
        return this.createError({
          message: `${rule.name} phone number must be ${rule.length} digits`,
        });
      }
      if (prefix === "+1" && (value[0] === "0" || value[0] === "1")) {
        return this.createError({ message: "US phone number cannot start with 0 or 1" });
      }
      if (prefix === "+91" && !["6", "7", "8", "9"].includes(value[0])) {
        return this.createError({
          message: "Indian phone number must start with 6, 7, 8, or 9",
        });
      }
      return true;
    }),
  dateOfBirth: yup
    .string()
    .required("Date of birth is required")
    .test("valid-date", "Enter a valid date", (value) => {
      if (!value) return false;
      return Number.isFinite(Date.parse(value));
    })
    .test("min-age", `You must be at least ${MIN_AGE} years old to use this service`, (value) => {
      if (!value) return false;
      const age = yearsSince(value);
      return age !== null && age >= MIN_AGE;
    })
    .test("max-age", "Please enter a valid date of birth", (value) => {
      if (!value) return false;
      const age = yearsSince(value);
      return age !== null && age <= MAX_AGE;
    }),
  // "US" = US citizen (off-ramp to own Indian bank, no Indian KYC). "IN" =
  // Indian national / NRI (NRE flow, Indian KYC required).
  nationality: yup
    .string()
    .required("Citizenship is required")
    .oneOf(["US", "IN"], "Select your citizenship"),
});

export type PersonalInfoFormData = yup.InferType<typeof personalInfoSchema>;
