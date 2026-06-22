import * as yup from "yup";
import { MIN_TRANSFER_AMOUNT, MAX_TRANSFER_AMOUNT } from "@/constants/limits";

/** Mirrors the backend Joi `upiIdField` pattern so the UI rejects bad VPAs
 *  before they hit the server (e.g. `name@okhdfcbank`). */
export const UPI_ID_REGEX = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z][a-zA-Z0-9.\-_]{1,64}$/;

export const transferAmountSchema = yup.object({
  amount: yup
    .string()
    .trim()
    .required("Amount is required")
    .matches(/^\d+(\.\d{1,2})?$/, "Enter a valid amount")
    .test(
      "min-max",
      `Amount must be $${MIN_TRANSFER_AMOUNT}–$${MAX_TRANSFER_AMOUNT.toLocaleString()}`,
      (value) => {
        const n = parseFloat(value ?? "0");
        return n >= MIN_TRANSFER_AMOUNT && n <= MAX_TRANSFER_AMOUNT;
      },
    ),
  note: yup.string().trim().max(140, "Note must be 140 chars or fewer").optional(),
  // Defaults to a bank transfer; switched to "UPI" via the payment-method picker.
  paymentMethod: yup.string().oneOf(["BANK", "UPI"]).default("BANK"),
  // Required and format-checked only for UPI; ignored for bank transfers.
  upiId: yup
    .string()
    .trim()
    .when("paymentMethod", {
      is: "UPI",
      then: (s) =>
        s
          .required("UPI ID is required")
          .max(255, "UPI ID cannot exceed 255 characters")
          .matches(UPI_ID_REGEX, "Please provide a valid UPI ID (e.g. name@bank)"),
      otherwise: (s) => s.optional(),
    }),
});

export type TransferAmountFormData = yup.InferType<typeof transferAmountSchema>;
