import Image from "next/image";

export function HeroPanel() {
  return (
    <div
      className="sticky top-0 hidden h-screen overflow-hidden lg:block lg:w-1/3"
      style={{ background: "linear-gradient(160deg, #1e1b4b 0%, #312e81 50%, #3730a3 100%)" }}
    >
      <Image
        src="/auth.png"
        alt="Send money instantly with DattaRemit"
        fill
        className="object-contain object-bottom"
        priority
      />
      <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/85 via-black/50 to-transparent px-6 pb-10 pt-16">
        <p className="text-4xl font-semibold leading-tight tracking-tight text-white">
          Send money home,
          <br />
          <span className="text-brand-soft">instantly.</span>
        </p>
        <p className="mt-3 text-base font-medium italic leading-relaxed text-white/80">
          Fast, secure and trusted international transfers,
          <br />
          right from your phone.
        </p>
      </div>
    </div>
  );
}
