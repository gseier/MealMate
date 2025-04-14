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
    <main className="flex w-full min-w-0 gap-5">
      <div className="w-full min-w-0 space-y-5">
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
    <section className="space-y-5 rounded-2xl bg-card p-5 shadow-sm">
      <UserAvatar
        avatarUrl={user.avatarUrl}
        size={250}
        className="mx-auto max-h-60 max-w-60 rounded-full"
      />

      <div className="flex flex-wrap items-start gap-4 sm:flex-nowrap">
        <div className="me-auto space-y-3">
          <div>
            <h1 className="text-3xl font-bold">{user.displayName}</h1>
            <p className="text-muted-foreground">@{user.username}</p>
          </div>

          <p className="text-sm">Member since {formatDate(user.createdAt, "MMM d, yyyy")}</p>

          <div className="flex flex-wrap items-center gap-4">
            <span>
              Posts:{" "}
              <span className="font-semibold">{formatNumber(user._count.posts)}</span>
            </span>

            <FollowerCount userId={user.id} initialState={followerInfo} />
          </div>
        </div>

        {isOwnProfile ? (
          <EditProfileButton user={user} />
        ) : (
          <FollowButton userId={user.id} initialState={followerInfo} />
        )}
      </div>

      {user.bio && (
        <>
          <hr />
          <Linkify>
            <p className="whitespace-pre-line break-words text-muted-foreground">
              {user.bio}
            </p>
          </Linkify>
        </>
      )}
    </section>
  );
}
