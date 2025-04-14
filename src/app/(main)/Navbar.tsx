import Link from "next/link";

import SearchField from "@/components/SearchField";
import UserButton from "@/components/UserButton";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-10 w-full bg-card shadow-sm">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold text-primary">
          MealMate
        </Link>

        {/* Search */}
        <div className="flex-1 min-w-[200px] max-w-md">
          <SearchField />
        </div>

        {/* User button */}
        <UserButton className="sm:ms-auto" />
      </div>
    </header>
  );
}
