import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-[hsl(var(--primary))] via-[hsl(var(--accent))] to-[hsl(var(--secondary))]">
      <Loader2 className="h-16 w-16 animate-spin text-[hsl(var(--primary-foreground))]" />
      <span className="mt-4 text-lg font-medium text-[hsl(var(--foreground))]">Loading...</span>
    </div>
  );
}
