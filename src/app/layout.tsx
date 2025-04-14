import { Toaster } from "@/components/ui/toaster";
import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import ReactQueryProvider from "./ReactQueryProvider";
import { Open_Sans } from 'next/font/google';


const openSans = Open_Sans({
  subsets: ['latin'],
  weight: ['400', '600', '700'], // Include weights as needed
  variable: '--font-open-sans',
});

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
    <html lang="en">
      <body className={`${openSans.variable}`}>
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
      </body>
    </html>
  );
}
