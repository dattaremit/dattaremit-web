export function getClerkErrorMessage(
  err: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  const clerkErr = err as { errors?: { longMessage?: string; message?: string }[] } | undefined;
  return clerkErr?.errors?.[0]?.longMessage || clerkErr?.errors?.[0]?.message || fallback;
}
