import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { validateRequest } from "@/auth";

export async function GET(req: NextRequest) {
  const { user: loggedInUser } = await validateRequest();
  if (!loggedInUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const bookmarks = await prisma.bookmark.findMany({
    where: { userId: loggedInUser.id },
    include: {
      // If your Post model includes 'foods' for calorie calculation, do:
      post: {
        include: {
          user: true,
          foods: true, // Adjust to your schema
          likes: true,
          bookmarks: true,
        },
      },
    },
  });

  // Build a structure: { "MONDAY": [post, post], "TUESDAY": [...], ... }
  const grouped: Record<string, any[]> = {};

  for (const bm of bookmarks) {
    const day = bm.day || "NO_DAY";
    if (!grouped[day]) {
      grouped[day] = [];
    }
    grouped[day].push(bm.post);
  }

  return NextResponse.json(grouped, { status: 200 });
}
