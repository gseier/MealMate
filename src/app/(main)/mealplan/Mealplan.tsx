"use client";

import React from "react";
import kyInstance from "@/lib/ky";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import InfiniteScrollContainer from "@/components/InfiniteScrollContainer";
import Post from "@/components/posts/Post";
import PostsLoadingSkeleton from "@/components/posts/PostsLoadingSkeleton";
import { Loader2 } from "lucide-react";

/* ------------------------------
   1) PostType and related types
   Adjust fields as needed to 
   match your backend & Post.tsx
------------------------------ */
interface BookmarkUser {
  userId: string;
}

interface Like {
  userId: string;
}

interface Foods {
  food: {
    id: number;
    name: string;
    serving: number | null;
  };
  postId: string;
  foodId: number;
  amount: number;
}

interface Follower {
  followerId: string;
}

/** The user object in your Post */
interface PostUser {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
  // IMPORTANT: We want this to be a Date object 
  // because Post.tsx expects a real Date
  createdAt: Date;
  followers: Follower[];
  _count: {
    following: number;
    followers: number;
    posts: number;
  };
}

/** 
 * The main post shape that matches 
 * what your Post.tsx expects 
 */
interface PostType {
  id: string;
  title: string;
  content: string; // Added to match PostData
  userId: string; // Added to match PostData
  createdAt: Date; // Added to match PostData
  bookmarks: BookmarkUser[];
  user: PostUser;
  likes: Like[];
  _count: {
    likes: number;
    comments: number; // Added comments field to match PostData type
  };
  foods: Foods[];
}

/* -------------------------------------------------
   2) The shape returned by /api/posts/bookmarked 
      for infinite pagination
--------------------------------------------------*/
interface PostsPage {
  posts: PostType[];
  nextCursor: string | null; // Used for infinite scroll
}

/* -----------------------------------------------
   3) The shape returned by /api/posts/bookmarked-by-day
      Key: day string -> Value: array of PostType
----------------------------------------------- */
interface BookmarksByDay {
  [day: string]: PostType[];
}

/** 
 * Example function to sum total calories from post.
 * Adjust to your real logic if needed.
 */
function getTotalCalories(post: PostType): number {
  // If you want to sum from foods, do it here:
  // let total = 0;
  // post.foods.forEach((f) => { ... });
  // return total;
  return 0;
}

/** 
 * We might handle "NO_DAY" for unassigned day
 */
const DAYS = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
  "NO_DAY",
];

export default function Mealplan() {
  /* -----------------------------------------------
     4) Query: fetch grouped bookmarks by day
  ----------------------------------------------- */
  const {
    data: groupedData,
    status: groupedStatus,
    error: groupedError,
  } = useQuery<BookmarksByDay, Error>({
    queryKey: ["bookmarks-by-day"],
    queryFn: async () => {
      // We don't need to parse createdAt here, because 
      // it's only used for day grouping data. 
      // But if you also need user.createdAt as a Date here, 
      // do so as well.
      return kyInstance
        .get("/api/posts/bookmarked-by-day")
        .json<BookmarksByDay>();
    },
  });

  /* -----------------------------------------------
     5) Infinite query: fetch bookmarked posts 
        in pages (with a nextCursor).
  ----------------------------------------------- */
  const {
    data,
    fetchNextPage,
    hasNextPage,
    status,
    isFetching,
    isFetchingNextPage,
    error,
  } = useInfiniteQuery<PostsPage, Error>({
    queryKey: ["post-feed", "bookmarks"],
    // pageParam must be a string or null
    queryFn: async ({ pageParam = null }: { pageParam: unknown }) => {
      // 1) Make the request
      const res = await kyInstance.get("/api/posts/bookmarked", {
        // If pageParam is string, pass { cursor: pageParam }
        // If null, pass undefined so we don't do { cursor: {} }
        searchParams: pageParam ? { cursor: String(pageParam) } : undefined,
      });

      // 2) Convert the raw JSON to your typed object
      const data = (await res.json()) as PostsPage;

      // 3) Transform string -> Date
      // So that `Post.tsx` sees a real Date 
      data.posts.forEach((p) => {
        // convert user.createdAt from string to Date
        // If your server always returns a valid date string:
        p.user.createdAt = new Date(p.user.createdAt);
      });

      return data;
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    // TS requires an initialPageParam if we use pageParam
    initialPageParam: null,
  });

  /* --------------------------------------------
     6) status checks (Your union: "pending")
  -------------------------------------------- */
  if (status === "pending") {
    return <PostsLoadingSkeleton />;
  }
  if (status === "error") {
    return (
      <p className="text-center text-destructive">
        An error occurred while loading mealplan: {error?.message}
      </p>
    );
  }
  // If we reach here, status === "success"

  // Flatten all pages
  const posts = data?.pages.flatMap((page) => page.posts) || [];

  return (
    <>
      {/* ----------------------------------------------------
          7) Show grouped day info (top section)
      ---------------------------------------------------- */}
      {groupedStatus === "pending" && (
        <div className="p-4 mb-4">Loading day grouping...</div>
      )}
      {groupedStatus === "error" && (
        <div className="p-4 mb-4 text-destructive">
          An error occurred while loading day grouping: {groupedError?.message}
        </div>
      )}
      {groupedStatus === "success" && groupedData && (
        <div className="p-4 mb-4 rounded-lg bg-gray-100">
          <h2 className="text-xl font-semibold mb-2">Mealplan by Day</h2>
          {DAYS.map((day) => {
            const dayPosts = groupedData[day] || [];
            if (!dayPosts.length) return null;

            const totalCals = dayPosts.reduce(
              (sum, p) => sum + getTotalCalories(p),
              0
            );

            return (
              <div key={day} className="mb-3 border rounded bg-white p-2">
                <div className="font-bold">
                  {day === "NO_DAY" ? "Unassigned" : day} – Total: {totalCals} Calories
                </div>
                <div className="flex flex-wrap gap-2 mt-1">
                  {dayPosts.map((p) => (
                    <div key={p.id} className="border p-2 rounded w-full sm:w-auto">
                      <div className="font-medium">{p.title}</div>
                      {/* 
                        If needed, show snippet, or pass `p` to <Post />. 
                        If you pass <Post post={p} />, also do date conversion. 
                      */}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ----------------------------------------------------
          8) Infinite scroll feed (main listing)
      ---------------------------------------------------- */}
      {!posts.length && !hasNextPage ? (
        <p className="text-center text-muted-foreground">
          You don&apos;t have any mealplan recipes yet.
        </p>
      ) : (
        <InfiniteScrollContainer
          className="space-y-5"
          onBottomReached={() => hasNextPage && !isFetching && fetchNextPage()}
        >
          {posts.map((post) => (
            <Post key={post.id} post={post} />
          ))}
          {isFetchingNextPage && (
            <Loader2 className="mx-auto my-3 animate-spin" />
          )}
        </InfiniteScrollContainer>
      )}
    </>
  );
}
