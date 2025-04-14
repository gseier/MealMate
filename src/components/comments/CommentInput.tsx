import { useState } from "react";
import { Loader2, SendHorizonal } from "lucide-react";

import { PostData } from "@/lib/types";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useSubmitCommentMutation } from "./mutations";

interface CommentInputProps {
  post: PostData;
}

export default function CommentInput({ post }: CommentInputProps) {
  const [input, setInput] = useState("");
  const mutation = useSubmitCommentMutation(post.id);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;

    mutation.mutate(
      { post, content: input.trim() },
      { onSuccess: () => setInput("") }
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex w-full items-center gap-3 rounded-xl border bg-background px-4 py-2 shadow-sm transition focus-within:ring-1 focus-within:ring-ring"
    >
      <Input
        placeholder="Write a comment..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="border-0 shadow-none focus-visible:ring-0"
        autoFocus
      />
      <Button
        type="submit"
        variant="outline"
        size="icon"
        disabled={!input.trim() || mutation.isPending}
        className="shrink-0"
      >
        {mutation.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <SendHorizonal className="h-4 w-4" />
        )}
      </Button>
    </form>
  );
}
