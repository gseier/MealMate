"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { UtensilsCrossed } from "lucide-react";

import SearchField from "@/components/SearchField";
import UserButton from "@/components/UserButton";

export default function Navbar() {
  /** add / remove shadow when the page scrolls */
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();               // run once on mount
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-20 w-full backdrop-blur-md transition-shadow ${
        scrolled ? "shadow-lg" : ""
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center gap-4 rounded-b-xl border-b border-white/10 bg-card/70 px-4 py-3 ring-1 ring-inset ring-white/5">
        {/* ─── Logo ─────────────────────────────────────────────── */}
        <Link href="/" className="flex items-center gap-3">
          <motion.span
            whileHover={{ rotate: 180 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 220, damping: 15 }}
            className="text-primary"
          >
            <UtensilsCrossed className="h-7 w-7" />
          </motion.span>

          {/* modern variable font + subtle gradient */}
          <motion.span
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-gradient-conic from-foreground via-primary to-secondary bg-[length:200%_200%] bg-clip-text text-3xl font-display font-bold text-transparent motion-safe:animate-gradient-x"
          >
            MealMate
          </motion.span>
        </Link>

        {/* ─── Search ───────────────────────────────────────────── */}
        <div className="ms-4 flex-1 min-w-[200px] max-w-md">
          <SearchField />
        </div>

        {/* ─── User ─────────────────────────────────────────────── */}
        <UserButton className="ms-2" />
      </div>
    </header>
  );
}
