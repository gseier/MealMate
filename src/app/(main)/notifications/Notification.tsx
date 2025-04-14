import Link from "next/link";
import { Heart, MessageCircle, User2 } from "lucide-react";

import UserAvatar from "@/components/UserAvatar";
import { NotificationData } from "@/lib/types";
import { cn } from "@/lib/utils";
import { NotificationType } from "@prisma/client";

interface NotificationProps {
  notification: NotificationData;
}

export default function Notification({ notification }: NotificationProps) {
  const { issuer, post, type, read, postId } = notification;

  const notificationTypeMap: Record<
    NotificationType,
    { message: string; icon: JSX.Element; href: string }
  > = {
    FOLLOW: {
      message: `${issuer.displayName} followed you`,
      icon: <User2 className="size-7 text-primary" />,
      href: `/users/${issuer.username}`,
    },
    COMMENT: {
      message: `${issuer.displayName} commented on your post`,
      icon: <MessageCircle className="size-7 fill-primary text-primary" />,
      href: `/posts/${postId}`,
    },
    LIKE: {
      message: `${issuer.displayName} liked your post`,
      icon: <Heart className="size-7 fill-red-500 text-red-500" />,
      href: `/posts/${postId}`,
    },
  };

  const { message, icon, href } = notificationTypeMap[type];

  return (
    <Link href={href} className="block">
      <article
        className={cn(
          "flex gap-3 rounded-2xl bg-card p-5 shadow-sm transition-colors hover:bg-card/70",
          !read && "bg-primary/10"
        )}
      >
        <div className="my-1 shrink-0">{icon}</div>

        <div className="space-y-3">
          <UserAvatar avatarUrl={issuer.avatarUrl} size={36} />
          <div>
            <span className="font-bold">{issuer.displayName}</span>{" "}
            <span>{message}</span>
          </div>

          {post && (
            <div className="line-clamp-3 whitespace-pre-line text-muted-foreground">
              {post.content}
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}
