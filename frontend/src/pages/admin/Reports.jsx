import { useState, useEffect } from 'react';
import { Wallet, CircleAlert, Users, RotateCcw, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { DataTable, Pagination } from '../../components/common/Table';
import MetricCard from '../../components/common/MetricCard';

const inr = (v) => `₹${Number(v || 0).toLocaleString('en-IN')}`;
const d = (v) => (v ? new Date(`${v}T00:00:00`).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—');
const STATUS = { paid: 'badge-success', pending: 'badge-warn', overdue: 'badge-danger' };

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const THIS_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 8 }, (_, i) => THIS_YEAR - i);

const EMPTY = { from: '', to: '', month: '', year: '', trainer_id: '' };

const COLUMNS = [
  {
    key: 'member_name', label: 'Member',
    render: (v, row) => (
      <div className="flex items-center gap-3">
        <div className="avatar w-9 h-9 text-xs">{v?.[0]?.toUpperCase() || '?'}</div>
        <div>
          <p className="text-slate-900 font-semibold">{v || 'Deleted member'}</p>
          {row.member_phone && <p className="text-slate-500 text-xs">{row.member_phone}</p>}
        </div>
      </div>
    )
  },
  { key: 'trainer_name', label: 'Trainer', render: (v) => v || <span className="text-slate-400">Unassigned</span> },
  { key: 'plan', label: 'Plan', render: (v) => (v ? <span className="badge-info normal-case">{v}</span> : '—') },
  { key: 'amount', label: 'Amount', align: 'right', render: (v) => <span className="font-bold text-slate-900">{inr(v)}</span> },
  { key: 'paid_date', label: 'Paid On', render: d },
  { key: 'due_date', label: 'Due Date', render: d },
  { key: 'payment_mode', label: 'Mode', render: (v) => (v ? <span className="badge-neutral normal-case">{v}</span> : '—') },
  { key: 'status', label: 'Status', render: (v) => <span className={STATUS[v] || 'badge-warn'}>{v || 'pending'}</span> },
];

function Filter({ label, children }) {
  return (
    <label className="block">
      <span className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">{label}</span>
      {children}
    </label>
  );
}

export default function Reports() {
  const [filters, setFilters] = useState(EMPTY);
  const [trainers, setTrainers] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [result, setResult] = useState({ data: [], pagination: null, summary: null });
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0); // bumped by the Refresh button

  useEffect(() => {
    api.get('/options').then(({ data }) => setTrainers(data.trainers || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (filters.from && filters.to && filters.from > filters.to) return;
    let cancelled = false;
    setLoading(true);
    const params = Object.fromEntries(Object.entries({ ...filters, page, limit }).filter(([, v]) => v !== ''));
    api.get('/reports/fees', { params })
      .then(({ data }) => { if (!cancelled) setResult(data); })
      .catch((err) => { if (!cancelled) toast.error(err.response?.data?.message || 'Could not load report'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [filters, page, limit, tick]);

  const set = (key) => (e) => { setFilters((f) => ({ ...f, [key]: e.target.value })); setPage(1); };
  const changeLimit = (l) => { setLimit(l); setPage(1); };
  const reset = () => { setFilters(EMPTY); setPage(1); };

  const rangeInvalid = filters.from && filters.to && filters.from > filters.to;
  const active = Object.values(filters).some(Boolean);
  const { data, pagination, summary } = result;
  const serialStart = pagination && pagination.limit !== 'all' ? (pagination.page - 1) * pagination.limit : 0;
  const total = summary ? summary.collected + summary.outstanding : 0;
  const share = (n) => (total ? Math.round((n / total) * 100) : 0);

  return (
    <div className="space-y-6 animate-fade-in">
      <section className="card">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Admin Report</h1>
          <p className="text-slate-500 text-sm mt-1">
            Fee collections by member and trainer. Paid fees are dated by their payment date, unpaid fees by their due date
          </p>
        </div>

        <div className="grid gap-3 sm:gap-5 mt-6 grid-cols-2 md:grid-cols-3 [&>*:nth-child(3)]:col-span-2 md:[&>*:nth-child(3)]:col-span-1">
          <MetricCard label="Collected" sub="Paid Fees" icon={Wallet} color="emerald"
            value={summary ? inr(summary.collected) : '—'} percent={share(summary?.collected)} />
          <MetricCard label="Outstanding" sub="Pending & Overdue" icon={CircleAlert} color="rose"
            value={summary ? inr(summary.outstanding) : '—'} percent={share(summary?.outstanding)} />
          <MetricCard label="Members" sub={summary ? `${summary.records} Fee Records` : 'Fee Records'} icon={Users} color="blue"
            value={summary ? summary.members : '—'} percent={100} />
        </div>
      </section>

      <section className="card card-accent">
        <div className="flex items-start justify-between mb-5 flex-wrap gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Fee report</h2>
            <p className="text-slate-500 text-sm mt-1">Filter by date range, month, year or trainer. Filters combine</p>
          </div>
          <div className="flex items-center gap-3">
            {active && (
              <button onClick={reset} className="btn-secondary">
                <RotateCcw className="w-4 h-4" /> Reset
              </button>
            )}
            <button onClick={() => setTick((t) => t + 1)} title="Refresh" aria-label="Refresh"
              className="w-11 h-11 flex-shrink-0 inline-flex items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:text-cyan-600 hover:border-cyan-400 transition-colors">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid gap-4 grid-cols-2 lg:grid-cols-5 mb-5">
          <Filter label="From date">
            <input type="date" value={filters.from} max={filters.to || undefined} onChange={set('from')} className="input-field" />
          </Filter>
          <Filter label="To date">
            <input type="date" value={filters.to} min={filters.from || undefined} onChange={set('to')} className="input-field" />
          </Filter>
          <Filter label="Month">
            <select value={filters.month} onChange={set('month')} className="input-field">
              <option value="">All months</option>
              {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
            </select>
          </Filter>
          <Filter label="Year">
            <select value={filters.year} onChange={set('year')} className="input-field">
              <option value="">All years</option>
              {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </Filter>
          <div className="col-span-2 lg:col-span-1">
            <Filter label="Trainer">
              <select value={filters.trainer_id} onChange={set('trainer_id')} className="input-field">
                <option value="">All trainers</option>
                {trainers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                <option value="none">Unassigned</option>
              </select>
            </Filter>
          </div>
        </div>

        {rangeInvalid && <p className="mb-4 text-sm font-medium text-rose-600">From date must be on or before To date.</p>}

        <DataTable columns={COLUMNS} data={data} loading={loading} serialStart={serialStart}
          emptyMessage={active ? 'No fee records match these filters' : 'No fee records yet'} />
        <Pagination pagination={pagination} onPageChange={setPage} limit={limit} onLimitChange={changeLimit} />
      </section>
    </div>
  );
}
