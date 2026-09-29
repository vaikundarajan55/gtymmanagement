import { useEffect, useState } from 'react';
import { CalendarCheck, Wallet, CircleAlert, Eye, X, Loader2 } from 'lucide-react';
import { fetchBookings } from '../../store/slices/gymSlice';
import PageTemplate from '../../components/common/PageTemplate';
import api from '../../services/api';

const inr = (v) => `₹${Number(v || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
const STATUS = { paid: 'badge-success', pending: 'badge-warn', failed: 'badge-danger', cancelled: 'badge-neutral', refunded: 'badge-violet' };
const METHOD = { upi: 'UPI', card: 'Card', netbanking: 'Net Banking', wallet: 'Wallet', emi: 'EMI', paylater: 'Pay Later', cardless_emi: 'Cardless EMI' };
const dt = (v) => (v ? new Date(v).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—');

const COLUMNS = [
  { key: 'booking_no', label: 'Booking #', render: (v) => <span className="font-mono text-xs font-bold text-slate-700">{v}</span> },
  {
    key: 'customer_name', label: 'Customer',
    render: (v, row) => (
      <div>
        <p className="text-slate-900 font-semibold">{v}</p>
        <p className="text-slate-500 text-xs">{row.customer_phone}</p>
      </div>
    )
  },
  {
    key: 'items_summary', label: 'Items',
    render: (v, row) => (
      <div className="max-w-[220px]">
        <p className="truncate text-slate-700" title={v}>{v || '—'}</p>
        <p className="text-xs text-slate-400">{row.items_qty} seat{row.items_qty === 1 ? '' : 's'} / plan</p>
      </div>
    )
  },
  { key: 'total', label: 'Total', render: (v) => <span className="font-bold text-slate-900">{inr(v)}</span> },
  { key: 'status', label: 'Status', render: (v) => <span className={STATUS[v] || 'badge-neutral'}>{v}</span> },
  {
    key: 'payment_method', label: 'Method',
    render: (v, row) => (
      <div className="flex flex-col items-start gap-1">
        {v ? <span className="badge-neutral normal-case">{METHOD[v] || v}</span> : '—'}
        {row.gateway === 'dummy' && <span className="badge-warn normal-case">Demo</span>}
      </div>
    )
  },
  { key: 'created_at', label: 'Booked', render: (v) => v ? <div className="whitespace-nowrap"><p>{new Date(v).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p><p className="text-xs text-slate-400">{new Date(v).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}</p></div> : '—' },
];

const FIELDS = [
  { name: 'status', label: 'Status', type: 'select', options: ['pending', 'paid', 'failed', 'cancelled', 'refunded'], required: true },
  { name: 'notes', label: 'Notes', type: 'textarea' },
];

const amt = (s, k) => s.byStatus?.[k]?.amount || 0;
const cnt = (s, k) => s.byStatus?.[k]?.count || 0;

const METRICS = [
  { label: 'Bookings', sub: 'Total Bookings', icon: CalendarCheck, color: 'blue', value: (s) => s.total },
  { label: 'Revenue', sub: 'Paid Online', icon: Wallet, color: 'emerald', value: (s) => amt(s, 'paid'), format: inr, percent: (s, pct) => pct(cnt(s, 'paid')) },
  { label: 'Unpaid', sub: 'Pending / Failed', icon: CircleAlert, color: 'amber', value: (s) => cnt(s, 'pending') + cnt(s, 'failed'), percent: (s, pct) => pct(cnt(s, 'pending') + cnt(s, 'failed')) },
];

function BookingDetail({ booking: b, onClose }) {
  const [items, setItems] = useState(null);
  useEffect(() => {
    api.get(`/bookings/${b.id}/items`).then(({ data }) => setItems(data)).catch(() => setItems([]));
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [b.id]);

  const info = [
    ['Customer', b.customer_name], ['Email', b.customer_email], ['Mobile', b.customer_phone],
    ['Status', <span key="s" className={STATUS[b.status]}>{b.status}</span>],
    ['Gateway', b.gateway === 'dummy' ? 'GymPay (demo)' : 'Razorpay'],
    ['Payment method', METHOD[b.payment_method] || b.payment_method || '—'],
    ['Payment ID', <span key="p" className="font-mono text-xs break-all">{b.razorpay_payment_id || '—'}</span>],
    ['Booked on', dt(b.created_at)], ['Paid on', dt(b.paid_at)],
    ...(b.failure_reason ? [['Failure reason', <span key="f" className="text-rose-600">{b.failure_reason}</span>]] : []),
    ...(b.notes ? [['Notes', b.notes]] : []),
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onMouseDown={onClose}>
      <div className="card card-accent w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-slide-up" onMouseDown={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Booking {b.booking_no}</h2>
            <p className="text-sm text-slate-500">{inr(b.total)} incl. GST</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Close"><X className="w-5 h-5" /></button>
        </div>

        <dl className="grid sm:grid-cols-2 gap-x-6 text-sm">
          {info.map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4 py-2 border-b border-slate-100">
              <dt className="text-slate-500">{k}</dt><dd className="font-semibold text-slate-800 text-right">{v}</dd>
            </div>
          ))}
        </dl>

        <h3 className="mt-6 mb-3 font-bold text-slate-900">Items</h3>
        <div className="overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-sm">
            <thead><tr className="th-gradient">
              {['Item', 'Session', 'Qty', 'Price', 'Amount'].map((h, i) => <th key={h} className={`th-cell ${i > 1 ? 'text-right' : ''}`}>{h}</th>)}
            </tr></thead>
            <tbody>
              {!items ? (
                <tr><td colSpan={5} className="py-8 text-center"><Loader2 className="w-6 h-6 animate-spin text-cyan-500 inline" /></td></tr>
              ) : items.map((it, i) => (
                <tr key={i} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-semibold text-slate-900">{it.title}</td>
                  <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                    {it.item_type === 'plan' ? <span className="badge-warn normal-case">Membership</span>
                      : `${new Date(`${it.session_date}T00:00:00`).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })} · ${it.time_slot}`}
                  </td>
                  <td className="px-4 py-3 text-right">{it.qty}</td>
                  <td className="px-4 py-3 text-right">{inr(it.unit_price)}</td>
                  <td className="px-4 py-3 text-right font-bold text-slate-900">{inr(it.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <dl className="mt-4 ml-auto max-w-xs text-sm space-y-1.5">
          <div className="flex justify-between"><dt className="text-slate-500">Subtotal</dt><dd className="font-semibold">{inr(b.subtotal)}</dd></div>
          <div className="flex justify-between"><dt className="text-slate-500">GST</dt><dd className="font-semibold">{inr(b.tax)}</dd></div>
          <div className="flex justify-between border-t border-slate-200 pt-2"><dt className="font-bold">Total</dt><dd className="font-bold text-lg">{inr(b.total)}</dd></div>
        </dl>
      </div>
    </div>
  );
}

export default function Bookings() {
  const [viewing, setViewing] = useState(null);
  return (
    <>
      <PageTemplate
        title="Class Bookings"
        subtitle="Online class bookings and membership purchases paid through Razorpay"
        fetchAction={fetchBookings}
        dataKey="bookings"
        columns={COLUMNS}
        resource="/bookings"
        fields={FIELDS}
        allowCreate={false}
        entityName="Booking"
        recordLabel={(r) => `Booking ${r.booking_no}`}
        rowActions={(row) => (
          <button onClick={() => setViewing(row)} title="View" aria-label="View booking" className="icon-btn-view"><Eye className="w-4 h-4" /></button>
        )}
        statsKey="bookings"
        metrics={METRICS}
        icon={CalendarCheck}
        listTitle="Booking register"
        listSubtitle="Search by booking number, customer, phone or status"
      />
      {viewing && <BookingDetail booking={viewing} onClose={() => setViewing(null)} />}
    </>
  );
}
