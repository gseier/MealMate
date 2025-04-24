"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { UtensilsCrossed } from "lucide-react";

import SearchField from "@/components/SearchField";
import UserButton from "@/components/UserButton";

export default function Navbar() {
  /* shadow on scroll */
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
      <div
        className="
          mx-auto flex items-center gap-3
          px-3 py-2
          sm:px-4 sm:py-3
          max-w-full
          md:max-w-7xl
        "
      >
        {/* ─── Logo ───────────────────────────────── */}
        <Link href="/" className="flex shrink-0 items-center gap-2 sm:gap-3">
          <motion.span
            whileHover={{ rotate: 180 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 220, damping: 15 }}
            className="text-primary"
          >
            <UtensilsCrossed className="h-6 w-6 xs:h-7 xs:w-7" />
          </motion.span>

          {/* hide text on ultra-narrow screens (<360 px) */}
          <motion.span
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="
              hidden
              [@media(min-width:360px)]:inline-block
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

        {/* ─── Search (always visible) ─────────────── */}
        {/* min-w-0 lets it shrink instead of forcing overflow */}
        <div className="mx-2 flex-1 min-w-0 max-w-md">
          <SearchField />
        </div>

        {/* ─── User button ─────────────────────────── */}
        <UserButton className="shrink-0" />
      </div>
    </header>
  );
}
