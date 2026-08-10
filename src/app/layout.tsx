import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import Providers from "@/app/providers";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const themeInitScript = `
(function() {
  try {
    var storageKey = 'ui-theme';
    var storedTheme = localStorage.getItem(storageKey);
    var supportsDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var resolvedTheme = storedTheme === 'dark' || storedTheme === 'light'
      ? storedTheme
      : supportsDark
        ? 'dark'
        : 'light';

    if (resolvedTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.dataset.theme = 'dark';
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.dataset.theme = 'light';
      document.documentElement.style.colorScheme = 'light';
    }
  } catch (error) {
    document.documentElement.classList.remove('dark');
  }
})();
`;

export const metadata: Metadata = {
  title: "Next UI Boilerplate",
  description: "Production-ready App Router UI template foundation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full bg-[var(--background)] font-sans text-[var(--foreground)] transition-colors duration-200">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
