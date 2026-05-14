import { Skeleton } from "@/components/ui/skeleton";

interface OnboardingFormFallbackProps {
  fieldCount?: number;
}

export function OnboardingFormFallback({ fieldCount = 5 }: OnboardingFormFallbackProps) {
  return (
    <div className="space-y-4">
      <Skeleton className="h-12 w-72" />
      {Array.from({ length: fieldCount }).map((_, i) => (
        <Skeleton key={i} className="h-11 w-full" />
      ))}
    </div>
  );
}
