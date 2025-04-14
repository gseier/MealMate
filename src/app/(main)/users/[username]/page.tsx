import { cache } from "react";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { formatDate } from "date-fns";

import { validateRequest } from "@/auth";
import FollowButton from "@/components/FollowButton";
import FollowerCount from "@/components/FollowerCount";
import Linkify from "@/components/Linkify";
import UserAvatar from "@/components/UserAvatar";
import TrendsSidebar from "@/components/ToFollow";
import prisma from "@/lib/prisma";
import { getUserDataSelect, UserData, FollowerInfo } from "@/lib/types";
import { formatNumber } from "@/lib/utils";

import EditProfileButton from "./EditProfileButton";
import UserPosts from "./UserPosts";

interface PageProps {
  params: { username: string };
}

const getUser = cache(async (username: string, loggedInUserId: string) => {
  const user = await prisma.user.findFirst({
    where: {
      username: {
        equals: username,
        mode: "insensitive",
      },
    },
    select: getUserDataSelect(loggedInUserId),
  });

  if (!user) notFound();
  return user;
});

export async function generateMetadata({
  params: { username },
}: PageProps): Promise<Metadata> {
  const { user: loggedInUser } = await validateRequest();
  if (!loggedInUser) return {};

  const user = await getUser(username, loggedInUser.id);
  return {
    title: `${user.displayName} (@${user.username})`,
  };
}

export default async function Page({ params: { username } }: PageProps) {
  const { user: loggedInUser } = await validateRequest();
  if (!loggedInUser) {
    return (
      <p className="text-center text-destructive">
        You&apos;re not authorized to view this page.
      </p>
    );
  }

  const user = await getUser(username, loggedInUser.id);

  return (
    <main className="flex w-full min-w-0 gap-6">
      <div className="w-full min-w-0 space-y-6">
        <UserProfile user={user} loggedInUserId={loggedInUser.id} />

        <section className="rounded-2xl bg-card p-5 shadow-sm">
          <h2 className="text-center text-2xl font-bold">
            {user.displayName}&apos;s posts
          </h2>
        </section>

        <UserPosts userId={user.id} />
      </div>

      <TrendsSidebar />
    </main>
  );
}

interface UserProfileProps {
  user: UserData;
  loggedInUserId: string;
}

async function UserProfile({ user, loggedInUserId }: UserProfileProps) {
  const followerInfo: FollowerInfo = {
    followers: user._count.followers,
    isFollowedByUser: user.followers.some(
      ({ followerId }) => followerId === loggedInUserId
    ),
  };

  const isOwnProfile = user.id === loggedInUserId;

  return (
    <section className="rounded-2xl bg-card p-6 shadow-sm space-y-6">
      {/* Top section with avatar and profile controls */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:gap-6">
        <UserAvatar
          avatarUrl={user.avatarUrl}
          size={96}
          className="mx-auto sm:mx-0 rounded-full shadow"
        />

        <div className="flex-1 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold">{user.displayName}</h1>
              <p className="text-sm text-muted-foreground">@{user.username}</p>
              <p className="text-xs text-muted-foreground">
                Member since {formatDate(user.createdAt, "MMM d, yyyy")}
              </p>
            </div>

            <div className="mt-4 sm:mt-0">
              {isOwnProfile ? (
                <EditProfileButton user={user} />
              ) : (
                <FollowButton userId={user.id} initialState={followerInfo} />
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-4 text-sm">
            <span>
              Posts:{" "}
              <span className="font-semibold">
                {formatNumber(user._count.posts)}
              </span>
            </span>

            <FollowerCount userId={user.id} initialState={followerInfo} />
          </div>
        </div>
      </div>

      {/* User bio */}
      {user.bio && (
        <div className="rounded-md bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
          <Linkify>
            <p className="whitespace-pre-line break-words">{user.bio}</p>
          </Linkify>
        </div>
      )}
    </section>
  );
}
