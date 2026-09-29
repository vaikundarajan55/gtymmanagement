import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Users, Dumbbell, Wallet, CircleAlert, ShoppingBag, PartyPopper, TrendingUp, ArrowRight,
  CalendarCheck, CalendarDays, GalleryHorizontal, CalendarX2, Building2, TrendingDown, Zap
} from 'lucide-react';
import { fetchDashboard } from '../../store/slices/gymSlice';
import MetricCard from '../../components/common/MetricCard';
import { DataTable } from '../../components/common/Table';
import api from '../../services/api';
import { DonutChart, LineChart, fullInr } from '../../components/common/Charts';

const STATUS = { active: 'badge-success', inactive: 'badge-neutral', expired: 'badge-danger' };

const RECENT_COLUMNS = [
  {
    key: 'name', label: 'Member',
    render: (v, row) => (
      <div className="flex items-center gap-3">
        <div className="avatar w-9 h-9 text-xs from-violet-500 to-blue-600">{v?.[0]?.toUpperCase()}</div>
        <div>
          <p className="text-slate-900 font-semibold">{v}</p>
          <p className="text-slate-500 text-xs">{row.email || row.phone}</p>
        </div>
      </div>
    )
  },
  { key: 'plan', label: 'Plan', render: (v) => <span className="badge-info normal-case">{v}</span> },
  { key: 'trainer_name', label: 'Trainer', render: (v) => v || <span className="text-slate-400">Unassigned</span> },
  { key: 'status', label: 'Status', render: (v) => <span className={STATUS[v] || 'badge-success'}>{v}</span> },
  { key: 'join_date', label: 'Joined', render: (v) => v ? new Date(v).toLocaleDateString('en-IN') : '—' },
];

const QUICK_LINKS = [
  { to: '/admin/users', label: 'Members', sub: 'Add / edit', icon: Users, tone: 'from-blue-500 to-blue-700' },
  { to: '/admin/fees', label: 'Fees', sub: 'Record payment', icon: Wallet, tone: 'from-emerald-500 to-emerald-700' },
  { to: '/admin/bookings', label: 'Bookings', sub: 'Online bookings', icon: CalendarCheck, tone: 'from-cyan-500 to-teal-600' },
  { to: '/admin/classes', label: 'Class Master', sub: 'Price & seats', icon: CalendarDays, tone: 'from-sky-500 to-blue-600' },
  { to: '/admin/plan-completed', label: 'Plan Completed', sub: 'Renewals due', icon: CalendarX2, tone: 'from-rose-400 to-red-600' },
  { to: '/admin/enquiries', label: 'Enquiries', sub: 'New leads', icon: TrendingUp, tone: 'from-violet-500 to-purple-700' },
  { to: '/admin/banners', label: 'Banners', sub: 'Home slides', icon: GalleryHorizontal, tone: 'from-fuchsia-500 to-pink-600' },
  { to: '/admin/gym-details', label: 'Gym Details', sub: 'Contact & About', icon: Building2, tone: 'from-orange-400 to-amber-700' },
];

const DAY_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#0ea5e9', '#2563eb'];
const SERIES = [
  { key: 'total', name: 'Total', color: '#0891b2' },
  { key: 'fees', name: 'Gym fees', color: '#2563eb' },
  { key: 'online', name: 'Online bookings', color: '#10b981' },
];

const dayLabel = (iso, today) => {
  if (iso === today) return 'Today';
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
};
const monthDate = (key) => new Date(`${key}-01T00:00:00`);

