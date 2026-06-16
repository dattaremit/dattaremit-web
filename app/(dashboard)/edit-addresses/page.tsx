import { Suspense } from "react";
import { AddressForm } from "@/components/forms/address-form";
import { Skeleton } from "@/components/ui/skeleton";

function LoadingFallback() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
  );
}

export default function EditAddressesPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AddressForm />
    </Suspense>
  );
}
