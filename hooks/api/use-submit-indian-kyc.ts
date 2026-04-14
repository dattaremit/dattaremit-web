import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getPublicKey, submitIndianKycEncrypted } from "@/services/api";
import { queryKeys } from "@/constants/query-keys";
import { encryptWithPublicKey } from "@/lib/encryption";
import type { IndianKycPayload } from "@/types/indian-kyc";

/**
 * Submits Indian KYC with client-side RSA-OAEP encryption of Aadhar + PAN.
 * The hook fetches the current public key on each submission to survive key
 * rotation; the key endpoint is cheap and always reflects the active version.
 */
export function useSubmitIndianKyc() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: IndianKycPayload) => {
      const { publicKey, version } = await getPublicKey();
      const [aadharNumber, panNumber] = await Promise.all([
        encryptWithPublicKey(publicKey, payload.aadharNumber),
        encryptWithPublicKey(publicKey, payload.panNumber),
      ]);
      return submitIndianKycEncrypted({
        aadharNumber,
        panNumber,
        keyVersion: version,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.account });
    },
  });
}
