import { useAuth } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { getRecipient } from "@/services/api";

export function useRecipient(id: string | undefined) {
  const { isSignedIn } = useAuth();
  return useQuery({
    queryKey: queryKeys.recipients.detail(id ?? ""),
    queryFn: () => getRecipient(id as string),
    enabled: !!isSignedIn && !!id,
  });
}
