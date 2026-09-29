import { CalendarDays, Clock, Users, Crown, CircleAlert } from 'lucide-react';
import { inr } from '../../hooks/useSiteData';

export function PaymentsOffNotice() {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
      <CircleAlert className="w-5 h-5 flex-shrink-0 mt-0.5" />
      <p>Online payment isn't switched on yet. You can still add items to your cart; checkout will open as soon as payments are enabled.</p>
    </div>
  );
}

export const fmtDate = (d) =>
  d ? new Date(`${d}T00:00:00`).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : '';

// Normalises cart items (camelCase) and booking items (snake_case) into one shape
const norm = (i) => ({
  title: i.title || i.name,
  type: i.item_type || i.type,
  date: i.session_date || i.date,
  time: i.time_slot || i.time,
  qty: Number(i.qty || 1),
  amount: i.amount != null ? Number(i.amount) : Number(i.price) * Number(i.qty || 1),
});

export function ItemMeta({ item }) {
  const i = norm(item);
  if (i.type === 'plan') {
    return <p className="flex items-center gap-1.5 text-xs text-slate-500"><Crown className="w-3.5 h-3.5 text-amber-500" /> Membership plan</p>;
  }
  return (
    <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
      <span className="flex items-center gap-1"><CalendarDays className="w-3.5 h-3.5 text-cyan-600" />{fmtDate(i.date)}</span>
      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-cyan-600" />{i.time}</span>
      <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5 text-cyan-600" />{i.qty} {i.qty > 1 ? 'people' : 'person'}</span>
    </p>
  );
}

// Pass either cart items + gstRate (totals computed for display) or explicit server totals
export default function OrderSummary({ items, gstRate = 0.18, totals, title = 'Order summary', children, compact }) {
  const lines = items.map(norm);
  const subtotal = totals ? Number(totals.subtotal) : lines.reduce((n, l) => n + l.amount, 0);
  const tax = totals ? Number(totals.tax) : Math.round(subtotal * gstRate * 100) / 100;
  const total = totals ? Number(totals.total) : subtotal + tax;

  return (
    <div className="card card-accent p-6">
      <h2 className="text-lg font-bold text-slate-900">{title}</h2>
      {!compact && (
        <ul className="mt-4 divide-y divide-slate-100">
          {items.map((it, idx) => {
            const l = lines[idx];
            return (
              <li key={it.key || idx} className="py-3 flex justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-semibold text-slate-800 truncate">{l.title}</p>
                  <ItemMeta item={it} />
                </div>
                <span className="font-semibold text-slate-900 whitespace-nowrap">{inr(l.amount)}</span>
              </li>
            );
          })}
        </ul>
      )}
      <dl className="mt-4 space-y-2 text-sm border-t border-slate-100 pt-4">
        <div className="flex justify-between"><dt className="text-slate-500">Subtotal</dt><dd className="font-semibold text-slate-800">{inr(subtotal)}</dd></div>
        <div className="flex justify-between"><dt className="text-slate-500">GST ({Math.round(gstRate * 100)}%)</dt><dd className="font-semibold text-slate-800">{inr(tax)}</dd></div>
        <div className="flex justify-between items-baseline pt-3 border-t border-dashed border-slate-200">
          <dt className="font-bold text-slate-900">Total</dt>
          <dd className="text-2xl font-bold text-gradient font-[Space_Grotesk]">{inr(total)}</dd>
        </div>
      </dl>
      {children}
    </div>
  );
}
