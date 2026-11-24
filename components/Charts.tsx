"use client";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useTheme } from "./ThemeProvider";
import type { CategoryStat } from "@/lib/calc";
import { compact, money } from "@/lib/format";

const PAL = {
  light: { series: ["#477B59", "#86B49A", "#F3CC63", "#5F9272", "#B3D3C0", "#D8A62A", "#355F45", "#CBD3C3", "#648F73", "#7D877F"], grid: "#E0E5DA", text: "#4D554E", track: "#ECEFE4", tipBg: "#FFFFFF", est: "#B3D3C0", main: "#477B59", warn: "#F3CC63" },
  dark: { series: ["#91BD9A", "#648F73", "#F3CC63", "#B5D8BE", "#7DAA89", "#E6BB4E", "#4F7560", "#3B5846", "#C4CDC3", "#93A097"], grid: "#405448", text: "#C4CDC3", track: "#2D4034", tipBg: "#293B30", est: "#4F7560", main: "#91BD9A", warn: "#F3CC63" },
};
const usePal = () => PAL[useTheme().theme];
const tip = (p: (typeof PAL)["light"]) => ({ contentStyle: { background: p.tipBg, border: `1px solid ${p.grid}`, borderRadius: 14, color: p.text, fontSize: 13 }, itemStyle: { color: p.text } });
const short = (s: string) => (s.length > 14 ? s.slice(0, 13) + "…" : s);

export function SpendDonut({ stats, currency }: { stats: CategoryStat[]; currency: string }) {
  const pal = usePal();
  const data = stats.filter((s) => s.actual > 0).map((s) => ({ name: s.category.name, value: s.actual }));
  if (!data.length) return <p className="py-10 text-center text-sm text-ink-soft">No spending recorded yet.</p>;
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius="55%" outerRadius="85%" paddingAngle={2}>
            {data.map((_, i) => <Cell key={i} fill={pal.series[i % pal.series.length]} />)}
          </Pie>
          <Tooltip {...tip(pal)} formatter={(v) => money(Number(v), currency)} />
          <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: 11, color: pal.text }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CompareBars({ stats, currency, mode }: { stats: CategoryStat[]; currency: string; mode: "est-actual" | "outstanding" }) {
  const pal = usePal();
  const data = stats.map((s) => ({ name: short(s.category.name), Estimated: s.estimated, Spent: s.actual, Outstanding: s.outstanding }));
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer>
        <BarChart data={data} margin={{ left: -10, right: 4, top: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={pal.grid} vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 10, fill: pal.text }} interval={0} angle={-35} textAnchor="end" height={70} />
          <YAxis tickFormatter={(v) => compact(v, currency)} tick={{ fontSize: 11, fill: pal.text }} width={60} />
          <Tooltip {...tip(pal)} cursor={{ fill: pal.track }} formatter={(v) => money(Number(v), currency)} />
          {mode === "est-actual" ? (<><Legend wrapperStyle={{ color: pal.text }} /><Bar dataKey="Estimated" fill={pal.est} radius={[4, 4, 0, 0]} /><Bar dataKey="Spent" fill={pal.main} radius={[4, 4, 0, 0]} /></>)
            : <Bar dataKey="Outstanding" fill={pal.warn} radius={[4, 4, 0, 0]} />}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CompletionDonut({ percent }: { percent: number }) {
  const pal = usePal();
  const data = [{ name: "Done", value: percent }, { name: "Left", value: 100 - percent }];
  return (
    <div className="relative mx-auto h-52 w-52">
      <ResponsiveContainer>
        <PieChart><Pie data={data} dataKey="value" innerRadius="72%" outerRadius="100%" startAngle={90} endAngle={-270} stroke="none"><Cell fill={pal.main} /><Cell fill={pal.track} /></Pie></PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center"><span className="font-serif text-4xl">{percent}%</span><span className="text-xs text-ink-soft">items complete</span></div>
    </div>
  );
}
