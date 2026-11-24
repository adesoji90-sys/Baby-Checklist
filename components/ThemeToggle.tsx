"use client";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export default function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggle } = useTheme();
  const dark = theme === "dark";
  return (
    <button type="button" onClick={toggle} role="switch" aria-checked={dark} aria-label={dark ? "Switch to light mode" : "Switch to dark mode"} title={dark ? "Light mode" : "Dark mode"}
      className={`relative inline-flex h-10 w-[72px] shrink-0 items-center rounded-full border border-sand-200 bg-sage-100 p-1 transition-colors hover:border-sage-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-400 ${className}`}>
      <Sun size={15} className={`absolute left-3 transition-opacity ${dark ? "text-ink-mute opacity-60" : "opacity-0"}`} aria-hidden />
      <Moon size={15} className={`absolute right-3 transition-opacity ${dark ? "opacity-0" : "text-ink-mute opacity-60"}`} aria-hidden />
      <span className={`flex h-8 w-8 items-center justify-center rounded-full bg-clay-400 text-[#26382E] shadow transition-transform duration-300 ease-out ${dark ? "translate-x-8" : "translate-x-0"}`}>
        {dark ? <Moon size={16} /> : <Sun size={16} />}
      </span>
    </button>
  );
}
