"use client";

import { useSession } from "@/app/(main)/SessionProvider";
import { PostData } from "@/lib/types";
import { formatRelativeDate } from "@/lib/utils";
import { MessageSquare } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import Comments from "../comments/Comments";
import Linkify from "../Linkify";
import UserAvatar from "../UserAvatar";
import UserTooltip from "../UserTooltip";
import LikeButton from "./LikeButton";
import PostMoreButton from "./PostMoreButton";
import { CaloriesChart } from "./CaloriesChart";

interface PostProps {
  post: PostData;
}

export default function Post({ post }: PostProps) {
  const { user } = useSession();
  const [showComments, setShowComments] = useState(false);

  return (
    <article className="group/post space-y-3 rounded-2xl bg-card p-5 shadow-sm">
      {/* Post header */}
      <div className="flex justify-between gap-3">
        <div className="flex flex-wrap gap-3">
          <UserTooltip user={post.user}>
            <Link href={`/users/${post.user.username}`}>
              <UserAvatar avatarUrl={post.user.avatarUrl} />
            </Link>
          </UserTooltip>
          <div>
            <UserTooltip user={post.user}>
              <Link
                href={`/users/${post.user.username}`}
                className="block font-medium hover:underline"
              >
                {post.user.displayName}
              </Link>
            </UserTooltip>
            <Link
              href={`/posts/${post.id}`}
              className="block text-sm text-muted-foreground hover:underline"
              suppressHydrationWarning
            >
              {formatRelativeDate(post.createdAt)}
            </Link>
          </div>
        </div>
        {post.user.id === user.id && (
          <PostMoreButton
            post={post}
            className="opacity-0 transition-opacity group-hover/post:opacity-100"
          />
        )}
      </div>

      {/* Post content and calories */}
      <Linkify>
        <div className="whitespace-pre-line break-words">{post.content}</div>
        {post.foods && post.foods.length > 0 && <CaloriesChart foods={post.foods} />}
      </Linkify>

      {/* Display attached foods */}
      {post.foods && post.foods.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {post.foods.map((foodOnPost) => (
            <span
              key={foodOnPost.food.id}
              className="px-2 py-1 rounded-full text-sm"
              style={{
                backgroundColor: "hsl(var(--accent))",
                color: "hsl(var(--accent-foreground))",
              }}
            >
              {foodOnPost.food.name} ({foodOnPost.amount}g)
            </span>
          ))}
        </div>
      )}

      <hr className="border-t border-muted-foreground my-3" />

      {/* Post actions */}
      <div className="flex justify-between gap-5">
        <div className="flex items-center gap-5">
          <LikeButton
            postId={post.id}
            initialState={{
              likes: post._count.likes,
              isLikedByUser: post.likes.some((like) => like.userId === user.id),
            }}
          />
          <CommentButton
            post={post}
            onClick={() => setShowComments(!showComments)}
          />
        </div>
      </div>

      {showComments && <Comments post={post} />}
    </article>
  );
}

interface CommentButtonProps {
  post: PostData;
  onClick: () => void;
}

function CommentButton({ post, onClick }: CommentButtonProps) {
  return (
    <button onClick={onClick} className="flex items-center gap-2">
      <MessageSquare className="h-5 w-5" />
      <span className="text-sm font-medium tabular-nums">
        {post._count.comments} <span className="hidden sm:inline">comments</span>
      </span>
    </button>
  );
}
