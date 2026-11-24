/** Soft, hand-drawn style hills, tree, leaves and cloud. Colours come from theme tokens so it adapts to dark mode. */
export default function NatureArt({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 420 220" className={`overflow-visible ${className}`} aria-hidden="true" fill="none" preserveAspectRatio="xMaxYMax meet">
      <circle cx="318" cy="52" r="26" className="fill-clay-400" opacity=".9" />
      <path d="M60 70c0-12 10-20 22-20 3-10 16-14 25-8 10-3 20 4 20 14 10 1 16 8 14 16H70c-6-1-10-1-10-2z" className="fill-surface" opacity=".85" />
      <rect x="-700" y="190" width="700" height="60" className="fill-sage-200" />
      <rect x="-700" y="206" width="700" height="60" className="fill-sage-300" opacity=".75" />
      <rect x="-700" y="196" width="700" height="60" className="fill-sage-400" opacity=".65" />
      <path d="M0 190c40-38 90-52 140-40 50 12 70-14 130-22 60-8 110 12 150 34v58H0z" className="fill-sage-200" />
      <path d="M0 206c50-26 100-34 150-22 45 11 80 0 120-14 30-10 60-4 150 6v44H0z" className="fill-sage-300" opacity=".75" />
      <path d="M0 220v-24c50-18 110-14 160 6 40 16 70 18 110 6 60-18 110-6 150 10v2z" className="fill-sage-400" opacity=".65" />
      <rect x="300" y="128" width="7" height="46" rx="3" className="fill-sage-700" opacity=".7" />
      <circle cx="304" cy="112" r="26" className="fill-sage-500" />
      <circle cx="286" cy="128" r="17" className="fill-sage-400" />
      <circle cx="324" cy="126" r="18" className="fill-sage-600" opacity=".85" />
      <g className="fill-sage-500" opacity=".9"><path d="M120 170c0-18 12-30 26-34 2 18-6 32-26 34z" /><path d="M146 176c4-16 18-24 32-24-2 16-14 26-32 24z" className="fill-sage-600" /></g>
      <g stroke="currentColor" className="text-sage-700" strokeWidth="2" strokeLinecap="round" opacity=".5"><path d="M120 170c8-10 16-22 26-34" /><path d="M146 176c8-8 18-18 32-24" /></g>
      <g className="fill-clay-400"><circle cx="210" cy="176" r="4" /><circle cx="226" cy="182" r="3" /><circle cx="196" cy="184" r="3" /></g>
    </svg>
  );
}
