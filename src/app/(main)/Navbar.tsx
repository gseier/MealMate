"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { UtensilsCrossed } from "lucide-react";

import SearchField from "@/components/SearchField";
import UserButton from "@/components/UserButton";

export default function Navbar() {
  return (
    <header
      className="sticky top-0 z-20 w-full backdrop-blur-md transition-shadow"
      /* lægger sig skygge på når der scrolles */
      onScroll={(e) =>
        e.currentTarget.classList.toggle(
          "shadow-lg",
          window.scrollY > 10
        )
      }
    >
      <div
        /* glas + ring gradient */
        className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 rounded-b-xl border-b border-white/10 bg-card/80 px-5 py-4 ring-1 ring-inset ring-primary/10"
      >
        {/* Logo  ───────────────────────────────────── */}
        <Link href="/" className="flex items-center gap-2">
          <motion.span
            whileHover={{ rotate: 360 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="text-primary"
          >
            <UtensilsCrossed className="h-7 w-7" />
          </motion.span>

          <motion.span
            className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-3xl font-extrabold text-transparent"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            MealMate
          </motion.span>
        </Link>

        {/* Search  ─────────────────────────────────── */}
        <div className="flex-1 min-w-[200px] max-w-md">
          <SearchField />
        </div>

        {/* User button  ────────────────────────────── */}
        <UserButton className="sm:ms-auto" />
      </div>
    </header>
  );
}
