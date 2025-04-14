import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-r from-[hsl(var(--primary))] via-[hsl(var(--accent))] to-[hsl(var(--secondary))] px-4 text-center">
      <div className="flex flex-col items-center gap-4 rounded-2xl bg-white/90 p-8 shadow-2xl dark:bg-zinc-900/90">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <h1 className="text-xl font-bold text-foreground tracking-tight">
          Loading MealMate...
        </h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          Hang tight! We’re getting things ready for you.
        </p>
      </div>
    </div>
  );
}
