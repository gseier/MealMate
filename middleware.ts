// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // For GET requests, extend the session cookie expiration if present.
  if (request.method === "GET") {
    const response = NextResponse.next();
    const token = request.cookies.get("session")?.value ?? null;
    if (token) {
      response.cookies.set("session", token, {
        path: "/",
        maxAge: 60 * 60 * 24 * 30, // 30 days
        sameSite: "lax",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      });
    }
    return response;
  }

  // For non-GET requests, implement CSRF protection (or other logic) as needed.
  // (You can add your CSRF checks here.)
  return NextResponse.next();
}
