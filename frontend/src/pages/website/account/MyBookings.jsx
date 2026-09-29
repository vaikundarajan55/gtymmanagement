import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, FileText, CreditCard } from 'lucide-react';
import customerApi from '../../../services/customerApi';
import { DataTable } from '../../../components/common/Table';
import { inr } from '../../../hooks/useSiteData';
import { STATUS_BADGE } from '../../../data/booking';

const FILTERS = [['', 'All'], ['paid', 'Paid'], ['pending', 'Pending'], ['failed', 'Failed']];

export default function MyBookings() {
  const [status, setStatus] = useState('');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    customerApi.get('/customer/bookings', { params: status ? { status } : {} })
      .then(({ data }) => setRows(data)).catch(() => setRows([])).finally(() => setLoading(false));
  }, [status]);

  const columns = [
    { key: 'booking_no', label: 'Booking #', render: (v) => <Link to={`/account/bookings/${v}`} className="font-mono text-xs font-bold text-slate-800 hover:text-cyan-700">{v}</Link> },
    { key: 'items_summary', label: 'Items', render: (v) => <span className="block max-w-[240px] truncate" title={v}>{v}</span> },
    { key: 'next_session', label: 'Next Session', render: (v) => v ? new Date(v).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }) : <span className="text-slate-400">—</span> },
    { key: 'total', label: 'Total', render: (v) => <span className="font-bold text-slate-900">{inr(v)}</span> },
    { key: 'status', label: 'Status', render: (v) => <span className={STATUS_BADGE[v] || 'badge-neutral'}>{v}</span> },
    { key: 'created_at', label: 'Booked On', render: (v) => new Date(v).toLocaleDateString('en-IN', { dateStyle: 'medium' }) },
    {
      key: '__actions', label: 'Actions', align: 'right', sticky: true,
      render: (_, r) => (
        <div className="inline-flex gap-2">
          <Link to={`/account/bookings/${r.booking_no}`} className="icon-btn-view" title="View details" aria-label="View details"><Eye className="w-4 h-4" /></Link>
          {r.status === 'paid'
            ? <Link to={`/account/bookings/${r.booking_no}/invoice`} className="icon-btn-edit" title="Invoice" aria-label="Invoice"><FileText className="w-4 h-4" /></Link>
            : ['pending', 'failed'].includes(r.status) && <Link to={`/payment/${r.public_id}`} className="icon-btn bg-gradient-to-br from-orange-400 to-amber-600 shadow-orange-500/30" title="Pay now" aria-label="Pay now"><CreditCard className="w-4 h-4" /></Link>}
        </div>
      ),
    },
  ];

  return (
    <section className="card card-accent animate-fade-in">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My bookings</h1>
          <p className="text-slate-500 text-sm mt-1">View details, download invoices or finish a pending payment.</p>
        </div>
        <div className="inline-flex rounded-xl bg-slate-100 p-1">
          {FILTERS.map(([k, l]) => (
            <button key={k} onClick={() => setStatus(k)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all ${status === k ? 'bg-white text-blue-700 shadow' : 'text-slate-500 hover:text-slate-800'}`}>{l}</button>
          ))}
        </div>
      </div>
      <DataTable columns={columns} data={rows} loading={loading} serialStart={0}
        emptyMessage={status ? `No ${status} bookings` : 'No bookings yet. Book your first class!'} />
    </section>
  );
}
