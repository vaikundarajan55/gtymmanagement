// Cart → Details → Payment → Done progress bar, shared by the checkout flow
export function Steps({ current }) {
  const steps = ['Cart', 'Details', 'Payment', 'Confirmed'];
  return (
    <ol className="flex items-center gap-2 sm:gap-4 overflow-x-auto">
      {steps.map((s, i) => {
        const n = i + 1;
        const done = n < current;
        const on = n === current;
        return (
          <li key={s} className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            <span className={`flex items-center gap-2 text-sm font-semibold ${on || done ? 'text-slate-900' : 'text-slate-400'}`}>
              <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                ${done ? 'bg-emerald-500 text-white' : on ? 'bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-md shadow-cyan-500/30' : 'bg-white border border-slate-300 text-slate-400'}`}>
                {done ? '✓' : n}
              </span>
              {s}
            </span>
            {n < steps.length && <span className={`w-6 sm:w-12 h-0.5 rounded-full ${done ? 'bg-emerald-400' : 'bg-slate-200'}`} />}
          </li>
        );
      })}
    </ol>
  );
}
