import * as yup from "yup";

const MIN_AGE = 18;
const MAX_AGE = 120;

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
    .min(4, "Phone number must be at least 4 digits")
    .max(15, "Phone number is too long")
    .matches(/^\d+$/, "Phone number must contain only digits"),
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
});

export type PersonalInfoFormData = yup.InferType<typeof personalInfoSchema>;
