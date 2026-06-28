import * as yup from "yup";

export const nreBankAccountSchema = yup.object({
  bankName: yup.string().trim().required("Bank name is required"),
  // Optional fields carry a "" default so the inferred form type keeps every
  // field a required string (react-hook-form + yupResolver choke on a mix of
  // optional and required keys). Empty values still validate fine.
  branchName: yup.string().trim().default(""),
  accountHolderName: yup.string().trim().required("Account holder name is required"),
  accountNumber: yup.string().trim().required("Account number is required"),
  // Re-entry guard: a transposed digit silently routes the payout to the wrong
  // account with no clawback, so we force the user to confirm the number.
  confirmAccountNumber: yup
    .string()
    .trim()
    .required("Please re-enter the account number")
    .oneOf([yup.ref("accountNumber")], "Account numbers do not match"),
  ifscCode: yup
    .string()
    .trim()
    .required("IFSC code is required")
    .matches(/^[A-Z]{4}0[A-Z0-9]{6}$/, "IFSC code must be in format XXXX0XXXXXXX"),
  swiftCode: yup
    .string()
    .trim()
    .default("")
    .matches(/^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/, {
      message: "Enter a valid SWIFT/BIC code (e.g. HDFCINBB)",
      excludeEmptyString: true,
    }),
});

export type NreBankAccountFormData = yup.InferType<typeof nreBankAccountSchema>;
