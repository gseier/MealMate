"use client";

import { logout } from "@/app/(auth)/actions";
import { useSession } from "@/app/(main)/SessionProvider";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import {
  Check,
  LogOut,
  Monitor,
  Moon,
  Sun,
  User as UserIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import UserAvatar from "./UserAvatar";

interface UserButtonProps {
  className?: string;
}

export default function UserButton({ className }: UserButtonProps) {
  const { user } = useSession();
  const { theme, setTheme } = useTheme();
  const qc = useQueryClient();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={cn("flex-none rounded-full outline-none", className)}
          data-testid="user-avatar-button"
        >
          <UserAvatar avatarUrl={user.avatarUrl} size={40} />
        </button>
      </DropdownMenuTrigger>

      {/* prettier / glassy */}
      <DropdownMenuContent
        side="bottom"
        align="end"
        className="w-56 rounded-xl border border-white/10 bg-card/70 backdrop-blur-md shadow-xl ring-1 ring-white/10
                   motion-safe:animate-scale-in"
      >
        <DropdownMenuLabel className="text-xs uppercase tracking-wider text-muted-foreground">
          Logged in as <span className="font-semibold">@{user.username}</span>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {/* profile */}
        <Link href={`/users/${user.username}`} className="focus:outline-none">
          <DropdownMenuItem className="group">
            <UserIcon className="mr-2 h-4 w-4 opacity-70 group-hover:opacity-100" />
            Profile
          </DropdownMenuItem>
        </Link>

        {/* theme switcher */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Monitor className="mr-2 h-4 w-4 opacity-70" />
            Theme
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent
              className="w-44 rounded-xl border border-white/10 bg-card/70 backdrop-blur-md
                         shadow-md ring-1 ring-white/10 motion-safe:animate-scale-in"
            >
              {[
                { id: "system", label: "System default", icon: Monitor },
                { id: "light", label: "Light", icon: Sun },
                { id: "dark", label: "Dark", icon: Moon },
              ].map(({ id, label, icon: Icon }) => (
                <DropdownMenuItem
                  key={id}
                  onClick={() => setTheme(id)}
                  className="group"
                >
                  <Icon className="mr-2 h-4 w-4 opacity-70 group-hover:opacity-100" />
                  {label}
                  {theme === id && (
                    <Check className="ml-auto h-4 w-4 text-primary" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>

        <DropdownMenuSeparator />

        {/* logout */}
        <DropdownMenuItem
          onClick={() => {
            qc.clear();
            logout();
          }}
          className="text-destructive focus:text-destructive group"
        >
          <LogOut className="mr-2 h-4 w-4 opacity-70 group-hover:opacity-100" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
