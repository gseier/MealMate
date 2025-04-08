import avatarPlaceholder from "@/assets/avatar-placeholder.png";
import Image from "next/image";
import { UserData } from "@/lib/types";

interface UserAvatarProps {
  // Either a full user object...
  user?: UserData;
  // ...or a direct avatarUrl string may be provided.
  avatarUrl?: string | null;
  size?: number;
}

export default function UserAvatar({
  user,
  avatarUrl,
  size = 40,
}: UserAvatarProps) {
  // Determine the URL to display:
  // 1. If a user object was provided, use its avatarUrl.
  // 2. Otherwise, if an avatarUrl prop is provided, use it.
  // 3. Fallback to a default placeholder.
  const finalAvatarUrl =
    user?.avatarUrl || avatarUrl || avatarPlaceholder.src;

  return (
    <Image
      src={finalAvatarUrl}
      alt={`${user?.displayName || "User"} Avatar`}
      width={size}
      height={size}
      className="rounded-full"
    />
  );
}
