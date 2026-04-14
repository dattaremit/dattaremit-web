import * as yup from "yup";

export const recipientSchema = yup.object({
  firstName: yup.string().trim().required("First name is required"),
  lastName: yup.string().trim().required("Last name is required"),
  email: yup.string().trim().email("Enter a valid email").required("Email is required"),
  phoneNumberPrefix: yup.string().trim().required("Country code is required"),
  phoneNumber: yup
    .string()
    .trim()
    .required("Phone number is required")
    .matches(/^\d+$/, "Phone number must contain only digits"),
  dateOfBirth: yup.string().required("Date of birth is required"),
  addressLine1: yup.string().trim().required("Address line 1 is required"),
  addressLine2: yup.string().trim().optional(),
  city: yup.string().trim().required("City is required"),
  state: yup.string().trim().required("State is required"),
  postalCode: yup.string().trim().required("Postal code is required"),
});

export type RecipientFormData = yup.InferType<typeof recipientSchema>;

const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;

export const recipientBankSchema = yup.object({
  bankName: yup.string().trim().required("Bank name is required"),
  accountName: yup.string().trim().required("Account holder name is required"),
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
  branchName: yup.string().trim().required("Branch name is required"),
  bankAccountType: yup
    .string()
    .oneOf(["SAVINGS", "CURRENT"], "Pick an account type")
    .required("Account type is required"),
  phoneNumber: yup.string().trim().required("Phone number is required"),
});

export type RecipientBankFormData = yup.InferType<typeof recipientBankSchema>;
