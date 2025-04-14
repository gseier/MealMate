import { validateRequest } from "@/auth";
import { redirect } from "next/navigation";

import Navbar from "./Navbar";
import MenuBar from "./MenuBar";
import SessionProvider from "./SessionProvider";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await validateRequest();

  if (!session.user) {
    redirect("/login");
  }

  return (
    <SessionProvider value={session}>
      <div className="flex min-h-screen flex-col">
        <Navbar />

        <main className="mx-auto flex w-full max-w-7xl grow gap-5 p-5">
          {/* Left MenuBar for larger screens */}
          <MenuBar className="sticky top-[5.25rem] hidden h-fit flex-none space-y-3 rounded-2xl bg-card px-3 py-5 shadow-sm sm:block lg:px-5 xl:w-80" />

          {/* Main content */}
          {children}
        </main>

        {/* Bottom MenuBar for small screens */}
        <MenuBar className="sticky bottom-0 flex w-full justify-center gap-5 border-t bg-card p-3 sm:hidden" />
      </div>
    </SessionProvider>
  );
}
