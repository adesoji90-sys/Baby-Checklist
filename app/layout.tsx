import type { Metadata, Viewport } from "next";
import "./globals.css";
import ThemeProvider, { themeInitScript } from "@/components/ThemeProvider";
export const metadata: Metadata = { title: "Our Baby Checklist", description: "A private baby shopping planner for our family.", robots: { index: false, follow: false } };
export const viewport: Viewport = { themeColor: [{ media: "(prefers-color-scheme: light)", color: "#F8F7F0" }, { media: "(prefers-color-scheme: dark)", color: "#17251E" }], width: "device-width", initialScale: 1 };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Lora:wght@400;500;600;700&display=swap" />
      </head>
      <body className="min-h-screen"><ThemeProvider>{children}</ThemeProvider></body>
    </html>
  );
}