function ChartsSection({ charts }) {
  if (!charts) {
    return (
      <div className="grid 2xl:grid-cols-[minmax(0,1fr)_320px] gap-6">
        <div className="card h-[380px] animate-pulse bg-slate-50" />
        <div className="card h-[380px] animate-pulse bg-slate-50" />
      </div>
    );
  }
  const months = charts.monthly.map((m) => ({ ...m, total: m.fees + m.online }));
  const prev = months.at(-2)?.total || 0;
  const curr = months.at(-1)?.total || 0;
  const change = prev ? Math.round(((curr - prev) / prev) * 100) : null;
  const week = charts.daily.map((d, i) => ({
    label: dayLabel(d.date, charts.today),
    value: d.fees + d.online,
    color: DAY_COLORS[i],
    sub: d.payments ? `${d.payments} paid` : undefined,
  }));

  return (
    <div className="grid 2xl:grid-cols-[minmax(0,1fr)_320px] gap-6 items-start">
      <section className="card card-accent min-w-0">
        <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Monthly collections</h2>
            <p className="text-slate-500 text-sm mt-1">Gym fees and online bookings, last 12 months</p>
          </div>
          <div className="sm:text-right">
            <p className="text-2xl font-bold text-slate-900 font-[Space_Grotesk]">{fullInr(curr)}</p>
            <p className="text-xs font-semibold text-slate-500 inline-flex items-center gap-1">
              {change != null && (
                <span className={`inline-flex items-center gap-0.5 ${change >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {change >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}{Math.abs(change)}%
                </span>
              )}
              this month{change != null && ' vs last'}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-1 mb-2 text-xs font-semibold text-slate-600">
          {SERIES.map((s) => (
            <span key={s.key} className="inline-flex items-center gap-1.5"><span className="w-3 h-1 rounded-full" style={{ background: s.color }} />{s.name}</span>
          ))}
        </div>
        <LineChart
          labels={months.map((m) => monthDate(m.month).toLocaleDateString('en-IN', { month: 'short' }))}
          titles={months.map((m) => monthDate(m.month).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }))}
          series={SERIES.map((s) => ({ name: s.name, color: s.color, values: months.map((m) => m[s.key]) }))}
        />
      </section>

      <section className="card card-accent">
        <h2 className="text-xl font-bold text-slate-900">Day-wise collections</h2>
        <p className="text-slate-500 text-sm mt-1 mb-5">Last 7 days, fees + online bookings</p>
        <DonutChart data={week} centerLabel="7-day total" emptyText="No payments this week" className="sm:flex-row 2xl:flex-col" />
      </section>
    </div>
  );
}

export default function Dashboard() {
  const dispatch = useDispatch();
  const { dashboard } = useSelector((s) => s.gym);
  const [recent, setRecent] = useState([]);
  const [recentLoading, setRecentLoading] = useState(true);
  const [charts, setCharts] = useState(null);
  // Socket notifications (new paid booking, enquiry...) land in the ui slice: refresh the numbers when one arrives
  const liveEvents = useSelector((s) => s.ui.notifications.length);

  useEffect(() => {
    dispatch(fetchDashboard());
    api.get('/dashboard/charts').then(({ data }) => setCharts(data)).catch(() => setCharts({ today: '', daily: [], monthly: [] }));
  }, [liveEvents]);

  useEffect(() => {
    api.get('/users?page=1&limit=5')
      .then(({ data }) => setRecent(data.data || []))
      .catch(() => {})
      .finally(() => setRecentLoading(false));
  }, []);

  const d = dashboard || {};
  const inr = (v) => (v == null ? '—' : `₹${Number(v).toLocaleString('en-IN')}`);

  return (
    <div className="space-y-6 animate-fade-in">
      <section className="card">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
            <p className="text-slate-500 text-sm mt-1">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <Link to="/admin/users" className="btn-primary">Manage members <ArrowRight className="w-4 h-4" /></Link>
        </div>

        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-5 mt-6">
          <MetricCard label="Members" value={d.totalUsers} sub="Active Members" icon={Users} color="blue" />
          <MetricCard label="Trainers" value={d.totalTrainers} sub="Active Trainers" icon={Dumbbell} color="emerald" />
          <MetricCard label="Revenue" value={inr(d.revenue)} sub="Fees Paid This Month" icon={Wallet} color="violet" />
          <MetricCard label="Fees Due" value={d.feesDue} sub="Pending / Overdue" icon={CircleAlert} color="rose" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-5 mt-3 sm:mt-5 [&>*:nth-child(3)]:col-span-2 sm:[&>*:nth-child(3)]:col-span-1">
          <MetricCard label="Orders" value={d.totalOrders} sub="Placed This Month" icon={ShoppingBag} color="amber" />
          <MetricCard label="Birthdays" value={d.birthdaysToday} sub="Celebrating Today" icon={PartyPopper} color="cyan" />
          <MetricCard label="Enquiries" value={d.newEnquiries} sub="Last 7 Days" icon={TrendingUp} color="emerald" />
        </div>
      </section>

      {/* Main column (charts, recent members) with Quick access on the right */}
      <div className="grid lg:grid-cols-[minmax(0,1fr)_280px] gap-6 items-start">
        <div className="space-y-6 min-w-0">
          <ChartsSection charts={charts} />

          <section className="card card-accent">
            <div className="flex items-start justify-between mb-5 gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Recent members</h2>
                <p className="text-slate-500 text-sm mt-1">The five most recently added members</p>
              </div>
              <Link to="/admin/users" className="text-sm font-semibold text-cyan-600 hover:text-cyan-700 inline-flex items-center gap-1 whitespace-nowrap flex-shrink-0">
                View all <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <DataTable columns={RECENT_COLUMNS} data={recent} loading={recentLoading} serialStart={0} emptyMessage="No members yet" />
          </section>
        </div>

        {/* On phones/tablets Quick access comes first, as a compact grid */}
        <aside className="card card-accent order-first lg:order-none lg:sticky lg:top-0">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2"><Zap className="w-5 h-5 text-cyan-600" /> Quick access</h2>
          <p className="text-slate-500 text-sm mt-1 mb-5">Jump to a module</p>
          <nav className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-1 gap-2.5">
            {QUICK_LINKS.map(({ to, label, sub, icon: Icon, tone }) => (
              <Link key={to} to={to}
                className="flex flex-col lg:flex-row items-center gap-2 lg:gap-3 p-3 rounded-xl border border-slate-200 text-center lg:text-left hover:border-cyan-300 hover:bg-cyan-50/40 transition-colors group">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tone} flex items-center justify-center shadow-md flex-shrink-0`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <span className="min-w-0 w-full lg:flex-1">
                  <span className="block font-semibold text-slate-800 text-sm truncate">{label}</span>
                  <span className="hidden lg:block text-xs text-slate-500 truncate">{sub}</span>
                </span>
                <ArrowRight className="hidden lg:block w-4 h-4 text-slate-400 group-hover:text-cyan-600 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
              </Link>
            ))}
          </nav>
        </aside>
      </div>
    </div>
  );
}
