"use client";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";
const KEY = "theme";
const Ctx = createContext<{ theme: Theme; toggle: () => void }>({ theme: "light", toggle: () => {} });
export const useTheme = () => useContext(Ctx);

/** Runs before first paint (see layout.tsx) so there is no flash of the wrong theme. */
export const themeInitScript = `(function(){try{var t=localStorage.getItem('${KEY}');if(t!=='light'&&t!=='dark'){t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}document.documentElement.classList.toggle('dark',t==='dark');document.documentElement.style.colorScheme=t}catch(e){}})()`;

function apply(t: Theme, animate: boolean) {
  const el = document.documentElement;
  if (animate) { el.classList.add("theme-anim"); setTimeout(() => el.classList.remove("theme-anim"), 450); }
  el.classList.toggle("dark", t === "dark");
  el.style.colorScheme = t;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", t === "dark" ? "#17251E" : "#F8F7F0");
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    setTheme(document.documentElement.classList.contains("dark") ? "dark" : "light");
    // Follow the operating system only while the user has not made a manual choice.
    const mq = matchMedia("(prefers-color-scheme: dark)");
    const onSys = (e: MediaQueryListEvent) => {
      let manual: string | null = null; try { manual = localStorage.getItem(KEY); } catch { /* storage blocked */ }
      if (manual !== "light" && manual !== "dark") { const t = e.matches ? "dark" : "light"; apply(t, true); setTheme(t); }
    };
    // Keep multiple tabs in sync.
    const onStore = (e: StorageEvent) => { if (e.key === KEY && (e.newValue === "light" || e.newValue === "dark")) { apply(e.newValue, true); setTheme(e.newValue); } };
    mq.addEventListener("change", onSys); window.addEventListener("storage", onStore);
    return () => { mq.removeEventListener("change", onSys); window.removeEventListener("storage", onStore); };
  }, []);

  const toggle = useCallback(() => {
    const next: Theme = document.documentElement.classList.contains("dark") ? "light" : "dark";
    try { localStorage.setItem(KEY, next); } catch { /* storage blocked: still switch for this visit */ }
    apply(next, true); setTheme(next);
  }, []);

  return <Ctx.Provider value={{ theme, toggle }}>{children}</Ctx.Provider>;
}
