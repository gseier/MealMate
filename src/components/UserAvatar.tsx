import avatarPlaceholder from "@/assets/avatar-placeholder.png";
import Image from "next/image";
import { UserData } from "@/lib/types";

interface UserAvatarProps {
  user?: UserData;
  avatarUrl?: string | null;
  size?: number;
  className?: string;
}

export default function UserAvatar({
  user,
  avatarUrl,
  size = 40,
  className = "",
}: UserAvatarProps) {
  const finalAvatarUrl =
    user?.avatarUrl || avatarUrl || avatarPlaceholder.src;

  return (
    <Image
      src={finalAvatarUrl}
      alt={`${user?.displayName || "User"} Avatar`}
      width={size}
      height={size}
      style={{ objectFit: "cover", aspectRatio: 1 }}
      className={`rounded-full ${className}`}
    />
  );
}
