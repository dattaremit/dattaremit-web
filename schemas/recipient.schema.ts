import * as yup from "yup";

export const recipientSchema = yup.object({
  firstName: yup
    .string()
    .trim()
    .required("First name is required")
    .max(50, "First name is too long"),
  lastName: yup.string().trim().required("Last name is required").max(50, "Last name is too long"),
  email: yup
    .string()
    .trim()
    .email("Enter a valid email")
    .required("Email is required")
    .max(254, "Email is too long"),
  phoneNumberPrefix: yup
    .string()
    .trim()
    .required("Country code is required")
    .max(6, "Country code is too long"),
  phoneNumber: yup
    .string()
    .trim()
    .required("Phone number is required")
    .max(15, "Phone number is too long")
    .matches(/^\d+$/, "Phone number must contain only digits"),
  addressLine1: yup
    .string()
    .trim()
    .required("Address line 1 is required")
    .max(100, "Address is too long"),
  city: yup.string().trim().required("City is required").max(60, "City is too long"),
  state: yup.string().trim().required("State is required").max(60, "State is too long"),
  // Indian PINs are exactly 6 digits; matches the Zynk KYC format so we
  // don't silently send garbage through to the provider.
  postalCode: yup
    .string()
    .trim()
    .required("Postal code is required")
    .matches(/^\d{6}$/, "Postal code must be exactly 6 digits"),
});

export type RecipientFormData = yup.InferType<typeof recipientSchema>;

const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;

export const recipientBankSchema = yup.object({
  accountName: yup
    .string()
    .trim()
    .required("Account holder name is required")
    .max(100, "Account holder name is too long"),
  accountNumber: yup
    .string()
    .trim()
    .required("Account number is required")
    .matches(/^\d{8,18}$/, "Account number must be 8–18 digits"),
  ifsc: yup
    .string()
    .trim()
    .uppercase()
    .required("IFSC is required")
    .matches(IFSC_REGEX, "IFSC must be like SBIN0001234"),
});

export type RecipientBankFormData = yup.InferType<typeof recipientBankSchema>;
