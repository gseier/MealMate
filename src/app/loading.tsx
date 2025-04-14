import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-r from-[hsl(var(--primary))] via-[hsl(var(--accent))] to-[hsl(var(--secondary))] px-4 text-center">
      <div className="flex flex-col items-center gap-4 rounded-xl bg-card/70 p-8 shadow-xl backdrop-blur-sm">
        <Loader2 className="h-12 w-12 animate-spin text-[hsl(var(--primary-foreground))]" />
        <h1 className="text-xl font-semibold text-[hsl(var(--foreground))] tracking-tight">
          Just a moment...
        </h1>
        <p className="max-w-xs text-sm text-muted-foreground">
          We’re preparing your personalized feed. Hang tight!
        </p>
      </div>
    </div>
  );
}
