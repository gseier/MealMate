import kyInstance from "@/lib/ky";
import { BookmarkInfo } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  QueryKey,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Utensils, ChevronDown } from "lucide-react";
import { useToast } from "../ui/use-toast";
import React, { useState } from "react";

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];

interface BookmarkButtonProps {
  postId: string;
  initialState: BookmarkInfo;
}

export default function BookmarkButton({ postId, initialState }: BookmarkButtonProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const queryKey: QueryKey = ["bookmark-info", postId];

  // 1) UseQuery to fetch { isBookmarkedByUser, day }
  const { data } = useQuery({
    queryKey,
    queryFn: () => kyInstance.get(`/api/posts/${postId}/bookmark`).json<BookmarkInfo>(),
    initialData: initialState,
    staleTime: Infinity,
  });

  // 2) Mutation to toggle bookmark on/off
  const toggleMutation = useMutation({
    mutationFn: () =>
      data.isBookmarkedByUser
        ? kyInstance.delete(`/api/posts/${postId}/bookmark`)
        : kyInstance.post(`/api/posts/${postId}/bookmark`),
    onMutate: async () => {
      toast({
        description: `Recipe ${
          data.isBookmarkedByUser ? "removed from" : "added to"
        } mealplan`,
      });
      await queryClient.cancelQueries({ queryKey });

      // Flip isBookmarked, clear day if user just removed the bookmark
      const previousState = queryClient.getQueryData<BookmarkInfo>(queryKey);
      queryClient.setQueryData<BookmarkInfo>(queryKey, (old) => {
        if (!old) {
          // If there was no previous data, create a new object
          return {
            isBookmarkedByUser: true,
            day: null,
          };
        }
        // Otherwise, return the old data plus any changes
        return {
          ...old,
          isBookmarkedByUser: !old.isBookmarkedByUser,
          // If user is removing the bookmark, reset day to null
          day: old.isBookmarkedByUser ? null : old.day,
        };
      });

      return { previousState };
    },
    onError: (error, variables, context) => {
      queryClient.setQueryData(queryKey, context?.previousState);
      toast({
        variant: "destructive",
        description: "Something went wrong. Please try again.",
      });
    },
    onSettled: () => {
      // Re-fetch the bookmark info to be sure day is correct
      queryClient.invalidateQueries({ queryKey });
    },
  });

  // 3) Mutation to set/clear the day (PATCH)
  const setDayMutation = useMutation({
    mutationFn: (newDay: string | null) =>
      kyInstance.patch(`/api/posts/${postId}/bookmark`, {
        json: { day: newDay },
      }),
    onMutate: async (newDay) => {
      await queryClient.cancelQueries({ queryKey });

      const prev = queryClient.getQueryData<BookmarkInfo>(queryKey);
      // Optimistic update
      queryClient.setQueryData<BookmarkInfo>(queryKey, (old) => {
        if (!old) {
          // If there was no previous data, create a new object
          return {
            isBookmarkedByUser: true,
            day: null,
          };
        }
        // Otherwise, return the old data plus any changes
        return {
          ...old,
          isBookmarkedByUser: !old.isBookmarkedByUser,
          // If user is removing the bookmark, reset day to null
          day: old.isBookmarkedByUser ? null : old.day,
        };
      });
      return { prev };
    },
    onError: (error, variables, context) => {
      if (context?.prev) {
        queryClient.setQueryData(queryKey, context.prev);
      }
      toast({
        variant: "destructive",
        description: "Day assignment failed. Please try again.",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  // If no data yet, return null or a skeleton
  if (!data) return null;

  // Render a button + optional day selection
  return (
    <div className="flex items-center gap-2">
      <button onClick={() => toggleMutation.mutate()}>
        <Utensils
          className={cn(
            "size-5",
            data.isBookmarkedByUser && "fill-primary text-primary"
          )}
        />
      </button>

      {data.isBookmarkedByUser && (
        <DayDropdown
          currentDay={data.day}
          onSelectDay={(day) => setDayMutation.mutate(day)}
        />
      )}
    </div>
  );
}

function DayDropdown({
  currentDay,
  onSelectDay,
}: {
  currentDay: string | null;
  onSelectDay: (day: string | null) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="px-2 py-1 border rounded flex items-center gap-1"
      >
        {currentDay ?? "Assign Day"}
        <ChevronDown className="h-3 w-3" />
      </button>

      {open && (
        <div className="absolute left-0 mt-1 p-2 bg-white border shadow rounded z-10">
          {DAYS.map((d) => (
            <div
              key={d}
              onClick={() => {
                onSelectDay(d);
                setOpen(false);
              }}
              className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
            >
              {d}
            </div>
          ))}
          {/* Option to clear/unassign the day */}
          {currentDay && (
            <div
              onClick={() => {
                onSelectDay(null);
                setOpen(false);
              }}
              className="cursor-pointer text-sm text-red-500 hover:bg-gray-100 px-2 py-1 rounded mt-2"
            >
              Clear Day
            </div>
          )}
        </div>
      )}
    </div>
  );
}
