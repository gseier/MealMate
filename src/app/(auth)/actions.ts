"use server";

import { invalidateSession, validateRequest, deleteSessionTokenCookie } from "@/auth";
import { redirect } from "next/navigation";

export async function logout() {
  const { session } = await validateRequest();

  if (!session) {
    throw new Error("Unauthorized");
  }

  await invalidateSession(session.id);
  await deleteSessionTokenCookie();

  return redirect("/login");
}
