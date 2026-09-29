import { CreditCard, Wallet, CircleAlert } from 'lucide-react';
import { fetchFees } from '../../store/slices/gymSlice';
import PageTemplate from '../../components/common/PageTemplate';

const inr = (v) => `₹${Number(v || 0).toLocaleString('en-IN')}`;
const STATUS = { paid: 'badge-success', pending: 'badge-warn', overdue: 'badge-danger' };

const COLUMNS = [
  {
    key: 'member_name', label: 'Member',
    render: (v) => (
      <div className="flex items-center gap-3">
        <div className="avatar w-9 h-9 text-xs">{v?.[0]?.toUpperCase()}</div>
        <span className="text-slate-900 font-semibold">{v}</span>
      </div>
    )
  },
  { key: 'plan', label: 'Plan', render: (v) => v ? <span className="badge-info normal-case">{v}</span> : '—' },
  { key: 'amount', label: 'Amount', render: (v) => <span className="font-bold text-slate-900">{inr(v)}</span> },
  { key: 'paid_date', label: 'Paid On', render: (v) => v ? new Date(v).toLocaleDateString('en-IN') : '—' },
  { key: 'due_date', label: 'Due Date', render: (v) => v ? new Date(v).toLocaleDateString('en-IN') : '—' },
  { key: 'status', label: 'Status', render: (v) => <span className={STATUS[v] || 'badge-warn'}>{v || 'pending'}</span> },
  { key: 'payment_mode', label: 'Mode', render: (v) => v ? <span className="badge-neutral normal-case">{v}</span> : '—' },
];

const FIELDS = [
  { name: 'member_id', label: 'Member', type: 'select', options: 'members', required: true },
  { name: 'plan', label: 'Plan', type: 'select', options: ['Monthly', 'Quarterly', 'Half-Yearly', 'Yearly'] },
  { name: 'amount', label: 'Amount (₹)', type: 'number', min: 0, step: '0.01', required: true },
  { name: 'status', label: 'Status', type: 'select', options: ['paid', 'pending', 'overdue'], default: 'pending', required: true },
  { name: 'paid_date', label: 'Paid On', type: 'date' },
  { name: 'due_date', label: 'Due Date', type: 'date' },
  { name: 'payment_mode', label: 'Payment Mode', type: 'select', options: ['Cash', 'UPI', 'Card', 'NetBanking'], default: 'Cash', required: true },
  { name: 'receipt_no', label: 'Receipt No.' },
];

const amt = (s, k) => s.byStatus?.[k]?.amount || 0;
const cnt = (s, k) => s.byStatus?.[k]?.count || 0;
const share = (s, n) => (s.amount ? Math.round((n / s.amount) * 100) : 0);

const METRICS = [
  { label: 'Collected', sub: 'Total Paid', icon: Wallet, color: 'emerald', value: (s) => amt(s, 'paid'), format: inr, percent: (s) => share(s, amt(s, 'paid')) },
  { label: 'Pending', sub: 'Awaiting Payment', icon: CreditCard, color: 'blue', value: (s) => amt(s, 'pending'), format: inr, percent: (s) => share(s, amt(s, 'pending')) },
  { label: 'Overdue', sub: 'Fee Records Overdue', icon: CircleAlert, color: 'rose', value: (s) => cnt(s, 'overdue'), percent: (s, pct) => pct(cnt(s, 'overdue')) },
];

export default function Fees() {
  return (
    <PageTemplate
      title="Fee Records"
      subtitle="Summary of member fee payments, dues and collections"
      fetchAction={fetchFees}
      dataKey="fees"
      columns={COLUMNS}
      resource="/fees"
      fields={FIELDS}
      entityName="Fee"
      recordLabel={(r) => `${r.member_name} – ${inr(r.amount)}`}
      statsKey="fees"
      metrics={METRICS}
      icon={CreditCard}
      listTitle="Fee ledger"
      listSubtitle="Payments, due dates and payment modes"
    />
  );
}
