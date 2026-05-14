import Image from "next/image";

export function AuthLogo() {
  return (
    <Image
      src="/logo.png"
      alt="Dattaremit"
      width={140}
      height={119}
      priority
      className="mx-auto block h-28 w-auto"
    />
  );
}
