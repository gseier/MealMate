"use client";

import { useState } from "react";
import { useSession } from "@/app/(main)/SessionProvider";
import LoadingButton from "@/components/LoadingButton";
import UserAvatar from "@/components/UserAvatar";
import { cn } from "@/lib/utils";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useSubmitPostMutation } from "./mutations";
import FoodSearchBar from "@/components/foods/FoodSearchBar";
import { SelectedFoodItem } from "@/components/foods/SelectedFood";
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

  const input =
    editor?.getText({
      blockSeparator: "\n",
    }) || "";

  // New state for selected foods from the FoodSearchBar component
  const [selectedFoods, setSelectedFoods] = useState<SelectedFoodItem[]>([]);

  function onSubmit() {
    mutation.mutate(
      {
        content: input,
        foods: selectedFoods.map(sf => ({
          name: sf.food.name,
          amount: sf.amount,
        })),
      },
      {
        onSuccess: () => {
          editor?.commands.clearContent();
          setSelectedFoods([]);
        },
      },
    );
  }

  return (
    <div className="flex flex-col gap-5 rounded-2xl bg-card p-5">
      <div className="flex gap-5 items-start">
        <UserAvatar avatarUrl={user.avatarUrl} className="hidden sm:inline" />
        <div className="w-full">
          <EditorContent
            editor={editor}
            className={cn(
              "max-h-[20rem] w-full overflow-y-auto rounded-2xl bg-card px-5 py-3 mb-4 text-sm font-sans",
            )}
          />
        </div>
      </div>
      {/* Insert the FoodSearchBar below the editors */}
      <FoodSearchBar onChange={setSelectedFoods} />
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
