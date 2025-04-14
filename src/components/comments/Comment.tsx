import Link from "next/link";

import { useSession } from "@/app/(main)/SessionProvider";
import { CommentData } from "@/lib/types";
import { formatRelativeDate } from "@/lib/utils";

import UserAvatar from "../UserAvatar";
import UserTooltip from "../UserTooltip";
import CommentMoreButton from "./CommentMoreButton";

interface CommentProps {
  comment: CommentData;
}

export default function Comment({ comment }: CommentProps) {
  const { user } = useSession();

  return (
    <div className="group/comment flex gap-4 rounded-lg px-2 py-4 hover:bg-muted/30">
      {/* Avatar (hidden on small screens) */}
      <div className="hidden sm:block">
        <UserTooltip user={comment.user}>
          <Link href={`/users/${comment.user.username}`}>
            <UserAvatar avatarUrl={comment.user.avatarUrl} size={40} />
          </Link>
        </UserTooltip>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col gap-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <UserTooltip user={comment.user}>
              <Link
                href={`/users/${comment.user.username}`}
                className="font-medium hover:underline"
              >
                {comment.user.displayName}
              </Link>
            </UserTooltip>
            <span className="text-muted-foreground text-xs">
              {formatRelativeDate(comment.createdAt)}
            </span>
          </div>

          {/* Actions (edit/delete) */}
          {comment.user.id === user.id && (
            <CommentMoreButton
              comment={comment}
              className="opacity-0 transition-opacity group-hover/comment:opacity-100"
            />
          )}
        </div>

        <p className="text-sm leading-relaxed text-foreground break-words">
          {comment.content}
        </p>
      </div>
    </div>
  );
}
