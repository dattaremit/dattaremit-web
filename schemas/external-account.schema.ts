import * as yup from "yup";

export const externalAccountSchema = yup.object({
  walletAddress: yup.string().trim().required("Wallet address is required"),
  chain: yup
    .string()
    .oneOf(["ethereum", "solana"] as const, "Chain must be ethereum or solana")
    .optional()
    .default(undefined),
  label: yup
    .string()
    .trim()
    .max(100, "Label cannot exceed 100 characters")
    .optional()
    .default(undefined),
});

export interface ExternalAccountFormData {
  walletAddress: string;
  chain?: "ethereum" | "solana";
  label?: string;
}
