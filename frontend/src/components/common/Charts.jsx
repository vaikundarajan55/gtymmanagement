import { useEffect, useRef, useState } from 'react';

// Lightweight SVG charts (no chart library). Both include a legend/labels as text,
// so the numbers stay readable without hovering.

// ₹1,234 → "₹1.2K", ₹2,50,000 → "₹2.5L"
export const compactInr = (v) => {
  const n = Number(v || 0);
  if (n >= 1e7) return `₹${+(n / 1e7).toFixed(1)}Cr`;
  if (n >= 1e5) return `₹${+(n / 1e5).toFixed(1)}L`;
  if (n >= 1e3) return `₹${+(n / 1e3).toFixed(1)}K`;
  return `₹${Math.round(n)}`;
};
export const fullInr = (v) => `₹${Number(v || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

// ── Donut / pie ─────────────────────────────────────────────────────────────
// data: [{ label, value, color, sub? }]
// className sets the layout, e.g. 'sm:flex-row' to put the legend beside the ring on wide cards
export function DonutChart({ data, centerLabel = 'Total', format = fullInr, emptyText = 'No data yet', className = '' }) {
  const [hover, setHover] = useState(null);
  const total = data.reduce((n, d) => n + d.value, 0);
  const R = 80;
  const C = 2 * Math.PI * R;
  let offset = 0;
  const active = hover != null ? data[hover] : null;

  return (
    <div className={`flex flex-col items-center gap-6 ${className}`}>
      <div className="relative w-48 h-48 flex-shrink-0">
        <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90" role="img"
          aria-label={`${centerLabel}: ${format(total)}. ${data.map((d) => `${d.label} ${format(d.value)}`).join(', ')}`}>
          <circle cx="100" cy="100" r={R} fill="none" stroke="#eef2f7" strokeWidth="26" />
          {total > 0 && data.map((d, i) => {
            if (!d.value) return null;
            const len = (d.value / total) * C;
            // A small gap between segments, unless one segment fills the ring
            const gap = d.value === total ? 0 : Math.min(3, len / 3);
            const seg = (
              <circle key={d.label} cx="100" cy="100" r={R} fill="none" stroke={d.color}
                strokeWidth={hover === i ? 32 : 26}
                strokeDasharray={`${Math.max(0, len - gap)} ${C}`} strokeDashoffset={-offset}
                className="transition-[stroke-width] duration-200 cursor-pointer"
                onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} />
            );
            offset += len;
            return seg;
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-8">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 truncate max-w-full">{active ? active.label : centerLabel}</span>
          <span className="mt-1 text-xl font-bold text-slate-900 font-[Space_Grotesk]">{format(active ? active.value : total)}</span>
          {active && total > 0 && <span className="text-xs font-semibold text-slate-500">{Math.round((active.value / total) * 100)}%</span>}
          {!active && total === 0 && <span className="text-xs text-slate-400">{emptyText}</span>}
        </div>
      </div>

      <ul className="w-full min-w-0 grid grid-cols-1 gap-1.5 text-sm">
        {data.map((d, i) => (
          <li key={d.label}
            onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}
            className={`flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors ${hover === i ? 'bg-slate-100' : ''}`}>
            <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: d.color }} />
            <span className="font-medium text-slate-700 flex-1 truncate">{d.label}{d.sub && <span className="ml-1.5 text-xs text-slate-400">{d.sub}</span>}</span>
            <span className="font-semibold text-slate-900 tabular-nums">{format(d.value)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── Line chart ──────────────────────────────────────────────────────────────
// labels: ['Oct', ...]; series: [{ name, color, values: [..] }]; the first series gets a soft area fill
function useWidth() {
  const ref = useRef(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setWidth(Math.floor(e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, width];
}

// Round the max up to a "nice" step so gridlines land on readable values
const niceMax = (v) => {
  if (v <= 0) return 1000;
  const mag = 10 ** Math.floor(Math.log10(v));
  return [1, 2, 2.5, 5, 10].map((m) => m * mag).find((c) => c >= v * 1.1) ?? 10 * mag;
};

export function LineChart({ labels, series, height = 280, format = fullInr, axisFormat = compactInr, titles = labels }) {
  const [ref, width] = useWidth();
  const [hover, setHover] = useState(null);
  const pad = { top: 16, right: 16, bottom: 32, left: 56 };
  const w = Math.max(0, width - pad.left - pad.right);
  const h = height - pad.top - pad.bottom;
  const max = niceMax(Math.max(0, ...series.flatMap((s) => s.values)));
  const n = labels.length;
  const x = (i) => pad.left + (n > 1 ? (i / (n - 1)) * w : w / 2);
  const y = (v) => pad.top + h - (v / max) * h;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => t * max);
  const labelEvery = w < 420 ? 2 : 1;

  const path = (vals) => vals.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');

  const onMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - rect.left - pad.left;
    setHover(Math.max(0, Math.min(n - 1, Math.round((px / (w || 1)) * (n - 1)))));
  };

  const tipLeft = hover != null ? Math.min(Math.max(x(hover), 90), width - 90) : 0;

  return (
    <div ref={ref} className="relative w-full select-none" style={{ height }}>
      {width > 0 && (
        <svg width={width} height={height} className="overflow-visible touch-pan-y"
          onPointerMove={onMove} onPointerDown={onMove} onPointerLeave={() => setHover(null)}
          role="img" aria-label={series.map((s) => `${s.name}: ${s.values.map((v, i) => `${titles[i]} ${format(v)}`).join(', ')}`).join('. ')}>
          <defs>
            <linearGradient id="line-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={series[0]?.color} stopOpacity="0.22" />
              <stop offset="100%" stopColor={series[0]?.color} stopOpacity="0" />
            </linearGradient>
          </defs>

          {ticks.map((t) => (
            <g key={t}>
              <line x1={pad.left} x2={pad.left + w} y1={y(t)} y2={y(t)} stroke="#e2e8f0" strokeDasharray={t ? '4 4' : undefined} />
              <text x={pad.left - 10} y={y(t)} dy="0.32em" textAnchor="end" className="fill-slate-400 text-[11px]">{axisFormat(t)}</text>
            </g>
          ))}
          {labels.map((l, i) => (n - 1 - i) % labelEvery === 0 && ( // counted back from the latest point so it is always labelled
            <text key={i} x={x(i)} y={height - 8} textAnchor="middle" className={`text-[11px] ${hover === i ? 'fill-slate-900 font-semibold' : 'fill-slate-400'}`}>{l}</text>
          ))}

          {series[0] && <path d={`${path(series[0].values)} L${x(n - 1)},${y(0)} L${x(0)},${y(0)} Z`} fill="url(#line-area)" />}
          {series.map((s) => (
            <path key={s.name} d={path(s.values)} fill="none" stroke={s.color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
          ))}

          {hover != null && <line x1={x(hover)} x2={x(hover)} y1={pad.top} y2={pad.top + h} stroke="#94a3b8" strokeDasharray="3 3" />}
          {series.map((s) => s.values.map((v, i) => (
            <circle key={`${s.name}-${i}`} cx={x(i)} cy={y(v)} r={hover === i ? 5 : 3} fill="#fff" stroke={s.color} strokeWidth="2" />
          )))}
        </svg>
      )}

      {hover != null && (
        <div className="pointer-events-none absolute top-0 -translate-x-1/2 rounded-xl border border-slate-200 bg-white/95 px-3 py-2 shadow-lg text-xs min-w-[160px]"
          style={{ left: tipLeft }}>
          <p className="font-bold text-slate-900 mb-1">{titles[hover]}</p>
          {series.map((s) => (
            <p key={s.name} className="flex items-center gap-2 text-slate-600">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
              <span className="flex-1">{s.name}</span>
              <span className="font-semibold text-slate-900 tabular-nums">{format(s.values[hover])}</span>
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
