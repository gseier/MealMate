import avatarPlaceholder from "@/assets/avatar-placeholder.png";
import Image from "next/image";
import { UserData } from "@/lib/types";

interface UserAvatarProps {
  // Either a full user object...
  user?: UserData;
  // ...or a direct avatarUrl string may be provided.
  avatarUrl?: string | null;
  size?: number;
  // Accept a className for additional styling.
  className?: string;
}

export default function UserAvatar({
  user,
  avatarUrl,
  size = 40,
  className = "",
}: UserAvatarProps) {
  // Determine the image source:
  const finalAvatarUrl =
    user?.avatarUrl || avatarUrl || avatarPlaceholder.src;

  return (
    <Image
      src={finalAvatarUrl}
      alt={`${user?.displayName || "User"} Avatar`}
      width={size}
      height={size}
      // Combine a default rounded style with any additional classes passed
      className={`rounded-full ${className}`}
    />
  );
}
