import "./globals.css";

import { SpeedInsights } from "@vercel/speed-insights/react"
import { Toaster } from "@/components/ui/toaster";
import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { Open_Sans } from "next/font/google";
import ReactQueryProvider from "./ReactQueryProvider";

// Font config
const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-open-sans",
});

// Metadata for SEO and templates
export const metadata: Metadata = {
  title: {
    template: "%s | mealmate",
    default: "mealmate",
  },
  description: "Share recipes and get inspired",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${openSans.variable} bg-background font-sans text-foreground`}>
        <ReactQueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </ReactQueryProvider>
        <Toaster />
        <SpeedInsights />
      </body>
    </html>
  );
}
