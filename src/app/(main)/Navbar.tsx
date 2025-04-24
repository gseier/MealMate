"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { UtensilsCrossed } from "lucide-react";

import SearchField from "@/components/SearchField";
import UserButton from "@/components/UserButton";

export default function Navbar() {
  /* ­­­shadow-on-scroll ­­­*/
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-20 w-full border-b border-white/10
        bg-card/70 backdrop-blur-md ring-1 ring-inset ring-white/5
        transition-shadow ${scrolled ? "shadow-lg" : ""}`}
    >
      {/* wrapper — width clamps at lg but is full on mobile  */}
      <div
        className="
          mx-auto flex items-center gap-3
          px-3 py-2
          sm:px-4 sm:py-3
          max-w-full
          md:max-w-7xl
        "
      >
        {/* ─── Logo ────────────────────────────────────── */}
        <Link href="/" className="flex shrink-0 items-center gap-2 sm:gap-3">
          <motion.span
            whileHover={{ rotate: 180 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 220, damping: 15 }}
            className="text-primary"
          >
            {/* icon size scales down on very small screens */}
            <UtensilsCrossed className="h-6 w-6 xs:h-7 xs:w-7" />
          </motion.span>

          {/* hide word-mark on very narrow phones to save space */}
          <motion.span
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="
              hidden
              xs:inline-block
              bg-gradient-conic from-foreground via-primary to-secondary
              bg-[length:200%_200%] bg-clip-text
              text-2xl xs:text-3xl
              font-display font-bold text-transparent
              motion-safe:animate-gradient-x
            "
          >
            MealMate
          </motion.span>
        </Link>

        {/* ─── Search ─────────────────────────────────── */}
        {/*  flex-1 on ≥sm, collapses to an icon-only button on very small screens  */}
        <div className="ml-auto flex items-center gap-2 sm:ml-4 sm:flex-1">
          {/* show full search bar from ≥sm (640 px) */}
          <div className="hidden min-w-0 flex-1 sm:block">
            {/* min-w-0 lets it shrink instead of pushing layout */}
            <SearchField />
          </div>

          {/* tiny search icon link for < sm (optional) */}
          <Link
            href="/search"
            className="sm:hidden rounded-md p-1.5 text-muted-foreground hover:text-foreground"
          >
            <span className="sr-only">Search</span>
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-4.35-4.35M17.5 10.5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </Link>

          {/* ─── User ─────────────────────────────── */}
          <UserButton />
        </div>
      </div>
    </header>
  );
}
