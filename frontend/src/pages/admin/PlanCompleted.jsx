import { useState } from 'react';
import { CalendarX2, CalendarClock, UserCheck, Phone, MessageCircle } from 'lucide-react';
import { fetchRenewals } from '../../store/slices/gymSlice';
import PageTemplate from '../../components/common/PageTemplate';
import { useGym } from '../../hooks/useSiteData';

const d = (v) => (v ? new Date(v).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—');
const inr = (v) => (v != null ? `₹${Number(v).toLocaleString('en-IN')}` : '—');

const columns = (tab) => [
  {
    key: 'name', label: 'Member',
    render: (v, row) => (
      <div className="flex items-center gap-3">
        <div className="avatar w-10 h-10 text-sm from-orange-400 to-rose-500">{v?.[0]?.toUpperCase()}</div>
        <div>
          <p className="text-slate-900 font-semibold">{v}</p>
          <p className="text-slate-500 text-xs">{row.phone}</p>
        </div>
      </div>
    )
  },
  { key: 'plan', label: 'Plan', render: (v) => <span className="badge-info normal-case">{v}</span> },
  { key: 'trainer_name', label: 'Trainer', render: (v) => v || <span className="text-slate-400">—</span> },
  { key: 'last_paid', label: 'Last Paid', render: (v, row) => (v ? <div><p>{d(v)}</p><p className="text-xs text-slate-400">{inr(row.last_amount)}</p></div> : <span className="text-slate-400">No payment</span>) },
  { key: 'end_date', label: tab === 'expiring' ? 'Plan Ends' : 'Plan Ended', render: (v) => <span className="font-semibold text-slate-900">{d(v)}</span> },
  {
    key: 'days_since_end', label: tab === 'expiring' ? 'Ends In' : 'Overdue',
    render: (v) => {
      const n = Number(v);
      if (n < 0) return <span className="badge-warn normal-case">{-n} day{n === -1 ? '' : 's'}</span>;
      if (n === 0) return <span className="badge-warn normal-case">Today</span>;
      return <span className={n > 30 ? 'badge-danger normal-case' : 'badge-warn normal-case'}>{n} day{n === 1 ? '' : 's'}</span>;
    }
  },
  { key: 'status', label: 'Status', render: (v) => <span className={v === 'active' ? 'badge-success' : v === 'expired' ? 'badge-danger' : 'badge-neutral'}>{v}</span> },
];

const METRICS = [
  { label: 'Completed', sub: 'Plan Period Ended', icon: CalendarX2, color: 'rose', value: (s) => s.completed, percent: (s) => (s.total ? (s.completed / s.total) * 100 : 0) },
  { label: 'Expiring', sub: 'Within 7 Days', icon: CalendarClock, color: 'amber', value: (s) => s.expiring, percent: (s) => (s.total ? (s.expiring / s.total) * 100 : 0) },
  { label: 'Running', sub: 'Plans Still Active', icon: UserCheck, color: 'emerald', value: (s) => s.running, percent: (s) => (s.total ? (s.running / s.total) * 100 : 0) },
];

// Indian numbers without a country code get +91 for WhatsApp links
const waNumber = (phone) => {
  const digits = String(phone || '').replace(/\D/g, '');
  return digits.length === 10 ? `91${digits}` : digits;
};

export default function PlanCompleted() {
  const [tab, setTab] = useState('completed');
  const gym = useGym();

  const reminder = (row) => {
    const text = tab === 'expiring'
      ? `Hi ${row.name}, your ${row.plan} plan at ${gym.name} ends on ${d(row.end_date)}. Renew now to keep training without a break! Call ${gym.phone}.`
      : `Hi ${row.name}, your ${row.plan} plan at ${gym.name} ended on ${d(row.end_date)}. We miss you! Renew today and get back on track. Call ${gym.phone}.`;
    return `https://wa.me/${waNumber(row.phone)}?text=${encodeURIComponent(text)}`;
  };

  const tabs = (
    <div className="inline-flex rounded-xl bg-slate-100 p-1">
      {[['completed', 'Month completed'], ['expiring', 'Expiring in 7 days']].map(([k, l]) => (
        <button key={k} onClick={() => setTab(k)}
          className={`rounded-lg px-4 py-2 text-sm font-semibold transition-all ${tab === k ? 'bg-white text-blue-700 shadow' : 'text-slate-500 hover:text-slate-800'}`}>
          {l}
        </button>
      ))}
    </div>
  );

  return (
    <PageTemplate
      key={tab} // remount so paging/search reset and the new filter is fetched
      title="Plan Completed Members"
      subtitle="Members whose paid membership period has ended. Their plan end date is the due date of their latest paid fee"
      fetchAction={(p) => fetchRenewals({ ...p, filter: tab })}
      dataKey="renewals"
      columns={columns(tab)}
      topRight={tabs}
      rowActions={(row) => (
        <>
          <a href={reminder(row)} target="_blank" rel="noreferrer" title="Send WhatsApp reminder" aria-label={`WhatsApp ${row.name}`}
            className="icon-btn bg-gradient-to-br from-emerald-400 to-green-600 shadow-emerald-500/30">
            <MessageCircle className="w-4 h-4" />
          </a>
          <a href={`tel:${row.phone}`} title="Call" aria-label={`Call ${row.name}`} className="icon-btn-view">
            <Phone className="w-4 h-4" />
          </a>
        </>
      )}
      statsUrl="/memberships/stats"
      metrics={METRICS}
      icon={CalendarX2}
      listTitle={tab === 'expiring' ? 'Renewals coming up' : 'Month completed members'}
      listSubtitle="Send a WhatsApp reminder or call, then record the renewal on the Fees page"
    />
  );
}
