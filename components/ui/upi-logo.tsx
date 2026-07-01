import Image from "next/image";

import { cn } from "@/lib/utils";

interface UpiLogoProps {
  /** Tailwind height class; width scales automatically (logo is 2:1). */
  className?: string;
}

/**
 * The UPI wordmark, shown anywhere a UPI destination is offered so the option
 * is instantly recognisable. Uses the shared asset in `public/upi.png` (96×48).
 */
export function UpiLogo({ className }: UpiLogoProps) {
  return (
    <Image
      src="/upi.png"
      alt="UPI"
      width={96}
      height={48}
      className={cn("h-5 w-auto", className)}
    />
  );
}
