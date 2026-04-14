import * as yup from "yup";
import { MIN_TRANSFER_AMOUNT, MAX_TRANSFER_AMOUNT } from "@/constants/limits";

export const transferAmountSchema = yup.object({
  amount: yup
    .string()
    .trim()
    .required("Amount is required")
    .matches(/^\d+(\.\d{1,2})?$/, "Enter a valid amount")
    .test("min-max", `Amount must be $${MIN_TRANSFER_AMOUNT}–$${MAX_TRANSFER_AMOUNT.toLocaleString()}`, (value) => {
      const n = parseFloat(value ?? "0");
      return n >= MIN_TRANSFER_AMOUNT && n <= MAX_TRANSFER_AMOUNT;
    }),
  note: yup.string().trim().max(140, "Note must be 140 chars or fewer").optional(),
});

export type TransferAmountFormData = yup.InferType<typeof transferAmountSchema>;
