import Link from "next/link";
import { Home, Utensils } from "lucide-react";

import { validateRequest } from "@/auth";
import { Button } from "@/components/ui/button";
import prisma from "@/lib/prisma";
import NotificationsButton from "./NotificationsButton";

interface MenuBarProps {
  className?: string;
}

export default async function MenuBar({ className }: MenuBarProps) {
  const { user } = await validateRequest();
  if (!user) return null;

  const unreadNotificationsCount = await prisma.notification.count({
    where: {
      recipientId: user.id,
      read: false,
    },
  });

  return (
    <nav className={className}>
      {/* Home button */}
      <Button
        variant="ghost"
        className="w-full justify-start gap-3"
        title="Home"
        asChild
      >
        <Link href="/">
          <Home className="size-5" />
          <span className="hidden lg:inline">Home</span>
        </Link>
      </Button>

      {/* Notifications button with unread count */}
      <NotificationsButton
        initialState={{ unreadCount: unreadNotificationsCount }}
      />
    </nav>
  );
}
