import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center text-muted-foreground">
      <Loader2 className="mb-3 h-8 w-8 animate-spin" />
      <p className="text-sm">Loading, please wait...</p>
    </div>
  );
}
