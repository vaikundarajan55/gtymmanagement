import { CircleHelp, Sparkles, BadgeCheck } from 'lucide-react';
import { fetchEnquiries } from '../../store/slices/gymSlice';
import PageTemplate from '../../components/common/PageTemplate';

const STATUS = { new: 'badge-warn', contacted: 'badge-info', converted: 'badge-success', closed: 'badge-neutral' };

const COLUMNS = [
  {
    key: 'name', label: 'Name',
    render: (v, row) => (
      <div>
        <p className="text-slate-900 font-semibold">{v}</p>
        <p className="text-slate-500 text-xs">{row.email || '—'}</p>
      </div>
    )
  },
  { key: 'phone', label: 'Phone' },
  { key: 'interest', label: 'Interest', render: (v) => v ? <span className="badge-info normal-case">{v}</span> : '—' },
  { key: 'plan', label: 'Plan', render: (v) => v || '—' },
  { key: 'source', label: 'Source', render: (v) => <span className="badge-violet normal-case">{v || 'Website'}</span> },
  { key: 'status', label: 'Status', render: (v) => <span className={STATUS[v] || 'badge-warn'}>{v || 'new'}</span> },
  { key: 'created_at', label: 'Date', render: (v) => v ? new Date(v).toLocaleDateString('en-IN') : '—' },
];

const FIELDS = [
  { name: 'name', label: 'Name', required: true },
  { name: 'email', label: 'Email', type: 'email' },
  { name: 'phone', label: 'Phone', type: 'tel' },
  { name: 'interest', label: 'Interest' },
  { name: 'plan', label: 'Plan', type: 'select', options: ['Monthly', 'Quarterly', 'Half-Yearly', 'Yearly'] },
  { name: 'source', label: 'Source', type: 'select', options: ['Website', 'Walk-in', 'Phone', 'Instagram', 'Facebook', 'Referral'], default: 'Walk-in' },
  { name: 'status', label: 'Status', type: 'select', options: ['new', 'contacted', 'converted', 'closed'], default: 'new', required: true },
  { name: 'message', label: 'Message', type: 'textarea' },
];

const cnt = (s, k) => s.byStatus?.[k]?.count || 0;

const METRICS = [
  { label: 'Enquiries', sub: 'Total Leads', icon: CircleHelp, color: 'blue', value: (s) => s.total },
  { label: 'New', sub: 'Awaiting Follow-up', icon: Sparkles, color: 'amber', value: (s) => cnt(s, 'new'), percent: (s, pct) => pct(cnt(s, 'new')) },
  { label: 'Converted', sub: 'Joined the Gym', icon: BadgeCheck, color: 'emerald', value: (s) => cnt(s, 'converted'), percent: (s, pct) => pct(cnt(s, 'converted')) },
];

export default function Enquiries() {
  return (
    <PageTemplate
      title="Enquiries"
      subtitle="Summary of leads and membership enquiries"
      fetchAction={fetchEnquiries}
      dataKey="enquiries"
      columns={COLUMNS}
      resource="/enquiries"
      createPath="/enquiries/admin"
      fields={FIELDS}
      entityName="Enquiry"
      statsKey="enquiries"
      metrics={METRICS}
      icon={CircleHelp}
      listTitle="Lead pipeline"
      listSubtitle="Interests, sources and follow-up status"
    />
  );
}
