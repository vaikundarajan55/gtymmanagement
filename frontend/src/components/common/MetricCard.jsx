// Tinted stat card: big number, gradient icon tile, progress bar with an end dot
const THEMES = {
  blue:    { card: 'from-blue-50 border-blue-200 border-l-blue-600',          tile: 'from-blue-500 to-blue-700 shadow-blue-500/30',          text: 'text-blue-600',    bar: 'bg-blue-600' },
  emerald: { card: 'from-emerald-50 border-emerald-200 border-l-emerald-600', tile: 'from-emerald-500 to-emerald-700 shadow-emerald-500/30', text: 'text-emerald-600', bar: 'bg-emerald-600' },
  amber:   { card: 'from-orange-50 border-orange-200 border-l-orange-500',    tile: 'from-orange-400 to-amber-700 shadow-orange-500/30',     text: 'text-orange-600',  bar: 'bg-orange-500' },
  rose:    { card: 'from-rose-50 border-rose-200 border-l-rose-500',          tile: 'from-rose-400 to-red-600 shadow-rose-500/30',           text: 'text-rose-600',    bar: 'bg-rose-500' },
  violet:  { card: 'from-violet-50 border-violet-200 border-l-violet-600',    tile: 'from-violet-500 to-purple-700 shadow-violet-500/30',    text: 'text-violet-600',  bar: 'bg-violet-600' },
  cyan:    { card: 'from-cyan-50 border-cyan-200 border-l-cyan-600',          tile: 'from-cyan-400 to-teal-600 shadow-cyan-500/30',          text: 'text-cyan-700',    bar: 'bg-cyan-600' },
};

// size="sm" is a compact variant (customer dashboard): smaller padding, number and icon
const SIZES = {
  md: {
    card: 'p-4 sm:p-5', gap: 'gap-3 sm:gap-4', label: 'text-xs sm:text-sm', valueGap: 'mt-2',
    value: (len) => (len > 8 ? 'text-xl sm:text-2xl xl:text-3xl' : len > 5 ? 'text-2xl sm:text-3xl xl:text-4xl' : 'text-3xl sm:text-4xl xl:text-5xl'),
    tile: 'w-12 h-12 md:w-14 md:h-14 xl:w-16 xl:h-16 rounded-2xl', icon: 'w-6 h-6 md:w-7 md:h-7',
    sub: 'text-xs sm:text-sm mt-2 sm:mt-3', bar: 'mt-3 sm:mt-4',
  },
  sm: {
    card: 'p-3 sm:p-4', gap: 'gap-2 sm:gap-3', label: 'text-[11px] sm:text-xs', valueGap: 'mt-1.5',
    value: (len) => (len > 8 ? 'text-lg sm:text-xl' : len > 5 ? 'text-xl sm:text-2xl' : 'text-2xl sm:text-3xl'),
    tile: 'w-10 h-10 rounded-xl', icon: 'w-5 h-5',
    sub: 'text-[11px] sm:text-xs mt-1.5', bar: 'mt-2.5',
  },
};

export default function MetricCard({ label, value, sub, icon: Icon, color = 'blue', percent, size = 'md' }) {
  const t = THEMES[color] || THEMES.blue;
  const z = SIZES[size] || SIZES.md;
  const pct = Math.max(0, Math.min(100, percent ?? 100));
  // Long values (e.g. ₹1,23,450) step down a size so they fit beside the icon instead of truncating
  const len = String(value ?? '').length;
  return (
    <div className={`relative rounded-2xl border border-l-4 bg-gradient-to-br ${t.card} to-white ${z.card} shadow-sm min-w-0 hover:shadow-md transition-shadow animate-slide-up`}>
      <div className={`flex items-start justify-between ${z.gap}`}>
        <div className="min-w-0">
          <p className={`${z.label} font-bold uppercase tracking-wider text-slate-600 truncate`}>{label}</p>
          <p className={`${z.value(len)} font-bold text-slate-900 ${z.valueGap} font-[Space_Grotesk] leading-none truncate`}>{value ?? '—'}</p>
        </div>
        {Icon && (
          <div className={`hidden sm:flex ${z.tile} bg-gradient-to-br ${t.tile} shadow-lg items-center justify-center flex-shrink-0`}>
            <Icon className={`${z.icon} text-white`} />
          </div>
        )}
      </div>
      {sub && <p className={`${z.sub} font-semibold truncate ${t.text}`}>{sub}</p>}
      <div className={`relative ${z.bar} h-1.5 rounded-full bg-slate-200/70`}>
        <div className={`h-full rounded-full ${t.bar} transition-all duration-700`} style={{ width: `${pct}%` }} />
        <span className={`absolute -top-[5px] right-0 w-4 h-4 rounded-full ${t.bar} ring-4 ring-white shadow`} />
      </div>
    </div>
  );
}
