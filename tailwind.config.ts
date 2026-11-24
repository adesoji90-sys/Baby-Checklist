import type { Config } from "tailwindcss";
const v = (n: string) => `rgb(var(--${n}) / <alpha-value>)`;
const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: { DEFAULT: v("cream"), 50: v("cream-50"), 100: v("cream-100"), 200: v("cream-200") },
        sand: { 100: v("sand-100"), 200: v("sand-200"), 300: v("sand-300"), 400: v("sand-400") },
        sage: { 50: v("sage-50"), 100: v("sage-100"), 200: v("sage-200"), 300: v("sage-300"), 400: v("sage-400"), 500: v("sage-500"), 600: v("sage-600"), 700: v("sage-700") },
        ink: { DEFAULT: v("ink"), soft: v("ink-soft"), mute: v("ink-mute") },
        clay: { 100: v("clay-100"), 400: v("clay-400"), 500: v("clay-500"), 600: v("clay-600") },
        surface: v("surface"),
        onprimary: v("onprimary"),
      },
      fontFamily: {
        serif: ['Lora', '"Iowan Old Style"', 'Palatino', 'Georgia', 'serif'],
        sans: ['"DM Sans"', 'ui-sans-serif', 'system-ui', '-apple-system', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      boxShadow: { soft: "0 1px 2px rgba(46,56,43,.04), 0 8px 24px -12px rgba(46,56,43,.12)" },
      keyframes: {
        rise: { from: { opacity: "0", transform: "translateY(8px)" }, to: { opacity: "1", transform: "none" } },
        fade: { from: { opacity: "0" }, to: { opacity: "1" } },
        sheet: { from: { transform: "translateY(24px)", opacity: "0" }, to: { transform: "none", opacity: "1" } },
      },
      animation: { rise: "rise .35s ease-out both", fade: "fade .2s ease-out both", sheet: "sheet .25s ease-out both" },
    },
  },
  plugins: [],
};
export default config;
