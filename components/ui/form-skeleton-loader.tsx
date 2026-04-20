import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface FormSkeletonLoaderProps {
  fieldCount?: number;
  chromeless?: boolean;
}

export function FormSkeletonLoader({
  fieldCount = 4,
  chromeless = false,
}: FormSkeletonLoaderProps) {
  const fields = (
    <div className="space-y-4">
      {Array.from({ length: fieldCount }).map((_, i) => (
        <Skeleton key={i} className="h-11 w-full" />
      ))}
    </div>
  );

  if (chromeless) return fields;

  return (
    <div className="space-y-6">
      <Skeleton className="h-12 w-72" />
      <Card variant="elevated" className="p-6 sm:p-8">
        {fields}
      </Card>
    </div>
  );
}
