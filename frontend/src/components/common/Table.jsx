import { ChevronLeft, ChevronRight, Search, Loader2, Inbox } from 'lucide-react';

export function SearchBar({ value, onChange, placeholder = 'Search...' }) {
  return (
    <div className="relative w-full sm:w-72">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="input-field pl-11 py-3"
      />
    </div>
  );
}

export const PAGE_SIZES = [10, 25, 50, 'all'];

export function Pagination({ pagination, onPageChange, limit, onLimitChange }) {
  if (!pagination) return null;
  const { page = 1, totalPages = 1, total = 0 } = pagination;
  const pages = Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
    if (totalPages <= 5) return i + 1;
    if (page <= 3) return i + 1;
    if (page >= totalPages - 2) return totalPages - 4 + i;
    return page - 2 + i;
  });

  const navBtn = 'w-9 h-9 inline-flex items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:border-cyan-400 hover:text-cyan-600 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-slate-200 disabled:hover:text-slate-500 transition-colors';

  return (
    <div className="flex items-center justify-between mt-5 px-1 flex-wrap gap-3">
      <div className="flex items-center gap-4 text-sm text-slate-500 flex-wrap">
        {onLimitChange && (
          <label className="flex items-center gap-2 font-medium">
            Show
            <select
              value={limit}
              onChange={(e) => onLimitChange(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl px-3 py-1.5 focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/15"
            >
              {PAGE_SIZES.map((s) => <option key={s} value={s}>{s === 'all' ? 'All' : s}</option>)}
            </select>
          </label>
        )}
        <span><b className="text-slate-800">{total}</b> records · Page {page} of {totalPages}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <button onClick={() => onPageChange(page - 1)} disabled={page <= 1} className={navBtn} aria-label="Previous page">
          <ChevronLeft className="w-4 h-4" />
        </button>
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all
              ${p === page
                ? 'bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-md shadow-cyan-500/30'
                : 'text-slate-600 hover:bg-slate-100'}`}
          >
            {p}
          </button>
        ))}
        <button onClick={() => onPageChange(page + 1)} disabled={page >= totalPages} className={navBtn} aria-label="Next page">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function TableState({ loading, emptyMessage }) {
  return loading ? (
    <div className="flex flex-col items-center gap-3 text-slate-400">
      <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
      <span className="text-sm">Loading records…</span>
    </div>
  ) : (
    <div className="flex flex-col items-center gap-3 text-slate-400">
      <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center"><Inbox className="w-7 h-7" /></div>
      <span className="text-sm">{emptyMessage}</span>
    </div>
  );
}

const cell = (col, row, i) => (col.render ? col.render(row[col.key], row, i) : row[col.key] ?? '—');

// Phones: each row becomes a card. The first column is the card title, the sticky
// (actions) column sits at the bottom and the rest are label/value pairs.
function RowCards({ columns, data, loading, emptyMessage, serialStart }) {
  const actions = columns.find((c) => c.sticky);
  const [primary, ...rest] = columns.filter((c) => !c.sticky);
  if (loading || !data.length) {
    return <div className="rounded-2xl border border-slate-200 bg-white py-14"><TableState loading={loading} emptyMessage={emptyMessage} /></div>;
  }
  return (
    <ul className="space-y-3">
      {data.map((row, i) => (
        <li key={row.id || i} className="rounded-2xl border border-slate-200 border-t-4 border-t-cyan-500 bg-white p-4 shadow-sm animate-fade-in">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1 text-slate-800">{primary && cell(primary, row, i)}</div>
            {serialStart != null && <span className="badge-neutral flex-shrink-0">#{String(serialStart + i + 1).padStart(2, '0')}</span>}
          </div>
          {rest.length > 0 && (
            <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              {rest.map((col) => (
                <div key={col.key} className={`min-w-0 ${col.wide ? 'col-span-2' : ''}`}>
                  {col.label && <dt className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{col.label}</dt>}
                  <dd className="mt-0.5 text-slate-700 break-words">{cell(col, row, i)}</dd>
                </div>
              ))}
            </dl>
          )}
          {actions && <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">{cell(actions, row, i)}</div>}
        </li>
      ))}
    </ul>
  );
}

// `serialStart` (0-based offset) adds a zero-padded S.NO column; columns may set align: 'right' | 'center',
// sticky: true to stay pinned to the right edge when the table scrolls sideways, and wide: true to take
// a full row in the phone card layout
export function DataTable({ columns, data, loading, emptyMessage = 'No records found', serialStart }) {
  const cols = serialStart != null
    ? [{ key: '__sno', label: 'S. No', render: (_, __, i) => <span className="font-bold text-slate-900">{String(serialStart + i + 1).padStart(2, '0')}</span> }, ...columns]
    : columns;
  const alignCls = (a) => (a === 'right' ? 'text-right' : a === 'center' ? 'text-center' : 'text-left');

  return (
    <>
      <div className="md:hidden">
        <RowCards columns={columns} data={data} loading={loading} emptyMessage={emptyMessage} serialStart={serialStart} />
      </div>
      <div className="hidden md:block overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="th-gradient">
              {cols.map((col) => (
                <th key={col.key} className={`th-cell ${alignCls(col.align)} ${col.sticky ? 'sticky right-0 bg-emerald-600' : ''}`}>{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white">
            {loading || data.length === 0 ? (
              <tr>
                <td colSpan={cols.length} className="py-16"><TableState loading={loading} emptyMessage={emptyMessage} /></td>
              </tr>
            ) : (
              data.map((row, i) => (
                <tr key={row.id || i} className="group border-t border-slate-100 hover:bg-cyan-50/40 transition-colors animate-fade-in">
                  {cols.map((col) => (
                    <td key={col.key} className={`px-4 py-4 text-slate-700 ${alignCls(col.align)} ${col.sticky ? 'sticky right-0 bg-white group-hover:bg-[#f3fbfd] shadow-[-8px_0_12px_-8px_rgba(15,23,42,0.12)]' : ''}`}>
                      {cell(col, row, i)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
