import { useMutation } from "@tanstack/react-query";
import { generatePlaidLinkToken } from "@/services/api";

export function usePlaidLinkToken() {
  return useMutation({
    mutationFn: generatePlaidLinkToken,
  });
}
