"use client";

import React from "react";
import kyInstance from "@/lib/ky";
import { BookmarkInfo } from "@/lib/types";
import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryKey,
} from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useToast } from "../ui/use-toast";
import { Utensils, ChevronDown, XCircle } from "lucide-react";

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];

interface BookmarkButtonProps {
  postId: string;
  initialState: BookmarkInfo; // e.g. { isBookmarkedByUser: boolean, day: string | null }
}

export default function BookmarkButton({ postId, initialState }: BookmarkButtonProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // A stable QueryKey for this post's bookmark info
  const bookmarkQueryKey: QueryKey = ["bookmark-info", postId];

  // ---- 1) Query: is the post bookmarked, and which day? ----
  const { data: bookmarkData } = useQuery<BookmarkInfo>({
    queryKey: bookmarkQueryKey,
    queryFn: async () => {
      return kyInstance.get(`/api/posts/${postId}/bookmark`).json<BookmarkInfo>();
    },
    initialData: initialState,
    staleTime: Infinity,
  });

  // ---- 2) createBookmark: POST /bookmark with chosen day ----
  const createBookmarkMutation = useMutation({
    mutationFn: async (day: string) => {
      return kyInstance.post(`/api/posts/${postId}/bookmark`, {
        json: { day },
      });
    },
    onMutate: async (chosenDay: string) => {
      // Cancel queries so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: bookmarkQueryKey });
      // Snapshot previous data
      const prev = queryClient.getQueryData<BookmarkInfo>(bookmarkQueryKey);

      // Optimistically set the local data
      queryClient.setQueryData<BookmarkInfo>(bookmarkQueryKey, () => ({
        isBookmarkedByUser: true,
        day: chosenDay,
      }));

      return { prev };
    },
    onError: (err, vars, context) => {
      // Revert on error
      if (context?.prev) {
        queryClient.setQueryData(bookmarkQueryKey, context.prev);
      }
      toast({
        variant: "destructive",
        description: "Failed to bookmark. Please try again.",
      });
    },
    onSuccess: () => {
      toast({ description: "Recipe added to mealplan" });
    },
    onSettled: () => {
      // Re-fetch to ensure correct final data
      queryClient.invalidateQueries({ queryKey: bookmarkQueryKey });
      queryClient.invalidateQueries({ queryKey: ["bookmarks-by-day"] });
    },
  });

  // ---- 3) updateDay: PATCH /bookmark to change day ----
  const updateDayMutation = useMutation({
    mutationFn: async (newDay: string) => {
      return kyInstance.patch(`/api/posts/${postId}/bookmark`, {
        json: { day: newDay },
      });
    },
    onMutate: async (newDay) => {
      await queryClient.cancelQueries({ queryKey: bookmarkQueryKey });
      const prev = queryClient.getQueryData<BookmarkInfo>(bookmarkQueryKey);

      // Update day optimistically
      queryClient.setQueryData<BookmarkInfo>(bookmarkQueryKey, (old) => {
        if (!old) {
          return { isBookmarkedByUser: true, day: newDay };
        }
        return { ...old, day: newDay };
      });

      return { prev };
    },
    onError: (err, vars, context) => {
      if (context?.prev) {
        queryClient.setQueryData(bookmarkQueryKey, context.prev);
      }
      toast({
        variant: "destructive",
        description: "Failed to set day. Please try again.",
      });
    },
    onSuccess: () => {
      toast({ description: "Day updated" });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: bookmarkQueryKey });
      queryClient.invalidateQueries({ queryKey: ["bookmarks-by-day"] });
    },
  });

  // ---- 4) removeBookmark: DELETE /bookmark ----
  const removeBookmarkMutation = useMutation({
    mutationFn: async () => {
      return kyInstance.delete(`/api/posts/${postId}/bookmark`);
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: bookmarkQueryKey });
      const prev = queryClient.getQueryData<BookmarkInfo>(bookmarkQueryKey);

      // Optimistically set it to not bookmarked
      queryClient.setQueryData<BookmarkInfo>(bookmarkQueryKey, () => ({
        isBookmarkedByUser: false,
        day: "",
      }));

      return { prev };
    },
    onError: (err, vars, context) => {
      if (context?.prev) {
        queryClient.setQueryData(bookmarkQueryKey, context.prev);
      }
      toast({
        variant: "destructive",
        description: "Failed to remove from mealplan. Please try again.",
      });
    },
    onSuccess: () => {
      toast({ description: "Removed from mealplan" });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: bookmarkQueryKey });
      queryClient.invalidateQueries({ queryKey: ["bookmarks-by-day"] });
    },
  });

  // If we still have no data, show nothing or a skeleton
  if (!bookmarkData) {
    return null;
  }

  // Decide button label
  const label = bookmarkData.isBookmarkedByUser
    ? `Mealplan: ${bookmarkData.day ?? "?"}`
    : "Add to Mealplan";

  // ---- 5) The rendered dropdown button ----
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-1 px-2 py-1 border rounded text-sm hover:bg-gray-100">
          <Utensils className="h-4 w-4" />
          {label}
          <ChevronDown className="h-3 w-3" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Pick a Day</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {DAYS.map((d) => (
          <DropdownMenuItem
            key={d}
            onClick={() => {
              // If not bookmarked, create with chosen day. Otherwise, update day
              if (!bookmarkData.isBookmarkedByUser) {
                createBookmarkMutation.mutate(d);
              } else {
                updateDayMutation.mutate(d);
              }
            }}
          >
            {d}
          </DropdownMenuItem>
        ))}
        {bookmarkData.isBookmarkedByUser && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-500"
              onClick={() => removeBookmarkMutation.mutate()}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Remove from Mealplan
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
