import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma"
import { validateRequest } from "@/auth"; 

export async function GET(req: NextRequest, { params }: { params: { postId: string } }) {
  // 1) Validate request, check if user is logged in
  const { user: loggedInUser } = await validateRequest();
  if (!loggedInUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2) Check if there's a bookmark for this user+post
  const bookmark = await prisma.bookmark.findFirst({
    where: { userId: loggedInUser.id, postId: params.postId },
  });

  // 3) Return minimal info (isBookmarked + current day)
  return NextResponse.json({
    isBookmarkedByUser: !!bookmark,
    day: bookmark?.day || null,
  });
}

export async function POST(req: NextRequest, { params }: { params: { postId: string } }) {
  // 1) Validate request, check if user is logged in
  const { user: loggedInUser } = await validateRequest();
  if (!loggedInUser) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2) Create the bookmark (no day set by default)
  const bookmark = await prisma.bookmark.create({
    data: {
      userId: loggedInUser.id,
      postId: params.postId,
      day: "MONDAY",
    },
  });

  return NextResponse.json(bookmark, { status: 201 });
}

export async function DELETE(req: NextRequest, { params }: { params: { postId: string } }) {
  // 1) Validate request
  const { user: loggedInUser } = await validateRequest();
  if (!loggedInUser) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2) Delete the bookmark if it exists
  await prisma.bookmark.deleteMany({
    where: {
      userId: loggedInUser.id,
      postId: params.postId,
    },
  });

  return NextResponse.json({}, { status: 204 });
}

// PATCH => update the bookmark's `day`
export async function PATCH(req: NextRequest, { params }: { params: { postId: string } }) {
  // 1) Validate request
  const { user: loggedInUser } = await validateRequest();
  if (!loggedInUser) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2) Read `day` from the request body
  const { day } = await req.json();

  // 3) Update the existing bookmark
  const updated = await prisma.bookmark.updateMany({
    where: {
      userId: loggedInUser.id,
      postId: params.postId,
    },
    data: {
      day: day || null,
    },
  });

  // If updated.count is 0, no bookmark was found
  if (!updated.count) {
    return NextResponse.json({ error: "Bookmark not found" }, { status: 404 });
  }

  return NextResponse.json({ day }, { status: 200 });
}
