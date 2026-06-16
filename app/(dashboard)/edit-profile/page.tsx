import { Suspense } from "react";
import { PersonalInfoForm } from "@/components/onboarding/personal-info-form";
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

export default function EditProfilePage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <PersonalInfoForm />
    </Suspense>
  );
}
