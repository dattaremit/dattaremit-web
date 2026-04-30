import * as yup from "yup";

export const depositAccountSchema = yup.object({
  accountName: yup.string().trim().required("Account holder name is required"),
  accountNumber: yup.string().trim().required("Account number is required"),
  ifsc: yup
    .string()
    .trim()
    .required("IFSC code is required")
    .matches(/^[A-Z]{4}0[A-Z0-9]{6}$/, "IFSC code must be in format XXXX0XXXXXXX"),
});

export type DepositAccountFormData = yup.InferType<typeof depositAccountSchema>;
