"use client";

import React, { useState } from "react";
import kyInstance from "@/lib/ky";
import { useQuery } from "@tanstack/react-query";
import foodsData from "@/data/foods.json";
import Post from "@/components/posts/Post";
import PostsLoadingSkeleton from "@/components/posts/PostsLoadingSkeleton";

/* ------------------------------
   1) Types matching your existing code
------------------------------ */
interface PostFoodItem {
  food: {
    id: number;
    name: string;
    serving: number | null;
  };
  amount: number; // e.g. grams
  postId?: string; // Optional if not used
  foodId?: number; // Optional if not used
}

interface PostUser {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
  createdAt: Date;
  followers: { followerId: string }[];
  _count: {
    posts: number;
    followers: number;
  };
}

interface PostType {
  id: string;
  title: string;
  createdAt: Date;
  user: PostUser;

  // The array of foods for each post
  foods: PostFoodItem[];

  // Additional properties required by the Post component
  likes: { userId: string }[];
  bookmarks: { userId: string }[];
  _count: {
    likes: number;
    bookmarks: number;
    comments: number; // Added comments property
  };
}

// This is the shape returned by /api/posts/bookmarked-by-day
interface BookmarksByDay {
  [day: string]: PostType[];
}

// Days array (no "NO_DAY")
const DAYS = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

/* -------------------------------------------------
   2) Function to replicate your CaloriesChart logic
      but only for totalCalories
--------------------------------------------------*/
function getPostCalories(post: PostType): number {
  let totalCalories = 0;

  post.foods.forEach(({ food, amount }) => {
    // 1) find the matching info in foodsData
    //    e.g. { name, calories, fat, proteins, etc. }
    const foodInfo = (foodsData as any[]).find(
      (f) => f.name.toLowerCase() === food.name.toLowerCase()
    );
    if (!foodInfo) return; // skip if not found

    // 2) replicate the "amount / 100" scale
    const scale = amount / 100; // e.g. if amount is in grams
    // 3) add to total cals
    // In CaloriesChart, it was: totalCalories += (foodInfo.calories * 100) * scale;
    // Which is effectively: foodInfo.calories * amount
    totalCalories += (foodInfo.calories * 100) * scale;
  });

  return totalCalories;
}

/* -------------------------------------------------------------------
   3) The Mealplan component: day-based switching & total calorie sums
------------------------------------------------------------------- */
export default function Mealplan() {
  // The user selects which day to view
  const [selectedDay, setSelectedDay] = useState<string>("MONDAY");

  // 1) Fetch all bookmarked posts grouped by day
  const {
    data: groupedData,
    status,
    error,
  } = useQuery<BookmarksByDay, Error>({
    queryKey: ["bookmarks-by-day"],
    queryFn: async () => {
      const res = await kyInstance.get("/api/posts/bookmarked-by-day");
      const rawData = (await res.json()) as BookmarksByDay;

      // Convert createdAt fields to real Dates
      Object.values(rawData).forEach((posts) => {
        posts.forEach((p) => {
          p.createdAt = new Date(p.createdAt);
          p.user.createdAt = new Date(p.user.createdAt);
        });
      });
      return rawData;
    },
  });

  // 2) Handle loading & error states
  if (status === "pending") {
    return <PostsLoadingSkeleton />;
  }
  if (status === "error") {
    return (
      <div className="p-4 text-destructive">
        Failed to load mealplan: {error?.message}
      </div>
    );
  }
  if (!groupedData) {
    return (
      <div className="p-4 text-muted-foreground">
        No mealplan data available
      </div>
    );
  }

  // 3) Build day buttons, each showing total daily cals
  return (
    <div className="p-4 space-y-6">
      {/* Top bar: day switching + daily total cals */}
      <div className="flex flex-wrap gap-2 justify-center">
        {DAYS.map((day) => {
          const dayPosts = groupedData[day] || [];
          const dayCals = dayPosts.reduce(
            (sum, post) => sum + getPostCalories(post),
            0
          );
          return (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-4 py-2 rounded-md border shadow-sm 
                hover:bg-gray-200
                ${
                  selectedDay === day
                    ? "bg-gray-300 font-semibold"
                    : "bg-white"
                }
              `}
            >
              {day}
              <span className="ml-2 text-sm text-gray-600">
                ({Math.round(dayCals)} cals)
              </span>
            </button>
          );
        })}
      </div>

      {/* Main area: posts for the currently selected day */}
      <DaySection
        day={selectedDay}
        posts={groupedData[selectedDay] || []}
      />
    </div>
  );
}

/* -------------------------------------------------
   4) A helper component to show the day's posts
      Feel free to style or reorganize as needed
--------------------------------------------------*/
function DaySection({ day, posts }: { day: string; posts: PostType[] }) {
  // If no posts for that day, show a small message
  if (!posts.length) {
    return (
      <div className="mt-4 text-center text-muted-foreground">
        No posts for {day} yet.
      </div>
    );
  }

  // Otherwise, list them
  const totalDayCals = posts.reduce((acc, p) => acc + getPostCalories(p), 0);

  return (
    <div className="mt-4 space-y-4">
      <h2 className="text-xl font-semibold text-center">
        {day} Mealplan – {Math.round(totalDayCals)} Calories
      </h2>
      {posts.map((post) => (
        <div key={post.id} className="p-4 rounded-md border shadow-sm bg-white">
          {/* If your <Post> component accepts this shape, just do: */}
          <Post
            post={{
              ...post,
              content: "", // Provide a default or actual content value
              userId: post.user.id, // Map user.id to userId
              foods: post.foods.map((food) => ({
                ...food,
                postId: food.postId || "",
                foodId: food.foodId || 0,
              })),
            }}
          />
        </div>
      ))}
    </div>
  );
}
