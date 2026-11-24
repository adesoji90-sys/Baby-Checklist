export function money(n: number, currency = "NGN"): string {
  try {
    return new Intl.NumberFormat("en-NG", { style: "currency", currency, maximumFractionDigits: 0, minimumFractionDigits: 0 }).format(n);
  } catch { return `${currency} ${Math.round(n).toLocaleString()}`; }
}
export const compact = (n: number, currency = "NGN") => {
  const sym = money(0, currency).replace(/[\d.,\s]/g, "");
  const a = Math.abs(n);
  const s = a >= 1e6 ? `${(a / 1e6).toFixed(a >= 1e7 ? 0 : 1)}M` : a >= 1e3 ? `${Math.round(a / 1e3)}k` : `${Math.round(a)}`;
  return `${n < 0 ? "-" : ""}${sym}${s}`;
};
export const fmtDate = (d: string | null) =>
  d ? new Date(d + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—";
export const todayISO = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
