"use client";

import { useSession } from "@/app/(main)/SessionProvider";
import LoadingButton from "@/components/LoadingButton";
import { Button } from "@/components/ui/button";
import UserAvatar from "@/components/UserAvatar";
import { cn } from "@/lib/utils";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useDropzone } from "@uploadthing/react";
import { ImageIcon, Loader2, X } from "lucide-react";
import { useSubmitPostMutation } from "./mutations";
import "./styles.css";

export default function PostEditor() {
  const { user } = useSession();

  const mutation = useSubmitPostMutation();


  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bold: false,
        italic: false,
      }),
      Placeholder.configure({
        placeholder: "Share a meal or just your thoughts...",
      }),
    ],
  });
  const calorieeditor = useEditor({
    extensions: [
      StarterKit.configure({
        bold: false,
        italic: false,
      }),
      Placeholder.configure({
        placeholder: "Amount of calories in the meal...",
      }),
    ],
  });

  const calorieinput =
    calorieeditor?.getText({
      blockSeparator: "\n",
    }) || "";

  const input =
    editor?.getText({
      blockSeparator: "\n",
    }) || "";

  function onSubmit() {
    mutation.mutate(
      {
        content: input,
        calories: parseInt(calorieinput) || 1,
      },
      {
        onSuccess: () => {
          editor?.commands.clearContent();
          calorieeditor?.commands.clearContent();
        },
      },
    );
  }

  return (
    <div className="flex flex-col gap-5 rounded-2xl bg-card p-5 shadow-sm">
      <div className="flex gap-5">
        <UserAvatar avatarUrl={user.avatarUrl} className="hidden sm:inline" />
        <div className="w-full">
          <EditorContent
            editor={editor}
            className={cn(
              "max-h-[20rem] w-full overflow-y-auto rounded-2xl bg-background px-5 py-3 mb-4",
            )}

          />
          <EditorContent
            editor={calorieeditor}
            className={cn(
              "max-h-[20rem] w-full overflow-y-auto rounded-2xl bg-background px-5 py-3",
            )}

          />
        </div>
      </div>
      <div className="flex items-center justify-end gap-3">
        <LoadingButton
          onClick={onSubmit}
          loading={mutation.isPending}
          className="min-w-20"
        >
          Post
        </LoadingButton>
      </div>
    </div>
  );
}

