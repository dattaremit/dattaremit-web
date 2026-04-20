export function FullScreenLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="relative flex size-12 items-center justify-center">
        <span className="absolute inset-0 animate-ping rounded-full bg-brand/30" />
        <span className="relative size-2 rounded-full bg-brand" />
      </div>
    </div>
  );
}
