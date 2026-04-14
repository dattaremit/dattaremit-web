import { useAuth } from "@clerk/nextjs";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/query-keys";
import { getRecipients } from "@/services/api";

export function useRecipients() {
  const { isSignedIn } = useAuth();
  return useQuery({
    queryKey: queryKeys.recipients.list(),
    queryFn: getRecipients,
    enabled: !!isSignedIn,
  });
}
